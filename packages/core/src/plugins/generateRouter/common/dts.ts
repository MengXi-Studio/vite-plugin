import type { RouteConfig, RouteMeta } from '../types'

/**
 * 将路由元信息值转换为 TypeScript 类型字符串
 *
 * @param key - 元信息字段名
 * @param value - 元信息字段值
 * @returns TypeScript 类型字符串
 *
 * @description 转换规则：
 * - 字符串值 → `string`
 * - 布尔值 `true` → `true`（字面量类型）
 * - 布尔值 `false` → `false`（字面量类型）
 * - 数字值 → `number`
 * - 其他 → `unknown`
 */
function metaValueToType(_key: string, value: unknown): string {
	if (typeof value === 'string') return 'string'
	if (typeof value === 'boolean') return value ? 'true' : 'false'
	if (typeof value === 'number') return 'number'
	return 'unknown'
}

/**
 * 生成路由元信息的 TypeScript 类型字符串
 *
 * @param meta - 路由元信息对象
 * @returns TypeScript 类型字符串，如 `{ title: string; isTab: true }`
 *
 * @description 根据路由元信息中的字段和值生成对应的 TypeScript 类型。
 * 字段顺序与元信息对象保持一致。
 */
function generateMetaType(meta: RouteMeta): string {
	const entries = Object.entries(meta)
	if (entries.length === 0) return '{}'

	const fields = entries.map(([key, value]) => `${key}: ${metaValueToType(key, value)}`)
	return `{ ${fields.join('; ')} }`
}

/**
 * 生成路由类型声明文件内容
 *
 * @param routes - 路由配置数组
 * @param moduleName - 声明扩展的模块名称
 * @returns `.d.ts` 文件内容字符串
 *
 * @description 为路由配置生成 TypeScript 类型声明文件，
 * 扩展 `@meng-xi/uni-router` 模块的 `RouteNameMap` 接口，
 * 提供路由名称到路径和元信息的类型映射。
 *
 * **生成格式：**
 * ```typescript
 * import '@meng-xi/uni-router'
 *
 * declare module '@meng-xi/uni-router' {
 *   interface RouteNameMap {
 *     /** 首页 *\/
 *     pagesIndexIndex: { path: '/pages/index/index'; meta: { title: string; isTab: true } }
 *   }
 * }
 * ```
 *
 * **声明规则：**
 * - 每个路由生成一个 TSDoc 注释，内容为页面的 `title` 元信息
 * - 键为路由名称，值为包含 `path` 和 `meta` 的类型对象
 * - `meta` 中的字符串字段类型为 `string`，布尔 `true` 字段类型为字面量 `true`
 *
 * @example
 * ```typescript
 * generateRouterDtsContent(
 *   [
 *     { path: '/pages/index/index', name: 'pagesIndexIndex', meta: { title: '首页', isTab: true } },
 *     { path: '/pages/about/about', name: 'pagesAboutAbout', meta: { title: '关于' } }
 *   ],
 *   '@meng-xi/uni-router'
 * )
 * ```
 */
export function generateRouterDtsContent(routes: RouteConfig[], moduleName: string = '@meng-xi/uni-router'): string {
	const lines: string[] = []

	lines.push(`import '${moduleName}'`)
	lines.push('')
	lines.push(`declare module '${moduleName}' {`)
	lines.push('  interface RouteNameMap {')

	for (const route of routes) {
		const name = route.name || route.path

		// 生成 TSDoc 注释，使用 meta.title 作为描述
		if (route.meta?.title) {
			lines.push(`    /** ${route.meta.title} */`)
		}

		// 生成类型定义
		const metaType = route.meta ? generateMetaType(route.meta) : '{}'
		lines.push(`    ${name}: { path: '${route.path}'; meta: ${metaType} }`)
	}

	lines.push('  }')
	lines.push('}')

	return lines.join('\n')
}
