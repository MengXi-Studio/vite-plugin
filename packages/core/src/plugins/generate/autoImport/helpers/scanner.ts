import fs from 'node:fs'
import path from 'node:path'
import type { ScannedModule, ImportInline, DirConfig, DirsScanOptions } from '../types'

/**
 * 解析模块的所有命名导出（用于 `'*'` 通配符）
 *
 * @param modulePath 模块路径（npm 包名或文件路径）
 * @param root 项目根目录
 * @returns 模块的所有命名导出名称列表
 *
 * @description 解析策略（按优先级）：
 * 1. 尝试从 `.d.ts` 类型声明文件解析
 * 2. 尝试将模块路径解析为本地文件
 * 3. 尝试从 node_modules 中查找模块入口文件
 * 4. 解析失败时返回空数组
 */
export function resolveWildcardExports(modulePath: string, root: string): string[] {
	// 1. 优先从 .d.ts 类型声明文件解析（最准确）
	const dtsExports = resolveDtsExports(modulePath, root)
	if (dtsExports.length > 0) return dtsExports

	// 2. 尝试作为本地文件路径解析
	const absolutePath = path.isAbsolute(modulePath) ? modulePath : path.resolve(root, modulePath)
	const extensions = ['', '.ts', '.js', '.mts', '.mjs', '/index.ts', '/index.js']
	for (const ext of extensions) {
		const tryPath = absolutePath + ext
		if (fs.existsSync(tryPath) && fs.statSync(tryPath).isFile()) {
			const result = parseModuleExports(tryPath)
			if (result && result.exports.length > 0) return result.exports
		}
	}

	// 3. 尝试从 node_modules 解析运行时入口
	const moduleEntry = resolveModuleEntry(modulePath, root)
	if (moduleEntry) {
		const result = parseModuleExports(moduleEntry)
		if (result && result.exports.length > 0) return result.exports
	}

	return []
}

/**
 * 从 `.d.ts` 类型声明文件中解析模块的所有命名导出
 *
 * @param moduleName npm 包名
 * @param root 项目根目录
 * @returns 命名导出名称列表
 */
function resolveDtsExports(moduleName: string, root: string): string[] {
	try {
		let moduleDir: string | null = null
		try {
			const resolved = require.resolve(moduleName, { paths: [root] })
			let dir = path.dirname(resolved)
			while (dir !== path.dirname(dir)) {
				if (fs.existsSync(path.join(dir, 'package.json'))) {
					moduleDir = dir
					break
				}
				dir = path.dirname(dir)
			}
		} catch {
			// require.resolve 失败，回退到直接路径
		}

		if (!moduleDir) {
			const directPath = path.resolve(root, 'node_modules', moduleName)
			if (fs.existsSync(path.join(directPath, 'package.json'))) {
				moduleDir = directPath
			}
		}

		if (!moduleDir) return []

		const pkgPath = path.join(moduleDir, 'package.json')
		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
		let dtsPath: string | null = null

		const typesField = pkg.types || pkg.typings
		if (typesField && typeof typesField === 'string') {
			const resolved = path.resolve(moduleDir, typesField)
			if (fs.existsSync(resolved)) dtsPath = resolved
		}

		if (!dtsPath && pkg.exports) {
			const dotExport = pkg.exports['.']
			if (dotExport) {
				const typesEntry = typeof dotExport === 'string' ? null : dotExport.import?.types || dotExport.types || dotExport.default?.types
				if (typeof typesEntry === 'string') {
					const resolved = path.resolve(moduleDir, typesEntry)
					if (fs.existsSync(resolved)) dtsPath = resolved
				}
			}
		}

		if (!dtsPath) {
			const fallbacks = ['dist/index.d.ts', 'index.d.ts', 'dist/index.d.mts', 'index.d.mts']
			for (const fb of fallbacks) {
				const resolved = path.resolve(moduleDir, fb)
				if (fs.existsSync(resolved)) {
					dtsPath = resolved
					break
				}
			}
		}

		if (!dtsPath) return []

		return parseDtsExportsRecursive(dtsPath, root, new Set())
	} catch {
		return []
	}
}

/**
 * 递归解析 `.d.ts` 文件的导出，处理 `export * from '...'` 重导出
 */
