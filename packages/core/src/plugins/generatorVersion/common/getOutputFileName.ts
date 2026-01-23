import { isExist } from '@/common'
import { OutputTypeEnum, type OutputType } from './enum'

/**
 * 获取 txt 文件名
 * @param filename 输出文件名（不带扩展名）
 * @returns txt 文件名（带扩展名）
 */
function getTxtFileName(filename: string): string {
	return `${filename}.${OutputTypeEnum.Txt}`
}

/**
 * 获取 json 文件名
 * @param filename 输出文件名（不带扩展名）
 * @returns json 文件名（带扩展名）
 */
function getJsonFileName(filename: string): string {
	return `${filename}.${OutputTypeEnum.Json}`
}

/**
 * 获取 version 文件名
 * @param filename 输出文件名（不带扩展名）
 * @returns version 文件名（带扩展名）
 */
function getVersionFileName(filename: string): string {
	return `${filename}.${OutputTypeEnum.Version}`
}

/**
 * 获取自定义文件名
 * @param filename 输出文件名（不带扩展名）
 * @param customExt 自定义扩展名（可选）
 * @returns 自定义文件名（带扩展名）
 */
function getCustomFileName(filename: string, customExt?: string): string {
	isExist(customExt, '自定义扩展名不能为空！')

	return `${filename}.${customExt}`
}

/**
 * 获取输出文件名
 * @param outputType 输出文件类型
 * @param filename 输出文件名（不带扩展名）
 * @param customExt 自定义扩展名（可选）
 * @returns 输出文件名（带扩展名）
 */
export function getOutputFileName(outputType: OutputType, filename: string, customExt?: string): string {
	try {
		// 根据输出文件类型获取输出文件名
		const getOutputFileNameStrategies: Record<OutputType, () => string> = {
			[OutputTypeEnum.Txt]: () => getTxtFileName(filename),
			[OutputTypeEnum.Json]: () => getJsonFileName(filename),
			[OutputTypeEnum.Version]: () => getVersionFileName(filename),
			[OutputTypeEnum.Custom]: () => getCustomFileName(filename, customExt)
		}

		return getOutputFileNameStrategies[outputType]()
	} catch (err) {
		throw err
	}
}
