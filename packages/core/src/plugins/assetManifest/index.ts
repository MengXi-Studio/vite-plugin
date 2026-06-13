import path from 'node:path'
import fs from 'node:fs'
import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { AssetManifestOptions, AssetMap, AssetGroup, AssetManifestResult } from './types'
import { scanOutputDirectory, buildAssetMap, formatManifest, groupAssetsByEntry, injectRuntimeManifest, findHtmlFiles } from './common'
import { writeFileContent } from '@/common/fs'
import { validateGlobalName } from '@/common/validation'

/**
 * 资源清单生成插件
 *
 * @class AssetManifestPlugin
 * @extends {BasePlugin<AssetManifestOptions>}
 *
 * @description 在 Vite 构建（`writeBundle`）完成后，自动扫描输出目录中的文件，
 * 生成资源映射清单（`manifest.json`），支持 Vite 标准、Webpack 兼容和自定义三种输出格式。
 * 支持按入口分组、运行时注入、自定义格式化等功能。
 *
 * **核心流程**：
 * 1. 在 `writeBundle` 钩子中扫描构建输出目录
 * 2. 构建资源映射表（原始路径 → 输出路径）
 * 3. 可选：按入口分组资源
 * 4. 格式化并写入清单文件
 * 5. 可选：将清单注入到 HTML 文件中作为运行时全局变量
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { assetManifest } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     assetManifest({
 *       outputFormat: 'vite',
 *       publicPath: 'https://cdn.example.com/',
 *       injectRuntime: true,
 *       groupByEntry: true
 *     })
 *   ]
 * })
 * ```
 */
