import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'fs'
import { join } from 'path'

/**
 * 创建测试目录结构
 * @param baseDir 基础目录
 * @param structure 目录结构
 */
export function createTestDirStructure(baseDir: string, structure: Record<string, string | Record<string, any>>): void {
	// 确保基础目录存在
	if (!existsSync(baseDir)) {
		mkdirSync(baseDir, { recursive: true })
	}

	// 创建文件和子目录
	Object.entries(structure).forEach(([name, content]) => {
		const path = join(baseDir, name)

		if (typeof content === 'string') {
			// 确保文件所在目录存在
			const dir = path.substring(0, path.lastIndexOf('/'))
			if (dir !== path && !existsSync(dir)) {
				mkdirSync(dir, { recursive: true })
			}
			// 创建文件
			writeFileSync(path, content)
		} else {
			// 创建子目录
			if (!existsSync(path)) {
				mkdirSync(path, { recursive: true })
			}
			// 创建子目录结构
			createTestDirStructure(path, content)
		}
	})
}

/**
 * 清理测试目录
 * @param dir 要清理的目录
 */
export function cleanTestDir(dir: string): void {
	if (existsSync(dir)) {
		// 使用更可靠的方法清理目录
		try {
			rmSync(dir, { recursive: true, force: true })
		} catch (error) {
			// 忽略清理错误，继续执行测试
			console.warn(`清理目录时出错: ${error}`)
		}
	}
}

/**
 * 检查文件是否存在
 * @param path 文件路径
 * @returns 是否存在
 */
export function fileExists(path: string): boolean {
	return existsSync(path)
}

/**
 * 读取文件内容
 * @param path 文件路径
 * @returns 文件内容
 */
export function readFileContent(path: string): string {
	if (!existsSync(path)) {
		throw new Error(`文件不存在: ${path}`)
	}
	return readFileSync(path, 'utf-8')
}

/**
 * 等待指定时间
 * @param ms 毫秒数
 */
export function delay(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}
