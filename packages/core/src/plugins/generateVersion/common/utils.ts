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
