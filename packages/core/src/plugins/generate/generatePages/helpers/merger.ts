import type { UniAppPagesJson } from '../types'

/** 生成的页面相关配置片段 */
export interface GeneratedPagesInfo {
	pages: UniAppPagesJson['pages']
	subPackages?: UniAppPagesJson['subPackages']
	tabBar?: UniAppPagesJson['tabBar']
}

/**
 * 将生成的页面配置合并进现有 pages.json
 *
 * @param existing 现有 pages.json（可能为 null）
 * @param generated 生成的页面部分配置
 * @returns 合并后的完整 pages.json
 *
 * @description 采用「仅生成页面部分，其余保留」策略：
 * - 始终覆盖 `pages`（主包页面）
 * - 有分包配置时覆盖 `subPackages`，否则保留现有（或保留原字段）
 * - 提供 tabBar 模板时覆盖 `tabBar`，否则保留现有
 * - `globalStyle`、`condition`、`easycom` 等其他字段原样保留
 *
 * 若 tabBar/subPackages 视为「自动接管」，而现有数组中存在用户手动字段，
 * 该策略会整体替换——这正是自动生成插件的搬缝所在，交由配置显式控制。
 */
export function mergePagesJson(existing: UniAppPagesJson | null, generated: GeneratedPagesInfo): UniAppPagesJson {
	const result: UniAppPagesJson = existing ? { ...existing } : { pages: [] }

	// 主包页面始终由生成结果接管
	result.pages = generated.pages

	// 分包：仅当本次生成了分包时才覆盖，否则保留现有
	if (generated.subPackages) {
		result.subPackages = generated.subPackages
	}

	// tabBar：仅当本次生成了 tabBar 时才覆盖，否则保留现有
	if (generated.tabBar) {
		result.tabBar = generated.tabBar
	}

	return result
}
