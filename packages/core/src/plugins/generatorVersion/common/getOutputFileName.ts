import { isExist } from '@/common'
import { OutputTypeEnum, type OutputType } from './enum'

/**
 * 获取输出文件名
 * @param outputType 输出文件类型
 * @param filename 输出文件名（不带扩展名）
 * @param customExt 自定义扩展名（可选）
 * @returns 输出文件名（带扩展名）
 */
export function getOutputFileName(outputType: OutputType, filename: string, customExt?: string): string {
	try {
		// 根据输出类型获取扩展名
		let ext: string
		if (outputType === OutputTypeEnum.Custom) {
			isExist(customExt, '自定义扩展名不能为空！')
			ext = customExt!
		} else {
			ext = outputType
		}

		// 拼接文件名和扩展名
		return `${filename}.${ext}`
	} catch (err) {
		throw err
	}
}
