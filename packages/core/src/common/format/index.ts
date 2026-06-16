import type { DateFormatOptions } from './type'

export type { DateFormatOptions } from './type'

/**
 * 数字补零格式化
 *
 * @param num 要格式化的数字
 * @param length 目标长度
 * @returns 补零后的字符串
 */
function padNumber(num: number, length: number = 2): string {
	return num.toString().padStart(length, '0')
}

/**
 * 获取日期格式化参数
 *
 * @param date 日期对象
 * @returns 日期格式化参数对象
 *
 * @example
 * ```typescript
 * const params = getDateFormatParams(new Date())
 * // { YYYY: '2026', MM: '02', DD: '03', HH: '15', mm: '30', ss: '00', ... }
 * ```
 */
export function getDateFormatParams(date: Date = new Date()): DateFormatOptions {
	return {
		YYYY: date.getFullYear().toString(),
		YY: date.getFullYear().toString().slice(-2),
		MM: padNumber(date.getMonth() + 1),
		DD: padNumber(date.getDate()),
		HH: padNumber(date.getHours()),
		mm: padNumber(date.getMinutes()),
		ss: padNumber(date.getSeconds()),
		SSS: padNumber(date.getMilliseconds(), 3),
		timestamp: date.getTime().toString()
	}
}

/**
 * 替换模板字符串中的变量占位符（自定义分隔符）
 *
 * @param template - 包含占位符的模板字符串
 * @param values - 占位符键值映射
 * @param leftDelimiter - 左分隔符，默认 `'{{'`
 * @param rightDelimiter - 右分隔符，默认 `'}}'`
 * @returns 替换占位符后的字符串
 *
 * @description 通用模板解析函数，支持自定义分隔符。
 * 键名中的正则特殊字符会被自动转义，值中的 `$` 也会被安全处理。
 *
 * @example
 * ```typescript
 * parseTemplateWithDelimiter('Hello {{name}}!', { name: 'World' })
 * // 'Hello World!'
 *
 * parseTemplateWithDelimiter('Hello {name}!', { name: 'World' }, '{', '}')
 * // 'Hello World!'
 * ```
 */
export function parseTemplateWithDelimiter(template: string, values: Record<string, string> | { [key: string]: string }, leftDelimiter: string = '{{', rightDelimiter: string = '}}'): string {
	let result = template
	for (const [key, value] of Object.entries(values)) {
		const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const escapedLeft = leftDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const escapedRight = rightDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const escapedValue = value.replace(/\$/g, '$$$$')
		result = result.replace(new RegExp(`${escapedLeft}${escapedKey}${escapedRight}`, 'g'), escapedValue)
	}
	return result
}

/**
 * 替换模板字符串中的变量占位符
 *
 * @param template - 包含 `{{key}}` 占位符的模板字符串
 * @param values - 占位符键值映射，支持合并多组变量（后者覆盖前者）
 * @returns 替换占位符后的字符串
 *
 * @description 将模板中的 `{{key}}` 占位符替换为对应的值。
 * 键名中的正则特殊字符会被自动转义，值中的 `$` 也会被安全处理。
 *
 * @example
 * ```typescript
 * parseTemplate('Hello {{name}}!', { name: 'World' })
 * // 'Hello World!'
 *
 * parseTemplate('{{YYYY}}-{{MM}}-{{DD}}', getDateFormatParams())
 * // '2026-06-06'
 * ```
 */
export function parseTemplate(template: string, values: Record<string, string>): string {
	return parseTemplateWithDelimiter(template, values, '{{', '}}')
}

/**
 * 格式化日期字符串
 *
 * @param date - 日期对象
 * @param format - 格式字符串，支持 `{YYYY}`、`{MM}`、`{DD}`、`{HH}`、`{mm}`、`{ss}` 等占位符
 * @returns 格式化后的日期字符串
 *
 * @example
 * ```typescript
 * formatDate(new Date(), '{YYYY}-{MM}-{DD}T{HH}:{mm}:{ss}')
 * // '2026-06-06T15:30:00'
 * ```
 */
export function formatDate(date: Date, format: string): string {
	const params = getDateFormatParams(date)
	return parseTemplateWithDelimiter(format, params, '{', '}')
}

/**
 * 将字节数格式化为人类可读的文件大小字符串
 *
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小字符串
 *
 * @description 转换规则：
 * - 小于 1KB：显示为 `xB`（如 `512B`）
 * - 小于 1MB：显示为 `x.xKB`（如 `1.5KB`）
 * - 大于等于 1MB：显示为 `x.xxMB`（如 `2.35MB`）
 *
 * @example
 * ```typescript
 * formatFileSize(512)     // '512B'
 * formatFileSize(1536)    // '1.5KB'
 * formatFileSize(2461726) // '2.35MB'
 * ```
 */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes}B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
	return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

/**
 * 计算压缩率百分比
 *
 * @param {number} originalSize - 原始大小（字节）
 * @param {number} compressedSize - 压缩后大小（字节）
 * @returns {number} 压缩率百分比（0-100），如 65.2 表示体积减少 65.2%
 *
 * @description 计算公式: (1 - compressedSize / originalSize) * 100，保留一位小数。
 * 当 originalSize 为 0 时返回 0，避免除零错误。
 *
 * @example
 * ```typescript
 * calcRatio(10000, 6000)  // 40.0
 * calcRatio(10000, 10000) // 0
 * calcRatio(0, 0)         // 0
 * ```
 */
export function calcRatio(originalSize: number, compressedSize: number): number {
	return originalSize > 0 ? Number(((1 - compressedSize / originalSize) * 100).toFixed(1)) : 0
}
