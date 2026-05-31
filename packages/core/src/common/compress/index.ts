import { createGzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'
import { Readable, Transform } from 'node:stream'

/**
 * 计算给定数据的 gzip 压缩后大小
 *
 * @async
 * @param {Buffer | string} data - 待计算的数据
 * @returns {Promise<number>} gzip 压缩后的字节大小
 *
 * @description 将数据通过 gzip 流压缩后计算压缩体积，
 * 用于估算网络传输时的实际体积。
 * 使用最高压缩级别（level: 9）以获得最小的压缩体积。
 *
 * @example
 * ```typescript
 * const gzipSize = await calculateGzipSize(Buffer.from('hello world'))
 * console.log(`gzip 大小: ${gzipSize} 字节`)
 *
 * const stringData = 'some long string content...'
 * const size = await calculateGzipSize(stringData)
 * ```
 */
export async function calculateGzipSize(data: Buffer | string): Promise<number> {
	const buffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data

	const chunks: Buffer[] = []
	const gzip = createGzip({ level: 9 })
	const converter = new Transform({
		transform(chunk: Buffer, _encoding: string, callback: () => void) {
			chunks.push(chunk)
			callback()
		}
	})

	await pipeline(Readable.from(buffer), gzip, converter)

	return Buffer.concat(chunks).length
}
