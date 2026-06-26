import type { ResolvedConfig } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { GenerateRouterOptions, UniAppPagesJson, RouteConfig } from './types'
import { stripJsonComments } from '@/common/string'
import { generateRouterDtsContent, parsePagesJson, mergeRoutes, generateFileContent, extractExistingRawRoutes, extractExistingRoutes } from './helpers'
import { writeFileContent, shouldUpdateFileContent } from '@/common/fs'
import { resolve } from 'path'
import { existsSync, watch as fsWatch, promises as fsp } from 'fs'

class GenerateRouterPlugin extends BasePlugin<GenerateRouterOptions> {
	private projectRoot: string = process.cwd()
	private watcher: ReturnType<typeof fsWatch> | null = null

	protected getPluginName(): string {
		return 'generate-router'
	}

	protected getDefaultOptions(): Partial<GenerateRouterOptions> {
		return {
			pagesJsonPath: 'src/pages.json',
			outputPath: 'src/router.config.ts',
			outputFormat: 'ts',
			nameStrategy: 'camelCase',
			includeSubPackages: true,
			watch: true,
			exportTypes: true,
			preserveRouteChanges: true,
			metaMapping: {
				navigationBarTitleText: 'title',
				requireAuth: 'requireAuth'
			},
			dts: false,
			headerTemplate: false,
			customFields: {}
		}
	}

	protected validateOptions(): void {
		this.validator.field('pagesJsonPath').string().field('outputPath').string().field('outputFormat').enum(['ts', 'js']).field('nameStrategy').enum(['path', 'camelCase', 'pascalCase', 'custom']).validate()

		if (this.options.nameStrategy === 'custom' && !this.options.customNameGenerator) {
			throw new Error('当 nameStrategy 为 custom 时，必须提供 customNameGenerator')
		}
	}

	protected onConfigResolved(config: ResolvedConfig): void {
		super.onConfigResolved(config)
		this.projectRoot = config.root
		this.safeExecute(() => this.generateRouterConfig(), '生成路由配置')
		if (config.command === 'serve') {
			this.startWatching()
		}
	}

	protected destroy(): void {
		super.destroy()
		this.stopWatching()
	}

	/** 完整的路由配置文件生成流程 */
	private async generateRouterConfig(): Promise<void> {
		const pagesJson = await this.readPagesJson()
		if (!pagesJson) return

		// 解析 pages.json 为路由配置
		const { routes } = parsePagesJson(pagesJson, this.options)

		// 合并用户修改
		let existingRawTexts: Map<string, string> | undefined
		const outputPath = resolve(this.projectRoot, this.options.outputPath!)

		if (this.options.preserveRouteChanges && existsSync(outputPath)) {
			try {
				const existingContent = await fsp.readFile(outputPath, 'utf-8')
				const existingRoutesMap = extractExistingRoutes(existingContent)
				existingRawTexts = extractExistingRawRoutes(existingContent)
				if (existingRoutesMap.size > 0) {
					const merged = mergeRoutes(routes, existingRoutesMap)
					routes.splice(0, routes.length, ...merged)
					this.logger.info('已合并用户对路由配置的修改')
				}
			} catch {
				// 读取失败时忽略，继续生成新文件
			}
		}

		// 生成并写入文件
		const content = generateFileContent(routes, this.options, existingRawTexts)
		await writeFileContent(outputPath, content)

		this.logger.success(`路由配置文件已生成: ${outputPath}`)
		this.logger.info(`共生成 ${routes.length} 条路由配置`)

		await this.generateDtsFile(routes)
	}

	/** 读取并解析 pages.json */
	private async readPagesJson(): Promise<UniAppPagesJson | null> {
		const pagesJsonPath = resolve(this.projectRoot, this.options.pagesJsonPath!)

		if (!existsSync(pagesJsonPath)) {
			this.logger.warn(`pages.json 文件不存在: ${pagesJsonPath}`)
			return null
		}

		try {
			const content = await fsp.readFile(pagesJsonPath, 'utf-8')
			return JSON.parse(stripJsonComments(content)) as UniAppPagesJson
		} catch (error) {
			this.logger.error(`解析 pages.json 失败: ${(error as Error).message}`)
			return null
		}
	}

	/** 生成路由类型声明文件 */
	private async generateDtsFile(routes: RouteConfig[]): Promise<void> {
		if (!this.options.dts) return

		const dtsPath = resolve(this.projectRoot, typeof this.options.dts === 'string' ? this.options.dts : 'src/router.d.ts')
		const content = generateRouterDtsContent(routes)

		if (!shouldUpdateFileContent(dtsPath, content)) return

		await writeFileContent(dtsPath, content)
		this.logger.success(`路由类型声明文件已生成: ${dtsPath}`)
	}

	/** 启动 pages.json 文件监听 */
	private startWatching(): void {
		if (!this.options.watch) return

		const pagesJsonPath = resolve(this.projectRoot, this.options.pagesJsonPath!)
		if (!existsSync(pagesJsonPath)) return

		this.watcher = fsWatch(pagesJsonPath, async eventType => {
			if (eventType === 'change') {
				this.logger.info('检测到 pages.json 变化，重新生成路由配置...')
				await this.safeExecute(() => this.generateRouterConfig(), '重新生成路由配置')
			}
		})

		this.logger.info(`正在监听 pages.json 变化: ${pagesJsonPath}`)
	}

	/** 停止 pages.json 文件监听 */
	private stopWatching(): void {
		if (this.watcher) {
			this.watcher.close()
			this.watcher = null
		}
	}
}

/**
 * 生成路由配置插件
 *
 * 读取 uni-app 项目的 pages.json 文件，自动生成路由配置文件。
 * 支持主包和子包页面、tabBar 自动识别、多种命名策略、自定义元信息映射、
 * 开发模式自动监听 pages.json 变化。
 *
 * @example
 * ```typescript
 * generateRouter()
 * generateRouter({ pagesJsonPath: 'pages.json' })
 * generateRouter({ outputFormat: 'js', outputPath: 'src/router.config.js' })
 * generateRouter({ nameStrategy: 'pascalCase' })
 * generateRouter({ nameStrategy: 'custom', customNameGenerator: (path) => `route_${path.replace(/\//g, '_')}` })
 * generateRouter({ metaMapping: { navigationBarTitleText: 'title', requireAuth: 'requireAuth' } })
 * generateRouter({ dts: true })
 * generateRouter({ dts: 'src/types/router.d.ts' })
 * ```
 */
export const generateRouter = createPluginFactory(GenerateRouterPlugin)
export * from './types'
