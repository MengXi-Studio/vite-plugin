import fs from 'fs'
import path from 'path'
import type { CopyOptions, CopyResult } from './type'

export type { CopyOptions, CopyResult } from './type'

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
async function ensureTargetDir(targetPath: string): Promise<void> {
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
async function readDirRecursive(dirPath: string, recursive: boolean): Promise<FileEntry[]> {
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
async function shouldUpdateFile(sourceFile: string, targetFile: string): Promise<boolean> {
	try {
		const [sourceStats, targetStats] = await Promise.all([fs.promises.stat(sourceFile), fs.promises.stat(targetFile)])
		return sourceStats.mtimeMs > targetStats.mtimeMs || sourceStats.size !== targetStats.size
	} catch {
		return true
	}
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 * @returns 是否存在
 */
async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.promises.access(filePath, fs.constants.F_OK)
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
 * @returns 处理结果数组，顺序与输入项对应
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

	const sourceStats = await fs.promises.stat(sourcePath)

	if (sourceStats.isDirectory()) {
		await ensureTargetDir(targetPath)

		const entries = await readDirRecursive(sourcePath, recursive)

		const fileEntries = entries.filter(entry => entry.isFile)
		const dirEntries = entries.filter(entry => entry.isDirectory)
		copiedDirs = dirEntries.length

		const uniqueDirs = new Set<string>()
		for (const fileEntry of fileEntries) {
			const relativePath = path.relative(sourcePath, fileEntry.path)
			const destDir = path.dirname(path.join(targetPath, relativePath))
			uniqueDirs.add(destDir)
		}
		await Promise.all([...uniqueDirs].map(dir => ensureTargetDir(dir)))

		const copyFileHandler = async (fileEntry: FileEntry): Promise<CopyFileResult> => {
			const relativePath = path.relative(sourcePath, fileEntry.path)
			const destFile = path.join(targetPath, relativePath)

			let needCopy = overwrite
			if (!needCopy) {
				const exists = await fileExists(destFile)
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

		for (const result of results) {
			if (result.copied) copiedFiles++
			if (result.skipped) skippedFiles++
		}
	} else {
		await ensureTargetDir(path.dirname(targetPath))

		let needCopy = overwrite
		if (!needCopy) {
			const exists = await fileExists(targetPath)
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
 * 扫描目录中的文件信息
 */
export interface ScannedFile {
	/** 文件绝对路径 */
	filePath: string
	/** 文件大小（字节） */
	size: number
	/** 文件扩展名（小写，含点号，如 '.js'） */
	extension: string
}

/**
 * 目录扫描选项
 */
export interface ScanDirectoryOptions {
	/** 包含的文件扩展名列表，为空则包含所有 */
	includeExtensions?: string[]
	/** 排除的路径模式列表 */
	excludePatterns?: string[]
	/** 自定义文件过滤函数，返回 true 表示包含该文件 */
	filter?: (filePath: string, extension: string, size: number) => boolean
}

/**
 * 递归扫描目录，收集所有文件信息
 *
 * @async
 * @param {string} dirPath - 要扫描的目录路径
 * @param {ScanDirectoryOptions} options - 扫描选项
 * @returns {Promise<ScannedFile[]>} 文件信息列表
 *
 * @description 递归遍历指定目录下的所有文件，收集每个文件的大小和扩展名信息，
 * 支持按扩展名、路径模式和自定义过滤函数进行过滤。
 *
 * @example
 * ```typescript
 * const jsFiles = await scanDirectory('dist', { includeExtensions: ['.js'] })
 * const files = await scanDirectory('dist', { excludePatterns: ['node_modules'] })
 * ```
 */
export async function scanDirectory(dirPath: string, options: ScanDirectoryOptions = {}): Promise<ScannedFile[]> {
	const { includeExtensions = [], excludePatterns = [], filter } = options
	const results: ScannedFile[] = []

	async function walk(dir: string): Promise<void> {
		const entries = await fs.promises.readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name)

			if (entry.isDirectory()) {
				await walk(fullPath)
				continue
			}

			if (!entry.isFile()) continue

			const shouldExclude = excludePatterns.some(pattern => {
				if (pattern.startsWith('*')) {
					return fullPath.endsWith(pattern.slice(1))
				}
				return fullPath.includes(pattern)
			})
			if (shouldExclude) continue

			const ext = path.extname(entry.name).toLowerCase()
			if (includeExtensions.length > 0 && !includeExtensions.includes(ext)) continue

			const stat = await fs.promises.stat(fullPath)

			if (filter && !filter(fullPath, ext, stat.size)) continue

			results.push({ filePath: fullPath, size: stat.size, extension: ext })
		}
	}

	await walk(dirPath)
	return results
}

/**
 * 将数据写入 JSON 文件
 *
 * @async
 * @param {string} filePath - 输出文件路径
 * @param {object} data - 要序列化的数据对象
 * @param {number} [indent=2] - JSON 缩进空格数
 * @returns {Promise<void>}
 *
 * @description 将任意数据对象序列化为 JSON 格式并写入文件。
 * 内部使用 writeFileContent 确保统一的错误处理。
 *
 * @example
 * ```typescript
 * await writeJsonReport('dist/report.json', { timestamp: Date.now(), stats: [] })
 * ```
 */
export async function writeJsonReport(filePath: string, data: object, indent: number = 2): Promise<void> {
	await writeFileContent(filePath, JSON.stringify(data, null, indent))
}

/**
 * 同步写入文件内容，自动创建不存在的目录
 *
 * @param filePath 文件路径
 * @param content 文件内容
 *
 * @description 同步写入文件，如果目标目录不存在会自动递归创建。
 * 适用于构建钩子中需要同步写入的场景（如 `transform` 钩子）。
 *
 * @throws 当文件写入失败时（如权限不足），抛出 `NodeJS.ErrnoException`
 *
 * @example
 * ```typescript
 * writeFileSyncSafely('/project/src/auto-imports.d.ts', 'declare global { ... }')
 * ```
 */
export function writeFileSyncSafely(filePath: string, content: string): void {
	const dir = path.dirname(filePath)

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true })
	}

	fs.writeFileSync(filePath, content, 'utf-8')
}

/**
 * 检查文件内容是否需要更新（同步版本）
 *
 * @param filePath 文件路径
 * @param newContent 新生成的文件内容
 * @returns 如果需要更新返回 `true`，否则返回 `false`
 *
 * @description 对比现有文件内容与新生成的内容，
 * 仅在内容发生变化时才需要写入，减少不必要的文件 IO 操作。
 *
 * @example
 * ```typescript
 * if (shouldUpdateFileContent('/project/src/auto-imports.d.ts', newContent)) {
 *   writeFileSyncSafely('/project/src/auto-imports.d.ts', newContent)
 * }
 * ```
 */
export function shouldUpdateFileContent(filePath: string, newContent: string): boolean {
	if (!fs.existsSync(filePath)) return true

	try {
		const existing = fs.readFileSync(filePath, 'utf-8')
		return existing !== newContent
	} catch {
		return true
	}
}
