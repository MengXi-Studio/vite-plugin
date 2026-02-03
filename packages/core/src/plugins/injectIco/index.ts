import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { InjectIcoOptions } from './types'
import { generateIconTags } from './common'
import { checkSourceExists, copySourceToTarget, Validator } from '@/common'

/**
 * 注入图标插件类，用于在构建过程中注入图标链接到 HTML 文件
 *
 * @class InjectIcoPlugin
 * @extends {BasePlugin<InjectIcoOptions>}
 * @description 该插件会在 Vite 构建完成后执行，将指定图标文件的链接注入到 HTML 文件的 `<head>` 标签中。
 */
class InjectIcoPlugin extends BasePlugin<InjectIcoOptions> {
	protected getDefaultOptions(): Partial<InjectIcoOptions> {
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
		return 'inject-ico'
	}

	/**
	 * 转换 HTML 入口文件，将图标标签注入到 HTML 文件的 `<head>` 标签中
	 *
	 * @private
	 * @param {string} html - 原始的 HTML 内容
	 * @returns {string} 经过修改后的 HTML 内容，在 `</head>` 标签前注入图标链接
	 * @description 该方法检查插件是否启用，生成图标标签，然后将图标标签注入到 HTML 文件的 `<head>` 标签前。
	 * 如果未找到 `</head>` 标签，则输出警告并返回原始 HTML。
	 */
	private injectIcoTags(html: string): string {
		// 如果插件未启用，直接返回原始 HTML
		if (!this.options.enabled) {
			this.logger.info('插件已禁用，跳过图标注入')
			return html
		}

		// 生成图标标签
		const iconTags = generateIconTags(this.options)

		// 如果没有图标标签需要注入，直接返回原始 HTML
		if (iconTags.length === 0) {
			this.logger.info('没有生成图标标签，跳过注入')
			return html
		}

		// 检查是否已经存在图标标签，避免重复注入
		let modifiedHtml = html

		// 注入图标标签到 </head> 标签前
		const headCloseIndex = modifiedHtml.indexOf('</head>')
		if (headCloseIndex !== -1) {
			const tagsHtml = iconTags.join('\n') + '\n'
			modifiedHtml = modifiedHtml.substring(0, headCloseIndex) + tagsHtml + modifiedHtml.substring(headCloseIndex)

			this.logger.success(`成功注入 ${iconTags.length} 个图标标签到 HTML 文件`)
			iconTags.forEach(tag => {
				this.logger.info(`  - ${tag}`)
			})
		} else {
			this.logger.warn('未找到 </head> 标签，跳过图标注入')
		}

		return modifiedHtml
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
		plugin.transformIndexHtml = (html: string) => {
			return this.injectIcoTags(html)
		}

		plugin.writeBundle = async () => {
			await this.safeExecute(() => this.copyFiles(), '图标文件复制')
		}
	}
}

/**
 * 创建注入图标插件实例
 *
 * @export
 * @param {string | InjectIcoOptions} [options] - 插件配置选项，可以是字符串形式的 base 路径或完整的配置对象
 * @returns {Plugin} Vite 插件实例，用于在构建过程中注入图标链接到 HTML 文件
 * @example
 * ```typescript
 * // 基本使用
 * injectIco() // 使用默认配置
 *
 * // 使用字符串配置 base 路径
 * injectIco('/assets')
 *
 * // 使用完整配置
 * injectIco({
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
 * @remarks
 * 该函数创建并返回一个 Vite 插件实例，该实例会在构建过程中：
 * 1. 将图标链接注入到 HTML 文件的 `<head>` 标签中
 * 2. 如果配置了 copyOptions，将图标文件复制到目标目录
 *
 * 支持自定义图标链接、图标数组配置以及图标文件复制功能。
 */
export const injectIco = createPluginFactory<InjectIcoOptions, InjectIcoPlugin, string | InjectIcoOptions>(InjectIcoPlugin, options => (typeof options === 'string' ? { base: options } : options || {}))
