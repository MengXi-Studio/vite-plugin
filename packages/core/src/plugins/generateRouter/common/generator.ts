import type { RouteConfig, RouteMeta, GenerateRouterOptions } from '../types'
import { serializeRoute, serializeValue, replacePropertyValue, removeProperty, extractPropertyValueText } from './code-manipulation'

/** 插件版本号，由构建工具在打包时从 package.json 注入 */
declare const __GENERATE_ROUTER_VERSION__: string
const PLUGIN_VERSION: string = typeof __GENERATE_ROUTER_VERSION__ !== 'undefined' ? __GENERATE_ROUTER_VERSION__ : '0.0.0'

/**
 * 生成路由配置文件内容
 *
 * @param routes - 路由配置数组
 * @param options - 插件配置
 * @param existingRawTexts - 已存在的路由对象原始文本映射（用于保留用户自定义属性）
 */
export function generateFileContent(routes: RouteConfig[], options: Pick<GenerateRouterOptions, 'exportTypes' | 'outputFormat' | 'fileHeader'>, existingRawTexts?: Map<string, string>): string {
	const typeImport = generateTypeImport(options)
	const isTS = options.outputFormat === 'ts'
	const typeAnnotation = isTS ? ': RouteConfig[]' : ''

	const routeStrings = routes.map(route => {
		const rawText = existingRawTexts?.get(route.path)

		if (rawText) {
			return updateRawRouteText(rawText, route)
		}

		return serializeRoute(route)
	})

	// 缩进：首行 \t，后续行 \t\t
	const indentedRoutes = routeStrings
		.map(s => {
			const lines = s.split('\n')
			return lines.map((line, i) => (i === 0 ? '\t' + line : '\t\t' + line)).join('\n')
		})
		.join(',\n')

	const importLine = typeImport ? `${typeImport}\n\n` : ''
	const headerLine = options.fileHeader ? generateFileHeader() + '\n\n' : ''

	return `${headerLine}${importLine}/**
 * 路由配置列表
 * @description 由 pages.json 自动生成
 */
export const routes${typeAnnotation} = [
${indentedRoutes}
]

export default routes
`
}

/**
 * 生成标准化文件注释头
 *
 * @returns JSDoc 风格的注释头文本
 */
function generateFileHeader(): string {
	const now = new Date()
	const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
	const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
	return `/**
 * @plugin generate-router
 * @date ${date} ${time}
 * @version ${PLUGIN_VERSION}
 */`
}

/**
 * 生成类型导入语句
 *
 * @param options - 输出格式与类型导出配置
 * @returns import 语句字符串，不需要时返回空字符串
 */
function generateTypeImport(options: Pick<GenerateRouterOptions, 'exportTypes' | 'outputFormat'>): string {
	if (!options.exportTypes || options.outputFormat === 'js') return ''
	return `import type { RouteConfig } from '@meng-xi/uni-router'`
}

/**
 * 更新已有路由对象的原始文本，保留用户自定义属性
 *
 * - path/name：直接替换（path 由 pages.json 决定，name 由策略生成）
 * - meta：逐字段更新，仅添加/更新新 meta 中的字段，不删除用户自定义的 meta 字段
 * - 其他属性（如 beforeEnter、component）：完全保留
 *
 * @param rawText - 原始路由对象文本
 * @param route - 新的路由配置（用于更新 path/name/meta）
 * @returns 更新后的路由对象文本
 */
function updateRawRouteText(rawText: string, route: RouteConfig): string {
	let updated = rawText

	updated = replacePropertyValue(updated, 'path', `'${route.path}'`)

	if (route.name !== undefined) {
		updated = replacePropertyValue(updated, 'name', `'${route.name}'`)
	}

	// 逐字段更新 meta，保留用户自定义的 meta 字段
	if (route.meta && Object.keys(route.meta).length > 0) {
		updated = updateMetaFields(updated, route.meta)
	} else if (route.meta && Object.keys(route.meta).length === 0) {
		updated = removeProperty(updated, 'meta')
	}

	return updated
}

/**
 * 逐字段更新 meta 属性
 *
 * 提取原始 meta 对象文本，对其中的字段逐个更新/添加，
 * 不删除用户自定义的 meta 字段。
 *
 * @param rawText - 原始路由对象文本
 * @param meta - 新的 meta 字段（仅包含需要更新/添加的字段）
 * @returns 更新后的路由对象文本
 */
function updateMetaFields(rawText: string, meta: RouteMeta): string {
	const existingMetaText = extractPropertyValueText(rawText, 'meta')

	if (!existingMetaText) {
		// meta 不存在，整体添加
		return replacePropertyValue(rawText, 'meta', serializeValue(meta, true))
	}

	// 逐字段更新：对 meta 中的每个字段，在原始 meta 文本中替换或添加
	let updatedMetaText = existingMetaText.trim()
	for (const [key, value] of Object.entries(meta)) {
		updatedMetaText = replacePropertyValue(updatedMetaText, key, serializeValue(value, true))
	}

	// 用更新后的 meta 文本替换原始 meta 值
	return replacePropertyValue(rawText, 'meta', updatedMetaText)
}
