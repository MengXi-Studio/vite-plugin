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
			metaMapping: {
				navigationBarTitleText: 'title',
				requireAuth: 'requireAuth'
			},
			headerComment: '/* eslint-disable */\n// 此文件由 generateRouter 插件自动生成，请勿手动修改'
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
				for (const page of subPkg.pages) {
					routes.push(this.parsePageToRoute(page, subPkg.root))
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
		const headerComment = this.options.headerComment || ''
		const typeDefinitions = this.generateTypeDefinitions()
		const isTS = this.options.outputFormat === 'ts'

		const routesJson = JSON.stringify(routes, null, '\t')
			// 美化 JSON 输出，去掉属性名的引号
			.replace(/"(\w+)":/g, '$1:')
			// 修复字符串值的引号
			.replace(/: "([^"]+)"/g, ": '$1'")

		const typeAnnotation = isTS ? ': RouteConfig[]' : ''

		return `${headerComment}
${typeDefinitions}
/**
 * 路由配置列表
 * @description 由 pages.json 自动生成
 */
export const routes${typeAnnotation} = ${routesJson}

/**
 * 根据路由名称获取路由配置
 */
export function getRouteByName(name${isTS ? ': string' : ''})${isTS ? ': RouteConfig | undefined' : ''} {
	return routes.find(route => route.name === name)
}

/**
 * 根据路由路径获取路由配置
 */
export function getRouteByPath(path${isTS ? ': string' : ''})${isTS ? ': RouteConfig | undefined' : ''} {
	return routes.find(route => route.path === path)
}

/**
 * 获取所有 TabBar 页面路由
 */
export function getTabBarRoutes()${isTS ? ': RouteConfig[]' : ''} {
	return routes.filter(route => route.meta?.isTab === true)
}

/**
 * 获取需要登录的页面路由
 */
export function getAuthRoutes()${isTS ? ': RouteConfig[]' : ''} {
	return routes.filter(route => route.meta?.requireAuth === true)
}

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
	 * 生成路由配置文件
	 */
	private async generateRouterConfig(): Promise<void> {
		const pagesJson = this.readPagesJson()
		if (!pagesJson) return

		const routes = this.parsePagesJson(pagesJson)
		const content = this.generateFileContent(routes)

		const outputPath = resolve(this.projectRoot, this.options.outputPath!)
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
