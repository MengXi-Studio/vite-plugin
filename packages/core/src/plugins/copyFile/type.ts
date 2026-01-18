/**
 * 复制文件插件的配置选项接口
 *
 * @interface CopyFileOptions
 */
export interface CopyFileOptions {
	/**
	 * 源文件目录的路径
	 *
	 * @example 'src/assets'
	 */
	sourceDir: string
	/**
	 * 目标文件目录的路径
	 *
	 * @example 'dist/assets'
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
	/**
	 * 是否显示详细日志
	 *
	 * @defaultValue true
	 * @example false
	 */
	verbose?: boolean
	/**
	 * 是否启用复制功能
	 *
	 * @defaultValue true
	 * @example false
	 */
	enabled?: boolean
}
