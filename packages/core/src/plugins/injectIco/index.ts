import type { Plugin } from 'vite'
import { BasePlugin } from '@/factory'
import type { InjectIcoOptions } from './types'
import { generateIconTags } from './common'
import { checkSourceExists, copySourceToTarget, Validator } from '@/common'

/**
 * 注入图标插件类，用于在构建过程中注入图标链接到 HTML 文件
 *
 * @class InjectIcoPlugin
 * @extends {BasePlugin<InjectIcoOptions>}
 * @description 该插件会在 Vite 构建完成后执行，将指定图标文件的链接注入到 HTML 文件的 `<head>` 标签中
 */
class InjectIcoPlugin extends BasePlugin<InjectIcoOptions> {
	constructor(options?: string | InjectIcoOptions) {
		// 标准化选项
		const normalizedOptions: InjectIcoOptions = typeof options === 'string' ? { base: options } : options || {}
		super(normalizedOptions)
	}

	protected validateOptions(): void {
		// 使用公共验证器验证配置
		this.validator.field('base').string().default('/').field('url').string().field('link').string().field('icons').array().field('copyOptions').object().validate()

		if (this.options?.copyOptions) {
			const copyOptionsValidator = new Validator(this.options.copyOptions)

			copyOptionsValidator.field('sourceDir').required().string().field('targetDir').required().string().field('overwrite').boolean().default(true).field('recursive').boolean().default(true).validate()
		}
	}

	protected getPluginName(): string {
		return 'inject-ico'
	}

	/**
	 * 转换 HTML 入口文件的钩子函数
	 *
	 * @param html - 原始的 HTML 内容
	 * @returns 经过修改后的 HTML 内容，在 `</head>` 标签前注入图标链接
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

	private async copyFiles(): Promise<void> {
		// 如果禁用了插件，跳过执行
		if (!this.options.enabled) {
			this.logger.info('插件已禁用，跳过文件复制')
			return
		}

		const { sourceDir, targetDir, overwrite = true, recursive = true } = this.options.copyOptions

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
			await this.safeExecute(this.copyFiles, '图标文件复制')
		}
	}
}

export function injectIco(options?: string | InjectIcoOptions) {
	return new InjectIcoPlugin(options).toPlugin()
}
