import type { Plugin, HtmlTagDescriptor } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { FaviconManagerOptions } from './types'
import { generateIconTagDescriptors } from './common'
import { checkSourceExists, copySourceToTarget } from '@/common/fs'
import { Validator } from '@/common/validation'
import { injectBeforeTag } from '@/common/html'

/**
 * 网站图标管理插件类，用于管理 favicon 及其他图标链接的注入和文件复制
 *
 * @class FaviconManagerPlugin
 * @extends {BasePlugin<FaviconManagerOptions>}
 * @description 该插件会在 Vite 构建过程中，将网站图标（favicon）的 link 标签注入到 HTML 文件的 `<head>` 中，
 * 并可选地将图标文件复制到构建输出目录。
 */
class FaviconManagerPlugin extends BasePlugin<FaviconManagerOptions> {
	protected getDefaultOptions(): Partial<FaviconManagerOptions> {
		return {
			base: '/'
		}
	}

	protected validateOptions(): void {
		// 使用公共验证器验证配置
		this.validator.field('base').string().field('url').string().field('link').string().field('icons').array()

		if (this.options?.copyOptions) {
			this.validator.field('copyOptions').object()

			const copyOptionsValidator = new Validator(this.options.copyOptions)
			copyOptionsValidator.field('sourceDir').required().string().field('targetDir').required().string().field('overwrite').boolean().field('recursive').boolean().validate()
		}

		this.validator.validate()
	}

	protected getPluginName(): string {
		return 'favicon-manager'
	}

	/**
	 * 使用 Vite 原生 HtmlTagDescriptor API 注入图标标签
	 *
	 * @private
	 * @returns {HtmlTagDescriptor[]} HtmlTagDescriptor 数组
	 */
	private getIconTagDescriptors(): HtmlTagDescriptor[] {
		// 如果插件未启用，返回空数组
		if (!this.options.enabled) {
			this.logger.info('插件已禁用，跳过图标注入')
			return []
		}

		// 使用 Vite 原生 API
		const descriptors = generateIconTagDescriptors(this.options)

		if (descriptors.length > 0) {
			this.logger.success(`成功注入 ${descriptors.length} 个图标标签到 HTML 文件`)
		}

		return descriptors
	}

	/**
	 * 转换 HTML 入口文件，将自定义 link 标签注入到 HTML 文件中（fallback 方案）
	 *
	 * @private
	 * @param {string} html - 原始的 HTML 内容
	 * @returns {string} 经过修改后的 HTML 内容
	 */
	private injectCustomLinkTag(html: string): string {
		// 如果插件未启用或没有自定义 link 标签，直接返回原始 HTML
		if (!this.options.enabled || !this.options.link) {
			return html
		}

		const linkTag = this.options.link

		const result = injectBeforeTag(html, '</head>', linkTag)
		if (result.injected) {
			this.logger.success('成功注入自定义图标标签到 HTML 文件')
			this.logger.info(`  - ${linkTag}`)
			return result.html
		}

		this.logger.warn('未找到 </head> 标签，跳过图标注入')
		return html
	}

	/**
	 * 复制图标文件到目标目录
	 *
	 * @private
	 * @async
	 * @returns {Promise<void>} 无返回值
	 * @throws {Error} 如果源文件不存在、权限不足或复制过程中出现其他错误，抛出异常
	 * @description 该方法检查插件是否启用，如果启用则获取 copyOptions 配置，检查源文件是否存在，然后执行文件复制操作，并输出成功日志。
	 * 支持增量复制、递归复制和覆盖控制。
	 */
	private async copyFiles(): Promise<void> {
		// 如果禁用了插件，跳过执行
		if (!this.options.enabled) {
			this.logger.info('插件已禁用，跳过文件复制')
			return
		}

		// 检查是否配置了文件复制相关选项
		const { copyOptions } = this.options

		// 没有配置复制选项，跳过复制操作
		if (!copyOptions) return

		const { sourceDir, targetDir, overwrite = true, recursive = true } = copyOptions

		// 检查源文件是否存在
		await checkSourceExists(sourceDir)

		// 执行文件复制操作
		const result = await copySourceToTarget(sourceDir, targetDir, {
			recursive,
			overwrite,
			incremental: true // 启用增量复制
		})

		// 输出成功日志
		this.logger.success(`图标文件复制成功：从 ${sourceDir} 到 ${targetDir}`, `复制了 ${result.copiedFiles} 个文件，跳过了 ${result.skippedFiles} 个文件，耗时 ${result.executionTime}ms`)
	}

	protected addPluginHooks(plugin: Plugin): void {
		// 使用 Vite 原生 transformIndexHtml 钩子
		plugin.transformIndexHtml = {
			order: 'pre',
			handler: (html: string) => {
				// 如果使用自定义 link 标签，使用字符串替换方式
				if (this.options.link) {
					return this.injectCustomLinkTag(html)
				}

				// 否则使用 Vite 原生 HtmlTagDescriptor API
				const tags = this.getIconTagDescriptors()
				if (tags.length > 0) {
					return {
						html,
						tags
					}
				}

				return html
			}
		}

		plugin.writeBundle = async () => {
			await this.safeExecute(() => this.copyFiles(), '图标文件复制')
		}
	}
}

/**
 * 网站图标管理插件
 *
 * @param options - 插件配置选项，可以是字符串形式的 base 路径或完整的配置对象
 * @returns Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * faviconManager() // 使用默认配置
 *
 * // 使用字符串配置 base 路径
 * faviconManager('/assets')
 *
 * // 使用完整配置
 * faviconManager({
 *   base: '/assets',
 *   icons: [
 *     { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
 *     { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
 *   ],
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 * ```
 *
 * @remarks
 * 该插件在构建过程中：
 * 1. 将网站图标（favicon）的 link 标签注入到 HTML 文件的 `<head>` 中
 * 2. 如果配置了 copyOptions，将图标文件复制到目标目录
 *
 * 支持自定义图标链接、图标数组配置以及图标文件复制功能。
 */
export const faviconManager = createPluginFactory<FaviconManagerOptions, FaviconManagerPlugin, string | FaviconManagerOptions>(FaviconManagerPlugin, options =>
	typeof options === 'string' ? { base: options } : options || {}
)
export * from './types'
