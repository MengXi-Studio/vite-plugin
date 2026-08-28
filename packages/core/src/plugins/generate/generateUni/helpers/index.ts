// 阶段一：扫描页面 + route-config，产出内存 pages 数据（复用 generatePages 公共实现）
export { producePages } from '../../generatePages/helpers'
export type { ProducePagesResult } from '../../generatePages/helpers'

// 阶段二：基于内存 pages 数据生成路由配置
export { generateRouterFromPages } from './router'
