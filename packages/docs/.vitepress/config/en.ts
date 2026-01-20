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
				text: 'Links',
				items: [
					{
						text: 'Discussions',
						link: 'https://github.com/MengXi-Studio/vite-plugin/discussions'
					},
					{
						text: 'Changelog',
						link: 'https://github.com/MengXi-Studio/vite-plugin/releases'
					}
				]
			}
		],

		/** 网站主题配置 侧边栏 */
		sidebar: {
			'/en/': [
				{
					text: 'Setup',
					items: [
						{
							text: 'Introduction',
							link: '/en/introduction.html'
						},
						{
							text: 'Installation',
							link: '/en/installation.html'
						}
					]
				},
				{
					text: 'Plugins List',
					items: [
						{
							text: 'copyFile',
							link: '/en/plugins/copy-file.html'
						},
						{
							text: 'injectIco',
							link: '/en/plugins/inject-ico.html'
						}
					]
				}
			]
		}
	}
}
