import path from 'node:path'
import type { ImageOptimizerOptions, ImageFormat } from '../types'
import { scanAndMapFiles } from '@/common/fs'
import { normalizePath, isPathExcluded } from '@/common/path'

/**
 * 扩展名到图片格式的映射
 *
 * @description 将文件扩展名映射为内部使用的 ImageFormat 类型。
 * 支持的格式：jpeg/jpg → jpeg, png → png, webp → webp, avif → avif,
 * gif → gif, tiff/tif → tiff, svg → svg
 */
const EXT_TO_FORMAT: Record<string, ImageFormat> = {
	'.jpg': 'jpeg',
	'.jpeg': 'jpeg',
	'.png': 'png',
	'.webp': 'webp',
	'.avif': 'avif',
	'.gif': 'gif',
	'.tiff': 'tiff',
	'.tif': 'tiff',
	'.svg': 'svg'
}

/**
 * 待优化文件候选信息
 *
 * @interface ImageCandidate
 * @description 描述一个通过过滤条件、待进行优化的图片文件
 */
export interface ImageCandidate {
	/** 文件绝对路径 */
	filePath: string
	/** 相对于扫描根目录的相对路径 */
	relativePath: string
	/** 文件大小（字节） */
	size: number
	/** 文件扩展名（小写，含点号，如 '.png'） */
	ext: string
	/** 识别出的图片格式 */
	format: ImageFormat
}

/**
 * 根据文件扩展名获取图片格式
 *
 * @param {string} ext - 文件扩展名（小写，含点号）
 * @returns {ImageFormat | null} 对应的图片格式，无法识别时返回 null
 *
 * @example
 * ```typescript
 * getFormatByExtension('.png')   // 'png'
 * getFormatByExtension('.jpg')   // 'jpeg'
 * getFormatByExtension('.txt')   // null
 * ```
 */
export function getFormatByExtension(ext: string): ImageFormat | null {
	return EXT_TO_FORMAT[ext] ?? null
}

/**
 * 获取格式对应的默认输出扩展名
 *
 * @param {ImageFormat} format - 图片格式
 * @returns {string} 对应的文件扩展名（含点号）
 *
 * @example
 * ```typescript
 * getOutputExtension('jpeg')  // '.jpg'
 * getOutputExtension('webp')  // '.webp'
 * ```
 */
export function getOutputExtension(format: ImageFormat): string {
	const MAP: Record<ImageFormat, string> = {
		jpeg: '.jpg',
		png: '.png',
		webp: '.webp',
		avif: '.avif',
		gif: '.gif',
		tiff: '.tiff',
		svg: '.svg'
	}
	return MAP[format]
}

/**
 * 判断单个文件是否应被优化
 *
 * @param {string} relativePath - 文件相对于构建输出目录的相对路径
 * @param {string} ext - 文件扩展名（小写，含点号）
 * @param {number} size - 文件大小（字节）
 * @param {Required<ImageOptimizerOptions>} options - 完整的插件配置选项
 * @returns {boolean} 是否应对该文件进行优化
 *
 * @description 按以下优先级依次判断：
 * 1. 扩展名是否为可识别的图片格式
 * 2. 文件大小是否低于阈值（threshold）
 * 3. 扩展名是否不在包含列表（includeExtensions，仅当列表非空时生效）
 * 4. 路径是否匹配排除路径（excludePaths）
 */
export function shouldOptimizeFile(relativePath: string, ext: string, size: number, options: Required<ImageOptimizerOptions>): boolean {
	const format = getFormatByExtension(ext)
	if (!format) return false

	if (size < options.threshold) return false

	if (options.includeExtensions.length > 0 && !options.includeExtensions.includes(ext)) return false

	if (isPathExcluded(relativePath, options.excludePaths)) return false

	return true
}

/**
 * 递归扫描目录，收集所有符合优化条件的图片文件
 *
 * @async
 * @param {string} dirPath - 要扫描的目录路径（通常为构建输出目录）
 * @param {Required<ImageOptimizerOptions>} options - 完整的插件配置选项
 * @returns {Promise<ImageCandidate[]>} 符合条件的图片文件候选列表
 *
 * @description 递归遍历指定目录下的所有文件，对每个文件调用
 * {@link shouldOptimizeFile} 判断是否符合优化条件，返回所有符合条件的文件列表。
 *
 * @example
 * ```typescript
 * const candidates = await scanImageFiles('dist', options)
 * console.log(`找到 ${candidates.length} 个待优化图片`)
 * ```
 */
export async function scanImageFiles(dirPath: string, options: Required<ImageOptimizerOptions>): Promise<ImageCandidate[]> {
	return scanAndMapFiles(dirPath, {
		scanOptions: {
			filter: (filePath, ext, size) => {
				const relativePath = path.relative(dirPath, filePath)
				return shouldOptimizeFile(relativePath, ext, size, options)
			}
		},
		mapFn: (f, dir) => {
			const relativePath = normalizePath(path.relative(dir, f.filePath))
			const format = getFormatByExtension(f.extension)!
			return {
				filePath: f.filePath,
				relativePath,
				size: f.size,
				ext: f.extension,
				format
			}
		}
	})
}
