import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { BundleAnalyzerOptions, BundleAnalysisResult } from './types'
import { analyzeBundle, loadPreviousReport, compareWithPrevious, generateJsonReport, generateHtmlReport, formatFileSize } from './common'

/**
 * 构建产物分析插件
 *
 * @class BundleAnalyzerPlugin
 * @extends {BasePlugin<BundleAnalyzerOptions>}
 *
 * @description 在 Vite 构建（writeBundle）完成后，自动扫描输出目录中的文件，
 * 分析构建产物的体积分布、模块依赖、文件类型统计等关键指标，
 * 生成 JSON 报告和/或包含可视化图表的 HTML 报告，
 * 支持体积阈值告警和与上次构建的对比分析。
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { bundleAnalyzer } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     bundleAnalyzer({
 *       outputFormat: 'both',
 *       sizeThreshold: 200,
 *       topModules: 30,
 *       gzipSize: true,
 *       compareWith: 'bundle-analysis-prev.json'
 *     })
 *   ]
 * })
 * ```
 */
class BundleAnalyzerPlugin extends BasePlugin<BundleAnalyzerOptions> {
	/** 分析结果，分析完成后可用 */
	private analysisResult: BundleAnalysisResult | null = null

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<BundleAnalyzerOptions>} 默认配置对象
	 *
	 * @description 默认配置：
	 * - outputFormat: 'json'
	 * - outputFile: 'bundle-analysis'
	 * - openAnalyzer: false
	 * - sizeThreshold: 100 (KB)
	 * - topModules: 20
	 * - compareWith: null
	 * - gzipSize: true
	 * - excludeNodeModules: false
	 * - excludePatterns: []
	 * - includeExtensions: []
	 * - defaultChartType: 'treemap'
	 */
	protected getDefaultOptions(): Partial<BundleAnalyzerOptions> {
		return {
			outputFormat: 'json',
			outputFile: 'bundle-analysis',
			openAnalyzer: false,
			sizeThreshold: 100,
			topModules: 20,
			compareWith: null,
			gzipSize: true,
			excludeNodeModules: false,
			excludePatterns: [],
			includeExtensions: [],
			defaultChartType: 'treemap'
		}
	}

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当配置项不合法时抛出校验错误
	 *
	 * @description 校验规则：
	 * - outputFormat: 必须为 'json' | 'html' | 'both'
	 * - openAnalyzer: 布尔值
	 * - sizeThreshold: 非负数
	 * - topModules: 正整数，最小值 1
	 * - gzipSize: 布尔值
	 * - excludeNodeModules: 布尔值
	 * - defaultChartType: 必须为 'treemap' | 'sunburst' | 'list'
	 */
	protected validateOptions(): void {
		this.validator
			.field('outputFormat')
			.enum(['json', 'html', 'both'])
			.field('openAnalyzer')
			.boolean()
			.field('sizeThreshold')
			.number()
			.minValue(0)
			.field('topModules')
			.number()
			.minValue(1)
			.field('gzipSize')
			.boolean()
			.field('excludeNodeModules')
			.boolean()
			.field('defaultChartType')
			.enum(['treemap', 'sunburst', 'list'])
			.validate()
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 'bundle-analyzer'
	 */
	protected getPluginName(): string {
		return 'bundle-analyzer'
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
	 * @description 注册 `writeBundle` 钩子，在构建产物写入完成后触发分析流程。
	 * 使用 `safeExecute` 包裹以确保异常不会中断构建。
	 */
	protected addPluginHooks(plugin: Plugin): void {
		plugin.writeBundle = {
			order: 'post',
			handler: async () => {
				await this.safeExecute(() => this.runAnalysis(), '分析构建产物')
			}
		}
	}

	/**
	 * 执行完整的分析流程
	 *
	 * @async
	 * @returns {Promise<void>}
	 *
	 * @description 完整流程：
	 * 1. 扫描构建输出目录，分析产物体积和模块分布
	 * 2. 可选：与上次构建结果进行对比
	 * 3. 检查体积阈值并生成告警
	 * 4. 生成报告（JSON / HTML / 两者）
	 * 5. 可选：自动打开 HTML 报告
	 * 6. 输出分析摘要日志
	 */
	private async runAnalysis(): Promise<void> {
		if (!this.viteConfig) return

		const outDir = this.viteConfig.build.outDir

		this.analysisResult = await analyzeBundle(outDir, this.options)

		if (this.options.compareWith) {
			await this.performComparison()
		}

		this.logSummary()
		this.logWarnings()

		await this.generateReports(outDir)

		if (this.options.openAnalyzer && (this.options.outputFormat === 'html' || this.options.outputFormat === 'both')) {
			await this.openHtmlReport(outDir)
		}
	}

	/**
	 * 执行与上次构建的对比分析
	 *
	 * @async
	 * @returns {Promise<void>}
	 *
	 * @description 加载之前生成的分析报告，与当前结果进行对比，
	 * 生成差异列表并更新分析结果中的 comparisonDiffs 字段。
	 */
	private async performComparison(): Promise<void> {
		if (!this.analysisResult || !this.options.compareWith) return

		const previousReport = await loadPreviousReport(this.options.compareWith)

		if (!previousReport) {
			this.logger.info(`未找到对比报告: ${this.options.compareWith}，跳过对比分析`)
			return
		}

		const diffs = compareWithPrevious(this.analysisResult, previousReport)
		this.analysisResult.comparisonDiffs = diffs

		if (diffs.length > 0) {
			const increased = diffs.filter(d => d.trend === 'increased').length
			const decreased = diffs.filter(d => d.trend === 'decreased').length
			const added = diffs.filter(d => d.trend === 'added').length
			const removed = diffs.filter(d => d.trend === 'removed').length

			this.logger.info(`构建对比: ${increased} 个增大, ${decreased} 个减小, ${added} 个新增, ${removed} 个移除`)
		}
	}

	/**
	 * 生成分析报告
	 *
	 * @async
	 * @param {string} outDir - 构建输出目录
	 * @returns {Promise<void>}
	 *
	 * @description 根据 outputFormat 配置生成 JSON 和/或 HTML 报告。
	 * JSON 报告包含完整的分析数据，HTML 报告包含可视化图表。
	 */
	private async generateReports(outDir: string): Promise<void> {
		if (!this.analysisResult) return

		const { outputFormat, outputFile } = this.options

		if (outputFormat === 'json' || outputFormat === 'both') {
			const jsonPath = await generateJsonReport(outDir, outputFile, this.analysisResult)
			this.logger.info(`JSON 报告已生成: ${jsonPath}`)
		}

		if (outputFormat === 'html' || outputFormat === 'both') {
			const htmlPath = await generateHtmlReport(outDir, outputFile, this.analysisResult, {
				defaultChartType: this.options.defaultChartType
			})
			this.logger.info(`HTML 报告已生成: ${htmlPath}`)
		}
	}

	/**
	 * 自动在浏览器中打开 HTML 报告
	 *
	 * @async
	 * @param {string} outDir - 构建输出目录
	 * @returns {Promise<void>}
	 *
	 * @description 使用系统默认浏览器打开生成的 HTML 报告。
	 * 跨平台支持 Windows、macOS 和 Linux。
	 */
	private async openHtmlReport(outDir: string): Promise<void> {
		const htmlPath = `${outDir}/${this.options.outputFile}.html`

		try {
			const { exec } = await import('node:child_process')
			const platform = process.platform

			if (platform === 'win32') {
				exec(`start "" "${htmlPath}"`)
			} else if (platform === 'darwin') {
				exec(`open "${htmlPath}"`)
			} else {
				exec(`xdg-open "${htmlPath}"`)
			}

			this.logger.info(`已在浏览器中打开报告: ${htmlPath}`)
		} catch (error) {
			this.logger.warn(`无法自动打开浏览器，请手动打开: ${htmlPath}`)
		}
	}

	/**
	 * 输出分析摘要日志
	 *
	 * @description 输出总体统计信息，包括 chunk 数量、总体积、gzip 体积和分析耗时。
	 */
	private logSummary(): void {
		if (!this.analysisResult) return

		const { chunks, totalSize, totalGzipSize, analysisTime } = this.analysisResult

		this.logger.success(`产物分析完成: ${chunks.length} 个 chunk, 总体积: ${formatFileSize(totalSize)} (gzip: ${formatFileSize(totalGzipSize)}), 分析耗时: ${analysisTime}ms`)

		const entryCount = chunks.filter(c => c.type === 'entry').length
		const chunkCount = chunks.filter(c => c.type === 'chunk').length
		const assetCount = chunks.filter(c => c.type === 'asset').length

		if (entryCount > 0 || chunkCount > 0 || assetCount > 0) {
			this.logger.info(`  入口: ${entryCount} | 代码块: ${chunkCount} | 资源: ${assetCount}`)
		}

		if (this.analysisResult.topModules.length > 0) {
			this.logger.info('体积 Top 5 模块:')
			const top5 = this.analysisResult.topModules.slice(0, 5)
			for (let i = 0; i < top5.length; i++) {
				const mod = top5[i]
				const typeLabel = mod.isNodeModule ? 'node_modules' : 'source'
				this.logger.info(`  ${i + 1}. ${formatFileSize(mod.size)} (${typeLabel}) ${mod.id}`)
			}
		}
	}

	/**
	 * 输出体积阈值告警日志
	 *
	 * @description 遍历分析结果中的告警列表，按严重程度输出告警信息。
	 * 超过阈值 2 倍的告警标记为 critical。
	 */
	private logWarnings(): void {
		if (!this.analysisResult || this.analysisResult.warnings.length === 0) return

		this.logger.warn(`发现 ${this.analysisResult.warnings.length} 个体积告警:`)

		for (const warning of this.analysisResult.warnings) {
			const prefix = warning.sizeKB > warning.thresholdKB * 2 ? '🔴' : '🟡'
			this.logger.warn(`  ${prefix} ${warning.message}`)
		}
	}

	/**
	 * 获取分析结果
	 *
	 * @returns {BundleAnalysisResult | null} 分析结果，分析未执行时返回 null
	 *
	 * @example
	 * ```typescript
	 * const plugin = bundleAnalyzer({ outputFormat: 'json' })
	 * // 构建完成后...
	 * const result = (plugin as any).pluginInstance?.getResult?.()
	 * if (result) {
	 *   console.log(`总体积: ${result.totalSize} 字节`)
	 * }
	 * ```
	 */
	public getResult(): BundleAnalysisResult | null {
		return this.analysisResult
	}
}

/**
 * 创建构建产物分析插件
 *
 * @function bundleAnalyzer
 * @param {Partial<BundleAnalyzerOptions>} [options] - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @description 在 Vite 构建完成后自动分析输出目录中的构建产物，
 * 生成体积统计、模块排行、文件类型分布等关键指标，
 * 支持 JSON 报告和 HTML 可视化图表，支持体积阈值告警和构建对比。
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { bundleAnalyzer } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     bundleAnalyzer({
 *       outputFormat: 'both',
 *       sizeThreshold: 200,
 *       topModules: 30,
 *       gzipSize: true,
 *       compareWith: 'bundle-analysis-prev.json',
 *       defaultChartType: 'treemap'
 *     })
 *   ]
 * })
 * ```
 */
export const bundleAnalyzer = createPluginFactory(BundleAnalyzerPlugin)
export * from './types'
