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
				text: 'Common Utils',
				link: '/en/common/index.html'
			},
			{
				text: 'Plugin Factory',
				link: '/en/factory/index.html'
			},
			{
				text: 'Logger',
				link: '/en/logger/index.html'
			},
			{
				text: 'Plugins',
				link: '/en/plugins/index.html'
			},
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
					text: 'Common Utils',
					items: [
						{
							text: 'Overview',
							link: '/en/common/index.html'
						},
						{
							text: 'File System',
							link: '/en/common/fs.html'
						},
						{
							text: 'Format',
							link: '/en/common/format.html'
						},
						{
							text: 'Object',
							link: '/en/common/object.html'
						},
						{
							text: 'Validation',
							link: '/en/common/validation.html'
						}
					]
				},
				{
					text: 'Plugin Factory',
					items: [
						{
							text: 'Overview',
							link: '/en/factory/index.html'
						},
						{
							text: 'BasePlugin',
							link: '/en/factory/base-plugin.html'
						},
						{
							text: 'createPluginFactory',
							link: '/en/factory/create-plugin-factory.html'
						},
						{
							text: 'BasePluginOptions',
							link: '/en/factory/base-plugin-options.html'
						}
					]
				},
				{
					text: 'Logger',
					items: [
						{
							text: 'Overview',
							link: '/en/logger/index.html'
						},
						{
							text: 'Logger',
							link: '/en/logger/logger-class.html'
						},
						{
							text: 'PluginLogger',
							link: '/en/logger/plugin-logger.html'
						},
						{
							text: 'LoggerOptions',
							link: '/en/logger/logger-options.html'
						}
					]
				},
				{
					text: 'Plugins',
					items: [
						{
							text: 'Overview',
							link: '/en/plugins/index.html'
						},
						{
							text: 'copyFile',
							link: '/en/plugins/copy-file.html'
						},
						{
							text: 'generateRouter',
							link: '/en/plugins/generate-router.html'
						},
						{
							text: 'generateVersion',
							link: '/en/plugins/generate-version.html'
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
