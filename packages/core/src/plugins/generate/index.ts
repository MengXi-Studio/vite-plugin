export * from './autoImport'
export * from './generateRouter'
export * from './generateVersion'

// generatePages 复用了 generateRouter 的通用 uni-app 类型，此处仅显式导出其独有成员，避免导出歧义
export { generatePages } from './generatePages'
export type { GeneratePagesOptions, RouteConfigBlock, SubPackageConfig, TabBarTemplate } from './generatePages'