class AssetManifestPlugin extends BasePlugin<AssetManifestOptions> {
	/** 生成的资源清单数据（仅 vite 格式时赋值） */
	private manifest: AssetManifestResult | null = null
	/** 资源映射表：键为原始路径，值为带 publicPath 的输出路径 */
	private assetMap: AssetMap = {}
	/** 按入口分组的资源信息（仅 groupByEntry 为 true 时赋值） */
	private groups: AssetGroup[] | null = null

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<AssetManifestOptions>} 默认配置对象
	 *
	 * @description 默认配置值：
	 * | 配置项 | 默认值 | 说明 |
	 * |-------|--------|------|
	 * | `outputFormat` | `'vite'` | Vite 标准格式 |
	 * | `outputFile` | `'manifest.json'` | 清单输出文件名 |
	 * | `includeExtensions` | `[]` | 包含所有扩展名 |
	 * | `publicPath` | `'/'` | 根路径 |
	 * | `injectRuntime` | `false` | 不注入运行时 |
	 * | `runtimeGlobalName` | `'__ASSET_MANIFEST__'` | 全局变量名 |
	 * | `customFormatter` | `null` | 无自定义格式化器 |
	 * | `groupByEntry` | `false` | 不按入口分组 |
	 * | `excludeExtensions` | `['.map', '.gz', '.br']` | 排除 source map 和压缩文件 |
	 * | `excludePaths` | `[]` | 不排除路径 |
	 */
	protected getDefaultOptions(): Partial<AssetManifestOptions> {
		return {
			outputFormat: 'vite',
			outputFile: 'manifest.json',
			includeExtensions: [],
			publicPath: '/',
			injectRuntime: false,
			runtimeGlobalName: '__ASSET_MANIFEST__',
			customFormatter: null,
			groupByEntry: false,
			excludeExtensions: ['.map', '.gz', '.br'],
			excludePaths: []
		}
	}

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当配置项不合法时抛出校验错误
	 *
	 * @description 校验规则：
	 * - `outputFormat`: 必须为 `'vite'` | `'webpack'` | `'custom'`
	 * - `outputFile`: 非空字符串
	 * - `publicPath`: 非空字符串
	 * - `injectRuntime`: 布尔值
	 * - `runtimeGlobalName`: 非空字符串且必须是合法的 JavaScript 标识符
	 * - `groupByEntry`: 布尔值
	 * - `customFormatter`: 当 `outputFormat` 为 `'custom'` 时必须为函数
	 */
	protected validateOptions(): void {
		this.validator
			.field('outputFormat')
			.enum(['vite', 'webpack', 'custom'])
			.field('outputFile')
			.custom(v => typeof v === 'string' && v.length > 0, 'outputFile 必须为非空字符串')
			.field('publicPath')
			.custom(v => typeof v === 'string' && v.length > 0, 'publicPath 必须为非空字符串')
			.field('injectRuntime')
			.boolean()
			.field('runtimeGlobalName')
			.custom(v => typeof v === 'string' && v.length > 0, 'runtimeGlobalName 必须为非空字符串')
			.field('groupByEntry')
			.boolean()
			.field('customFormatter')
			.custom(v => this.options.outputFormat !== 'custom' || typeof v === 'function', 'outputFormat 为 "custom" 时，customFormatter 必须为函数')
			.validate()

		// 校验 runtimeGlobalName 为合法的 JavaScript 标识符，防止 XSS 和语法错误
		validateGlobalName(this.options.runtimeGlobalName, 'runtimeGlobalName')
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 `'asset-manifest'`
	 */
	protected getPluginName(): string {
		return 'asset-manifest'
	}

	/**
	 * 获取插件执行阶段
	 *
	 * @returns {Plugin['enforce']} `'post'`，确保在其他插件之后执行
	 */
	protected getEnforce(): Plugin['enforce'] {
		return 'post'
	}

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @param {Plugin} plugin - Vite 插件对象
	 *
	 * @description 仅注册 `writeBundle` 钩子，在构建产物写入完成后执行：
	 * 1. 扫描输出目录并生成资源清单
	 * 2. 如果启用 `injectRuntime`，在清单生成后直接读写 HTML 文件注入运行时脚本
	 *
	 * 所有操作均使用 `safeExecute` 包裹以确保异常不会中断构建。
	 *
	 * **注意**：运行时注入在 `writeBundle` 中完成（而非 `transformIndexHtml`），
	 * 因为清单数据依赖扫描输出目录，而目录内容在 `writeBundle` 时才完整。
	 */
	protected addPluginHooks(plugin: Plugin): void {
		plugin.writeBundle = {
			order: 'post',
			handler: async () => {
				await this.safeExecute(() => this.generateManifest(), '生成资源清单')
			}
		}
	}

	/**
	 * 执行完整的清单生成流程
	 *
	 * @async
	 * @returns {Promise<void>}
	 *
	 * @description 完整流程：
	 * 1. 扫描构建输出目录，收集资源文件
	 * 2. 构建资源映射表（含冲突检测）
	 * 3. 可选：按入口分组资源
	 * 4. 格式化清单输出
	 * 5. 写入清单文件
	 * 6. 可选：将运行时清单注入到 HTML 文件
	 * 7. 输出统计日志
	 */
	private async generateManifest(): Promise<void> {
		if (!this.viteConfig) return

		const outDir = this.viteConfig.build.outDir
		const startTime = Date.now()

		this.logger.info(`开始扫描构建产物目录: ${outDir}`)

		// 1. 扫描输出目录
		const assets = await scanOutputDirectory(outDir, this.options)

		if (assets.length === 0) {
			this.logger.info('未找到需要记录的资源文件')
			return
		}

		// 2. 构建资源映射表（含冲突检测）
		this.assetMap = buildAssetMap(assets, this.options.publicPath, msg => {
			this.logger.warn(msg)
		})

		// 3. 可选：按入口分组
		if (this.options.groupByEntry) {
			this.groups = groupAssetsByEntry(assets, this.assetMap)
		}

		// 4. 格式化清单
		const formatted = formatManifest(this.assetMap, this.options.outputFormat, this.options.customFormatter, this.options.publicPath, this.groups ?? undefined)

		// 5. 写入清单文件
		const outputPath = path.isAbsolute(this.options.outputFile) ? this.options.outputFile : path.join(outDir, this.options.outputFile)

		await writeFileContent(outputPath, JSON.stringify(formatted, null, 2))

		// 6. 保存清单数据（供运行时注入使用）
		if (this.options.outputFormat === 'vite') {
			this.manifest = formatted as AssetManifestResult
		}

		// 7. 可选：注入运行时清单到 HTML 文件
		if (this.options.injectRuntime) {
			await this.injectRuntimeToHtmlFiles(outDir)
		}

		const executionTime = Date.now() - startTime
		this.logStats(assets.length, executionTime)
	}

	/**
	 * 将运行时清单注入到输出目录中的所有 HTML 文件
	 *
	 * @async
	 * @param {string} outDir - 构建输出目录路径
	 * @returns {Promise<void>}
	 *
	 * @description 在 `writeBundle` 阶段，清单已生成后，扫描输出目录中的 HTML 文件，
	 * 将资源映射表以全局变量的形式注入到每个 HTML 文件的 `</head>` 标签前。
	 * 如果清单尚未生成或映射表为空，则跳过注入。
	 *
	 * 此方法直接读写磁盘上的 HTML 文件，确保注入时清单数据已就绪。
	 */
	private async injectRuntimeToHtmlFiles(outDir: string): Promise<void> {
		if (!this.manifest && Object.keys(this.assetMap).length === 0) {
			this.logger.warn('资源清单尚未生成，跳过运行时注入')
			return
		}

		const assetMap = this.manifest?.assets || this.assetMap

		// 扫描输出目录中的 HTML 文件
		const htmlFiles = await findHtmlFiles(outDir)

		if (htmlFiles.length === 0) {
			this.logger.warn('未找到 HTML 文件，运行时清单注入跳过')
			return
		}

		for (const htmlPath of htmlFiles) {
			try {
				const htmlContent = await fs.promises.readFile(htmlPath, 'utf-8')
				const result = injectRuntimeManifest(htmlContent, assetMap, this.options.runtimeGlobalName)

				if (result.injected) {
					await writeFileContent(htmlPath, result.html)
					this.logger.info(`运行时清单已注入到: ${path.relative(outDir, htmlPath)}`)
				} else {
					this.logger.warn(`未找到 </head> 标签，跳过注入: ${path.relative(outDir, htmlPath)}`)
				}
			} catch (err) {
				this.logger.error(`注入运行时清单失败: ${htmlPath} - ${err instanceof Error ? err.message : String(err)}`)
			}
		}

		this.logger.info(`运行时清单全局变量: ${this.options.runtimeGlobalName}`)
	}

	/**
	 * 输出清单生成统计日志
	 *
	 * @param {number} assetCount - 资源文件数量
	 * @param {number} executionTime - 执行耗时（毫秒）
	 */
	private logStats(assetCount: number, executionTime: number): void {
		const mappingCount = Object.keys(this.assetMap).length
		this.logger.success(`资源清单已生成: ${assetCount} 个资源文件，${mappingCount} 条映射记录`, `格式: ${this.options.outputFormat}，输出: ${this.options.outputFile}，耗时: ${executionTime}ms`)

		if (this.groups && this.groups.length > 0) {
			this.logger.info(`入口分组: ${this.groups.map(g => `${g.entry}(${g.assets.js.length + g.assets.css.length + g.assets.other.length})`).join(', ')}`)
		}
	}

	/**
	 * 获取生成的资源映射表
	 *
	 * @returns {AssetMap} 资源映射表的浅拷贝，键为原始路径，值为输出路径
	 *
	 * @example
	 * ```typescript
	 * const plugin = assetManifest({ outputFormat: 'vite' })
	 * // 构建完成后...
	 * const assetMap = plugin.pluginInstance?.getAssetMap?.() ?? {}
	 * ```
	 */
	public getAssetMap(): AssetMap {
		return { ...this.assetMap }
	}

	/**
	 * 获取生成的资源清单数据
	 *
	 * @returns {AssetManifestResult | null} 清单数据，仅 `outputFormat` 为 `'vite'` 时返回完整数据；
	 * 其他格式或未生成时返回 `null`
	 */
	public getManifest(): AssetManifestResult | null {
		return this.manifest
	}

	/**
	 * 获取按入口分组的资源信息
	 *
	 * @returns {AssetGroup[] | null} 分组信息，未启用 `groupByEntry` 或未生成时返回 `null`
	 */
	public getGroups(): AssetGroup[] | null {
		return this.groups
	}
}

/**
 * 创建资源清单生成插件
 *
 * @function assetManifest
 * @param {Partial<AssetManifestOptions>} [options] - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @description 在 Vite 构建完成后自动扫描输出目录中的文件，
 * 生成资源映射清单，支持 Vite 标准、Webpack 兼容和自定义三种输出格式。
 * 支持按入口分组、运行时注入、自定义格式化等功能。
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { assetManifest } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     assetManifest({
 *       outputFormat: 'vite',
 *       publicPath: 'https://cdn.example.com/',
 *       injectRuntime: true,
 *       groupByEntry: true
 *     })
 *   ]
 * })
 * ```
 */
export const assetManifest = createPluginFactory(AssetManifestPlugin)
export * from './types'
