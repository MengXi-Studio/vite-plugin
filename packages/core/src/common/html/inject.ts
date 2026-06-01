/**
 * HTML 注入工具模块
 *
 * @module common/html/inject
 * @description 提供高级 HTML 内容注入功能，包括选择器匹配、模板变量替换、
 * 条件判断、规则排序和多位置注入等能力，为插件提供灵活的 HTML 操作支持。
 */

import type { InjectPosition, SelectorMatch, InjectCondition, PositionInjectResult } from './type'

/**
 * 在 HTML 中查找选择器匹配位置
 *
 * @param html - 要搜索的 HTML 字符串
 * @param selector - 选择器字符串（普通字符串或正则表达式字符串）
 * @param selectorMatch - 匹配模式，`'string'` 为精确字符串匹配，`'regex'` 为正则匹配
 * @returns 匹配结果对象（包含 `index` 和 `length`），未匹配时返回 `null`
 *
 * @description 根据匹配模式在 HTML 中查找选择器的位置：
 * - 字符串模式：使用 `indexOf` 进行精确匹配
 * - 正则模式：使用 `RegExp` 进行正则匹配，正则语法错误时返回 `null`
 *
 * @example
 * ```typescript
 * // 字符串匹配
 * findSelectorMatch('<div id="app">content</div>', '<div id="app">')
 * // { index: 0, length: 14 }
 *
 * // 正则匹配
 * findSelectorMatch('<div class="foo">bar</div>', 'class="\\w+"', 'regex')
 * // { index: 5, length: 12 }
 *
 * // 未匹配
 * findSelectorMatch('<div>hello</div>', '<span>')
 * // null
 * ```
 */
export function findSelectorMatch(html: string, selector: string, selectorMatch?: SelectorMatch): { index: number; length: number } | null {
	if (selectorMatch === 'regex') {
		try {
			const regex = new RegExp(selector)
			const match = html.match(regex)
			if (match && match.index !== undefined) {
				return { index: match.index, length: match[0].length }
			}
		} catch {
			return null
		}
		return null
	}
	const idx = html.indexOf(selector)
	if (idx === -1) return null
	return { index: idx, length: selector.length }
}

/**
 * 替换模板字符串中的变量占位符
 *
 * @param content - 包含 `{{变量名}}` 占位符的模板字符串
 * @param ruleVars - 规则级变量映射（优先级高于全局变量）
 * @param globalVars - 全局变量映射
 * @returns 替换所有匹配占位符后的字符串
 *
 * @description 将模板字符串中形如 `{{key}}` 的占位符替换为对应的值。
 * 规则变量（`ruleVars`）优先级高于全局变量（`globalVars`），
 * 当两者存在相同键时，规则变量的值会覆盖全局变量的值。
 * 变量名中的正则特殊字符会被自动转义，替换值中的 `$` 也会被安全处理。
 *
 * @example
 * ```typescript
 * // 基本替换
 * applyTemplateVars('<div>{{name}}</div>', { name: 'test' })
 * // '<div>test</div>'
 *
 * // 规则变量覆盖全局变量
 * applyTemplateVars('{{a}}-{{b}}', { a: '1' }, { a: '0', b: '2' })
 * // '1-2'
 *
 * // 无匹配占位符
 * applyTemplateVars('no vars', { x: 'y' })
 * // 'no vars'
 * ```
 */
