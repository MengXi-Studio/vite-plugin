import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { InjectLoadingOptions } from './types'
import {
	generateCSS,
	generateHTMLTemplate,
	generateLoadingManagerCode,
	validateStyle,
	validateNestedConfig,
	validateTransition,
	validateCallbacks,
	validateCustomTemplate,
	validateDefaultText,
	validateGlobalName,
	validateAutoHideOn
} from './common'

/**
 * 注入全局 Loading 状态管理插件类
 *
 * @class InjectLoadingPlugin
 * @extends {BasePlugin<InjectLoadingOptions>}
 * @description 该插件在构建过程中将全局 Loading 状态管理代码注入到应用中，
 * 提供创建、显示、隐藏和销毁 loading 的方法，支持跨组件共享 loading 状态，
 * 并可自动拦截 fetch/XHR 请求实现 loading 的自动管理。
 */
class InjectLoadingPlugin extends BasePlugin<InjectLoadingOptions> {
	/**
	 * 获取插件默认配置
	 *
	 * @remarks 返回所有配置项的默认值，包括位置、文本、图标类型、样式、
	 * 过渡动画、最小显示时间、延迟显示、防抖隐藏、自动绑定等
	 *
	 * @returns 包含所有默认配置的 {@link InjectLoadingOptions} 部分对象
	 *
	 * @override
	 */
	protected getDefaultOptions(): Partial<InjectLoadingOptions> {
		return {
			position: 'center',
			defaultText: '加载中...',
			spinnerType: 'spinner',
			autoBind: 'none',
			globalName: '__LOADING_MANAGER__',
			defaultVisible: false,
			autoHideOn: 'DOMContentLoaded',
			style: {
				overlayColor: 'rgba(255, 255, 255, 0.7)',
				spinnerColor: '#4361ee',
				spinnerSize: '40px',
				textColor: '#333',
				textSize: '14px',
				zIndex: 9999,
				pointerEvents: true,
				backdropBlur: false,
				backdropBlurAmount: 4
			},
			transition: {
				enabled: true,
				duration: 200,
				easing: 'ease-out'
			},
			minDisplayTime: {
				enabled: true,
				duration: 300
			},
			delayShow: {
				enabled: true,
				duration: 200
			},
			debounceHide: {
				enabled: false,
				duration: 100
			}
		}
	}

	/**
	 * 验证插件配置选项的合法性
	 *
	 * @remarks 依次验证以下配置项：
	 * - `position` — 必须为 `'center'` | `'top'` | `'bottom'`
	 * - `defaultText` — 必须为字符串
	 * - `spinnerType` — 必须为 `'spinner'` | `'dots'` | `'pulse'` | `'bar'`
	 * - `autoBind` — 必须为 `'fetch'` | `'xhr'` | `'all'` | `'none'`
	 * - `globalName` — 必须为字符串
	 * - `customTemplate` — 必须为字符串
	 * - `defaultVisible` — 必须为布尔值
	 * - `autoHideOn` — 必须为 `'DOMContentLoaded'` | `'load'` | `'manual'`
	 * - `style` — 通过 {@link validateStyle} 验证
	 * - `minDisplayTime` / `delayShow` / `debounceHide` — 通过 {@link validateNestedConfig} 验证
	 * - `transition` — 通过 {@link validateTransition} 验证
	 * - `callbacks` — 通过 {@link validateCallbacks} 验证
	 *
	 * @throws 当配置项不合法时抛出描述性错误
	 *
	 * @override
	 */
	protected validateOptions(): void {
		this.validator
			.field('position')
			.custom(val => !val || ['center', 'top', 'bottom'].includes(val), 'position 必须是 center, top 或 bottom')
			.field('defaultText')
			.string()
			.field('spinnerType')
			.custom(val => !val || ['spinner', 'dots', 'pulse', 'bar'].includes(val), 'spinnerType 必须是 spinner, dots, pulse 或 bar')
			.field('autoBind')
			.custom(val => !val || ['fetch', 'xhr', 'all', 'none'].includes(val), 'autoBind 必须是 fetch, xhr, all 或 none')
			.field('globalName')
			.string()
			.field('customTemplate')
			.string()
			.field('defaultVisible')
			.boolean()
			.field('autoHideOn')
			.custom(val => !val || ['DOMContentLoaded', 'load', 'manual'].includes(val), 'autoHideOn 必须是 DOMContentLoaded, load 或 manual')
			.validate()

		validateCustomTemplate(this.options.customTemplate)
		const textWarning = validateDefaultText(this.options.defaultText)
		if (textWarning) this.logger.warn(textWarning)
		validateGlobalName(this.options.globalName)
		validateStyle(this.options.style)
		validateNestedConfig(this.options.minDisplayTime, 'minDisplayTime.duration 必须是非负数')
		validateNestedConfig(this.options.delayShow, 'delayShow.duration 必须是非负数')
		validateNestedConfig(this.options.debounceHide, 'debounceHide.duration 必须是非负数')
		validateTransition(this.options.transition)
		validateCallbacks(this.options.callbacks)
		const autoHideWarning = validateAutoHideOn(this.options.defaultVisible, this.options.autoHideOn)
		if (autoHideWarning) this.logger.warn(autoHideWarning)
	}

