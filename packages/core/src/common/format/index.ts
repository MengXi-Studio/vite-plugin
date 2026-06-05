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
