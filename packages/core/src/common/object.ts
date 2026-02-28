/**
 * 检查值是否为普通对象（非数组、非null）
 */
function isPlainObject(value: unknown): value is Record<string, any> {
	return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * 深度合并对象
 *
 * @description 将多个源对象深度合并到一个新对象中。
 * - undefined 值会被跳过，不会覆盖已有值
 * - 嵌套对象会递归合并
 * - 数组会直接覆盖，不会合并
 * - null 值会覆盖已有值
 *
 * @param sources 源对象列表
 * @returns 合并后的对象
 *
 * @example
 * ```typescript
 * // 基本合并
 * deepMerge({ a: 1 }, { b: 2 }) // { a: 1, b: 2 }
 *
 * // undefined 不覆盖
 * deepMerge({ a: 1 }, { a: undefined }) // { a: 1 }
 *
 * // 嵌套对象合并
 * deepMerge({ a: { b: 1 } }, { a: { c: 2 } }) // { a: { b: 1, c: 2 } }
 *
 * // 数组覆盖
 * deepMerge({ a: [1, 2] }, { a: [3, 4] }) // { a: [3, 4] }
 * ```
 */
export function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T {
	const result: any = {}

	for (const source of sources) {
		if (source) {
			for (const key in source) {
				// 检查是否为自身属性
				if (!Object.prototype.hasOwnProperty.call(source, key)) {
					continue
				}

				const sourceValue = source[key]
				const targetValue = result[key]

				// 跳过 undefined 值，避免覆盖已有默认值
				if (sourceValue === undefined) {
					continue
				}

				// 深度合并嵌套对象
				if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
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
