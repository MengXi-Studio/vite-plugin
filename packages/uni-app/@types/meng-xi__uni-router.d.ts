/**
 * @meng-xi/uni-router 类型声明（本地桩）
 * @description 正式版本由独立的 uni-router 包提供，
 * 此处仅为示例项目提供最小化类型以免 IDE/tsc 报错。
 */

declare module '@meng-xi/uni-router' {
	/**
	 * 路由元信息
	 */
	export interface RouteMeta {
		title?: string
		isTab?: boolean
		requireAuth?: boolean
		[key: string]: unknown
	}

	/**
	 * 路由配置项
	 */
	export interface RouteConfig {
		path: string
		name?: string
		meta?: RouteMeta
		[key: string]: unknown
	}

	/**
	 * 路由名称到路径和元信息的类型映射接口
	 * @description 由 generateRouter 插件通过 .d.ts 自动扩展
	 */
	export interface RouteNameMap {}
}