function parseDtsExportsRecursive(dtsPath: string, root: string, visited: Set<string>): string[] {
	if (visited.has(dtsPath)) return []
	visited.add(dtsPath)

	const exportSet = new Set<string>()

	try {
		const content = fs.readFileSync(dtsPath, 'utf-8')

		const namedExportRegex = /export\s*\{([^}]+)\}/g
		let match: RegExpExecArray | null
		while ((match = namedExportRegex.exec(content)) !== null) {
			const names = match[1].split(',').map(s => {
				const trimmed = s.trim()
				const parts = trimmed.split(/\s+as\s+/)
				return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim()
			})
			for (const name of names) {
				if (name && name !== 'default') exportSet.add(name)
			}
		}

		const declareExportRegex = /export\s+declare\s+(?:const|let|var|function|class)\s+(\w+)/g
		while ((match = declareExportRegex.exec(content)) !== null) {
			exportSet.add(match[1])
		}

		const typeExportRegex = /export\s+(?:type|interface)\s+(\w+)/g
		while ((match = typeExportRegex.exec(content)) !== null) {
			exportSet.add(match[1])
		}

		const reExportRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g
		while ((match = reExportRegex.exec(content)) !== null) {
			const reExports = resolveReExportedModule(match[1], dtsPath, root, visited)
			for (const name of reExports) {
				exportSet.add(name)
			}
		}
	} catch {
		// 读取失败，跳过
	}

	return [...exportSet]
}

/**
 * 解析重导出模块的 `.d.ts` 文件
 */
function resolveReExportedModule(moduleSpecifier: string, fromPath: string, root: string, visited: Set<string>): string[] {
	if (moduleSpecifier.startsWith('.')) {
		const dir = path.dirname(fromPath)
		const extensions = ['.d.ts', '.d.mts', '/index.d.ts', '/index.d.mts']
		for (const ext of extensions) {
			const resolved = path.resolve(dir, moduleSpecifier + ext)
			if (fs.existsSync(resolved)) {
				return parseDtsExportsRecursive(resolved, root, visited)
			}
		}
	}

	return resolveDtsExports(moduleSpecifier, root)
}

/**
 * 从 node_modules 中解析模块入口文件路径
 */
function resolveModuleEntry(moduleName: string, root: string): string | null {
	try {
		const resolved = require.resolve(moduleName, { paths: [root] })
		if (fs.existsSync(resolved)) return resolved
	} catch {
		// 回退到手动解析
	}

	try {
		let moduleDir: string | null = null
		try {
			const resolved = require.resolve(moduleName, { paths: [root] })
			let dir = path.dirname(resolved)
			while (dir !== path.dirname(dir)) {
				if (fs.existsSync(path.join(dir, 'package.json'))) {
					moduleDir = dir
					break
				}
				dir = path.dirname(dir)
			}
		} catch {
			// 回退
		}

		if (!moduleDir) {
			const directPath = path.resolve(root, 'node_modules', moduleName)
			if (fs.existsSync(path.join(directPath, 'package.json'))) {
				moduleDir = directPath
			}
		}

		if (!moduleDir) return null

		const pkgPath = path.join(moduleDir, 'package.json')
		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

		if (pkg.exports) {
			const exportEntry = typeof pkg.exports === 'string' ? pkg.exports : pkg.exports['.']?.import || pkg.exports['.']?.default || pkg.exports['.']
			if (typeof exportEntry === 'string') {
				const entryPath = path.resolve(moduleDir, exportEntry)
				if (fs.existsSync(entryPath)) return entryPath
			}
		}

		if (pkg.main) {
			const entryPath = path.resolve(moduleDir, pkg.main)
			if (fs.existsSync(entryPath)) return entryPath
		}

		const indexPath = path.resolve(moduleDir, 'index.js')
		if (fs.existsSync(indexPath)) return indexPath

		return null
	} catch {
		return null
	}
}

/** 默认文件匹配模式 */
const DEFAULT_FILE_PATTERNS = ['*.{ts,js,mjs,cjs,mts,cts}']

/** 支持的文件扩展名 */
const SUPPORTED_EXTENSIONS = ['.ts', '.js', '.mts', '.mjs', '.cjs', '.cts']

/**
 * 扫描指定目录下的模块文件（增强版）
 *
 * @param dirs 目录配置列表（支持字符串和 DirConfigObject）
 * @param root 项目根目录
 * @param scanOptions 目录扫描选项
 * @returns 扫描到的 ScannedModule 模块信息列表
 *
 * @description 增强：
 * - 支持 glob 模式（`./composables/**` 递归扫描）
 * - 支持 DirConfigObject 中的 types 标记
 * - 支持 filePatterns 文件模式过滤
 * - 支持 fileFilter 自定义过滤函数
 */
