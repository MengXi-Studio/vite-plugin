import path from 'node:path'
import { scanDirectory as scanDirectoryFromCommon } from '@/common/fs'
import type { ScannedFile } from '@/common/fs'
import { normalizePath, isExtensionIncluded, isPathExcluded, isPreCompressed } from '@/common/path'
import type { AssetManifestOptions, AssetMap } from '../types'

/**
 * 扫描结果条目
 *
 * @interface ScannedAsset
 * @description 描述一个通过过滤条件的构建产物文件，
 * 包含文件路径、相对路径、大小和扩展名等元信息。
 */
export interface ScannedAsset {
	/** 文件绝对路径 */
	filePath: string
	/** 相对于构建输出目录的相对路径（正斜杠分隔） */
	relativePath: string
	/** 文件大小（字节） */
	size: number
	/** 文件扩展名（小写，含点号，如 `.js`） */
	ext: string
}

/**
 * 判断单个文件是否应包含在清单中
 *
 * @param {string} relativePath - 文件相对于构建输出目录的相对路径
 * @param {string} ext - 文件扩展名（小写，含点号）
 * @param {Required<AssetManifestOptions>} options - 完整的插件配置选项
 * @returns {boolean} 是否应包含该文件
 *
 * @description 按以下优先级依次判断：
 * 1. 扩展名是否在排除列表（excludeExtensions）
 * 2. 扩展名是否不在包含列表（includeExtensions，仅当列表非空时生效）
 * 3. 路径是否匹配排除路径（excludePaths，基于路径段边界匹配，避免子字符串误匹配）
 * 4. 是否为清单输出文件自身（基于 outputFile 配置）
 * 5. 是否为常见的清单文件（manifest.json / asset-manifest.json）
 * 6. 是否为压缩文件（.gz / .br）
 *
 * 路径比较时会统一将反斜杠转换为正斜杠，确保跨平台一致性。
 *
 * @example
 * ```typescript
 * const included = shouldIncludeAsset('assets/index-abc123.js', '.js', options)
 * // true
 *
 * const excluded = shouldIncludeAsset('assets/index.js.map', '.map', options)
 * // false（.map 在默认 excludeExtensions 中）
 * ```
 */
export function shouldIncludeAsset(relativePath: string, ext: string, options: Required<AssetManifestOptions>): boolean {
	const normalizedPath = normalizePath(relativePath)

	// 1. 排除指定扩展名 / 包含指定扩展名
	if (!isExtensionIncluded(ext, { includeExtensions: options.includeExtensions, excludeExtensions: options.excludeExtensions })) {
		return false
	}

	// 2. 排除指定路径（使用路径段边界匹配，避免子字符串误匹配）
	if (isPathExcluded(relativePath, options.excludePaths, { matchMode: 'segment' })) {
		return false
	}

	// 3. 排除清单输出文件自身（基于用户配置的 outputFile）
	const normalizedOutputFile = normalizePath(options.outputFile)
	if (normalizedPath === normalizedOutputFile || normalizedPath.endsWith('/' + normalizedOutputFile)) {
		return false
	}

	// 4. 排除常见的清单文件
	if (normalizedPath.endsWith('manifest.json') || normalizedPath.endsWith('asset-manifest.json')) {
		return false
	}

	// 5. 排除压缩文件（作为安全兜底，即使未在 excludeExtensions 中配置）
	if (isPreCompressed(ext)) {
		return false
	}

	return true
}

/**
 * 递归扫描构建输出目录，收集所有符合清单条件的文件
 *
 * @async
 * @param {string} dirPath - 构建输出目录路径
 * @param {Required<AssetManifestOptions>} options - 完整的插件配置选项
 * @returns {Promise<ScannedAsset[]>} 符合条件的文件列表
 *
 * @description 递归遍历指定目录下的所有文件，对每个文件调用
 * {@link shouldIncludeAsset} 判断是否符合清单条件，返回所有符合条件的文件列表。
 * 内部委托给 `@/common/fs` 的通用 `scanDirectory` 函数执行实际扫描。
 *
 * @example
 * ```typescript
 * const assets = await scanOutputDirectory('dist', options)
 * console.log(`找到 ${assets.length} 个资源文件`)
 * ```
 */
