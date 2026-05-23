import { BasePluginOptions, PluginFactory } from '../factory/index.cjs';
import 'vite';
import '../shared/vite-plugin.CLr0ttuO.cjs';
import '../shared/vite-plugin.CiHfwMiN.cjs';

/**
 * 进度条显示格式类型
 *
 * @description
 * - 'bar': 完整进度条模式，显示旋转动画 + 阶段标签 + 进度条 + 百分比 + 模块名
 * - 'spinner': 旋转动画模式，显示旋转动画 + 阶段标签 + 百分比
 * - 'minimal': 精简模式，仅显示阶段标签 + 百分比
 */
type ProgressFormat = 'bar' | 'spinner' | 'minimal';
/**
 * 构建进度插件的配置选项接口
 *
 * @interface BuildProgressOptions
 */
interface BuildProgressOptions extends BasePluginOptions {
    /**
     * 进度条宽度（字符数）
     *
     * @default 30
     */
    width?: number;
    /**
     * 进度条显示格式
     *
     * @default 'bar'
     */
    format?: ProgressFormat;
    /**
     * 已完成部分的填充字符
     *
     * @default '█'
     * @example '█'、'■'、'='
     */
    completeChar?: string;
    /**
     * 未完成部分的填充字符
     *
     * @default '░'
     * @example '░'、'□'、'-'
     */
    incompleteChar?: string;
    /**
     * 构建完成后是否清除进度条
     *
     * @default true
     * @description 设为 false 时，构建完成后保留 100% 进度条在终端中
     */
    clearOnComplete?: boolean;
    /**
     * 是否显示当前正在处理的模块名称
     *
     * @default true
     * @description 仅在 transform 阶段显示，模块名超长时自动截断
     */
    showModuleName?: boolean;
    /**
     * 自定义颜色主题
     *
     * @remarks
     * 每个属性是一个接受字符串并返回带 ANSI 颜色码字符串的函数。
     * 未提供的属性将使用默认主题。
     */
    theme?: ProgressTheme;
}
/**
 * 进度条颜色主题接口
 *
 * @interface ProgressTheme
 * @description 定义进度条各部分的颜色渲染函数，每个函数接受文本并返回带 ANSI 颜色码的字符串
 */
interface ProgressTheme {
    /**
     * 已完成部分的颜色渲染函数
     *
     * @param text - 需要着色的文本
     * @returns 带 ANSI 颜色码的字符串
     */
    completeColor: (text: string) => string;
    /**
     * 未完成部分的颜色渲染函数
     *
     * @param text - 需要着色的文本
     * @returns 带 ANSI 颜色码的字符串
     */
    incompleteColor: (text: string) => string;
    /**
     * 百分比数字的颜色渲染函数
     *
     * @param text - 需要着色的文本
     * @returns 带 ANSI 颜色码的字符串
     */
    percentageColor: (text: string) => string;
    /**
     * 阶段标签的颜色渲染函数
     *
     * @param text - 需要着色的文本
     * @returns 带 ANSI 颜色码的字符串
     */
    phaseColor: (text: string) => string;
    /**
     * 模块名称的颜色渲染函数
     *
     * @param text - 需要着色的文本
     * @returns 带 ANSI 颜色码的字符串
     */
    moduleColor: (text: string) => string;
}
/**
 * 构建阶段类型
 *
 * @description
 * - 'idle': 空闲状态，插件尚未开始工作
 * - 'config': 读取配置阶段
 * - 'resolve': 解析模块依赖阶段
 * - 'transform': 转换模块阶段
 * - 'bundle': 打包阶段（仅生产构建）
 * - 'write': 写入文件阶段
 * - 'done': 构建完成
 */
type BuildPhase = 'idle' | 'config' | 'resolve' | 'transform' | 'bundle' | 'write' | 'done';

/**
 * 构建进度条插件
 *
 * @param {BuildProgressOptions} options - 插件配置选项
 * @returns {Plugin} 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用 - 默认进度条格式
 * buildProgress()
 *
 * // 旋转动画格式
 * buildProgress({
 *   format: 'spinner'
 * })
 *
 * // 精简格式
 * buildProgress({
 *   format: 'minimal'
 * })
 *
 * // 自定义进度条外观
 * buildProgress({
 *   width: 40,
 *   completeChar: '■',
 *   incompleteChar: '□',
 *   clearOnComplete: false
 * })
 *
 * // 自定义颜色主题
 * buildProgress({
 *   theme: {
 *     completeColor: (t) => `\x1b[32m${t}\x1b[39m`,
 *     incompleteColor: (t) => `\x1b[90m${t}\x1b[39m`,
 *     percentageColor: (t) => `\x1b[1m${t}\x1b[22m`,
 *     phaseColor: (t) => `\x1b[36m${t}\x1b[39m`,
 *     moduleColor: (t) => `\x1b[90m${t}\x1b[39m`
 *   }
 * })
 *
 * // 禁用模块名显示
 * buildProgress({
 *   showModuleName: false
 * })
 * ```
 *
 * @remarks
 * 该插件在 Vite 构建过程中实时显示终端进度条，支持三种显示格式：
 * - bar: 完整进度条（默认），包含旋转动画、阶段标签、进度条和百分比
 * - spinner: 旋转动画模式，仅显示动画、阶段标签和百分比
 * - minimal: 精简模式，仅显示阶段标签和百分比
 *
 * 进度计算基于 Vite 构建生命周期：
 * 1. config 阶段（5%）→ resolve 阶段（10%）→ transform 阶段（15%-85%）→ bundle 阶段（+10%）→ write 阶段（+5%）→ 完成（100%）
 *
 * 在非 TTY 终端环境下（如 CI/CD），自动降级为日志输出模式。
 */
