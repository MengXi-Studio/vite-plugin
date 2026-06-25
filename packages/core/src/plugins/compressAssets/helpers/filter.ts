import path from 'node:path'
import type { CompressAssetsOptions } from '../types'
import { scanAndMapFiles } from '@/common/fs'
import { normalizePath, isExtensionIncluded, isPathExcluded, isPreCompressed } from '@/common/path'

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
	if (size < options.threshold) {
		return false
	}

	if (!isExtensionIncluded(ext, { includeExtensions: options.includeExtensions, excludeExtensions: options.excludeExtensions })) {
		return false
	}

	if (isPathExcluded(relativePath, options.excludePaths)) {
		return false
	}

	if (isPreCompressed(ext)) {
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
 * 内部委托给 common/fs 的通用 scanDirectory 函数，通过自定义 filter 实现压缩过滤逻辑。
 *
 * @example
 * ```typescript
 * const candidates = await scanDirectory('dist', options)
 * console.log(`找到 ${candidates.length} 个待压缩文件`)
 * ```
 */
export async function scanDirectory(dirPath: string, options: Required<CompressAssetsOptions>): Promise<FileCandidate[]> {
	return scanAndMapFiles(dirPath, {
		scanOptions: {
			filter: (filePath, ext, size) => {
				const relativePath = path.relative(dirPath, filePath)
				return shouldCompressFile(relativePath, ext, size, options)
			}
		},
		mapFn: (f, dir) => ({
			filePath: f.filePath,
			relativePath: normalizePath(path.relative(dir, f.filePath)),
			size: f.size,
			ext: f.extension
		})
	})
}
