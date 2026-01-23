import type { OutputType, VersionType } from './common/enum'

/**
 * 版本生成插件的配置选项接口
 */
export interface GeneratorVersionOptions {
	/**
	 * 输出文件名，不带扩展名
	 *
	 * @defaultValue 'version'
	 */
	filename?: string
	/**
	 * 输出文件类型
	 *
	 * @defaultValue 'json'
	 */
	outputType?: OutputType
	/**
	 * 自定义扩展名，仅当 outputType 为 'custom' 时使用
	 *
	 * @example 'md'
	 */
	customExt?: string
	/**
	 * 版本类型
	 *
	 * @defaultValue 'build_timestamp'
	 */
	versionType?: VersionType
	/**
	 * 自定义版本，仅当 versionType 为 'custom' 时使用
	 */
	customVersion?: string
	/**
	 * 是否显示详细日志
	 *
	 * @defaultValue true
	 */
	verbose?: boolean
	/**
	 * 是否启用插件
	 *
	 * @defaultValue true
	 */
	enabled?: boolean
}
