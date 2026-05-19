import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { buildProgress, copyFile, generateVersion, injectIco } from '@meng-xi/vite-plugin/plugins'
import type { PluginWithInstance } from '@meng-xi/vite-plugin/factory'
import type { GenerateVersionOptions } from '@meng-xi/vite-plugin'

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

		// 图标注入
		injectIco({
			base: '/assets',
			icons: [{ rel: 'icon', href: '/assets/favicon.ico', sizes: '32x32' }],
			copyOptions: {
				sourceDir: 'src/assets',
				targetDir: 'dist/assets',
				overwrite: true,
				recursive: true
			}
		})
	]
})
