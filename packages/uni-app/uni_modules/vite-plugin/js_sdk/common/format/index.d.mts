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
 * 数字补零格式化
 *
 * @param num 要格式化的数字
 * @param length 目标长度
 * @returns 补零后的字符串
 *
 * @example
 * ```typescript
 * padNumber(5, 2)  // '05'
 * padNumber(12, 3) // '012'
 * padNumber(123, 2) // '123'
 * ```
 */
declare function padNumber(num: number, length?: number): string;
/**
 * 生成随机哈希字符串
 *
 * @param length 哈希长度，范围 1-64
 * @returns 随机哈希字符串
 *
 * @example
 * ```typescript
 * generateRandomHash(8)  // 'a1b2c3d4'
 * generateRandomHash(16) // 'a1b2c3d4e5f6g7h8'
 * ```
 */
declare function generateRandomHash(length?: number): string;
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
 * 格式化日期
 *
 * @param date 日期对象
 * @param format 格式模板
 * @returns 格式化后的日期字符串
 *
 * @example
 * ```typescript
 * formatDate(new Date(), '{YYYY}-{MM}-{DD}')         // '2026-02-03'
 * formatDate(new Date(), '{YYYY}{MM}{DD}{HH}{mm}{ss}') // '20260203153000'
 * formatDate(new Date(), '{YYYY}.{MM}.{DD}')         // '2026.02.03'
 * ```
 */
declare function formatDate(date: Date, format: string): string;
/**
 * 解析模板字符串，替换占位符
 *
 * @param template 模板字符串
 * @param values 占位符值映射
 * @returns 替换后的字符串
 *
 * @example
 * ```typescript
 * parseTemplate('{name}-{version}', { name: 'app', version: '1.0.0' })
 * // 'app-1.0.0'
 * ```
 */
declare function parseTemplate(template: string, values: Record<string, string>): string;
/**
 * 将字符串转换为驼峰命名（camelCase）
 *
 * @param str 输入字符串
 * @param separators 分隔符正则，默认为斜杠和横线
 * @returns 驼峰命名字符串
 *
 * @example
 * ```typescript
 * toCamelCase('pages/user/profile')  // 'pagesUserProfile'
 * toCamelCase('user-profile-page')   // 'userProfilePage'
 * toCamelCase('/pages/index')        // 'pagesIndex'
 * ```
 */
declare function toCamelCase(str: string, separators?: RegExp): string;
/**
 * 将字符串转换为帕斯卡命名（PascalCase）
 *
 * @param str 输入字符串
 * @param separators 分隔符正则，默认为斜杠和横线
 * @returns 帕斯卡命名字符串
 *
 * @example
 * ```typescript
 * toPascalCase('pages/user/profile')  // 'PagesUserProfile'
 * toPascalCase('user-profile-page')   // 'UserProfilePage'
 * toPascalCase('/pages/index')        // 'PagesIndex'
 * ```
 */
declare function toPascalCase(str: string, separators?: RegExp): string;
/**
 * 移除 JSON 字符串中的注释
 *
 * @param jsonString 包含注释的 JSON 字符串
 * @returns 移除注释后的 JSON 字符串
 *
 * @example
 * ```typescript
 * stripJsonComments('{\n  // comment\n  "name": "test"\n}')
 * // '{\n  "name": "test"\n}'
 * ```
 */
declare function stripJsonComments(jsonString: string): string;
/**
 * 转义 HTML 属性值中的特殊字符，防止 XSS 注入
 *
 * @param str - 需要转义的字符串
 * @returns 转义后的安全字符串
 *
 * @example
 * ```typescript
 * escapeHtmlAttr('hello "world"')
 * // 'hello &quot;world&quot;'
 *
 * escapeHtmlAttr('<script>alert(1)</script>')
 * // '&lt;script&gt;alert(1)&lt;/script&gt;'
 * ```
 */
declare function escapeHtmlAttr(str: string): string;

export { escapeHtmlAttr, formatDate, generateRandomHash, getDateFormatParams, padNumber, parseTemplate, stripJsonComments, toCamelCase, toPascalCase };
export type { DateFormatOptions };