export function scanDirectories(dirs: DirConfig[], root: string, scanOptions?: DirsScanOptions): ScannedModule[] {
	const modules: ScannedModule[] = []
	const filePatterns = scanOptions?.filePatterns ?? DEFAULT_FILE_PATTERNS
	const fileFilter = scanOptions?.fileFilter
	const defaultTypes = scanOptions?.types ?? false

	for (const dir of dirs) {
		let dirPath: string
		let isRecursive = false
		let isType = defaultTypes

		if (typeof dir === 'string') {
			dirPath = dir
			// 检测 glob 模式：以 /** 结尾表示递归
			if (dirPath.endsWith('/**') || dirPath.endsWith('\\**')) {
				dirPath = dirPath.replace(/[/\\]\*\*$/, '')
				isRecursive = true
			} else if (dirPath.endsWith('/*') || dirPath.endsWith('\\*')) {
				// 单层 * 表示只扫描一级子目录
				dirPath = dirPath.replace(/[/\\]\*$/, '')
				isRecursive = false
			}
		} else {
			dirPath = dir.glob
			if (dirPath.endsWith('/**') || dirPath.endsWith('\\**')) {
				dirPath = dirPath.replace(/[/\\]\*\*$/, '')
				isRecursive = true
			} else if (dirPath.endsWith('/*') || dirPath.endsWith('\\*')) {
				dirPath = dirPath.replace(/[/\\]\*$/, '')
				isRecursive = false
			}
			isType = dir.types ?? defaultTypes
		}

		const absoluteDir = path.isAbsolute(dirPath) ? dirPath : path.resolve(root, dirPath)

		if (!fs.existsSync(absoluteDir)) continue

		const stat = fs.statSync(absoluteDir)
		if (!stat.isDirectory()) continue

		walkDirectory(absoluteDir, modules, { isRecursive, isType, filePatterns, fileFilter })
	}

	return modules
}

/**
 * 目录扫描选项（内部使用）
 */
interface WalkOptions {
	isRecursive: boolean
	isType: boolean
	filePatterns: string[]
	fileFilter?: (file: string) => boolean
}

/**
 * 递归遍历目录，收集模块信息
 *
 * @param dir 当前目录的绝对路径
 * @param modules 收集的模块列表
 * @param options 遍历选项
 * @param depth 当前深度（0 表示根目录）
 */
function walkDirectory(dir: string, modules: ScannedModule[], options: WalkOptions, depth: number = 0): void {
	const entries = fs.readdirSync(dir, { withFileTypes: true })

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)

		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
			// 递归模式下才进入子目录
			if (options.isRecursive || depth === 0) {
				walkDirectory(fullPath, modules, options, depth + 1)
			}
			continue
		}

		if (!entry.isFile()) continue

		// 文件扩展名过滤
		const ext = path.extname(entry.name).toLowerCase()
		if (!SUPPORTED_EXTENSIONS.includes(ext)) continue

		// 跳过 .d.ts 文件
		if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.d.mts') || entry.name.endsWith('.d.cts')) continue

		// filePatterns 过滤
		if (options.filePatterns.length > 0 && !matchFilePatterns(entry.name, options.filePatterns)) continue

		// fileFilter 过滤
		if (options.fileFilter && !options.fileFilter(fullPath)) continue

		const moduleInfo = parseModuleExports(fullPath)
		if (moduleInfo) {
			// 标记类型
			moduleInfo.isType = options.isType
			modules.push(moduleInfo)
		}
	}
}

/**
 * 简单的文件模式匹配
 *
 * @param fileName 文件名
 * @param patterns glob 模式列表
 * @returns 是否匹配
 *
 * @description 支持 * 通配符，如 `*.ts`、`*.{ts,js}`
 */
function matchFilePatterns(fileName: string, patterns: string[]): boolean {
	for (const pattern of patterns) {
		// 处理 *.{ext1,ext2} 格式
		const braceMatch = pattern.match(/^\*\.\{(.+)\}$/)
		if (braceMatch) {
			const exts = braceMatch[1].split(',').map(e => e.trim())
			for (const ext of exts) {
				if (fileName.endsWith('.' + ext)) return true
			}
			continue
		}

		// 处理 *.ext 格式
		const starMatch = pattern.match(/^\*\.(.+)$/)
		if (starMatch) {
			if (fileName.endsWith('.' + starMatch[1])) return true
			continue
		}

		// 直接匹配
		if (fileName === pattern) return true
	}

	return false
}

