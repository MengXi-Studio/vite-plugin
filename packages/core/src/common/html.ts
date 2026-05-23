/**
 * HTML 注入结果
 */
export interface HtmlInjectResult {
	/** 注入后的 HTML 内容 */
	html: string
	/** 是否成功注入 */
	injected: boolean
}

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
