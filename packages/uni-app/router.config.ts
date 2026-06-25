import type { RouteConfig } from '@meng-xi/uni-router'

/**
 * 路由配置列表
 * @description 由 pages.json 自动生成
 */
export const routes: RouteConfig[] = [
	{
		path: '/pages/index/index',
		name: 'pagesIndexIndex',
		meta: { title: '插件功能验证', isTab: true }
	},
	{
		path: '/pages/navigation/index',
		name: 'pagesNavigationIndex',
		meta: { title: '路由导航' }
	},
	{
		path: '/pages/guards/index',
		name: 'pagesGuardsIndex',
		meta: { title: '路由守卫' }
	},
	{
		path: '/pages/detail/index',
		name: 'pagesDetailIndex',
		meta: { title: '详情页' }
	},
	{
		path: '/pages/protected/index',
		name: 'ProtectedPage',
		meta: { title: '受保护页面', requireAuth: true, role: 'admin' }
	},
	{
		path: '/pages/login/index',
		name: 'pagesLoginIndex',
		meta: { title: '登录' }
	},
	{
		path: '/pages/resolve/index',
		name: 'pagesResolveIndex',
		meta: { title: '路由解析' }
	},
	{
		path: '/pages/error/index',
		name: 'pagesErrorIndex',
		meta: { title: '错误页面' }
	},
	{
		path: '/pages/about/index',
		name: 'AboutPage',
		meta: { title: '关于', requireAuth: false, isTab: true }
	},
	{
		path: '/pages-sub/profile/index',
		name: 'pagesSubProfileIndex',
		meta: { title: '个人中心' }
	},
	{
		path: '/pages-sub/settings/index',
		name: 'pagesSubSettingsIndex',
		meta: { title: '设置', requireAuth: true }
	}
]

export default routes
