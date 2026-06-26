import type { RouteConfig, RouteMeta, GenerateRouterOptions } from '../types'
import { parsePluginTemplate } from '@/common/format'
import { serializeRoute, serializeValue, replacePropertyValue, removeProperty, extractPropertyValueText } from './code-manipulation'

/** 插件版本号，由 unbuild 在构建时通过 replace 配置从 package.json 注入（类型声明见 src/types/global.d.ts） */
const PLUGIN_VERSION = __PLUGIN_VERSION__

/** 默认注释头模板（仅需指定占位符，JSDoc 标签名由 generateFileHeader 自动推断） */
const DEFAULT_HEADER_TEMPLATE = '{name} {date} {version}'

/** 默认日期格式 */
const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/**
 * 生成路由配置文件内容
 *
 * @param routes - 路由配置数组
 * @param options - 插件配置
 * @param existingRawTexts - 已存在的路由对象原始文本映射（用于保留用户自定义属性）
 */
export function generateFileContent(routes: RouteConfig[], options: Pick<GenerateRouterOptions, 'exportTypes' | 'outputFormat' | 'headerTemplate' | 'customFields'>, existingRawTexts?: Map<string, string>): string {
	const typeImport = generateTypeImport(options)
	const isTS = options.outputFormat === 'ts'
	const typeAnnotation = isTS && options.exportTypes ? ': RouteConfig[]' : ''

	const routeStrings = routes.map(route => {
		const rawText = existingRawTexts?.get(route.path)

		if (rawText) {
			return updateRawRouteText(rawText, route)
		}

		return serializeRoute(route)
	})

	// 缩进：所有行统一加 \t
	const indentedRoutes = routeStrings
		.map(s => {
			const lines = s.split('\n')
			return lines.map(line => '\t' + line).join('\n')
		})
		.join(',\n')

	const importLine = typeImport ? `${typeImport}\n\n` : ''
	const headerLine = options.headerTemplate ? generateFileHeader(options.headerTemplate === true ? DEFAULT_HEADER_TEMPLATE : options.headerTemplate, options.customFields) + '\n\n' : ''

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
 * 根据模板生成 JSDoc 风格的注释头。每个占位符自动对应一个 JSDoc 标签行：
 * - `{name}` → `@plugin` 标签行
 * - `{date}` / `{date:FORMAT}` → `@date` 标签行
 * - `{version}` → `@version` 标签行
 * - `{custom:KEY}` → `@KEY` 标签行（KEY 即为标签名）
 *
 * 占位符之间的非占位符文本被丢弃，每个标签行独立成行。
 * 若模板完全不包含占位符，则按纯文本原样输出。
 *
 * @param headerTemplate - 注释头模板字符串
 * @param customFields - 自定义字段键值对
 * @returns JSDoc 风格的注释头文本
 */
function generateFileHeader(headerTemplate: string, customFields?: Record<string, string>): string {
	const lines = generateHeaderLines(headerTemplate, customFields)
	const body = lines.map(line => ` * ${line}`).join('\n')
	return `/**\n${body}\n */`
}

/** 占位符信息 */
interface HeaderPlaceholder {
	/** 原始占位符文本，如 `{name}`、`{date:YYYY-MM-DD}`、`{custom:author}` */
	raw: string
	/** 对应的 JSDoc 标签名，如 `plugin`、`date`、`version`、`author` */
	tag: string
}

/** 从模板中提取占位符并映射到 JSDoc 标签名（非占位符文本被忽略） */
function extractHeaderPlaceholders(template: string): HeaderPlaceholder[] {
	const placeholders: HeaderPlaceholder[] = []
	const regex = /\{(name|date(?::[^}]+)?|version|custom:[^}]+)\}/g
	let match: RegExpExecArray | null
	while ((match = regex.exec(template)) !== null) {
		const raw = match[0]
		const content = match[1]
		let tag: string
		if (content === 'name') {
			tag = 'plugin'
		} else if (content === 'version') {
			tag = 'version'
		} else if (content === 'date' || content.startsWith('date:')) {
			tag = 'date'
		} else if (content.startsWith('custom:')) {
			tag = content.substring(7)
		} else {
			continue
		}
		placeholders.push({ raw, tag })
	}
	return placeholders
}

/**
 * 根据模板生成注释头行数组
 *
 * - 含占位符：每个占位符生成 `@tag value` 行，非占位符文本丢弃
 * - 无占位符：按纯文本原样输出
 */
function generateHeaderLines(headerTemplate: string, customFields?: Record<string, string>): string[] {
	const placeholders = extractHeaderPlaceholders(headerTemplate)

	if (placeholders.length === 0) {
		return headerTemplate.split('\n')
	}

	const templateParams = {
		name: 'generate-router',
		version: PLUGIN_VERSION,
		customFields,
		defaultDateFormat: DEFAULT_DATE_FORMAT
	}

	return placeholders.map(p => {
		// {custom:KEY} 缺失时 parsePluginTemplate 原样返回占位符文本
		const value = parsePluginTemplate(p.raw, templateParams)
		return `@${p.tag} ${value}`
	})
}

/** 生成类型导入语句（JS 模式或未启用类型导出时返回空） */
function generateTypeImport(options: Pick<GenerateRouterOptions, 'exportTypes' | 'outputFormat'>): string {
	if (!options.exportTypes || options.outputFormat === 'js') return ''
	return `import type { RouteConfig } from '@meng-xi/uni-router'`
}

/**
 * 更新已有路由对象的原始文本，保留用户自定义属性
 *
 * - path/name/meta：用新值更新
 * - 其他属性（如 beforeEnter、component）：原样保留
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

/** 逐字段更新 meta，保留用户自定义字段（仅添加/更新，不删除） */
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
