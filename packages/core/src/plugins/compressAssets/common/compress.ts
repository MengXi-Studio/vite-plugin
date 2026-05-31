import { createGzip, createBrotliCompress, constants } from 'node:zlib'
import { createReadStream, createWriteStream, promises as fsp } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import type { CompressStats } from '../types'

/**
 * 使用 gzip 算法压缩单个文件
 *
 * @async
 * @param {string} filePath - 原始文件路径
 * @param {string} outputPath - 压缩后输出文件路径（通常为 filePath + '.gz'）
 * @param {number} level - gzip 压缩级别，范围 1-9
 * @returns {Promise<CompressStats>} 压缩统计信息
 *
 * @example
 * ```typescript
 * const stats = await compressFileGzip('dist/app.js', 'dist/app.js.gz', 9)
 * console.log(`压缩率: ${stats.ratio}%`)
 * ```
 */
export async function compressFileGzip(filePath: string, outputPath: string, level: number): Promise<CompressStats> {
	const originalSize = (await fsp.stat(filePath)).size

	const compressor = createGzip({ level })
	await pipeline(createReadStream(filePath), compressor, createWriteStream(outputPath))

	const compressedSize = (await fsp.stat(outputPath)).size

	return {
		file: filePath,
		originalSize,
		compressedSize,
		ratio: originalSize > 0 ? Number(((1 - compressedSize / originalSize) * 100).toFixed(1)) : 0,
		algorithm: 'gzip'
	}
}

/**
 * 使用 brotli 算法压缩单个文件
 *
 * @async
 * @param {string} filePath - 原始文件路径
 * @param {string} outputPath - 压缩后输出文件路径（通常为 filePath + '.br'）
 * @param {number} quality - brotli 质量参数，范围 1-11
 * @returns {Promise<CompressStats>} 压缩统计信息
 *
 * @example
 * ```typescript
 * const stats = await compressFileBrotli('dist/app.js', 'dist/app.js.br', 11)
 * console.log(`压缩率: ${stats.ratio}%`)
 * ```
 */
export async function compressFileBrotli(filePath: string, outputPath: string, quality: number): Promise<CompressStats> {
	const originalSize = (await fsp.stat(filePath)).size

	const compressor = createBrotliCompress({
		params: {
			[constants.BROTLI_PARAM_QUALITY]: quality
		}
	})
	await pipeline(createReadStream(filePath), compressor, createWriteStream(outputPath))

	const compressedSize = (await fsp.stat(outputPath)).size

	return {
		file: filePath,
		originalSize,
		compressedSize,
		ratio: originalSize > 0 ? Number(((1 - compressedSize / originalSize) * 100).toFixed(1)) : 0,
		algorithm: 'brotli'
	}
}

/**
 * 根据算法类型压缩单个文件
 *
 * @async
 * @param {string} filePath - 原始文件路径
 * @param {'gzip' | 'brotli'} algorithm - 压缩算法
 * @param {number} level - gzip 压缩级别，范围 1-9
 * @param {number} brotliQuality - brotli 质量参数，范围 1-11
 * @returns {Promise<CompressStats>} 压缩统计信息
 *
 * @description 根据指定的算法类型，自动选择 gzip 或 brotli 进行压缩。
 * gzip 输出文件后缀为 `.gz`，brotli 输出文件后缀为 `.br`。
 *
 * @example
 * ```typescript
 * // gzip 压缩
 * const gzipStats = await compressFile('dist/app.js', 'gzip', 9, 11)
 *
 * // brotli 压缩
 * const brotliStats = await compressFile('dist/app.js', 'brotli', 9, 11)
 * ```
 */
export async function compressFile(filePath: string, algorithm: 'gzip' | 'brotli', level: number, brotliQuality: number): Promise<CompressStats> {
	const ext = algorithm === 'gzip' ? '.gz' : '.br'
	const outputPath = filePath + ext

	if (algorithm === 'gzip') {
		return compressFileGzip(filePath, outputPath, level)
	}
	return compressFileBrotli(filePath, outputPath, brotliQuality)
}
