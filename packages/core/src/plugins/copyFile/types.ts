import type { BasePluginOptions } from '@/factory/types'

/**
 * 复制文件插件的配置选项接口
 *
 * @interface CopyFileOptions
 * @extends {BasePluginOptions}
 *
 * @description 定义文件复制插件的所有可配置项，包括源目录、目标目录、
 * 覆盖策略、递归复制和增量复制等选项。
 *
 * @example
 * ```typescript
 * copyFile({
 *   sourceDir: 'src/assets',
 *   targetDir: 'dist/assets',
 *   overwrite: true,
 *   recursive: true,
 *   incremental: true
 * })
 * ```
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
	 * 是否支持递归复制子目录
	 *
	 * @default true
	 */
	recursive?: boolean

	/**
	 * 是否启用增量复制，仅复制有变动的文件
	 *
	 * @description 启用后，插件会比较源文件和目标文件的大小和修改时间，
	 * 仅复制有差异的文件，跳过未变化的文件以提高构建速度。
	 *
	 * @default true
	 */
	incremental?: boolean
}
