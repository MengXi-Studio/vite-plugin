import type { BasePluginOptions } from '@/factory/types'

/**
 * 版本号格式类型
 *
 * @description
 * - 'timestamp': 时间戳格式，如 '20260203153000'
 * - 'date': 日期格式，如 '2026.02.03'
 * - 'datetime': 日期时间格式，如 '2026.02.03.153000'
 * - 'semver': 语义化版本格式，如 '1.0.0'
 * - 'hash': 随机哈希格式，如 'a1b2c3d4'
 * - 'custom': 自定义格式，需要配合 customFormat 使用
 */
export type VersionFormat = 'timestamp' | 'date' | 'datetime' | 'semver' | 'hash' | 'custom'

/**
 * 版本号输出类型
 *
 * @description
 * - 'file': 输出到文件
 * - 'define': 通过 Vite 的 define 注入到代码中
 * - 'both': 同时输出到文件和注入代码
 */
export type OutputType = 'file' | 'define' | 'both'

/**
 * 自动生成版本号插件的配置选项接口
 *
 * @interface GenerateVersionOptions
 */
export interface GenerateVersionOptions extends BasePluginOptions {
	/**
	 * 版本号格式
	 *
	 * @default 'timestamp'
	 */
	format?: VersionFormat

	/**
	 * 自定义格式模板，仅当 format 为 'custom' 时有效
	 *
	 * @description 支持以下占位符：
	 * - {YYYY}: 四位年份
	 * - {MM}: 两位月份
	 * - {DD}: 两位日期
	 * - {HH}: 两位小时
	 * - {mm}: 两位分钟
	 * - {ss}: 两位秒数
	 * - {timestamp}: 时间戳
	 * - {hash}: 随机哈希
	 * - {major}: 主版本号（需配合 semverBase）
	 * - {minor}: 次版本号（需配合 semverBase）
	 * - {patch}: 补丁版本号（需配合 semverBase）
	 *
	 * @example '{YYYY}.{MM}.{DD}-{hash}'
	 */
	customFormat?: string

	/**
	 * 语义化版本基础值，用于 semver 格式
	 *
	 * @default '1.0.0'
	 */
	semverBase?: string

	/**
	 * 是否自动递增补丁版本号
	 *
	 * @default false
	 */
	autoIncrement?: boolean

	/**
	 * 输出类型
	 *
	 * @default 'file'
	 */
	outputType?: OutputType

	/**
	 * 输出文件路径（相对于构建输出目录）
	 *
	 * @default 'version.json'
	 */
	outputFile?: string

	/**
	 * 注入到代码中的全局变量名
	 *
	 * @default '__APP_VERSION__'
	 */
	defineName?: string

	/**
	 * 哈希长度
	 *
	 * @default 8
	 */
	hashLength?: number

	/**
	 * 版本号前缀
	 *
	 * @example 'v'
	 */
	prefix?: string

	/**
	 * 版本号后缀
	 *
	 * @example '-beta'
	 */
	suffix?: string

	/**
	 * 额外的版本信息，会包含在输出的 JSON 文件中
	 */
	extra?: Record<string, any>
}
