// 页面配置提取
export { extractCustomBlock, parseRouteConfig, extractRouteConfig } from './extractor'

// 目录扫描与页面组装
export { scanPageFiles, buildPageConfig, buildScannedPage, isTabPage } from './scanner'
export type { ScanOrigin } from './scanner'

// tabBar 归集
export { buildTabBar, countTabPages } from './generator'

// 与现有 pages.json 合并
export { mergePagesJson } from './merger'
export type { GeneratedPagesInfo } from './merger'

// 类型
export type { RouteConfigBlock, UniAppPageConfig, UniAppTabBarConfig, UniAppPagesJson, SubPackageConfig, TabBarTemplate, TabBarItemOverride, ScannedPage, GeneratePagesOptions } from '../types'
