import { OutputTypeEnum, type OutputType } from './enum'

/**
 * 生成文件内容
 * @param version - 版本值
 * @param outputType - 输出类型
 * @returns 生成的文件内容或 undefined
 */
export function generateFileContent(version: string, outputType: OutputType): string | undefined {
	if ([OutputTypeEnum.Txt, OutputTypeEnum.Version].includes(outputType)) {
		return version
	} else if ([OutputTypeEnum.Json, OutputTypeEnum.Custom].includes(outputType)) {
		return JSON.stringify(
			{
				version
			},
			null,
			2
		)
	}
}
