import type { BasePluginOptions } from '@/factory/types'

/**
 * 路由元信息
 */
export interface RouteMeta {
	/** 页面标题 */
	title?: string
	/** 是否为TabBar页面 */
	isTab?: boolean
	/** 是否需要登录 */
	requireAuth?: boolean
	/** 自定义扩展字段 */
	[key: string]: unknown
}

/**
 * 路由配置项
 */
export interface RouteConfig {
	/** 路由路径 */
	path: string
	/** 路由名称（用于命名路由导航） */
	name?: string
	/** 路由元信息 */
	meta?: RouteMeta
}

/**
 * uni-app pages.json 中的页面配置项
 */
export interface UniAppPageConfig {
	/** 页面路径 */
	path: string
	/** 页面样式 */
	style?: {
		/** 导航栏标题 */
		navigationBarTitleText?: string
		/** 是否需要登录 */
		requireAuth?: boolean
		/** 其他自定义属性 */
		[key: string]: unknown
	}
	/** 其他属性 */
	[key: string]: unknown
}

/**
 * uni-app pages.json 中的 tabBar 配置
 */
export interface UniAppTabBarConfig {
	/** tabBar 列表 */
	list?: Array<{
		/** 页面路径 */
		pagePath: string
		/** 文字 */
		text?: string
		/** 图标路径 */
		iconPath?: string
		/** 选中图标路径 */
		selectedIconPath?: string
	}>
	/** 其他属性 */
	[key: string]: unknown
}

/**
 * uni-app pages.json 结构
 */
export interface UniAppPagesJson {
	/** 页面列表 */
	pages: UniAppPageConfig[]
	/** 子包 */
	subPackages?: Array<{
		root: string
		pages: UniAppPageConfig[]
	}>
	/** tabBar 配置 */
	tabBar?: UniAppTabBarConfig
	/** 全局样式 */
	globalStyle?: Record<string, unknown>
	/** 其他属性 */
	[key: string]: unknown
}

/**
 * 输出文件格式类型
 */
export type OutputFormat = 'ts' | 'js'

/**
 * 路由名称生成策略
 */
export type NameStrategy = 'path' | 'camelCase' | 'pascalCase' | 'custom'

/**
 * 生成路由配置插件选项
 */
export interface GenerateRouterOptions extends BasePluginOptions {
	/**
	 * pages.json 文件路径（相对于项目根目录）
	 *
	 * @default 'src/pages.json'
	 */
	pagesJsonPath?: string

	/**
	 * 输出文件路径（相对于项目根目录）
	 *
	 * @default 'src/router.config.ts'
	 */
	outputPath?: string

	/**
	 * 输出文件格式
	 *
	 * @default 'ts'
	 */
	outputFormat?: OutputFormat

	/**
	 * 路由名称生成策略
	 *
	 * @default 'camelCase'
	 */
	nameStrategy?: NameStrategy

	/**
	 * 自定义路由名称生成函数
	 *
	 * @param path - 页面路径
	 * @returns 路由名称
	 */
	customNameGenerator?: (path: string) => string

	/**
	 * 是否包含子包路由
	 *
	 * @default true
	 */
	includeSubPackages?: boolean

	/**
	 * 是否监听 pages.json 变化并自动重新生成
	 *
	 * @default true
	 */
	watch?: boolean

	/**
	 * 额外的元信息字段映射
	 *
	 * @description 将 pages.json 中 style 的字段映射到 meta 中
	 * @example { 'navigationBarTitleText': 'title', 'requireAuth': 'requireAuth' }
	 */
	metaMapping?: Record<string, string>

	/**
	 * 生成的文件头部注释
	 */
	headerComment?: string

	/**
	 * 是否导出类型定义
	 *
	 * @default true
	 */
	exportTypes?: boolean
}
