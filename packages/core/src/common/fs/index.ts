import fs from 'fs'
import type { CopyOptions } from './type'

/**
 * 检查源文件是否存在
 *
 * @param sourcePath - 源文件路径
 * @throws 当源文件不存在或无法访问时抛出异常
 */
export async function checkSourceExists(sourcePath: string): Promise<void> {
	try {
		await fs.promises.access(sourcePath, fs.constants.F_OK)
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'ENOENT') {
			throw new Error(`❌ 复制文件失败：源文件不存在 - ${sourcePath}`)
		} else if (error.code === 'EACCES') {
			throw new Error(`❌ 复制文件失败：没有权限访问源文件 - ${sourcePath}`)
		} else {
			throw new Error(`❌ 复制文件失败：检查源文件时出错 - ${sourcePath}，错误：${error.message}`)
		}
	}
}

/**
 * 创建目标目录
 *
 * @param targetPath - 目标目录路径
 * @throws 当无法创建目标目录时抛出异常
 */
export async function ensureTargetDir(targetPath: string): Promise<void> {
	try {
		await fs.promises.mkdir(targetPath, { recursive: true })
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'EACCES') {
			throw new Error(`❌ 复制文件失败：没有权限创建目标目录 - ${targetPath}`)
		} else {
			throw new Error(`❌ 复制文件失败：创建目标目录时出错 - ${targetPath}，错误：${error.message}`)
		}
	}
}

/**
 * 执行文件复制操作
 *
 * @param sourcePath - 源文件或目录路径
 * @param targetPath - 目标文件或目录路径
 * @param options - 复制选项
 * @throws 当复制过程中出现错误时抛出异常
 */
export async function copySourceToTarget(sourcePath: string, targetPath: string, options: CopyOptions): Promise<void> {
	try {
		await fs.promises.cp(sourcePath, targetPath, {
			recursive: options.recursive,
			force: options.overwrite
		})
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'ENOENT') {
			throw new Error(`❌ 复制文件失败：复制过程中源文件不存在 - ${sourcePath}`)
		} else if (error.code === 'EACCES') {
			throw new Error(`❌ 复制文件失败：复制过程中权限不足，无法访问源文件或写入目标目录 - ${sourcePath} -> ${targetPath}`)
		} else if (error.code === 'EPERM') {
			throw new Error(`❌ 复制文件失败：复制过程中操作被拒绝 - ${sourcePath} -> ${targetPath}`)
		} else {
			throw new Error(`❌ 复制文件失败：复制文件时出错 - ${sourcePath} -> ${targetPath}，错误：${error.message}`)
		}
	}
}

/**
 * 写入文件内容
 *
 * @param filePath - 文件路径
 * @param content - 文件内容
 * @throws 当写入过程中出现错误时抛出异常
 */
export async function writeFileContent(filePath: string, content: string): Promise<void> {
	try {
		await fs.promises.writeFile(filePath, content, 'utf-8')
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'EACCES') {
			throw new Error(`❌ 写入文件失败：没有权限写入文件 - ${filePath}`)
		} else {
			throw new Error(`❌ 写入文件失败：写入文件时出错 - ${filePath}，错误：${error.message}`)
		}
	}
}

/**
 * 同步读取文件内容
 *
 * @param filePath - 文件路径
 * @returns 文件内容字符串
 * @throws 当读取过程中出现错误时抛出异常
 */
export function readFileSync(filePath: string): string {
	try {
		return fs.readFileSync(filePath, 'utf-8')
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'EACCES') {
			throw new Error(`❌ 读取文件失败：没有权限读取文件 - ${filePath}`)
		} else {
			throw new Error(`❌ 读取文件失败：读取文件时出错 - ${filePath}，错误：${error.message}`)
		}
	}
}
