import type { HtmlInjectResult, DualInjectResult } from './type'

export type { HtmlInjectResult, DualInjectResult, InjectPosition, SelectorMatch, ConditionType, InjectCondition, PositionInjectResult, SecurityConfig } from './type'
export { findSelectorMatch, applyTemplateVars, evaluateCondition, sortRulesByPriority, injectAtPosition } from './inject'
export { DEFAULT_BLOCKED_TAGS, DEFAULT_BLOCKED_ATTRIBUTES, validateSecurityConfig, sanitizeContent } from './security'
export type { SanitizeRuleOptions } from './security'

/**
 * 在 HTML 中指定闭合标签前注入代码
 *
 * @param html - 原始 HTML 内容
 * @param tag - 目标闭合标签（如 `</head>`、`</body>`、`</html>`）
 * @param code - 要注入的代码
 * @returns 注入结果对象
 *
 * @example
 * ```typescript
 * // 在 </head> 前注入 CSS
 * const result = injectBeforeTag(html, '</head>', '<style>...</style>')
 *
 * // 在 </body> 前注入 JS
 * const result = injectBeforeTag(html, '</body>', '<script>...</script>')
 * ```
 */
export function injectBeforeTag(html: string, tag: string, code: string): HtmlInjectResult {
	const regex = new RegExp(tag, 'i')
	if (!regex.test(html)) {
		return { html, injected: false }
	}

	const result = html.replace(regex, `${code}\n${tag}`)
	return { html: result, injected: true }
}

/**
 * 按优先级向 HTML 中注入代码
 *
 * @description 依次尝试在 `</head>`、`</body>`、`</html>` 前注入代码，
 * 优先注入到靠前的标签位置。适用于需要注入到页面中但无特定位置要求的场景
 *
 * @param html - 原始 HTML 内容
 * @param code - 要注入的代码
 * @param targets - 目标标签优先级列表，默认为 `['</head>', '</body>', '</html>']`
 * @returns 注入结果对象
 *
 * @example
 * ```typescript
 * // 优先注入到 </body> 前
 * const result = injectHtmlByPriority(html, scriptCode, ['</body>', '</html>'])
 * ```
 */
export function injectHtmlByPriority(html: string, code: string, targets: string[] = ['</head>', '</body>', '</html>']): HtmlInjectResult {
	for (const tag of targets) {
		const result = injectBeforeTag(html, tag, code)
		if (result.injected) {
			return result
		}
	}

	// 所有标签均未找到，追加到末尾
	return { html: html + code, injected: true }
}

/**
 * 带回退策略的 HTML 注入
 *
 * @description 依次尝试在 `</body>`、`</html>` 前注入代码，
 * 如果均未找到目标标签，则将代码追加到 HTML 末尾。
 * 适用于需要注入到页面底部但不确定 HTML 结构是否完整的场景。
 *
 * @param html - 原始 HTML 内容
 * @param code - 要注入的代码
 * @param fallbackMessage - 回退到末尾时的警告信息，为空则不输出警告
 * @returns 注入结果对象，包含注入后的 HTML、是否成功标志和是否使用了回退策略
 *
 * @example
 * ```typescript
 * // 注入 JS 脚本到页面底部
 * const result = injectBeforeTagWithFallback(html, '<script>...</script>')
 *
 * // 带自定义警告信息
 * const result = injectBeforeTagWithFallback(html, scriptCode, '未找到 </body> 标签，代码追加到文件末尾')
 * ```
 */
export function injectBeforeTagWithFallback(html: string, code: string, _fallbackMessage?: string): HtmlInjectResult & { usedFallback: boolean } {
	const bodyResult = injectBeforeTag(html, '</body>', code)
	if (bodyResult.injected) {
		return { ...bodyResult, usedFallback: false }
	}

	const htmlResult = injectBeforeTag(html, '</html>', code)
	if (htmlResult.injected) {
		return { ...htmlResult, usedFallback: false }
	}

	return { html: html + code, injected: true, usedFallback: true }
}

/**
 * 双区域 HTML 注入（head + body）
 *
 * @description 将代码分别注入到 HTML 的 `</head>` 前和 `</body>` 前（带回退策略）。
 * 这是插件中常见的注入模式：CSS/HTML 注入到 head，JS 注入到 body。
 *
 * @param html - 原始 HTML 内容
 * @param headCode - 注入到 `</head>` 前的代码（如 CSS、meta 标签），不提供则跳过 head 注入
 * @param bodyCode - 注入到 `</body>` 前的代码（如 JS 脚本），回退到 `</html>` 前或末尾
 * @returns 双区域注入结果对象
 *
 * @example
 * ```typescript
 * // CSS 注入到 head，JS 注入到 body
 * const result = injectHeadAndBody(html, '<style>...</style>', '<script>...</script>')
 * if (!result.headInjected) logger.warn('未找到 </head> 标签')
 * if (result.usedFallback) logger.warn('代码追加到文件末尾')
 *
 * // 仅注入到 body
 * const result = injectHeadAndBody(html, undefined, '<script>...</script>')
 * ```
 */
export function injectHeadAndBody(html: string, headCode: string | undefined, bodyCode: string): DualInjectResult {
	let result = html
	let headInjected = false

	if (headCode) {
		const headResult = injectBeforeTag(result, '</head>', headCode)
		if (headResult.injected) {
			result = headResult.html
			headInjected = true
		}
	}

	const bodyResult = injectBeforeTagWithFallback(result, bodyCode)

	return {
		html: bodyResult.html,
		headInjected,
		bodyInjected: bodyResult.injected,
		usedFallback: bodyResult.usedFallback
	}
}
