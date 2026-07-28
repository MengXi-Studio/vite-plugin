import type { ImportInline, ImportsConfig, InlineImportConfig } from '../types'
import { findPreset, expandPreset } from './presets'
import { resolveWildcardExports } from './scanner'

/**
 * 将用户配置的 imports 解析为统一的 ImportInline 列表
 *
 * @param imports 导入映射配置
 * @param root 项目根目录，用于解析通配符和包路径
 * @returns 解析后的 ImportInline 列表
 *
 * @description 支持多种配置格式混合使用，统一转换为 ImportInline[]：
 * 1. 预设字符串：`'vue'` → 查找内置预设 → 展开
 * 2. 简写格式：`{ vue: ['ref', ['useFetch', 'useMyFetch']] }` → 转换
 * 3. 类型导入 InlineImportConfig → 标记 type 后转换
 * 4. 通配符 `'*'` → 从 .d.ts 解析模块全部导出
 * 5. 命名空间导入 `['*', 'alias']` → { name: '*', from: mod, as: 'alias' }
 * 6. export assignment 导入 `['=', 'alias']` → { name: '=', from: mod, as: 'alias' }
 */
export function resolveImportsConfig(imports: ImportsConfig | Record<string, Array<string | [string, string]>> | undefined, root: string): ImportInline[] {
	if (!imports) return []

	const result: ImportInline[] = []
	const items = Array.isArray(imports) ? imports : [imports]

	for (const item of items) {
		if (typeof item === 'string') {
			// 预设字符串
			resolvePresetString(item, root, result)
		} else if (Array.isArray(item)) {
			// 不应出现数组中的数组，跳过
			continue
		} else if (typeof item === 'object' && item !== null) {
			if ('from' in item && 'imports' in item) {
				// InlineImportConfig 格式（含 type 标记）
				resolveInlineImportConfig(item as InlineImportConfig, root, result)
			} else {
				// Record<string, Array<string | [string, string]>> 格式
				resolveRecordFormat(item as Record<string, Array<string | [string, string]>>, root, result)
			}
		}
	}

	return result
}

/**
 * 解析预设字符串
 *
 * @param name 预设名称
 * @param root 项目根目录
 * @param result 收集结果的数组
 */
function resolvePresetString(name: string, root: string, result: ImportInline[]): void {
	const preset = findPreset(name)
	if (preset) {
		result.push(...expandPreset(preset))
	} else {
		// 未找到内置预设，尝试作为包名自动发现导出
		const exports = resolveWildcardExports(name, root)
		if (exports.length > 0) {
			for (const exp of exports) {
				result.push({ name: exp, from: name })
			}
		}
		// 如果也没发现导出，静默跳过（后续 resolver 可能补充）
	}
}

/**
 * 解析 InlineImportConfig 格式（含 type 标记）
 *
 * @param config InlineImportConfig 对象
 * @param root 项目根目录
 * @param result 收集结果的数组
 */
function resolveInlineImportConfig(config: InlineImportConfig, root: string, result: ImportInline[]): void {
	for (const item of config.imports) {
		if (typeof item === 'string') {
			if (item === '*') {
				// 通配符（展开所有导出）
				const exports = resolveWildcardExports(config.from, root)
				for (const name of exports) {
					result.push({
						name,
						from: config.from,
						type: config.type
					})
				}
			} else if (item === 'default') {
				// 默认导出
				result.push({
					name: 'default',
					from: config.from,
					as: config.from,
					type: config.type
				})
			} else {
				result.push({
					name: item,
					from: config.from,
					type: config.type
				})
			}
		} else {
			// [name, alias] 元组
			if (item[0] === '*') {
				// 命名空间导入: import * as alias from 'mod'
				result.push({ name: '*', from: config.from, as: item[1], type: config.type })
			} else if (item[0] === '=') {
				// export assignment 导入: import alias from 'mod'
				result.push({ name: '=', from: config.from, as: item[1], type: config.type })
			} else {
				result.push({
					name: item[0],
					from: config.from,
					as: item[1],
					type: config.type
				})
			}
		}
	}
}

/**
 * 解析 Record<string, Array<string | [string, string]>> 格式
 *
 * @param record Record 格式配置
 * @param root 项目根目录
 * @param result 收集结果的数组
 *
 * @description 处理简写格式如 `{ vue: ['ref', ['useFetch', 'useMyFetch']] }`
 * 以及特殊格式 `{ lodash: [['*', '_']], webextension: [['=', 'browser']] }`
 */
function resolveRecordFormat(record: Record<string, Array<string | [string, string]>>, root: string, result: ImportInline[]): void {
	for (const [mod, names] of Object.entries(record)) {
		for (const item of names) {
			if (typeof item === 'string') {
				if (item === '*') {
					// 通配符
					const exports = resolveWildcardExports(mod, root)
					for (const name of exports) {
						result.push({ name, from: mod })
					}
				} else if (item === 'default') {
					// 默认导出：import { default as mod } from 'mod'
					result.push({ name: 'default', from: mod, as: mod })
				} else {
					result.push({ name: item, from: mod })
				}
			} else {
				// [name, alias] 元组
				if (item[0] === '*') {
					// 命名空间导入: import * as alias from 'mod'
					result.push({ name: '*', from: mod, as: item[1] })
				} else if (item[0] === '=') {
					// export assignment 导入: import alias from 'mod'
					result.push({ name: '=', from: mod, as: item[1] })
				} else if (item[0] === 'default') {
					// import { default as alias } from 'mod'
					result.push({ name: 'default', from: mod, as: item[1] })
				} else {
					result.push({ name: item[0], from: mod, as: item[1] })
				}
			}
		}
	}
}

/**
 * 构建 nameLookup 映射表
 *
 * @param imports 解析后的 ImportInline 列表
 * @returns 以标识符名称为键、ImportInline 为值的 Map
 *
 * @description 用于在代码转换时快速查找需要自动导入的标识符。
 * 同名标识符出现在多个模块中时，后出现的会覆盖先出现的（配置靠后优先级更高）。
 * 别名(as)也会注册到映射表中。
 * 命名空间导入（name: '*'）和 export assignment 导入（name: '='）仅注册别名。
 */
export function buildNameLookup(imports: ImportInline[]): Map<string, ImportInline> {
	const lookup = new Map<string, ImportInline>()

	for (const item of imports) {
		if (item.name === '*' || item.name === '=') {
			// 命名空间导入和 export assignment 仅通过别名查找
			if (item.as) {
				lookup.set(item.as, item)
			}
		} else {
			// 注册原名
			lookup.set(item.name, item)
			// 如果有别名，也注册别名（别名指向同一个导入项）
			if (item.as) {
				lookup.set(item.as, item)
			}
		}
	}

	return lookup
}
