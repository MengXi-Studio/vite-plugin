import type { RouteConfig } from '../types'

/**
 * 将路由配置序列化为多行文本
 *
 * @param {RouteConfig} route - 路由配置对象
 * @returns {string} 序列化后的文本
 *
 * @description 将路由配置对象序列化为多行 TypeScript/JavaScript 代码文本，
 * 每个属性独占一行，使用 tab 缩进。meta 对象的属性也独占一行。
 * 属性名去引号，字符串值使用单引号。
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
		const serializedValue = serializeValueMultiline(value)
		lines.push(`\t${key}: ${serializedValue}`)
	}

	lines.push('}')
	return lines.join('\n')
}

/**
 * 将值序列化为多行文本（用于路由对象属性值）
 *
 * @param {unknown} value - 要序列化的值
 * @returns {string} 序列化后的文本
 *
 * @description 对象类型序列化为单行紧凑格式（属性在同一行），
 * 其他类型与 serializeValueCompact 行为一致。
 */
function serializeValueMultiline(value: unknown): string {
	if (value === null) return 'null'
	if (value === undefined) return 'undefined'
	if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
	if (typeof value === 'number' || typeof value === 'boolean') return String(value)
	if (Array.isArray(value)) {
		return '[' + value.map(v => serializeValueMultiline(v)).join(', ') + ']'
	}
	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>)
			.map(([k, v]) => `${k}: ${serializeValueMultiline(v)}`)
			.join(', ')
		return `{ ${entries} }`
	}
	return String(value)
}

/**
 * 将值序列化为紧凑的单行文本
 *
 * @param {unknown} value - 要序列化的值
 * @returns {string} 紧凑格式的文本
 *
 * @description 将值序列化为单行 TypeScript/JavaScript 代码文本，
 * 属性名去引号，字符串值使用单引号。适用于在原始文本中替换属性值，
 * 避免多行序列化导致的缩进不一致问题。
 */
export function serializeValueCompact(value: unknown): string {
	if (value === null) return 'null'
	if (value === undefined) return 'undefined'
	if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
	if (typeof value === 'number' || typeof value === 'boolean') return String(value)
	if (Array.isArray(value)) {
		return '[' + value.map(v => serializeValueCompact(v)).join(', ') + ']'
	}
	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>)
			.map(([k, v]) => `${k}: ${serializeValueCompact(v)}`)
			.join(', ')
		return `{ ${entries} }`
	}
	return String(value)
}

/**
 * 从数组文本中提取各个路由对象的原始文本
 *
 * @param {string} arrayText - routes 数组的文本内容
 * @returns {string[]} 每个路由对象的原始文本
 *
 * @description 使用花括号匹配算法提取数组中的每个顶层对象，
 * 正确处理嵌套对象、函数体、字符串和注释中的花括号。
 */
export function extractRouteObjects(arrayText: string): string[] {
	const objects: string[] = []
	let depth = 0
	let start = -1
	let inString = false
	let stringChar = ''

	for (let i = 0; i < arrayText.length; i++) {
		const ch = arrayText[i]

		if (inString) {
			if (ch === stringChar && arrayText[i - 1] !== '\\') {
				inString = false
			}
			continue
		}

		// 跳过单行注释
		if (ch === '/' && i + 1 < arrayText.length && arrayText[i + 1] === '/') {
			const newlineIdx = arrayText.indexOf('\n', i)
			i = newlineIdx === -1 ? arrayText.length - 1 : newlineIdx - 1
			continue
		}

		// 跳过多行注释
		if (ch === '/' && i + 1 < arrayText.length && arrayText[i + 1] === '*') {
			const endIdx = arrayText.indexOf('*/', i + 2)
			i = endIdx === -1 ? arrayText.length - 1 : endIdx + 1
			continue
		}

		if (ch === '"' || ch === "'" || ch === '`') {
			inString = true
			stringChar = ch
			continue
		}

		if (ch === '{') {
			if (depth === 0) start = i
			depth++
		} else if (ch === '}') {
			depth--
			if (depth === 0 && start >= 0) {
				objects.push(arrayText.substring(start, i + 1))
				start = -1
			}
		}
	}

	return objects
}

/**
 * 在原始文本中替换指定属性的值
 *
 * @param {string} rawText - 路由对象的原始文本
 * @param {string} propertyName - 属性名
 * @param {string} newValue - 新的属性值文本
 * @returns {string} 替换后的原始文本
 *
 * @description 使用花括号匹配定位属性值的边界，替换整个属性值。
 * 如果属性不存在，则在对象末尾添加新属性。
 */
