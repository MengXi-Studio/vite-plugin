import type { RouteConfig, RouteMeta } from '../types'
import { extractRouteObjects, extractPropertyValueText } from './code-manipulation'

/**
 * 从已存在的路由配置文件中提取 routes 的原始文本
 *
 * 提取每个路由对象的原始文本（保留函数等非 JSON 内容），
 * 用于在合并时保留用户添加的 beforeEnter、component 等属性。
 *
 * @param existingContent - 路由配置文件完整内容
 * @returns path → 原始文本的映射
 */
export function extractExistingRawRoutes(existingContent: string): Map<string, string> {
	const rawTextMap = new Map<string, string>()

	const arrayText = extractRoutesArrayText(existingContent)
	if (!arrayText) return rawTextMap

	const routeObjects = extractRouteObjects(arrayText)

	for (const rawText of routeObjects) {
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
 * 逐个解析路由对象，避免整体 JSON.parse 因函数属性而失败。
 * 每个路由独立解析，单条失败不影响其他路由。
 *
 * @param existingContent - 路由配置文件完整内容
 * @returns path → RouteConfig 的映射
 */
export function extractExistingRoutes(existingContent: string): Map<string, RouteConfig> {
	const routesMap = new Map<string, RouteConfig>()

	const arrayText = extractRoutesArrayText(existingContent)
	if (!arrayText) return routesMap

	const routeObjects = extractRouteObjects(arrayText)

	for (const rawText of routeObjects) {
		const route = parseSingleRouteText(rawText)
		if (route.path) {
			routesMap.set(route.path, route)
		}
	}

	return routesMap
}

/**
 * 从已存在的路由配置文件中提取 routes 数组文本
 *
 * 使用花括号匹配定位 `export const routes` 后的数组内容，
 * 比正则惰性匹配更健壮，能正确处理嵌套数组。
 *
 * @param content - 路由配置文件完整内容
 * @returns routes 数组文本，未找到时返回 null
 */
function extractRoutesArrayText(content: string): string | null {
	const match = content.match(/export\s+const\s+routes[^=]*=\s*\[/)
	if (!match || match.index === undefined) return null

	const arrayStart = match.index + match[0].length - 1
	if (arrayStart < 0) return null

	let depth = 0
	for (let i = arrayStart; i < content.length; i++) {
		const ch = content[i]
		if (ch === '[') depth++
		else if (ch === ']') {
			depth--
			if (depth === 0) return content.substring(arrayStart, i + 1)
		}
	}

	return null
}

/**
 * 解析单个路由对象的原始文本为 RouteConfig
 *
 * 逐字段提取：path/name 用正则，meta 用提取+JSON.parse。
 * 即使 meta 解析失败，path 和 name 仍可保留。
 *
 * @param rawText - 单个路由对象的原始文本
 * @returns 路由配置对象
 */
function parseSingleRouteText(rawText: string): RouteConfig {
	const pathMatch = rawText.match(/path:\s*['"]([^'"]*)['"]/)
	const nameMatch = rawText.match(/name:\s*['"]([^'"]*)['"]/)

	const route: RouteConfig = {
		path: pathMatch ? pathMatch[1] : ''
	}

	if (nameMatch) route.name = nameMatch[1]

	// 提取 meta 对象文本并解析
	const metaText = extractPropertyValueText(rawText, 'meta')
	if (metaText) {
		const meta = tryParseObjectText(metaText.trim())
		if (meta && Object.keys(meta).length > 0) {
			route.meta = meta as RouteMeta
		}
	}

	return route
}

/**
 * 尝试将对象文本解析为结构化对象
 *
 * 将 JS 对象文本转换为 JSON 后解析。
 * 仅适用于简单值（字符串、布尔、数字），不含函数。
 *
 * @param text - 对象文本，如 `{ title: '首页', isTab: true }`
 * @returns 解析结果，失败时返回 null
 */
function tryParseObjectText(text: string): Record<string, any> | null {
	try {
		const jsonStr = text
			.replace(/(\w+)(?=\s*:)/g, '"$1"')
			.replace(/'([^']*)'/g, '"$1"')
			.replace(/,\s*([\]\}])/g, '$1')
		return JSON.parse(jsonStr)
	} catch {
		return null
	}
}
