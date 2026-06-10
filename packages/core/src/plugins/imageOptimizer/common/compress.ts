import { promises as fsp } from 'node:fs'
import type { ImageFormat, FormatQualityOptions, ImageOptimizeStats } from '../types'
import { getOutputExtension } from './filter'

/**
 * sharp 模块的懒加载引用
 *
 * @description 使用动态 import 加载 sharp，避免在模块顶层引入原生模块。
 * 当 sharp 不可用时，提供优雅降级提示。
 */
let sharpModule: any = null
let sharpLoadAttempted = false

/**
 * 获取 sharp 模块实例
 *
 * @async
 * @returns {Promise<any>} sharp 模块
 * @throws {Error} 当 sharp 模块不可用时抛出错误
 *
 * @description 懒加载 sharp 模块，仅首次调用时执行 import。
 * 后续调用直接返回缓存实例，避免重复加载开销。
 */
async function getSharp(): Promise<any> {
	if (sharpModule) return sharpModule
	if (sharpLoadAttempted) throw new Error('sharp 模块不可用，请安装: npm install sharp')

	sharpLoadAttempted = true
	try {
		const mod = await import('sharp')
		sharpModule = mod.default || mod
		return sharpModule
	} catch {
		throw new Error('sharp 模块加载失败。图片优化插件需要 sharp 作为依赖。\n' + '请运行: npm install sharp\n' + 'sharp 是可选依赖，如不需要图片优化功能可忽略此错误。')
	}
}

/**
 * SVGO 模块的懒加载引用
 */
let svgoModule: any = null
let svgoLoadAttempted = false

/**
 * 获取 SVGO 模块实例
 *
 * @async
 * @returns {Promise<any>} SVGO 模块
 * @throws {Error} 当 SVGO 模块不可用时抛出错误
 */
async function getSvgo(): Promise<any> {
	if (svgoModule) return svgoModule
	if (svgoLoadAttempted) throw new Error('svgo 模块不可用，请安装: npm install svgo')

	svgoLoadAttempted = true
	try {
		const mod = await import('svgo')
		svgoModule = mod.default || mod
		return svgoModule
	} catch {
		throw new Error('svgo 模块加载失败。SVG 优化需要 svgo 作为依赖。\n' + '请运行: npm install svgo\n' + '如不需要 SVG 优化功能可忽略此错误。')
	}
}

/**
 * 获取指定格式的默认质量参数
 *
 * @param {ImageFormat} format - 图片格式
 * @param {FormatQualityOptions} quality - 用户配置的质量参数
 * @returns {number | string | boolean} 该格式的质量参数值
 *
 * @description 当用户未指定某格式的质量参数时，使用默认值：
 * - jpeg: 80
 * - png: 6 (palette compression level)
 * - webp: 75
 * - avif: 50
 * - gif: true (palette optimization)
 * - tiff: 'deflate'
 */
function getQualityForFormat(format: Exclude<ImageFormat, 'svg'>, quality: FormatQualityOptions): number | string | boolean {
	const defaults: Required<FormatQualityOptions> = {
		jpeg: 80,
		png: 6,
		webp: 75,
		avif: 50,
		gif: true,
		tiff: 'deflate'
	}

	return quality[format] ?? defaults[format]
}

/**
 * 构建 sharp 的格式输出选项
 *
 * @param {ImageFormat} format - 目标输出格式
 * @param {FormatQualityOptions} quality - 质量配置
 * @param {number} maxPixels - 最大像素数限制（0 表示不限制）
 * @returns {object} sharp 的输出选项对象
 *
 * @description 根据目标格式和质量配置，构建 sharp 链式调用中
 * 对应的格式输出方法参数。不同格式使用不同的参数名和范围。
 */
function buildFormatOptions(format: Exclude<ImageFormat, 'svg'>, quality: FormatQualityOptions): object {
	const q = getQualityForFormat(format, quality)

	switch (format) {
		case 'jpeg':
			return { quality: q as number, mozjpeg: true }
		case 'png':
			return { palette: true, compressionLevel: q as number }
		case 'webp':
			return { quality: q as number, effort: 4 }
		case 'avif':
			return { quality: q as number, effort: 4 }
		case 'gif':
			return { effort: 7, colours: q === true ? undefined : (q as number) }
		case 'tiff':
			return { compression: q as string }
		default:
			return {}
	}
}

