import type { AssetGroup, AssetMap } from '../types'
import type { ScannedAsset } from './scanner'

/**
 * 按入口分组资源文件
 *
 * @param {ScannedAsset[]} assets - 扫描到的资源文件列表
 * @param {AssetMap} assetMap - 资源映射表
 * @returns {AssetGroup[]} 按入口分组的资源信息列表
 *
 * @description 根据文件路径和命名规则，将资源文件按入口分组。分组策略：
 * 1. **识别入口文件**：HTML 文件、以 `entry-` 或 `main` 开头的 JS 文件、根目录下的 JS 文件
 * 2. **关联 chunk 文件**：与入口文件共享相同目录前缀或 chunk 名称前缀的资源文件（采用最长匹配）
 * 3. **归入共享组**：未关联的资源归入 `_shared` 组
 *
 * 文件分类规则：
 * - `.js` / `.mjs` → js
 * - `.css` → css
 * - 其他 → other
 *
 * @example
 * ```typescript
 * const groups = groupAssetsByEntry(assets, assetMap)
 * // [
 * //   { entry: 'main', assets: { js: [...], css: [...], other: [...] } },
 * //   { entry: '_shared', assets: { js: [...], css: [...], other: [...] } }
 * // ]
 * ```
 */
export function groupAssetsByEntry(assets: ScannedAsset[], assetMap: AssetMap): AssetGroup[] {
	const entryMap = new Map<string, AssetGroup>()
	const assignedAssets = new Set<string>()

	// 第一步：识别入口文件
	const entryAssets = assets.filter(isEntryAsset)

	for (const entryAsset of entryAssets) {
		const entryName = extractEntryName(entryAsset.relativePath)
		if (!entryMap.has(entryName)) {
			entryMap.set(entryName, { entry: entryName, assets: { js: [], css: [], other: [] } })
		}
		const group = entryMap.get(entryName)!
		const mappedPath = assetMap[entryAsset.relativePath] || entryAsset.relativePath
		categorizeAsset(group, mappedPath, entryAsset.ext)
		assignedAssets.add(entryAsset.relativePath)
	}

	// 第二步：关联 chunk 文件到入口
	const chunkAssets = assets.filter(a => !assignedAssets.has(a.relativePath) && !isOtherAsset(a))

	for (const chunkAsset of chunkAssets) {
		const relatedEntry = findRelatedEntry(chunkAsset, entryAssets)
		const entryName = relatedEntry ? extractEntryName(relatedEntry.relativePath) : '_shared'

		if (!entryMap.has(entryName)) {
			entryMap.set(entryName, { entry: entryName, assets: { js: [], css: [], other: [] } })
		}

		const group = entryMap.get(entryName)!
		const mappedPath = assetMap[chunkAsset.relativePath] || chunkAsset.relativePath
		categorizeAsset(group, mappedPath, chunkAsset.ext)
		assignedAssets.add(chunkAsset.relativePath)
	}

	// 第三步：将未关联的资源归入 _shared 组
	const remainingAssets = assets.filter(a => !assignedAssets.has(a.relativePath))

	if (remainingAssets.length > 0) {
		if (!entryMap.has('_shared')) {
			entryMap.set('_shared', { entry: '_shared', assets: { js: [], css: [], other: [] } })
		}
		const sharedGroup = entryMap.get('_shared')!
		for (const asset of remainingAssets) {
			const mappedPath = assetMap[asset.relativePath] || asset.relativePath
			categorizeAsset(sharedGroup, mappedPath, asset.ext)
		}
	}

	return Array.from(entryMap.values())
}

/**
 * 判断文件是否为入口文件
 *
 * @param {ScannedAsset} asset - 资源文件信息
 * @returns {boolean} 是否为入口文件
 *
 * @description 入口文件识别规则：
 * 1. 所有 HTML 文件（如 `index.html`、`about.html`）
 * 2. 文件名以 `entry-` 开头的 JS/MJS 文件（如 `entry-app.js`）
 * 3. 文件名以 `main` 开头的 JS/MJS 文件（如 `main-abc123.js`）
 * 4. 位于根目录（路径中不含 `/`）的 JS/MJS 文件
 */
function isEntryAsset(asset: ScannedAsset): boolean {
	const { relativePath, ext } = asset
	const fileName = relativePath.split('/').pop() || ''

	// HTML 文件视为入口
	if (ext === '.html') return true

	// JS 文件：以 entry- 或 main 开头
	if (ext === '.js' || ext === '.mjs') {
		if (fileName.startsWith('entry-') || fileName.startsWith('main')) return true
		// 根目录下的 JS 文件
		if (!relativePath.includes('/')) return true
	}

	return false
}

