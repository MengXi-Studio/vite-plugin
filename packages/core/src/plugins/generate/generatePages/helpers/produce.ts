import fs from 'node:fs'
import path from 'node:path'
import { stripJsonComments } from '@/common/string'
import type { UniAppPagesJson } from '../types'
import type { GeneratePagesOptions, ScannedPage } from '../types'
import { scanPageFiles, buildScannedPage, orderMainPages } from './scanner'
import { buildTabBar } from './generator'
import { mergePagesJson } from './merger'

/** 页面生成阶段产出结果（内存数据，不写盘） */
export interface ProducePagesResult {
	/** 完整合并后的 pages.json 对象（含 globalStyle 等非页面字段） */
	pagesJson: UniAppPagesJson
	/** 主包页面列表 */
	mainPages: UniAppPagesJson['pages']
}

/**
 * 读取并解析现有 pages.json（兼容注释）
 *
 * @param pagesJsonPath - pages.json 绝对路径
 * @param onParseError - 解析失败时的回调（可输出警告日志）
 * @returns 解析结果；文件不存在或解析失败返回 null
 */
export function readExistingPagesJson(pagesJsonPath: string, onParseError?: (message: string) => void): UniAppPagesJson | null {
	if (!fs.existsSync(pagesJsonPath)) return null
	try {
		const content = fs.readFileSync(pagesJsonPath, 'utf-8')
		return JSON.parse(stripJsonComments(content)) as UniAppPagesJson
	} catch (error) {
		onParseError?.(`解析现有 pages.json 失败，将完全用生成内容替换: ${(error as Error).message}`)
		return null
	}
}

/**
 * 阶段一：扫描页面 + `<route-config>`，合并现有 pages.json，产出完整 pages 对象（不写盘）
 *
 * @param projectRoot - 项目根目录（绝对路径）
 * @param options - 页面生成参数（等价 generatePages 选项）
 * @param onParseError - 解析现有 pages.json 失败时的回调
 * @returns 合并后的 pages 对象与主包页面列表
 *
 * @description 复用 generatePages/helpers 的扫描/组装/合并函数。
 * 内存产出可直接写盘（generatePages），也可直传下一阶段（generateUni），
 * 避免「先写盘再读盘」的往返。
 */
export function producePages(projectRoot: string, options: GeneratePagesOptions, onParseError?: (message: string) => void): ProducePagesResult {
	const pagesJsonPath = path.resolve(projectRoot, options.pagesJsonPath!)
	const pagesJsonDir = path.dirname(pagesJsonPath)
	const pagesDir = path.resolve(projectRoot, options.pagesDir!)

	const pageOptions = {
		blockName: options.routeConfigBlock!,
		titleFallback: options.titleFallback!
	}
	const scanOptions = {
		includeExtensions: options.includeExtensions,
		excludePatterns: options.excludePatterns
	}

	const mainScanned = scanPageFiles(pagesDir, scanOptions)
		.map(file => buildScannedPage(file, { absDir: pagesJsonDir }, pageOptions))
		.filter((p): p is ScannedPage => p !== null)

	// 读取现有 pages.json（用于保留入口页顺序，并按既有字段合并）
	const existing = readExistingPagesJson(pagesJsonPath, onParseError)
	// 主包页面：固定入口页于首位，其余按路径稳定排序（入口页优先取配置，其次取现有 pages[0]）
	const entryPage = options.entryPage ?? existing?.pages?.[0]?.path
	const mainPages = orderMainPages(
		mainScanned.map(s => s.page),
		entryPage
	)

	// 分包页面
	let subPackages: NonNullable<UniAppPagesJson['subPackages']> | undefined
	const subPkgConfigs = options.subPackages ?? []
	if (subPkgConfigs.length > 0) {
		const built: NonNullable<UniAppPagesJson['subPackages']> = []
		for (const sub of subPkgConfigs) {
			const subDir = path.resolve(projectRoot, sub.dir)
			if (!fs.existsSync(subDir)) continue
			const subScanned = scanPageFiles(subDir, scanOptions)
				.map(file => buildScannedPage(file, { absDir: subDir }, pageOptions))
				.filter((p): p is ScannedPage => p !== null)
				.sort((a, b) => a.page.path.localeCompare(b.page.path))
			if (subScanned.length > 0) {
				built.push({ root: sub.root, pages: subScanned.map(s => s.page) })
			}
		}
		// 仅当至少一个分包生成成功时才输出 subPackages
		if (built.length > 0) subPackages = built
	}

	// tabBar（基于主包页面信息，含页面内 tab 覆盖）
	const tabBar = buildTabBar(mainScanned, options.tabBar)

	const pagesJson = mergePagesJson(existing, { pages: mainPages, subPackages, tabBar })

	return { pagesJson, mainPages }
}
