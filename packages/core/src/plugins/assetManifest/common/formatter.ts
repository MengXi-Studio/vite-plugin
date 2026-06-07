import type { AssetMap, ManifestOutputFormat, CustomFormatter, WebpackManifestOutput, AssetManifestResult, AssetGroup } from '../types'

/**
 * 格式化清单输出
 *
 * @param {AssetMap} assetMap - 资源映射表，键为原始路径，值为带 publicPath 的输出路径
 * @param {ManifestOutputFormat} format - 输出格式，支持 `'vite'`、`'webpack'`、`'custom'`
 * @param {CustomFormatter | null} customFormatter - 自定义格式化器，仅 `format` 为 `'custom'` 时使用
 * @param {string} publicPath - 公共路径前缀
 * @param {AssetGroup[] | undefined} groups - 按入口分组的资源信息，仅 `groupByEntry` 为 `true` 时提供
 * @returns {Record<string, any>} 格式化后的清单对象，具体结构取决于输出格式
 *
 * @description 根据指定的输出格式，将资源映射表转换为对应的清单结构：
 * - `'vite'`：Vite 标准格式，包含 version、timestamp、publicPath、assets 和可选 groups
 * - `'webpack'`：Webpack 兼容格式，包含 entries 和 assets 嵌套结构
 * - `'custom'`：通过 `customFormatter` 回调自定义输出格式
 *
 * @throws {Error} 当 `format` 为 `'custom'` 且 `customFormatter` 为 `null` 时抛出错误
 *
 * @example
 * ```typescript
 * // Vite 格式
 * const output = formatManifest(assetMap, 'vite', null, '/', undefined)
 * // { version: '1.0', timestamp: '...', publicPath: '/', assets: {...} }
 *
 * // Webpack 格式
 * const output = formatManifest(assetMap, 'webpack', null, '/', groups)
 * // { entries: [...], assets: {...} }
 *
 * // 自定义格式
 * const output = formatManifest(assetMap, 'custom', (map) => ({ files: Object.keys(map) }), '/', undefined)
 * // { files: [...] }
 * ```
 */
export function formatManifest(assetMap: AssetMap, format: ManifestOutputFormat, customFormatter: CustomFormatter | null, publicPath: string, groups: AssetGroup[] | undefined): Record<string, any> {
	switch (format) {
		case 'vite':
			return formatViteManifest(assetMap, publicPath, groups)
		case 'webpack':
			return formatWebpackManifest(assetMap, groups)
		case 'custom':
			return formatCustomManifest(assetMap, customFormatter)
		default:
			return formatViteManifest(assetMap, publicPath, groups)
	}
}

/**
 * 生成 Vite 标准格式的清单
 *
 * @param {AssetMap} assetMap - 资源映射表
 * @param {string} publicPath - 公共路径前缀
 * @param {AssetGroup[] | undefined} groups - 按入口分组的资源信息
 * @returns {AssetManifestResult} Vite 标准格式的清单对象
 *
 * @description Vite 标准格式包含以下字段：
 * - `version`: 清单版本号，固定为 `'1.0'`
 * - `timestamp`: 生成时间戳（ISO 8601 格式）
 * - `publicPath`: 公共路径前缀
 * - `assets`: 资源映射表（键为原始路径，值为输出路径）
 * - `groups`: 按入口分组的资源信息（仅当 `groups` 参数非空时包含）
 */
function formatViteManifest(assetMap: AssetMap, publicPath: string, groups: AssetGroup[] | undefined): AssetManifestResult {
	const result: AssetManifestResult = {
		version: '1.0',
		timestamp: new Date().toISOString(),
		publicPath,
		assets: assetMap
	}

	if (groups && groups.length > 0) {
		result.groups = groups
	}

	return result
}

/**
 * 生成 Webpack 兼容格式的清单
 *
 * @param {AssetMap} assetMap - 资源映射表
 * @param {AssetGroup[] | undefined} groups - 按入口分组的资源信息
 * @returns {WebpackManifestOutput} Webpack 兼容格式的清单对象
 *
 * @description Webpack 兼容格式包含以下字段：
 * - `entries`: 入口资源信息列表，每个入口包含 `name` 和 `files` 字段
 * - `assets`: 资源映射表（与 Vite 格式相同）
 *
 * 如果未启用入口分组（`groups` 为空），`entries` 将包含一个默认入口 `'main'`，
 * 其 `files` 包含所有资源文件的输出路径。
 */
function formatWebpackManifest(assetMap: AssetMap, groups: AssetGroup[] | undefined): WebpackManifestOutput {
	if (groups && groups.length > 0) {
		return {
			entries: groups.map(group => ({
				name: group.entry,
				files: [...group.assets.js, ...group.assets.css, ...group.assets.other]
			})),
			assets: assetMap
		}
	}

	// 未启用分组时，将所有资源归入默认入口
	const allFiles = Object.values(assetMap)
	return {
		entries: [{ name: 'main', files: allFiles }],
		assets: assetMap
	}
}

/**
 * 使用自定义格式化器生成清单
 *
 * @param {AssetMap} assetMap - 资源映射表
 * @param {CustomFormatter | null} customFormatter - 自定义格式化器函数
 * @returns {Record<string, any>} 自定义格式的清单对象
 *
 * @throws {Error} 当 `customFormatter` 为 `null` 时抛出错误
 *
 * @description 将资源映射表传递给用户提供的自定义格式化器函数，
 * 由该函数决定最终的输出结构。格式化器接收 `AssetMap` 作为参数，
 * 返回任意结构的对象。
 */
function formatCustomManifest(assetMap: AssetMap, customFormatter: CustomFormatter | null): Record<string, any> {
	if (!customFormatter) {
		throw new Error('outputFormat 为 "custom" 时，customFormatter 不能为空')
	}
	return customFormatter(assetMap)
}
