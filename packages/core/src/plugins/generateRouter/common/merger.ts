import type { RouteConfig, RouteMeta } from '../types'

/**
 * 合并路由配置，保留用户修改
 *
 * 合并策略：
 * - path 始终使用新生成的值（由 pages.json 决定）
 * - 用户对 name 和 meta 的修改优先保留
 * - 新增的 meta 字段会自动补充，用户修改的值不会被覆盖
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

		// 先添加新生成的 meta（作为基础，包含新增字段）
		if (newRoute.meta) Object.assign(mergedMeta, newRoute.meta)

		// 用用户现有的 meta 覆盖（用户修改优先）
		if (existingRoute.meta) Object.assign(mergedMeta, existingRoute.meta)

		return {
			...existingRoute,
			path: newRoute.path,
			meta: Object.keys(mergedMeta).length > 0 ? mergedMeta : undefined
		}
	})
}
