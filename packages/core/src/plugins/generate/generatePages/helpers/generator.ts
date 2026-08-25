import type { ScannedPage, TabBarTemplate, UniAppTabBarConfig } from '../types'
import { isTabPage } from './scanner'

/**
 * 组装 tabBar 配置（基于 isTab 标记归集 + 优先级模板）
 *
 * @param mainScanned 主包页面信息列表（tabBar 页面仅允许在主包）
 * @param template tabBar 模板
 * @returns 组装后的 tabBar 配置；未提供模板返回 undefined
 *
 * @description 将主包中所有标记了 `isTab: true` 的页面自动归集到 `list`，
 * 并合并模板中的颜色、图标等通用样式。图标与文本优先级从高到低：
 * 1. 页面内 `<route-config>.tab` 声明
 * 2. `template.overrides[pagePath]`
 * 3. `template.iconPath` / `selectedIconPath`（全局模板）
 * 4. 页面标题 / 文件名（作为 text 兜底）
 *
 * list 顺序按每项声明的 `order` 排序（越小越靠前，未声明者排在已声明之后），
 * `order` 仅用于排序，不写入输出。
 */
export function buildTabBar(mainScanned: ScannedPage[], template?: TabBarTemplate): UniAppTabBarConfig | undefined {
	if (!template) return undefined

	const { overrides, iconPath, selectedIconPath, ...staticFields } = template

	// 内部结构：附带 order 便于排序，最后剔除，不写入输出
	type TabItem = NonNullable<UniAppTabBarConfig['list']>[number] & { order?: number }

	const list = mainScanned
		.filter(({ page }) => isTabPage(page))
		.map<TabItem>(({ page, tab }) => {
			const local = tab
			const override = overrides?.[page.path]

			const text = local?.text ?? override?.text ?? page.style?.navigationBarTitleText ?? page.path.split('/').pop()
			const icon = local?.iconPath ?? override?.iconPath ?? iconPath
			const selectedIcon = local?.selectedIconPath ?? override?.selectedIconPath ?? selectedIconPath

			const item: TabItem = { pagePath: page.path }
			if (text) item.text = text
			if (icon) item.iconPath = icon
			if (selectedIcon) item.selectedIconPath = selectedIcon

			const order = local?.order ?? override?.order
			if (typeof order === 'number') item.order = order

			return item
		})
		.sort((a, b) => (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY))
		// 剔除排序权重，不写入 pages.json
		.map(({ order: _order, ...item }) => item)

	return { ...staticFields, list }
}

/**
 * 统计主包中的 tabBar 页面数量（供日志展示）
 *
 * @param mainScanned 主包页面信息列表
 * @returns tabBar 页面数量
 */
export function countTabPages(mainScanned: ScannedPage[]): number {
	return mainScanned.filter(({ page }) => isTabPage(page)).length
}
