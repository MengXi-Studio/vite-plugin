import type { HtmlInjectResult, DualInjectResult } from './type'

export type { HtmlInjectResult, DualInjectResult, InjectPosition, SelectorMatch, ConditionType, InjectCondition, SecurityConfig } from './type'
export { sanitizeContent } from './security'
export type { SanitizeRuleOptions } from './security'

/**
 * 在 HTML 中指定闭合标签前注入代码
 *
 * @param html - 原始 HTML 内容
 * @param tag - 目标闭合标签（如 `</head>`、`</body>`、`</html>`）
 * @param code - 要注入的代码
 * @returns 注入结果对象
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
 * 带回退策略的 HTML 注入
 */
function injectBeforeTagWithFallback(html: string, code: string, _fallbackMessage?: string): HtmlInjectResult & { usedFallback: boolean } {
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
