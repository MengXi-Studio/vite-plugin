import type { RouteConfig, RouteMeta } from '../types'

/**
 * 合并路由配置，保留用户修改
 *
 * 合并策略：
 * - path 始终使用新生成的值（由 pages.json 决定）
 * - name 始终使用新生成的值（由 pageConfig.name 或 nameStrategy 决定）
 * - meta 中来自 pages.json 的字段（metaMapping 映射、pageConfig.meta、tabBar 推断）始终使用新值
 * - 用户自定义的 meta 字段（不在新 meta 中的字段）予以保留
 *
 * @param newRoutes - 从 pages.json 解析出的新路由配置
 * @param existingRoutesMap - 已存在的路由配置映射（key 为 path）
 * @returns 合并后的路由配置数组
 */
export function mergeRoutes(newRoutes: RouteConfig[], existingRoutesMap: Map<string, RouteConfig>): RouteConfig[] {
	return newRoutes.map(newRoute => {
		const existingRoute = existingRoutesMap.get(newRoute.path)
		if (!existingRoute) return newRoute

		const mergedMeta: RouteMeta = {}

		// 1. 先添加用户现有的 meta（保留用户自定义字段作为基础）
		if (existingRoute.meta) Object.assign(mergedMeta, existingRoute.meta)

		// 2. 用新生成的 meta 覆盖（pages.json 是自动生成字段的唯一来源，始终使用最新值）
		if (newRoute.meta) Object.assign(mergedMeta, newRoute.meta)

		return {
			...existingRoute,
			path: newRoute.path,
			name: newRoute.name,
			meta: Object.keys(mergedMeta).length > 0 ? mergedMeta : undefined
		}
	})
}
