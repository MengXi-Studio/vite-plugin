/**
 * 日期格式化选项
 */
export interface DateFormatOptions {
	[key: string]: string
	/** 四位年份 */
	YYYY: string
	/** 两位年份 */
	YY: string
	/** 两位月份 */
	MM: string
	/** 两位日期 */
	DD: string
	/** 两位小时（24小时制） */
	HH: string
	/** 两位分钟 */
	mm: string
	/** 两位秒数 */
	ss: string
	/** 三位毫秒 */
	SSS: string
	/** 时间戳（毫秒） */
	timestamp: string
}
