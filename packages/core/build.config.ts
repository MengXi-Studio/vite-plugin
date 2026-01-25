import { defineBuildConfig } from 'unbuild'
import { resolve } from 'path'

export default defineBuildConfig({
	entries: ['src/index'],
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
