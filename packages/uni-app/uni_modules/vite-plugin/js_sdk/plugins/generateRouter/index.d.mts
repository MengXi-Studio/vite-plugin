import { BasePluginOptions, PluginFactory } from '../../factory/index.mjs';
import 'vite';
import '../../shared/vite-plugin.B8FuZce1.mjs';
import '../../shared/vite-plugin.DRRlWY8P.mjs';

/**
 * 路由元信息
 *
 * @interface RouteMeta
 * @description 路由附加的元数据，用于页面导航守卫、标题设置等场景。
 * 支持通过索引签名扩展自定义字段。
 */
interface RouteMeta {
    /** 页面标题，对应 pages.json 中的 navigationBarTitleText */
    title?: string;
    /** 是否为 TabBar 页面，由插件自动从 tabBar 配置推断 */
    isTab?: boolean;
    /** 是否需要登录才能访问 */
    requireAuth?: boolean;
    /** 自定义扩展字段 */
    [key: string]: unknown;
}
/**
 * 路由配置项
 *
 * @interface RouteConfig
 * @description 单条路由的完整配置，包含路径、名称和元信息。
 */
interface RouteConfig {
    /** 路由路径，以 `/` 开头 */
    path: string;
    /** 路由名称（用于命名路由导航），根据 nameStrategy 自动生成 */
    name?: string;
    /** 路由元信息 */
    meta?: RouteMeta;
}
/**
 * uni-app pages.json 中的页面配置项
 *
 * @interface UniAppPageConfig
 * @description 对应 pages.json 中 `pages` 数组里的单个页面对象。
 */
interface UniAppPageConfig {
    /** 页面路径，相对于 pages.json 所在目录 */
    path: string;
    /** 页面样式配置 */
    style?: {
        /** 导航栏标题文本 */
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
 *
 * @interface UniAppTabBarConfig
 * @description 对应 pages.json 中的 `tabBar` 字段，定义底部标签栏的页面列表和图标。
 */
interface UniAppTabBarConfig {
    /** tabBar 页面列表 */
    list?: Array<{
        /** 页面路径 */
        pagePath: string;
        /** 标签文字 */
        text?: string;
        /** 未选中图标路径 */
        iconPath?: string;
        /** 选中图标路径 */
        selectedIconPath?: string;
    }>;
    /** 其他属性 */
    [key: string]: unknown;
}
/**
 * uni-app pages.json 结构
 *
 * @interface UniAppPagesJson
 * @description 完整的 pages.json 文件结构，包含主包页面、子包、tabBar 和全局样式。
 */
interface UniAppPagesJson {
    /** 主包页面列表 */
    pages: UniAppPageConfig[];
    /** 子包（分包）配置列表 */
    subPackages?: Array<{
        /** 子包根路径 */
        root: string;
        /** 子包页面列表 */
        pages: UniAppPageConfig[];
    }>;
    /** tabBar 配置 */
    tabBar?: UniAppTabBarConfig;
    /** 全局样式配置 */
    globalStyle?: Record<string, unknown>;
    /** 其他属性 */
    [key: string]: unknown;
}
/**
 * 输出文件格式类型
 *
 * @description 支持的输出文件格式：
 * - `ts`: TypeScript 文件
 * - `js`: JavaScript 文件
 */
type OutputFormat = 'ts' | 'js';
/**
 * 路由名称生成策略
 *
 * @description 定义路由名称的生成方式：
 * - `path`: 使用原始路径（斜杠替换为下划线）
 * - `camelCase`: 驼峰命名（默认）
 * - `pascalCase`: 帕斯卡命名
 * - `custom`: 自定义生成函数
 */
type NameStrategy = 'path' | 'camelCase' | 'pascalCase' | 'custom';
/**
 * 生成路由配置插件选项
 *
 * @interface GenerateRouterOptions
 * @extends {BasePluginOptions}
 *
 * @example
 * ```typescript
 * generateRouter({
 *   pagesJsonPath: 'src/pages.json',
 *   outputPath: 'src/router.config.ts',
 *   outputFormat: 'ts',
 *   nameStrategy: 'camelCase',
 *   includeSubPackages: true,
 *   watch: true,
 *   metaMapping: {
 *     navigationBarTitleText: 'title',
 *     requireAuth: 'requireAuth'
 *   }
 * })
 * ```
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
    /**
     * TypeScript 类型声明文件输出路径
     *
     * @description 控制是否生成路由类型声明文件（`.d.ts`）：
     * - `string`：在指定路径生成类型声明文件
     * - `true`：使用默认路径 `src/router.d.ts`
     * - `false`：不生成类型声明文件
     *
     * 生成的类型声明文件会为 `@meng-xi/uni-router` 模块扩展 `RouteNameMap` 接口，
     * 提供路由名称到路径和元信息的类型映射，实现类型安全的路由导航。
     *
     * @default false
     *
     * @example
     * ```typescript
     * // 使用默认路径
     * generateRouter({ dts: true })
     *
     * // 自定义路径
     * generateRouter({ dts: 'src/types/router.d.ts' })
     * ```
     */
    dts?: string | boolean;
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
 *
 * // 生成路由类型声明文件
 * generateRouter({
 *   dts: true
 * })
 *
 * // 自定义类型声明文件路径
 * generateRouter({
 *   dts: 'src/types/router.d.ts'
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

export { generateRouter };
export type { GenerateRouterOptions, NameStrategy, OutputFormat, RouteConfig, RouteMeta, UniAppPageConfig, UniAppPagesJson, UniAppTabBarConfig };
