import type { RouteConfig, RouteMeta } from '../types'

/** 将路由元信息值转换为 TypeScript 类型字符串（布尔值转为字面量类型以提供更精确的类型） */
function metaValueToType(_key: string, value: unknown): string {
	if (typeof value === 'string') return 'string'
	if (typeof value === 'boolean') return value ? 'true' : 'false'
	if (typeof value === 'number') return 'number'
	return 'unknown'
}

/** 生成路由元信息的 TypeScript 类型字符串，如 `{ title: string; isTab: true }` */
function generateMetaType(meta: RouteMeta): string {
	const entries = Object.entries(meta)
	if (entries.length === 0) return '{}'

	const fields = entries.map(([key, value]) => `${key}: ${metaValueToType(key, value)}`)
	return `{ ${fields.join('; ')} }`
}

/**
 * 生成路由类型声明文件内容
 *
 * 扩展 `@meng-xi/uni-router` 模块的 `RouteNameMap` 接口，
 * 提供路由名称到路径和元信息的类型映射。每条路由以 `meta.title` 作为 TSDoc 描述。
 *
 * @param routes - 路由配置数组
 * @param moduleName - 声明扩展的模块名称，默认 `@meng-xi/uni-router`
 * @returns `.d.ts` 文件内容字符串
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
