import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { buildProgress, copyFile, generateVersion, generateRouter, faviconManager, loadingManager, versionUpdateChecker, htmlInject } from './uni_modules/vite-plugin/js_sdk/index.mjs'
import type { PluginWithInstance } from './uni_modules/vite-plugin/js_sdk/factory/index.js'
import type { GenerateVersionOptions } from './uni_modules/vite-plugin/js_sdk/plugins/generateVersion/index.js'
import type { LoadingManagerOptions } from './uni_modules/vite-plugin/js_sdk/plugins/loadingManager/index.js'
import type { VersionUpdateCheckerOptions } from './uni_modules/vite-plugin/js_sdk/plugins/versionUpdateChecker/index.js'
import type { HtmlInjectOptions } from './uni_modules/vite-plugin/js_sdk/plugins/htmlInject/index.js'
import { resolve } from 'node:path'

export default defineConfig(config => {
	const viteEnv = loadEnv(config.mode, process.cwd())

	const isH5 = process.env.UNI_PLATFORM === 'h5'
	const isProd = viteEnv.VITE_USER_NODE_ENV === 'production'

	return {
		plugins: [
			uni(),

			buildProgress({
				format: 'bar',
				width: 30,
				clearOnComplete: false,
				showModuleName: true
			}),

			generateRouter({
				pagesJsonPath: 'pages.json',
				outputPath: 'router.config.ts',
				outputFormat: 'ts',
				nameStrategy: 'camelCase',
				watch: true,
				includeSubPackages: true,
				exportTypes: true,
				preserveRouteChanges: true,
				metaMapping: {
					navigationBarTitleText: 'title',
					requireAuth: 'requireAuth'
				}
			}),

			generateVersion({
				format: 'custom',
				customFormat: '{YYYY}.{MM}.{DD}-{hash}',
				hashLength: 6,
				outputType: 'both',
				outputFile: 'version.json',
				defineName: '__APP_VERSION__',
				prefix: 'v',
				enabled: isH5 && isProd,
				extra: {
					environment: isProd ? 'production' : 'development',
					author: 'MengXi Studio'
				}
			}) as PluginWithInstance<GenerateVersionOptions>,

			htmlInject({
				rules: [
					{
						id: 'meta-description',
						content: '<meta name="description" content="{{appName}} - 基于 Vite 的 uni-app 插件功能验证项目">',
						position: 'head-end',
						priority: 10,
						templateVars: { appName: 'MengXi Studio' }
					},
					{
						id: 'meta-keywords',
						content: '<meta name="keywords" content="uni-app, vite-plugin, mengxi-studio">',
						position: 'head-end',
						priority: 20
					},
					{
						id: 'theme-color',
						content: '<meta name="theme-color" content="#007aff">',
						position: 'head-end',
						priority: 30
					},
					{
						id: 'apple-mobile-web-app',
						content: '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default">',
						position: 'head-end',
						priority: 40
					}
				],
				security: {
					blockDangerousTags: true,
					blockDangerousAttributes: true
				},
				logInjection: true,
				enabled: isH5
			}) as PluginWithInstance<HtmlInjectOptions>,

			faviconManager({
				base: viteEnv.VITE_BASE_URL,
				enabled: isH5 && isProd,
				copyOptions: {
					sourceDir: resolve('public'),
					targetDir: resolve('dist/build/h5'),
					overwrite: true,
					recursive: true
				}
			}),

			copyFile({
				sourceDir: resolve('public'),
				targetDir: resolve('dist/build/h5'),
				overwrite: true,
				recursive: true,
				incremental: true,
				enabled: isH5 && isProd
			}),

			loadingManager({
				defaultVisible: true,
				autoHideOn: 'DOMContentLoaded',
				position: 'center',
				spinnerType: 'spinner',
				style: {
					overlayColor: 'rgba(255, 255, 255, 0.85)',
					spinnerColor: '#007aff',
					textColor: '#333',
					backdropBlur: true,
					backdropBlurAmount: 3
				},
				transition: {
					enabled: true,
					duration: 300,
					easing: 'ease-out'
				},
				minDisplayTime: {
					enabled: true,
					duration: 500
				},
				delayShow: {
					enabled: true,
					duration: 200
				},
				debounceHide: {
					enabled: true,
					duration: 100
				},
				autoBind: 'all',
				requestFilter: {
					excludeUrlPrefixes: ['/static/', '/api/health']
				},
				callbacks: {
					onShow: 'console.log("[Loading] shown")',
					onHide: 'console.log("[Loading] hidden")'
				},
				enabled: isH5
			}) as PluginWithInstance<LoadingManagerOptions>,

			versionUpdateChecker({
				versionSource: 'auto',
				defineName: '__APP_VERSION__',
				checkUrl: '/version.json',
				checkInterval: 60000,
				checkOnVisibilityChange: true,
				enableInDev: false,
				promptStyle: 'modal',
				promptMessage: '发现新版本，是否立即刷新获取最新内容？',
				refreshButtonText: '立即刷新',
				dismissButtonText: '稍后再说',
				onUpdateAvailable: 'console.log("[VersionUpdate] 当前:", currentVersion, "最新:", newVersion); return true;',
				onRefresh: 'console.log("[VersionUpdate] 用户选择刷新")',
				onDismiss: 'console.log("[VersionUpdate] 用户选择忽略")',
				enabled: isH5 && isProd
			}) as PluginWithInstance<VersionUpdateCheckerOptions>
		]
	}
})
