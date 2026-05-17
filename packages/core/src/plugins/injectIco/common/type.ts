import type { Icon } from '../types'

/**
 * 图标配置选项接口
 *
 * @interface IconOptions
 */
export interface IconOptions {
	/**
	 * 图标文件的基础路径，默认为根路径 `/`
	 */
	base?: string

	/**
	 * 图标的完整 URL，如果提供则优先使用（覆盖 base + favicon.ico）
	 */
	url?: string

	/**
	 * 自定义的完整 link 标签 HTML，如果提供则优先使用（覆盖 url 和 base）
	 */
	link?: string

	/**
	 * 自定义图标数组，支持多种图标格式和尺寸
	 */
	icons?: Icon[]
}
