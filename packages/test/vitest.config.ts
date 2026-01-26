import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
	test: {
		root: '.',
		include: ['src/**/*.test.ts'],
		exclude: ['node_modules', 'dist'],
		globals: true,
		environment: 'node',
		setupFiles: [],
		coverage: {
			enabled: true,
			reportsDirectory: './coverage',
			include: ['src/**/*.test.ts']
		}
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src')
		}
	}
})