export function applyTemplateVars(content: string, ruleVars?: Record<string, string>, globalVars?: Record<string, string>): string {
	let result = content
	const mergedVars: Record<string, string> = { ...globalVars, ...ruleVars }
	for (const [key, value] of Object.entries(mergedVars)) {
		const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const escapedValue = value.replace(/\$/g, '$$$$')
		result = result.replace(new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g'), escapedValue)
	}
	return result
}

/**
 * 评估注入条件是否满足
 *
 * @param condition - 注入条件配置
 * @param html - 当前 HTML 内容（用于 `file-contains` 类型判断）
 * @returns 条件是否满足（布尔值）
 *
 * @description 根据条件类型评估注入条件：
 * - `env`：检查环境变量是否存在且不为 `'false'` 或 `'0'`
 * - `file-contains`：检查 HTML 内容是否包含指定字符串
 * - `custom`：执行自定义函数，捕获异常时返回 `false`
 * - 支持通过 `negate` 字段对结果取反
 *
 * @example
 * ```typescript
 * // 环境变量判断
 * evaluateCondition({ type: 'env', value: 'ENABLE_ANALYTICS' }, '')
 *
 * // 内容包含判断
 * evaluateCondition({ type: 'file-contains', value: '<div id="app">' }, html)
 *
 * // 自定义函数（带取反）
 * evaluateCondition(
 *   { type: 'custom', value: () => isDev(), negate: true },
 *   html
 * )
 * ```
 */
export function evaluateCondition(condition: InjectCondition, html: string): boolean {
	let result = false

	switch (condition.type) {
		case 'env': {
			const envVarName = condition.value as string
			const envValue = process.env[envVarName]
			result = !!envValue && envValue !== 'false' && envValue !== '0'
			break
		}
		case 'file-contains': {
			const searchString = condition.value as string
			result = html.includes(searchString)
			break
		}
		case 'custom': {
			const customFn = condition.value as (...args: any[]) => boolean
			try {
				result = !!customFn()
			} catch {
				result = false
			}
			break
		}
	}

	return condition.negate ? !result : result
}

/**
 * 按优先级排序规则列表
 *
 * @typeParam T - 规则类型，必须包含可选的 `priority` 字段
 * @param rules - 待排序的规则数组
 * @returns 按 `priority` 升序排列的新数组（不修改原数组）
 *
 * @description 将规则按 `priority` 字段升序排列，`priority` 越小优先级越高。
 * 未指定 `priority` 的规则默认优先级为 100。
 * 返回新数组，不修改原数组。
 *
 * @example
 * ```typescript
 * const rules = [
 *   { priority: 30, name: 'C' },
 *   { priority: 10, name: 'A' },
 *   { name: 'D' },           // 默认 priority=100
 *   { priority: 20, name: 'B' }
 * ]
 * sortRulesByPriority(rules)
 * // [{ priority: 10, name: 'A' }, { priority: 20, name: 'B' },
 * //  { priority: 30, name: 'C' }, { name: 'D' }]
 * ```
 */
export function sortRulesByPriority<T extends { priority?: number }>(rules: T[]): T[] {
	return [...rules].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

/**
 * 在 HTML 的指定位置注入内容
 *
 * @param html - 原始 HTML 字符串
 * @param content - 要注入的内容
 * @param position - 注入位置
 * @param selector - 选择器字符串（仅 `before-selector`、`after-selector`、`replace-selector` 位置需要）
 * @param selectorMatch - 选择器匹配模式（默认为字符串匹配）
 * @returns 注入结果对象，包含注入后的 HTML、是否成功标志和失败原因
 *
 * @description 根据 `position` 参数将内容注入到 HTML 的指定位置：
 * - `head-start`：在 `<head>` 标签开始后注入
 * - `head-end`：在 `</head>` 标签前注入
 * - `body-start`：在 `<body>` 标签开始后注入
 * - `body-end`：在 `</body>` 标签前注入
 * - `before-selector`：在选择器匹配位置前注入
 * - `after-selector`：在选择器匹配位置后注入
 * - `replace-selector`：替换选择器匹配的内容
 *
 * 当目标标签或选择器未找到时，返回 `injected: false` 并附带 `reason` 说明。
 *
 * @example
 * ```typescript
 * const html = '<html><head><title>Test</title></head><body><div id="app"></div></body></html>'
 *
 * // 在 head 开始后注入 meta 标签
 * injectAtPosition(html, '<meta charset="utf-8">', 'head-start')
 *
 * // 在 body 结束前注入脚本
 * injectAtPosition(html, '<script>app()</script>', 'body-end')
 *
 * // 在指定元素前注入
 * injectAtPosition(html, '<nav>menu</nav>', 'before-selector', '<div id="app">')
 *
 * // 替换指定元素
 * injectAtPosition(html, '<div id="root"></div>', 'replace-selector', '<div id="app">')
 * ```
 */
export function injectAtPosition(html: string, content: string, position: InjectPosition, selector?: string, selectorMatch?: SelectorMatch): PositionInjectResult {
	switch (position) {
		case 'head-start': {
			const headMatch = html.match(/<head\b[^>]*>/i)
			if (!headMatch) {
				return { html, injected: false, reason: '未找到 <head> 标签' }
			}
			const idx = (headMatch.index ?? 0) + headMatch[0].length
			return { html: html.slice(0, idx) + '\n' + content + html.slice(idx), injected: true }
		}
		case 'head-end': {
			const headCloseMatch = html.match(/<\/head\s*>/i)
			if (!headCloseMatch) {
				return { html, injected: false, reason: '未找到 </head> 标签' }
			}
			const headCloseIdx = headCloseMatch.index!
			return { html: html.slice(0, headCloseIdx) + content + '\n' + html.slice(headCloseIdx), injected: true }
		}
		case 'body-start': {
			const bodyMatch = html.match(/<body\b[^>]*>/i)
			if (!bodyMatch) {
				return { html, injected: false, reason: '未找到 <body> 标签' }
			}
			const idx = (bodyMatch.index ?? 0) + bodyMatch[0].length
			return { html: html.slice(0, idx) + '\n' + content + html.slice(idx), injected: true }
		}
		case 'body-end': {
			const bodyCloseMatch = html.match(/<\/body\s*>/i)
			if (!bodyCloseMatch) {
				return { html, injected: false, reason: '未找到 </body> 标签' }
			}
			const bodyCloseIdx = bodyCloseMatch.index!
			return { html: html.slice(0, bodyCloseIdx) + content + '\n' + html.slice(bodyCloseIdx), injected: true }
		}
		case 'before-selector': {
			if (!selector) {
				return { html, injected: false, reason: 'before-selector 需要 selector 参数' }
			}
			const match = findSelectorMatch(html, selector, selectorMatch)
			if (!match) {
				return { html, injected: false, reason: `未找到选择器 "${selector}"` }
			}
			return { html: html.slice(0, match.index) + content + '\n' + html.slice(match.index), injected: true }
		}
		case 'after-selector': {
			if (!selector) {
				return { html, injected: false, reason: 'after-selector 需要 selector 参数' }
			}
			const match = findSelectorMatch(html, selector, selectorMatch)
			if (!match) {
				return { html, injected: false, reason: `未找到选择器 "${selector}"` }
			}
			const endIdx = match.index + match.length
			return { html: html.slice(0, endIdx) + '\n' + content + html.slice(endIdx), injected: true }
		}
		case 'replace-selector': {
			if (!selector) {
				return { html, injected: false, reason: 'replace-selector 需要 selector 参数' }
			}
			const match = findSelectorMatch(html, selector, selectorMatch)
			if (!match) {
				return { html, injected: false, reason: `未找到选择器 "${selector}"` }
			}
			const endIdx = match.index + match.length
			return { html: html.slice(0, match.index) + content + html.slice(endIdx), injected: true }
		}
		default:
			return { html, injected: false, reason: `不支持的注入位置: ${position}` }
	}
}
