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
				text: '相关链接',
				items: [
					{
						text: 'Discussions',
						link: 'https://github.com/MengXi-Studio/vite-plugin/discussions'
					},
					{
						text: '更新日志',
						link: 'https://github.com/MengXi-Studio/vite-plugin/releases'
					}
				]
			}
		],

		/** 网站主题配置 侧边栏 */
		sidebar: {
			'/': [
				{
					text: '设置',
					items: [
						{
							text: '介绍',
							link: '/introduction.html'
						},
						{
							text: '安装',
							link: '/installation.html'
						}
					]
				},
				{
					text: '插件列表',
					items: [
						{
							text: 'copyFile',
							link: '/plugins/copy-file.html'
						},
						{
							text: 'injectIco',
							link: '/plugins/inject-ico.html'
						}
					]
				}
			]
		}
	}
}
