import fs from 'node:fs'
import path from 'node:path'
import type { ScannedModule, ImportMapping, ResolvedImport } from '../types'

/**
 * 解析模块的所有命名导出（用于 `'*'` 通配符）
 *
 * @param modulePath 模块路径（npm 包名或文件路径）
 * @param root 项目根目录，用于解析相对路径
 * @returns 模块的所有命名导出名称列表
 *
 * @description 解析策略：
 * 1. 尝试将模块路径解析为本地文件（补全扩展名），使用 {@link parseModuleExports} 解析
 * 2. 尝试从 `node_modules` 中查找模块入口文件，使用 {@link parseModuleExports} 解析
 * 3. 解析失败时返回空数组
 */
function resolveWildcardExports(modulePath: string, root: string): string[] {
	// 1. 尝试作为文件路径解析
	const absolutePath = path.isAbsolute(modulePath) ? modulePath : path.resolve(root, modulePath)

	// 尝试直接路径、补全扩展名
	const extensions = ['', '.ts', '.js', '.mts', '.mjs', '/index.ts', '/index.js']
	for (const ext of extensions) {
		const tryPath = absolutePath + ext
		if (fs.existsSync(tryPath) && fs.statSync(tryPath).isFile()) {
			const result = parseModuleExports(tryPath)
			if (result) return result.exports
		}
	}

	// 2. 尝试从 node_modules 解析
	const moduleEntry = resolveModuleEntry(modulePath, root)
	if (moduleEntry) {
		const result = parseModuleExports(moduleEntry)
		if (result) return result.exports
	}

	return []
}

/**
 * 从 node_modules 中解析模块入口文件路径
 *
 * @param moduleName npm 包名
 * @param root 项目根目录
 * @returns 入口文件绝对路径，解析失败返回 `null`
 *
 * @description 按优先级依次尝试：
 * 1. `package.json` 的 `exports` 字段（支持 `import`/`default` 条件）
 * 2. `package.json` 的 `main` 字段
 * 3. `index.js` 回退
 */
function resolveModuleEntry(moduleName: string, root: string): string | null {
	try {
		const pkgPath = path.resolve(root, 'node_modules', moduleName, 'package.json')
		if (!fs.existsSync(pkgPath)) return null

		const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

		// 优先使用 exports 字段
		if (pkg.exports) {
			const exportEntry = typeof pkg.exports === 'string' ? pkg.exports : pkg.exports['.']?.import || pkg.exports['.']?.default || pkg.exports['.']
			if (typeof exportEntry === 'string') {
				const entryPath = path.resolve(root, 'node_modules', moduleName, exportEntry)
				if (fs.existsSync(entryPath)) return entryPath
			}
		}

		// 回退到 main 字段
		if (pkg.main) {
			const entryPath = path.resolve(root, 'node_modules', moduleName, pkg.main)
			if (fs.existsSync(entryPath)) return entryPath
		}

		// 回退到 index.js
		const indexPath = path.resolve(root, 'node_modules', moduleName, 'index.js')
		if (fs.existsSync(indexPath)) return indexPath

		return null
	} catch {
		return null
	}
}

/**
 * 解析用户配置的 imports 为统一的 {@link ResolvedImport} 列表
 *
 * @param imports 导入映射配置，支持多种格式：
 * - `Record<string, string[]>` — 简写格式，如 `{ vue: ['ref', 'reactive'] }`
 * - `ImportMapping[]` — 完整格式，支持默认导入配置
 * - 两种格式混合使用的数组
 * @param root 项目根目录，用于解析 `'*'` 通配符时的模块路径
 * @returns 解析后的 {@link ResolvedImport} 列表
 *
 * @description 将各种格式的导入配置统一转换为 `ResolvedImport[]`，
 * 便于后续构建查找表和代码转换。
 *
 * **通配符支持：** 值数组中使用 `'*'` 时，自动发现模块的所有命名导出。
 *
 * @example
 * ```typescript
 * // 简写格式
 * resolveImports({ vue: ['ref', 'reactive'] })
 * // [{ module: 'vue', name: 'ref', isDefault: false }, { module: 'vue', name: 'reactive', isDefault: false }]
 *
 * // 通配符格式
 * resolveImports({ '@dcloudio/uni-app': ['*'] }, '/project/root')
 * // [{ module: '@dcloudio/uni-app', name: 'onLaunch', isDefault: false }, ...]
 *
 * // 完整格式
 * resolveImports([{ module: 'lodash', names: ['debounce'], defaultImport: true }])
 * // [{ module: 'lodash', name: 'debounce', isDefault: true }]
 * ```
 */
