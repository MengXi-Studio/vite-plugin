import { defineConfig } from 'vite'
import { copyFile, injectIco } from '@meng-xi/vite-plugin'
import { join } from 'path'

// 测试目录
const testDir = join(__dirname, 'test-temp')
const sourceDir = join(testDir, 'source')
const targetDir = join(testDir, 'target')

export default defineConfig({
	plugins: [
		// 测试 copyFile 插件
		copyFile({
			sourceDir,
			targetDir,
			overwrite: true,
			recursive: true,
			incremental: true
		}),

		// 测试 injectIco 插件
		injectIco({
			base: '/',
			icons: [
				{ rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
				{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }
			],
			copyOptions: {
				sourceDir,
				targetDir
			}
		})
	],
	build: {
		outDir: 'dist',
		emptyOutDir: true
	}
})
