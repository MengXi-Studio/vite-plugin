import type { VersionFormat, VersionInfo } from '../types'
import { generateRandomHash, parseTemplate } from './utils'
import { getDateFormatParams } from '@/common/format'

/**
 * 根据格式生成版本号
 *
 * @param {object} params - 生成参数
 * @param {VersionFormat} params.format - 版本号格式
 * @param {Date} params.buildTime - 构建时间
 * @param {number} params.hashLength - 哈希长度
 * @param {string} [params.semverBase] - 语义化版本基础值
 * @param {string} [params.customFormat] - 自定义格式模板
 * @param {string} [params.prefix] - 版本号前缀
 * @param {string} [params.suffix] - 版本号后缀
 * @returns {string} 生成的版本号字符串
 *
 * @description 根据配置的 format 生成不同格式的版本号：
 * - `timestamp`: 紧凑时间戳格式，如 `20260203153000`
 * - `date`: 日期格式，如 `2026.02.03`
 * - `datetime`: 日期时间格式，如 `2026.02.03.153000`
 * - `semver`: 语义化版本格式，如 `1.0.0`
 * - `hash`: 随机哈希格式，如 `a1b2c3d4`
 * - `custom`: 自定义格式，通过 parseCustomFormat 解析
 *
 * 生成的版本号会自动添加 prefix 和 suffix。
 */
export function generateVersionString(params: { format: VersionFormat; buildTime: Date; hashLength: number; semverBase?: string; customFormat?: string; prefix?: string; suffix?: string }): string {
	const { format, buildTime, hashLength, semverBase, customFormat, prefix, suffix } = params
	const dateParams = getDateFormatParams(buildTime)
	const hash = generateRandomHash(hashLength)

	let version: string

	switch (format) {
		case 'timestamp':
			version = `${dateParams.YYYY}${dateParams.MM}${dateParams.DD}${dateParams.HH}${dateParams.mm}${dateParams.ss}`
			break

		case 'date':
			version = `${dateParams.YYYY}.${dateParams.MM}.${dateParams.DD}`
			break

		case 'datetime':
			version = `${dateParams.YYYY}.${dateParams.MM}.${dateParams.DD}.${dateParams.HH}${dateParams.mm}${dateParams.ss}`
			break

		case 'semver':
			version = semverBase || '1.0.0'
			break

		case 'hash':
			version = hash
			break

		case 'custom':
			version = parseCustomFormat(customFormat || '', { ...dateParams, hash }, semverBase)
			break

		default:
			version = dateParams.timestamp
	}

	const prefixStr = prefix || ''
	const suffixStr = suffix || ''

	return `${prefixStr}${version}${suffixStr}`
}

/**
 * 解析自定义格式模板
 *
 * @param {string} template - 自定义格式模板字符串
 * @param {Record<string, string>} values - 模板变量映射
 * @param {string} [semverBase] - 语义化版本基础值
 * @returns {string} 解析后的版本号字符串
 *
 * @description 使用 parseTemplate 工具函数解析自定义格式模板。
 * 如果配置了 semverBase，会额外解析 major、minor、patch 占位符。
 */
export function parseCustomFormat(template: string, values: Record<string, string>, semverBase?: string): string {
	const templateValues = { ...values }

	if (semverBase) {
		const [major, minor, patch] = semverBase.split('.')
		templateValues.major = major || '1'
		templateValues.minor = minor || '0'
		templateValues.patch = patch || '0'
	}

	return parseTemplate(template, templateValues)
}

/**
 * 生成版本信息对象
 *
 * @param {object} params - 生成参数
 * @param {string} params.version - 版本号字符串
 * @param {Date} params.buildTime - 构建时间
 * @param {VersionFormat} params.format - 版本号格式
 * @param {Record<string, any>} [params.extra] - 额外附加字段
 * @returns {VersionInfo} 包含版本号、构建时间、时间戳、格式和额外信息的对象
 *
 * @description 生成完整的版本信息对象，包含版本号字符串、ISO 格式构建时间、
 * 毫秒时间戳、版本格式类型以及通过 extra 选项附加的自定义字段。
 */
export function generateVersionInfoObject(params: { version: string; buildTime: Date; format: VersionFormat; extra?: Record<string, any> }): VersionInfo {
	return {
		version: params.version,
		buildTime: params.buildTime.toISOString(),
		timestamp: params.buildTime.getTime(),
		format: params.format,
		...params.extra
	}
}
