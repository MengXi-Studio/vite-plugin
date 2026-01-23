/**
 * 校验值是否存在
 * @param value 待校验值
 * @returns 是否存在
 */
export function isExist(value: unknown): boolean {
	if (value === undefined || value === null || value === '') {
		return false
	}

	return true
}

/**
 * 校验值是否为枚举值
 * @param value 待校验值
 * @param enumValue 枚举值数组
 * @returns 是否为枚举值
 */
export function isEnumValue<T>(value: unknown, enumValues: T[]): value is T {
	if (!enumValues.includes(value as T)) {
		return false
	}

	return true
}
