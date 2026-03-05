import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { GenerateRouterOptions, UniAppPagesJson, RouteConfig, UniAppPageConfig, RouteMeta } from './types'
import { writeFileContent, readFileSync, toCamelCase, toPascalCase, stripJsonComments } from '@/common'
import { resolve } from 'path'
import { existsSync, watch as fsWatch } from 'fs'

/**
 * 生成路由配置插件类
 *
 * @class GenerateRouterPlugin
 * @extends {BasePlugin<GenerateRouterOptions>}
 * @description 该插件会读取 uni-app 项目的 pages.json 文件，自动生成路由配置文件
 */
class GenerateRouterPlugin extends BasePlugin<GenerateRouterOptions> {
	/**
	 * 项目根目录
	 */
	private projectRoot: string = process.cwd()

	/**
	 * tabBar 页面路径集合
	 */
	private tabBarPages: Set<string> = new Set()

	/**
	 * 文件监听器
	 */
	private watcher: ReturnType<typeof fsWatch> | null = null

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
			}
		}
	}

	protected validateOptions(): void {
		this.validator
			.field('pagesJsonPath')
			.string()
			.field('outputPath')
			.string()
			.field('outputFormat')
			.custom(val => !val || ['ts', 'js'].includes(val), 'outputFormat 必须是 ts 或 js')
			.field('nameStrategy')
			.custom(val => !val || ['path', 'camelCase', 'pascalCase', 'custom'].includes(val), 'nameStrategy 必须是 path, camelCase, pascalCase 或 custom')
			.validate()

		// 如果使用自定义策略，必须提供生成函数
		if (this.options.nameStrategy === 'custom' && !this.options.customNameGenerator) {
			throw new Error('当 nameStrategy 为 custom 时，必须提供 customNameGenerator')
		}
	}

	protected getPluginName(): string {
		return 'generate-router'
	}

	/**
	 * 根据策略生成路由名称
	 */
	private generateRouteName(path: string): string {
		switch (this.options.nameStrategy) {
			case 'path':
				return path.replace(/\//g, '_').replace(/^_/, '')
			case 'camelCase':
				return toCamelCase(path)
			case 'pascalCase':
				return toPascalCase(path)
			case 'custom':
				return this.options.customNameGenerator!(path)
			default:
				return toCamelCase(path)
		}
	}

	/**
	 * 从页面配置中提取路由元信息
	 */
	private extractMeta(pageConfig: UniAppPageConfig, fullPath: string): RouteMeta {
		const meta: RouteMeta = {}
		const style = pageConfig.style || {}
		const mapping = this.options.metaMapping || {}

		// 根据映射关系提取元信息
		for (const [sourceKey, targetKey] of Object.entries(mapping)) {
			if (style[sourceKey] !== undefined) {
				meta[targetKey] = style[sourceKey]
			}
		}

		// 检查是否为 tabBar 页面
		if (this.tabBarPages.has(fullPath)) {
			meta.isTab = true
		}

		return meta
	}

	/**
	 * 解析单个页面配置为路由配置
	 */
	private parsePageToRoute(pageConfig: UniAppPageConfig, rootPath: string = ''): RouteConfig {
		const fullPath = rootPath ? `/${rootPath}/${pageConfig.path}` : `/${pageConfig.path}`
		const name = this.generateRouteName(fullPath)
		const meta = this.extractMeta(pageConfig, fullPath.replace(/^\//, ''))

		const route: RouteConfig = {
			path: fullPath,
			name
		}

		// 只有当 meta 有内容时才添加
		if (Object.keys(meta).length > 0) {
			route.meta = meta
		}

		return route
	}

	/**
	 * 解析 pages.json 并生成路由配置数组
	 */
	private parsePagesJson(pagesJson: UniAppPagesJson): RouteConfig[] {
		const routes: RouteConfig[] = []

		// 校验 pages 数组
		if (!pagesJson.pages || !Array.isArray(pagesJson.pages) || pagesJson.pages.length === 0) {
			this.logger.warn('pages.json 中没有有效的页面配置')
			return routes
		}

		// 解析 tabBar 页面
		this.tabBarPages.clear()
		if (pagesJson.tabBar?.list) {
			for (const item of pagesJson.tabBar.list) {
				this.tabBarPages.add(item.pagePath)
			}
		}

		// 解析主包页面
		for (const page of pagesJson.pages) {
			routes.push(this.parsePageToRoute(page))
		}

		// 解析子包页面
		if (this.options.includeSubPackages && pagesJson.subPackages) {
			for (const subPkg of pagesJson.subPackages) {
				if (subPkg.pages && Array.isArray(subPkg.pages)) {
					for (const page of subPkg.pages) {
						routes.push(this.parsePageToRoute(page, subPkg.root))
					}
				}
			}
		}

		return routes
	}

	/**
	 * 生成类型定义代码
	 */
	private generateTypeDefinitions(): string {
		if (!this.options.exportTypes || this.options.outputFormat === 'js') {
			return ''
		}

		return `
/**
 * 路由元信息
 */
export interface RouteMeta {
	/** 页面标题 */
	title?: string
	/** 是否为TabBar页面 */
	isTab?: boolean
	/** 是否需要登录 */
	requireAuth?: boolean
	/** 自定义扩展字段 */
	[key: string]: unknown
}

/**
 * 路由配置项
 */
export interface RouteConfig {
	/** 路由路径 */
	path: string
	/** 路由名称（用于命名路由导航） */
	name?: string
	/** 路由元信息 */
	meta?: RouteMeta
}
`
	}

	/**
	 * 生成路由配置文件内容
	 */
	private generateFileContent(routes: RouteConfig[]): string {
		const typeDefinitions = this.generateTypeDefinitions()
		const isTS = this.options.outputFormat === 'ts'

		const routesJson = JSON.stringify(routes, null, '\t')
			// 美化 JSON 输出，去掉属性名的引号
			.replace(/"(\w+)":/g, '$1:')
			// 修复字符串值的引号
			.replace(/: "([^"]+)"/g, ": '$1'")

		const typeAnnotation = isTS ? ': RouteConfig[]' : ''

		return `${typeDefinitions}
/**
 * 路由配置列表
 * @description 由 pages.json 自动生成
 */
export const routes${typeAnnotation} = ${routesJson}

export default routes
`
	}

	/**
	 * 读取并解析 pages.json
	 */
	private readPagesJson(): UniAppPagesJson | null {
		const pagesJsonPath = resolve(this.projectRoot, this.options.pagesJsonPath!)

		if (!existsSync(pagesJsonPath)) {
			this.logger.warn(`pages.json 文件不存在: ${pagesJsonPath}`)
			return null
		}

		try {
			const content = readFileSync(pagesJsonPath)
			// 使用公共方法移除 JSON 中的注释
			const jsonContent = stripJsonComments(content)
			return JSON.parse(jsonContent) as UniAppPagesJson
		} catch (error) {
			this.logger.error(`解析 pages.json 失败: ${(error as Error).message}`)
			return null
		}
	}

	/**
	 * 从已存在的文件中提取 routes 配置
	 */
	private extractExistingRoutes(existingContent: string): Map<string, RouteConfig> {
		const routesMap = new Map<string, RouteConfig>()

		// 使用更健壮的正则提取 routes 数组
		const routesMatch = existingContent.match(/export const routes[^=]*=\s*(\[[\s\S]*?\](?=\s*\n|\s*$|\s*\/\/))/)
		if (!routesMatch) return routesMap

		try {
			// 安全转换为 JSON 格式
			let jsonStr = routesMatch[1]
				// 属性名加引号
				.replace(/(\w+)(?=\s*:)/g, '"$1"')
				// 先处理单引号字符串，转换为双引号
				.replace(/'([^']*)'/g, '"$1"')
				// 移除尾随逗号
				.replace(/,\s*([\]\}])/g, '$1')

			const routes = JSON.parse(jsonStr) as RouteConfig[]
			for (const route of routes) {
				if (route.path) {
					routesMap.set(route.path, route)
				}
			}
		} catch {
			// 解析失败，返回空 map
			this.logger.warn('解析现有 routes 配置失败，将完全重新生成')
		}

		return routesMap
	}

	/**
	 * 合并路由配置，保留用户修改
	 */
	private mergeRoutes(newRoutes: RouteConfig[], existingRoutesMap: Map<string, RouteConfig>): RouteConfig[] {
		return newRoutes.map(newRoute => {
			const existingRoute = existingRoutesMap.get(newRoute.path)
			if (!existingRoute) return newRoute

			// 用户修改优先：先用新生成的作为基础，再用用户现有的覆盖
			const mergedMeta: RouteMeta = {}

			// 先添加新生成的 meta（作为基础，包含新增字段）
			if (newRoute.meta) {
				Object.assign(mergedMeta, newRoute.meta)
			}

			// 用用户现有的 meta 覆盖（用户修改优先）
			if (existingRoute.meta) {
				Object.assign(mergedMeta, existingRoute.meta)
			}

			return {
				// 保留用户对整个路由的修改（如修改了 name）
				...existingRoute,
				// path 始终使用新的（这是标识符，由 pages.json 决定）
				path: newRoute.path,
				meta: Object.keys(mergedMeta).length > 0 ? mergedMeta : undefined
			}
		})
	}

	/**
	 * 生成路由配置文件
	 */
	private async generateRouterConfig(): Promise<void> {
		const pagesJson = this.readPagesJson()
		if (!pagesJson) return

		let routes = this.parsePagesJson(pagesJson)
		const outputPath = resolve(this.projectRoot, this.options.outputPath!)

		// 如果文件已存在，读取现有内容并合并用户修改
		if (this.options.preserveRouteChanges && existsSync(outputPath)) {
			try {
				const existingContent = readFileSync(outputPath)
				const existingRoutesMap = this.extractExistingRoutes(existingContent)
				if (existingRoutesMap.size > 0) {
					routes = this.mergeRoutes(routes, existingRoutesMap)
					this.logger.info('已合并用户对路由配置的修改')
				}
			} catch {
				// 读取失败时忽略，继续生成新文件
			}
		}

		const content = this.generateFileContent(routes)
		await writeFileContent(outputPath, content)

		this.logger.success(`路由配置文件已生成: ${outputPath}`)
		this.logger.info(`共生成 ${routes.length} 条路由配置`)
	}

	/**
	 * 启动文件监听
	 */
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

	/**
	 * 停止文件监听
	 */
	private stopWatching(): void {
		if (this.watcher) {
			this.watcher.close()
			this.watcher = null
		}
	}

	protected addPluginHooks(plugin: Plugin): void {
		// 在配置解析完成后生成路由配置
		plugin.configResolved = async config => {
			if (!this.options.enabled) return

			this.projectRoot = config.root

			await this.safeExecute(() => this.generateRouterConfig(), '生成路由配置')

			// 开发模式下启动文件监听
			if (config.command === 'serve') {
				this.startWatching()
			}
		}

		// 构建结束时停止监听
		plugin.buildEnd = () => {
			this.stopWatching()
		}
	}
}

