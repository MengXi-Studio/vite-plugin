import type { BasePluginOptions } from '@/factory/types'
import type { UniAppTabBarConfig, UniAppPageConfig } from '../generateRouter/types'
export type { UniAppPageConfig } from '../generateRouter/types'
export type { UniAppTabBarConfig } from '../generateRouter/types'

// 纯转发导出，供 generatePages 子路径按需使用，不参与父级聚合以避免歧义
export type { UniAppPagesJson } from '../generateRouter/types'

/**
 * `<route-config>` 自定义块中可声明的页面配置
 *
 * @description 在每个 `.vue` 文件中通过 `<route-config>` 自定义块声明页面的
 * 标题、样式、元信息、tabBar 归属以及 tab 图标。若仅配置 tab 相关字段则自动应用到 tabBar。
 *
 * @example
 * ```vue
 * <route-config>
 * {
 *   "title": "首页",
 *   "isTab": true,
 *   "tab": {
 *     "iconPath": "static/tab/home.png",
 *     "selectedIconPath": "static/tab/home-active.png"
 *   }
 * }
 * </route-config>
 * ```
 */
export interface RouteConfigBlock {
	/** 页面标题，映射为 style.navigationBarTitleText */
	title?: string
	/** 页面样式配置，原样写入 pages.json 的 style 字段 */
	style?: Record<string, any>
	/** 页面元信息，原样写入 pages.json 的 meta 字段 */
	meta?: Record<string, any>
	/** 是否为 tabBar 页面，开启后自动归集到 tabBar.list */
	isTab?: boolean
	/** 页面名称，写入 pages.json 的 name 字段（优先级高于文件推断） */
	name?: string
	/** tabBar 图标与文本覆盖（仅 isTab 页面生效，优先级高于工厂 overrides 与全局模板） */
	tab?: TabBarItemOverride
	[key: string]: any
}

/**
 * 单个 tabBar 项的图标与文本覆盖配置
 */
export interface TabBarItemOverride {
	/** tabBar 显示文本（缺省时取页面标题或文件名） */
	text?: string
	/** 未选中的图标路径 */
	iconPath?: string
	/** 选中的图标路径 */
	selectedIconPath?: string
}

/**
 * 扫描得到的页面（含页面配置与 tab 覆盖信息）
 */
export interface ScannedPage {
	/** 组装后的 pages.json 页面配置项 */
	page: UniAppPageConfig
	/** 页面内声明的 tab 覆盖信息（来自 route-config.tab），无则为 undefined */
	tab?: TabBarItemOverride
}

/**
 * 分包配置
 */
export interface SubPackageConfig {
	/** 分包标识，写入 subPackages 的 root 字段（如 'pages-sub'） */
	root: string
	/** 分包实际源码目录（相对于项目根目录，如 'src/pages-sub'） */
	dir: string
}

/**
 * tabBar 模板配置（标记 + 模板归集）
 *
 * @description 提供整体的样式模板，插会将所有声明了 `isTab: true` 的页面
 * 自动归集到 list。`overrides` 可按页面路径覆盖单项文本与图标。
 */
export interface TabBarTemplate extends Omit<UniAppTabBarConfig, 'list'> {
	/** 应用到所有自动生成 tab 项的默认图标路径（可选模板） */
	iconPath?: string
	/** 应用到所有自动生成 tab 项的默认选中图标路径（可选模板） */
	selectedIconPath?: string
	/** 按 pagePath 覆盖单项配置 */
	overrides?: Record<
		string,
		{
			text?: string
			iconPath?: string
			selectedIconPath?: string
		}
	>
}

/**
 * 生成 uni-app pages.json 插件选项
 */
export interface GeneratePagesOptions extends BasePluginOptions {
	/** pages.json 文件路径（相对于项目根目录） @default 'src/pages.json' */
	pagesJsonPath?: string

	/** 主包页面目录（相对于项目根目录） @default 'src/pages' */
	pagesDir?: string

	/** 分包配置列表，目录不存在时自动跳过 @default [{ root: 'pages-sub', dir: 'src/pages-sub' }] */
	subPackages?: SubPackageConfig[]

	/** 页面配置自定义块名称 @default 'route-config' */
	routeConfigBlock?: string

	/** 页面标题缺失时的兜底策略 @default 'filename' */
	titleFallback?: 'filename' | 'none'

	/** tabBar 模板，提供后自动生成 tabBar（基于 isTab 标记归集） */
	tabBar?: TabBarTemplate

	/** 页面文件扩展名列表 @default ['.vue'] */
	includeExtensions?: string[]

	/** 需要排除的路径模式列表 @default [] */
	excludePatterns?: string[]

	/** 是否监听页面目录变化并自动重新生成 @default true */
	watch?: boolean
}
