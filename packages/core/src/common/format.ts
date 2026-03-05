import { randomBytes } from 'crypto'

/**
 * 数字补零格式化
 *
 * @param num 要格式化的数字
 * @param length 目标长度
 * @returns 补零后的字符串
 *
 * @example
 * ```typescript
 * padNumber(5, 2)  // '05'
 * padNumber(12, 3) // '012'
 * padNumber(123, 2) // '123'
 * ```
 */
export function padNumber(num: number, length: number = 2): string {
	return num.toString().padStart(length, '0')
}

/**
 * 生成随机哈希字符串
 *
 * @param length 哈希长度，范围 1-64
 * @returns 随机哈希字符串
 *
 * @example
 * ```typescript
 * generateRandomHash(8)  // 'a1b2c3d4'
 * generateRandomHash(16) // 'a1b2c3d4e5f6g7h8'
 * ```
 */
export function generateRandomHash(length: number = 8): string {
	const safeLength = Math.max(1, Math.min(64, length))
	return randomBytes(Math.ceil(safeLength / 2))
		.toString('hex')
		.slice(0, safeLength)
}

/**
 * 日期格式化选项
 */
export interface DateFormatOptions {
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
 * 格式化日期
 *
 * @param date 日期对象
 * @param format 格式模板
 * @returns 格式化后的日期字符串
 *
 * @example
 * ```typescript
 * formatDate(new Date(), '{YYYY}-{MM}-{DD}')         // '2026-02-03'
 * formatDate(new Date(), '{YYYY}{MM}{DD}{HH}{mm}{ss}') // '20260203153000'
 * formatDate(new Date(), '{YYYY}.{MM}.{DD}')         // '2026.02.03'
 * ```
 */
export function formatDate(date: Date, format: string): string {
	const params = getDateFormatParams(date)
	let result = format

	for (const [key, value] of Object.entries(params)) {
		result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
	}

	return result
}

/**
 * 解析模板字符串，替换占位符
 *
 * @param template 模板字符串
 * @param values 占位符值映射
 * @returns 替换后的字符串
 *
 * @example
 * ```typescript
 * parseTemplate('{name}-{version}', { name: 'app', version: '1.0.0' })
 * // 'app-1.0.0'
 * ```
 */
export function parseTemplate(template: string, values: Record<string, string>): string {
	let result = template

	for (const [key, value] of Object.entries(values)) {
		result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
	}

	return result
}

/**
 * 将字符串转换为驼峰命名（camelCase）
 *
 * @param str 输入字符串
 * @param separators 分隔符正则，默认为斜杠和横线
 * @returns 驼峰命名字符串
 *
 * @example
 * ```typescript
 * toCamelCase('pages/user/profile')  // 'pagesUserProfile'
 * toCamelCase('user-profile-page')   // 'userProfilePage'
 * toCamelCase('/pages/index')        // 'pagesIndex'
 * ```
 */
export function toCamelCase(str: string, separators: RegExp = /[/-]/): string {
	return str
		.replace(/^\/+/, '')
		.split(separators)
		.filter(Boolean)
		.map((part, index) => {
			if (index === 0) return part.toLowerCase()
			return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
		})
		.join('')
}

/**
 * 将字符串转换为帕斯卡命名（PascalCase）
 *
 * @param str 输入字符串
 * @param separators 分隔符正则，默认为斜杠和横线
 * @returns 帕斯卡命名字符串
 *
 * @example
 * ```typescript
 * toPascalCase('pages/user/profile')  // 'PagesUserProfile'
 * toPascalCase('user-profile-page')   // 'UserProfilePage'
 * toPascalCase('/pages/index')        // 'PagesIndex'
 * ```
 */
export function toPascalCase(str: string, separators: RegExp = /[/-]/): string {
	return str
		.replace(/^\/+/, '')
		.split(separators)
		.filter(Boolean)
		.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join('')
}

/**
 * 移除 JSON 字符串中的注释
 *
 * @param jsonString 包含注释的 JSON 字符串
 * @returns 移除注释后的 JSON 字符串
 *
 * @example
 * ```typescript
 * stripJsonComments('{\n  // comment\n  "name": "test"\n}')
 * // '{\n  "name": "test"\n}'
 * ```
 */
export function stripJsonComments(jsonString: string): string {
	return jsonString.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
}
