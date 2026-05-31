import path from 'node:path'
import { promises as fsp } from 'node:fs'
import type { CompressAssetsOptions } from '../types'

/**
 * 待压缩文件候选信息
 *
 * @interface FileCandidate
 * @description 描述一个通过过滤条件、待进行压缩的文件
 */
export interface FileCandidate {
	/** 文件绝对路径 */
	filePath: string
	/** 相对于扫描根目录的相对路径 */
	relativePath: string
	/** 文件大小（字节） */
	size: number
	/** 文件扩展名（小写，含点号，如 '.js'） */
	ext: string
}

/**
 * 判断单个文件是否应被压缩
 *
 * @param {string} relativePath - 文件相对于构建输出目录的相对路径
 * @param {string} ext - 文件扩展名（小写，含点号）
 * @param {number} size - 文件大小（字节）
 * @param {Required<CompressAssetsOptions>} options - 完整的插件配置选项
 * @returns {boolean} 是否应对该文件进行压缩
 *
 * @description 按以下优先级依次判断：
 * 1. 文件大小是否低于阈值（threshold）
 * 2. 扩展名是否在排除列表（excludeExtensions）
 * 3. 扩展名是否不在包含列表（includeExtensions，仅当列表非空时生效）
 * 4. 路径是否匹配排除路径（excludePaths）
 * 5. 扩展名是否为已压缩格式（.gz / .br）
 *
 * 路径比较时会统一将反斜杠转换为正斜杠，确保跨平台一致性。
 */
export function shouldCompressFile(relativePath: string, ext: string, size: number, options: Required<CompressAssetsOptions>): boolean {
	const normalizedPath = relativePath.replace(/\\/g, '/')

	if (size < options.threshold) {
		return false
	}

	if (options.excludeExtensions.length > 0 && options.excludeExtensions.includes(ext)) {
		return false
	}

	if (options.includeExtensions.length > 0 && !options.includeExtensions.includes(ext)) {
		return false
	}

	if (options.excludePaths.length > 0) {
		for (const excludePath of options.excludePaths) {
			const normalizedExclude = excludePath.replace(/\\/g, '/')
			if (normalizedPath.startsWith(normalizedExclude) || normalizedPath.includes(normalizedExclude)) {
				return false
			}
		}
	}

	if (ext === '.gz' || ext === '.br') {
		return false
	}

	return true
}

/**
 * 递归扫描目录，收集所有符合压缩条件的文件
 *
 * @async
 * @param {string} dirPath - 要扫描的目录路径（通常为构建输出目录）
 * @param {Required<CompressAssetsOptions>} options - 完整的插件配置选项
 * @returns {Promise<FileCandidate[]>} 符合条件的文件候选列表
 *
 * @description 递归遍历指定目录下的所有文件，对每个文件调用
 * {@link shouldCompressFile} 判断是否符合压缩条件，返回所有符合条件的文件列表。
 *
 * @example
 * ```typescript
 * const candidates = await scanDirectory('dist', options)
 * console.log(`找到 ${candidates.length} 个待压缩文件`)
 * ```
 */
export async function scanDirectory(dirPath: string, options: Required<CompressAssetsOptions>): Promise<FileCandidate[]> {
	const candidates: FileCandidate[] = []

	async function walk(currentDir: string): Promise<void> {
		const entries = await fsp.readdir(currentDir, { withFileTypes: true })

		for (const entry of entries) {
			const fullPath = path.join(currentDir, entry.name)

			if (entry.isDirectory()) {
				await walk(fullPath)
			} else if (entry.isFile()) {
				const stat = await fsp.stat(fullPath)
				const relativePath = path.relative(dirPath, fullPath)
				const ext = path.extname(entry.name).toLowerCase()

				if (shouldCompressFile(relativePath, ext, stat.size, options)) {
					candidates.push({
						filePath: fullPath,
						relativePath,
						size: stat.size,
						ext
					})
				}
			}
		}
	}

	await walk(dirPath)
	return candidates
}
