import type { ImageFormat, ConvertMapping, ImageOptimizerOptions } from '../types'

/**
 * 根据插件配置解析格式转换映射
 *
 * @param {Required<ImageOptimizerOptions>} options - 完整的插件配置选项
 * @returns {ConvertMapping} 格式转换映射，键为源格式，值为目标格式
 *
 * @description 将 convertToWebp、convertToAvif 和 convertMapping 三个配置项
 * 合并为统一的格式转换映射。优先级：convertMapping > convertToAvif > convertToWebp。
 *
 * 当同一源格式在多个配置中指定了不同目标格式时，convertMapping 的优先级最高。
 * 例如 convertToWebp.png=true 且 convertMapping.png='avif'，最终 png → avif。
 *
 * @example
 * ```typescript
 * const mapping = resolveConvertMapping(options)
 * // { png: 'webp', jpeg: 'avif' }
 * ```
 */
export function resolveConvertMapping(options: Required<ImageOptimizerOptions>): ConvertMapping {
	const mapping: ConvertMapping = {}

	// 1. 处理 convertToWebp
	if (options.convertToWebp) {
		for (const [format, enabled] of Object.entries(options.convertToWebp)) {
			if (enabled && format !== 'svg' && format !== 'webp' && format !== 'avif') {
				mapping[format as ImageFormat] = 'webp'
			}
		}
	}

	// 2. 处理 convertToAvif（覆盖 convertToWebp 的配置）
	if (options.convertToAvif) {
		for (const [format, enabled] of Object.entries(options.convertToAvif)) {
			if (enabled && format !== 'svg' && format !== 'webp' && format !== 'avif') {
				mapping[format as ImageFormat] = 'avif'
			}
		}
	}

	// 3. 处理 convertMapping（最高优先级，覆盖以上配置）
	if (options.convertMapping) {
		Object.assign(mapping, options.convertMapping)
	}

	return mapping
}

/**
 * 获取图片的目标输出格式
 *
 * @param {ImageFormat} sourceFormat - 源图片格式
 * @param {ConvertMapping} convertMapping - 格式转换映射
 * @returns {ImageFormat} 目标输出格式（未配置转换时返回源格式）
 *
 * @description 根据格式转换映射确定图片的最终输出格式。
 * 如果源格式在映射中存在，返回映射的目标格式；否则返回源格式本身。
 *
 * @example
 * ```typescript
 * getTargetFormat('png', { png: 'webp' })   // 'webp'
 * getTargetFormat('jpeg', { png: 'webp' })  // 'jpeg'（未配置转换）
 * ```
 */
export function getTargetFormat(sourceFormat: ImageFormat, convertMapping: ConvertMapping): ImageFormat {
	return convertMapping[sourceFormat] ?? sourceFormat
}

/**
 * 判断图片是否需要进行格式转换
 *
 * @param {ImageFormat} sourceFormat - 源图片格式
 * @param {ConvertMapping} convertMapping - 格式转换映射
 * @returns {boolean} 是否需要格式转换
 *
 * @example
 * ```typescript
 * needsConversion('png', { png: 'webp' })   // true
 * needsConversion('jpeg', { png: 'webp' })  // false
 * ```
 */
export function needsConversion(sourceFormat: ImageFormat, convertMapping: ConvertMapping): boolean {
	return sourceFormat in convertMapping
}

/**
 * 验证格式转换映射的合法性
 *
 * @param {ConvertMapping} mapping - 格式转换映射
 * @returns {string[]} 错误消息列表，为空表示验证通过
 *
 * @description 检查格式转换映射是否合法：
 * 1. SVG 格式不能作为转换目标（SVG 是矢量格式，不能从位图转换而来）
 * 2. 源格式和目标格式不能相同
 * 3. 不支持将 SVG 转换为其他格式（需要 sharp 渲染，质量不可控）
 *
 * @example
 * ```typescript
 * const errors = validateConvertMapping({ png: 'svg' })
 * // ['不支持将 png 转换为 svg 格式']
 * ```
 */
export function validateConvertMapping(mapping: ConvertMapping): string[] {
	const errors: string[] = []

	for (const [source, target] of Object.entries(mapping)) {
		if (source === target) {
			errors.push(`源格式和目标格式不能相同: ${source}`)
		}

		if (target === 'svg') {
			errors.push(`不支持将 ${source} 转换为 svg 格式`)
		}

		if (source === 'svg') {
			errors.push(`不支持将 svg 转换为 ${target} 格式，SVG 应使用 svgo 单独优化`)
		}
	}

	return errors
}
