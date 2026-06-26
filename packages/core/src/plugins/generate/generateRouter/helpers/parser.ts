import type { GenerateRouterOptions, UniAppPagesJson, RouteConfig, UniAppPageConfig, RouteMeta } from '../types'
import { toCamelCase, toPascalCase } from '@/common/string'

/** 解析 pages.json 为路由配置数组（含主包和子包页面） */
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

/** 解析单个页面配置为路由配置 */
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

/** 根据策略生成路由名称（path/camelCase/pascalCase/custom） */
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

/** 提取路由元信息（优先级：pageConfig.meta > metaMapping 映射 > tabBar 推断） */
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
