import { BasePluginOptions, PluginFactory } from '../../factory/index.js';
import 'vite';
import '../../shared/vite-plugin.CLr0ttuO.js';
import '../../shared/vite-plugin.DRRlWY8P.js';

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

export { generateRouter };
export type { GenerateRouterOptions, NameStrategy, OutputFormat, RouteConfig, RouteMeta, UniAppPageConfig, UniAppPagesJson, UniAppTabBarConfig };
