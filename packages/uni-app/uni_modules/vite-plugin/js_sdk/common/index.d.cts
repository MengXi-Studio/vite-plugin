export { V as Validator } from '../shared/vite-plugin.CiHfwMiN.cjs';

/**
 * 复制操作的选项接口
 */
interface CopyOptions {
    /**
     * 是否支持递归复制
     */
    recursive: boolean;
    /**
     * 是否覆盖同名文件
     */
    overwrite: boolean;
    /**
     * 是否启用增量复制
     */
    incremental?: boolean;
    /**
     * 并行处理的最大文件数
     */
    parallelLimit?: number;
    /**
     * 是否跳过空目录
     */
    skipEmptyDirs?: boolean;
}
/**
 * 复制结果接口
 */
interface CopyResult {
    /**
     * 复制的文件数量
     */
    copiedFiles: number;
    /**
     * 跳过的文件数量
     */
    skippedFiles: number;
    /**
     * 复制的目录数量
     */
    copiedDirs: number;
    /**
     * 总执行时间（毫秒）
     */
    executionTime: number;
}

/**
 * 文件/目录条目信息
 */
interface FileEntry {
    /** 完整路径 */
    path: string;
    /** 是否为文件 */
    isFile: boolean;
    /** 是否为目录 */
    isDirectory: boolean;
}
/**
 * 检查源文件是否存在
 * @param sourcePath 源文件路径
 * @throws 当源文件不存在或无法访问时抛出异常
 */
declare function checkSourceExists(sourcePath: string): Promise<void>;
/**
 * 创建目标目录
 * @param targetPath 目标目录路径
 * @throws 当无法创建目标目录时抛出异常
 */
declare function ensureTargetDir(targetPath: string): Promise<void>;
/**
 * 读取目录内容（优化版：一次性获取文件类型信息）
 * @param dirPath 目录路径
 * @param recursive 是否递归读取
 * @returns 文件和目录条目列表
 */
declare function readDirRecursive(dirPath: string, recursive: boolean): Promise<FileEntry[]>;
/**
 * 检查文件是否需要更新
 * @param sourceFile 源文件路径
 * @param targetFile 目标文件路径
 * @returns 是否需要更新
 */
declare function shouldUpdateFile(sourceFile: string, targetFile: string): Promise<boolean>;
/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 *
 * @example
 * ```typescript
 * if (await fileExists('/path/to/file')) {
 *   console.log('文件存在')
 * }
 * ```
 */
declare function fileExists(filePath: string): Promise<boolean>;
/**
 * 带并发限制的批量执行
 *
 * @param items 待处理项
 * @param handler 处理函数
 * @param concurrency 并发数
 * @returns 处理结果数组，顺序与输入项对应
 *
 * @example
 * ```typescript
 * const urls = ['url1', 'url2', 'url3', 'url4', 'url5']
 * const results = await runWithConcurrency(
 *   urls,
 *   async (url) => fetch(url),
 *   3 // 最多同时处理3个请求
 * )
 * ```
 */
declare function runWithConcurrency<T, R>(items: T[], handler: (item: T) => Promise<R>, concurrency: number): Promise<R[]>;
/**
 * 执行文件复制操作（优化版：并行IO）
 * @param sourcePath 源文件或目录路径
 * @param targetPath 目标文件或目录路径
 * @param options 复制选项
 * @returns 复制结果
 * @throws 当复制过程中出现错误时抛出异常
 */
declare function copySourceToTarget(sourcePath: string, targetPath: string, options: CopyOptions): Promise<CopyResult>;
/**
 * 写入文件内容
 * @param filePath 文件路径
 * @param content 文件内容
 * @throws 当写入过程中出现错误时抛出异常
 */
declare function writeFileContent(filePath: string, content: string): Promise<void>;
/**
 * 读取文件内容
 * @param filePath 文件路径
 * @returns 文件内容字符串
 * @throws 当读取过程中出现错误时抛出异常
 */
declare function readFileContent(filePath: string): Promise<string>;
/**
 * 同步读取文件内容
 * @param filePath 文件路径
 * @returns 文件内容字符串
 * @throws 当读取过程中出现错误时抛出异常
 * @deprecated 请使用异步版本 readFileContent
 */
