import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { CompressAssetsOptions, CompressStats, CompressSummary } from './types'
import { compressFile, scanDirectory, buildSummary, writeReport, deleteOriginalFiles } from './helpers'
import { formatFileSize } from '@/common/format'
import { runWithConcurrency } from '@/common/concurrency'

/**
 * 构建产物压缩插件
 *
 * @class CompressAssetsPlugin
 * @extends {BasePlugin<CompressAssetsOptions>}
 *
 * @description 在 Vite 构建（writeBundle）完成后，自动扫描输出目录中的文件，
 * 使用 gzip 和/或 brotli 算法进行压缩，生成对应的 `.gz` / `.br` 文件。
 * 支持文件过滤、并发压缩、压缩报告生成、原始文件删除等功能。
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { compressAssets } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     compressAssets({
 *       algorithm: 'both',
 *       threshold: 2048,
 *       compressionLevel: 9,
 *       brotliQuality: 11,
 *       reportOutput: 'compress-report.json'
 *     })
 *   ]
 * })
 * ```
 */
class CompressAssetsPlugin extends BasePlugin<CompressAssetsOptions> {
	/** 所有文件的压缩统计列表 */
	private allStats: CompressStats[] = []
	/** 压缩汇总统计信息，压缩完成后可用 */
	private summary: CompressSummary | null = null

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<CompressAssetsOptions>} 默认配置对象
	 *
	 * @description 默认配置：
	 * - algorithm: 'gzip'
	 * - threshold: 1024 (1KB)
	 * - deleteOriginalFile: false
	 * - includeExtensions: ['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt']
	 * - compressionLevel: 9 (gzip 最高级别)
	 * - brotliQuality: 11 (brotli 最高质量)
	 * - reportOutput: 'compress-report.json'
	 * - parallelLimit: 10
	 */
	protected getDefaultOptions(): Partial<CompressAssetsOptions> {
		return {
			algorithm: 'gzip',
			threshold: 1024,
			deleteOriginalFile: false,
			includeExtensions: ['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt'],
			excludeExtensions: [],
			excludePaths: [],
			compressionLevel: 9,
			brotliQuality: 11,
			reportOutput: 'compress-report.json',
			parallelLimit: 10
		}
	}

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当配置项不合法时抛出校验错误
	 *
	 * @description 校验规则：
	 * - algorithm: 必须为 'gzip' | 'brotli' | 'both'
	 * - threshold: 非负数
	 * - compressionLevel: 1-9
	 * - brotliQuality: 1-11
	 * - reportOutput: false 或字符串路径
	 * - parallelLimit: 1-50
	 */
	protected validateOptions(): void {
		this.validator
			.field('algorithm')
			.enum(['gzip', 'brotli', 'both'])
			.field('threshold')
			.number()
			.minValue(0)
			.field('deleteOriginalFile')
			.boolean()
			.field('includeExtensions')
			.array()
			.field('excludeExtensions')
			.array()
			.field('excludePaths')
			.array()
			.field('compressionLevel')
			.number()
			.minValue(1)
			.maxValue(9)
			.field('brotliQuality')
			.number()
			.minValue(1)
			.maxValue(11)
			.field('reportOutput')
			.custom(v => v === false || typeof v === 'string', 'reportOutput 必须为 false 或字符串路径')
			.field('parallelLimit')
			.number()
			.minValue(1)
			.maxValue(50)
			.validate()
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 'compress-assets'
	 */
	protected getPluginName(): string {
		return 'compress-assets'
	}

	/**
	 * 获取插件执行阶段
	 *
	 * @returns {Plugin['enforce']} 'post'，确保在其他插件之后执行
	 */
	protected getEnforce(): Plugin['enforce'] {
		return 'post'
	}

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @param {Plugin} plugin - Vite 插件对象
	 *
	 * @description 注册 `writeBundle` 钩子，在构建产物写入完成后触发压缩流程。
	 * 使用 `safeExecute` 包裹以确保异常不会中断构建。
	 */
	protected addPluginHooks(plugin: Plugin): void {
		this.registerHook(plugin, 'writeBundle', () => this.compressAllFiles(), '压缩构建产物')
	}

	/**
	 * 执行完整的压缩流程
	 *
	 * @async
	 * @returns {Promise<void>}
	 *
	 * @description 完整流程：
	 * 1. 扫描构建输出目录，收集待压缩文件
	 * 2. 根据配置的算法（gzip / brotli / both）并发压缩文件
	 * 3. 构建压缩统计汇总
	 * 4. 可选：删除原始文件
	 * 5. 可选：生成压缩报告
	 * 6. 输出压缩统计日志
	 */
	private async compressAllFiles(): Promise<void> {
		if (!this.viteConfig) return

		const outDir = this.viteConfig.build.outDir
		const startTime = Date.now()

		this.logger.info(`开始扫描构建产物目录: ${outDir}`)

		const candidates = await scanDirectory(outDir, this.options)

		if (candidates.length === 0) {
			this.logger.info('未找到需要压缩的文件')
			return
		}

		this.logger.info(`发现 ${candidates.length} 个待压缩文件`)

		this.allStats = []

		const algorithms: Array<'gzip' | 'brotli'> = this.options.algorithm === 'both' ? ['gzip', 'brotli'] : [this.options.algorithm]

		for (const algo of algorithms) {
			const stats = await runWithConcurrency(
				candidates,
				async candidate => {
					return compressFile(candidate.filePath, algo, this.options.compressionLevel, this.options.brotliQuality)
				},
				this.options.parallelLimit
			)
			this.allStats.push(...stats)
		}

		const executionTime = Date.now() - startTime
		this.summary = buildSummary(this.allStats, executionTime)

		if (this.options.deleteOriginalFile) {
			await deleteOriginalFiles(this.allStats)
			this.logger.info('已删除原始文件，仅保留压缩版本')
		}

		if (this.options.reportOutput) {
			await writeReport(outDir, this.options.reportOutput, this.summary)
			this.logger.info(`压缩报告已生成: ${this.options.reportOutput}`)
		}

		this.logSummary()
	}

	/**
	 * 输出压缩统计日志
	 *
	 * @description 输出总体压缩统计（文件数、原始体积、压缩后体积、压缩率、耗时），
	 * 以及压缩率排名前 5 的文件详情。
	 */
	private logSummary(): void {
		if (!this.summary) return

		const { totalFiles, totalOriginalSize, totalCompressedSize, totalRatio, executionTime } = this.summary

		this.logger.success(`压缩完成: ${totalFiles} 个文件`, `原始体积: ${formatFileSize(totalOriginalSize)} → 压缩后: ${formatFileSize(totalCompressedSize)}，压缩率: ${totalRatio}%，耗时: ${executionTime}ms`)

		const top5 = [...this.allStats].sort((a, b) => b.ratio - a.ratio).slice(0, 5)

		if (top5.length > 0) {
			this.logger.info('压缩率 Top 5:')
			for (const stat of top5) {
				this.logger.info(`  ${stat.algorithm.toUpperCase().padEnd(6)} ${stat.ratio}%  ${formatFileSize(stat.originalSize)} → ${formatFileSize(stat.compressedSize)}`)
			}
		}
	}

	/**
	 * 获取所有文件的压缩统计列表
	 *
	 * @returns {CompressStats[]} 压缩统计列表的浅拷贝
	 *
	 * @example
	 * ```typescript
	 * const plugin = compressAssets({ algorithm: 'gzip' })
	 * // 构建完成后...
	 * const stats = (plugin as any).getStats?.() ?? []
	 * ```
	 */
	public getStats(): CompressStats[] {
		return [...this.allStats]
	}

	/**
	 * 获取压缩汇总统计信息
	 *
	 * @returns {CompressSummary | null} 压缩汇总信息，压缩未执行时返回 null
	 *
	 * @example
	 * ```typescript
	 * const plugin = compressAssets({ algorithm: 'gzip' })
	 * // 构建完成后...
	 * const summary = (plugin as any).getSummary?.()
	 * if (summary) {
	 *   console.log(`总压缩率: ${summary.totalRatio}%`)
	 * }
	 * ```
	 */
	public getSummary(): CompressSummary | null {
		return this.summary
	}
}

/**
 * 创建构建产物压缩插件
 *
 * @function compressAssets
 * @param {Partial<CompressAssetsOptions>} [options] - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @description 在 Vite 构建完成后自动压缩输出目录中的文件，
 * 支持 gzip 和 brotli 两种压缩算法，可配置压缩级别、文件过滤规则、
 * 并发数量等参数，并生成压缩统计报告。
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { compressAssets } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     compressAssets({
 *       algorithm: 'both',
 *       threshold: 2048,
 *       deleteOriginalFile: false,
 *       compressionLevel: 9,
 *       brotliQuality: 11,
 *       reportOutput: 'compress-report.json',
 *       parallelLimit: 10
 *     })
 *   ]
 * })
 * ```
 */
export const compressAssets = createPluginFactory(CompressAssetsPlugin)
export * from './types'
