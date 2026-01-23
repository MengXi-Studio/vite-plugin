import { type OutputType, OutputTypeEnum, type VersionType, VersionTypeEnum } from './enum'
import { isEnumValue, isExist } from '@/common'

/**
 * 检查文件名是否包含非法字符
 * @param filename 文件名
 * @returns 是否为有效文件名
 */
function isValidFilename(filename: string): boolean {
	// 检查文件名是否包含非法字符（Windows 和 Unix 系统通用）
	const illegalChars = /[<>:"/\\|?*]/
	return !illegalChars.test(filename)
}

/**
 * 校验文件名是否有效
 * @param filename 文件名
 * @returns 校验通过的文件名
 */
export function validateFilename(filename: string): string {
	if (!isExist(filename)) {
		throw new Error('输出文件名不能为空！')
	}

	if (typeof filename !== 'string') {
		throw new Error(`输出文件名必须是字符串类型，当前类型：${typeof filename}`)
	}

	if (!isValidFilename(filename)) {
		throw new Error(`输出文件名包含非法字符：${filename}。文件名不能包含 < > : " / \\ | ? * 字符。`)
	}

	return filename
}

/**
 * 校验输出文件类型是否满足枚举值
 * @param value 输出文件类型值
 * @returns 校验通过的输出文件类型值
 */
export function isOutputType(value: unknown): OutputType {
	// 校验输出文件类型
	if (!isExist(value)) {
		throw new Error('输出文件类型不能为空！')
	}

	if (typeof value !== 'string') {
		throw new Error(`输出文件类型必须是字符串类型，当前类型：${typeof value}`)
	}

	// 判断输出文件类型是否满足枚举值
	if (!isEnumValue(value, Object.values(OutputTypeEnum))) {
		throw new Error(`未知的输出文件类型：${value}。有效值为：${Object.values(OutputTypeEnum).join(', ')}`)
	}

	return value as OutputType
}

/**
 * 校验版本类型是否满足枚举值
 * @param value 版本类型值
 * @returns 校验通过的版本类型值
 */
export function isVersionType(value: unknown): VersionType {
	// 校验版本类型
	if (!isExist(value)) {
		throw new Error('版本类型不能为空！')
	}

	if (typeof value !== 'string') {
		throw new Error(`版本类型必须是字符串类型，当前类型：${typeof value}`)
	}

	// 判断版本类型是否满足枚举值
	if (!isEnumValue(value, Object.values(VersionTypeEnum))) {
		throw new Error(`未知的版本类型：${value}。有效值为：${Object.values(VersionTypeEnum).join(', ')}`)
	}

	return value as VersionType
}

/**
 * 校验自定义版本是否有效
 * @param versionType 版本类型
 * @param customVersion 自定义版本
 * @returns 校验通过的自定义版本
 */
export function validateCustomVersion(versionType: VersionType, customVersion?: string): string | undefined {
	if (versionType === VersionTypeEnum.Custom) {
		if (!isExist(customVersion)) {
			throw new Error('当版本类型为 custom 时，必须提供 customVersion！')
		}

		if (typeof customVersion !== 'string') {
			throw new Error(`自定义版本必须是字符串类型，当前类型：${typeof customVersion}`)
		}

		return customVersion
	}
	return undefined
}

/**
 * 校验自定义扩展名是否有效
 * @param outputType 输出类型
 * @param customExt 自定义扩展名
 * @returns 校验通过的自定义扩展名
 */
export function validateCustomExt(outputType: OutputType, customExt?: string): string | undefined {
	if (outputType === OutputTypeEnum.Custom) {
		if (!isExist(customExt)) {
			throw new Error('当输出类型为 custom 时，必须提供 customExt！')
		}

		if (typeof customExt !== 'string') {
			throw new Error(`自定义扩展名必须是字符串类型，当前类型：${typeof customExt}`)
		}

		// 检查自定义扩展名是否包含非法字符
		if (!isValidFilename(customExt)) {
			throw new Error(`自定义扩展名包含非法字符：${customExt}。扩展名不能包含 < > : " / \\ | ? * 字符。`)
		}

		return customExt
	}
	return undefined
}
