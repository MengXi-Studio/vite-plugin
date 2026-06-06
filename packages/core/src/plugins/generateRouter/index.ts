import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { GenerateRouterOptions, UniAppPagesJson, RouteConfig, UniAppPageConfig, RouteMeta } from './types'
import { toCamelCase, toPascalCase, stripJsonComments } from './common'
import { writeFileContent } from '@/common/fs'
import { resolve } from 'path'
import { existsSync, watch as fsWatch, promises as fsp } from 'fs'

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
	 *
	 * @description 从 Vite 配置中获取的项目根目录路径
	 */
	private projectRoot: string = process.cwd()

	/**
	 * tabBar 页面路径集合
	 *
	 * @description 存储从 pages.json tabBar 配置中提取的页面路径，
	 * 用于在路由元信息中标记 isTab 字段
	 */
	private tabBarPages: Set<string> = new Set()

	/**
	 * 文件监听器
	 *
	 * @description 监听 pages.json 文件变化的 Node.js fs.FSWatcher 实例
	 */
	private watcher: ReturnType<typeof fsWatch> | null = null

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<GenerateRouterOptions>} 默认配置对象
	 *
	 * @description 默认配置：
	 * - pagesJsonPath: 'src/pages.json'
	 * - outputPath: 'src/router.config.ts'
	 * - outputFormat: 'ts'
	 * - nameStrategy: 'camelCase'
	 * - includeSubPackages: true
	 * - watch: true
	 * - exportTypes: true
	 * - preserveRouteChanges: true
	 * - metaMapping: { navigationBarTitleText: 'title', requireAuth: 'requireAuth' }
	 */
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

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当 nameStrategy 为 'custom' 但未提供 customNameGenerator 时抛出错误
	 *
	 * @description 校验规则：
	 * - pagesJsonPath: 字符串
	 * - outputPath: 字符串
	 * - outputFormat: 枚举值 'ts' | 'js'
	 * - nameStrategy: 枚举值 'path' | 'camelCase' | 'pascalCase' | 'custom'
	 */
	protected validateOptions(): void {
		this.validator.field('pagesJsonPath').string().field('outputPath').string().field('outputFormat').enum(['ts', 'js']).field('nameStrategy').enum(['path', 'camelCase', 'pascalCase', 'custom']).validate()

		// 如果使用自定义策略，必须提供生成函数
		if (this.options.nameStrategy === 'custom' && !this.options.customNameGenerator) {
			throw new Error('当 nameStrategy 为 custom 时，必须提供 customNameGenerator')
		}
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 'generate-router'
	 */
	protected getPluginName(): string {
		return 'generate-router'
	}

	/**
	 * 根据策略生成路由名称
	 *
	 * @param {string} path - 页面路径
	 * @returns {string} 根据配置策略生成的路由名称
	 *
	 * @description 根据 nameStrategy 配置生成不同格式的路由名称：
	 * - `path`: 将斜杠替换为下划线，去除前导下划线
	 * - `camelCase`: 驼峰命名
	 * - `pascalCase`: 帕斯卡命名
	 * - `custom`: 使用自定义生成函数
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
	 *
	 * @param {UniAppPageConfig} pageConfig - uni-app 页面配置对象
	 * @param {string} fullPath - 页面完整路径（不含前导斜杠）
	 * @returns {RouteMeta} 提取的路由元信息
	 *
	 * @description 根据 metaMapping 配置将页面 style 中的字段映射到路由元信息，
	 * 并自动标记 tabBar 页面的 isTab 字段。
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
	 *
	 * @param {UniAppPageConfig} pageConfig - uni-app 页面配置对象
	 * @param {string} [rootPath=''] - 子包根路径，主包页面为空
	 * @returns {RouteConfig} 生成的路由配置对象
	 *
	 * @description 将 uni-app 的页面配置转换为标准路由配置，
	 * 包含路径、名称和元信息。子包页面路径会拼接 rootPath 前缀。
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
	 *
	 * @param {UniAppPagesJson} pagesJson - 解析后的 pages.json 对象
	 * @returns {RouteConfig[]} 路由配置数组
	 *
	 * @description 解析流程：
	 * 1. 校验 pages 数组有效性
	 * 2. 提取 tabBar 页面路径到 tabBarPages 集合
	 * 3. 解析主包页面
	 * 4. 如果 includeSubPackages 为 true，解析子包页面
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
	 *
	 * @returns {string} TypeScript 类型定义代码字符串，如果不需要则返回空字符串
	 *
	 * @description 仅在 exportTypes 为 true 且 outputFormat 为 'ts' 时生成类型定义，
	 * 包含 RouteMeta 和 RouteConfig 接口定义。
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
	 *
	 * @param {RouteConfig[]} routes - 路由配置数组
	 * @returns {string} 完整的路由配置文件内容字符串
	 *
	 * @description 生成包含类型定义（如果需要）和路由配置数组的完整文件内容。
	 * JSON 输出会经过美化处理：属性名去引号、字符串值使用单引号。
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
	 *
	 * @returns {Promise<UniAppPagesJson | null>} 解析后的 pages.json 对象，失败时返回 null
	 *
	 * @throws 当文件读取或 JSON 解析失败时记录错误日志
	 *
	 * @description 读取 pages.json 文件，去除 JSON 注释后解析为对象。
	 * 如果文件不存在或解析失败，返回 null 并输出相应日志。
	 */
	private async readPagesJson(): Promise<UniAppPagesJson | null> {
		const pagesJsonPath = resolve(this.projectRoot, this.options.pagesJsonPath!)

		if (!existsSync(pagesJsonPath)) {
			this.logger.warn(`pages.json 文件不存在: ${pagesJsonPath}`)
			return null
		}

		try {
			const content = await fsp.readFile(pagesJsonPath, 'utf-8')
			const jsonContent = stripJsonComments(content)
			return JSON.parse(jsonContent) as UniAppPagesJson
		} catch (error) {
			this.logger.error(`解析 pages.json 失败: ${(error as Error).message}`)
			return null
		}
	}

	/**
	 * 从已存在的路由配置文件中提取 routes 配置
	 *
	 * @param {string} existingContent - 已存在的文件内容
	 * @returns {Map<string, RouteConfig>} 以路径为键的路由配置映射
	 *
	 * @description 使用正则表达式从已存在的文件中提取 routes 数组，
	 * 解析为 RouteConfig 对象映射。解析失败时返回空 Map 并输出警告日志。
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
	 *
	 * @param {RouteConfig[]} newRoutes - 新生成的路由配置数组
	 * @param {Map<string, RouteConfig>} existingRoutesMap - 已存在的路由配置映射
	 * @returns {RouteConfig[]} 合并后的路由配置数组
	 *
	 * @description 合并策略：
	 * - path 始终使用新生成的值（由 pages.json 决定）
	 * - 用户对 name 和 meta 的修改优先保留
	 * - 新增的 meta 字段会自动补充，用户修改的值不会被覆盖
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
	 *
	 * @returns {Promise<void>} 无返回值
	 *
	 * @description 完整的路由配置文件生成流程：
	 * 1. 读取并解析 pages.json
	 * 2. 解析为路由配置数组
	 * 3. 如果 preserveRouteChanges 为 true，合并用户修改
	 * 4. 生成文件内容并写入磁盘
	 */
	private async generateRouterConfig(): Promise<void> {
		const pagesJson = await this.readPagesJson()
		if (!pagesJson) return

		let routes = this.parsePagesJson(pagesJson)
		const outputPath = resolve(this.projectRoot, this.options.outputPath!)

		if (this.options.preserveRouteChanges && existsSync(outputPath)) {
			try {
				const existingContent = await fsp.readFile(outputPath, 'utf-8')
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
	 * 启动 pages.json 文件监听
	 *
	 * @description 仅在 watch 为 true 且文件存在时启动监听。
	 * 检测到文件变化时自动重新生成路由配置。
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
	 * 停止 pages.json 文件监听
	 *
	 * @description 关闭文件监听器并释放资源，通常在插件销毁时调用。
	 */
	private stopWatching(): void {
		if (this.watcher) {
			this.watcher.close()
			this.watcher = null
		}
	}

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @param {Plugin} plugin - Vite 插件对象
	 *
	 * @description 注册 `configResolved` 钩子：
	 * - 获取项目根目录
	 * - 生成路由配置文件
	 * - 在开发模式下启动 pages.json 文件监听
	 */
	protected addPluginHooks(plugin: Plugin): void {
		plugin.configResolved = async config => {
			this.projectRoot = config.root

			await this.safeExecute(() => this.generateRouterConfig(), '生成路由配置')

			if (config.command === 'serve') {
				this.startWatching()
			}
		}
	}

	/**
	 * 插件销毁生命周期
	 *
	 * @description 调用父类销毁方法并停止文件监听
	 */
	protected destroy(): void {
		super.destroy()
		this.stopWatching()
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
export * from './types'