declare const buildProgress: PluginFactory<BuildProgressOptions, BuildProgressOptions>;

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
 * 网站图标管理插件的配置选项接口
 *
 * @interface FaviconManagerOptions
 */
interface FaviconManagerOptions extends BasePluginOptions {
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
 * 网站图标管理插件
 *
 * @param options - 插件配置选项，可以是字符串形式的 base 路径或完整的配置对象
 * @returns Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * faviconManager() // 使用默认配置
 *
 * // 使用字符串配置 base 路径
 * faviconManager('/assets')
 *
 * // 使用完整配置
 * faviconManager({
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
 *
 * @remarks
 * 该插件在构建过程中：
 * 1. 将网站图标（favicon）的 link 标签注入到 HTML 文件的 `<head>` 中
 * 2. 如果配置了 copyOptions，将图标文件复制到目标目录
 *
 * 支持自定义图标链接、图标数组配置以及图标文件复制功能。
 */
declare const faviconManager: PluginFactory<FaviconManagerOptions, string | FaviconManagerOptions>;

/**
 * 路由元信息
 */
interface RouteMeta {
    /** 页面标题 */
    title?: string;
    /** 是否为TabBar页面 */
    isTab?: boolean;
    /** 是否需要登录 */
    requireAuth?: boolean;
    /** 自定义扩展字段 */
    [key: string]: unknown;
}
/**
 * 路由配置项
 */
interface RouteConfig {
    /** 路由路径 */
    path: string;
    /** 路由名称（用于命名路由导航） */
    name?: string;
    /** 路由元信息 */
    meta?: RouteMeta;
}
/**
 * uni-app pages.json 中的页面配置项
 */
interface UniAppPageConfig {
    /** 页面路径 */
    path: string;
    /** 页面样式 */
    style?: {
        /** 导航栏标题 */
        navigationBarTitleText?: string;
        /** 是否需要登录 */
        requireAuth?: boolean;
        /** 其他自定义属性 */
        [key: string]: unknown;
    };
    /** 其他属性 */
    [key: string]: unknown;
}
/**
 * uni-app pages.json 中的 tabBar 配置
 */
interface UniAppTabBarConfig {
    /** tabBar 列表 */
    list?: Array<{
        /** 页面路径 */
        pagePath: string;
        /** 文字 */
        text?: string;
        /** 图标路径 */
        iconPath?: string;
        /** 选中图标路径 */
        selectedIconPath?: string;
    }>;
    /** 其他属性 */
    [key: string]: unknown;
}
/**
 * uni-app pages.json 结构
 */
interface UniAppPagesJson {
    /** 页面列表 */
    pages: UniAppPageConfig[];
    /** 子包 */
    subPackages?: Array<{
        root: string;
        pages: UniAppPageConfig[];
    }>;
    /** tabBar 配置 */
    tabBar?: UniAppTabBarConfig;
    /** 全局样式 */
    globalStyle?: Record<string, unknown>;
    /** 其他属性 */
    [key: string]: unknown;
}
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
 * Loading 组件的显示位置
 *
 * @remarks 控制加载指示器在视口中的垂直对齐方式
 *
 * @defaultValue `'center'`
 *
 * @example
 * ```typescript
 * loadingManager({ position: 'top' })
 * ```
 */
type LoadingPosition = 'center' | 'top' | 'bottom';
/**
 * Loading 自动绑定请求拦截的模式
 *
 * @remarks 决定插件自动拦截哪些类型的网络请求来管理 loading 状态
 *
 * @defaultValue `'none'`
 *
 * @example
 * ```typescript
 * // 自动拦截所有 fetch 请求
 * loadingManager({ autoBind: 'fetch' })
 * ```
 */
type AutoBindMode = 'fetch' | 'xhr' | 'all' | 'none';
/**
 * Loading 旋转图标的内置类型
 *
 * @remarks 提供四种内置加载动画，无需自定义 CSS 即可使用
 *
 * @defaultValue `'spinner'`
 *
 * @example
 * ```typescript
 * loadingManager({ spinnerType: 'dots' })
 * ```
 */
type SpinnerType = 'spinner' | 'dots' | 'pulse' | 'bar';
/**
 * 当 `defaultVisible` 为 `true` 时，loading 的自动隐藏时机
 *
 * @remarks 仅在 {@link LoadingManagerOptions.defaultVisible} 为 `true` 时生效，
 * 决定 loading 在页面加载过程中的自动隐藏策略
 *
 * @defaultValue `'DOMContentLoaded'`
 *
 * @example
 * ```typescript
 * // Vue/React SPA：手动控制隐藏时机
 * loadingManager({ defaultVisible: true, autoHideOn: 'manual' })
 * // 在应用入口：window.__LOADING_MANAGER__.hide()
 * ```
 */
type AutoHideOn = 'DOMContentLoaded' | 'load' | 'manual';
/**
 * Loading 过渡动画配置
 *
 * @remarks 控制 loading 显示/隐藏时的 CSS 过渡效果
 */
interface TransitionConfig {
    /**
     * 是否启用过渡动画
     *
     * @defaultValue `true`
     */
    enabled?: boolean;
    /**
     * 过渡动画持续时间（毫秒）
     *
     * @defaultValue `200`
     *
     * @throws 配置验证时若为负数将抛出错误
     */
    duration?: number;
    /**
     * CSS 过渡缓动函数
     *
     * @defaultValue `'ease-out'`
     *
     * @example
     * ```typescript
     * { easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
     * ```
     */
    easing?: string;
}
/**
 * Loading 自定义样式配置
 *
 * @remarks 控制 loading 遮罩层、图标和文本的视觉表现
 */
interface LoadingStyle {
    /**
     * 遮罩层背景色（CSS 颜色值）
     *
     * @defaultValue `'rgba(255, 255, 255, 0.7)'`
     */
    overlayColor?: string;
    /**
     * Loading 图标颜色（CSS 颜色值）
     *
     * @defaultValue `'#4361ee'`
     */
    spinnerColor?: string;
    /**
     * Loading 图标大小（CSS 长度值）
     *
     * @defaultValue `'40px'`
     */
    spinnerSize?: string;
    /**
     * 文本颜色（CSS 颜色值）
     *
     * @defaultValue `'#333'`
     */
    textColor?: string;
    /**
     * 文本大小（CSS 长度值）
     *
     * @defaultValue `'14px'`
     */
    textSize?: string;
    /**
     * 自定义 CSS 类名，附加到 overlay 元素上
     *
     * @remarks 可用于覆盖默认样式或添加额外样式
     */
    customClass?: string;
    /**
     * 自定义内联样式字符串，附加到 overlay 元素上
     *
     * @remarks 将作为 `style` 属性值直接注入
     */
    customStyle?: string;
    /**
     * 遮罩层 z-index 值
     *
     * @defaultValue `9999`
     *
     * @throws 配置验证时若为负数将抛出错误
     */
    zIndex?: number;
    /**
     * 是否启用遮罩层的指针事件
     *
     * @remarks
     * 对应 CSS `pointer-events` 属性，控制遮罩层是否拦截用户的点击、滚动等交互操作：
     * - `true`（默认）：启用指针事件（`pointer-events: auto`），遮罩层阻止所有交互
     * - `false`：禁用指针事件（`pointer-events: none`），遮罩层允许交互穿透
     *
     * @defaultValue `true`
     *
     * @example
     * ```typescript
     * // 阻止交互（默认行为）
     * loadingManager({ style: { pointerEvents: true } })
     *
     * // 允许交互穿透（如仅展示加载状态，不阻止操作）
     * loadingManager({ style: { pointerEvents: false } })
     * ```
     */
    pointerEvents?: boolean;
    /**
     * 是否启用 backdrop-filter 模糊效果
     *
     * @remarks 启用后遮罩层下方的页面内容将被高斯模糊处理，
     * 需要浏览器支持 `backdrop-filter` CSS 属性
     *
     * @defaultValue `false`
     */
    backdropBlur?: boolean;
    /**
     * backdrop-filter 模糊程度（单位：px）
     *
     * @remarks 仅在 {@link backdropBlur} 为 `true` 时生效
     *
     * @defaultValue `4`
     *
     * @throws 配置验证时若为负数将抛出错误
     */
    backdropBlurAmount?: number;
}
/**
 * Loading 最小显示时间配置
 *
 * @remarks 确保 loading 至少显示指定时长，避免快速闪烁
 */
interface MinDisplayTime {
    /**
     * 是否启用最小显示时间
     *
     * @defaultValue `true`
     */
    enabled?: boolean;
    /**
     * 最小显示时间（毫秒）
     *
     * @remarks 即使请求在更短时间内完成，loading 也会至少显示此时长
     *
     * @defaultValue `300`
     *
     * @throws 配置验证时若为负数将抛出错误
     */
    duration?: number;
}
/**
 * Loading 延迟显示配置
 *
 * @remarks 当请求在短时间内完成时，延迟显示可避免 loading 闪烁
 */
interface DelayShow {
    /**
     * 是否启用延迟显示
     *
     * @defaultValue `true`
     */
    enabled?: boolean;
    /**
     * 延迟时间（毫秒）
     *
     * @remarks 请求开始后等待此时长再显示 loading；
     * 若请求在此时间内完成，则不会显示 loading
     *
     * @defaultValue `200`
     *
     * @throws 配置验证时若为负数将抛出错误
     */
    duration?: number;
}
/**
 * Loading 防抖隐藏配置
 *
 * @remarks 当频繁触发 hide 操作时，延迟执行以避免 loading 闪烁
 */
interface DebounceHide {
    /**
     * 是否启用防抖隐藏
     *
     * @defaultValue `false`
     */
    enabled?: boolean;
    /**
     * 防抖等待时间（毫秒）
     *
     * @remarks 在最后一次 hide 调用后等待此时长再执行隐藏
     *
     * @defaultValue `100`
     *
     * @throws 配置验证时若为负数将抛出错误
     */
    duration?: number;
}
/**
 * Loading 请求过滤配置
 *
 * @remarks 用于精细控制哪些网络请求会触发 loading 状态变化
 */
interface RequestFilter {
    /**
     * 需要排除的 URL 正则表达式数组
     *
     * @remarks 匹配的 URL 不会触发 loading
     *
     * @example
     * ```typescript
     * { excludeUrls: [/\/api\/health/, /\/static\//] }
     * ```
     */
    excludeUrls?: RegExp[];
    /**
     * 需要包含的 URL 正则表达式数组
     *
     * @remarks 仅匹配的 URL 才会触发 loading。
     * 与 {@link excludeUrls} 互斥，{@link includeUrls} 优先级更高
     *
     * @example
     * ```typescript
     * { includeUrls: [/\/api\/data/] }
     * ```
     */
    includeUrls?: RegExp[];
    /**
     * 需要排除的 HTTP 方法数组（不区分大小写）
     *
     * @example
     * ```typescript
     * { excludeMethods: ['OPTIONS', 'HEAD'] }
     * ```
     */
    excludeMethods?: string[];
    /**
     * 需要排除的 URL 字符串前缀数组
     *
     * @remarks 使用前缀匹配（`indexOf === 0`），比正则更高效
     *
     * @example
     * ```typescript
     * { excludeUrlPrefixes: ['http://localhost', 'data:'] }
     * ```
     */
    excludeUrlPrefixes?: string[];
}
/**
 * Loading 生命周期回调
 *
 * @remarks 回调以 **函数体字符串** 形式提供，因为插件在构建时注入代码到浏览器端，
 * 无法直接传递函数引用。字符串应为有效的 JavaScript 函数体代码。
 */
interface LoadingCallbacks {
    /**
     * Loading 显示前的回调
     *
     * @remarks 函数体内 `return false` 可阻止显示
     *
     * @example
     * ```typescript
     * { onBeforeShow: 'if (someCondition) return false;' }
     * ```
     */
    onBeforeShow?: string;
    /**
     * Loading 显示后的回调
     *
     * @example
     * ```typescript
     * { onShow: 'console.log("loading shown")' }
     * ```
     */
    onShow?: string;
    /**
     * Loading 隐藏前的回调
     *
     * @remarks 函数体内 `return false` 可阻止隐藏
     *
     * @example
     * ```typescript
     * { onBeforeHide: 'if (shouldKeepVisible) return false;' }
     * ```
     */
    onBeforeHide?: string;
    /**
     * Loading 隐藏后的回调
     *
     * @example
     * ```typescript
     * { onHide: 'console.log("loading hidden")' }
     * ```
     */
    onHide?: string;
    /**
     * Loading 销毁时的回调
     *
     * @remarks 在 DOM 清理和拦截器恢复之后执行
     */
    onDestroy?: string;
}
/**
 * Loading 管理器实例接口
 *
 * @remarks 注入到浏览器全局变量（默认 `window.__LOADING_MANAGER__`），
 * 提供运行时 loading 状态控制方法
 */
interface LoadingManager {
    /**
     * 显示 loading
     *
     * @param text - 可选，显示的文本内容；不传则保留默认文本
     *
     * @example
     * ```typescript
     * window.__LOADING_MANAGER__.show()
     * window.__LOADING_MANAGER__.show('正在保存...')
     * ```
     */
    show(text?: string): void;
    /**
     * 隐藏 loading
     *
     * @remarks 受 {@link MinDisplayTime} 和 {@link DebounceHide} 配置约束；
     * 若需忽略这些约束，请使用 {@link forceHide}
     */
    hide(): void;
    /**
     * 强制隐藏 loading，忽略最小显示时间和防抖隐藏
     *
     * @remarks 适用于需要立即隐藏 loading 的紧急场景
     */
    forceHide(): void;
    /**
     * 切换 loading 的显示/隐藏状态
     *
     * @remarks 如果当前显示则调用 {@link hide}，如果当前隐藏则调用 {@link show}
     *
     * @param text - 可选，切换为显示时的文本内容；不传则保留默认文本
     *
     * @example
     * ```typescript
     * window.__LOADING_MANAGER__.toggle()
     * window.__LOADING_MANAGER__.toggle('正在加载...')
     * ```
     */
    toggle(text?: string): void;
    /**
     * 启用遮罩层的指针事件，拦截所有点击和滚动操作
     *
     * @remarks 设置遮罩层的 `pointer-events: auto`，恢复默认的交互拦截行为。
     * 适用于运行时动态启用交互阻止，例如在特定操作期间临时锁定页面
     *
     * @example
     * ```typescript
     * window.__LOADING_MANAGER__.enablePointerEvents()
     * ```
     */
    enablePointerEvents(): void;
    /**
     * 禁用遮罩层的指针事件，允许交互穿透
     *
     * @remarks 设置遮罩层的 `pointer-events: none`，使鼠标事件穿透到下层元素。
     * 适用于运行时动态禁用交互阻止，例如需要用户在 loading 期间仍能操作页面
     *
     * @example
     * ```typescript
     * window.__LOADING_MANAGER__.disablePointerEvents()
     * ```
     */
    disablePointerEvents(): void;
    /**
     * 切换遮罩层的指针事件状态
     *
     * @remarks 如果当前启用指针事件则调用 {@link disablePointerEvents}，如果当前禁用则调用 {@link enablePointerEvents}
     *
     * @example
     * ```typescript
     * window.__LOADING_MANAGER__.togglePointerEvents()
     * ```
     */
    togglePointerEvents(): void;
    /**
     * 更新 loading 文本内容
     *
     * @param text - 新的文本内容
     *
     * @example
     * ```typescript
     * window.__LOADING_MANAGER__.updateText('正在处理数据...')
     * ```
     */
    updateText(text: string): void;
    /**
     * 获取当前 loading 是否正在显示
     *
     * @returns `true` 表示 loading 正在显示且未被销毁
     */
    isVisible(): boolean;
    /**
     * 获取当前遮罩层是否启用了指针事件
     *
     * @returns `true` 表示指针事件已启用（遮罩层拦截交互），`false` 表示已禁用（允许穿透）
     */
    isPointerEventsEnabled(): boolean;
    /**
     * 获取当前挂起的请求数量
     *
     * @returns 当前正在进行的、被拦截的请求数量
     */
    getPendingCount(): number;
    /**
     * 销毁 loading 实例
     *
     * @remarks 清理 DOM 元素、事件监听器，并恢复原始的 fetch/XHR 拦截。
     * 销毁后所有其他方法调用将被安全忽略
     */
    destroy(): void;
}
/**
 * loadingManager 插件的配置选项
 *
 * @remarks 继承自 {@link BasePluginOptions}，包含 loading 的所有可配置项
 */
interface LoadingManagerOptions extends BasePluginOptions {
    /**
     * Loading 显示位置
     *
     * @defaultValue `'center'`
     */
    position?: LoadingPosition;
    /**
     * 默认显示文本
     *
     * @defaultValue `'加载中...'`
     */
    defaultText?: string;
    /**
     * 旋转图标类型
     *
     * @defaultValue `'spinner'`
     */
    spinnerType?: SpinnerType;
    /**
     * 自定义样式配置
     *
     * @remarks 详见 {@link LoadingStyle}
     */
    style?: LoadingStyle;
    /**
     * 过渡动画配置
     *
     * @defaultValue `{ enabled: true, duration: 200, easing: 'ease-out' }`
     */
    transition?: TransitionConfig;
    /**
     * 最小显示时间配置
     *
     * @remarks 详见 {@link MinDisplayTime}
     */
    minDisplayTime?: MinDisplayTime;
    /**
     * 延迟显示配置
     *
     * @remarks 详见 {@link DelayShow}
     */
    delayShow?: DelayShow;
    /**
     * 防抖隐藏配置
     *
     * @remarks 详见 {@link DebounceHide}
     */
    debounceHide?: DebounceHide;
    /**
     * 自动绑定请求拦截模式
     *
     * @defaultValue `'none'`
     */
    autoBind?: AutoBindMode;
    /**
     * 请求过滤配置
     *
     * @remarks 详见 {@link RequestFilter}
     */
    requestFilter?: RequestFilter;
    /**
     * 注入到浏览器全局的变量名
     *
     * @defaultValue `'__LOADING_MANAGER__'`
     *
     * @example
     * ```typescript
     * loadingManager({ globalName: '__MY_LOADING__' })
     * // 使用：window.__MY_LOADING__.show()
     * ```
     */
    globalName?: string;
    /**
     * 自定义 Loading HTML 模板
     *
     * @remarks 如果提供，将替代默认的 loading 模板。
     * 模板中 **必须** 包含一个具有 `data-loading-text` 属性的元素用于文本显示，
     * 否则 {@link LoadingManager.updateText} 将无法工作
     *
     * @example
     * ```typescript
     * loadingManager({
     *   customTemplate: '<div class="my-loader"><span data-loading-text></span></div>'
     * })
     * ```
     */
    customTemplate?: string;
    /**
     * Loading DOM 的初始可见状态
     *
     * @defaultValue `false`
     *
     * @remarks
     * 设为 `true` 时，loading DOM 以可见状态注入到 HTML 的 `<head>` 中，
     * 无需等待 JS 执行即可在白屏阶段显示 loading。
     *
     * 典型用法：配合 {@link autoHideOn} 使用，实现"白屏时显示 → 页面就绪后自动隐藏"。
     *
     * @example
     * ```typescript
     * // 白屏阶段即显示 loading，DOMContentLoaded 后自动隐藏
     * loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
     *
     * // 白屏阶段即显示 loading，所有资源加载完成后自动隐藏
     * loadingManager({ defaultVisible: true, autoHideOn: 'load' })
     *
     * // Vue/React SPA：白屏阶段即显示，框架渲染完成后手动隐藏
     * loadingManager({ defaultVisible: true, autoHideOn: 'manual' })
     * // 在应用入口处：window.__LOADING_MANAGER__.hide()
     * ```
     */
    defaultVisible?: boolean;
    /**
     * 当 `defaultVisible` 为 `true` 时，loading 的自动隐藏时机
     *
     * @defaultValue `'DOMContentLoaded'`
     *
     * @remarks 仅在 {@link defaultVisible} 为 `true` 时生效：
     * - `'DOMContentLoaded'` — DOM 解析完成后自动隐藏（适合 SSR/MPA）
     * - `'load'` — 所有资源（图片、样式等）加载完成后自动隐藏（适合资源较重的页面）
     * - `'manual'` — 不自动隐藏，需在应用代码中手动调用 `window.__LOADING_MANAGER__.hide()`
     *   （适合 Vue/React SPA，在框架渲染完成后手动隐藏）
     */
    autoHideOn?: AutoHideOn;
    /**
     * 生命周期回调
     *
     * @remarks 回调以函数体字符串形式提供，在运行时执行。
     * 详见 {@link LoadingCallbacks}
     *
     * @example
     * ```typescript
     * loadingManager({
     *   callbacks: {
     *     onShow: 'console.log("loading shown")',
     *     onBeforeShow: 'return true'
     *   }
     * })
     * ```
     */
    callbacks?: LoadingCallbacks;
}

/**
 * 全局 Loading 状态管理插件
 *
 * @param options - 插件配置选项，详见 {@link LoadingManagerOptions}
 * @returns Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * loadingManager()
 *
 * // 自定义位置和文本
 * loadingManager({
 *   position: 'top',
 *   defaultText: '请稍候...'
 * })
 *
 * // 使用不同类型的加载图标
 * loadingManager({
 *   spinnerType: 'dots',  // spinner | dots | pulse | bar
 * })
 *
 * // 自动拦截 fetch 请求
 * loadingManager({
 *   autoBind: 'fetch',
 *   requestFilter: {
 *     excludeUrls: [/\/api\/health/],
 *     excludeUrlPrefixes: ['http://localhost']
 *   }
 * })
 *
 * // 自定义样式（含模糊背景）
 * loadingManager({
 *   style: {
 *     overlayColor: 'rgba(0, 0, 0, 0.5)',
 *     spinnerColor: '#ff6b6b',
 *     spinnerSize: '50px',
 *     backdropBlur: true,
 *     backdropBlurAmount: 6
 *   }
 * })
 *
 * // 自定义过渡动画
 * loadingManager({
 *   transition: {
 *     enabled: true,
 *     duration: 300,
 *     easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
 *   }
 * })
 *
 * // 防抖隐藏（避免快速闪烁）
 * loadingManager({
 *   debounceHide: {
 *     enabled: true,
 *     duration: 100
 *   }
 * })
 *
 * // 生命周期回调
 * loadingManager({
 *   callbacks: {
 *     onShow: 'console.log("loading shown")',
 *     onBeforeShow: 'return true',  // 返回 false 可阻止显示
 *     onHide: 'console.log("loading hidden")'
 *   }
 * })
 *
 * // 自定义模板
 * loadingManager({
 *   customTemplate: '<div class="my-loader"><span data-loading-text></span></div>'
 * })
 *
 * // 白屏阶段即显示 loading，DOMContentLoaded 后自动隐藏
 * loadingManager({
 *   defaultVisible: true,
 *   autoHideOn: 'DOMContentLoaded'
 * })
 *
 * // 白屏阶段即显示 loading，所有资源加载完成后自动隐藏
 * loadingManager({
 *   defaultVisible: true,
 *   autoHideOn: 'load'
 * })
 *
 * // Vue/React SPA：白屏阶段即显示，框架渲染完成后手动隐藏
 * loadingManager({
 *   defaultVisible: true,
 *   autoHideOn: 'manual'
 * })
 * // 在应用入口处手动隐藏：
 * // window.__LOADING_MANAGER__.hide()
 * ```
 *
 * @remarks
 * 该插件在 HTML 中注入全局 Loading 状态管理代码，提供以下能力：
 * - 全局 loading 的创建、显示、隐藏和销毁
 * - 跨组件/页面共享 loading 状态
 * - 多种内置加载图标（spinner / dots / pulse / bar）
 * - 自定义样式、文本和显示位置
 * - 过渡动画配置（淡入淡出）
 * - 自动拦截 fetch/XHR 请求实现 loading 自动管理
 * - 延迟显示和最小显示时间机制
 * - 防抖隐藏避免闪烁
 * - 请求过滤（排除/包含特定 URL、前缀匹配、方法过滤）
 * - 生命周期回调（onBeforeShow / onShow / onBeforeHide / onHide / onDestroy）
 * - 背景模糊效果（backdrop-filter）
 * - 销毁时自动恢复原始 fetch/XHR
 * - SSR 环境安全检测
 * - 白屏阶段即显示 loading（defaultVisible + autoHideOn）
 *
 * 运行时 API：
 * ```typescript
 * // 显示 loading
 * window.__LOADING_MANAGER__.show('加载中...')
 *
 * // 隐藏 loading
 * window.__LOADING_MANAGER__.hide()
 *
 * // 强制隐藏（忽略最小显示时间）
 * window.__LOADING_MANAGER__.forceHide()
 *
 * // 更新文本
 * window.__LOADING_MANAGER__.updateText('正在处理...')
 *
 * // 检查状态
 * window.__LOADING_MANAGER__.isVisible()
 *
 * // 获取挂起请求数
 * window.__LOADING_MANAGER__.getPendingCount()
 *
 * // 销毁（恢复原始 fetch/XHR）
 * window.__LOADING_MANAGER__.destroy()
 * ```
 */
declare const loadingManager: PluginFactory<LoadingManagerOptions, LoadingManagerOptions>;

/**
 * 版本来源类型
 *
 * @description
 * - 'define': 从 Vite define 注入的全局变量中读取（如 __APP_VERSION__）
 * - 'file': 从版本文件（如 version.json）中读取
 * - 'auto': 自动检测，优先使用 define，回退到 file
 */
type VersionSource = 'define' | 'file' | 'auto';
/**
 * 更新提示 UI 样式
 *
 * @description
 * - 'modal': 居中弹窗，需用户手动操作
 * - 'banner': 顶部横幅，可自动消失或手动关闭
 * - 'toast': 底部轻提示，自动消失
 */
type PromptStyle = 'modal' | 'banner' | 'toast';
/**
 * 版本更新检查器的配置选项接口
 *
 * @interface VersionUpdateCheckerOptions
 */
interface VersionUpdateCheckerOptions extends BasePluginOptions {
    /**
     * 当前版本号的来源
     *
     * @default 'auto'
     */
    versionSource?: VersionSource;
    /**
     * define 模式下的全局变量名
     *
     * @description 当 versionSource 为 'define' 或 'auto' 时，
     * 从此全局变量读取当前构建版本号
     *
     * @default '__APP_VERSION__'
     */
    defineName?: string;
    /**
     * 版本检查文件的 URL 路径
     *
     * @description 客户端将定期请求此 URL 获取最新版本号，
     * 并与当前版本号对比判断是否有更新
     *
     * @default '/version.json'
     */
    checkUrl?: string;
    /**
     * 版本检查间隔时间（毫秒）
     *
     * @default 300000（5 分钟）
     */
    checkInterval?: number;
    /**
     * 页面可见性变化时是否立即检查
     *
     * @description 当用户从其他标签页切回时，立即检查版本更新，
     * 而不是等待下一个定时周期
     *
     * @default true
     */
    checkOnVisibilityChange?: boolean;
    /**
     * 是否在开发模式下启用版本检查
     *
     * @default false
     */
    enableInDev?: boolean;
    /**
     * 更新提示 UI 样式
     *
     * @default 'modal'
     */
    promptStyle?: PromptStyle;
    /**
     * 更新提示消息文本
     *
     * @default '发现新版本，是否立即刷新获取最新内容？'
     */
    promptMessage?: string;
    /**
     * 刷新按钮文本
     *
     * @default '立即刷新'
     */
    refreshButtonText?: string;
    /**
     * 忽略按钮文本
     *
     * @default '稍后再说'
     */
    dismissButtonText?: string;
    /**
     * 自定义提示 UI 的 HTML 模板
     *
     * @description 替换内置的提示 UI，模板中可使用以下占位符：
     * - {{message}}: 提示消息
     * - {{currentVersion}}: 当前版本号
     * - {{newVersion}}: 新版本号
     * - {{refreshButton}}: 刷新按钮
     * - {{dismissButton}}: 忽略按钮
     *
     * 模板中不允许包含 <script> 标签
     */
    customPromptTemplate?: string;
    /**
     * 自定义样式字符串
     *
     * @description 追加到内置样式之后的自定义 CSS
     */
    customStyle?: string;
    /**
     * 发现新版本时的回调（函数体字符串）
     *
     * @description 回调以函数体字符串形式提供，因为需要注入到客户端代码中。
     * 可用变量：currentVersion、newVersion
     *
     * @example 'console.log("新版本:", newVersion); return true;'
     */
    onUpdateAvailable?: string;
    /**
     * 用户选择刷新时的回调（函数体字符串）
     *
     * @example 'console.log("用户选择刷新");'
     */
    onRefresh?: string;
    /**
     * 用户选择忽略时的回调（函数体字符串）
     *
     * @example 'console.log("用户选择忽略");'
     */
    onDismiss?: string;
}

/**
 * 版本更新检查器插件
 *
 * @param options - 插件配置选项，详见 {@link VersionUpdateCheckerOptions}
 * @returns Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用 — 配合 generateVersion 插件
 * generateVersion({
 *   format: 'datetime',
 *   outputType: 'both',
 *   defineName: '__APP_VERSION__'
 * }),
 * versionUpdateChecker()
 *
 * // 自定义检查间隔和提示样式
 * versionUpdateChecker({
 *   checkInterval: 60000,    // 1 分钟检查一次
 *   promptStyle: 'banner'    // 顶部横幅提示
 * })
 *
 * // 自定义提示消息和回调
 * versionUpdateChecker({
 *   promptMessage: '系统已更新，请刷新页面',
 *   onUpdateAvailable: 'console.log("新版本:", newVersion); return true;',
 *   onRefresh: 'console.log("用户选择刷新");',
 *   onDismiss: 'console.log("用户选择忽略");'
 * })
 *
 * // 开发模式也启用
 * versionUpdateChecker({
 *   enableInDev: true,
 *   checkInterval: 10000
 * })
 *
 * // 自定义 UI 模板
 * versionUpdateChecker({
 *   customPromptTemplate: '<div class="my-update-prompt">{{message}} {{refreshButton}}</div>',
 *   customStyle: '.my-update-prompt { background: #333; color: #fff; }'
 * })
 * ```
 *
 * @remarks
 * 该插件通常与 `generateVersion` 插件配合使用：
 * - `generateVersion` 负责在构建时生成版本号并输出到 `version.json` 文件和全局变量
 * - `versionUpdateChecker` 负责在运行时定期检查版本号变更并提示用户刷新
 *
 * 工作原理：
 * 1. 页面加载时，从全局变量（如 `__APP_VERSION__`）读取当前版本号
 * 2. 定期请求 `version.json` 获取最新版本号
 * 3. 当版本号不一致时，显示更新提示 UI
 * 4. 用户点击"立即刷新"后执行 `location.reload()`
 * 5. 用户点击"稍后再说"后隐藏提示，本次会话不再提醒
 * 6. 页面可见性变化时（如从其他标签页切回）立即检查更新
 */
declare const versionUpdateChecker: PluginFactory<VersionUpdateCheckerOptions, VersionUpdateCheckerOptions>;

export { buildProgress, copyFile, faviconManager, generateRouter, generateVersion, loadingManager, versionUpdateChecker };
export type { AutoBindMode, AutoHideOn, BuildPhase, BuildProgressOptions, CopyFileOptions, DebounceHide, DelayShow, FaviconManagerOptions, GenerateRouterOptions, GenerateVersionOptions, Icon, LoadingCallbacks, LoadingManager, LoadingManagerOptions, LoadingPosition, LoadingStyle, MinDisplayTime, NameStrategy, OutputFormat, OutputType, ProgressFormat, ProgressTheme, PromptStyle, RequestFilter, RouteConfig, RouteMeta, SpinnerType, TransitionConfig, UniAppPageConfig, UniAppPagesJson, UniAppTabBarConfig, VersionFormat, VersionSource, VersionUpdateCheckerOptions };