/**
 * 压缩单个图片文件（不转换格式）
 *
 * @async
 * @param {string} filePath - 原始图片文件路径
 * @param {ImageFormat} format - 图片格式
 * @param {FormatQualityOptions} quality - 质量配置
 * @param {number} maxPixels - 最大像素数限制
 * @returns {Promise<ImageOptimizeStats>} 优化统计信息
 *
 * @description 对单个图片文件进行压缩优化，不改变格式。
 * 使用 sharp 的流式处理，避免大文件占用过多内存。
 * 处理流程：
 * 1. 读取原始文件大小
 * 2. 使用 sharp 加载并应用优化参数
 * 3. 将优化结果写回原文件
 * 4. 计算压缩率并返回统计
 *
 * @example
 * ```typescript
 * const stats = await compressImage('dist/logo.png', 'png', { png: 6 }, 0)
 * console.log(`压缩率: ${stats.ratio}%`)
 * ```
 */
export async function compressImage(filePath: string, format: Exclude<ImageFormat, 'svg'>, quality: FormatQualityOptions, maxPixels: number): Promise<ImageOptimizeStats> {
	const startTime = Date.now()
	const sharp = await getSharp()
	const originalSize = (await fsp.stat(filePath)).size

	let pipeline = sharp(filePath, { limitInputPixels: maxPixels > 0 ? maxPixels : undefined })

	// 位图格式自动旋转（根据 EXIF 方向信息）
	pipeline = pipeline.rotate()

	const formatOptions = buildFormatOptions(format, quality)
	pipeline = pipeline.toFormat(format, formatOptions)

	await pipeline.toFile(filePath + '.tmp')

	// 原子替换：先写临时文件再重命名，避免写入中断导致文件损坏
	const optimizedSize = (await fsp.stat(filePath + '.tmp')).size

	// 仅在优化后体积更小时替换原文件
	if (optimizedSize < originalSize) {
		try {
			await fsp.rename(filePath + '.tmp', filePath)
		} catch {
			// 重命名失败时清理临时文件
			try {
				await fsp.unlink(filePath + '.tmp')
			} catch {
				/* ignore */
			}
			throw new Error(`压缩失败: 无法写入输出文件 ${filePath}`)
		}
	} else {
		await fsp.unlink(filePath + '.tmp')
	}

	const duration = Date.now() - startTime
	const finalSize = optimizedSize < originalSize ? optimizedSize : originalSize

	return {
		file: filePath,
		relativePath: '',
		originalSize,
		optimizedSize: finalSize,
		ratio: originalSize > 0 ? Number(((1 - finalSize / originalSize) * 100).toFixed(1)) : 0,
		sourceFormat: format,
		outputFormat: format,
		converted: false,
		duration
	}
}

/**
 * 转换图片格式并优化
 *
 * @async
 * @param {string} filePath - 原始图片文件路径
 * @param {ImageFormat} sourceFormat - 源图片格式
 * @param {ImageFormat} targetFormat - 目标图片格式
 * @param {FormatQualityOptions} quality - 质量配置
 * @param {number} maxPixels - 最大像素数限制
 * @param {boolean} keepOriginal - 是否保留原始文件
 * @returns {Promise<ImageOptimizeStats>} 优化统计信息
 *
 * @description 将图片从源格式转换为目标格式，同时进行优化压缩。
 * 如果 keepOriginal 为 true，原始文件保留，新文件使用目标格式的扩展名；
 * 如果 keepOriginal 为 false，原始文件被删除，新文件替换原文件名（扩展名变更）。
 *
 * @example
 * ```typescript
 * const stats = await convertImage('dist/logo.png', 'png', 'webp', { webp: 75 }, 0, true)
 * console.log(`转换: ${stats.sourceFormat} → ${stats.outputFormat}，压缩率: ${stats.ratio}%`)
 * ```
 */
