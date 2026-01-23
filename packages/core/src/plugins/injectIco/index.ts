import type { Plugin } from 'vite'
import type { InjectIcoOptions } from './type'
import { BasePlugin } from '@/base/plugin'
import { generateIconTags } from './common'
import { checkSourceExists, copySourceToTarget } from '@/common'

/**
 * 注入网站图标链接到 HTML 文件的头部
 *
 * @example
 * ```typescript
 * // 基本使用
 * injectIco({ base: '/assets' })
 *
 * // 自定义图标
 * injectIco({
 *   icons: [
 *     { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
 *     { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
 *     { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
 *   ]
 * })
 *
 * // 带文件复制功能（适用于 uni-app 等框架）
 * injectIco({
 *   base: '/assets',
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 *
 * // 带完整复制配置的使用
 * injectIco({
 *   base: '/assets',
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons',
 *     overwrite: false,
 *     recursive: true
 *   }
 * })
 *
 * // 关闭日志输出
 * injectIco({
 *   base: '/assets',
 *   verbose: false,
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 *
 * // 根据环境启用
 * injectIco({
 *   base: '/assets',
 *   enabled: process.env.NODE_ENV === 'production',
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 *
 * // 禁用插件
 * injectIco({
 *   base: '/assets',
 *   enabled: false,
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 * ```
 */
class InjectIcoPlugin extends BasePlugin<InjectIcoOptions> {
	constructor(options: InjectIcoOptions | string | undefined) {
		// 标准化选项
		const normalizedOptions: InjectIcoOptions = typeof options === 'string' ? { base: options } : options || {}
		super(normalizedOptions)
	}

	protected getPluginName(): string {
		return 'inject-ico'
	}

	protected addPluginHooks(plugin: Plugin): void {
		// 绑定transformIndexHtml钩子
		plugin.transformIndexHtml = (html: string) => {
			// 如果禁用了插件，跳过执行
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

		// 绑定writeBundle钩子
		plugin.writeBundle = async () => {
			// 如果禁用了插件，跳过执行
			if (!this.options.enabled) {
				this.logger.info('插件已禁用，跳过文件复制')
				return
			}

			// 检查是否配置了文件复制相关选项
			const { copyOptions } = this.options

			// 没有配置复制选项，跳过复制操作
			if (!copyOptions) return

			try {
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
			} catch (error) {
				this.handleError(error, '图标文件复制失败')
			}
		}
	}
}

/**
 * 创建注入网站图标插件
 * @param options 插件配置
 * @returns Vite 插件实例
 */
export function injectIco(options?: InjectIcoOptions | string) {
	return new InjectIcoPlugin(options).toPlugin()
}