/**
 * 判断文件是否为非 chunk 资源（图片、字体等静态资源）
 *
 * @param {ScannedAsset} asset - 资源文件信息
 * @returns {boolean} 是否为非 chunk 资源
 *
 * @description 根据文件扩展名判断是否为静态资源文件。
 * 图片、字体等静态资源不参与 chunk 关联逻辑，
 * 而是直接归入 `_shared` 组或由目录关联决定。
 */
function isOtherAsset(asset: ScannedAsset): boolean {
	const otherExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.map']
	return otherExts.includes(asset.ext)
}

/**
 * 从入口文件路径中提取入口名称
 *
 * @param {string} relativePath - 入口文件的相对路径
 * @returns {string} 入口名称
 *
 * @description 提取规则（按顺序应用）：
 * 1. 取文件名部分（去除目录路径）
 * 2. 去除扩展名
 * 3. 如果以 `entry-` 开头，去除该前缀
 * 4. 去除 hash 后缀（6-20 位十六进制字符）
 *
 * @example
 * ```typescript
 * extractEntryName('index.html')              // 'index'
 * extractEntryName('entry-app-abc123.js')     // 'app'
 * extractEntryName('main-abc123.js')          // 'main'
 * extractEntryName('about.html')              // 'about'
 * ```
 */
function extractEntryName(relativePath: string): string {
	const fileName = relativePath.split('/').pop() || ''
	const nameWithoutExt = fileName.replace(/\.[^.]+$/, '')

	let name = nameWithoutExt

	// 去除 entry- 前缀
	if (name.startsWith('entry-')) {
		name = name.slice(6)
	}

	// 去除 hash 后缀（如 main-abc123 → main，app-abc123 → app）
	const withoutHash = name.replace(/[-.][0-9a-f]{6,20}$/, '')
	return withoutHash || name
}

/**
 * 查找与 chunk 文件关联的入口（采用最长匹配策略）
 *
 * @param {ScannedAsset} chunkAsset - chunk 文件
 * @param {ScannedAsset[]} entryAssets - 入口文件列表
 * @returns {ScannedAsset | null} 关联的入口文件，未找到返回 null
 *
 * @description 关联策略（按优先级）：
 * 1. **同目录关联**：如果 chunk 和入口在同一目录下，直接关联（最高优先级）
 * 2. **名称前缀最长匹配**：如果 chunk 名称以入口名称开头，选择匹配长度最长的入口，
 *    避免短名称入口错误匹配长名称入口（如 `app` 不会抢占 `app-admin` 的 chunk）
 * 3. 无匹配时返回 null，chunk 将归入 `_shared` 组
 *
 * @example
 * ```typescript
 * // 入口: app, app-admin
 * // chunk: app-admin-vendor-abc123.js
 * // 结果: 匹配 app-admin（最长匹配），而非 app
 * ```
 */
function findRelatedEntry(chunkAsset: ScannedAsset, entryAssets: ScannedAsset[]): ScannedAsset | null {
	const chunkDir = chunkAsset.relativePath.split('/').slice(0, -1).join('/')
	const chunkName = (chunkAsset.relativePath.split('/').pop() || '').replace(/\.[^.]+$/, '').replace(/[-.][0-9a-f]{6,20}$/, '')

	let bestMatch: ScannedAsset | null = null
	let bestMatchLength = 0

	for (const entry of entryAssets) {
		const entryDir = entry.relativePath.split('/').slice(0, -1).join('/')
		const entryName = extractEntryName(entry.relativePath)

		// 同目录关联（最高优先级，直接返回）
		if (chunkDir === entryDir) return entry

		// 名称前缀关联 — 最长匹配
		if (chunkName.startsWith(entryName) && entryName.length > bestMatchLength) {
			bestMatch = entry
			bestMatchLength = entryName.length
		}
	}

	return bestMatch
}

/**
 * 将资源文件按扩展名分类到对应组中
 *
 * @param {AssetGroup} group - 资源分组对象
 * @param {string} mappedPath - 映射后的资源路径
 * @param {string} ext - 文件扩展名（小写，含点号）
 *
 * @description 分类规则：
 * - `.js` / `.mjs` → `group.assets.js`
 * - `.css` → `group.assets.css`
 * - 其他 → `group.assets.other`
 */
function categorizeAsset(group: AssetGroup, mappedPath: string, ext: string): void {
	if (ext === '.js' || ext === '.mjs') {
		group.assets.js.push(mappedPath)
	} else if (ext === '.css') {
		group.assets.css.push(mappedPath)
	} else {
		group.assets.other.push(mappedPath)
	}
}
