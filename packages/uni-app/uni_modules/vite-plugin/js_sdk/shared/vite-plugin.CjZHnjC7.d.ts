/**
 * uni-app 通用类型
 *
 * @description 供 generate 分组内各插件（generatePages / generateRouter 等）
 * 共享的 uni-app `pages.json` 相关类型。抽离为公共模块，避免各插件之间互相反向依赖。
 */
/** uni-app pages.json 中的页面配置项 */
interface UniAppPageConfig {
    /** 页面路径，相对于 pages.json 所在目录 */
    path: string;
    /** 页面名称，优先级高于 nameStrategy */
    name?: string;
    /** 页面元信息，优先级高于 metaMapping 映射 */
    meta?: Record<string, any>;
    /** 页面样式配置 */
    style?: {
        navigationBarTitleText?: string;
        requireAuth?: boolean;
        [key: string]: any;
    };
    [key: string]: any;
}
/** uni-app pages.json 中的 tabBar 配置 */
interface UniAppTabBarConfig {
    /** tabBar 页面列表 */
    list?: Array<{
        pagePath: string;
        text?: string;
        iconPath?: string;
        selectedIconPath?: string;
    }>;
    [key: string]: any;
}
/** uni-app pages.json 结构 */
interface UniAppPagesJson {
    /** 主包页面列表 */
    pages: UniAppPageConfig[];
    /** 子包（分包）配置列表 */
    subPackages?: Array<{
        root: string;
        pages: UniAppPageConfig[];
    }>;
    /** tabBar 配置 */
    tabBar?: UniAppTabBarConfig;
    /** 全局样式配置 */
    globalStyle?: Record<string, any>;
    [key: string]: any;
}

export type { UniAppPageConfig as U, UniAppPagesJson as a, UniAppTabBarConfig as b };
