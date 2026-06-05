import type { BasePluginOptions } from '@/factory/plugin'

/**
 * 图标配置项接口
 *
 * @interface Icon
 * @description 定义单个网站图标的属性，对应 HTML `<link>` 标签的各个属性。
 */
export interface Icon {
	/**
	 * 图标关系类型，对应 `<link>` 标签的 `rel` 属性
	 *
	 * @example 'icon'
	 * @example 'apple-touch-icon'
	 * @example 'manifest'
	 */
	rel: string

	/**
	 * 图标 URL，对应 `<link>` 标签的 `href` 属性
	 *
	 * @example '/favicon.ico'
	 * @example '/apple-touch-icon.png'
	 */
	href: string

	/**
	 * 图标尺寸，对应 `<link>` 标签的 `sizes` 属性
	 *
	 * @example '32x32'
	 * @example '180x180'
	 */
	sizes?: string

	/**
	 * 图标 MIME 类型，对应 `<link>` 标签的 `type` 属性
	 *
	 * @example 'image/png'
	 * @example 'image/svg+xml'
	 */
	type?: string
}

/**
 * 图标文件复制配置选项接口
 *
 * @interface CopyOptions
 * @description 配置图标文件从源目录到构建输出目录的复制行为，
 * 仅当此对象存在时才开启图标文件复制功能。
 */
interface CopyOptions {
	/**
	 * 图标源文件目录，用于复制图标到打包目录
	 *
	 * @example 'src/assets/icons'
	 */
	sourceDir: string

	/**
	 * 图标目标目录（打包目录），用于复制图标到打包目录
	 *
	 * @example 'dist/assets/icons'
	 */
	targetDir: string

	/**
	 * 是否覆盖同名文件
	 *
	 * @default true
	 */
	overwrite?: boolean

	/**
	 * 是否支持递归复制子目录
	 *
	 * @default true
	 */
	recursive?: boolean
}

/**
 * 网站图标管理插件的配置选项接口
 *
 * @interface FaviconManagerOptions
 * @extends {BasePluginOptions}
 *
 * @description 支持三种图标配置方式（优先级从高到低）：
 * 1. `link` - 自定义完整的 `<link>` 标签 HTML
 * 2. `url` - 完整的图标 URL
 * 3. `base` + 默认 favicon.ico - 基础路径拼接
 * 此外还支持通过 `icons` 数组配置多个图标，以及通过 `copyOptions` 复制图标文件。
 *
 * @example
 * ```typescript
 * faviconManager({
 *   base: '/assets',
 *   icons: [
 *     { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
 *     { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
 *   ],
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 * ```
 */
export interface FaviconManagerOptions extends BasePluginOptions {
	/**
	 * 图标文件的基础路径，默认为根路径 '/'
	 *
	 * @default '/'
	 * @example '/assets'
	 */
	base?: string

	/**
	 * 图标的完整 URL，如果提供则优先使用（覆盖 base + favicon.ico）
	 *
	 * @example 'https://example.com/favicon.ico'
	 */
	url?: string

	/**
	 * 自定义的完整 link 标签 HTML，如果提供则优先使用（覆盖 url 和 base）
	 *
	 * @example '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />'
	 */
	link?: string

	/**
	 * 自定义图标数组，支持多种图标格式和尺寸
	 *
	 * @example
	 * [
	 *   { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
	 *   { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
	 *   { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
	 * ]
	 */
	icons?: Icon[]

	/**
	 * 图标文件复制配置选项
	 *
	 * @remarks
	 * 当此对象存在时，才会开启图标文件复制功能
	 */
	copyOptions?: CopyOptions
}
