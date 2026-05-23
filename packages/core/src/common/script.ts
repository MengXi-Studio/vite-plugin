/**
 * 将回调函数体字符串包装为安全的函数表达式
 *
 * @param body - 函数体代码字符串
 * @param context - 回调上下文标识，用于错误日志
 * @param params - 函数参数列表字符串，默认为空
 * @returns 安全的函数表达式字符串（包含 try-catch 保护）
 *
 * @example
 * ```typescript
 * makeCallback('console.log("done")')
 * // 'function() { try { console.log("done") } catch(e) { console.error('[callback] error:', e); } }'
 *
 * makeCallback('console.log(a, b)', 'callback', 'a, b')
 * // 'function(a, b) { try { console.log(a, b) } catch(e) { console.error('[callback] error:', e); } }'
 *
 * makeCallback('')
 * // 'function() {}'
 * ```
 */
export function makeCallback(body?: string, context: string = 'callback', params: string = ''): string {
	if (!body) return `function(${params}) {}`
	return `function(${params}) { try { ${body} } catch(e) { console.error('[${context}] error:', e); } }`
}

/**
 * 检测字符串是否包含 `<script>` 标签
 *
 * @param str - 待检测的字符串
 * @returns 是否包含 script 标签
 *
 * @example
 * ```typescript
 * containsScriptTag('<div onclick="alert(1)">') // false
 * containsScriptTag('<script>alert(1)</script>') // true
 * ```
 */
export function containsScriptTag(str: string): boolean {
	return /<script\b/i.test(str)
}

/**
 * 验证字符串是否为合法的 JavaScript 标识符
 *
 * @description 检查名称是否以字母、下划线或美元符开头，
 * 仅包含字母、数字、下划线和美元符，并排除可能导致原型污染的内置属性
 *
 * @param name - 待验证的标识符名称
 * @throws 当名称不是合法标识符时抛出错误
 * @throws 当名称为 JavaScript 内置属性时抛出错误
 *
 * @example
 * ```typescript
 * validateIdentifierName('__LOADING_MANAGER__') // 通过
 * validateIdentifierName('123abc')              // 抛出错误
 * validateIdentifierName('__proto__')           // 抛出错误（内置属性）
 * ```
 */
export function validateIdentifierName(name: string): void {
	if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
		throw new Error(`"${name}" 不是合法的 JavaScript 标识符，必须以字母、下划线或美元符开头，仅包含字母、数字、下划线和美元符`)
	}

	const dangerous = ['__proto__', 'constructor', 'prototype']
	if (dangerous.includes(name)) {
		throw new Error(`"${name}" 是 JavaScript 内置属性，可能导致原型污染，请使用其他名称`)
	}
}
