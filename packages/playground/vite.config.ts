import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFile, generateVersion, injectIco } from '@meng-xi/vite-plugin/plugins'
import type { PluginWithInstance } from '@meng-xi/vite-plugin/factory'
import type { GenerateVersionOptions } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		vue(),

		copyFile({
			sourceDir: 'src/static',
			targetDir: 'dist/static',
			overwrite: true,
			recursive: true,
			incremental: true,
			enabled: true,
			verbose: true
		}),

		// generateRouter({
		// 	pagesJsonPath: 'src/pages.json',
		// 	outputPath: 'src/router.config.ts',
		// 	outputFormat: 'ts',
		// 	nameStrategy: 'camelCase',
		// 	includeSubPackages: true,
		// 	watch: true,
		// 	exportTypes: true,
		// 	metaMapping: {
		// 		navigationBarTitleText: 'title',
		// 		requireAuth: 'requireAuth'
		// 	},
		// 	enabled: true,
		// 	verbose: true
		// }),

		generateVersion({
			format: 'custom',
			customFormat: '{YYYY}.{MM}.{DD}-{hash}',
			hashLength: 6,
			outputType: 'both',
			outputFile: 'version.json',
			defineName: '__APP_VERSION__',
			prefix: 'v',
			enabled: true,
			verbose: true,
			extra: {
				environment: 'development',
				author: 'MengXi Studio'
			}
		}) as PluginWithInstance<GenerateVersionOptions>,

		injectIco({
			base: '/assets',
			icons: [{ rel: 'icon', href: '/assets/favicon.ico', sizes: '32x32' }],
			enabled: true,
			copyOptions: {
				sourceDir: 'src/assets',
				targetDir: 'dist/assets',
				overwrite: true,
				recursive: true
			}
		})
	]
})
