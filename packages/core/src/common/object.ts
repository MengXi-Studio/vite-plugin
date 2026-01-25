/**
 * 深度合并对象
 *
 * @param target 目标对象
 * @param sources 源对象列表
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T {
	const result: any = {}

	for (const source of sources) {
		if (source) {
			for (const key in source) {
				const sourceValue = source[key]
				const targetValue = result[key]

				if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue) && typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue)) {
					// 深度合并嵌套对象
					result[key] = deepMerge(targetValue, sourceValue)
				} else {
					// 简单赋值（覆盖）
					result[key] = sourceValue
				}
			}
		}
	}

	return result as T
}
