import fs from 'fs'
import path from 'path'
import type { CopyOptions, CopyResult } from './type'

/**
 * 检查源文件是否存在
 * @param sourcePath 源文件路径
 * @throws 当源文件不存在或无法访问时抛出异常
 */
export async function checkSourceExists(sourcePath: string): Promise<void> {
	try {
		await fs.promises.access(sourcePath, fs.constants.F_OK)
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'ENOENT') {
			throw new Error(`复制文件失败：源文件不存在 - ${sourcePath}`)
		} else if (error.code === 'EACCES') {
			throw new Error(`复制文件失败：没有权限访问源文件 - ${sourcePath}`)
		} else {
			throw new Error(`复制文件失败：检查源文件时出错 - ${sourcePath}，错误：${error.message}`)
		}
	}
}

/**
 * 创建目标目录
 * @param targetPath 目标目录路径
 * @throws 当无法创建目标目录时抛出异常
 */
export async function ensureTargetDir(targetPath: string): Promise<void> {
	try {
		await fs.promises.mkdir(targetPath, { recursive: true })
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'EACCES') {
			throw new Error(`复制文件失败：没有权限创建目标目录 - ${targetPath}`)
		} else {
			throw new Error(`复制文件失败：创建目标目录时出错 - ${targetPath}，错误：${error.message}`)
		}
	}
}

/**
 * 读取目录内容
 * @param dirPath 目录路径
 * @param recursive 是否递归读取
 * @returns 文件和目录列表
 */
export async function readDirRecursive(dirPath: string, recursive: boolean): Promise<string[]> {
	const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })

	let result: string[] = []

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name)

		if (entry.isDirectory()) {
			result.push(fullPath)
			if (recursive) {
				const subEntries = await readDirRecursive(fullPath, recursive)
				result = [...result, ...subEntries]
			}
		} else {
			result.push(fullPath)
		}
	}

	return result
}

/**
 * 检查文件是否需要更新
 * @param sourceFile 源文件路径
 * @param targetFile 目标文件路径
 * @returns 是否需要更新
 */
export async function shouldUpdateFile(sourceFile: string, targetFile: string): Promise<boolean> {
	try {
		const sourceStats = await fs.promises.stat(sourceFile)
		const targetStats = await fs.promises.stat(targetFile)

		// 比较修改时间和文件大小
		return sourceStats.mtimeMs > targetStats.mtimeMs || sourceStats.size !== targetStats.size
	} catch (error) {
		// 目标文件不存在或无法访问，需要更新
		return true
	}
}

/**
 * 执行文件复制操作
 * @param sourcePath 源文件或目录路径
 * @param targetPath 目标文件或目录路径
 * @param options 复制选项
 * @returns 复制结果
 * @throws 当复制过程中出现错误时抛出异常
 */
export async function copySourceToTarget(sourcePath: string, targetPath: string, options: CopyOptions): Promise<CopyResult> {
	const startTime = Date.now()
	const { recursive, overwrite, incremental = false } = options

	let copiedFiles = 0
	let skippedFiles = 0
	let copiedDirs = 0

	// 检查源文件是否为目录
	const sourceStats = await fs.promises.stat(sourcePath)

	if (sourceStats.isDirectory()) {
		// 确保目标目录存在
		await ensureTargetDir(targetPath)

		// 获取所有文件和目录
		const entries = await readDirRecursive(sourcePath, recursive)

		// 过滤出文件
		const fileEntries = await Promise.all(
			entries.map(async entry => {
				const stats = await fs.promises.stat(entry)
				return { path: entry, isFile: stats.isFile() }
			})
		)

		// 转换为实际的文件路径数组
		const filePaths = fileEntries.filter(entry => entry.isFile).map(entry => entry.path)

		// 逐个复制文件
		for (const sourceFile of filePaths) {
			const relativePath = path.relative(sourcePath, sourceFile)
			const destFile = path.join(targetPath, relativePath)

			// 确保目标目录存在
			await ensureTargetDir(path.dirname(destFile))

			// 检查是否需要复制
			let needCopy = overwrite
			if (!needCopy) {
				try {
					await fs.promises.access(destFile, fs.constants.F_OK)
					needCopy = false
				} catch {
					needCopy = true
				}
			}

			if (incremental && needCopy) {
				needCopy = await shouldUpdateFile(sourceFile, destFile)
			}

			if (needCopy) {
				await fs.promises.copyFile(sourceFile, destFile)
				copiedFiles++
			} else {
				skippedFiles++
			}
		}

		// 统计复制的目录数量
		const dirEntries = await Promise.all(
			entries.map(async entry => {
				const stats = await fs.promises.stat(entry)
				return { path: entry, isDirectory: stats.isDirectory() }
			})
		)

		copiedDirs = dirEntries.filter(entry => entry.isDirectory).length
	} else {
		// 复制单个文件
		await ensureTargetDir(path.dirname(targetPath))

		// 检查是否需要复制
		let needCopy = overwrite
		if (!needCopy) {
			try {
				await fs.promises.access(targetPath, fs.constants.F_OK)
				needCopy = false
			} catch {
				needCopy = true
			}
		}

		if (incremental && needCopy) {
			needCopy = await shouldUpdateFile(sourcePath, targetPath)
		}

		if (needCopy) {
			await fs.promises.copyFile(sourcePath, targetPath)
			copiedFiles++
		} else {
			skippedFiles++
		}
	}

	const executionTime = Date.now() - startTime

	return {
		copiedFiles,
		skippedFiles,
		copiedDirs,
		executionTime
	}
}

/**
 * 写入文件内容
 * @param filePath 文件路径
 * @param content 文件内容
 * @throws 当写入过程中出现错误时抛出异常
 */
export async function writeFileContent(filePath: string, content: string): Promise<void> {
	try {
		await fs.promises.writeFile(filePath, content, 'utf-8')
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'EACCES') {
			throw new Error(`写入文件失败：没有权限写入文件 - ${filePath}`)
		} else {
			throw new Error(`写入文件失败：写入文件时出错 - ${filePath}，错误：${error.message}`)
		}
	}
}

/**
 * 同步读取文件内容
 * @param filePath 文件路径
 * @returns 文件内容字符串
 * @throws 当读取过程中出现错误时抛出异常
 */
export function readFileSync(filePath: string): string {
	try {
		return fs.readFileSync(filePath, 'utf-8')
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'EACCES') {
			throw new Error(`读取文件失败：没有权限读取文件 - ${filePath}`)
		} else {
			throw new Error(`读取文件失败：读取文件时出错 - ${filePath}，错误：${error.message}`)
		}
	}
}
