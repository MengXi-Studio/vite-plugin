import { defineBuildConfig } from 'unbuild'
import { resolve } from 'path'

export default defineBuildConfig({
	entries: [
		'src/index',
		'src/common/index',
		'src/common/code/index',
		'src/common/compress/index',
		'src/common/concurrency/index',
		'src/common/env/index',
		'src/common/format/index',
		'src/common/fs/index',
		'src/common/hash/index',
		'src/common/html/index',
		'src/common/object/index',
		'src/common/path/index',
		'src/common/script/index',
		'src/common/string/index',
		'src/common/ui/index',
		'src/common/validation/index',
		'src/factory/index',
		'src/logger/index',
		'src/plugins/index',
		'src/plugins/analyze/index',
		'src/plugins/analyze/buildProgress/index',
		'src/plugins/analyze/bundleAnalyzer/index',
		'src/plugins/compress/index',
		'src/plugins/compress/compressAssets/index',
		'src/plugins/compress/imageOptimizer/index',
		'src/plugins/copy/index',
		'src/plugins/copy/assetManifest/index',
		'src/plugins/copy/copyFile/index',
		'src/plugins/generate/index',
		'src/plugins/generate/autoImport/index',
		'src/plugins/generate/generateRouter/index',
		'src/plugins/generate/generateVersion/index',
		'src/plugins/guard/index',
		'src/plugins/guard/envGuard/index',
		'src/plugins/inject/index',
		'src/plugins/inject/faviconManager/index',
		'src/plugins/inject/htmlInject/index',
		'src/plugins/inject/loadingManager/index',
		'src/plugins/inject/versionUpdateChecker/index',
		'src/plugins/proxy/index',
		'src/plugins/proxy/proxyManager/index'
	],
	clean: true,
	declaration: true,
	alias: {
		'@': resolve(__dirname, './src')
	},
	replace: {
		__PLUGIN_VERSION__: "\"0.2.7\""
	},
	rollup: {
		emitCJS: true,
		esbuild: {
			minify: true
		}
	}
})