export function resolveImports(imports: Record<string, string[]> | ImportMapping[] | Array<Record<string, string[]> | ImportMapping> | undefined, root?: string): ResolvedImport[] {
	if (!imports) return []

	const result: ResolvedImport[] = []

	if (Array.isArray(imports)) {
		for (const item of imports) {
			if ('module' in item && 'names' in item) {
				// ImportMapping 格式
				const mapping = item as ImportMapping
				if (mapping.names.includes('*')) {
					const projectRoot = root || process.cwd()
					const exports = resolveWildcardExports(mapping.module, projectRoot)
					for (const name of exports) {
						result.push({ module: mapping.module, name, isDefault: mapping.defaultImport ?? false })
					}
				} else {
					for (const name of mapping.names) {
						result.push({ module: mapping.module, name, isDefault: mapping.defaultImport ?? false })
					}
				}
			} else {
				// Record<string, string[]> 格式混在数组中
				const record = item as Record<string, string[]>
				for (const [mod, names] of Object.entries(record)) {
					if (names.includes('*')) {
						const projectRoot = root || process.cwd()
						const exports = resolveWildcardExports(mod, projectRoot)
						for (const name of exports) {
							result.push({ module: mod, name, isDefault: false })
						}
					} else {
						for (const name of names) {
							result.push({ module: mod, name, isDefault: false })
						}
					}
				}
			}
		}
	} else {
		// Record<string, string[]> 格式
		for (const [mod, names] of Object.entries(imports)) {
			if (names.includes('*')) {
				const projectRoot = root || process.cwd()
				const exports = resolveWildcardExports(mod, projectRoot)
				for (const name of exports) {
					result.push({ module: mod, name, isDefault: false })
				}
			} else {
				for (const name of names) {
					result.push({ module: mod, name, isDefault: false })
				}
			}
		}
	}

	return result
}

/**
 * 构建名称→模块的查找映射表
 *
 * @param resolvedImports 解析后的 {@link ResolvedImport} 导入列表
 * @returns 以标识符名称为键、{@link ResolvedImport} 为值的 Map
 *
 * @description 用于在代码转换时快速查找需要自动导入的标识符。
 * 同名标识符出现在多个模块中时，后出现的会覆盖先出现的（配置靠后优先级更高）。
 *
 * @example
 * ```typescript
 * const lookup = buildNameLookup([
 *   { module: 'vue', name: 'ref', isDefault: false },
 *   { module: 'vue', name: 'reactive', isDefault: false }
 * ])
 * lookup.get('ref')      // { module: 'vue', name: 'ref', isDefault: false }
 * lookup.get('reactive') // { module: 'vue', name: 'reactive', isDefault: false }
 * ```
 */
export function buildNameLookup(resolvedImports: ResolvedImport[]): Map<string, ResolvedImport> {
	const lookup = new Map<string, ResolvedImport>()

	for (const item of resolvedImports) {
		lookup.set(item.name, item)
	}

	return lookup
}