	/**
	 * 获取插件名称
	 *
	 * @returns 插件名称字符串 `'inject-loading'`
	 *
	 * @override
	 */
	protected getPluginName(): string {
		return 'inject-loading'
	}

	/**
	 * 生成 Loading 管理器 JavaScript 代码
	 *
	 * @remarks 委托给 {@link generateLoadingManagerCode} 生成完整的 IIFE 代码
	 *
	 * @param options - 插件配置选项
	 * @returns 完整的 JavaScript IIFE 代码字符串
	 */
	private generateLoadingManager(options: InjectLoadingOptions): string {
		return generateLoadingManagerCode(options)
	}

	/**
	 * 生成注入到 `</head>` 前的代码（CSS + HTML 静态标签）
	 *
	 * @remarks 当 {@link InjectLoadingOptions.defaultVisible} 为 `true` 时调用，
	 * CSS 和 HTML 以静态标签形式直接注入到 `<head>` 中，
	 * 确保 HTML 解析到 `<head>` 时 loading 即可见，无需等待 JS 执行
	 *
	 * @returns 包含 CSS 样式和 HTML 结构的注入代码字符串
	 */
	private generateHeadInjectCode(): string {
		const { css, html } = this.getCachedAssets()

		return `<!-- inject-loading: head start -->
<style data-loading-style data-loading-id="${this.options.globalName || '__LOADING_MANAGER__'}">${css}</style>
${html}
<!-- inject-loading: head end -->`
	}

	/**
	 * 生成注入到 `</body>` 前的代码（JS 管理器 + 动态注入逻辑）
	 *
	 * @remarks 根据是否已在 `<head>` 中注入 CSS+HTML，生成不同的注入策略：
	 * - **headInjected 为 true**：仅注入 JS 管理器代码（CSS/HTML 已在 head 中）
	 * - **headInjected 为 false**：生成完整的 JS 代码，动态创建 CSS 和 HTML 元素并注入到 DOM
	 *
	 * @param headInjected - 是否已在 `<head>` 中注入了 CSS+HTML
	 * @returns 注入到 `</body>` 前的代码字符串
	 */
	private generateBodyInjectCode(headInjected: boolean): string {
		const js = this.generateLoadingManager(this.options)

		if (headInjected) {
			return `<!-- inject-loading: body start -->
<script>${js}</script>
<!-- inject-loading: body end -->`
		}

		const { css, html } = this.getCachedAssets()
		return `<!-- inject-loading: start -->
<script>
(function() {
  // SSR 环境检测
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 注入 CSS
  var style = document.createElement('style');
  style.setAttribute('data-loading-style', '');
  style.setAttribute('data-loading-id', '${this.options.globalName || '__LOADING_MANAGER__'}');
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);

  // 注入 HTML（等待 body 可用时执行）
  function injectHTML() {
    var div = document.createElement('div');
    div.innerHTML = ${JSON.stringify(html)};
    while (div.firstChild) {
      document.body.appendChild(div.firstChild);
    }
  }

  if (document.body) {
    injectHTML();
  } else {
    document.addEventListener('DOMContentLoaded', injectHTML);
  }
})();
${js}
</script>
<!-- inject-loading: end -->`
	}

