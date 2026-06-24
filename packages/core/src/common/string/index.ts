/**
 * 将字符串转换为驼峰命名（camelCase）
 *
 * @param str - 输入字符串
 * @param separators - 分隔符正则，默认匹配 `/` 和 `-`
 * @returns 驼峰命名字符串
 *
 * @example
 * ```typescript
 * toCamelCase('/pages/index/index')  // 'pagesIndexIndex'
 * toCamelCase('user-name')          // 'userName'
 * ```
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
 *
 * @example
 * ```typescript
 * toPascalCase('/pages/index/index')  // 'PagesIndexIndex'
 * toPascalCase('user-name')           // 'UserName'
 * ```
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
 *
 * @description 支持移除单行注释（`//`）和多行注释（`/* *\/`），
 * 常用于解析带注释的 JSON 配置文件（如 pages.json）。
 */
export function stripJsonComments(jsonString: string): string {
	return jsonString.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * 转义正则表达式特殊字符
 *
 * @param str - 要转义的字符串
 * @returns 转义后的字符串，可安全用于正则表达式
 *
 * @description 将正则特殊字符 `.*+?^${}()|[]\` 转义为字面量，
 * 避免用户输入或动态字符串被误解析为正则元字符。
 */
export function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
