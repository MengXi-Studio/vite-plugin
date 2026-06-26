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
			{ text: '指南', link: '/guide/introduction.html' },
			{ text: '插件', link: '/plugins/index.html' },
			{ text: '框架', link: '/factory/index.html' },
			{ text: '日志', link: '/logger/index.html' },
			{ text: '工具', link: '/common/index.html' },
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
			// 指南模块
			'/guide/': [
				{
					text: '入门',
					items: [
						{ text: '介绍', link: '/guide/introduction.html' },
						{ text: '安装', link: '/guide/installation.html' },
						{ text: '快速开始', link: '/guide/quick-start.html' }
					]
				},
				{
					text: '深入',
					items: [
						{ text: '基础概念', link: '/guide/concepts.html' },
						{ text: '按需导入', link: '/guide/on-demand-import.html' },
						{ text: '最佳实践', link: '/guide/best-practices.html' }
					]
				}
			],

			// 插件模块
			'/plugins/': [
				{
					text: '概览',
					items: [{ text: '插件总览', link: '/plugins/index.html' }]
				},
				{
					text: 'compress — 压缩类',
					collapsed: false,
					items: [
						{ text: 'compressAssets', link: '/plugins/compress-assets.html' },
						{ text: 'imageOptimizer', link: '/plugins/image-optimizer.html' }
					]
				},
				{
					text: 'generate — 生成类',
					collapsed: false,
					items: [
						{ text: 'autoImport', link: '/plugins/auto-import.html' },
						{ text: 'generateRouter', link: '/plugins/generate-router.html' },
						{ text: 'generateVersion', link: '/plugins/generate-version.html' }
					]
				},
				{
					text: 'inject — 注入类',
					collapsed: false,
					items: [
						{ text: 'htmlInject', link: '/plugins/html-inject.html' },
						{ text: 'loadingManager', link: '/plugins/loading-manager.html' },
						{ text: 'faviconManager', link: '/plugins/favicon-manager.html' },
						{ text: 'versionUpdateChecker', link: '/plugins/version-update-checker.html' }
					]
				},
				{
					text: 'analyze — 分析类',
					collapsed: false,
					items: [
						{ text: 'bundleAnalyzer', link: '/plugins/bundle-analyzer.html' },
						{ text: 'buildProgress', link: '/plugins/build-progress.html' }
					]
				},
				{
					text: 'copy — 拷贝类',
					collapsed: false,
					items: [
						{ text: 'copyFile', link: '/plugins/copy-file.html' },
						{ text: 'assetManifest', link: '/plugins/asset-manifest.html' }
					]
				},
				{
					text: 'guard — 守卫类',
					collapsed: false,
					items: [{ text: 'envGuard', link: '/plugins/env-guard.html' }]
				},
				{
					text: 'proxy — 代理类',
					collapsed: false,
					items: [{ text: 'proxyManager', link: '/plugins/proxy-manager.html' }]
				}
			],

			// 插件开发框架
			'/factory/': [
				{
					text: '基础',
					items: [
						{ text: '概览', link: '/factory/index.html' },
						{ text: 'BasePlugin', link: '/factory/base-plugin.html' },
						{ text: 'createPluginFactory', link: '/factory/create-plugin-factory.html' },
						{ text: 'BasePluginOptions', link: '/factory/base-plugin-options.html' }
					]
				},
				{
					text: '进阶',
					items: [
						{ text: '生命周期', link: '/factory/lifecycle.html' },
						{ text: '钩子注册', link: '/factory/hooks.html' }
					]
				}
			],

			// 日志模块
			'/logger/': [
				{
					text: '日志模块',
					items: [
						{ text: '概览', link: '/logger/index.html' },
						{ text: 'Logger', link: '/logger/logger-class.html' },
						{ text: 'PluginLogger', link: '/logger/plugin-logger.html' },
						{ text: 'LoggerOptions', link: '/logger/logger-options.html' }
					]
				}
			],

			// 公共工具
			'/common/': [
				{
					text: '概览',
					items: [{ text: '工具总览', link: '/common/index.html' }]
				},
				{
					text: '工具列表',
					items: [
						{ text: '代码处理', link: '/common/code.html' },
						{ text: '压缩工具', link: '/common/compress.html' },
						{ text: '并发控制', link: '/common/concurrency.html' },
						{ text: '环境变量', link: '/common/env.html' },
						{ text: '文件系统', link: '/common/fs.html' },
						{ text: '格式化', link: '/common/format.html' },
						{ text: '哈希工具', link: '/common/hash.html' },
						{ text: 'HTML 注入', link: '/common/html.html' },
						{ text: '对象合并', link: '/common/object.html' },
						{ text: '路径处理', link: '/common/path.html' },
						{ text: '脚本工具', link: '/common/script.html' },
						{ text: '字符串处理', link: '/common/string.html' },
						{ text: '终端 UI', link: '/common/ui.html' },
						{ text: '验证器', link: '/common/validation.html' }
					]
				}
			]
		}
	}
}
