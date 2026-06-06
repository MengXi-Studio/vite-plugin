/**
 * 将字符串转换为驼峰命名（camelCase）
 *
 * @param str - 输入字符串
 * @param separators - 分隔符正则，默认匹配 `/` 和 `-`
 * @returns 驼峰命名字符串
 */
export function toCamelCase(str: string, separators: RegExp = /[/-]/): string {
	return str
		.replace(/^\/+/, '')
		.split(separators)
		.filter(Boolean)
		.map((part, index) => {
			if (index === 0) return part.toLowerCase()
			return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
		})
		.join('')
}

/**
 * 将字符串转换为帕斯卡命名（PascalCase）
 *
 * @param str - 输入字符串
 * @param separators - 分隔符正则，默认匹配 `/` 和 `-`
 * @returns 帕斯卡命名字符串
 */
export function toPascalCase(str: string, separators: RegExp = /[/-]/): string {
	return str
		.replace(/^\/+/, '')
		.split(separators)
		.filter(Boolean)
		.map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join('')
}

/**
 * 移除 JSON 字符串中的注释
 *
 * @param jsonString - 包含注释的 JSON 字符串
 * @returns 移除注释后的 JSON 字符串
 */
export function stripJsonComments(jsonString: string): string {
	return jsonString.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
}
