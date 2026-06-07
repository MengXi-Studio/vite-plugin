import { defineBuildConfig } from 'unbuild'
import { resolve } from 'path'

export default defineBuildConfig({
	entries: [
		'src/index',
		'src/common/index',
		'src/common/format/index',
		'src/common/fs/index',
		'src/common/html/index',
		'src/common/script/index',
		'src/common/ui/index',
		'src/common/validation/index',
		'src/factory/index',
		'src/logger/index',
		'src/plugins/index',
		'src/plugins/assetManifest/index',
		'src/plugins/autoImport/index',
		'src/plugins/buildProgress/index',
		'src/plugins/bundleAnalyzer/index',
		'src/plugins/compressAssets/index',
		'src/plugins/copyFile/index',
		'src/plugins/envGuard/index',
		'src/plugins/faviconManager/index',
		'src/plugins/generateRouter/index',
		'src/plugins/generateVersion/index',
		'src/plugins/htmlInject/index',
		'src/plugins/loadingManager/index',
		'src/plugins/versionUpdateChecker/index'
	],
	clean: true,
	declaration: true,
	alias: {
		'@': resolve(__dirname, './src')
	},
	rollup: {
		emitCJS: true,
		esbuild: {
			minify: true
		}
	}
})