/**
 * 生成路由配置插件
 *
 * @param {GenerateRouterOptions} options - 插件配置选项
 * @returns {Plugin} 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用 - 使用默认配置
 * generateRouter()
 *
 * // 自定义 pages.json 路径
 * generateRouter({
 *   pagesJsonPath: 'pages.json'
 * })
 *
 * // 输出 JavaScript 文件
 * generateRouter({
 *   outputFormat: 'js',
 *   outputPath: 'src/router.config.js'
 * })
 *
 * // 使用帕斯卡命名策略
 * generateRouter({
 *   nameStrategy: 'pascalCase'
 * })
 *
 * // 自定义路由名称生成
 * generateRouter({
 *   nameStrategy: 'custom',
 *   customNameGenerator: (path) => `route_${path.replace(/\//g, '_')}`
 * })
 *
 * // 自定义元信息映射
 * generateRouter({
 *   metaMapping: {
 *     navigationBarTitleText: 'title',
 *     requireAuth: 'requireAuth',
 *     customField: 'custom'
 *   }
 * })
 * ```
 *
 * @remarks
 * 该插件会读取 uni-app 项目的 pages.json 文件，自动生成路由配置文件：
 * - 支持主包和子包页面
 * - 自动识别 tabBar 页面
 * - 支持多种路由名称生成策略
 * - 支持自定义元信息字段映射
 * - 开发模式下自动监听 pages.json 变化并重新生成
 */
export const generateRouter = createPluginFactory(GenerateRouterPlugin)
