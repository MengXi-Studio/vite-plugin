import { BasePluginOptions, PluginFactory } from '../../../factory/index.js';
import { GeneratePagesOptions } from '../../../index.js';
import { GenerateRouterOptions } from '../../../index.js';
import 'vite';
import '../../../shared/vite-plugin.BmNqGOzh.js';
import '../../../shared/vite-plugin.DRRlWY8P.js';
import '../../../shared/vite-plugin.CjZHnjC7.js';

/**
 * generateUni 合并插件选项
 *
 * @description 将 `generatePages`（扫描页面 + `<route-config>` 生成 pages.json）与
 * `generateRouter`（基于 pages.json 生成路由配置）编排为一条流水线：
 * 阶段一产出内存 pages 数据并写入 pages.json，阶段二直接消费该内存数据生成路由文件。
 *
 * - 顶层：两阶段共用的配置（`pagesJsonPath`、`watch`）
 * - `pages`：阶段一（页面生成）专有参数，等价于 {@link GeneratePagesOptions}
 * - `router`：阶段二（路由生成）专有参数，等价于 {@link GenerateRouterOptions}
 */
interface GenerateUniOptions extends BasePluginOptions {
    /** pages.json 文件路径（两阶段共用，相对于项目根目录） @default 'src/pages.json' */
    pagesJsonPath?: string;
    /** 是否监听页面目录变更并自动重新执行整条流水线 @default true */
    watch?: boolean;
    /** 阶段一参数：页面生成（等价 generatePages 选项：pagesDir/subPackages/routeConfigBlock/entryPage/titleFallback/tabBar/includeExtensions/excludePatterns） */
    pages?: GeneratePagesOptions;
    /** 阶段二参数：路由生成（等价 generateRouter 选项：outputPath/outputFormat/nameStrategy/metaMapping/exportTypes/preserveRouteChanges/headerTemplate/customFields/dts/includeSubPackages） */
    router?: GenerateRouterOptions;
}

/**
 * 一键完成「页面配置生成 + 路由配置生成」的合并插件
 *
 * 编排 `generatePages`（扫描页面 → pages.json）与 `generateRouter`（pages.json → 路由配置），
 * 以内存 pages 数据串联，避免先写盘再读盘。原有两个插件保持不变。
 *
 * @example
 * ```typescript
 * generateUni({
 *   pagesJsonPath: 'src/pages.json',
 *   pages: {
 *     pagesDir: 'src/pages',
 *     subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }],
 *     entryPage: 'pages/index/index',
 *     tabBar: { color: '#999999', selectedColor: '#42b883' }
 *   },
 *   router: {
 *     outputPath: 'src/router.config.ts',
 *     nameStrategy: 'camelCase',
 *     dts: 'src/router.d.ts'
 *   }
 * })
 * ```
 */
declare const generateUni: PluginFactory<GenerateUniOptions, GenerateUniOptions>;

export { generateUni };
export type { GenerateUniOptions };
