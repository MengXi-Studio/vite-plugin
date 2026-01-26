import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { injectIco } from '@meng-xi/vite-plugin'
import { createTestDirStructure, cleanTestDir, fileExists } from '../common/utils'
import { join } from 'path'
import { randomUUID } from 'crypto'

// 基础测试目录
const baseTestDir = join(__dirname, '..', '..', 'test-temp')
let testDir: string
let sourceDir: string
let targetDir: string

// 测试 HTML 内容
const testHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Test</title>
</head>
<body>
	<div>Content</div>
</body>
</html>
`

describe('injectIco 插件', () => {
	beforeEach(() => {
		// 创建唯一的测试目录，避免测试之间的冲突
		testDir = join(baseTestDir, randomUUID())
		sourceDir = join(testDir, 'source')
		targetDir = join(testDir, 'target')

		// 清理基础测试目录
		cleanTestDir(baseTestDir)

		// 创建测试文件结构
		createTestDirStructure(sourceDir, {
			'favicon.ico': 'fake icon content',
			'favicon.svg': 'fake svg content'
		})
	})

	afterEach(() => {
		// 清理测试目录
		cleanTestDir(baseTestDir)
	})

	it('应该创建有效的 Vite 插件', () => {
		const plugin = injectIco()

		expect(plugin).toBeDefined()
		expect(typeof plugin).toBe('object')
		expect(plugin.name).toBe('inject-ico')
		expect(typeof plugin.transformIndexHtml).toBe('function')
	})

	it('应该使用默认配置创建插件', () => {
		const plugin = injectIco()

		expect(plugin).toBeDefined()
		expect(plugin.name).toBe('inject-ico')
	})

	it('应该接受字符串形式的 base 路径', () => {
		const plugin = injectIco('/assets')

		expect(plugin).toBeDefined()
		expect(plugin.name).toBe('inject-ico')
	})

	it('应该转换 HTML 并注入图标标签', async () => {
		const plugin = injectIco({
			base: '/assets',
			icons: [
				{ rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
				{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }
			]
		})

		// 模拟 transformIndexHtml 钩子
		if (plugin.transformIndexHtml) {
			let result
			// 创建模拟的上下文对象
			const mockCtx = {} as any

			// 处理 transformIndexHtml 的可能类型
			if (typeof plugin.transformIndexHtml === 'function') {
				// 直接是函数
				result = await plugin.transformIndexHtml(testHtml, mockCtx)
			} else if (typeof plugin.transformIndexHtml === 'object') {
				// 是对象，可能包含 transform 或 handler 方法
				if ('transform' in plugin.transformIndexHtml && typeof plugin.transformIndexHtml.transform === 'function') {
					result = await plugin.transformIndexHtml.transform(testHtml, mockCtx)
				} else if ('handler' in plugin.transformIndexHtml && typeof plugin.transformIndexHtml.handler === 'function') {
					result = await plugin.transformIndexHtml.handler(testHtml, mockCtx)
				}
			}

			expect(result).toBeDefined()
			expect(typeof result).toBe('string')
			expect(result).toContain('<link rel="icon" href="/favicon.ico" type="image/x-icon" />')
			expect(result).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml" />')
		}
	})

	it('应该支持 copyOptions 配置', async () => {
		const plugin = injectIco({
			copyOptions: {
				sourceDir,
				targetDir
			}
		})

		// 模拟 writeBundle 钩子
		if (plugin.writeBundle) {
			// 创建模拟的 PluginContext
			const mockContext = {} as any
			// 处理 writeBundle 的可能类型
			if (typeof plugin.writeBundle === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin.writeBundle.call(mockContext, {} as any, {} as any)
			} else if (typeof plugin.writeBundle === 'object' && 'handler' in plugin.writeBundle && typeof plugin.writeBundle.handler === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin.writeBundle.handler.call(mockContext, {} as any, {} as any)
			}
		}

		// 验证文件是否被复制
		expect(fileExists(join(targetDir, 'favicon.ico'))).toBe(true)
		expect(fileExists(join(targetDir, 'favicon.svg'))).toBe(true)
	})

	it('当插件被禁用时应该跳过转换和复制', async () => {
		const plugin = injectIco({
			enabled: false,
			copyOptions: {
				sourceDir,
				targetDir
			}
		})

		// 模拟 transformIndexHtml 钩子
		if (plugin.transformIndexHtml) {
			let result
			// 创建模拟的上下文对象
			const mockCtx = {} as any

			// 处理 transformIndexHtml 的可能类型
			if (typeof plugin.transformIndexHtml === 'function') {
				// 直接是函数
				result = await plugin.transformIndexHtml(testHtml, mockCtx)
			} else if (typeof plugin.transformIndexHtml === 'object') {
				// 是对象，可能包含 transform 或 handler 方法
				if ('transform' in plugin.transformIndexHtml && typeof plugin.transformIndexHtml.transform === 'function') {
					result = await plugin.transformIndexHtml.transform(testHtml, mockCtx)
				} else if ('handler' in plugin.transformIndexHtml && typeof plugin.transformIndexHtml.handler === 'function') {
					result = await plugin.transformIndexHtml.handler(testHtml, mockCtx)
				}
			}

			// 应该返回原始 HTML
			expect(result).toBe(testHtml)
		}

		// 模拟 writeBundle 钩子
		if (plugin.writeBundle) {
			// 创建模拟的 PluginContext
			const mockContext = {} as any
			// 处理 writeBundle 的可能类型
			if (typeof plugin.writeBundle === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin.writeBundle.call(mockContext, {} as any, {} as any)
			} else if (typeof plugin.writeBundle === 'object' && 'handler' in plugin.writeBundle && typeof plugin.writeBundle.handler === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin.writeBundle.handler.call(mockContext, {} as any, {} as any)
			}
		}

		// 验证文件没有被复制
		expect(fileExists(targetDir)).toBe(false)
	})

	it('当没有配置 copyOptions 时应该跳过复制', async () => {
		const plugin = injectIco()

		// 模拟 writeBundle 钩子
		if (plugin.writeBundle) {
			// 创建模拟的 PluginContext
			const mockContext = {} as any
			// 处理 writeBundle 的可能类型
			if (typeof plugin.writeBundle === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin.writeBundle.call(mockContext, {} as any, {} as any)
			} else if (typeof plugin.writeBundle === 'object' && 'handler' in plugin.writeBundle && typeof plugin.writeBundle.handler === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin.writeBundle.handler.call(mockContext, {} as any, {} as any)
			}
		}

		// 验证目标目录不存在
		expect(fileExists(targetDir)).toBe(false)
	})

	it('应该处理没有 </head> 标签的 HTML', async () => {
		const noHeadHtml = `
