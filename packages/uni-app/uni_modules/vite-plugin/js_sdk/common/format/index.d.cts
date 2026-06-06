/**
 * 日期格式化选项
 */
interface DateFormatOptions {
    /** 四位年份 */
    YYYY: string;
    /** 两位年份 */
    YY: string;
    /** 两位月份 */
    MM: string;
    /** 两位日期 */
    DD: string;
    /** 两位小时（24小时制） */
    HH: string;
    /** 两位分钟 */
    mm: string;
    /** 两位秒数 */
    ss: string;
    /** 三位毫秒 */
    SSS: string;
    /** 时间戳（毫秒） */
    timestamp: string;
}

/**
 * 获取日期格式化参数
 *
 * @param date 日期对象
 * @returns 日期格式化参数对象
 *
 * @example
 * ```typescript
 * const params = getDateFormatParams(new Date())
 * // { YYYY: '2026', MM: '02', DD: '03', HH: '15', mm: '30', ss: '00', ... }
 * ```
 */
declare function getDateFormatParams(date?: Date): DateFormatOptions;
/**
 * 替换模板字符串中的变量占位符
 *
 * @param template - 包含 `{{key}}` 占位符的模板字符串
 * @param values - 占位符键值映射，支持合并多组变量（后者覆盖前者）
 * @returns 替换占位符后的字符串
 *
 * @description 将模板中的 `{{key}}` 占位符替换为对应的值。
 * 键名中的正则特殊字符会被自动转义，值中的 `$` 也会被安全处理。
 *
 * @example
 * ```typescript
 * parseTemplate('Hello {{name}}!', { name: 'World' })
 * // 'Hello World!'
 *
 * parseTemplate('{{YYYY}}-{{MM}}-{{DD}}', getDateFormatParams())
 * // '2026-06-06'
 * ```
 */
declare function parseTemplate(template: string, values: Record<string, string>): string;
/**
 * 格式化日期字符串
 *
 * @param date - 日期对象
 * @param format - 格式字符串，支持 `{YYYY}`、`{MM}`、`{DD}`、`{HH}`、`{mm}`、`{ss}` 等占位符
 * @returns 格式化后的日期字符串
 *
 * @example
 * ```typescript
 * formatDate(new Date(), '{YYYY}-{MM}-{DD}T{HH}:{mm}:{ss}')
 * // '2026-06-06T15:30:00'
 * ```
 */
declare function formatDate(date: Date, format: string): string;
/**
 * 将字节数格式化为人类可读的文件大小字符串
 *
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小字符串
 *
 * @description 转换规则：
 * - 小于 1KB：显示为 `xB`（如 `512B`）
 * - 小于 1MB：显示为 `x.xKB`（如 `1.5KB`）
 * - 大于等于 1MB：显示为 `x.xxMB`（如 `2.35MB`）
 *
 * @example
 * ```typescript
 * formatFileSize(512)     // '512B'
 * formatFileSize(1536)    // '1.5KB'
 * formatFileSize(2461726) // '2.35MB'
 * ```
 */
declare function formatFileSize(bytes: number): string;

export { formatDate, formatFileSize, getDateFormatParams, parseTemplate };
export type { DateFormatOptions };
