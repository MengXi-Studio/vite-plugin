/**
 * 检查值是否为普通对象
 *
 * @param value - 待检查的值
 * @returns 类型谓词，当值为普通对象时返回 `true`
 *
 * @description 判断给定值是否为通过 `{}` 或 `Object.create(null)` 创建的普通对象。
 * 排除 `null`、数组以及其他内置对象类型（如 `Date`、`RegExp` 等）。
 *
 * @example
 * ```typescript
 * isPlainObject({}) // true
 * isPlainObject(Object.create(null)) // true
 * isPlainObject(null) // false
 * isPlainObject([]) // false
 * isPlainObject(new Date()) // false
 * ```
 */
function isPlainObject(value: unknown): value is Record<string, any> {
	return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * 深度合并对象
 *
 * @typeParam T - 目标对象类型，必须为记录类型
 * @param sources - 待合并的源对象列表（按从左到右的顺序合并，右侧优先级更高）
 * @returns 合并后的完整对象
 *
 * @description 将多个源对象递归合并为一个新对象。合并规则：
 * - 当源值和目标值均为普通对象时，递归合并
 * - 否则，源值直接覆盖目标值
 * - `undefined` 值会被跳过，不会覆盖已有属性
 * - 不会修改任何输入的源对象
 *
 * @example
 * ```typescript
 * deepMerge(
 *   { a: 1, b: { c: 2 } },
 *   { b: { d: 3 }, e: 4 }
 * )
 * // { a: 1, b: { c: 2, d: 3 }, e: 4 }
 *
 * deepMerge(
 *   { a: { x: 1 } },
 *   { a: null }
 * )
 * // { a: null }  // 非对象值直接覆盖
 * ```
 */
export function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T {
	const result: any = {}

	for (const source of sources) {
		if (source) {
			for (const key in source) {
				if (!Object.prototype.hasOwnProperty.call(source, key)) continue

				const sourceValue = source[key]
				const targetValue = result[key]

				if (sourceValue === undefined) continue

				if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
					result[key] = deepMerge(targetValue, sourceValue)
				} else {
					result[key] = sourceValue
				}
			}
		}
	}

	return result as T
}
