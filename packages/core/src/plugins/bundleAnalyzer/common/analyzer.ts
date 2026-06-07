import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { promisify } from 'node:util'
import type { ModuleStats, ChunkStats, FileTypeDistribution, SizeWarning, BundleAnalysisResult } from '../types'
import { scanDirectory } from '@/common/fs'
import type { ScannedFile } from '@/common/fs'
import { normalizePath } from '@/common/path'

const gzip = promisify(zlib.gzip)

/**
 * 计算文件的 Gzip 压缩大小
 */
async function calculateGzipSize(content: string | Buffer): Promise<number> {
	const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8')
	const compressed = await gzip(buffer)
	return compressed.length
}

/**
 * 判断模块 ID 是否来自 node_modules
 */
function isNodeModule(moduleId: string): boolean {
	return moduleId.includes('node_modules') || moduleId.startsWith('\0') || moduleId.startsWith('virtual:')
}

/**
 * 扫描构建输出目录，收集所有文件信息
 *
 * @async
 * @param {string} outDir - 构建输出目录路径
 * @param {object} options - 扫描选项
 * @param {string[]} [options.includeExtensions] - 包含的文件扩展名
 * @param {string[]} [options.excludePatterns] - 排除的路径模式
 * @returns {Promise<ScannedFile[]>} 文件信息列表
 *
 * @description 递归扫描构建输出目录，收集每个文件的大小和扩展名信息，
 * 支持按扩展名和路径模式进行过滤。
 * 内部委托给 common/fs 的通用 scanDirectory 函数。
 */
export async function scanOutputDirectory(outDir: string, options: { includeExtensions?: string[]; excludePatterns?: string[] } = {}): Promise<ScannedFile[]> {
	return scanDirectory(outDir, {
		includeExtensions: options.includeExtensions,
		excludePatterns: options.excludePatterns
	})
}

/**
 * 分析构建产物的文件类型分布
 *
 * @param {ScannedFile[]} files - 文件列表
 * @returns {FileTypeDistribution[]} 文件类型分布统计
 *
 * @description 按文件扩展名分组统计文件数量、总大小和占比，
 * 结果按总大小降序排列。
 *
 * @example
 * ```typescript
 * const distribution = analyzeFileTypeDistribution(files)
 * // [ { extension: '.js', count: 5, totalSize: 102400, percentage: 65.3 }, ... ]
 * ```
 */
export function analyzeFileTypeDistribution(files: ScannedFile[]): FileTypeDistribution[] {
	const totalSize = files.reduce((sum, f) => sum + f.size, 0)
	const map = new Map<string, { count: number; totalSize: number }>()

	for (const file of files) {
		const ext = file.extension || '(no ext)'
		const existing = map.get(ext) || { count: 0, totalSize: 0 }
		existing.count++
		existing.totalSize += file.size
		map.set(ext, existing)
	}

	return Array.from(map.entries())
		.map(([extension, { count, totalSize: size }]) => ({
			extension,
			count,
			totalSize: size,
			percentage: totalSize > 0 ? Number(((size / totalSize) * 100).toFixed(1)) : 0
		}))
		.sort((a, b) => b.totalSize - a.totalSize)
}

/**
 * 检查 chunk 和模块是否超过体积阈值
 *
 * @param {ChunkStats[]} chunks - chunk 统计列表
 * @param {number} thresholdKB - 体积阈值（KB）
 * @returns {SizeWarning[]} 告警列表
 *
 * @description 遍历所有 chunk 和模块，检查是否超过配置的体积阈值，
 * 超过则生成告警信息。
 */
export function checkSizeThresholds(chunks: ChunkStats[], thresholdKB: number): SizeWarning[] {
	const warnings: SizeWarning[] = []
	const thresholdBytes = thresholdKB * 1024

	for (const chunk of chunks) {
		if (chunk.size > thresholdBytes) {
			warnings.push({
				level: 'chunk',
				name: chunk.name,
				sizeKB: Number((chunk.size / 1024).toFixed(1)),
				thresholdKB,
				message: `Chunk "${chunk.name}" 超过阈值: ${(chunk.size / 1024).toFixed(1)}KB > ${thresholdKB}KB`
			})
		}

		for (const mod of chunk.modules) {
			if (mod.size > thresholdBytes) {
				warnings.push({
					level: 'module',
					name: mod.id,
					sizeKB: Number((mod.size / 1024).toFixed(1)),
					thresholdKB,
					message: `模块 "${mod.id}" 超过阈值: ${(mod.size / 1024).toFixed(1)}KB > ${thresholdKB}KB`
				})
			}
		}
	}

	return warnings
}

