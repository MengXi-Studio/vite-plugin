import fs from 'node:fs'
import path from 'node:path'
import { stripJsonComments } from '@/common/string'
import type { UniAppPagesJson } from '../../types'
import { scanPageFiles, buildScannedPage, orderMainPages, buildTabBar, mergePagesJson } from '../../generatePages/helpers'
import type { GeneratePagesOptions, ScannedPage } from '../../generatePages/types'

/** 阶段一产出结果 */
export interface ProducePagesResult {
	/** 完整合并后的 pages.json 对象（含 globalStyle 等非页面字段） */
	pagesJson: UniAppPagesJson
	/** 主包页面列表 */
	mainPages: UniAppPagesJson['pages']
}

/** 读取并解析现有 pages.json（兼容注释，供合并保留非页面字段） */
function readExistingPagesJson(pagesJsonPath: string): UniAppPagesJson | null {
	if (!fs.existsSync(pagesJsonPath)) return null
	try {
		const content = fs.readFileSync(pagesJsonPath, 'utf-8')
		return JSON.parse(stripJsonComments(content)) as UniAppPagesJson
	} catch {
		return null
	}
}

/**
 * 阶段一：扫描页面 + `<route-config>`，合并现有 pages.json，产出完整 pages 对象（不写盘）
 *
 * @param projectRoot 项目根目录（绝对路径）
 * @param options 页面生成参数（等价 generatePages 选项）
 * @returns 合并后的 pages 对象与主包页面列表
 *
 * @description 复用 `generatePages/helpers` 的扫描/组装/合并函数，避免重复实现。
 * 内存产出供阶段二直接消费，避免「先写盘再读盘」的往返。
 */
export function producePages(projectRoot: string, options: GeneratePagesOptions): ProducePagesResult {
	const pagesJsonPath = path.resolve(projectRoot, options.pagesJsonPath!)
	const pagesJsonDir = path.dirname(pagesJsonPath)
	const pagesDir = path.resolve(projectRoot, options.pagesDir!)

	const pageOptions = { blockName: options.routeConfigBlock!, titleFallback: options.titleFallback! }
	const scanOptions = { includeExtensions: options.includeExtensions, excludePatterns: options.excludePatterns }

	const mainScanned = scanPageFiles(pagesDir, scanOptions)
		.map(file => buildScannedPage(file, { absDir: pagesJsonDir }, pageOptions))
		.filter((p): p is ScannedPage => p !== null)

	const existing = readExistingPagesJson(pagesJsonPath)
	const entryPage = options.entryPage ?? existing?.pages?.[0]?.path
	const mainPages = orderMainPages(
		mainScanned.map(s => s.page),
		entryPage
	)

	// 分包页面
	let subPackages: NonNullable<UniAppPagesJson['subPackages']> | undefined
	const built: NonNullable<UniAppPagesJson['subPackages']> = []
	for (const sub of options.subPackages ?? []) {
		const subDir = path.resolve(projectRoot, sub.dir)
		if (!fs.existsSync(subDir)) continue
		const subScanned = scanPageFiles(subDir, scanOptions)
			.map(file => buildScannedPage(file, { absDir: subDir }, pageOptions))
			.filter((p): p is ScannedPage => p !== null)
			.sort((a, b) => a.page.path.localeCompare(b.page.path))
		if (subScanned.length > 0) built.push({ root: sub.root, pages: subScanned.map(s => s.page) })
	}
	if (built.length > 0) subPackages = built

	// tabBar
	const tabBar = buildTabBar(mainScanned, options.tabBar)

	const pagesJson = mergePagesJson(existing, { pages: mainPages, subPackages, tabBar })

	return { pagesJson, mainPages }
}
