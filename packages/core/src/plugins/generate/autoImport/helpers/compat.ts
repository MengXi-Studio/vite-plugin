import type { AutoImportOptions, ImportInline, ResolvedImport, ImportMapping } from '../types'

/**
 * 将旧版 ResolvedImport 转换为新的 ImportInline
 *
 * @param ri 旧版 ResolvedImport 对象
 * @returns 等价的 ImportInline 对象
 *
 * @description 桥接函数，用于在内部使用 ImportInline 时兼容旧版数据
 */
export function resolvedImportToInline(ri: ResolvedImport): ImportInline {
	return {
		name: ri.name,
		from: ri.module,
		isDefault: ri.isDefault
	}
}

/**
 * 将 ImportInline 转换为旧版 ResolvedImport（向后兼容）
 *
 * @param inline ImportInline 对象
 * @returns 等价的 ResolvedImport 对象
 *
 * @description 桥接函数，用于公共 API（getResolvedImports/getNameLookup）的返回值兼容
 */
export function inlineToResolvedImport(inline: ImportInline): ResolvedImport {
	return {
		module: inline.from,
		name: inline.as || inline.name,
		isDefault: inline.isDefault ?? false
	}
}

/**
 * 将旧版 ImportMapping 转换为 ImportInline 列表
 *
 * @param mapping 旧版 ImportMapping 对象
 * @returns 等价的 ImportInline 列表
 *
 * @description 兼容旧版 `{ module: 'vue', names: ['ref', 'reactive'], defaultImport: false }` 格式
 */
export function importMappingToInlines(mapping: ImportMapping): ImportInline[] {
	return mapping.names.map(name => ({
		name,
		from: mapping.module,
		isDefault: mapping.defaultImport ?? false
	}))
}

/**
 * 迁移旧版配置到新格式（原地修改）
 *
 * @param options 用户传入的配置选项
 *
 * @description 处理以下兼容场景：
 * 1. imports 为 Record<string, string[]> 但非数组 → 包裹为数组
 * 2. fileFilter 存在但 include/exclude 不存在 → 将 fileFilter 转为 include
 * 3. dts 为 true → 转为默认路径
 */
export function migrateLegacyOptions(options: AutoImportOptions): void {
	// 1. 处理 imports 为纯 Record 格式（非数组）
	if (options.imports && !Array.isArray(options.imports) && typeof options.imports === 'object') {
		// 检查是否为 Record<string, string[]> 格式（不含 from/module 字段）
		const keys = Object.keys(options.imports)
		if (keys.length > 0 && !('from' in options.imports) && !('module' in options.imports)) {
			// 这是 Record<string, string[]> 格式，包裹为数组
			options.imports = [options.imports as unknown as Record<string, Array<string | [string, string]>>]
		}
	}

	// 2. 处理 fileFilter → include 兼容
	if (options.fileFilter && !options.include) {
		options.include = [options.fileFilter]
	}

	// 3. dts: true 已有处理逻辑，无需额外转换
}
