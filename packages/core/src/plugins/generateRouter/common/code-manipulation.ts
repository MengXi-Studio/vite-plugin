import type { RouteConfig } from '../types'

/** 扫描器状态 */
interface ScanState {
	inString: boolean
	stringChar: string
	depth: number
}

/** 创建初始扫描状态 */
function createScanState(): ScanState {
	return { inString: false, stringChar: '', depth: 0 }
}

/**
 * 通用文本扫描器 — 跳过字符串字面量和注释，追踪花括号深度
 *
 * @param text - 待扫描文本
 * @param start - 起始位置
 * @param onChar - 每个有效字符的回调（已跳过字符串和注释内部），返回 true 提前终止
 * @returns 扫描结束位置
 */
function scanText(text: string, start: number, onChar: (ch: string, i: number, state: ScanState) => boolean | void): number {
	const state = createScanState()

	for (let i = start; i < text.length; i++) {
		const ch = text[i]

		// 字符串内部：检查结束引号
		if (state.inString) {
			if (ch === state.stringChar && text[i - 1] !== '\\') {
				state.inString = false
			}
			continue
		}

		// 跳过单行注释
		if (ch === '/' && i + 1 < text.length && text[i + 1] === '/') {
			const nl = text.indexOf('\n', i)
			i = nl === -1 ? text.length - 1 : nl - 1
			continue
		}

		// 跳过多行注释
		if (ch === '/' && i + 1 < text.length && text[i + 1] === '*') {
			const end = text.indexOf('*/', i + 2)
			i = end === -1 ? text.length - 1 : end + 1
			continue
		}

		// 进入字符串
		if (ch === '"' || ch === "'" || ch === '`') {
			state.inString = true
			state.stringChar = ch
			continue
		}

		// 追踪花括号深度
		if (ch === '{' || ch === '[' || ch === '(') state.depth++
		else if (ch === '}' || ch === ']' || ch === ')') state.depth--

		if (onChar(ch, i, state)) return i
	}

	return text.length
}

/**
 * 将值序列化为 TypeScript/JavaScript 代码文本
 *
 * @param value - 要序列化的值
 * @param compact - true 时对象内联紧凑格式，false 时对象属性换行缩进
 * @param indent - compact=false 时的缩进前缀（递归使用）
 */
export function serializeValue(value: unknown, compact: boolean = true, indent: string = ''): string {
	if (value === null) return 'null'
	if (value === undefined) return 'undefined'
	if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
	if (typeof value === 'number' || typeof value === 'boolean') return String(value)
	if (Array.isArray(value)) {
		return '[' + value.map(v => serializeValue(v, compact, indent)).join(', ') + ']'
	}
	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>)
		if (compact) {
			return '{ ' + entries.map(([k, v]) => `${k}: ${serializeValue(v, true, indent)}`).join(', ') + ' }'
		}
		const inner = entries.map(([k, v]) => `${indent}\t${k}: ${serializeValue(v, true, indent + '\t')}`).join(',\n')
		return `{\n${inner}\n${indent}}`
	}
	return String(value)
}

/** @deprecated 使用 serializeValue(value, true) 代替 */
export function serializeValueCompact(value: unknown): string {
	return serializeValue(value, true)
}

/**
 * 将路由配置序列化为多行文本
 *
 * @example
 * 输出格式：
 * {
 * 	path: '/pages/index/index',
 * 	name: 'pagesIndexIndex',
 * 	meta: { title: '首页', isTab: true }
 * }
 */
export function serializeRoute(route: RouteConfig): string {
	const entries = Object.entries(route)
	const lines: string[] = ['{']

	for (const [key, value] of entries) {
		lines.push(`\t${key}: ${serializeValue(value, true)}`)
	}

	lines.push('}')
	return lines.join('\n')
}

/**
 * 从数组文本中提取各个顶层对象的原始文本
 *
 * 使用花括号匹配算法，正确处理嵌套对象、函数体、字符串和注释。
 *
 * @param arrayText - routes 数组的文本内容
 * @returns 顶层对象原始文本数组
 */
