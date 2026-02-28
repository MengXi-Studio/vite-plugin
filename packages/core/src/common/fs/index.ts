import fs from 'fs'
import path from 'path'
import type { CopyOptions, CopyResult } from './type'

/**
 * 默认并发限制数
 */
const DEFAULT_CONCURRENCY = 10

/**
 * 文件/目录条目信息
 */
interface FileEntry {
	/** 完整路径 */
	path: string
	/** 是否为文件 */
	isFile: boolean
	/** 是否为目录 */
	isDirectory: boolean
}

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
 * 读取目录内容（优化版：一次性获取文件类型信息）
 * @param dirPath 目录路径
 * @param recursive 是否递归读取
 * @returns 文件和目录条目列表
 */
export async function readDirRecursive(dirPath: string, recursive: boolean): Promise<FileEntry[]> {
	const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
	const result: FileEntry[] = []

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name)
		const isFile = entry.isFile()
		const isDirectory = entry.isDirectory()

		result.push({ path: fullPath, isFile, isDirectory })

		if (isDirectory && recursive) {
			const subEntries = await readDirRecursive(fullPath, recursive)
			result.push(...subEntries)
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
		const [sourceStats, targetStats] = await Promise.all([fs.promises.stat(sourceFile), fs.promises.stat(targetFile)])
		// 比较修改时间和文件大小
		return sourceStats.mtimeMs > targetStats.mtimeMs || sourceStats.size !== targetStats.size
	} catch {
		// 目标文件不存在或无法访问，需要更新
		return true
	}
}

/**
 * 检查目标文件是否存在
 * @param targetFile 目标文件路径
 * @returns 是否存在
 */
async function targetFileExists(targetFile: string): Promise<boolean> {
	try {
		await fs.promises.access(targetFile, fs.constants.F_OK)
		return true
	} catch {
		return false
	}
}

/**
 * 带并发限制的批量执行
 * @param items 待处理项
 * @param handler 处理函数
 * @param concurrency 并发数
 */
async function runWithConcurrency<T, R>(items: T[], handler: (item: T) => Promise<R>, concurrency: number): Promise<R[]> {
	const results: R[] = []
	let index = 0

	async function runNext(): Promise<void> {
		while (index < items.length) {
			const currentIndex = index++
			const result = await handler(items[currentIndex])
			results[currentIndex] = result
		}
	}

	// 创建并发工作线程
	const workers = Array(Math.min(concurrency, items.length))
		.fill(null)
		.map(() => runNext())
	await Promise.all(workers)

	return results
}

/**
 * 复制单个文件的结果
 */
interface CopyFileResult {
	copied: boolean
	skipped: boolean
}

/**
 * 执行文件复制操作（优化版：并行IO）
 * @param sourcePath 源文件或目录路径
 * @param targetPath 目标文件或目录路径
 * @param options 复制选项
 * @returns 复制结果
 * @throws 当复制过程中出现错误时抛出异常
 */
export async function copySourceToTarget(sourcePath: string, targetPath: string, options: CopyOptions): Promise<CopyResult> {
	const startTime = Date.now()
	const { recursive, overwrite, incremental = false, parallelLimit = DEFAULT_CONCURRENCY } = options

	let copiedFiles = 0
	let skippedFiles = 0
	let copiedDirs = 0

	// 检查源文件是否为目录
	const sourceStats = await fs.promises.stat(sourcePath)

	if (sourceStats.isDirectory()) {
		// 确保目标目录存在
		await ensureTargetDir(targetPath)

		// 获取所有文件和目录（一次性获取类型信息，避免重复stat）
		const entries = await readDirRecursive(sourcePath, recursive)

		// 分离文件和目录
		const fileEntries = entries.filter(entry => entry.isFile)
		const dirEntries = entries.filter(entry => entry.isDirectory)
		copiedDirs = dirEntries.length

		// 预先创建所有需要的目录（并行）
		const uniqueDirs = new Set<string>()
		for (const fileEntry of fileEntries) {
			const relativePath = path.relative(sourcePath, fileEntry.path)
			const destDir = path.dirname(path.join(targetPath, relativePath))
			uniqueDirs.add(destDir)
		}
		await Promise.all([...uniqueDirs].map(dir => ensureTargetDir(dir)))

		// 并行复制文件
		const copyFileHandler = async (fileEntry: FileEntry): Promise<CopyFileResult> => {
			const relativePath = path.relative(sourcePath, fileEntry.path)
			const destFile = path.join(targetPath, relativePath)

			// 检查是否需要复制
			let needCopy = overwrite
			if (!needCopy) {
				const exists = await targetFileExists(destFile)
				needCopy = !exists
			}

			if (incremental && needCopy) {
				needCopy = await shouldUpdateFile(fileEntry.path, destFile)
			}

			if (needCopy) {
				await fs.promises.copyFile(fileEntry.path, destFile)
				return { copied: true, skipped: false }
			}
			return { copied: false, skipped: true }
		}

		const results = await runWithConcurrency(fileEntries, copyFileHandler, parallelLimit)

		// 统计结果
		for (const result of results) {
			if (result.copied) copiedFiles++
			if (result.skipped) skippedFiles++
		}
	} else {
		// 复制单个文件
		await ensureTargetDir(path.dirname(targetPath))

		// 检查是否需要复制
		let needCopy = overwrite
		if (!needCopy) {
			const exists = await targetFileExists(targetPath)
			needCopy = !exists
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