/**
 * 从文件路径提取模块名称
 *
 * @param filePath 文件绝对或相对路径
 * @returns 提取的模块名称（不含扩展名）
 */
function extractModuleName(filePath: string): string {
	const basename = path.basename(filePath, path.extname(filePath))
	if (basename === 'index') {
		return path.basename(path.dirname(filePath))
	}
	return basename
}

/**
 * 解析模块文件的导出信息
 *
 * @param filePath 模块文件的绝对路径
 * @returns 解析成功返回 ScannedModule，无导出或解析失败返回 null
 */
export function parseModuleExports(filePath: string): ScannedModule | null {
	try {
		const content = fs.readFileSync(filePath, 'utf-8')
		const exports: string[] = []
		let defaultExport: string | null = null

		const funcExportRegex = /export\s+(?:async\s+)?function\s+(\w+)/g
		let match: RegExpExecArray | null
		while ((match = funcExportRegex.exec(content)) !== null) {
			exports.push(match[1])
		}

		const varExportRegex = /export\s+(?:const|let|var)\s+(\w+)/g
		while ((match = varExportRegex.exec(content)) !== null) {
			exports.push(match[1])
		}

		const classExportRegex = /export\s+class\s+(\w+)/g
		while ((match = classExportRegex.exec(content)) !== null) {
			exports.push(match[1])
		}

		const namedExportRegex = /export\s*\{([^}]+)\}/g
		while ((match = namedExportRegex.exec(content)) !== null) {
			const names = match[1].split(',').map(s => {
				const trimmed = s.trim()
				const parts = trimmed.split(/\s+as\s+/)
				return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim()
			})
			for (const name of names) {
				if (name && name !== 'default') {
					exports.push(name)
				}
			}
		}

		const defaultExportRegex = /export\s+default\s+(?:function\s+(\w+)|class\s+(\w+)|(\w+))?/
		const defaultMatch = defaultExportRegex.exec(content)
		if (defaultMatch) {
			defaultExport = defaultMatch[1] || defaultMatch[2] || defaultMatch[3] || extractModuleName(filePath)
		}

		const typeExportRegex = /export\s+(?:type|interface)\s+(\w+)/g
		while ((match = typeExportRegex.exec(content)) !== null) {
			exports.push(match[1])
		}

		const cjsExportRegex = /^(?:exports\.(\w+)\s*=|module\.exports\s*=\s*\{)/gm
		while ((match = cjsExportRegex.exec(content)) !== null) {
			if (match[1]) {
				exports.push(match[1])
			}
		}

		if (exports.length === 0 && defaultExport === null) {
			return null
		}

		return {
			filePath,
			exports,
			defaultExport
		}
	} catch {
		return null
	}
}

/**
 * 将扫描到的模块信息转换为 ImportInline 列表
 *
 * @param modules 扫描到的 ScannedModule 模块列表
 * @param options 转换选项
 * @returns 解析后的 ImportInline 导入映射列表
 *
 * @description 转换规则：
 * - 命名导出 → `isDefault: false`，模块路径使用文件绝对路径
 * - 默认导出 → `isDefault: true`，使用导出名称（或文件名）作为标识符
 * - isType 标记传递到 ImportInline.type
 * - defaultExportByFilename 启用时，默认导出名称使用文件名
 */
export function scannedModulesToImports(modules: ScannedModule[], options?: { defaultExportByFilename?: boolean }): ImportInline[] {
	const result: ImportInline[] = []

	for (const mod of modules) {
		for (const exportName of mod.exports) {
			result.push({
				name: exportName,
				from: mod.filePath,
				isDefault: false,
				type: mod.isType
			})
		}

		if (mod.defaultExport) {
			let name = mod.defaultExport
			if (options?.defaultExportByFilename) {
				name = extractModuleName(mod.filePath)
			}
			result.push({
				name,
				from: mod.filePath,
				as: name !== mod.defaultExport ? name : undefined,
				isDefault: true,
				type: mod.isType
			})
		}
	}

	return result
}
