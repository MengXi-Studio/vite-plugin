import { BasePluginOptions } from '../factory/index.mjs';
import { b as UniAppTabBarConfig, U as UniAppPageConfig } from './vite-plugin.CjZHnjC7.mjs';

/**
 * `<route-config>` 自定义块中可声明的页面配置
 *
 * @description 在每个 `.vue` 文件中通过 `<route-config>` 自定义块声明页面的
 * 标题、样式、元信息、tabBar 归属以及 tab 图标。若仅配置 tab 相关字段则自动应用到 tabBar。
 *
 * @example
 * ```vue
 * <route-config>
 * {
 *   "title": "首页",
 *   "isTab": true,
 *   "tab": {
 *     "iconPath": "static/tab/home.png",
 *     "selectedIconPath": "static/tab/home-active.png"
 *   }
 * }
 * </route-config>
 * ```
 */
interface RouteConfigBlock {
    /** 页面标题，映射为 style.navigationBarTitleText */
    title?: string;
    /** 页面样式配置，原样写入 pages.json 的 style 字段 */
    style?: Record<string, any>;
    /** 页面元信息，原样写入 pages.json 的 meta 字段 */
    meta?: Record<string, any>;
    /** 是否为 tabBar 页面，开启后自动归集到 tabBar.list */
    isTab?: boolean;
    /** 页面名称，写入 pages.json 的 name 字段（优先级高于文件推断） */
    name?: string;
    /** tabBar 图标与文本覆盖（仅 isTab 页面生效，优先级高于工厂 overrides 与全局模板） */
    tab?: TabBarItemOverride;
    [key: string]: any;
}
/**
 * 单个 tabBar 项的图标与文本覆盖配置
 */
interface TabBarItemOverride {
    /** tabBar 显示文本（缺省时取页面标题或文件名） */
    text?: string;
    /** 未选中的图标路径 */
    iconPath?: string;
    /** 选中的图标路径 */
    selectedIconPath?: string;
    /**
     * 排序权重，仅用于决定生成 `tabBar.list` 的先后顺序，不写入输出
     *
     * @description 越小越靠前；未设置的项目排在已设置之后，保持原有相对顺序。
     *
     * @example
     * ```vue
     * <route-config>
     * {
     *   "title": "关于",
     *   "isTab": true,
     *   "tab": { "text": "关于我们", "order": 1 }
     * }
     * </route-config>
     * ```
     */
    order?: number;
}
/**
 * 扫描得到的页面（含页面配置与 tab 覆盖信息）
 */
interface ScannedPage {
    /** 组装后的 pages.json 页面配置项 */
    page: UniAppPageConfig;
    /** 页面内声明的 tab 覆盖信息（来自 route-config.tab），无则为 undefined */
    tab?: TabBarItemOverride;
}
/**
 * 分包配置
 */
interface SubPackageConfig {
    /** 分包标识，写入 subPackages 的 root 字段（如 'pages-sub'） */
    root: string;
    /** 分包实际源码目录（相对于项目根目录，如 'src/pages-sub'） */
    dir: string;
}
/**
 * tabBar 模板配置（标记 + 模板归集）
 *
 * @description 提供整体的样式模板，插会将所有声明了 `isTab: true` 的页面
 * 自动归集到 list。`overrides` 可按页面路径覆盖单项文本与图标。
 */
interface TabBarTemplate extends Omit<UniAppTabBarConfig, 'list'> {
    /** 应用到所有自动生成 tab 项的默认图标路径（可选模板） */
    iconPath?: string;
    /** 应用到所有自动生成 tab 项的默认选中图标路径（可选模板） */
    selectedIconPath?: string;
    /** 按 pagePath 覆盖单项配置 */
    overrides?: Record<string, TabBarItemOverride>;
}
/**
 * 生成 uni-app pages.json 插件选项
 */
interface GeneratePagesOptions extends BasePluginOptions {
    /**
     * pages.json 文件路径（相对于项目根目录）
     * @default 'src/pages.json'
     */
    pagesJsonPath?: string;
    /**
     * 主包页面目录（相对于项目根目录）
     * @default 'src/pages'
     */
    pagesDir?: string;
    /**
     * 分包配置列表，目录不存在时自动跳过
     * @default
     * [{ root: 'pages-sub', dir: 'src/pages-sub' }]
     */
    subPackages?: SubPackageConfig[];
    /**
     * 页面配置自定义块名称
     * @default 'route-config'
     */
    routeConfigBlock?: string;
    /** 主包入口页路径（如 'pages/index/index'），作为 pages[0] 固定置于首位；未配置时继承现有 pages[0] */
    entryPage?: string;
    /**
     * 页面标题缺失时的兜底策略
     * @default 'filename'
     */
    titleFallback?: 'filename' | 'none';
    /** tabBar 模板，提供后自动生成 tabBar（基于 isTab 标记归集） */
    tabBar?: TabBarTemplate;
    /** 页面文件扩展名列表 @default ['.vue'] */
    includeExtensions?: string[];
    /**
     * 需要排除的路径模式列表
     * @default []
     */
    excludePatterns?: string[];
    /**
     * 是否监听页面目录变化并自动重新生成
     * @default true
     */
    watch?: boolean;
    /**
     * `defineUniPage` 宏的全局类型声明文件输出路径（相对项目根目录或绝对路径）
     *
     * @description 自动生成后，IDE（Vue (Official) / Volar / tsc）无需 import 即可
     * 识别 `<script setup>` 中的 `defineUniPage` 宏，获得类型提示且不报未定义。
     * @default 'src/define-uni-page.d.ts'
     */
    dts?: string | false;
}

export type { GeneratePagesOptions as G, RouteConfigBlock as R, SubPackageConfig as S, TabBarTemplate as T, ScannedPage as a, TabBarItemOverride as b };
