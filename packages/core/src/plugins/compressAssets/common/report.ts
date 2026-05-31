import path from 'node:path'
import { promises as fsp } from 'node:fs'
import type { CompressStats, CompressSummary } from '../types'
import { writeFileContent } from '@/common/fs'

/**
 * 根据压缩统计数据构建汇总信息
 *
 * @param {CompressStats[]} stats - 所有文件的压缩统计列表
 * @param {number} executionTime - 压缩操作总耗时（毫秒）
 * @returns {CompressSummary} 压缩汇总统计信息
 *
 * @description 汇总所有文件的原始大小、压缩后大小、压缩率等数据，
 * 并分别统计 gzip 和 brotli 的文件数量。
 *
 * @example
 * ```typescript
 * const summary = buildSummary(allStats, 1234)
 * console.log(`总压缩率: ${summary.totalRatio}%`)
 * ```
 */
export function buildSummary(stats: CompressStats[], executionTime: number): CompressSummary {
	const totalOriginalSize = stats.reduce((sum, s) => sum + s.originalSize, 0)
	const totalCompressedSize = stats.reduce((sum, s) => sum + s.compressedSize, 0)
	const totalRatio = totalOriginalSize > 0 ? Number(((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)) : 0

	return {
		totalFiles: stats.length,
		totalOriginalSize,
		totalCompressedSize,
		totalRatio,
		gzipFiles: stats.filter(s => s.algorithm === 'gzip').length,
		brotliFiles: stats.filter(s => s.algorithm === 'brotli').length,
		executionTime,
		stats
	}
}

/**
 * 将字节数格式化为人类可读的文件大小字符串
 *
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小字符串
 *
 * @description 转换规则：
 * - 小于 1KB：显示为 `xB`（如 `512B`）
 * - 小于 1MB：显示为 `x.xKB`（如 `1.5KB`）
 * - 大于等于 1MB：显示为 `x.xxMB`（如 `2.35MB`）
 *
 * @example
 * ```typescript
 * formatFileSize(512)    // '512B'
 * formatFileSize(1536)   // '1.5KB'
 * formatFileSize(2461726) // '2.35MB'
 * ```
 */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes}B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
	return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

/**
 * 将压缩报告写入 JSON 文件
 *
 * @async
 * @param {string} outDir - 构建输出目录路径
 * @param {string | false} reportPath - 报告文件路径，为 false 时不生成报告
 * @param {CompressSummary} summary - 压缩汇总统计信息
 * @returns {Promise<void>}
 *
 * @description 生成包含时间戳、总体统计和逐文件详情的 JSON 报告。
 * 当 `reportPath` 为相对路径时，将相对于 `outDir` 解析；
 * 为绝对路径时直接使用；为 false 时跳过报告生成。
 *
 * @example
 * ```typescript
 * await writeReport('dist', 'compress-report.json', summary)
 * // 生成 dist/compress-report.json
 * ```
 */
export async function writeReport(outDir: string, reportPath: string | false, summary: CompressSummary): Promise<void> {
	if (!reportPath) return

	const outputPath = path.isAbsolute(reportPath) ? reportPath : path.join(outDir, reportPath)
	const report = {
		timestamp: new Date().toISOString(),
		summary: {
			totalFiles: summary.totalFiles,
			totalOriginalSize: summary.totalOriginalSize,
			totalCompressedSize: summary.totalCompressedSize,
			totalRatio: summary.totalRatio,
			gzipFiles: summary.gzipFiles,
			brotliFiles: summary.brotliFiles,
			executionTime: summary.executionTime
		},
		files: summary.stats.map(s => ({
			file: s.file,
			originalSize: s.originalSize,
			compressedSize: s.compressedSize,
			ratio: s.ratio,
			algorithm: s.algorithm
		}))
	}

	await writeFileContent(outputPath, JSON.stringify(report, null, 2))
}

/**
 * 删除压缩统计中记录的原始文件
 *
 * @async
 * @param {CompressStats[]} stats - 压缩统计列表
 * @returns {Promise<void>}
 *
 * @description 根据压缩统计中的文件路径删除原始文件。
 * 当 `algorithm === 'both'` 时，同一文件可能对应多条统计记录，
 * 此函数会自动去重，确保每个文件只删除一次。
 * 删除失败时静默忽略错误（如文件已被删除）。
 *
 * @example
 * ```typescript
 * await deleteOriginalFiles(allStats)
 * console.log('原始文件已删除')
 * ```
 */
export async function deleteOriginalFiles(stats: CompressStats[]): Promise<void> {
	const uniqueFiles = [...new Set(stats.map(s => s.file))]
	for (const file of uniqueFiles) {
		try {
			await fsp.unlink(file)
		} catch {
			// ignore deletion errors
		}
	}
}
