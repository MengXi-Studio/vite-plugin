import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { buildProgress, copyFile, generateVersion, generateRouter, injectIco, injectLoading } from './uni_modules/vite-plugin/js_sdk/index.mjs'
import { resolve } from 'node:path'

export default defineConfig(config => {
	const viteEnv = loadEnv(config.mode, process.cwd())

	/** 是否为 H5 平台 */
	const isH5 = process.env.UNI_PLATFORM === 'h5'
	/** 是否为生产环境 */
	const isProd = viteEnv.VITE_USER_NODE_ENV === 'production'

	return {
		plugins: [
			uni(),

			// 构建进度条
			buildProgress({
				format: 'bar',
				width: 30,
				clearOnComplete: false,
				showModuleName: true
			}),

			// 根据 pages.json 自动生成路由配置
			generateRouter({
				pagesJsonPath: 'pages.json',
				outputPath: 'src/router.config.ts',
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

			// 版本号生成（仅 H5 生产环境）
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
			}),

			// 图标注入（仅 H5 生产环境）
			injectIco({
				base: viteEnv.VITE_BASE_URL,
				enabled: isH5 && isProd,
				copyOptions: {
					sourceDir: resolve('public'),
					targetDir: resolve('dist/build/h5'),
					overwrite: true,
					recursive: true
				}
			}),

			// 文件复制（仅 H5 生产环境）
			copyFile({
				sourceDir: resolve('public'),
				targetDir: resolve('dist/build/h5'),
				overwrite: true,
				recursive: true,
				incremental: true,
				enabled: isH5 && isProd
			}),

			// 全局 Loading 状态管理（仅 H5 平台）
			injectLoading({
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
			})
		]
	}
})