export function replacePropertyValue(rawText: string, propertyName: string, newValue: string): string {
	const regex = new RegExp(`(\\b${propertyName}\\s*:\\s*)`)
	const match = rawText.match(regex)

	if (!match || match.index === undefined) {
		// 属性不存在，在对象末尾添加
		// 检测现有缩进：取最后一个 } 前的非空行的前导空白
		const lastBrace = rawText.lastIndexOf('}')
		const beforeBrace = rawText.substring(0, lastBrace)
		const lastNewline = beforeBrace.lastIndexOf('\n')
		const indent = lastNewline >= 0 ? (beforeBrace.substring(lastNewline + 1).match(/^(\s*)/)?.[1] ?? '\t') : '\t'
		const newProp = `\n${indent}${propertyName}: ${newValue},`
		return rawText.substring(0, lastBrace) + newProp + '\n' + rawText.substring(lastBrace)
	}

	const valueStart = match.index + match[0].length
	let depth = 0
	let inStr = false
	let strChar = ''
	let valueEnd = valueStart

	for (let i = valueStart; i < rawText.length; i++) {
		const ch = rawText[i]

		if (inStr) {
			if (ch === strChar && rawText[i - 1] !== '\\') {
				inStr = false
			}
			continue
		}

		// 跳过单行注释
		if (ch === '/' && i + 1 < rawText.length && rawText[i + 1] === '/') {
			const newlineIdx = rawText.indexOf('\n', i)
			i = newlineIdx === -1 ? rawText.length - 1 : newlineIdx - 1
			continue
		}

		// 跳过多行注释
		if (ch === '/' && i + 1 < rawText.length && rawText[i + 1] === '*') {
			const endIdx = rawText.indexOf('*/', i + 2)
			i = endIdx === -1 ? rawText.length - 1 : endIdx + 1
			continue
		}

		if (ch === '"' || ch === "'" || ch === '`') {
			inStr = true
			strChar = ch
			continue
		}

		if (ch === '{' || ch === '[' || ch === '(') {
			depth++
		} else if (ch === '}' || ch === ']' || ch === ')') {
			if (depth > 0) {
				depth--
			} else {
				valueEnd = i
				break
			}
		} else if (depth === 0 && ch === ',') {
			valueEnd = i
			break
		}
	}

	return rawText.substring(0, match.index!) + `${propertyName}: ${newValue}` + rawText.substring(valueEnd)
}

/**
 * 从原始文本中移除指定属性
 *
 * @param {string} rawText - 路由对象的原始文本
 * @param {string} propertyName - 要移除的属性名
 * @returns {string} 移除属性后的原始文本
 *
 * @description 定位并移除指定属性及其值，正确处理尾随逗号和空白。
 */
export function removeProperty(rawText: string, propertyName: string): string {
	const regex = new RegExp(`,?\\s*\\b${propertyName}\\s*:\\s*`)
	const match = rawText.match(regex)
	if (!match || match.index === undefined) return rawText

	const propStart = match.index
	const valueStart = propStart + match[0].length

	// 扫描值的边界
	let depth = 0
	let inStr = false
	let strChar = ''
	let valueEnd = valueStart

	for (let i = valueStart; i < rawText.length; i++) {
		const ch = rawText[i]

		if (inStr) {
			if (ch === strChar && rawText[i - 1] !== '\\') inStr = false
			continue
		}

		if (ch === '/' && i + 1 < rawText.length && rawText[i + 1] === '/') {
			const nl = rawText.indexOf('\n', i)
			i = nl === -1 ? rawText.length - 1 : nl - 1
			continue
		}
		if (ch === '/' && i + 1 < rawText.length && rawText[i + 1] === '*') {
			const end = rawText.indexOf('*/', i + 2)
			i = end === -1 ? rawText.length - 1 : end + 1
			continue
		}

		if (ch === '"' || ch === "'" || ch === '`') {
			inStr = true
			strChar = ch
			continue
		}
		if (ch === '{' || ch === '[' || ch === '(') {
			depth++
			continue
		}
		if (ch === '}' || ch === ']' || ch === ')') {
			if (depth > 0) {
				depth--
				continue
			}
			valueEnd = i
			break
		}
		if (depth === 0 && ch === ',') {
			valueEnd = i
			break
		}
	}

	// 处理前导逗号：如果匹配包含前导逗号则从逗号开始删除，否则检查值后逗号
	const leadingComma = match[0].startsWith(',')
	if (leadingComma) {
		return rawText.substring(0, propStart) + rawText.substring(valueEnd)
	} else {
		// 值后可能有逗号
		let afterValue = valueEnd
		if (rawText[afterValue] === ',') afterValue++
		return rawText.substring(0, propStart) + rawText.substring(afterValue)
	}
}
