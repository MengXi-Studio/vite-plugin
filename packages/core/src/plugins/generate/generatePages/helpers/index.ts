// 页面配置提取
export { extractCustomBlock, parseRouteConfig, extractRouteConfig } from './extractor'

// 目录扫描与页面组装
export { scanPageFiles, buildPageConfig, buildScannedPage, isTabPage, orderMainPages } from './scanner'
export type { ScanOrigin } from './scanner'

// tabBar 归集
export { buildTabBar, countTabPages } from './generator'

// 与现有 pages.json 合并
export { mergePagesJson } from './merger'
export type { GeneratedPagesInfo } from './merger'

// 页面生成流水线（内存产出，供 generatePages 写盘与 generateUni 直传）
export { producePages, readExistingPagesJson } from './produce'
export type { ProducePagesResult } from './produce'

// 类型
export type { RouteConfigBlock, UniAppPageConfig, UniAppTabBarConfig, UniAppPagesJson, SubPackageConfig, TabBarTemplate, TabBarItemOverride, ScannedPage, GeneratePagesOptions } from '../types'
