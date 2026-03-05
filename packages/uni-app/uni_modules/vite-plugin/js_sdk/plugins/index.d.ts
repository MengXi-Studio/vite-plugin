import { B as BasePluginOptions, P as PluginFactory } from '../shared/vite-plugin.UkE7CdSe.js';
import 'vite';

/**
 * 复制文件插件的配置选项接口
 *
 * @interface CopyFileOptions
 */
interface CopyFileOptions extends BasePluginOptions {
    /**
     * 源文件目录的路径
     *
     * @example 'src/assets'
     */
    sourceDir: string;
    /**
     * 目标文件目录的路径
     *
     * @example 'dist/assets'
     */
    targetDir: string;
    /**
     * 是否覆盖同名文件
     *
     * @default true
     */
    overwrite?: boolean;
    /**
     * 是否支持递归复制
     *
     * @default true
     */
    recursive?: boolean;
    /**
     * 是否启用增量复制
     *
     * @default true
     */
    incremental?: boolean;
}

/**
 * 复制文件插件
 *
 * @param {CopyFileOptions} options - 插件配置选项
 * @returns {Plugin} 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * copyFile({
 *   sourceDir: 'src/assets',
 *   targetDir: 'dist/assets'
 * })
 *
 * // 高级配置
 * copyFile({
 *   sourceDir: 'src/static',
 *   targetDir: 'dist/static',
 *   overwrite: false,
 *   recursive: true,
 *   incremental: true,
 *   enabled: true,
 *   verbose: true,
 *   errorStrategy: 'throw'
 * })
 * ```
 *
 * @remarks
 * 该插件会在 Vite 构建完成后执行，将指定源目录的所有文件和子目录复制到目标目录。
 * 支持增量复制、递归复制和覆盖控制等功能。
 */
declare const copyFile: PluginFactory<CopyFileOptions, CopyFileOptions>;

/**
 * 输出文件格式类型
 */
type OutputFormat = 'ts' | 'js';
/**
 * 路由名称生成策略
 */
type NameStrategy = 'path' | 'camelCase' | 'pascalCase' | 'custom';
/**
 * 生成路由配置插件选项
 */
interface GenerateRouterOptions extends BasePluginOptions {
    /**
     * pages.json 文件路径（相对于项目根目录）
     *
     * @default 'src/pages.json'
     */
    pagesJsonPath?: string;
    /**
     * 输出文件路径（相对于项目根目录）
     *
     * @default 'src/router.config.ts'
     */
    outputPath?: string;
    /**
     * 输出文件格式
     *
     * @default 'ts'
     */
    outputFormat?: OutputFormat;
    /**
     * 路由名称生成策略
     *
     * @default 'camelCase'
     */
    nameStrategy?: NameStrategy;
    /**
     * 自定义路由名称生成函数
     *
     * @param path - 页面路径
     * @returns 路由名称
     */
    customNameGenerator?: (path: string) => string;
    /**
     * 是否包含子包路由
     *
     * @default true
     */
    includeSubPackages?: boolean;
    /**
     * 是否监听 pages.json 变化并自动重新生成
     *
     * @default true
     */
    watch?: boolean;
    /**
     * 额外的元信息字段映射
     *
     * @description 将 pages.json 中 style 的字段映射到 meta 中
     * @example { 'navigationBarTitleText': 'title', 'requireAuth': 'requireAuth' }
     */
    metaMapping?: Record<string, string>;
    /**
     * 是否导出类型定义
     *
     * @default true
     */
    exportTypes?: boolean;
    /**
     * 是否保留用户对 routes 配置的修改
     *
     * @description 开启后，用户在 routes 数组中修改的字段将被保留
     * @default true
     */
    preserveRouteChanges?: boolean;
}

