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

export { formatFileSize, getDateFormatParams };
export type { DateFormatOptions };
