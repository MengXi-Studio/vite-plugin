import { OutputTypeEnum, type OutputType } from './enum'

/**
 * 生成文件内容
 * @param version - 版本值
 * @param outputType - 输出类型
 * @returns 生成的文件内容
 */
export function generateFileContent(version: string, outputType: OutputType): string {
	if (outputType === OutputTypeEnum.Txt || outputType === OutputTypeEnum.Version) {
		return version
	}

	// Json和Custom类型都返回JSON格式
	return JSON.stringify(
		{
			version
		},
		null,
		2
	)
}
