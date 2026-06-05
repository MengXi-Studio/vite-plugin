import type { InjectRule, InjectionLogEntry } from '../types'
import type { InjectPosition, SelectorMatch, InjectCondition, SecurityConfig } from '@/common/html'
import { sanitizeContent } from '@/common/html'

/**
 * 在 HTML 中查找选择器匹配位置
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
 * 替换模板字符串中的变量占位符
 */
function applyTemplateVars(content: string, ruleVars?: Record<string, string>, globalVars?: Record<string, string>): string {
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
 */
function evaluateCondition(condition: InjectCondition, html: string): boolean {
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
 */
function sortRulesByPriority<T extends { priority?: number }>(rules: T[]): T[] {
	return [...rules].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

/**
 * 在 HTML 的指定位置注入内容
 */
function injectAtPosition(html: string, content: string, position: InjectPosition, selector?: string, selectorMatch?: SelectorMatch) {
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
 * 按优先级顺序处理所有注入规则
 *
 * @param {string} html - 原始 HTML 字符串
 * @param {InjectRule[]} rules - 注入规则数组
 * @param {Record<string, string>} [globalTemplateVars] - 全局模板变量映射
 * @param {SecurityConfig} [security] - 安全过滤配置
 * @param {{ warn: (msg: string) => void }} [logger] - 日志记录器
 * @returns {{ html: string; logs: InjectionLogEntry[] }} 处理后的 HTML 和注入日志
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

		const injectResult = injectAtPosition(result, content, rule.position!, rule.selector, rule.selectorMatch)
		result = injectResult.html
		logEntry.injected = injectResult.injected
		logEntry.reason = injectResult.reason
		logs.push(logEntry)
	}

	return { html: result, logs }
}