declare function readFileSync(filePath: string): string;

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
 * HTML 注入结果
 */
interface HtmlInjectResult {
    /** 注入后的 HTML 内容 */
    html: string;
    /** 是否成功注入 */
    injected: boolean;
}
/**
 * 在 HTML 中指定闭合标签前注入代码
 *
 * @param html - 原始 HTML 内容
 * @param tag - 目标闭合标签（如 `</head>`、`</body>`、`</html>`）
 * @param code - 要注入的代码
 * @returns 注入结果对象
 *
 * @example
 * ```typescript
 * // 在 </head> 前注入 CSS
 * const result = injectBeforeTag(html, '</head>', '<style>...</style>')
 *
 * // 在 </body> 前注入 JS
 * const result = injectBeforeTag(html, '</body>', '<script>...</script>')
 * ```
 */
declare function injectBeforeTag(html: string, tag: string, code: string): HtmlInjectResult;
/**
 * 按优先级向 HTML 中注入代码
 *
 * @description 依次尝试在 `</head>`、`</body>`、`</html>` 前注入代码，
 * 优先注入到靠前的标签位置。适用于需要注入到页面中但无特定位置要求的场景
 *
 * @param html - 原始 HTML 内容
 * @param code - 要注入的代码
 * @param targets - 目标标签优先级列表，默认为 `['</head>', '</body>', '</html>']`
 * @returns 注入结果对象
 *
 * @example
 * ```typescript
 * // 优先注入到 </body> 前
 * const result = injectHtmlByPriority(html, scriptCode, ['</body>', '</html>'])
 * ```
 */
declare function injectHtmlByPriority(html: string, code: string, targets?: string[]): HtmlInjectResult;

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

/**
 * 将回调函数体字符串包装为安全的函数表达式
 *
 * @param body - 函数体代码字符串
 * @param context - 回调上下文标识，用于错误日志
 * @param params - 函数参数列表字符串，默认为空
 * @returns 安全的函数表达式字符串（包含 try-catch 保护）
 *
 * @example
 * ```typescript
 * makeCallback('console.log("done")')
 * // 'function() { try { console.log("done") } catch(e) { console.error('[callback] error:', e); } }'
 *
 * makeCallback('console.log(a, b)', 'callback', 'a, b')
 * // 'function(a, b) { try { console.log(a, b) } catch(e) { console.error('[callback] error:', e); } }'
 *
 * makeCallback('')
 * // 'function() {}'
 * ```
 */
declare function makeCallback(body?: string, context?: string, params?: string): string;
/**
 * 检测字符串是否包含 `<script>` 标签
 *
 * @param str - 待检测的字符串
 * @returns 是否包含 script 标签
 *
 * @example
 * ```typescript
 * containsScriptTag('<div onclick="alert(1)">') // false
 * containsScriptTag('<script>alert(1)</script>') // true
 * ```
 */
declare function containsScriptTag(str: string): boolean;
/**
 * 验证字符串是否为合法的 JavaScript 标识符
 *
 * @description 检查名称是否以字母、下划线或美元符开头，
 * 仅包含字母、数字、下划线和美元符，并排除可能导致原型污染的内置属性
 *
 * @param name - 待验证的标识符名称
 * @throws 当名称不是合法标识符时抛出错误
 * @throws 当名称为 JavaScript 内置属性时抛出错误
 *
 * @example
 * ```typescript
 * validateIdentifierName('__LOADING_MANAGER__') // 通过
 * validateIdentifierName('123abc')              // 抛出错误
 * validateIdentifierName('__proto__')           // 抛出错误（内置属性）
 * ```
 */
declare function validateIdentifierName(name: string): void;

export { checkSourceExists, containsScriptTag, copySourceToTarget, deepMerge, ensureTargetDir, fileExists, formatDate, generateRandomHash, getDateFormatParams, injectBeforeTag, injectHtmlByPriority, makeCallback, padNumber, parseTemplate, readDirRecursive, readFileContent, readFileSync, runWithConcurrency, shouldUpdateFile, stripJsonComments, toCamelCase, toPascalCase, validateIdentifierName, writeFileContent };
export type { DateFormatOptions, HtmlInjectResult };
