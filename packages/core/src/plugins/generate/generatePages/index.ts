import type { ResolvedConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { BasePlugin, createPluginFactory } from '@/factory'
import { writeFileContent } from '@/common/fs'
import { stripJsonComments } from '@/common/string'
import type { GeneratePagesOptions, UniAppPagesJson, ScannedPage } from './types'
import { scanPageFiles, buildScannedPage, buildTabBar, mergePagesJson, orderMainPages } from './helpers'

/** 目录监听实例集合（fs.FSWatcher 使用 path/event 回调形式） */
type DirWatcher = {
	dir: string
	watcher: fs.FSWatcher
}

/**
 * 生成 uni-app pages.json 插件
 *
 * @class GeneratePagesPlugin
 * @extends {BasePlugin<GeneratePagesOptions>}
 *
 * @description 扫描 Vue 文件并动态生成/更新 uni-app 的 pages.json 中页面相关配置，
 * 彻底解放手动配置页面。通过在每个页面中声明 `<route-config>` 自定义块，
 * 插件自动提取标题、样式、元信息以及 tabBar 归属。
 *
 * **核心功能：**
 * - 自动扫描 `src/pages/**` 生成主包 `pages`
 * - 自动扫描分包目录（如 `src/pages-sub/**`）生成 `subPackages`
 * - 通过 `<route-config>` 自定义块提取页面配置
 * - 基于 `isTab` 标记 + 模板自动归集 `tabBar`
 * - 保留现有 pages.json 的非页面字段（globalStyle/condition 等）
 * - 开发模式监听页面目录变化自动重新生成
 *
 * @example
 * ```vue
 * <!-- src/pages/index/index.vue -->
 * <route-config>
 * {
 *   "title": "首页",
 *   "isTab": true
 * }
 * </route-config>
 * ```
 */
class GeneratePagesPlugin extends BasePlugin<GeneratePagesOptions> {
	/** 项目根目录 */
	private projectRoot: string = process.cwd()

	/** 目录监听器列表 */
	private watchers: DirWatcher[] = []

	/** 生成队列：串行执行生成任务，避免并发读改写竞态 */
	private generationQueue: Promise<void> = Promise.resolve()

	/**
	 * 将一次生成任务加入队列串行执行
	 *
	 * @description 监听目录在开发时可能高频触发（保存/新增/删除文件），
	 * 用 Promise 链串行化，确保同一时刻只有一个生成任务在跑，避免并 write 竞态。
	 */
	private runGenerate(): void {
		this.generationQueue = this.generationQueue
			.catch(() => {})
			.then(() => this.safeExecute(() => this.generatePagesJson(), '生成 pages.json'))
			.catch(() => {})
	}

	protected getPluginName(): string {
		return 'generate-pages'
	}

	protected getDefaultOptions(): Partial<GeneratePagesOptions> {
		return {
			pagesJsonPath: 'src/pages.json',
			pagesDir: 'src/pages',
			subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }],
			routeConfigBlock: 'route-config',
			titleFallback: 'filename',
			tabBar: undefined,
			includeExtensions: ['.vue'],
			excludePatterns: ['node_modules'],
			watch: true
		}
	}

	protected validateOptions(): void {
		this.validator
			.field('pagesJsonPath')
			.string()
			.field('pagesDir')
			.string()
			.field('routeConfigBlock')
			.string()
			.field('entryPage')
			.string()
			.field('titleFallback')
			.enum(['filename', 'none'])
			.field('watch')
			.boolean()
			.validate()
	}

	protected onConfigResolved(config: ResolvedConfig): void {
		super.onConfigResolved(config)
		this.projectRoot = config.root
		this.runGenerate()
		if (config.command === 'serve') {
			this.startWatching()
		}
	}

	protected destroy(): void {
		super.destroy()
		this.stopWatching()
	}

	/** 完整的 pages.json 生成流程 */
	private async generatePagesJson(): Promise<void> {
		// 1. 组装主包页面
		const pagesJsonPath = path.resolve(this.projectRoot, this.options.pagesJsonPath!)
		const pagesJsonDir = path.dirname(pagesJsonPath)
		const pagesDir = path.resolve(this.projectRoot, this.options.pagesDir!)

		const pageOptions = {
			blockName: this.options.routeConfigBlock!,
			titleFallback: this.options.titleFallback!
		}
		const scanOptions = {
			includeExtensions: this.options.includeExtensions,
			excludePatterns: this.options.excludePatterns
		}

		const mainScanned = scanPageFiles(pagesDir, scanOptions)
			.map(file => buildScannedPage(file, { absDir: pagesJsonDir }, pageOptions))
			.filter((p): p is ScannedPage => p !== null)
		// 读取现有 pages.json（用于保留入口页顺序，并按既有字段合并）
		const existing = this.readExistingPagesJson(pagesJsonPath)
		// 主包页面：固定入口页于首位，其余按路径稳定排序（入口页优先取配置，其次取现有 pages[0]）
		const entryPage = this.options.entryPage ?? existing?.pages?.[0]?.path
		const mainPages = orderMainPages(
			mainScanned.map(s => s.page),
			entryPage
		)

		// 2. 组装分包页面
		let subPackages: NonNullable<UniAppPagesJson['subPackages']> | undefined
		const subPkgConfigs = this.options.subPackages ?? []
		if (subPkgConfigs.length > 0) {
			const built: NonNullable<UniAppPagesJson['subPackages']> = []
			for (const sub of subPkgConfigs) {
				const subDir = path.resolve(this.projectRoot, sub.dir)
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

		// 3. 组装 tabBar（基于主包页面信息，含页面内 tab 覆盖）
		const tabBar = buildTabBar(mainScanned, this.options.tabBar)

		// 4. 合并（existing 已在组装主包时读取）
		const merged = mergePagesJson(existing, { pages: mainPages, subPackages, tabBar })

		// 5. 写入（保持 JSON 缩进风格；先确保目录存在，支持首次生成）
		const content = JSON.stringify(merged, null, '\t')
		await fs.promises.mkdir(path.dirname(pagesJsonPath), { recursive: true })
		await writeFileContent(pagesJsonPath, content + '\n')

		this.logger.success(`pages.json 已生成: ${pagesJsonPath}`)
		this.logger.info(`完成: 主包 ${mainPages.length} 页, 分包 ${subPackages?.reduce((n, s) => n + s.pages.length, 0) ?? 0} 页, tabBar ${tabBar?.list?.length ?? 0} 项`)
	}

	/** 读取并解析现有 pages.json（用写文件的同一方式兼容注释） */
	private readExistingPagesJson(pagesJsonPath: string): UniAppPagesJson | null {
		if (!fs.existsSync(pagesJsonPath)) return null
		try {
			const content = fs.readFileSync(pagesJsonPath, 'utf-8')
			return JSON.parse(stripJsonComments(content)) as UniAppPagesJson
		} catch (error) {
			this.logger.warn(`解析现有 pages.json 失败，将完全用生成内容替换: ${(error as Error).message}`)
			return null
		}
	}

	/** 启动页面目录监听 */
	private startWatching(): void {
		if (!this.options.watch) return

		const dirs = this.collectWatchDirs()
		for (const dir of dirs) {
			if (!fs.existsSync(dir)) continue
			// mac/Linux 上 fs.watch 支持 recursive；不支持的平台会抛错，需兜底避免插件崩溃。
			// 生成任务经 runGenerate 串行化，避免变更高频触发时并发读改写。
			let watcher: fs.FSWatcher
			try {
				watcher = fs.watch(dir, { recursive: true }, () => {
					this.logger.info('检测到页面文件变化，重新生成 pages.json...')
					this.runGenerate()
				})
			} catch (error) {
				this.logger.warn(`监听目录失败（可能不支持 recursive），跳过: ${dir} - ${(error as Error).message}`)
				continue
			}
			this.watchers.push({ dir, watcher })
		}
		if (this.watchers.length > 0) {
			this.logger.info(`正在监听页面目录: ${dirs.join(', ')}`)
		}
	}

	/** 收集需要监听的目录（主包目录 + 存在的分包目录） */
	private collectWatchDirs(): string[] {
		const dirs = [path.resolve(this.projectRoot, this.options.pagesDir!)]
		for (const sub of this.options.subPackages ?? []) {
			const subDir = path.resolve(this.projectRoot, sub.dir)
			if (fs.existsSync(subDir)) dirs.push(subDir)
		}
		return dirs
	}

	/** 停止所有目录监听 */
	private stopWatching(): void {
		for (const { watcher } of this.watchers) {
			try {
				watcher.close()
			} catch {
				// 忽略关闭异常
			}
		}
		this.watchers = []
	}
}

/**
 * 生成 uni-app pages.json 插件
 *
 * 扫描 Vue 文件并动态生成/更新 uni-app 的 pages.json 页面相关配置，
 * 配合 `<route-config>` 自定义块彻底解放手动配置页面。
 *
 * @example
 * ```typescript
 * // 基本用法：扫描 src/pages + src/pages-sub，自动生成 pages/subPackages
 * generatePages()
 *
 * // 自定义分包与 tabBar 模板
 * generatePages({
 *   pagesDir: 'src/pages',
 *   subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }],
 *   tabBar: {
 *     color: '#999999',
 *     selectedColor: '#42b883',
 *     iconPath: 'static/tab.png',
 *     selectedIconPath: 'static/tab-active.png',
 *   },
 * })
 * ```
 */
export const generatePages = createPluginFactory(GeneratePagesPlugin)
export * from './types'
