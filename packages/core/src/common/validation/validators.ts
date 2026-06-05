/**
 * 验证全局变量名的合法性
 */
export function validateGlobalName(name: string | undefined, fieldName: string): void {
	if (!name) return
	if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
		throw new Error(`${fieldName} "${name}" 不是合法的 JavaScript 标识符，必须以字母、下划线或美元符开头，仅包含字母、数字、下划线和美元符`)
	}
	const dangerous = ['__proto__', 'constructor', 'prototype']
	if (dangerous.includes(name)) {
		throw new Error(`${fieldName} "${name}" 是 JavaScript 内置属性，可能导致原型污染，请使用其他名称`)
	}
}

/**
 * 验证模板字符串不包含 script 标签（XSS 防护）
 */
export function validateNoScriptInTemplate(template: string | undefined, fieldName: string): void {
	if (!template) return
	if (/<script\b/i.test(template)) {
		throw new Error(`${fieldName} 不允许包含 <script> 标签`)
	}
}

/**
 * 验证回调字段不包含 script 标签
 */
export function validateCallbackFields(callbacks: Record<string, any>, fields: string[], objectName: string): void {
	for (const field of fields) {
		const value = callbacks[field]
		if (value !== undefined && typeof value !== 'string') {
			throw new Error(`${objectName}.${field} 必须是字符串类型`)
		}
		if (value && /<script\b/i.test(value)) {
			throw new Error(`${objectName}.${field} 不允许包含 <script> 标签`)
		}
	}
}
