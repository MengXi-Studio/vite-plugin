import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { ImageOptimizerOptions, ImageOptimizeStats, ImageOptimizeSummary, ImageFormat, ConvertMapping } from './types'
import {
	scanImageFiles,
	compressImage,
	convertImage,
	optimizeSvg,
	isSharpAvailable,
	isSvgoAvailable,
	resolveConvertMapping,
	getTargetFormat,
	needsConversion,
	validateConvertMapping,
	buildSummary,
	writeReport
} from './helpers'
import { formatFileSize } from '@/common/format'
import { runWithConcurrency } from '@/common/concurrency'

/**
 * 图片优化插件
 *
 * @class ImageOptimizerPlugin
 * @extends {BasePlugin<ImageOptimizerOptions>}
 *
 * @description 在 Vite 构建（writeBundle）完成后，自动扫描输出目录中的图片文件，
 * 使用 sharp 和 svgo 进行压缩优化和格式转换。支持 JPEG、PNG、WebP、AVIF、GIF、TIFF、SVG
 * 七种格式的压缩，以及位图格式之间的相互转换。
 *
 * 核心特性：
 * - 多格式压缩：JPEG（mozjpeg）、PNG（palette）、WebP、AVIF、GIF、TIFF、SVG（svgo）
 * - 格式转换：支持位图格式之间的相互转换（如 PNG → WebP、JPEG → AVIF）
 * - 并发处理：可配置并发数，充分利用多核 CPU
 * - 内存控制：使用流式处理和临时文件，避免大图片导致内存溢出
 * - 原子写入：先写临时文件再重命名，确保异常时原文件不损坏
 * - 体积守恒：仅当优化后体积更小时才替换原文件
 * - 优雅降级：sharp/svgo 不可用时提供清晰的错误提示
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { imageOptimizer } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     imageOptimizer({
 *       quality: { jpeg: 80, webp: 75, avif: 50 },
 *       convertToWebp: { png: true, jpeg: true },
 *       keepOriginal: true,
 *       parallelLimit: 5,
 *       reportOutput: 'image-optimize-report.json'
 *     })
 *   ]
 * })
 * ```
 */
