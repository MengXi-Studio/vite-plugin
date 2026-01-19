import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const META_URL = 'https://mengxi-studio.github.io/vite-plugin/zh/'
export const META_TITLE = 'Vite Plugin'
export const META_DESCRIPTION = '基于 Vite 的自定义插件集合'

export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
	/** 网站配置 描述 */
	description: META_DESCRIPTION,

	/** 网站配置 头信息 */
	head: [
		['meta', { property: 'og:url', content: META_URL }],
		['meta', { property: 'og:description', content: META_DESCRIPTION }],
		['meta', { property: 'twitter:url', content: META_URL }],
		['meta', { property: 'twitter:title', content: META_TITLE }],
		['meta', { property: 'twitter:description', content: META_DESCRIPTION }]
	],

	/** 网站配置 主题配置 */
	themeConfig: {
		/** 网站主题配置 编辑链接 */
		editLink: {
			pattern: 'https://github.com/MengXi-Studio/vite-plugin/tree/master/packages/docs/:path',
			text: '对本页提出修改建议'
		},

		/** 网站主题配置 大纲标题 */
		outlineTitle: '本页内容',

		/** 网站主题配置 导航栏 */
		nav: [
			{
				text: '教程',
				link: '/guide/',
				activeMatch: '^/guide/'
			},
			{
				text: '相关链接',
				items: [
					{
						text: 'Discussions',
						link: 'https://github.com/MengXi-Studio/uni-router/discussions'
					},
					{
						text: '更新日志',
						link: 'https://github.com/MengXi-Studio/uni-router/releases'
					}
				]
			}
		],

		/** 网站主题配置 侧边栏 */
		sidebar: {
			'/guide/': [
				{
					text: '设置',
					items: [
						{
							text: '介绍',
							link: '/zh/introduction.html'
						},
						{
							text: '安装',
							link: '/zh/installation.html'
						}
					]
				},
				{
					text: '基础',
					items: [
						{
							text: '入门',
							link: '/zh/guide/'
						},
						{
							text: '动态路由匹配',
							link: '/zh/guide/essentials/dynamic-matching.html'
						},
						{
							text: '路由的匹配语法',
							link: '/zh/guide/essentials/route-matching-syntax.html'
						},
						{
							text: '嵌套路由',
							link: '/zh/guide/essentials/nested-routes.html'
						},
						{
							text: '命名路由',
							link: '/zh/guide/essentials/named-routes.html'
						},
						{
							text: '编程式导航',
							link: '/zh/guide/essentials/programmatic-navigation.html'
						}
					]
				},
				{
					text: '工具',
					items: [
						{
							text: 'deepMerge 函数',
							link: '/zh/guide/utilities/deep-merge.html'
						},
						{
							text: 'deepEqual 函数',
							link: '/zh/guide/utilities/deep-equal.html'
						},
						{
							text: 'singleCase 函数',
							link: '/zh/guide/utilities/single-case.html'
						}
					]
				},
				{
					text: '进阶',
					items: [
						{
							text: '路由守卫',
							link: '/zh/guide/advanced/navigation-guards.html'
						},
						{
							text: '路由元信息',
							link: '/zh/guide/advanced/route-meta.html'
						},
						{
							text: '自动路由生成',
							link: '/zh/guide/advanced/auto-router.html'
						},
						{
							text: '组合式 API',
							link: '/zh/guide/advanced/composition-api.html'
						},
						{
							text: '路由组件',
							link: '/zh/guide/advanced/components.html'
						}
					]
				},
				{
					text: '插件',
					items: [
						{
							text: 'uni-pages 插件',
							link: '/zh/guide/plugins/uni-pages.html'
						},
						{
							text: 'copyFile 插件',
							link: '/zh/guide/plugins/copy-file.html'
						}
					]
				}
			]
		}
	}
}