/**
 * 生成路由配置插件
 *
 * @param {GenerateRouterOptions} options - 插件配置选项
 * @returns {Plugin} 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用 - 使用默认配置
 * generateRouter()
 *
 * // 自定义 pages.json 路径
 * generateRouter({
 *   pagesJsonPath: 'pages.json'
 * })
 *
 * // 输出 JavaScript 文件
 * generateRouter({
 *   outputFormat: 'js',
 *   outputPath: 'src/router.config.js'
 * })
 *
 * // 使用帕斯卡命名策略
 * generateRouter({
 *   nameStrategy: 'pascalCase'
 * })
 *
 * // 自定义路由名称生成
 * generateRouter({
 *   nameStrategy: 'custom',
 *   customNameGenerator: (path) => `route_${path.replace(/\//g, '_')}`
 * })
 *
 * // 自定义元信息映射
 * generateRouter({
 *   metaMapping: {
 *     navigationBarTitleText: 'title',
 *     requireAuth: 'requireAuth',
 *     customField: 'custom'
 *   }
 * })
 * ```
 *
 * @remarks
 * 该插件会读取 uni-app 项目的 pages.json 文件，自动生成路由配置文件：
 * - 支持主包和子包页面
 * - 自动识别 tabBar 页面
 * - 支持多种路由名称生成策略
 * - 支持自定义元信息字段映射
 * - 开发模式下自动监听 pages.json 变化并重新生成
 */
declare const generateRouter: PluginFactory<GenerateRouterOptions, GenerateRouterOptions>;

/**
 * 版本号格式类型
 *
 * @description
 * - 'timestamp': 时间戳格式，如 '20260203153000'
 * - 'date': 日期格式，如 '2026.02.03'
 * - 'datetime': 日期时间格式，如 '2026.02.03.153000'
 * - 'semver': 语义化版本格式，如 '1.0.0'
 * - 'hash': 随机哈希格式，如 'a1b2c3d4'
 * - 'custom': 自定义格式，需要配合 customFormat 使用
 */
type VersionFormat = 'timestamp' | 'date' | 'datetime' | 'semver' | 'hash' | 'custom';
/**
 * 版本号输出类型
 *
 * @description
 * - 'file': 输出到文件
 * - 'define': 通过 Vite 的 define 注入到代码中
 * - 'both': 同时输出到文件和注入代码
 */
type OutputType = 'file' | 'define' | 'both';
/**
 * 自动生成版本号插件的配置选项接口
 *
 * @interface GenerateVersionOptions
 */
interface GenerateVersionOptions extends BasePluginOptions {
    /**
     * 版本号格式
     *
     * @default 'timestamp'
     */
    format?: VersionFormat;
    /**
     * 自定义格式模板，仅当 format 为 'custom' 时有效
     *
     * @description 支持以下占位符：
     * - {YYYY}: 四位年份
     * - {MM}: 两位月份
     * - {DD}: 两位日期
     * - {HH}: 两位小时
     * - {mm}: 两位分钟
     * - {ss}: 两位秒数
     * - {timestamp}: 时间戳
     * - {hash}: 随机哈希
     * - {major}: 主版本号（需配合 semverBase）
     * - {minor}: 次版本号（需配合 semverBase）
     * - {patch}: 补丁版本号（需配合 semverBase）
     *
     * @example '{YYYY}.{MM}.{DD}-{hash}'
     */
    customFormat?: string;
    /**
     * 语义化版本基础值，用于 semver 格式
     *
     * @default '1.0.0'
     */
    semverBase?: string;
    /**
     * 是否自动递增补丁版本号
     *
     * @default false
     */
    autoIncrement?: boolean;
    /**
     * 输出类型
     *
     * @default 'file'
     */
    outputType?: OutputType;
    /**
     * 输出文件路径（相对于构建输出目录）
     *
     * @default 'version.json'
     */
    outputFile?: string;
    /**
     * 注入到代码中的全局变量名
     *
     * @default '__APP_VERSION__'
     */
    defineName?: string;
    /**
     * 哈希长度
     *
     * @default 8
     */
    hashLength?: number;
    /**
     * 版本号前缀
     *
     * @example 'v'
     */
    prefix?: string;
    /**
     * 版本号后缀
     *
     * @example '-beta'
     */
    suffix?: string;
    /**
     * 额外的版本信息，会包含在输出的 JSON 文件中
     */
    extra?: Record<string, any>;
}

