import { type OutputType, OutputTypeEnum, type VersionType, VersionTypeEnum } from './enum'
import { isEnumValue, isExist } from '@/common'

/**
 * 校验输出文件类型是否满足枚举值
 * @param value 输出文件类型值
 * @returns 校验通过的输出文件类型值
 */
export function isOutputType(value: unknown): OutputType {
	// 校验输出文件类型
	isExist(value, '输出文件类型不能为空！')
	// 判断输出文件类型是否满足枚举值
	isEnumValue(value, Object.values(OutputTypeEnum), `未知的输出文件类型：${value}`)

	return value as OutputType
}

/**
 * 校验版本类型是否满足枚举值
 * @param value 版本类型值
 * @returns 校验通过的版本类型值
 */
export function isVersionType(value: unknown): VersionType {
	// 校验版本类型
	isExist(value, '版本类型不能为空！')
	// 判断版本类型是否满足枚举值
	isEnumValue(value, Object.values(VersionTypeEnum), `未知的版本类型：${value}`)

	return value as VersionType
}
