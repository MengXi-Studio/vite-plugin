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
	icons?: Array<{
		/**
		 * 图标关系类型
		 */
		rel: string

		/**
		 * 图标 URL
		 */
		href: string

		/**
		 * 图标尺寸
		 */
		sizes?: string

		/**
		 * 图标 MIME 类型
		 */
		type?: string
	}>
}