export async function convertImage(
	filePath: string,
	sourceFormat: Exclude<ImageFormat, 'svg'>,
	targetFormat: Exclude<ImageFormat, 'svg'>,
	quality: FormatQualityOptions,
	maxPixels: number,
	keepOriginal: boolean
): Promise<ImageOptimizeStats> {
	const startTime = Date.now()
	const sharp = await getSharp()
	const originalSize = (await fsp.stat(filePath)).size

	let pipeline = sharp(filePath, { limitInputPixels: maxPixels > 0 ? maxPixels : undefined })

	// 位图格式自动旋转（根据 EXIF 方向信息）
	pipeline = pipeline.rotate()

	const formatOptions = buildFormatOptions(targetFormat, quality)
	pipeline = pipeline.toFormat(targetFormat, formatOptions)

	const targetExt = getOutputExtension(targetFormat)
	// logo.png → logo.webp（无论 keepOriginal 与否，输出文件名均使用目标格式扩展名）
	const outputPath = filePath.replace(/\.[^.]+$/, targetExt)

	await pipeline.toFile(outputPath + '.tmp')

	const optimizedSize = (await fsp.stat(outputPath + '.tmp')).size

	// 原子替换：先写临时文件再重命名，避免写入中断导致文件损坏
	try {
		await fsp.rename(outputPath + '.tmp', outputPath)
	} catch {
		// 重命名失败时清理临时文件
		try {
			await fsp.unlink(outputPath + '.tmp')
		} catch {
			/* ignore */
		}
		throw new Error(`格式转换失败: 无法写入输出文件 ${outputPath}`)
	}

	// 如果不保留原文件，删除原始文件
	if (!keepOriginal && outputPath !== filePath) {
		try {
			await fsp.unlink(filePath)
		} catch {
			// 忽略删除失败
		}
	}

	const duration = Date.now() - startTime

	return {
		file: keepOriginal ? outputPath : filePath,
		relativePath: '',
		originalSize,
		optimizedSize,
		ratio: originalSize > 0 ? Number(((1 - optimizedSize / originalSize) * 100).toFixed(1)) : 0,
		sourceFormat,
		outputFormat: targetFormat,
		converted: true,
		duration
	}
}

/**
 * 优化 SVG 文件
 *
 * @async
 * @param {string} filePath - SVG 文件路径
 * @param {object} svgoConfig - SVGO 配置
 * @param {Record<string, object>[]} svgoConfig.plugins - SVGO 插件列表
 * @param {boolean} [svgoConfig.multipass=false] - 是否启用多进程优化
 * @returns {Promise<ImageOptimizeStats>} 优化统计信息
 *
 * @description 使用 SVGO 对 SVG 文件进行优化，移除冗余属性、
 * 空容器、编辑器元数据等，减小文件体积。
 *
 * @example
 * ```typescript
 * const stats = await optimizeSvg('dist/icon.svg', { plugins: [{ name: 'removeViewBox', active: false }] })
 * console.log(`SVG 优化率: ${stats.ratio}%`)
 * ```
 */
export async function optimizeSvg(filePath: string, svgoConfig: { plugins?: Record<string, object>[]; multipass?: boolean }): Promise<ImageOptimizeStats> {
	const startTime = Date.now()
	const { optimize } = await getSvgo()
	const originalSize = (await fsp.stat(filePath)).size

	const svgContent = await fsp.readFile(filePath, 'utf-8')

	const result = optimize(svgContent, {
		path: filePath,
		multipass: svgoConfig.multipass ?? false,
		plugins: svgoConfig.plugins ?? []
	})

	const optimizedSize = Buffer.byteLength(result.data, 'utf-8')

	// 仅在优化后体积更小时才写入，否则保留原文件
	if (optimizedSize < originalSize) {
		await fsp.writeFile(filePath, result.data, 'utf-8')
	}

	const finalSize = optimizedSize < originalSize ? optimizedSize : originalSize
	const duration = Date.now() - startTime

	return {
		file: filePath,
		relativePath: '',
		originalSize,
		optimizedSize: finalSize,
		ratio: originalSize > 0 ? Number(((1 - finalSize / originalSize) * 100).toFixed(1)) : 0,
		sourceFormat: 'svg',
		outputFormat: 'svg',
		converted: false,
		duration
	}
}

/**
 * 检查 sharp 模块是否可用
 *
 * @async
 * @returns {Promise<boolean>} sharp 是否可用
 *
 * @description 在插件初始化时检查 sharp 是否已安装，避免在运行时才发现依赖缺失。
 * 首次调用会尝试加载 sharp，后续调用返回缓存结果。
 */
export async function isSharpAvailable(): Promise<boolean> {
	if (sharpModule) return true
	if (sharpLoadAttempted) return false

	try {
		await getSharp()
		return true
	} catch {
		return false
	}
}

/**
 * 检查 svgo 模块是否可用
 *
 * @async
 * @returns {Promise<boolean>} svgo 是否可用
 */
export async function isSvgoAvailable(): Promise<boolean> {
	if (svgoModule) return true
	if (svgoLoadAttempted) return false

	try {
		await getSvgo()
		return true
	} catch {
		return false
	}
}

/**
 * 重置模块加载状态（仅用于测试）
 *
 * @description 重置 sharp 和 svgo 的加载状态缓存，
 * 使下次调用时重新尝试加载模块。仅在单元测试中使用。
 */
export function resetModuleCache(): void {
	sharpModule = null
	sharpLoadAttempted = false
	svgoModule = null
	svgoLoadAttempted = false
}
