import type { BasePluginOptions } from '@/factory/types'

/**
 * 复制文件插件的配置选项接口
 *
 * @interface CopyFileOptions
 */
export interface CopyFileOptions extends BasePluginOptions {
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
	 * @default true
	 */
	overwrite?: boolean

	/**
	 * 是否支持递归复制
	 *
	 * @default true
	 */
	recursive?: boolean
}