export async function scanOutputDirectory(dirPath: string, options: Required<AssetManifestOptions>): Promise<ScannedAsset[]> {
	const files: ScannedFile[] = await scanDirectoryFromCommon(dirPath, {
		filter: (filePath, ext, _size) => {
			const relativePath = normalizePath(path.relative(dirPath, filePath))
			return shouldIncludeAsset(relativePath, ext, options)
		}
	})

	return files.map(f => ({
		filePath: f.filePath,
		relativePath: normalizePath(path.relative(dirPath, f.filePath)),
		size: f.size,
		ext: f.extension
	}))
}

/**
 * 从扫描结果构建资源映射表
 *
 * @param {ScannedAsset[]} assets - 扫描到的资源文件列表
 * @param {string} publicPath - 公共路径前缀
 * @param {(message: string) => void} [onCollision] - 键名冲突回调，接收冲突描述信息
 * @returns {AssetMap} 资源映射表，键为原始路径，值为带公共路径前缀的输出路径
 *
 * @description 将扫描到的文件列表转换为键值映射。
 * 键为文件相对于输出目录的路径（去除 hash 后的原始路径），
 * 值为带 `publicPath` 前缀的输出路径。
 *
 * 当多个文件映射到同一原始键名时（键名冲突），会保留带 hash 的完整相对路径作为键，
 * 并通过 `onCollision` 回调通知调用方。这确保不会因静默覆盖而丢失资源映射。
 *
 * @example
 * ```typescript
 * const assetMap = buildAssetMap(assets, '/', (msg) => logger.warn(msg))
 * // { 'assets/index.js': '/assets/index-abc123.js', ... }
 * ```
 */
export function buildAssetMap(assets: ScannedAsset[], publicPath: string, onCollision?: (message: string) => void): AssetMap {
	const assetMap: AssetMap = {}
	const normalizedPublicPath = publicPath.endsWith('/') ? publicPath : publicPath + '/'

	for (const asset of assets) {
		const originalKey = extractOriginalKey(asset.relativePath)
		const fullPath = normalizedPublicPath + asset.relativePath

		// 检测键名冲突：如果原始键已被占用且对应不同的输出路径，说明存在冲突
		if (assetMap[originalKey] !== undefined && assetMap[originalKey] !== fullPath) {
			// 冲突时使用带 hash 的完整相对路径作为键，避免数据丢失
			assetMap[asset.relativePath] = fullPath
			onCollision?.(`资源键名冲突: "${originalKey}" 已被 ${assetMap[originalKey]} 占用，"${asset.relativePath}" 将使用完整路径作为键`)
		} else {
			assetMap[originalKey] = fullPath
		}
	}

	return assetMap
}

/**
 * 从带 hash 的文件路径中提取原始键名
 *
 * @param {string} relativePath - 相对路径（如 `assets/index-abc123.js`）
 * @returns {string} 原始键名（如 `assets/index.js`）
 *
 * @description 识别 Vite 构建产物中常见的 hash 模式并移除 hash 段：
 * - `name-[hash].ext` → `name.ext`（如 `index-abc123.js` → `index.js`）
 * - `name.[hash].ext` → `name.ext`（如 `logo.abc123.png` → `logo.png`）
 * - 无 hash 的文件保持原样（如 `favicon.ico` → `favicon.ico`）
 *
 * hash 模式匹配规则：6-20 个十六进制字符（`[0-9a-f]`），前面有 `-` 或 `.` 分隔符，
 * 后面紧跟 `.` 和扩展名。短于 6 位的十六进制串不会被匹配，避免误删版本号等合法字符。
 *
 * @example
 * ```typescript
 * extractOriginalKey('assets/index-abc123.js')    // 'assets/index.js'
 * extractOriginalKey('assets/logo.abc123.png')    // 'assets/logo.png'
 * extractOriginalKey('assets/favicon.ico')        // 'assets/favicon.ico'
 * extractOriginalKey('assets/app-abc.js')         // 'assets/app-abc.js'（5位不匹配）
 * ```
 */
export function extractOriginalKey(relativePath: string): string {
	const hashPattern = /[-.]([0-9a-f]{6,20})(?=\.)/g
	return relativePath.replace(hashPattern, '')
}
