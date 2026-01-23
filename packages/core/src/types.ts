/**
 * 获取枚举类型的所有值
 *
 * @template T - 枚举类型
 * @param enumObj - 枚举对象
 * @returns 枚举类型的所有值
 */
export type EnumValues<T extends Record<string, string | number>> = T[keyof T]