	/** 缓存的 CSS/HTML 资源 */
	private _cachedAssets: { css: string; html: string } | null = null

	/**
	 * 获取缓存的 CSS 和 HTML 资源，避免重复生成
	 *
	 * @remarks 在同一次构建中，CSS 和 HTML 只生成一次并缓存，
	 * 供 {@link generateHeadInjectCode} 和 {@link generateBodyInjectCode} 共享
	 */
	private getCachedAssets(): { css: string; html: string } {
		if (!this._cachedAssets) {
			const style = this.options.style || {}
			const spinnerType = this.options.spinnerType || 'spinner'
			const transition = this.options.transition
			this._cachedAssets = {
				css: generateCSS(style, spinnerType, transition),
				html: generateHTMLTemplate(this.options)
			}
		}
		return this._cachedAssets
	}

	/**
	 * 注册插件钩子
	 *
	 * @remarks 通过 `transformIndexHtml` 钩子将 loading 代码注入到 HTML 文件中。
	 * 注入策略取决于 {@link InjectLoadingOptions.defaultVisible}：
	 * - **defaultVisible 为 true**：CSS+HTML 注入到 `</head>` 前（白屏即可见），JS 注入到 `</body>` 前
	 * - **defaultVisible 为 false**：所有代码（CSS+HTML+JS）通过 JS 动态注入到 `</body>` 前
	 *
	 * 注入位置优先级：`</body>` > `</html>` > 文件末尾
	 *
	 * @param plugin - 需要注册钩子的 Vite 插件实例
	 *
	 * @override
	 */
	protected addPluginHooks(plugin: Plugin): void {
		const defaultVisible = this.options.defaultVisible || false
		const headCode = defaultVisible ? this.generateHeadInjectCode() : ''
		const bodyCode = this.generateBodyInjectCode(defaultVisible)

		plugin.transformIndexHtml = {
			order: 'post',
			handler: (html: string) => {
				let result = html

				// 当 defaultVisible 为 true 时，将 CSS+HTML 注入到 </head> 前
				if (headCode) {
					const headCloseRegex = /<\/head>/i
					if (headCloseRegex.test(result)) {
						result = result.replace(headCloseRegex, `${headCode}\n</head>`)
					} else {
						// 无 </head> 标签，回退到 body 注入
						this.logger.warn('未找到 </head> 标签，defaultVisible 的白屏 loading 将无法生效')
					}
				}

				// JS 管理器注入到 </body> 前
				const bodyCloseRegex = /<\/body>/i
				if (bodyCloseRegex.test(result)) {
					result = result.replace(bodyCloseRegex, `${bodyCode}\n</body>`)
					this.logger.success('成功注入全局 Loading 状态管理代码到 HTML 文件')
					return result
				}

				// 如果没有 </body>，在 </html> 前注入
				const htmlCloseRegex = /<\/html>/i
				if (htmlCloseRegex.test(result)) {
					result = result.replace(htmlCloseRegex, `${bodyCode}\n</html>`)
					this.logger.success('成功注入全局 Loading 状态管理代码到 HTML 文件')
					return result
				}

				// 如果既没有 </body> 也没有 </html>，追加到末尾
				this.logger.warn('未找到 </body> 或 </html> 标签，Loading 代码追加到文件末尾')
				return result + bodyCode
			}
		}
	}
}

