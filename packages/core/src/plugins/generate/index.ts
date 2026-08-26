export * from './autoImport'
export * from './generateRouter'
export * from './generateVersion'

// 共享的 uni-app 通用类型统一存放于公共模块 './types'，经 generateRouter 聚合导出
// generatePages 仅显式导出其独有成员，避免与其他插件产生导出歧义
export { generatePages } from './generatePages'
export type { GeneratePagesOptions, RouteConfigBlock, SubPackageConfig, TabBarTemplate } from './generatePages'

// generateUni 合并插件：编排 generatePages + generateRouter
export { generateUni } from './generateUni'
export type { GenerateUniOptions } from './generateUni'