/**
 * 从文件路径提取模块名称
 *
 * @param filePath 文件绝对或相对路径
 * @returns 提取的模块名称（不含扩展名）
 *
 * @description 提取规则：
 * - 普通文件：使用文件名（去掉扩展名），如 `useAuth.ts` → `useAuth`
 * - `index` 文件：使用父目录名，如 `stores/index.ts` → `stores`
 */
function extractModuleName(filePath: string): string {
	const basename = path.basename(filePath, path.extname(filePath))
	if (basename === 'index') {
		return path.basename(path.dirname(filePath))
	}
	return basename
}

/**
 * 扫描指定目录下的模块文件
 *
 * @param dirs 目录路径列表（支持绝对路径和相对路径）
 * @param root 项目根目录，用于将相对路径解析为绝对路径
 * @returns 扫描到的 {@link ScannedModule} 模块信息列表
 *
 * @description 递归扫描指定目录下的 `.ts`/`.js`/`.mts`/`.mjs` 文件，
 * 解析每个文件的导出信息（命名导出和默认导出）。
 * 自动跳过 `node_modules`、隐藏目录（以 `.` 开头）和 `.d.ts` 文件。
 * 不存在的目录或非目录路径会被静默跳过。
 *
 * @example
 * ```typescript
 * const modules = scanDirectories(['src/composables', 'src/stores'], '/project/root')
 * // [{ filePath: '/project/root/src/composables/useAuth.ts', exports: ['useAuth', 'TOKEN'], defaultExport: null }]
 * ```
 */
export function scanDirectories(dirs: string[], root: string): ScannedModule[] {
	const modules: ScannedModule[] = []

	for (const dir of dirs) {
		const absoluteDir = path.isAbsolute(dir) ? dir : path.resolve(root, dir)

		if (!fs.existsSync(absoluteDir)) continue

		const stat = fs.statSync(absoluteDir)
		if (!stat.isDirectory()) continue

		walkDirectory(absoluteDir, modules)
	}

	return modules
}

/**
 * 递归遍历目录，收集模块信息
 *
 * @param dir 当前目录的绝对路径
 * @param modules 收集的 {@link ScannedModule} 模块列表（就地修改）
 *
 * @description 对每个符合条件的文件调用 {@link parseModuleExports} 解析导出信息。
 * 跳过 `node_modules`、隐藏目录、非目标扩展名文件和 `.d.ts` 文件。
 */
function walkDirectory(dir: string, modules: ScannedModule[]): void {
	const entries = fs.readdirSync(dir, { withFileTypes: true })

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)

		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
			walkDirectory(fullPath, modules)
			continue
		}

		if (!entry.isFile()) continue

		const ext = path.extname(entry.name).toLowerCase()
		if (!['.ts', '.js', '.mts', '.mjs'].includes(ext)) continue

		// 跳过 .d.ts 文件
		if (entry.name.endsWith('.d.ts')) continue

		const moduleInfo = parseModuleExports(fullPath)
		if (moduleInfo) {
			modules.push(moduleInfo)
		}
	}
}

/**
 * 解析模块文件的导出信息
 *
 * @param filePath 模块文件的绝对路径
 * @returns 解析成功返回 {@link ScannedModule}，无导出或解析失败返回 `null`
 *
 * @description 使用正则表达式分析文件内容，提取命名导出和默认导出。
 *
 * **支持的导出语法（ESM）：**
 * - `export function name()` / `export async function name()` — 函数
 * - `export const/let/var name` — 变量
 * - `export class name` — 类
 * - `export { name1, name2 }` — 列表导出
 * - `export { foo as bar }` — 重命名导出（使用别名 bar）
 * - `export { default as Name }` — 默认导出重命名（使用 Name）
 * - `export default function name()` / `export default class name` — 默认导出
 * - `export type name` / `export interface name` — TypeScript 类型
 *
 * **支持的导出语法（CommonJS）：**
 * - `exports.name = ...` — 命名导出
 *
 * @example
 * ```typescript
 * parseModuleExports('/src/composables/useAuth.ts')
 * // { filePath: '/src/composables/useAuth.ts', exports: ['useAuth', 'TOKEN'], defaultExport: null }
 * ```
 */
