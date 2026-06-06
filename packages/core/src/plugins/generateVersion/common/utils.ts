import { randomBytes } from 'crypto'

/**
 * 生成随机哈希字符串
 *
 * @param length - 哈希字符串长度，默认 8，范围 1-64
 * @returns 随机十六进制哈希字符串
 */
export function generateRandomHash(length: number = 8): string {
	const safeLength = Math.max(1, Math.min(64, length))
	return randomBytes(Math.ceil(safeLength / 2))
		.toString('hex')
		.slice(0, safeLength)
}

/**
 * 解析模板字符串，替换 `{key}` 占位符
 *
 * @param template - 包含 `{key}` 占位符的模板字符串
 * @param values - 占位符键值映射
 * @returns 替换占位符后的字符串
 *
 * @description 使用单花括号 `{key}` 作为占位符标记。
 * 如需双花括号 `{{key}}` 格式，请使用 `@/common/format` 中的 `parseTemplate`。
 */
export function parseTemplate(template: string, values: Record<string, string>): string {
	let result = template
	for (const [key, value] of Object.entries(values)) {
		result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
	}
	return result
}