export function extractRouteObjects(arrayText: string): string[] {
	const objects: string[] = []
	let start = -1

	scanText(arrayText, 0, (ch, i, state) => {
		if (ch === '{' && state.depth === 1) start = i
		if (ch === '}' && state.depth === 0 && start >= 0) {
			objects.push(arrayText.substring(start, i + 1))
			start = -1
		}
	})

	return objects
}

/**
 * 在原始文本中替换指定属性的值
 *
 * 如果属性不存在，则在对象末尾添加。
 *
 * @param rawText - 原始对象文本
 * @param propertyName - 属性名
 * @param newValue - 新值的文本表示
 * @returns 替换后的文本
 */
export function replacePropertyValue(rawText: string, propertyName: string, newValue: string): string {
	const regex = new RegExp(`(\\b${propertyName}\\s*:\\s*)`)
	const match = rawText.match(regex)

	if (!match || match.index === undefined) {
		// 属性不存在，在对象末尾添加
		const lastBrace = rawText.lastIndexOf('}')
		const beforeBrace = rawText.substring(0, lastBrace)
		const lastNewline = beforeBrace.lastIndexOf('\n')
		const indent = lastNewline >= 0 ? (beforeBrace.substring(lastNewline + 1).match(/^(\s*)/)?.[1] ?? '\t') : '\t'
		const newProp = `\n${indent}${propertyName}: ${newValue},`
		return rawText.substring(0, lastBrace) + newProp + '\n' + rawText.substring(lastBrace)
	}

	const valueStart = match.index + match[0].length
	let valueEnd = valueStart

	scanText(rawText, valueStart, (ch, i, state) => {
		if (state.depth < 0) {
			valueEnd = i
			return true
		}
		if (state.depth === 0 && ch === ',') {
			valueEnd = i
			return true
		}
	})

	return rawText.substring(0, match.index!) + `${propertyName}: ${newValue}` + rawText.substring(valueEnd)
}

/**
 * 提取原始文本中指定属性值的文本
 *
 * @param rawText - 原始对象文本
 * @param propertyName - 属性名
 * @returns 属性值文本，未找到时返回 null
 */
export function extractPropertyValueText(rawText: string, propertyName: string): string | null {
	const regex = new RegExp(`\\b${propertyName}\\s*:\\s*`)
	const match = rawText.match(regex)
	if (!match || match.index === undefined) return null

	const valueStart = match.index + match[0].length
	let valueEnd = valueStart

	scanText(rawText, valueStart, (ch, i, state) => {
		if (state.depth < 0) {
			valueEnd = i
			return true
		}
		if (state.depth === 0 && ch === ',') {
			valueEnd = i
			return true
		}
	})

	return rawText.substring(valueStart, valueEnd)
}

/**
 * 从原始文本中移除指定属性
 *
 * @param rawText - 原始对象文本
 * @param propertyName - 要移除的属性名
 * @returns 移除属性后的文本
 */
export function removeProperty(rawText: string, propertyName: string): string {
	const regex = new RegExp(`,?\\s*\\b${propertyName}\\s*:\\s*`)
	const match = rawText.match(regex)
	if (!match || match.index === undefined) return rawText

	const propStart = match.index
	const valueStart = propStart + match[0].length
	let valueEnd = valueStart

	scanText(rawText, valueStart, (ch, i, state) => {
		if (state.depth < 0) {
			valueEnd = i
			return true
		}
		if (state.depth === 0 && ch === ',') {
			valueEnd = i
			return true
		}
	})

	const leadingComma = match[0].startsWith(',')
	if (leadingComma) {
		return rawText.substring(0, propStart) + rawText.substring(valueEnd)
	} else {
		let afterValue = valueEnd
		if (rawText[afterValue] === ',') afterValue++
		return rawText.substring(0, propStart) + rawText.substring(afterValue)
	}
}
