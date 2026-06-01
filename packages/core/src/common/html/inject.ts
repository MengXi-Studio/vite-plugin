import type { InjectPosition, SelectorMatch, InjectCondition, PositionInjectResult } from './type'

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

export function sortRulesByPriority<T extends { priority?: number }>(rules: T[]): T[] {
	return [...rules].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))
}

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
