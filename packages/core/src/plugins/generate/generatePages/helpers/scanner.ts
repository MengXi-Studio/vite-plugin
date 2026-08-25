import fs from 'node:fs'
import path from 'node:path'
import { normalizePath } from '@/common/path'
import type { RouteConfigBlock, ScannedPage, UniAppPageConfig } from '../types'
import { extractRouteConfig } from './extractor'

/** 目录扫描选项 */
interface ScanOptions {
	/** 页面文件扩展名列表 */
	includeExtensions?: string[]
	/** 需要排除的路径模式列表 */
	excludePatterns?: string[]
}

/** 页面扫描来源（主包或分包） */
export interface ScanOrigin {
	/** 要扫描的源码目录（绝对路径），用于计算页面路径基准 */
	absDir: string
}

/**
 * 递归扫描目录，收集所有页面文件
 *
 * @param dir 要扫描的目录（绝对路径）
 * @param options 扫描选项
 * @returns 页面文件绝对路径列表
 *
 * @description 递归遍历目录，按扩展名过滤页面文件，跳过 node_modules、
 * 隐藏目录以及目录内非目标扩展名的文件。
 */
export function scanPageFiles(dir: string, options: ScanOptions = {}): string[] {
	const { includeExtensions = ['.vue'], excludePatterns = [] } = options
	const files: string[] = []

	if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return files

	const walk = (current: string): void => {
		let entries: fs.Dirent[]
		try {
			entries = fs.readdirSync(current, { withFileTypes: true })
		} catch {
			return
		}

		for (const entry of entries) {
			if (entry.name.startsWith('.') && entry.isDirectory()) continue
			if (entry.name === 'node_modules') continue

			const fullPath = path.join(current, entry.name)

			if (entry.isDirectory()) {
				walk(fullPath)
				continue
			}
			if (!entry.isFile()) continue

			const ext = path.extname(entry.name).toLowerCase()
			if (includeExtensions.length > 0 && !includeExtensions.includes(ext)) continue

			if (isExcluded(fullPath, excludePatterns)) continue

			files.push(fullPath)
		}
	}

	walk(dir)
	return files
}

/**
 * 判断文件路径是否命中排除模式
 *
 * @param filePath 文件绝对路径
 * @param patterns 排除模式列表（子串匹配）
 * @returns 是否应排除
 */
function isExcluded(filePath: string, patterns: string[]): boolean {
	const normalized = normalizePath(filePath)
	return patterns.some(pattern => normalized.includes(pattern))
}

/**
 * 从页面文件提取并组装 pages.json 页面配置项（不含 tab 信息）
 *
 * @param filePath 页面文件绝对路径
 * @param origin 来源配置（用于计算相对路径）
 * @param options 组装选项
 * @returns 页面配置项；解析失败或无内容返回 null
 *
 * @description 仅基于 `<route-config>` 组装写回 pages.json 的页面配置，
 * 不包含标签栏图标等仅在 tabBar 层生效的信息。需要同时获取 tab 覆盖信息时，
 * 请使用 {@link buildScannedPage}。
 */
export function buildPageConfig(filePath: string, origin: ScanOrigin, options: { blockName: string; titleFallback: 'filename' | 'none' }): UniAppPageConfig | null {
	return buildScannedPage(filePath, origin, options)?.page ?? null
}

/**
 * 从页面文件提取并组装页面的全部信息（页面配置 + tab 覆盖）
 *
 * @param filePath 页面文件绝对路径
 * @param origin 来源配置（用于计算相对路径）
 * @param options 组装选项
 * @returns 页面信息；文件读取或路径解析失败返回 null
 *
 * @description 读取 Vue 源码一次，同时解析 `<route-config>` 中的页面配置
 * 与 tabBar 图标覆盖信息，供主插件组装 pages / subPackages / tabBar。
 */
export function buildScannedPage(filePath: string, origin: ScanOrigin, options: { blockName: string; titleFallback: 'filename' | 'none' }): ScannedPage | null {
	const { blockName, titleFallback } = options

	// 计算页面路径（相对来源目录，去除扩展名）
	const relativePath = normalizePath(path.relative(origin.absDir, filePath))
	const pagePath = relativePath.replace(/\.(vue|nvue)$/i, '')
	if (!pagePath) return null

	let source: string
	try {
		source = fs.readFileSync(filePath, 'utf-8')
	} catch {
		return null
	}

	const routeConfig = extractRouteConfig(source, blockName)
	const result: ScannedPage = {
		page: assemblePage(pagePath, routeConfig, titleFallback)
	}
	// 提取 tab 覆盖信息（仅 isTab 页面有效，交由 buildTabBar 过滤）
	if (routeConfig?.tab && typeof routeConfig.tab === 'object') {
		result.tab = routeConfig.tab
	}

	return result
}

/**
 * 将解析出的 route-config 组装为 pages.json 页面配置项
 *
 * @param pagePath 计算好的页面路径
 * @param routeConfig route-config 解析结果（可能为 null）
 * @param titleFallback 标题兜底策略
 * @returns 页面配置项
 */
function assemblePage(pagePath: string, routeConfig: RouteConfigBlock | null, titleFallback: 'filename' | 'none'): UniAppPageConfig {
	const config: UniAppPageConfig = { path: pagePath }

	// name：优先 route-config 声明
	if (routeConfig?.name) config.name = routeConfig.name

	// style：合并 route-config.style 与标题
	const style: Record<string, any> = { ...(routeConfig?.style || {}) }
	const title = routeConfig?.title ?? (routeConfig?.style ? routeConfig.style.navigationBarTitleText : undefined) ?? (titleFallback === 'filename' ? inferTitleFromPath(pagePath) : undefined)
	if (title) {
		style.navigationBarTitleText = title
	}
	if (Object.keys(style).length > 0) {
		config.style = style
	}

	// meta：合并 route-config.meta 与 isTab 标记
	const meta: Record<string, any> = { ...(routeConfig?.meta || {}) }
	if (routeConfig?.isTab === true) {
		meta.isTab = true
	}
	if (Object.keys(meta).length > 0) {
		config.meta = meta
	}

	return config
}

/**
 * 从页面路径推断可读标题（取末段文件名，短横线/下划线/大小写转为空格）
 *
 * @param pagePath 页面路径（如 'pages/user-profile/index'）
 * @returns 推断标题（如 'User Profile Index'）
 */
function inferTitleFromPath(pagePath: string): string {
	const basename = pagePath.split('/').pop() || pagePath
	const readable = basename
		.replace(/[-_]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.trim()
	if (!readable) return basename
	return readable.charAt(0).toUpperCase() + readable.slice(1)
}

/**
 * 判断某个页面是否声明为 tabBar 页面
 *
 * @param page 页面配置项
 * @returns 是否为 tabBar 页面
 */
export function isTabPage(page: UniAppPageConfig): boolean {
	if (page.meta && typeof page.meta === 'object') {
		if (page.meta.isTab === true) return true
	}
	if (page.style && typeof page.style === 'object') {
		if (page.style.isTab === true) return true
	}
	return false
}
