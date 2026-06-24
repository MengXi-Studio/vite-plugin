import zlib from 'node:zlib'
import { promisify } from 'node:util'

const gzip = promisify(zlib.gzip)

/**
 * 计算内容的 Gzip 压缩大小
 *
 * @param content - 要计算的内容（字符串或 Buffer）
 * @returns Gzip 压缩后的字节数
 *
 * @description 将输入内容统一转换为 Buffer 后使用 gzip 压缩，
 * 返回压缩后的字节数。用于构建产物体积分析和压缩率计算。
 *
 * @example
 * ```typescript
 * const size = await calculateGzipSize('console.log("hello")')
 * // 35
 * ```
 */
export async function calculateGzipSize(content: string | Buffer): Promise<number> {
	const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8')
	const compressed = await gzip(buffer)
	return compressed.length
}
