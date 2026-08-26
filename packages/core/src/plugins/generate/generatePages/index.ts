import type { ResolvedConfig, Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { BasePlugin, createPluginFactory } from '@/factory'
import { DirectoryWatcher, writeFileContent } from '@/common/fs'
import { TaskQueue } from '@/common/concurrency'
import type { GeneratePagesOptions } from './types'
import { producePages, stripDefineUniPageCalls, DEFINE_UNI_PAGE } from './helpers'

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

	/** 目录监听器 */
	private watcher: DirectoryWatcher | null = null

	/** 生成队列：串行执行生成任务，避免并发读改写竞态 */
	private queue: TaskQueue = new TaskQueue()

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

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @param plugin Vite 插件对象
	 * @description 拦截 `<route-config>` 自定义块产生的虚拟模块请求
	 * （如 `xxx.vue?vue&type=route-config&index=0`），返回空模块以避免
	 * 被 Vue 插件当作 JavaScript 源码解析导致构建失败；同时移除 Vue SFC
	 * script 模块中的 `defineUniPage` 宏调用（宏已在扫描时消费，运行时
	 * 不应保留调用，否则 `defineUniPage` 未定义导致 ReferenceError）。
	 */
	protected addPluginHooks(plugin: Plugin): void {
		this.registerHook(
			plugin,
			'transform',
			(code: string, id: string) => {
				// 1. route-config 自定义块虚拟模块 → 空模块
				if (this.isRouteConfigRequest(id)) {
					return { code: 'export default {}', map: null }
				}
				// 2. Vue SFC script 模块 → 移除 defineUniPage 宏调用
				if (this.isVueScriptRequest(id) && code.includes(DEFINE_UNI_PAGE)) {
					const stripped = stripDefineUniPageCalls(code)
					if (stripped !== code) {
						return { code: stripped, map: null }
					}
				}
				return null
			},
			'transform route-config 自定义块与 defineUniPage 宏'
		)
	}

	/** 判断请求 id 是否为当前自定义块（如 route-config）的虚拟模块请求 */
	private isRouteConfigRequest(id: string): boolean {
		if (!id.includes('?vue')) return false
		const match = id.match(/[?&]type=([^&]+)/)
		return match?.[1] === this.getRouteConfigBlockName()
	}

	/** 判断请求 id 是否为 Vue SFC 的 script 子模块（如 ?vue&type=script&setup=true） */
	private isVueScriptRequest(id: string): boolean {
		return id.includes('.vue') && /[?&]type=script/.test(id)
	}

	/** 解析页面配置自定义块名称（默认 route-config） */
	private getRouteConfigBlockName(): string {
		return this.options.routeConfigBlock ?? 'route-config'
	}

	/**
	 * 将一次生成任务加入队列串行执行
	 *
	 * @description 监听目录在开发时可能高频触发（保存/新增/删除文件），
	 * 用串行队列确保同一时刻只有一个生成任务在跑，避免并发读写竞态。
	 */
	private runGenerate(): void {
		this.queue.run(() => this.safeExecute(() => this.generatePagesJson(), '生成 pages.json') as Promise<void>).catch(() => {})
	}

	/** 完整的 pages.json 生成流程 */
	private async generatePagesJson(): Promise<void> {
		// 复用 producePages 完成扫描/组装/合并（内存产出）
		const pagesJsonPath = path.resolve(this.projectRoot, this.options.pagesJsonPath!)
		const { pagesJson, mainPages } = producePages(this.projectRoot, this.options, message => this.logger.warn(message))
		const subPackages = pagesJson.subPackages
		const tabBar = pagesJson.tabBar

		// 写入（保持 JSON 缩进风格；先确保目录存在，支持首次生成）
		const content = JSON.stringify(pagesJson, null, '\t')
		await fs.promises.mkdir(path.dirname(pagesJsonPath), { recursive: true })
		await writeFileContent(pagesJsonPath, content + '\n')

		this.logger.success(`pages.json 已生成: ${pagesJsonPath}`)
		this.logger.info(`完成: 主包 ${mainPages.length} 页, 分包 ${subPackages?.reduce((n, s) => n + s.pages.length, 0) ?? 0} 页, tabBar ${tabBar?.list?.length ?? 0} 项`)
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

	/** 启动页面目录监听 */
	private startWatching(): void {
		if (!this.options.watch) return

		this.watcher = new DirectoryWatcher({
			dirs: this.collectWatchDirs(),
			onChange: () => {
				this.logger.info('检测到页面文件变化，重新生成 pages.json...')
				this.runGenerate()
			},
			logger: this.logger,
			label: '页面目录'
		})
		this.watcher.start()
	}

	/** 停止所有目录监听 */
	private stopWatching(): void {
		this.watcher?.stop()
		this.watcher = null
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
