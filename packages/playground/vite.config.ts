import { defineConfig, type PluginOption } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import {
	assetManifest,
	buildProgress,
	bundleAnalyzer,
	compressAssets,
	copyFile,
	envGuard,
	generateRouter,
	generateVersion,
	faviconManager,
	htmlInject,
	imageOptimizer,
	loadingManager,
	versionUpdateChecker,
	autoImport,
	proxyManager
} from '@meng-xi/vite-plugin/plugins'

export default defineConfig({
	plugins: [
		uni(),

		// 资源清单生成
		assetManifest({
			outputFormat: 'vite',
			outputFile: 'manifest.json',
			publicPath: '/',
			injectRuntime: true,
			runtimeGlobalName: '__ASSET_MANIFEST__',
			groupByEntry: true
		}),

		// 自动导入
		autoImport({
			imports: {
				'@dcloudio/uni-app': ['*'],
				vue: ['*']
			},
			dts: true,
			vueTemplate: true
		}),

		// 环境变量校验
		envGuard({
			required: {
				VITE_APP_TITLE: { type: 'string', required: true, minLength: 1, maxLength: 50 },
				VITE_API_URL: { type: 'url', required: true },
				VITE_DEBUG: { type: 'boolean', required: false }
			},
			failAction: 'warn'
		}),

		// 构建进度条
		buildProgress({
			format: 'bar',
			width: 30,
			clearOnComplete: false,
			showModuleName: true
		}),

		// 构建产物压缩
		compressAssets({
			algorithm: 'both',
			threshold: 1024,
			deleteOriginalFile: false,
			includeExtensions: ['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt'],
			excludeExtensions: [],
			excludePaths: [],
			compressionLevel: 9,
			brotliQuality: 11,
			reportOutput: 'compress-report.json',
			parallelLimit: 10
		}),

		// 构建产物体积分析
		bundleAnalyzer({
			outputFormat: 'both',
			outputFile: 'bundle-analysis',
			sizeThreshold: 100,
			topModules: 10,
			gzipSize: true,
			excludeNodeModules: false,
			defaultChartType: 'treemap'
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
			},
			headerTemplate: true,
			dts: true
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
		}),

		// HTML 内容注入
		htmlInject({
			rules: [
				{
					id: 'meta-keywords',
					content: '<meta name="keywords" content="uni-app, Vite, Plugin, MengXi">',
					position: 'head-end'
				},
				{
					id: 'theme-color',
					content: '<meta name="theme-color" content="#42b883">',
					position: 'head-end'
				}
			],
			templateVars: {
				appName: 'MengXi UniApp Playground'
			},
			logInjection: true
		}),

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
		}),

		// 网站图标管理（图标文件由 copyFile 插件统一复制）
		faviconManager({
			base: '/static',
			icons: [{ rel: 'icon', href: '/static/favicon.ico', sizes: '32x32' }]
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
		}),

		// 图片优化压缩
		imageOptimizer({
			quality: {
				jpeg: 80,
				png: 6,
				webp: 75,
				avif: 50,
				gif: true,
				tiff: 'deflate'
			},
			convertToWebp: { png: true, jpeg: true },
			svgo: {
				plugins: [
					{ name: 'removeViewBox', active: false },
					{ name: 'removeEmptyContainers', active: true }
				],
				multipass: false
			},
			includeExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tiff', '.tif', '.svg'],
			excludePaths: [],
			threshold: 0,
			keepOriginal: true,
			reportOutput: 'image-optimize-report.json',
			parallelLimit: 5,
			maxPixels: 0
		}),

		// 开发代理管理
		proxyManager({
			rules: [
				{
					context: '/api',
					target: 'https://httpbin.org',
					changeOrigin: true,
					rewrite: path => path.replace(/^\/api/, ''),
					label: 'API 代理（httpbin.org）'
				},
				{
					context: '/proxy-delay',
					target: 'https://httpbin.org',
					changeOrigin: true,
					rewrite: path => path.replace(/^\/proxy-delay/, '/get'),
					delay: { min: 200, max: 500 },
					label: '延迟模拟测试'
				}
			],
			logLevel: 'verbose',
			defaultDelay: false,
			envPrefix: 'PROXY_'
		})
	] as PluginOption[]
})
