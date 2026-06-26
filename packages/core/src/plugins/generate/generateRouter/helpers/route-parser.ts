import type { RouteConfig, RouteMeta } from '../types'
import { extractRouteObjects, extractPropertyValueText } from './code-manipulation'

/**
 * 规范化路由对象文本的缩进
 *
 * 去除从已存在文件提取的文本中多余的一层缩进，
 * 避免与 generateFileContent 添加的缩进叠加。
 */
function normalizeRouteIndent(text: string): string {
	return text
		.split('\n')
		.map(line => (line.startsWith('\t') ? line.substring(1) : line))
		.join('\n')
}

/** 提取 routes 的原始文本映射（保留函数等非 JSON 内容，用于合并时保留用户自定义属性） */
export function extractExistingRawRoutes(existingContent: string): Map<string, string> {
	const rawTextMap = new Map<string, string>()

	const arrayText = extractRoutesArrayText(existingContent)
	if (!arrayText) return rawTextMap

	const routeObjects = extractRouteObjects(arrayText)

	for (const rawText of routeObjects) {
		const pathMatch = rawText.match(/path:\s*['"]([^'"]*)['"]/)
		if (pathMatch) {
			rawTextMap.set(pathMatch[1], normalizeRouteIndent(rawText.trim()))
		}
	}

	return rawTextMap
}

/** 逐个解析路由对象为 RouteConfig 映射（避免整体 JSON.parse 因函数属性失败） */
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
 * 提取 routes 数组内容文本（不含外层 []）
 *
 * 使用方括号匹配定位，比正则更健壮。
 * 不含 [] 以便 extractRouteObjects 的 depth 判定正确工作。
 */
function extractRoutesArrayText(content: string): string | null {
	const match = content.match(/export\s+const\s+routes[^=]*=\s*\[/)
	if (!match || match.index === undefined) return null

	const bracketStart = match.index + match[0].length - 1
	if (bracketStart < 0) return null

	let depth = 0
	for (let i = bracketStart; i < content.length; i++) {
		const ch = content[i]
		if (ch === '[') depth++
		else if (ch === ']') {
			depth--
			if (depth === 0) return content.substring(bracketStart + 1, i)
		}
	}

	return null
}

/** 解析单个路由对象文本为 RouteConfig（meta 解析失败时仍保留 path/name） */
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

/** 将 JS 对象文本转为 JSON 后解析（仅支持简单值，不含函数） */
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
