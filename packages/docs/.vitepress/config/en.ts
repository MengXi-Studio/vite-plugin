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
			{ text: 'Guide', link: '/en/guide/introduction.html' },
			{ text: 'Plugins', link: '/en/plugins/index.html' },
			{ text: 'Framework', link: '/en/factory/index.html' },
			{ text: 'Logger', link: '/en/logger/index.html' },
			{ text: 'Utils', link: '/en/common/index.html' },
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
			// 指南模块
			'/en/guide/': [
				{
					text: 'Getting Started',
					items: [
						{ text: 'Introduction', link: '/en/guide/introduction.html' },
						{ text: 'Installation', link: '/en/guide/installation.html' },
						{ text: 'Quick Start', link: '/en/guide/quick-start.html' }
					]
				},
				{
					text: 'In Depth',
					items: [
						{ text: 'Core Concepts', link: '/en/guide/concepts.html' },
						{ text: 'On-demand Import', link: '/en/guide/on-demand-import.html' },
						{ text: 'Best Practices', link: '/en/guide/best-practices.html' }
					]
				}
			],

			// 插件模块
			'/en/plugins/': [
				{
					text: 'Overview',
					items: [{ text: 'Plugins Overview', link: '/en/plugins/index.html' }]
				},
				{
					text: 'compress',
					collapsed: false,
					items: [
						{ text: 'compressAssets', link: '/en/plugins/compress-assets.html' },
						{ text: 'imageOptimizer', link: '/en/plugins/image-optimizer.html' }
					]
				},
				{
					text: 'generate',
					collapsed: false,
					items: [
						{ text: 'autoImport', link: '/en/plugins/auto-import.html' },
						{ text: 'generateRouter', link: '/en/plugins/generate-router.html' },
						{ text: 'generateVersion', link: '/en/plugins/generate-version.html' }
					]
				},
				{
					text: 'inject',
					collapsed: false,
					items: [
						{ text: 'htmlInject', link: '/en/plugins/html-inject.html' },
						{ text: 'loadingManager', link: '/en/plugins/loading-manager.html' },
						{ text: 'faviconManager', link: '/en/plugins/favicon-manager.html' },
						{ text: 'versionUpdateChecker', link: '/en/plugins/version-update-checker.html' }
					]
				},
				{
					text: 'analyze',
					collapsed: false,
					items: [
						{ text: 'bundleAnalyzer', link: '/en/plugins/bundle-analyzer.html' },
						{ text: 'buildProgress', link: '/en/plugins/build-progress.html' }
					]
				},
				{
					text: 'copy',
					collapsed: false,
					items: [
						{ text: 'copyFile', link: '/en/plugins/copy-file.html' },
						{ text: 'assetManifest', link: '/en/plugins/asset-manifest.html' }
					]
				},
				{
					text: 'guard',
					collapsed: false,
					items: [{ text: 'envGuard', link: '/en/plugins/env-guard.html' }]
				},
				{
					text: 'proxy',
					collapsed: false,
					items: [{ text: 'proxyManager', link: '/en/plugins/proxy-manager.html' }]
				}
			],

			// 插件开发框架
			'/en/factory/': [
				{
					text: 'Basics',
					items: [
						{ text: 'Overview', link: '/en/factory/index.html' },
						{ text: 'BasePlugin', link: '/en/factory/base-plugin.html' },
						{ text: 'createPluginFactory', link: '/en/factory/create-plugin-factory.html' },
						{ text: 'BasePluginOptions', link: '/en/factory/base-plugin-options.html' }
					]
				},
				{
					text: 'Advanced',
					items: [
						{ text: 'Lifecycle', link: '/en/factory/lifecycle.html' },
						{ text: 'Hook Registration', link: '/en/factory/hooks.html' }
					]
				}
			],

			// 日志模块
			'/en/logger/': [
				{
					text: 'Logger',
					items: [
						{ text: 'Overview', link: '/en/logger/index.html' },
						{ text: 'Logger', link: '/en/logger/logger-class.html' },
						{ text: 'PluginLogger', link: '/en/logger/plugin-logger.html' },
						{ text: 'LoggerOptions', link: '/en/logger/logger-options.html' }
					]
				}
			],

			// 公共工具
			'/en/common/': [
				{
					text: 'Overview',
					items: [{ text: 'Utils Overview', link: '/en/common/index.html' }]
				},
				{
					text: 'Utils List',
					items: [
						{ text: 'Code', link: '/en/common/code.html' },
						{ text: 'Compress', link: '/en/common/compress.html' },
						{ text: 'Concurrency', link: '/en/common/concurrency.html' },
						{ text: 'Env', link: '/en/common/env.html' },
						{ text: 'File System', link: '/en/common/fs.html' },
						{ text: 'Format', link: '/en/common/format.html' },
						{ text: 'Hash', link: '/en/common/hash.html' },
						{ text: 'HTML', link: '/en/common/html.html' },
						{ text: 'Object', link: '/en/common/object.html' },
						{ text: 'Path', link: '/en/common/path.html' },
						{ text: 'Script', link: '/en/common/script.html' },
						{ text: 'String', link: '/en/common/string.html' },
						{ text: 'Terminal UI', link: '/en/common/ui.html' },
						{ text: 'Validation', link: '/en/common/validation.html' }
					]
				}
			]
		}
	}
}
