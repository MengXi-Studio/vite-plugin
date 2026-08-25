// 阶段一：扫描页面 + route-config，产出内存 pages 数据
export { producePages } from './pages'
export type { ProducePagesResult } from './pages'

// 阶段二：基于内存 pages 数据生成路由配置
export { generateRouterFromPages } from './router'
