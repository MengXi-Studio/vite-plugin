import type { RouteConfig, RouteMeta } from '../types'

/**
 * 合并路由配置，保留用户修改
 *
 * - path/name：始终使用新值（由 pages.json 决定）
 * - meta：新值覆盖旧值，但保留用户自定义的字段
 */
export function mergeRoutes(newRoutes: RouteConfig[], existingRoutesMap: Map<string, RouteConfig>): RouteConfig[] {
	return newRoutes.map(newRoute => {
		const existingRoute = existingRoutesMap.get(newRoute.path)
		if (!existingRoute) return newRoute

		const mergedMeta: RouteMeta = {}

		// 用户现有 meta 作为基础，新 meta 覆盖
		if (existingRoute.meta) Object.assign(mergedMeta, existingRoute.meta)
		if (newRoute.meta) Object.assign(mergedMeta, newRoute.meta)

		return {
			...existingRoute,
			path: newRoute.path,
			name: newRoute.name,
			meta: Object.keys(mergedMeta).length > 0 ? mergedMeta : undefined
		}
	})
}
