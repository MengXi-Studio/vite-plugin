import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { copyFile } from '@meng-xi/vite-plugin'
import { createTestDirStructure, cleanTestDir, fileExists, readFileContent } from '../common/utils'
import { join } from 'path'
import { randomUUID } from 'crypto'

// 基础测试目录
const baseTestDir = join(__dirname, '..', '..', 'test-temp')
let testDir: string
let sourceDir: string
let targetDir: string

describe('copyFile 插件', () => {
	beforeEach(() => {
		// 创建唯一的测试目录，避免测试之间的冲突
		testDir = join(baseTestDir, randomUUID())
		sourceDir = join(testDir, 'source')
		targetDir = join(testDir, 'target')

		// 清理基础测试目录
		cleanTestDir(baseTestDir)

		// 创建测试文件结构
		createTestDirStructure(sourceDir, {
			'file1.txt': '内容1',
			'file2.txt': '内容2',
			subdir: {
				'file3.txt': '内容3',
				'file4.txt': '内容4'
			}
		})
	})

	afterEach(() => {
		// 清理测试目录
		cleanTestDir(baseTestDir)
	})

	it('应该创建有效的 Vite 插件', () => {
		const plugin = copyFile({
			sourceDir,
			targetDir
		})

		expect(plugin).toBeDefined()
		expect(typeof plugin).toBe('object')
		expect(plugin.name).toBe('copy-file')
		expect(typeof plugin.writeBundle).toBe('function')
	})

	it('应该复制文件从源目录到目标目录', async () => {
		const plugin = copyFile({
			sourceDir,
			targetDir
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
		expect(fileExists(join(targetDir, 'file1.txt'))).toBe(true)
		expect(fileExists(join(targetDir, 'file2.txt'))).toBe(true)
		expect(fileExists(join(targetDir, 'subdir', 'file3.txt'))).toBe(true)
		expect(fileExists(join(targetDir, 'subdir', 'file4.txt'))).toBe(true)

		// 验证文件内容
		expect(readFileContent(join(targetDir, 'file1.txt'))).toBe('内容1')
		expect(readFileContent(join(targetDir, 'file2.txt'))).toBe('内容2')
	})

	it('应该支持 overwrite 选项', async () => {
		// 先创建目标目录和文件
		createTestDirStructure(targetDir, {
			'file1.txt': '旧内容'
		})

		// 测试 overwrite: true
		const plugin = copyFile({
			sourceDir,
			targetDir,
			overwrite: true
		})

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

		// 验证文件内容被覆盖
		expect(readFileContent(join(targetDir, 'file1.txt'))).toBe('内容1')
	})

	it('应该支持 recursive 选项', async () => {
		const plugin = copyFile({
			sourceDir,
			targetDir,
			recursive: true
		})

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

		// 验证子目录文件是否被复制
		expect(fileExists(join(targetDir, 'subdir', 'file3.txt'))).toBe(true)
	})

	it('应该支持 incremental 选项', async () => {
		// 第一次复制
		const plugin1 = copyFile({
			sourceDir,
			targetDir,
			incremental: true
		})

		if (plugin1.writeBundle) {
			// 创建模拟的 PluginContext
			const mockContext = {} as any
			// 处理 writeBundle 的可能类型
			if (typeof plugin1.writeBundle === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin1.writeBundle.call(mockContext, {} as any, {} as any)
			} else if (typeof plugin1.writeBundle === 'object' && 'handler' in plugin1.writeBundle && typeof plugin1.writeBundle.handler === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin1.writeBundle.handler.call(mockContext, {} as any, {} as any)
			}
		}

		// 第二次复制（应该跳过）
		const plugin2 = copyFile({
			sourceDir,
			targetDir,
			incremental: true
		})

		if (plugin2.writeBundle) {
			// 创建模拟的 PluginContext
			const mockContext = {} as any
			// 处理 writeBundle 的可能类型
			if (typeof plugin2.writeBundle === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin2.writeBundle.call(mockContext, {} as any, {} as any)
			} else if (typeof plugin2.writeBundle === 'object' && 'handler' in plugin2.writeBundle && typeof plugin2.writeBundle.handler === 'function') {
				// 使用 call 来设置正确的 this 上下文
				await plugin2.writeBundle.handler.call(mockContext, {} as any, {} as any)
			}
		}

		// 验证文件仍然存在
		expect(fileExists(join(targetDir, 'file1.txt'))).toBe(true)
	})

	it('当插件被禁用时应该跳过复制', async () => {
		const plugin = copyFile({
			sourceDir,
			targetDir,
			enabled: false
		})

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

	it('应该验证必需的选项', () => {
		expect(() => {
			copyFile({} as any)
		}).toThrow()

		expect(() => {
			copyFile({ sourceDir } as any)
		}).toThrow()

		expect(() => {
			copyFile({ targetDir } as any)
		}).toThrow()
	})
})