/**
 * 自动生成版本号插件
 *
 * @param {GenerateVersionOptions} options - 插件配置选项
 * @returns {Plugin} 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用 - 时间戳格式
 * generateVersion()
 *
 * // 日期格式
 * generateVersion({
 *   format: 'date'
 * })
 *
 * // 语义化版本格式
 * generateVersion({
 *   format: 'semver',
 *   semverBase: '2.0.0',
 *   prefix: 'v'
 * })
 *
 * // 自定义格式
 * generateVersion({
 *   format: 'custom',
 *   customFormat: '{YYYY}.{MM}.{DD}-{hash}',
 *   hashLength: 6
 * })
 *
 * // 注入到代码中
 * generateVersion({
 *   outputType: 'define',
 *   defineName: '__VERSION__'
 * })
 *
 * // 同时输出文件和注入代码
 * generateVersion({
 *   outputType: 'both',
 *   outputFile: 'build-info.json',
 *   defineName: '__BUILD_VERSION__',
 *   extra: {
 *     environment: 'production',
 *     author: 'MengXi Studio'
 *   }
 * })
 * ```
 *
 * @remarks
 * 该插件会在 Vite 构建过程中自动生成版本号，支持多种格式：
 * - timestamp: 时间戳格式 (20260203153000)
 * - date: 日期格式 (2026.02.03)
 * - datetime: 日期时间格式 (2026.02.03.153000)
 * - semver: 语义化版本格式 (1.0.0)
 * - hash: 随机哈希格式 (a1b2c3d4)
 * - custom: 自定义格式
 */
declare const generateVersion: PluginFactory<GenerateVersionOptions, GenerateVersionOptions>;

/**
 * 图标配置项接口
 *
 * @interface Icon
 */
interface Icon {
    /**
     * 图标关系类型
     */
    rel: string;
    /**
     * 图标 URL
     */
    href: string;
    /**
     * 图标尺寸
     */
    sizes?: string;
    /**
     * 图标 MIME 类型
     */
    type?: string;
}
/**
 * 图标文件复制配置选项接口
 *
 * @interface CopyOptions
 */
interface CopyOptions {
    /**
     * 图标源文件目录，用于复制图标到打包目录
     *
     * @example 'src/assets/icons'
     */
    sourceDir: string;
    /**
     * 图标目标目录（打包目录），用于复制图标到打包目录
     *
     * @example 'dist/assets/icons'
     */
    targetDir: string;
    /**
     * 是否覆盖同名文件
     *
     * @default true
     */
    overwrite?: boolean;
    /**
     * 是否支持递归复制
     *
     * @default true
     */
    recursive?: boolean;
}
/**
 * 注入网站图标链接的配置选项接口
 *
 * @interface InjectIcoOptions
 */
interface InjectIcoOptions extends BasePluginOptions {
    /**
     * 图标文件的基础路径，默认为根路径 '/'
     *
     * @default '/'
     * @example '/assets'
     */
    base?: string;
    /**
     * 图标的完整 URL，如果提供则优先使用（覆盖 base + favicon.ico）
     *
     * @example 'https://example.com/favicon.ico'
     */
    url?: string;
    /**
     * 自定义的完整 link 标签 HTML，如果提供则优先使用（覆盖 url 和 base）
     *
     * @example '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />'
     */
    link?: string;
    /**
     * 自定义图标数组，支持多种图标格式和尺寸
     *
     * @example
     * [
     *   { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
     *   { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
     *   { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
     * ]
     */
    icons?: Icon[];
    /**
     * 图标文件复制配置选项
     *
     * @remarks
     * 当此对象存在时，才会开启图标文件复制功能
     */
    copyOptions?: CopyOptions;
}

/**
 * 创建注入图标插件实例
 *
 * @export
 * @param {string | InjectIcoOptions} [options] - 插件配置选项，可以是字符串形式的 base 路径或完整的配置对象
 * @returns {Plugin} Vite 插件实例，用于在构建过程中注入图标链接到 HTML 文件
 * @example
 * ```typescript
 * // 基本使用
 * injectIco() // 使用默认配置
 *
 * // 使用字符串配置 base 路径
 * injectIco('/assets')
 *
 * // 使用完整配置
 * injectIco({
 *   base: '/assets',
 *   icons: [
 *     { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
 *     { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
 *   ],
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 * ```
 * @remarks
 * 该函数创建并返回一个 Vite 插件实例，该实例会在构建过程中：
 * 1. 将图标链接注入到 HTML 文件的 `<head>` 标签中
 * 2. 如果配置了 copyOptions，将图标文件复制到目标目录
 *
 * 支持自定义图标链接、图标数组配置以及图标文件复制功能。
 */
declare const injectIco: PluginFactory<InjectIcoOptions, string | InjectIcoOptions>;

export { copyFile, generateRouter, generateVersion, injectIco };
