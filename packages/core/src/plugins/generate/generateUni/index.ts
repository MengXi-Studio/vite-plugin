import type { ResolvedConfig, Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { BasePlugin, createPluginFactory } from '@/factory'
import { writeFileContent } from '@/common/fs'
import type { GenerateUniOptions } from './types'
import type { GeneratePagesOptions } from '../generatePages/types'
import { producePages, generateRouterFromPages } from './helpers'

/**
 * 合并插件：一键完成「页面配置生成 + 路由配置生成」
 *
 * @class GenerateUniPlugin
 * @extends {BasePlugin<GenerateUniOptions>}
 *
 * @description 将 `generatePages`（扫描 Vue 文件 + `<route-config>` 生成 pages.json）与
 * `generateRouter`（基于 pages.json 生成路由配置）编排为一条流水线：
 * - 阶段一：扫描页面 + 合并现有 pages.json，产出内存 pages 数据并写入 pages.json（供 uni() 使用）
 * - 阶段二：直接消费阶段一的内存 pages 数据生成路由配置文件（+ 可选 dts），不重复读盘
 *
 * 现有 `generatePages` / `generateRouter` 两个插件保持不变，可继续独立使用。
 *
 * **生命周期钩子：**
 * - `configResolved`：执行整条流水线（阶段一 → 阶段二）
 * - 开发模式监听页面目录变化，串行重跑流水线
 */
class GenerateUniPlugin extends BasePlugin<GenerateUniOptions> {
	/** 项目根目录 */
	private projectRoot: string = process.cwd()

	/** 目录监听器列表 */
	private watchers: fs.FSWatcher[] = []

	/** 串行生成队列：避免 watch 高频触发时并发读改写 pages.json / router */
	private pipelineQueue: Promise<void> = Promise.resolve()

	protected getPluginName(): string {
		return 'generate-uni'
	}

	protected getDefaultOptions(): Partial<GenerateUniOptions> {
		return {
			pagesJsonPath: 'src/pages.json',
			watch: true,
			pages: {
				pagesDir: 'src/pages',
				subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }]
			},
			router: {
				outputPath: 'src/router.config.ts'
			}
		}
	}

	protected validateOptions(): void {
		this.validator
			.field('pagesJsonPath')
			.string()
			.field('watch')
			.boolean()
			.field('pages')
			.custom(v => v === undefined || (typeof v === 'object' && v !== null), 'pages 必须为对象')
			.field('router')
			.custom(v => v === undefined || (typeof v === 'object' && v !== null), 'router 必须为对象')
			.validate()
	}

	protected onConfigResolved(config: ResolvedConfig): void {
		super.onConfigResolved(config)
		this.projectRoot = config.root
		this.runPipeline()
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
	 * 被 Vue 插件当作 JavaScript 源码解析导致构建失败。
	 * 块内容已由阶段一扫描时解析，无需在模块系统中保留。
	 */
	protected addPluginHooks(plugin: Plugin): void {
		this.registerHook(
			plugin,
			'transform',
			(_code: string, id: string) => {
				if (!this.isRouteConfigRequest(id)) return null
				return { code: 'export default {}', map: null }
			},
			'transform route-config 自定义块'
		)
	}

	/** 判断请求 id 是否为当前自定义块（如 route-config）的虚拟模块请求 */
	private isRouteConfigRequest(id: string): boolean {
		if (!id.includes('vue')) return false
		const match = id.match(/[?&]type=([^&]+)/)
		return match?.[1] === this.getRouteConfigBlockName()
	}

	/** 解析页面配置自定义块名称（默认 route-config） */
	private getRouteConfigBlockName(): string {
		return this.options.pages?.routeConfigBlock ?? 'route-config'
	}

	/** 将一次流水线执行加入队列串行执行 */
	private runPipeline(): void {
		this.pipelineQueue = this.pipelineQueue
			.catch(() => {})
			.then(() => this.safeExecute(() => this.run(), 'generateUni 执行'))
			.catch(() => {})
	}

	/** 阶段一（内存 pages）→ 写 pages.json → 阶段二（路由）→ 写 router */
	private async run(): Promise<void> {
		// 合并顶层共用配置与 pages 阶段专有参数
		const pagesOptions: GeneratePagesOptions = {
			...this.options,
			...this.options.pages,
			pagesJsonPath: this.options.pagesJsonPath!
		}
		const routerOptions = this.options.router ?? {}

		// 阶段一：扫描页面，产出内存 pages 对象
		const { pagesJson } = producePages(this.projectRoot, pagesOptions)
		const pagesJsonPath = path.resolve(this.projectRoot, this.options.pagesJsonPath!)

		// 写入 pages.json（uni() 与构建流程需要文件）
		await fs.promises.mkdir(path.dirname(pagesJsonPath), { recursive: true })
		await writeFileContent(pagesJsonPath, JSON.stringify(pagesJson, null, '\t') + '\n')

		// 阶段二：内存直传，生成路由配置
		await generateRouterFromPages(this.projectRoot, pagesJson, routerOptions)

		const mainCount = pagesJson.pages?.length ?? 0
		this.logger.success(`pages.json + router.config 已生成`)
		this.logger.info(`完成: 主包 ${mainCount} 页, tabBar ${pagesJson.tabBar?.list?.length ?? 0} 项`)
	}

	/** 启动页面目录监听（主包目录 + 存在的分包目录） */
	private startWatching(): void {
		if (!this.options.watch) return
		const dirs = this.collectWatchDirs()
		for (const dir of dirs) {
			if (!fs.existsSync(dir)) continue
			try {
				const watcher = fs.watch(dir, { recursive: true }, () => {
					this.logger.info('检测到页面文件变化，重新生成 pages.json + router...')
					this.runPipeline()
				})
				this.watchers.push(watcher)
			} catch (error) {
				this.logger.warn(`监听目录失败（可能不支持 recursive），跳过: ${dir} - ${(error as Error).message}`)
			}
		}
		if (this.watchers.length > 0) {
			this.logger.info(`正在监听页面目录: ${dirs.join(', ')}`)
		}
	}

	/** 收集需要监听的目录 */
	private collectWatchDirs(): string[] {
		const dirs = [path.resolve(this.projectRoot, this.options.pages?.pagesDir ?? 'src/pages')]
		for (const sub of this.options.pages?.subPackages ?? []) {
			const subDir = path.resolve(this.projectRoot, sub.dir)
			if (fs.existsSync(subDir)) dirs.push(subDir)
		}
		return dirs
	}

	/** 停止所有目录监听 */
	private stopWatching(): void {
		for (const watcher of this.watchers) {
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
 * 一键完成「页面配置生成 + 路由配置生成」的合并插件
 *
 * 编排 `generatePages`（扫描页面 → pages.json）与 `generateRouter`（pages.json → 路由配置），
 * 以内存 pages 数据串联，避免先写盘再读盘。原有两个插件保持不变。
 *
 * @example
 * ```typescript
 * generateUni({
 *   pagesJsonPath: 'src/pages.json',
 *   pages: {
 *     pagesDir: 'src/pages',
 *     subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }],
 *     entryPage: 'pages/index/index',
 *     tabBar: { color: '#999999', selectedColor: '#42b883' }
 *   },
 *   router: {
 *     outputPath: 'src/router.config.ts',
 *     nameStrategy: 'camelCase',
 *     dts: 'src/router.d.ts'
 *   }
 * })
 * ```
 */
export const generateUni = createPluginFactory(GenerateUniPlugin)
export * from './types'
