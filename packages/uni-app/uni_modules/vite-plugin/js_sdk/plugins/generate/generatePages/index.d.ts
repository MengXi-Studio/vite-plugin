import { PluginFactory } from '../../../factory/index.js';
import { G as GeneratePagesOptions } from '../../../shared/vite-plugin.BQFpJKhh.js';
export { R as RouteConfigBlock, a as ScannedPage, S as SubPackageConfig, b as TabBarItemOverride, T as TabBarTemplate } from '../../../shared/vite-plugin.BQFpJKhh.js';
export { U as UniAppPageConfig, a as UniAppPagesJson, b as UniAppTabBarConfig } from '../../../shared/vite-plugin.CjZHnjC7.js';
import 'vite';
import '../../../shared/vite-plugin.BmNqGOzh.js';
import '../../../shared/vite-plugin.DRRlWY8P.js';

/**
 * 生成 uni-app pages.json 插件
 *
 * 扫描 Vue 文件并动态生成/更新 uni-app 的 pages.json 页面相关配置，
 * 配合 `<route-config>` 自定义块彻底解放手动配置页面。
 *
 * @example
 * ```typescript
 * // 基本用法：扫描 src/pages + src/pages-sub，自动生成 pages/subPackages
 * generatePages()
 *
 * // 自定义分包与 tabBar 模板
 * generatePages({
 *   pagesDir: 'src/pages',
 *   subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }],
 *   tabBar: {
 *     color: '#999999',
 *     selectedColor: '#42b883',
 *     iconPath: 'static/tab.png',
 *     selectedIconPath: 'static/tab-active.png',
 *   },
 * })
 * ```
 */
declare const generatePages: PluginFactory<GeneratePagesOptions, GeneratePagesOptions>;

export { GeneratePagesOptions, generatePages };
