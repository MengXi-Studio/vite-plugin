import type { GenerateRouterOptions, UniAppPagesJson, RouteConfig, UniAppPageConfig, RouteMeta } from '../types'
import { toCamelCase, toPascalCase } from '@/common/string'

/**
 * 解析 pages.json 为路由配置数组
 *
 * @param pagesJson - 解析后的 pages.json 对象
 * @param options - 插件配置
 * @returns 路由配置数组和 tabBar 页面集合
 */
export function parsePagesJson(
	pagesJson: UniAppPagesJson,
	options: Pick<GenerateRouterOptions, 'nameStrategy' | 'customNameGenerator' | 'includeSubPackages' | 'metaMapping'>
): { routes: RouteConfig[]; tabBarPages: Set<string> } {
	const routes: RouteConfig[] = []
	const tabBarPages = new Set<string>()

	if (!pagesJson.pages?.length) {
		return { routes, tabBarPages }
	}

	// 提取 tabBar 页面
	if (pagesJson.tabBar?.list) {
		for (const item of pagesJson.tabBar.list) {
			tabBarPages.add(item.pagePath)
		}
	}

	// 解析主包页面
	for (const page of pagesJson.pages) {
		routes.push(parsePageToRoute(page, '', options, tabBarPages))
	}

	// 解析子包页面
	if (options.includeSubPackages && pagesJson.subPackages) {
		for (const subPkg of pagesJson.subPackages) {
			if (subPkg.pages?.length) {
				for (const page of subPkg.pages) {
					routes.push(parsePageToRoute(page, subPkg.root, options, tabBarPages))
				}
			}
		}
	}

	return { routes, tabBarPages }
}

/**
 * 解析单个页面配置为路由配置
 *
 * @param pageConfig - pages.json 中的页面对象
 * @param rootPath - 子包根路径，主包传空字符串
 * @param options - 命名策略与元信息映射配置
 * @param tabBarPages - tabBar 页面路径集合
 * @returns 完整的路由配置对象
 */
function parsePageToRoute(pageConfig: UniAppPageConfig, rootPath: string, options: Pick<GenerateRouterOptions, 'nameStrategy' | 'customNameGenerator' | 'metaMapping'>, tabBarPages: Set<string>): RouteConfig {
	const fullPath = rootPath ? `/${rootPath}/${pageConfig.path}` : `/${pageConfig.path}`
	// 优先使用 pages.json 中配置的 name，否则根据 nameStrategy 自动生成
	const name = pageConfig.name || generateRouteName(fullPath, options)
	const meta = extractMeta(pageConfig, fullPath.replace(/^\//, ''), options.metaMapping, tabBarPages)

	const route: RouteConfig = { path: fullPath, name }
	if (Object.keys(meta).length > 0) {
		route.meta = meta
	}

	return route
}

/**
 * 根据策略生成路由名称
 *
 * @param path - 路由完整路径
 * @param options - 命名策略配置
 * @returns 路由名称字符串
 */
function generateRouteName(path: string, options: Pick<GenerateRouterOptions, 'nameStrategy' | 'customNameGenerator'>): string {
	switch (options.nameStrategy) {
		case 'path':
			return path.replace(/\//g, '_').replace(/^_/, '')
		case 'camelCase':
			return toCamelCase(path)
		case 'pascalCase':
			return toPascalCase(path)
		case 'custom':
			return options.customNameGenerator!(path)
		default:
			return toCamelCase(path)
	}
}

/**
 * 从页面配置中提取路由元信息
 *
 * 优先级：pageConfig.meta > metaMapping 映射 > tabBar 推断
 *
 * @param pageConfig - pages.json 中的页面对象
 * @param fullPath - 不含前导 `/` 的页面路径，用于匹配 tabBar
 * @param metaMapping - style 字段到 meta 字段的映射
 * @param tabBarPages - tabBar 页面路径集合
 * @returns 路由元信息对象
 */
function extractMeta(pageConfig: UniAppPageConfig, fullPath: string, metaMapping: Record<string, string> | undefined, tabBarPages: Set<string>): RouteMeta {
	const meta: RouteMeta = {}
	const style = pageConfig.style || {}
	const mapping = metaMapping || {}

	// 1. 先通过 metaMapping 从 style 中映射提取
	for (const [sourceKey, targetKey] of Object.entries(mapping)) {
		if (style[sourceKey] !== undefined) {
			meta[targetKey] = style[sourceKey]
		}
	}

	// 2. 再用 pageConfig.meta 覆盖，pages.json 中的 meta 优先级高于 metaMapping
	if (pageConfig.meta && typeof pageConfig.meta === 'object') {
		for (const [key, value] of Object.entries(pageConfig.meta)) {
			meta[key] = value
		}
	}

	// 3. tabBar 推断
	if (tabBarPages.has(fullPath)) {
		meta.isTab = true
	}

	return meta
}
