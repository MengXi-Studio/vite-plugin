import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { VersionUpdateCheckerOptions } from './types'
import { generateFullInjectCode, generateMetaTag, validateAll } from './common'
import { injectBeforeTag } from '@/common'

/**
 * 版本更新检查器插件类
 *
 * @class VersionUpdateCheckerPlugin
 * @extends {BasePlugin<VersionUpdateCheckerOptions>}
 * @description 该插件会在构建过程中将版本更新检查代码注入到 HTML 中，
 * 运行时定期检查版本号变更，发现新版本时向用户显示刷新提示。
 */
class VersionUpdateCheckerPlugin extends BasePlugin<VersionUpdateCheckerOptions> {
	protected getDefaultOptions(): Partial<VersionUpdateCheckerOptions> {
		return {
			versionSource: 'auto',
			defineName: '__APP_VERSION__',
			checkUrl: '/version.json',
			checkInterval: 300000,
			checkOnVisibilityChange: true,
			enableInDev: false,
			promptStyle: 'modal',
			promptMessage: '发现新版本，是否立即刷新获取最新内容？',
			refreshButtonText: '立即刷新',
			dismissButtonText: '稍后再说'
		}
	}

	protected validateOptions(): void {
		this.validator
			.field('versionSource')
			.custom(val => !val || ['define', 'file', 'auto'].includes(val), 'versionSource 必须是 define, file 或 auto')
			.field('promptStyle')
			.custom(val => !val || ['modal', 'banner', 'toast'].includes(val), 'promptStyle 必须是 modal, banner 或 toast')
			.field('checkInterval')
			.custom(val => !val || (typeof val === 'number' && val >= 5000), 'checkInterval 必须是大于等于 5000 的数字（毫秒）')
			.validate()

		// 执行安全验证
		validateAll(this.options)
	}

	protected getPluginName(): string {
		return 'version-update-checker'
	}

	protected addPluginHooks(plugin: Plugin): void {
		const injectCode = generateFullInjectCode(this.options)
		const metaTag = generateMetaTag(this.options)

		plugin.transformIndexHtml = {
			order: 'post',
			handler: (html: string) => {
				let result = html

				// file/auto 模式下，注入 meta 标签到 </head> 前
				if (metaTag) {
					const headResult = injectBeforeTag(result, '</head>', metaTag)
					if (headResult.injected) {
						result = headResult.html
					}
				}

				// 注入到 </body> 前
				const bodyResult = injectBeforeTag(result, '</body>', injectCode)
				if (bodyResult.injected) {
					this.logger.success('成功注入版本更新检查代码到 HTML 文件')
					return bodyResult.html
				}

				// 如果没有 </body>，在 </html> 前注入
				const htmlResult = injectBeforeTag(result, '</html>', injectCode)
				if (htmlResult.injected) {
					this.logger.success('成功注入版本更新检查代码到 HTML 文件')
					return htmlResult.html
				}

				// 如果既没有 </body> 也没有 </html>，追加到末尾
				this.logger.warn('未找到 </body> 或 </html> 标签，版本更新检查代码追加到文件末尾')
				return result + injectCode
			}
		}
	}
}

/**
 * 版本更新检查器插件
 *
 * @param options - 插件配置选项，详见 {@link VersionUpdateCheckerOptions}
 * @returns Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用 — 配合 generateVersion 插件
 * generateVersion({
 *   format: 'datetime',
 *   outputType: 'both',
 *   defineName: '__APP_VERSION__'
 * }),
 * versionUpdateChecker()
 *
 * // 自定义检查间隔和提示样式
 * versionUpdateChecker({
 *   checkInterval: 60000,    // 1 分钟检查一次
 *   promptStyle: 'banner'    // 顶部横幅提示
 * })
 *
 * // 自定义提示消息和回调
 * versionUpdateChecker({
 *   promptMessage: '系统已更新，请刷新页面',
 *   onUpdateAvailable: 'console.log("新版本:", newVersion); return true;',
 *   onRefresh: 'console.log("用户选择刷新");',
 *   onDismiss: 'console.log("用户选择忽略");'
 * })
 *
 * // 开发模式也启用
 * versionUpdateChecker({
 *   enableInDev: true,
 *   checkInterval: 10000
 * })
 *
 * // 自定义 UI 模板
 * versionUpdateChecker({
 *   customPromptTemplate: '<div class="my-update-prompt">{{message}} {{refreshButton}}</div>',
 *   customStyle: '.my-update-prompt { background: #333; color: #fff; }'
 * })
 * ```
 *
 * @remarks
 * 该插件通常与 `generateVersion` 插件配合使用：
 * - `generateVersion` 负责在构建时生成版本号并输出到 `version.json` 文件和全局变量
 * - `versionUpdateChecker` 负责在运行时定期检查版本号变更并提示用户刷新
 *
 * 工作原理：
 * 1. 页面加载时，从全局变量（如 `__APP_VERSION__`）读取当前版本号
 * 2. 定期请求 `version.json` 获取最新版本号
 * 3. 当版本号不一致时，显示更新提示 UI
 * 4. 用户点击"立即刷新"后执行 `location.reload()`
 * 5. 用户点击"稍后再说"后隐藏提示，本次会话不再提醒
 * 6. 页面可见性变化时（如从其他标签页切回）立即检查更新
 */
export const versionUpdateChecker = createPluginFactory(VersionUpdateCheckerPlugin)
export * from './types'
