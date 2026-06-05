import fs from 'node:fs'
import path from 'node:path'
import type { ScannedModule, ImportMapping, ResolvedImport } from '../types'

/**
 * 解析用户配置的 imports 为统一的 ResolvedImport 列表
 *
 * @param imports 用户配置的导入映射，支持多种格式：
 * - `Record<string, string[]>` 简写格式
 * - `ImportMapping[]` 完整格式
 * - 两种格式混合使用的数组
 * @returns 解析后的 {@link ResolvedImport} 列表
 *
 * @description 将用户提供的各种格式的导入配置统一转换为
 * `ResolvedImport[]` 格式，便于后续构建查找表和代码转换。
 *
 * **支持的格式：**
 * - 简写格式：`{ 'vue': ['ref', 'reactive'] }` — 键为模块路径，值为导入名称数组
 * - 完整格式：`[{ module: 'vue', names: ['ref'], defaultImport: false }]`
 * - 混合格式：两种格式可以在数组中混合使用
 *
 * @example
 * ```typescript
 * resolveImports({ vue: ['ref', 'reactive'] })
 * // [{ module: 'vue', name: 'ref', isDefault: false }, { module: 'vue', name: 'reactive', isDefault: false }]
 *
 * resolveImports([{ module: 'lodash', names: ['debounce'], defaultImport: true }])
 * // [{ module: 'lodash', name: 'debounce', isDefault: true }]
 * ```
 */
export function resolveImports(imports: Record<string, string[]> | ImportMapping[] | Array<Record<string, string[]> | ImportMapping> | undefined): ResolvedImport[] {
	if (!imports) return []

	const result: ResolvedImport[] = []

	if (Array.isArray(imports)) {
		for (const item of imports) {
			if ('module' in item && 'names' in item) {
				// ImportMapping 格式
				const mapping = item as ImportMapping
				for (const name of mapping.names) {
					result.push({
						module: mapping.module,
						name,
						isDefault: mapping.defaultImport ?? false
					})
				}
			} else {
				// Record<string, string[]> 格式混在数组中
				const record = item as Record<string, string[]>
				for (const [mod, names] of Object.entries(record)) {
					for (const name of names) {
						result.push({ module: mod, name, isDefault: false })
					}
				}
			}
		}
	} else {
		// Record<string, string[]> 格式
		for (const [mod, names] of Object.entries(imports)) {
			for (const name of names) {
				result.push({ module: mod, name, isDefault: false })
			}
		}
	}

	return result
}

/**
 * 构建 名称→模块 的查找映射表
 *
 * @param resolvedImports 解析后的 {@link ResolvedImport} 导入列表
 * @returns 以标识符名称为键、{@link ResolvedImport} 为值的 Map
 *
 * @description 将 {@link ResolvedImport} 列表转换为以标识符名称为键的映射表，
 * 用于在代码转换时快速查找需要自动导入的标识符。
 *
 * **覆盖规则：** 如果同名标识符出现在多个模块中，后出现的会覆盖先出现的
 * （用户配置中靠后的项优先级更高）
 *
 * @example
 * ```typescript
 * const lookup = buildNameLookup([
 *   { module: 'vue', name: 'ref', isDefault: false },
 *   { module: 'vue', name: 'reactive', isDefault: false }
 * ])
 * lookup.get('ref')     // { module: 'vue', name: 'ref', isDefault: false }
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
 * 解析每个文件的导出信息（命名导出和默认导出），
 * 将其转换为可自动导入的映射项。
 *
 * **扫描规则：**
 * - 自动跳过 `node_modules` 目录和以 `.` 开头的隐藏目录
 * - 自动跳过 `.d.ts` 类型声明文件
 * - 不存在的目录或非目录路径会被静默跳过
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
 * @description 递归遍历目录树，对每个符合条件的文件调用
 * {@link parseModuleExports} 解析导出信息并添加到 modules 列表中。
 * 跳过 `node_modules`、隐藏目录、非目标扩展名文件和 `.d.ts` 文件。
 */
function walkDirectory(dir: string, modules: ScannedModule[]): void {
	const entries = fs.readdirSync(dir, { withFileTypes: true })

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)

		if (entry.isDirectory()) {
			// 跳过 node_modules 和隐藏目录
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
 * @returns 解析成功返回 {@link ScannedModule}，解析失败或无导出返回 `null`
 *
 * @description 使用正则表达式分析文件内容，提取命名导出和默认导出。
 *
 * **支持的导出语法：**
 * - `export function name()` — 函数导出
 * - `export async function name()` — 异步函数导出
 * - `export const/let/var name = ...` — 变量导出
 * - `export class name` — 类导出
 * - `export { name1, name2 }` — 列表导出
 * - `export { foo as bar }` — 重命名导出（使用别名 bar）
 * - `export { default as Name }` — 默认导出重命名（使用 Name）
 * - `export default function name()` — 默认函数导出
 * - `export default class name` — 默认类导出
 * - `export default expression` — 默认表达式导出
 * - `export type name` — TypeScript 类型导出
 * - `export interface name` — TypeScript 接口导出
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
				// 处理 export { name as alias } 或 export { default as Name }
				const parts = trimmed.split(/\s+as\s+/)
				// 如果有 as 别名，使用别名（最后一部分）
				// export { default as Name } → 使用 Name
				// export { foo as bar } → 使用 bar
				return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim()
			})
			for (const name of names) {
				// 注意：export { default as Name } 中 default 是原始名，Name 是别名
				// Name 是有效导出，不应被过滤
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

		// 如果没有任何导出，跳过此文件
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
 * 将扫描到的模块信息转换为 ResolvedImport 列表
 *
 * @param modules 扫描到的 {@link ScannedModule} 模块列表
 * @returns 解析后的 {@link ResolvedImport} 导入映射列表
 *
 * @description 转换规则：
 * - 每个命名导出生成一个 `isDefault: false` 的 {@link ResolvedImport}
 * - 默认导出生成一个 `isDefault: true` 的 {@link ResolvedImport}，
 *   使用导出名称作为标识符名称
 * - 模块路径使用文件的绝对路径
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
		// 命名导出
		for (const exportName of mod.exports) {
			result.push({
				module: mod.filePath,
				name: exportName,
				isDefault: false
			})
		}

		// 默认导出
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
