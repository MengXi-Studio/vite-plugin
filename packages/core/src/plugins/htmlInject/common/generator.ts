import type { InjectRule, InjectCondition, InjectionLogEntry, SecurityConfig, SelectorMatch } from '../types'
import { sanitizeContent } from './validators'

/**
 * 在 HTML 中查找选择器匹配位置
 *
 * @param html - 要搜索的 HTML 内容
 * @param selector - 选择器字符串或正则表达式模式
 * @param selectorMatch - 匹配模式，'string' 为精确匹配，'regex' 为正则匹配
 * @returns 匹配结果对象，包含 index（起始位置）和 length（匹配长度）；未匹配时返回 null
 */
function findSelectorMatch(html: string, selector: string, selectorMatch?: SelectorMatch): { index: number; length: number } | null {
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
 * 应用模板变量替换
 *
 * @description 将内容中的 `{{变量名}}` 占位符替换为对应的变量值。
 * 规则级变量（ruleVars）优先级高于全局变量（globalVars）。
 * 变量名中的正则特殊字符会被自动转义，变量值中的 `$` 字符也会被正确处理。
 *
 * @param content - 包含模板占位符的原始内容
 * @param ruleVars - 规则级模板变量，优先级高于 globalVars
 * @param globalVars - 全局模板变量
 * @returns 替换变量后的内容
 *
 * @example
 * ```ts
 * applyTemplateVars('<div>{{name}}</div>', { name: 'test' })
 * // => '<div>test</div>'
 *
 * applyTemplateVars('{{a}}-{{b}}', { a: '1' }, { a: '0', b: '2' })
 * // => '1-2'（局部变量覆盖全局变量）
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
 * @description 根据条件类型判断是否应执行注入：
 * - 'env': 检查环境变量是否存在且不为 'false' 或 '0'
 * - 'file-contains': 检查 HTML 内容是否包含指定字符串
 * - 'custom': 执行自定义函数，函数抛出异常时视为不满足
 *
 * @param condition - 注入条件对象
 * @param html - 当前 HTML 内容，用于 'file-contains' 条件判断
 * @returns 条件是否满足（考虑 negate 取反）
 *
 * @example
 * ```ts
 * process.env.MY_VAR = 'true'
 * evaluateCondition({ type: 'env', value: 'MY_VAR' }, html)
 * // => true
 *
 * evaluateCondition({ type: 'env', value: 'MY_VAR', negate: true }, html)
 * // => false
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
 * 按优先级排序注入规则
 *
 * @description 将规则按 priority 升序排列，数值越小优先级越高。
 * 未指定 priority 的规则默认为 100。此方法不会修改原数组。
 *
 * @param rules - 待排序的注入规则数组
 * @returns 排序后的规则数组（新数组）
 *
 * @example
 * ```ts
 * const sorted = sortRulesByPriority([
 *   { content: 'C', position: 'head-end', priority: 30 },
 *   { content: 'A', position: 'head-end', priority: 10 },
 *   { content: 'B', position: 'head-end', priority: 20 }
 * ])
 * // sorted[0].content === 'A', sorted[1].content === 'B', sorted[2].content === 'C'
 * ```
 */
export function sortRulesByPriority(rules: InjectRule[]): InjectRule[] {
	return [...rules].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

/**
 * 在指定位置注入 HTML 内容
 *
 * @description 根据 position 参数将内容注入到 HTML 的指定位置。
 * 支持 head/body 的首尾注入以及基于选择器的精确注入。
 * 标签匹配为大小写不敏感。
 *
 * @param html - 原始 HTML 内容
 * @param content - 要注入的 HTML 内容
 * @param position - 注入位置
 * @param selector - 选择器字符串，selector 相关位置时必填
 * @param selectorMatch - 选择器匹配模式
 * @returns 注入结果对象，包含修改后的 HTML、是否成功标志和失败原因
 *
 * @example
 * ```ts
 * // 在 </head> 前注入 meta 标签
 * injectAtPosition(html, '<meta name="test">', 'head-end')
 *
 * // 在指定选择器前注入内容
 * injectAtPosition(html, '<div>before</div>', 'before-selector', '<div id="app">')
 *
 * // 使用正则选择器
 * injectAtPosition(html, '<span>new</span>', 'before-selector', '<div\\s+id="app">', 'regex')
 * ```
 */
export function injectAtPosition(html: string, content: string, position: InjectRule['position'], selector?: string, selectorMatch?: SelectorMatch): { html: string; injected: boolean; reason?: string } {
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

/**
 * 批量处理注入规则
 *
 * @description 按优先级排序后依次执行所有注入规则。每条规则的处理流程为：
 * 1. 评估条件（如有），条件不满足则跳过
 * 2. 应用模板变量替换
 * 3. 执行安全过滤
 * 4. 在指定位置注入内容
 *
 * 单条规则失败不会影响后续规则的执行。
 *
 * @param html - 原始 HTML 内容
 * @param rules - 注入规则数组
 * @param globalTemplateVars - 全局模板变量
 * @param security - 安全配置
 * @param logger - 日志记录器，用于输出安全警告
 * @returns 处理结果对象，包含修改后的 HTML 和每条规则的执行日志
 *
 * @example
 * ```ts
 * const result = processRules(html, [
 *   { id: 'meta', content: '<meta name="injected">', position: 'head-end', priority: 10 },
 *   { id: 'loader', content: '<div class="loader"></div>', position: 'body-start', priority: 20 }
 * ], { appName: 'MyApp' })
 * console.log(result.html)  // 注入后的 HTML
 * console.log(result.logs)  // 执行日志
 * ```
 */
export function processRules(
	html: string,
	rules: InjectRule[],
	globalTemplateVars?: Record<string, string>,
	security?: SecurityConfig,
	logger?: { warn: (msg: string) => void }
): { html: string; logs: InjectionLogEntry[] } {
	let result = html
	const logs: InjectionLogEntry[] = []
	const sortedRules = sortRulesByPriority(rules)

	for (const rule of sortedRules) {
		const logEntry: InjectionLogEntry = {
			ruleId: rule.id || 'unnamed',
			position: rule.position!,
			selector: rule.selector,
			injected: false,
			timestamp: Date.now()
		}

		if (rule.condition) {
			const shouldInject = evaluateCondition(rule.condition, result)
			if (!shouldInject) {
				logEntry.injected = false
				logEntry.reason = '条件不满足，跳过注入'
				logs.push(logEntry)
				continue
			}
		}

		let content = applyTemplateVars(rule.content, rule.templateVars, globalTemplateVars)

		try {
			content = sanitizeContent(content, rule, security, logger)
		} catch (e) {
			logEntry.injected = false
			logEntry.reason = (e as Error).message
			logs.push(logEntry)
			logger?.warn(`规则 "${rule.id || 'unnamed'}" 安全检查失败: ${(e as Error).message}`)
			continue
		}

		const injectResult = injectAtPosition(result, content, rule.position, rule.selector, rule.selectorMatch)
		result = injectResult.html
		logEntry.injected = injectResult.injected
		logEntry.reason = injectResult.reason
		logs.push(logEntry)
	}

	return { html: result, logs }
}
