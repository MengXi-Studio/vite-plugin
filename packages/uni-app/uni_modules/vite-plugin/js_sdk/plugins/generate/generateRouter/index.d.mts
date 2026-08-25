import { PluginFactory } from '../../../factory/index.mjs';
import { G as GenerateRouterOptions } from '../../../shared/vite-plugin.BnRTFB5N.mjs';
export { N as NameStrategy, O as OutputFormat, R as RouteConfig, a as RouteMeta, U as UniAppPageConfig, b as UniAppPagesJson, c as UniAppTabBarConfig } from '../../../shared/vite-plugin.BnRTFB5N.mjs';
import 'vite';
import '../../../shared/vite-plugin.BmNqGOzh.mjs';
import '../../../shared/vite-plugin.DRRlWY8P.mjs';

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
