import { ANSI_REGEX } from './constants'

/**
 * 移除字符串中的所有 ANSI 转义码
 *
 * @param str - 包含 ANSI 转义码的字符串
 * @returns 移除所有 ANSI 转义码后的纯文本字符串
 */
export function stripAnsi(str: string): string {
	return str.replace(ANSI_REGEX, '')
}
