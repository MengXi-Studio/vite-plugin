import type { RouteConfig } from '@meng-xi/uni-router'

/**
 * 路由配置列表
 * @description 由 pages.json 自动生成
 */
export const routes: RouteConfig[] = [
	{
		path: '/pages/index/index',
		name: 'pagesIndexIndex',
		meta: { title: '插件功能验证' }
	},
	{
		path: '/pages/about/index',
		name: 'pagesAboutIndex',
		meta: { title: '关于' }
	}
]

export default routes
