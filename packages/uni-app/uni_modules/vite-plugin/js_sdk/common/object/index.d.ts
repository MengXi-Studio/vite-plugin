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
declare function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T;

export { deepMerge };