export function parseModuleExports(filePath: string): ScannedModule | null {
	try {
		const content = fs.readFileSync(filePath, 'utf-8')
		const exports: string[] = []
		let defaultExport: string | null = null

		// 匹配 export function name / export async function name
		const funcExportRegex = /export\s+(?:async\s+)?function\s+(\w+)/g
		let match: RegExpExecArray | null
		while ((match = funcExportRegex.exec(content)) !== null) {
			exports.push(match[1])
		}

		// 匹配 export const/let/var name
		const varExportRegex = /export\s+(?:const|let|var)\s+(\w+)/g
		while ((match = varExportRegex.exec(content)) !== null) {
			exports.push(match[1])
		}

		// 匹配 export class name
		const classExportRegex = /export\s+class\s+(\w+)/g
		while ((match = classExportRegex.exec(content)) !== null) {
			exports.push(match[1])
		}

		// 匹配 export { name1, name2 } / export { foo as bar } / export { default as Name }
		const namedExportRegex = /export\s*\{([^}]+)\}/g
		while ((match = namedExportRegex.exec(content)) !== null) {
			const names = match[1].split(',').map(s => {
				const trimmed = s.trim()
				const parts = trimmed.split(/\s+as\s+/)
				// export { default as Name } → Name | export { foo as bar } → bar
				return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim()
			})
			for (const name of names) {
				if (name && name !== 'default') {
					exports.push(name)
				}
			}
		}

		// 匹配 export default
		const defaultExportRegex = /export\s+default\s+(?:function\s+(\w+)|class\s+(\w+)|(\w+))?/
		const defaultMatch = defaultExportRegex.exec(content)
		if (defaultMatch) {
			defaultExport = defaultMatch[1] || defaultMatch[2] || defaultMatch[3] || extractModuleName(filePath)
		}

		// 匹配 export type / export interface (TypeScript)
		const typeExportRegex = /export\s+(?:type|interface)\s+(\w+)/g
		while ((match = typeExportRegex.exec(content)) !== null) {
			exports.push(match[1])
		}

		// 匹配 CommonJS exports.xxx = xxx / module.exports = { xxx }
		const cjsExportRegex = /^(?:exports\.(\w+)\s*=|module\.exports\s*=\s*\{)/gm
		while ((match = cjsExportRegex.exec(content)) !== null) {
			if (match[1]) {
				exports.push(match[1])
			}
		}

		// 无任何导出则跳过
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
 * 将扫描到的模块信息转换为 {@link ResolvedImport} 列表
 *
 * @param modules 扫描到的 {@link ScannedModule} 模块列表
 * @returns 解析后的 {@link ResolvedImport} 导入映射列表
 *
 * @description 转换规则：
 * - 命名导出 → `isDefault: false`，模块路径使用文件绝对路径
 * - 默认导出 → `isDefault: true`，使用导出名称作为标识符
 *
 * @example
 * ```typescript
 * scannedModulesToImports([
 *   { filePath: '/src/use.ts', exports: ['useA', 'useB'], defaultExport: null }
 * ])
 * // [
 * //   { module: '/src/use.ts', name: 'useA', isDefault: false },
 * //   { module: '/src/use.ts', name: 'useB', isDefault: false }
 * // ]
 * ```
 */
export function scannedModulesToImports(modules: ScannedModule[]): ResolvedImport[] {
	const result: ResolvedImport[] = []

	for (const mod of modules) {
		for (const exportName of mod.exports) {
			result.push({
				module: mod.filePath,
				name: exportName,
				isDefault: false
			})
		}

		if (mod.defaultExport) {
			result.push({
				module: mod.filePath,
				name: mod.defaultExport,
				isDefault: true
			})
		}
	}

	return result
}
