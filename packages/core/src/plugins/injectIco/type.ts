/**
 * 注入网站图标链接的配置选项接口
 *
 * @interface InjectIcoOptions
 */
export interface InjectIcoOptions {
	/**
	 * 图标文件的基础路径，默认为根路径 `/`
	 *
	 * @defaultValue `/`
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
	 */ icons?: Array<{
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

	/**
	 * 是否显示详细日志
	 *
	 * @defaultValue true
	 * @example false
	 */
	verbose?: boolean

	/**
	 * 图标文件复制配置选项
	 *
	 * @remarks
	 * 当此对象存在时，才会开启图标文件复制功能
	 */
	copyOptions?: {
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
		 * @defaultValue true
		 * @example false
		 */
		overwrite?: boolean

		/**
		 * 是否支持递归复制
		 *
		 * @defaultValue true
		 * @example false
		 */
		recursive?: boolean
	}
}
