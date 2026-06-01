import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { VersionUpdateCheckerOptions } from './types'
import { generateFullInjectCode, generateMetaTag, validateAll } from './common'
import { injectHeadAndBody } from '@/common/html'

/**
 * 版本更新检查器插件类
 *
 * @class VersionUpdateCheckerPlugin
 * @extends {BasePlugin<VersionUpdateCheckerOptions>}
 * @description 该插件会在构建过程中将版本更新检查代码注入到 HTML 中，
 * 运行时定期检查版本号变更，发现新版本时向用户显示刷新提示。
 */
class VersionUpdateCheckerPlugin extends BasePlugin<VersionUpdateCheckerOptions> {
	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<VersionUpdateCheckerOptions>} 默认配置对象
	 *
	 * @description 默认配置：
	 * - versionSource: 'auto'
	 * - defineName: '__APP_VERSION__'
	 * - checkUrl: '/version.json'
	 * - checkInterval: 300000 (5 分钟)
	 * - checkOnVisibilityChange: true
	 * - enableInDev: false
	 * - promptStyle: 'modal'
	 * - promptMessage: '发现新版本，是否立即刷新获取最新内容？'
	 * - refreshButtonText: '立即刷新'
	 * - dismissButtonText: '稍后再说'
	 */
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

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当配置项不合法时抛出校验错误
	 *
	 * @description 校验规则：
	 * - versionSource: 枚举值 'define' | 'file' | 'auto'
	 * - promptStyle: 枚举值 'modal' | 'banner' | 'toast'
	 * - checkInterval: 数字，最小值 5000
	 * 然后委托 validateAll 执行安全验证
	 */
	protected validateOptions(): void {
		this.validator.field('versionSource').enum(['define', 'file', 'auto']).field('promptStyle').enum(['modal', 'banner', 'toast']).field('checkInterval').number().minValue(5000).validate()

		// 执行安全验证
		validateAll(this.options)
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 'version-update-checker'
	 */
	protected getPluginName(): string {
		return 'version-update-checker'
	}

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @param {Plugin} plugin - Vite 插件对象
	 *
	 * @description 注册 `transformIndexHtml` 钩子：
	 * - 在 `<head>` 中注入 meta 标签标记当前版本
	 * - 在 `<body>` 末尾注入版本检查和更新提示的 JavaScript 代码
	 */
	protected addPluginHooks(plugin: Plugin): void {
		const injectCode = generateFullInjectCode(this.options)
		const metaTag = generateMetaTag(this.options)

		plugin.transformIndexHtml = {
			order: 'post',
			handler: (html: string) => {
				const result = injectHeadAndBody(html, metaTag, injectCode)

				if (result.usedFallback) {
					this.logger.warn('未找到 </body> 或 </html> 标签，版本更新检查代码追加到文件末尾')
				}
				if (result.bodyInjected) {
					this.logger.success('成功注入版本更新检查代码到 HTML 文件')
				}
				return result.html
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
