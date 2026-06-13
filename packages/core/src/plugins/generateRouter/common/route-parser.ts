import type { RouteConfig } from '../types'
import { extractRouteObjects } from './code-manipulation'

/**
 * 从已存在的路由配置文件中提取 routes 的原始文本
 *
 * @param {string} existingContent - 已存在的文件内容
 * @returns {Map<string, string>} 以路径为键的路由对象原始文本映射
 *
 * @description 提取每个路由对象的原始文本（保留函数等非 JSON 内容），
 * 用于在合并时保留用户添加的 beforeEnter、component 等属性。
 */
export function extractExistingRawRoutes(existingContent: string): Map<string, string> {
	const rawTextMap = new Map<string, string>()

	const routesMatch = existingContent.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/)
	if (!routesMatch) return rawTextMap

	const routeObjects = extractRouteObjects(routesMatch[1])

	for (const rawText of routeObjects) {
		// 提取 path 作为 key（兼容单引号和双引号）
		const pathMatch = rawText.match(/path:\s*['"]([^'"]*)['"]/)
		if (pathMatch) {
			rawTextMap.set(pathMatch[1], rawText.trim())
		}
	}

	return rawTextMap
}

/**
 * 从已存在的路由配置文件中提取 routes 配置
 *
 * @param {string} existingContent - 已存在的文件内容
 * @returns {Map<string, RouteConfig>} 以路径为键的路由配置映射
 *
 * @description 使用正则表达式从已存在的文件中提取 routes 数组，
 * 解析为 RouteConfig 对象映射。解析失败时返回空 Map。
 * 注意：JSON.parse 会丢失函数属性，函数属性的保留由 extractExistingRawRoutes 处理。
 */
export function extractExistingRoutes(existingContent: string): Map<string, RouteConfig> {
	const routesMap = new Map<string, RouteConfig>()

	// 使用更健壮的正则提取 routes 数组
	const routesMatch = existingContent.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/)
	if (!routesMatch) return routesMap

	try {
		// 安全转换为 JSON 格式
		let jsonStr = routesMatch[1]
			// 属性名加引号
			.replace(/(\w+)(?=\s*:)/g, '"$1"')
			// 先处理单引号字符串，转换为双引号
			.replace(/'([^']*)'/g, '"$1"')
			// 移除尾随逗号
			.replace(/,\s*([\]\}])/g, '$1')

		const routes = JSON.parse(jsonStr) as RouteConfig[]
		for (const route of routes) {
			if (route.path) {
				routesMap.set(route.path, route)
			}
		}
	} catch {
		// 解析失败，返回空 map
	}

	return routesMap
}
