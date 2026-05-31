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
 * 扫描目录中的文件信息
 */
interface ScannedFile {
    /** 文件绝对路径 */
    filePath: string;
    /** 文件大小（字节） */
    size: number;
    /** 文件扩展名（小写，含点号，如 '.js'） */
    extension: string;
}
/**
 * 目录扫描选项
 */
interface ScanDirectoryOptions {
    /** 包含的文件扩展名列表，为空则包含所有 */
    includeExtensions?: string[];
    /** 排除的路径模式列表 */
    excludePatterns?: string[];
    /** 自定义文件过滤函数，返回 true 表示包含该文件 */
    filter?: (filePath: string, extension: string, size: number) => boolean;
}
/**
 * 递归扫描目录，收集所有文件信息
 *
 * @async
 * @param {string} dirPath - 要扫描的目录路径
 * @param {ScanDirectoryOptions} options - 扫描选项
 * @returns {Promise<ScannedFile[]>} 文件信息列表
 *
 * @description 递归遍历指定目录下的所有文件，收集每个文件的大小和扩展名信息，
 * 支持按扩展名、路径模式和自定义过滤函数进行过滤。
 * 这是通用的目录扫描函数，可被不同插件复用。
 *
 * @example
 * ```typescript
 * // 扫描所有 .js 文件
 * const jsFiles = await scanDirectory('dist', { includeExtensions: ['.js'] })
 *
 * // 排除 node_modules
 * const files = await scanDirectory('dist', { excludePatterns: ['node_modules'] })
 *
 * // 使用自定义过滤
 * const largeFiles = await scanDirectory('dist', {
 *   filter: (filePath, ext, size) => size > 1024
 * })
 * ```
 */
declare function scanDirectory(dirPath: string, options?: ScanDirectoryOptions): Promise<ScannedFile[]>;
/**
 * 将数据写入 JSON 文件
 *
 * @async
 * @param {string} filePath - 输出文件路径
 * @param {object} data - 要序列化的数据对象
 * @param {number} [indent=2] - JSON 缩进空格数
 * @returns {Promise<void>}
 *
 * @description 将任意数据对象序列化为 JSON 格式并写入文件。
 * 内部使用 writeFileContent 确保统一的错误处理。
 *
 * @example
 * ```typescript
 * await writeJsonReport('dist/report.json', { timestamp: Date.now(), stats: [] })
 * await writeJsonReport('dist/report.json', data, 4)
 * ```
 */
declare function writeJsonReport(filePath: string, data: object, indent?: number): Promise<void>;

export { checkSourceExists, copySourceToTarget, ensureTargetDir, fileExists, readDirRecursive, readFileContent, readFileSync, runWithConcurrency, scanDirectory, shouldUpdateFile, writeFileContent, writeJsonReport };
export type { CopyOptions, CopyResult, ScanDirectoryOptions, ScannedFile };