class ImageOptimizerPlugin extends BasePlugin<ImageOptimizerOptions> {
	/** 所有文件的优化统计列表 */
	private allStats: ImageOptimizeStats[] = []
	/** 优化汇总统计信息，优化完成后可用 */
	private summary: ImageOptimizeSummary | null = null
	/** 跳过的文件数量 */
	private skippedCount: number = 0
	/** 失败的文件数量 */
	private failedCount: number = 0
	/** sharp 是否可用 */
	private sharpReady: boolean = false
	/** svgo 是否可用 */
	private svgoReady: boolean = false
	/** 是否已检查过依赖可用性 */
	private dependencyChecked: boolean = false
	/** 解析后的格式转换映射 */
	private convertMapping: ConvertMapping = {}

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<ImageOptimizerOptions>} 默认配置对象
	 */
	protected getDefaultOptions(): Partial<ImageOptimizerOptions> {
		return {
			quality: {
				jpeg: 80,
				png: 6,
				webp: 75,
				avif: 50,
				gif: true,
				tiff: 'deflate'
			},
			convertToWebp: {},
			convertToAvif: {},
			convertMapping: {},
			svgo: {
				plugins: [],
				multipass: false
			},
			includeExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tiff', '.tif', '.svg'],
			excludePaths: [],
			threshold: 0,
			keepOriginal: true,
			reportOutput: 'image-optimize-report.json',
			parallelLimit: 5,
			maxPixels: 0
		}
	}

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当配置项不合法时抛出校验错误
	 */
	protected validateOptions(): void {
		this.validator
			.field('threshold')
			.number()
			.minValue(0)
			.field('keepOriginal')
			.boolean()
			.field('includeExtensions')
			.array()
			.field('excludePaths')
			.array()
			.field('reportOutput')
			.custom(v => v === false || typeof v === 'string', 'reportOutput 必须为 false 或字符串路径')
			.field('parallelLimit')
			.number()
			.minValue(1)
			.maxValue(50)
			.field('maxPixels')
			.number()
			.minValue(0)
			.validate()

		// 校验格式转换映射
		const mapping = resolveConvertMapping(this.options as Required<ImageOptimizerOptions>)
		const errors = validateConvertMapping(mapping)
		if (errors.length > 0) {
			throw new Error(`图片优化配置错误: ${errors.join('; ')}`)
		}
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 'image-optimizer'
	 */
	protected getPluginName(): string {
		return 'image-optimizer'
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
	 * @description 注册 `writeBundle` 钩子，在构建产物写入完成后触发优化流程。
	 * 使用 `safeExecute` 包裹以确保异常不会中断构建。
	 */
	protected addPluginHooks(plugin: Plugin): void {
		this.registerHook(plugin, 'writeBundle', () => this.optimizeAllImages(), '优化图片资源')
	}

	/**
	 * 处理配置解析完成事件
	 *
	 * @param config 解析后的 Vite 配置
	 *
	 * @description 在配置解析完成后，解析格式转换映射。
	 * 依赖可用性检查延迟到优化执行时进行，避免阻塞构建流程。
	 */
	protected onConfigResolved(config: any): void {
		super.onConfigResolved(config)

		// 解析格式转换映射
		this.convertMapping = resolveConvertMapping(this.options as Required<ImageOptimizerOptions>)
	}

	/**
	 * 检查 sharp 和 svgo 依赖的可用性
	 *
	 * @async
	 * @description 检查 sharp 和 svgo 是否已安装，并在日志中输出检查结果。
	 * 如果两者都不可用，输出警告信息。
	 */
	private async checkDependencies(): Promise<void> {
		this.sharpReady = await isSharpAvailable()
		this.svgoReady = await isSvgoAvailable()

		if (!this.sharpReady) {
			this.logger.warn('sharp 模块不可用，位图格式（JPEG/PNG/WebP/AVIF/GIF/TIFF）优化将跳过。请安装: npm install sharp')
		}

		if (!this.svgoReady) {
			this.logger.warn('svgo 模块不可用，SVG 优化将跳过。请安装: npm install svgo')
		}

		if (!this.sharpReady && !this.svgoReady) {
			this.logger.warn('sharp 和 svgo 均不可用，图片优化插件将不执行任何操作')
		}
	}

	/**
	 * 执行完整的图片优化流程
	 *
	 * @async
	 * @returns {Promise<void>}
	 *
	 * @description 完整流程：
	 * 1. 检查依赖可用性
	 * 2. 扫描构建输出目录，收集待优化图片文件
	 * 3. 按格式分类处理（SVG 使用 svgo，位图使用 sharp）
	 * 4. 并发执行优化操作
	 * 5. 构建优化统计汇总
	 * 6. 可选：生成优化报告
	 * 7. 输出优化统计日志
	 */
	private async optimizeAllImages(): Promise<void> {
		if (!this.viteConfig) return

		// 每次执行时检查依赖可用性（首次或之前不可用时重试）
		if (!this.dependencyChecked) {
			await this.checkDependencies()
			this.dependencyChecked = true
		}

		if (!this.sharpReady && !this.svgoReady) {
			this.logger.warn('依赖不可用，跳过图片优化')
			return
		}

		const outDir = this.viteConfig.build.outDir
		const startTime = Date.now()

		this.logger.info(`开始扫描图片文件: ${outDir}`)

		const candidates = await scanImageFiles(outDir, this.options as Required<ImageOptimizerOptions>)

		if (candidates.length === 0) {
			this.logger.info('未找到需要优化的图片文件')
			return
		}

		// 按格式分类
		const svgFiles = candidates.filter(c => c.format === 'svg')
		const bitmapFiles = candidates.filter(c => c.format !== 'svg')

		this.logger.info(`发现 ${candidates.length} 个待优化图片 (位图: ${bitmapFiles.length}, SVG: ${svgFiles.length})`)

		this.allStats = []
		this.skippedCount = 0
		this.failedCount = 0

		// 处理位图文件
		if (bitmapFiles.length > 0 && this.sharpReady) {
			const bitmapStats = await runWithConcurrency(
				bitmapFiles,
				async candidate => {
					return this.processBitmap({ ...candidate, format: candidate.format as Exclude<ImageFormat, 'svg'> })
				},
				this.options.parallelLimit!
			)

			for (const result of bitmapStats) {
				if (result.skipped) {
					this.skippedCount++
				} else if (result.error) {
					this.failedCount++
					this.logger.warn(`优化失败: ${result.error}`)
				} else if (result.stat) {
					this.allStats.push(result.stat)
				}
			}
		} else if (bitmapFiles.length > 0 && !this.sharpReady) {
			this.skippedCount += bitmapFiles.length
			this.logger.info(`跳过 ${bitmapFiles.length} 个位图文件（sharp 不可用）`)
		}

		// 处理 SVG 文件
		if (svgFiles.length > 0 && this.svgoReady) {
			const svgStats = await runWithConcurrency(
				svgFiles,
				async candidate => {
					return this.processSvg(candidate)
				},
				this.options.parallelLimit!
			)

			for (const result of svgStats) {
				if (result.skipped) {
					this.skippedCount++
				} else if (result.error) {
					this.failedCount++
					this.logger.warn(`SVG 优化失败: ${result.error}`)
				} else if (result.stat) {
					this.allStats.push(result.stat)
				}
			}
		} else if (svgFiles.length > 0 && !this.svgoReady) {
			this.skippedCount += svgFiles.length
			this.logger.info(`跳过 ${svgFiles.length} 个 SVG 文件（svgo 不可用）`)
		}

		const executionTime = Date.now() - startTime
		this.summary = buildSummary(this.allStats, this.skippedCount, this.failedCount, executionTime)

		if (this.options.reportOutput) {
			await writeReport(outDir, this.options.reportOutput, this.summary)
			this.logger.info(`优化报告已生成: ${this.options.reportOutput}`)
		}

		this.logSummary()
	}

	/**
	 * 处理单个位图文件
	 *
	 * @async
	 * @param {ImageCandidate} candidate - 待优化的位图文件信息
	 * @returns {Promise<{stat?: ImageOptimizeStats; skipped?: boolean; error?: string}>} 处理结果
	 *
	 * @description 根据格式转换映射决定是仅压缩还是转换格式。
	 * 如果目标格式与源格式不同，执行格式转换；否则仅执行压缩。
	 */
	private async processBitmap(candidate: { filePath: string; relativePath: string; format: Exclude<ImageFormat, 'svg'> }): Promise<{ stat?: ImageOptimizeStats; skipped?: boolean; error?: string }> {
		try {
			const targetFormat = getTargetFormat(candidate.format, this.convertMapping) as Exclude<ImageFormat, 'svg'>
			let stat: ImageOptimizeStats

			if (needsConversion(candidate.format, this.convertMapping)) {
				stat = await convertImage(candidate.filePath, candidate.format, targetFormat, this.options.quality!, this.options.maxPixels!, this.options.keepOriginal!)
			} else {
				stat = await compressImage(candidate.filePath, candidate.format, this.options.quality!, this.options.maxPixels!)
			}

			stat.relativePath = candidate.relativePath
			return { stat }
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			return { error: `${candidate.relativePath}: ${message}` }
		}
	}

	/**
	 * 处理单个 SVG 文件
	 *
	 * @async
	 * @param {ImageCandidate} candidate - 待优化的 SVG 文件信息
	 * @returns {Promise<{stat?: ImageOptimizeStats; skipped?: boolean; error?: string}>} 处理结果
	 */
	private async processSvg(candidate: { filePath: string; relativePath: string; format: ImageFormat }): Promise<{ stat?: ImageOptimizeStats; skipped?: boolean; error?: string }> {
		try {
			const stat = await optimizeSvg(candidate.filePath, this.options.svgo!)
			stat.relativePath = candidate.relativePath
			return { stat }
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			return { error: `${candidate.relativePath}: ${message}` }
		}
	}

	/**
	 * 输出优化统计日志
	 *
	 * @description 输出总体优化统计（文件数、原始体积、优化后体积、压缩率、耗时），
	 * 按格式分组的统计，以及压缩率排名前 5 的文件详情。
	 */
	private logSummary(): void {
		if (!this.summary) return

		const { totalFiles, skippedFiles, failedFiles, totalOriginalSize, totalOptimizedSize, totalRatio, convertedFiles, executionTime } = this.summary

		this.logger.success(
			`图片优化完成: ${totalFiles} 个文件已优化` + (skippedFiles > 0 ? `，${skippedFiles} 个跳过` : '') + (failedFiles > 0 ? `，${failedFiles} 个失败` : ''),
			`原始体积: ${formatFileSize(totalOriginalSize)} → 优化后: ${formatFileSize(totalOptimizedSize)}，压缩率: ${totalRatio}%` +
				(convertedFiles > 0 ? `，格式转换: ${convertedFiles} 个` : '') +
				`，耗时: ${executionTime}ms`
		)

		// 按格式分组输出
		for (const [format, data] of Object.entries(this.summary.byFormat)) {
			this.logger.info(`  ${format.toUpperCase().padEnd(5)} ${data.count} 个文件，${formatFileSize(data.originalSize)} → ${formatFileSize(data.optimizedSize)}，压缩率: ${data.ratio}%`)
		}

		// Top 5 压缩率
		const top5 = [...this.allStats].sort((a, b) => b.ratio - a.ratio).slice(0, 5)
		if (top5.length > 0) {
			this.logger.info('压缩率 Top 5:')
			for (const stat of top5) {
				const conversion = stat.converted ? ` (${stat.sourceFormat}→${stat.outputFormat})` : ''
				this.logger.info(`  ${stat.ratio}%  ${formatFileSize(stat.originalSize)} → ${formatFileSize(stat.optimizedSize)}${conversion}  ${stat.relativePath}`)
			}
		}
	}

	/**
	 * 获取所有文件的优化统计列表
	 *
	 * @returns {ImageOptimizeStats[]} 优化统计列表的浅拷贝
	 */
	public getStats(): ImageOptimizeStats[] {
		return [...this.allStats]
	}

	/**
	 * 获取优化汇总统计信息
	 *
	 * @returns {ImageOptimizeSummary | null} 优化汇总信息，优化未执行时返回 null
	 */
	public getSummary(): ImageOptimizeSummary | null {
		return this.summary
	}
}

/**
 * 创建图片优化插件
 *
 * @function imageOptimizer
 * @param {Partial<ImageOptimizerOptions>} [options] - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @description 在 Vite 构建完成后自动优化输出目录中的图片文件，
 * 支持多格式压缩、格式转换、并发处理、压缩报告生成等功能。
 * 使用 sharp 处理位图格式，svgo 处理 SVG 格式。
 *
 * @example
 * ```typescript
 * // 基本使用：仅压缩
 * imageOptimizer({
 *   quality: { jpeg: 80, png: 6, webp: 75 },
 *   reportOutput: 'image-optimize-report.json'
 * })
 *
 * // 格式转换：PNG/JPEG → WebP
 * imageOptimizer({
 *   convertToWebp: { png: true, jpeg: true },
 *   keepOriginal: true,
 *   quality: { webp: 75 }
 * })
 *
 * // 自定义转换映射
 * imageOptimizer({
 *   convertMapping: { png: 'avif', jpeg: 'webp' },
 *   quality: { avif: 50, webp: 75 }
 * })
 *
 * // SVG 优化
 * imageOptimizer({
 *   svgo: {
 *     plugins: [
 *       { name: 'removeViewBox', active: false },
 *       { name: 'removeEmptyContainers', active: true }
 *     ],
 *     multipass: true
 *   }
 * })
 * ```
 */
export const imageOptimizer = createPluginFactory(ImageOptimizerPlugin)
export * from './types'
