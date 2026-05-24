import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { buildProgress, copyFile, generateRouter, generateVersion, faviconManager, loadingManager, versionUpdateChecker } from '@meng-xi/vite-plugin/plugins'
import type { PluginWithInstance } from '@meng-xi/vite-plugin/factory'
import type { GenerateVersionOptions, LoadingManagerOptions, VersionUpdateCheckerOptions } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		vue(),

		// 构建进度条
		buildProgress({
			format: 'bar',
			width: 30,
			clearOnComplete: false,
			showModuleName: true
		}),

		// 路由配置生成（基于 pages.json）
		generateRouter({
			pagesJsonPath: 'src/pages.json',
			outputPath: 'src/router.config.ts',
			outputFormat: 'ts',
			nameStrategy: 'camelCase',
			includeSubPackages: true,
			watch: true,
			exportTypes: true,
			preserveRouteChanges: true,
			metaMapping: {
				navigationBarTitleText: 'title',
				requireAuth: 'requireAuth'
			}
		}),

		// 文件复制
		copyFile({
			sourceDir: 'src/static',
			targetDir: 'dist/static',
			overwrite: true,
			recursive: true,
			incremental: true
		}),

		// 版本生成
		generateVersion({
			format: 'custom',
			customFormat: '{YYYY}.{MM}.{DD}-{hash}',
			hashLength: 6,
			outputType: 'both',
			outputFile: 'version.json',
			defineName: '__APP_VERSION__',
			prefix: 'v',
			extra: {
				environment: 'development',
				author: 'MengXi Studio'
			}
		}) as PluginWithInstance<GenerateVersionOptions>,

		// 版本更新检查器
		versionUpdateChecker({
			versionSource: 'auto',
			defineName: '__APP_VERSION__',
			checkUrl: '/version.json',
			checkInterval: 60000,
			checkOnVisibilityChange: true,
			enableInDev: true,
			promptStyle: 'modal',
			promptMessage: '发现新版本，是否立即刷新获取最新内容？',
			refreshButtonText: '立即刷新',
			dismissButtonText: '稍后再说',
			onUpdateAvailable: 'console.log("[VersionUpdate] 当前:", currentVersion, "最新:", newVersion); return true;',
			onRefresh: 'console.log("[VersionUpdate] 用户选择刷新");',
			onDismiss: 'console.log("[VersionUpdate] 用户选择忽略");'
		}) as PluginWithInstance<VersionUpdateCheckerOptions>,

		// 网站图标管理
		faviconManager({
			base: '/assets',
			icons: [{ rel: 'icon', href: '/assets/favicon.ico', sizes: '32x32' }],
			copyOptions: {
				sourceDir: 'src/assets',
				targetDir: 'dist/assets',
				overwrite: true,
				recursive: true
			}
		}),

		// 全局 Loading 状态管理
		loadingManager({
			defaultVisible: true,
			autoHideOn: 'DOMContentLoaded',
			position: 'center',
			spinnerType: 'spinner',
			style: {
				overlayColor: 'rgba(255, 255, 255, 0.85)',
				spinnerColor: '#42b883',
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
				excludeUrlPrefixes: ['/static/']
			},
			callbacks: {
				onShow: 'console.log("[Loading] shown")',
				onHide: 'console.log("[Loading] hidden")'
			}
		}) as PluginWithInstance<LoadingManagerOptions>
	]
})