<!DOCTYPE html>
<html lang="en">
<body>
	<div>Content</div>
</body>
</html>
`

		const plugin = injectIco({
			icons: [{ rel: 'icon', href: '/favicon.ico' }]
		})

		// 模拟 transformIndexHtml 钩子
		if (plugin.transformIndexHtml) {
			let result
			// 创建模拟的上下文对象
			const mockCtx = {} as any

			// 处理 transformIndexHtml 的可能类型
			if (typeof plugin.transformIndexHtml === 'function') {
				// 直接是函数
				result = await plugin.transformIndexHtml(noHeadHtml, mockCtx)
			} else if (typeof plugin.transformIndexHtml === 'object') {
				// 是对象，可能包含 transform 或 handler 方法
				if ('transform' in plugin.transformIndexHtml && typeof plugin.transformIndexHtml.transform === 'function') {
					result = await plugin.transformIndexHtml.transform(noHeadHtml, mockCtx)
				} else if ('handler' in plugin.transformIndexHtml && typeof plugin.transformIndexHtml.handler === 'function') {
					result = await plugin.transformIndexHtml.handler(noHeadHtml, mockCtx)
				}
			}

			// 应该返回原始 HTML
			expect(result).toBe(noHeadHtml)
		}
	})

	it('当没有图标配置时应该使用默认图标', async () => {
		const plugin = injectIco({})

		// 模拟 transformIndexHtml 钩子
		if (plugin.transformIndexHtml) {
			let result
			// 创建模拟的上下文对象
			const mockCtx = {} as any

			// 处理 transformIndexHtml 的可能类型
			if (typeof plugin.transformIndexHtml === 'function') {
				// 直接是函数
				result = await plugin.transformIndexHtml(testHtml, mockCtx)
			} else if (typeof plugin.transformIndexHtml === 'object') {
				// 是对象，可能包含 transform 或 handler 方法
				if ('transform' in plugin.transformIndexHtml && typeof plugin.transformIndexHtml.transform === 'function') {
					result = await plugin.transformIndexHtml.transform(testHtml, mockCtx)
				} else if ('handler' in plugin.transformIndexHtml && typeof plugin.transformIndexHtml.handler === 'function') {
					result = await plugin.transformIndexHtml.handler(testHtml, mockCtx)
				}
			}

			expect(result).toBeDefined()
			expect(typeof result).toBe('string')
			// 应该注入默认的 favicon.ico 标签
			expect(result).toContain('<link rel="icon" href="/favicon.ico" />')
		}
	})
})
