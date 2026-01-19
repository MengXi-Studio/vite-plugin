import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const META_URL = 'https://mengxi-studio.github.io/vite-plugin/'
export const META_TITLE = 'Vite Plugin'
export const META_DESCRIPTION = 'Custom plugin collection based on Vite'

export const enConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
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
			text: 'Suggest changes to this page'
		},

		/** 网站主题配置 大纲标题 */
		outlineTitle: 'Contents of this page',

		/** 网站主题配置 导航栏 */
		nav: [
			{
				text: 'Guide',
				link: '/guide/',
				activeMatch: '^/guide/'
			},
			{
				text: 'API Reference',
				link: '/api/'
			},
			{
				text: 'Links',
				items: [
					{
						text: 'Discussions',
						link: 'https://github.com/MengXi-Studio/uni-router/discussions'
					},
					{
						text: 'Changelog',
						link: 'https://github.com/MengXi-Studio/uni-router/releases'
					}
				]
			}
		],

		/** 网站主题配置 侧边栏 */
		sidebar: {
			'/api/': [
				{
					text: 'API Reference',
					items: [
						{
							text: 'API Overview',
							link: '/api/'
						},
						{
							text: 'Core Functions',
							link: '/api/core.html'
						},
						{
							text: 'Composition API',
							link: '/api/composition-api.html'
						},
						{
							text: 'Components',
							link: '/api/components.html'
						},
						{
							text: 'Utilities',
							link: '/api/utilities.html'
						},
						{
							text: 'Plugins',
							link: '/api/plugins.html'
						},
						{
							text: 'Type Definitions',
							link: '/api/types.html'
						}
					]
				}
			],
			'/': [
				{
					text: 'Setup',
					items: [
						{
							text: 'Introduction',
							link: '/introduction.html'
						},
						{
							text: 'Installation',
							link: '/installation.html'
						}
					]
				},
				{
					text: 'Essentials',
					items: [
						{
							text: 'Getting Started',
							link: '/guide/'
						},
						{
							text: 'Dynamic Route Matching',
							link: '/guide/essentials/dynamic-matching.html'
						},
						{
							text: 'Route Matching Syntax',
							link: '/guide/essentials/route-matching-syntax.html'
						},
						{
							text: 'Nested Routes',
							link: '/guide/essentials/nested-routes.html'
						},
						{
							text: 'Named Routes',
							link: '/guide/essentials/named-routes.html'
						},
						{
							text: 'Programmatic Navigation',
							link: '/guide/essentials/programmatic-navigation.html'
						}
					]
				},
				{
					text: 'Utilities',
					items: [
						{
							text: 'deepMerge function',
							link: '/guide/utilities/deep-merge.html'
						},
						{
							text: 'deepEqual function',
							link: '/guide/utilities/deep-equal.html'
						},
						{
							text: 'singleCase function',
							link: '/guide/utilities/single-case.html'
						}
					]
				},
				{
					text: 'Advanced',
					items: [
						{
							text: 'Navigation Guards',
							link: '/guide/advanced/navigation-guards.html'
						},
						{
							text: 'Route Meta',
							link: '/guide/advanced/route-meta.html'
						},
						{
							text: 'Auto Router',
							link: '/guide/advanced/auto-router.html'
						},
						{
							text: 'Composition API',
							link: '/guide/advanced/composition-api.html'
						},
						{
							text: 'Router Components',
							link: '/guide/advanced/components.html'
						}
					]
				},
				{
					text: 'Plugins',
					items: [
						{
							text: 'uni-pages Plugin',
							link: '/guide/plugins/uni-pages.html'
						},
						{
							text: 'copyFile Plugin',
							link: '/guide/plugins/copy-file.html'
						}
					]
				}
			]
		}
	}
}
