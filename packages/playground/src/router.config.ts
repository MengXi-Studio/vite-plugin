/**
 * @plugin generate-router
 * @date 2026-06-26 23:42:25
 * @version 0.2.7
 */

/**
 * 路由配置列表
 * @description 由 pages.json 自动生成
 */
export const routes = [
	{
		path: '/pages/index/index',
		name: 'pagesIndexIndex',
		meta: { title: '首页 - vite-plugin 演示', isTab: true, customField: 'user-custom-value' },
		beforeEnter: (to, from, next) => {
			console.log('用户自定义守卫')
			next()
		}
	},
	{
		path: '/pages/navigation/navigation',
		name: 'pagesNavigationNavigation',
		meta: { title: '路由导航' }},
	{
		path: '/pages/guards/guards',
		name: 'pagesGuardsGuards',
		meta: { title: '路由守卫' }},
	{
		path: '/pages/detail/detail',
		name: 'pagesDetailDetail',
		meta: { title: '详情页' }},
	{
		path: '/pages/protected/protected',
		name: 'ProtectedPage',
		meta: { title: '受保护页面', requireAuth: true, role: 'admin' }},
	{
		path: '/pages/login/login',
		name: 'pagesLoginLogin',
		meta: { title: '登录' }},
	{
		path: '/pages/about/about',
		name: 'pagesAboutAbout',
		meta: { title: '关于', isTab: true }},
	{
		path: '/pages/resolve/resolve',
		name: 'pagesResolveResolve',
		meta: { title: '路由解析' }},
	{
		path: '/pages/error/error',
		name: 'pagesErrorError',
		meta: { title: '错误页面' }},
	{
		path: '/pages-sub/profile/profile',
		name: 'pagesSubProfileProfile',
		meta: { title: '个人中心' }},
	{
		path: '/pages-sub/settings/settings',
		name: 'pagesSubSettingsSettings',
		meta: { title: '设置', requireAuth: true }}
]

export default routes
