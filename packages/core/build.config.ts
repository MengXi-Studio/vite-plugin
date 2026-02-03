import { defineBuildConfig } from 'unbuild'
import { resolve } from 'path'

export default defineBuildConfig({
	entries: ['src/index', 'src/common/index', 'src/factory/index', 'src/logger/index', 'src/plugins/index'],
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