/**
 * 获取 Top N 大模块
 *
 * @param {ChunkStats[]} chunks - chunk 统计列表
 * @param {number} topN - 排行数量
 * @param {boolean} excludeNodeModules - 是否排除 node_modules 中的模块
 * @returns {ModuleStats[]} Top N 大模块列表
 *
 * @description 从所有 chunk 中提取模块，按体积降序排列，
 * 返回前 N 个最大的模块。
 */
export function getTopModules(chunks: ChunkStats[], topN: number, excludeNodeModules: boolean): ModuleStats[] {
	const allModules: ModuleStats[] = []

	for (const chunk of chunks) {
		for (const mod of chunk.modules) {
			if (excludeNodeModules && mod.isNodeModule) continue
			allModules.push(mod)
		}
	}

	return allModules.sort((a, b) => b.size - a.size).slice(0, topN)
}

/**
 * 构建 chunk 统计数据
 *
 * @async
 * @param {string} outDir - 构建输出目录
 * @param {ScannedFile[]} files - 文件列表
 * @param {object} options - 构建选项
 * @param {boolean} [options.gzipSize] - 是否计算 gzip 大小
 * @param {boolean} [options.excludeNodeModules] - 是否排除 node_modules
 * @returns {Promise<ChunkStats[]>} chunk 统计列表
 *
 * @description 根据文件列表构建 chunk 统计数据，
 * 每个文件作为一个 chunk 进行统计，计算原始大小和可选的 gzip 大小。
 */
export async function buildChunkStats(outDir: string, files: ScannedFile[], options: { gzipSize?: boolean; excludeNodeModules?: boolean } = {}): Promise<ChunkStats[]> {
	const { gzipSize = true, excludeNodeModules = false } = options
	const chunks: ChunkStats[] = []

	for (const file of files) {
		const relativePath = path.relative(outDir, file.filePath)
		const name = normalizePath(relativePath)
		const ext = file.extension

		let chunkType: ChunkStats['type'] = 'chunk'
		if (ext === '.html') {
			chunkType = 'entry'
		} else if (!['.js', '.mjs', '.cjs', '.css', '.html'].includes(ext)) {
			chunkType = 'asset'
		}

		let gzipSizeValue = 0
		if (gzipSize) {
			try {
				const content = await fs.promises.readFile(file.filePath)
				gzipSizeValue = await calculateGzipSize(content)
			} catch {
				gzipSizeValue = 0
			}
		}

		const isNodeMod = isNodeModule(relativePath)

		const moduleStat: ModuleStats = {
			id: name,
			size: file.size,
			gzipSize: gzipSizeValue,
			chunks: [name],
			imports: [],
			isEntry: chunkType === 'entry',
			isNodeModule: isNodeMod
		}

		if (excludeNodeModules && isNodeMod) continue

		chunks.push({
			name,
			size: file.size,
			gzipSize: gzipSizeValue,
			modules: [moduleStat],
			type: chunkType,
			fileCount: 1
		})
	}

	return chunks.sort((a, b) => b.size - a.size)
}

/**
 * 构建完整的分析结果
 *
 * @async
 * @param {string} outDir - 构建输出目录
 * @param {Required<import('../types').BundleAnalyzerOptions>} options - 插件配置
 * @returns {Promise<BundleAnalysisResult>} 完整的分析结果
 *
 * @description 执行完整的构建产物分析流程：
 * 1. 扫描输出目录收集文件信息
 * 2. 构建 chunk 统计数据
 * 3. 分析文件类型分布
 * 4. 计算 Top N 大模块
 * 5. 检查体积阈值告警
 * 6. 汇总生成分析结果
 */
export async function analyzeBundle(outDir: string, options: Required<import('../types').BundleAnalyzerOptions>): Promise<BundleAnalysisResult> {
	const startTime = Date.now()

	const files = await scanOutputDirectory(outDir, {
		includeExtensions: options.includeExtensions,
		excludePatterns: options.excludePatterns
	})

	const chunks = await buildChunkStats(outDir, files, {
		gzipSize: options.gzipSize,
		excludeNodeModules: options.excludeNodeModules
	})

	const filteredFiles = options.excludeNodeModules ? files.filter(f => !isNodeModule(path.relative(outDir, f.filePath))) : files

	const fileTypeDistribution = analyzeFileTypeDistribution(filteredFiles)
	const topModules = getTopModules(chunks, options.topModules, options.excludeNodeModules)
	const warnings = checkSizeThresholds(chunks, options.sizeThreshold)

	const totalSize = chunks.reduce((sum, c) => sum + c.size, 0)
	const totalGzipSize = chunks.reduce((sum, c) => sum + c.gzipSize, 0)

	const analysisTime = Date.now() - startTime

	return {
		timestamp: new Date().toISOString(),
		totalSize,
		totalGzipSize,
		chunks,
		topModules,
		fileTypeDistribution,
		warnings,
		comparisonDiffs: [],
		analysisTime
	}
}