/**
 * 注入全局 Loading 状态管理插件
 *
 * @param options - 插件配置选项，详见 {@link InjectLoadingOptions}
 * @returns Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * injectLoading()
 *
 * // 自定义位置和文本
 * injectLoading({
 *   position: 'top',
 *   defaultText: '请稍候...'
 * })
 *
 * // 使用不同类型的加载图标
 * injectLoading({
 *   spinnerType: 'dots',  // spinner | dots | pulse | bar
 * })
 *
 * // 自动拦截 fetch 请求
 * injectLoading({
 *   autoBind: 'fetch',
 *   requestFilter: {
 *     excludeUrls: [/\/api\/health/],
 *     excludeUrlPrefixes: ['http://localhost']
 *   }
 * })
 *
 * // 自定义样式（含模糊背景）
 * injectLoading({
 *   style: {
 *     overlayColor: 'rgba(0, 0, 0, 0.5)',
 *     spinnerColor: '#ff6b6b',
 *     spinnerSize: '50px',
 *     backdropBlur: true,
 *     backdropBlurAmount: 6
 *   }
 * })
 *
 * // 自定义过渡动画
 * injectLoading({
 *   transition: {
 *     enabled: true,
 *     duration: 300,
 *     easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
 *   }
 * })
 *
 * // 防抖隐藏（避免快速闪烁）
 * injectLoading({
 *   debounceHide: {
 *     enabled: true,
 *     duration: 100
 *   }
 * })
 *
 * // 生命周期回调
 * injectLoading({
 *   callbacks: {
 *     onShow: 'console.log("loading shown")',
 *     onBeforeShow: 'return true',  // 返回 false 可阻止显示
 *     onHide: 'console.log("loading hidden")'
 *   }
 * })
 *
 * // 自定义模板
 * injectLoading({
 *   customTemplate: '<div class="my-loader"><span data-loading-text></span></div>'
 * })
 *
 * // 白屏阶段即显示 loading，DOMContentLoaded 后自动隐藏
 * injectLoading({
 *   defaultVisible: true,
 *   autoHideOn: 'DOMContentLoaded'
 * })
 *
 * // 白屏阶段即显示 loading，所有资源加载完成后自动隐藏
 * injectLoading({
 *   defaultVisible: true,
 *   autoHideOn: 'load'
 * })
 *
 * // Vue/React SPA：白屏阶段即显示，框架渲染完成后手动隐藏
 * injectLoading({
 *   defaultVisible: true,
 *   autoHideOn: 'manual'
 * })
 * // 在应用入口处手动隐藏：
 * // window.__LOADING_MANAGER__.hide()
 * ```
 *
 * @remarks
 * 该插件在 HTML 中注入全局 Loading 状态管理代码，提供以下能力：
 * - 全局 loading 的创建、显示、隐藏和销毁
 * - 跨组件/页面共享 loading 状态
 * - 多种内置加载图标（spinner / dots / pulse / bar）
 * - 自定义样式、文本和显示位置
 * - 过渡动画配置（淡入淡出）
 * - 自动拦截 fetch/XHR 请求实现 loading 自动管理
 * - 延迟显示和最小显示时间机制
 * - 防抖隐藏避免闪烁
 * - 请求过滤（排除/包含特定 URL、前缀匹配、方法过滤）
 * - 生命周期回调（onBeforeShow / onShow / onBeforeHide / onHide / onDestroy）
 * - 背景模糊效果（backdrop-filter）
 * - 销毁时自动恢复原始 fetch/XHR
 * - SSR 环境安全检测
 * - 白屏阶段即显示 loading（defaultVisible + autoHideOn）
 *
 * 运行时 API：
 * ```typescript
 * // 显示 loading
 * window.__LOADING_MANAGER__.show('加载中...')
 *
 * // 隐藏 loading
 * window.__LOADING_MANAGER__.hide()
 *
 * // 强制隐藏（忽略最小显示时间）
 * window.__LOADING_MANAGER__.forceHide()
 *
 * // 更新文本
 * window.__LOADING_MANAGER__.updateText('正在处理...')
 *
 * // 检查状态
 * window.__LOADING_MANAGER__.isVisible()
 *
 * // 获取挂起请求数
 * window.__LOADING_MANAGER__.getPendingCount()
 *
 * // 销毁（恢复原始 fetch/XHR）
 * window.__LOADING_MANAGER__.destroy()
 * ```
 */
export const injectLoading = createPluginFactory(InjectLoadingPlugin)
export * from './types'
