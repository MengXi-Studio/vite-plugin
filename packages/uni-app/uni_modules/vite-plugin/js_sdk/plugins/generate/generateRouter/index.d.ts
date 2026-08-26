import { PluginFactory } from '../../../factory/index.js';
import { G as GenerateRouterOptions } from '../../../shared/vite-plugin.B8yTanEe.js';
export { N as NameStrategy, O as OutputFormat, R as RouteConfig, a as RouteMeta } from '../../../shared/vite-plugin.B8yTanEe.js';
export { U as UniAppPageConfig, a as UniAppPagesJson, b as UniAppTabBarConfig } from '../../../shared/vite-plugin.CjZHnjC7.js';
import 'vite';
import '../../../shared/vite-plugin.BmNqGOzh.js';
import '../../../shared/vite-plugin.DRRlWY8P.js';

/**
 * 生成路由配置插件
 *
 * 读取 uni-app 项目的 pages.json，自动生成路由配置文件。支持子包、tabBar 推断、
 * 多种命名策略、自定义元信息映射、开发模式监听 pages.json 变化。
 *
 * @example
 * ```typescript
 * generateRouter()
 * generateRouter({ nameStrategy: 'pascalCase', dts: true })
 * ```
 */
declare const generateRouter: PluginFactory<GenerateRouterOptions, GenerateRouterOptions>;

export { GenerateRouterOptions, generateRouter };
