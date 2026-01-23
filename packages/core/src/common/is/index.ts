/**
 * 校验值是否存在
 * @param value 待校验值
 * @param message 错误信息（可选）
 * @returns 是否存在
 */
export function isExist(value: unknown, message?: string): boolean {
	if (value === undefined || value === null || value === '') {
		if (message) throw new Error(message)
		return false
	}

	return true
}

/**
 * 校验值是否为枚举值
 * @param value 待校验值
 * @param enumValue 枚举值数组
 * @param message 错误信息（可选）
 * @returns 是否为枚举值
 */
export function isEnumValue<T>(value: unknown, enumValues: T[], message?: string): value is T {
	if (!enumValues.includes(value as T)) {
		if (message) throw new Error(message)
		return false
	}

	return true
}
