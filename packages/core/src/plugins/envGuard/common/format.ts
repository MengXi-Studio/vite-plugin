import { getDateFormatParams } from '@/common/format'

/**
 * 格式化日期
 *
 * @param date - 日期对象
 * @param format - 格式字符串，支持 `{YYYY}`、`{MM}`、`{DD}`、`{HH}`、`{mm}`、`{ss}` 等占位符
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, format: string): string {
	const params = getDateFormatParams(date)
	let result = format
	for (const [key, value] of Object.entries(params)) {
		result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
	}
	return result
}
