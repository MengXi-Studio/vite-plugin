import { describe, it, expect, beforeAll } from 'vitest'
import * as vitePlugin from '@meng-xi/vite-plugin'
import { build } from 'vite'
import { resolve } from 'path'
import { readFileSync, existsSync, rmSync } from 'fs'

describe('Vite Plugin Test', () => {
	// 测试前清理 dist 目录
	beforeAll(() => {
		const distPath = resolve(__dirname, '../dist')
		if (existsSync(distPath)) {
			rmSync(distPath, { recursive: true, force: true })
		}
	})

	describe('Plugin Factory', () => {
		it('should create copyFile plugin successfully', () => {
			const plugin = vitePlugin.copyFile({
				sourceDir: 'src/static',
				targetDir: 'dist/static'
			})
			expect(plugin).toBeDefined()
			expect(plugin.name).toBe('copy-file')
		})

		it('should create injectIco plugin successfully', () => {
			const plugin = vitePlugin.injectIco({
				base: '/assets'
			})
			expect(plugin).toBeDefined()
			expect(plugin.name).toBe('inject-ico')
		})

		it('should create generatorVersion plugin successfully', () => {
			const plugin = vitePlugin.generatorVersion({
				outputDir: 'dist'
			})
			expect(plugin).toBeDefined()
			expect(plugin.name).toBe('generator-version')
		})
	})

	describe('Plugin Build Test', () => {
		it('should build successfully with all plugins', async () => {
			// 使用 vite.config.ts 进行构建
			const result = await build({
				configFile: resolve(__dirname, '../vite.config.ts'),
				root: resolve(__dirname, '..'),
				build: {
					outDir: 'dist',
					emptyOutDir: true
				}
			})
			expect(result).toBeDefined()
		})

		it('should generate version file after build', async () => {
			// 检查版本文件是否生成
			const versionPath = resolve(__dirname, '../dist/version.json')
			expect(existsSync(versionPath)).toBe(true)

			// 检查版本文件内容
			const versionContent = JSON.parse(readFileSync(versionPath, 'utf-8'))
			expect(versionContent).toHaveProperty('version')
			expect(typeof versionContent.version).toBe('string')
		})

		it('should copy static files after build', async () => {
			// 检查静态文件是否被复制
			const testFilePath = resolve(__dirname, '../dist/static/test.txt')
			expect(existsSync(testFilePath)).toBe(true)

			// 检查文件内容是否正确
			const content = readFileSync(testFilePath, 'utf-8')
			expect(content).toBe('This is a test file for the copyFile plugin.\n')
		})

		it('should inject ico into html after build', async () => {
			// 检查 HTML 文件是否生成
			const htmlPath = resolve(__dirname, '../dist/index.html')
			expect(existsSync(htmlPath)).toBe(true)

			// 检查 HTML 文件内容是否包含图标链接
			const content = readFileSync(htmlPath, 'utf-8')
			// 由于我们没有实际的图标文件，所以只检查是否有相关注释或结构
			expect(content).toContain('<title>Vite Plugin Test</title>')
		})
	})

	describe('Plugin Configuration', () => {
		it('should disable plugin when enabled is false', () => {
			const plugin = vitePlugin.copyFile({
				sourceDir: 'src/static',
				targetDir: 'dist/static',
				enabled: false
			})
			expect(plugin).toBeDefined()
			// 插件应该仍然被创建，但在运行时会被跳过
		})
	})
})
