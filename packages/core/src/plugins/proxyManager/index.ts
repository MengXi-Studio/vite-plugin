import type { Plugin, ViteDevServer } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { ProxyManagerOptions, ResolvedProxyRule } from './types'
import { filterRulesByEnv, resolveProxyRules, buildViteProxyConfig, loadConfigFile, mergeRules, createLoggingMiddleware, createDelayMiddleware } from './helpers'

/**
 * 开发代理管理插件
 *
 * @class ProxyManagerPlugin
 * @extends {BasePlugin<ProxyManagerOptions>}
 *
 * @description 声明式代理规则管理插件，简化 Vite 开发服务器代理配置。
 * 支持环境切换、规则文件加载、请求日志、延迟模拟、环境变量覆盖目标等能力，
 * 将分散在 vite.config.ts 中的代理配置抽离为独立、可维护的规则体系。
 *
 * **核心流程**：
 * 1. 加载规则：合并 inline rules 和 configFile 中的规则
 * 2. 按环境过滤：仅保留当前环境生效的规则
 * 3. 解析环境变量：从 `PROXY_*_TARGET` 覆盖规则目标
 * 4. 生成 Vite proxy 配置：通过 `config` 钩子注入
 * 5. 注册中间件：日志记录 + 延迟模拟（`configureServer` 钩子）
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { proxyManager } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     proxyManager({
 *       rules: [
 *         { context: '/api', target: 'http://localhost:3000', env: ['development'] },
 *         { context: '/upload', target: 'http://oss.example.com', rewrite: p => p.replace(/^\/upload/, '/v2/files') }
 *       ],
 *       logLevel: 'verbose',
 *       defaultDelay: { min: 100, max: 500 }
 *     })
 *   ]
 * })
 * ```
 */
class ProxyManagerPlugin extends BasePlugin<ProxyManagerOptions> {
	/** 已解析并过滤的代理规则 */
	private resolvedRules: ResolvedProxyRule[] = []

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<ProxyManagerOptions>} 默认配置对象
	 *
	 * @description 默认配置：
	 * - rules: []
	 * - configFile: '.proxyrc.ts'
	 * - logLevel: 'basic'
	 * - defaultDelay: false
	 * - envPrefix: 'PROXY_'
	 */
	protected getDefaultOptions(): Partial<ProxyManagerOptions> {
		return {
			rules: [],
			configFile: '.proxyrc.ts',
			logLevel: 'basic',
			defaultDelay: false,
			envPrefix: 'PROXY_'
		}
	}

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当配置项不合法时抛出校验错误
	 *
	 * @description 校验规则：
	 * - logLevel: 必须为 'none' | 'basic' | 'verbose'
	 * - configFile: 必须为 false 或字符串
	 * - envPrefix: 必须为字符串
	 */
	protected validateOptions(): void {
		this.validator
			.field('logLevel')
			.enum(['none', 'basic', 'verbose'])
			.field('configFile')
			.custom(v => v === false || typeof v === 'string', 'configFile 必须为 false 或字符串路径')
			.field('envPrefix')
			.string()
			.validate()
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 'proxy-manager'
	 */
	protected getPluginName(): string {
		return 'proxy-manager'
	}

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @param {Plugin} plugin - Vite 插件对象
	 *
	 * @description 注册以下钩子：
	 * - `config`: 加载规则并生成 Vite server.proxy 配置
	 * - `configureServer`: 注册日志中间件和延迟模拟中间件
	 */
	protected addPluginHooks(plugin: Plugin): void {
		plugin.config = async () => {
			if (!this.options.enabled) return
			return this.safeExecute(() => this.buildProxyConfig(), '构建代理配置')
		}

		plugin.configureServer = (server: ViteDevServer) => {
			if (!this.options.enabled) return
			this.safeExecuteSync(() => this.setupMiddlewares(server), '注册代理中间件')
		}
	}

	/**
	 * 加载规则并构建 Vite proxy 配置
	 *
	 * @returns {{ server: { proxy: Record<string, any> } }} Vite 配置对象
	 *
	 * @description 完整流程：
	 * 1. 加载 configFile 中的规则
	 * 2. 合并 inline rules 和文件规则
	 * 3. 按当前环境过滤
	 * 4. 解析环境变量覆盖
	 * 5. 构建 Vite proxy 配置对象
	 */
	private async buildProxyConfig(): Promise<{ server: { proxy: Record<string, any> } }> {
		const root = this.viteConfig?.root || process.cwd()

		// 1. 加载配置文件规则
		const fileRules = await loadConfigFile(root, this.options.configFile)

		// 2. 合并规则（inline 优先）
		const allRules = mergeRules(this.options.rules, fileRules)

		// 3. 按环境过滤
		const currentEnv = process.env.NODE_ENV || 'development'
		const filteredRules = filterRulesByEnv(allRules, currentEnv)

		// 4. 解析规则（含环境变量覆盖）
		this.resolvedRules = resolveProxyRules(filteredRules, this.options.envPrefix)

		// 5. 构建 Vite proxy 配置
		const proxyConfig = buildViteProxyConfig(this.resolvedRules)

		if (this.resolvedRules.length > 0) {
			this.logger.info(`已加载 ${this.resolvedRules.length} 条代理规则 (环境: ${currentEnv})`)
		}

		return { server: { proxy: proxyConfig } }
	}

	/**
	 * 在开发服务器中注册中间件
	 *
	 * @param {ViteDevServer} server - Vite 开发服务器实例
	 *
	 * @description 注册两个 Connect 中间件：
	 * 1. 日志中间件：记录代理请求信息
	 * 2. 延迟中间件：模拟慢网络环境
	 *
	 * 中间件在 Vite 内部中间件之前执行，确保能拦截所有代理请求。
	 */
	private setupMiddlewares(server: ViteDevServer): void {
		const logFn = (msg: string) => this.logger.info(msg)

		// 日志中间件先注册（先执行），确保 startTime 在延迟之前记录，duration 包含延迟时间
		if (this.options.logLevel !== 'none') {
			server.middlewares.use(createLoggingMiddleware(this.resolvedRules, this.options.logLevel, logFn))
		}

		// 延迟中间件后注册（后执行），在日志记录 startTime 之后执行延迟
		if (this.options.defaultDelay !== false || this.resolvedRules.some(r => r.rule.delay !== undefined)) {
			server.middlewares.use(createDelayMiddleware(this.resolvedRules, this.options.defaultDelay, logFn))
		}
	}

	/**
	 * 获取当前生效的代理规则列表
	 *
	 * @returns {ResolvedProxyRule[]} 已解析的规则列表
	 *
	 * @description 返回经过环境过滤和环境变量覆盖后的规则列表，
	 * 可用于调试和查看实际生效的代理配置
	 */
	public getResolvedRules(): ResolvedProxyRule[] {
		return [...this.resolvedRules]
	}
}

/**
 * 创建开发代理管理插件
 *
 * @function proxyManager
 * @param {ProxyManagerOptions} [options] - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @description 声明式代理规则管理插件，简化 Vite 开发服务器代理配置。
 * 支持环境切换、规则文件加载、请求日志、延迟模拟等能力。
 *
 * @example
 * ```typescript
 * // 基本使用
 * proxyManager({
 *   rules: [
 *     { context: '/api', target: 'http://localhost:3000' }
 *   ]
 * })
 *
 * // 多环境配置
 * proxyManager({
 *   rules: [
 *     { context: '/api', target: 'http://localhost:3000', env: ['development'] },
 *     { context: '/api', target: 'https://api.example.com', env: ['staging'] }
 *   ]
 * })
 *
 * // 请求重写
 * proxyManager({
 *   rules: [
 *     {
 *       context: '/upload',
 *       target: 'http://oss.example.com',
 *       rewrite: path => path.replace(/^\/upload/, '/v2/files')
 *     }
 *   ]
 * })
 *
 * // 延迟模拟（慢网络测试）
 * proxyManager({
 *   rules: [
 *     { context: '/api', target: 'http://localhost:3000', delay: { min: 200, max: 800 } }
 *   ],
 *   defaultDelay: 100
 * })
 *
 * // 详细日志
 * proxyManager({
 *   rules: [...],
 *   logLevel: 'verbose'
 * })
 *
 * // 使用配置文件
 * proxyManager({
 *   configFile: '.proxyrc.ts',
 *   logLevel: 'basic'
 * })
 *
 * // 环境变量覆盖目标
 * // 设置 PROXY_API_TARGET=http://staging-api.example.com
 * proxyManager({
 *   rules: [
 *     { context: '/api', target: 'http://localhost:3000' }
 *   ],
 *   envPrefix: 'PROXY_'
 * })
 * ```
 *
 * @remarks
 * 该插件在 Vite 开发服务器启动时生效，核心能力：
 * - **声明式规则**: 简洁的 ProxyRule 配置，替代繁琐的 http-proxy-middleware 选项
 * - **环境切换**: 通过 `env` 字段限定规则生效环境，自动按 NODE_ENV 过滤
 * - **规则文件**: 支持外部 `.proxyrc.ts` 配置文件，与 vite.config.ts 解耦
 * - **请求日志**: basic/verbose 两级日志，verbose 模式含状态码和耗时
 * - **延迟模拟**: 规则级/全局级延迟配置，支持固定值和随机范围
 * - **环境变量覆盖**: 通过 `PROXY_*_TARGET` 环境变量动态覆盖代理目标
 * - **请求重写**: 支持 rewrite 函数修改请求路径
 * - **响应修改**: 支持 modifyResponse 回调修改代理响应
 * - **WebSocket 代理**: 通过 `ws: true` 启用
 */
export const proxyManager = createPluginFactory(ProxyManagerPlugin)
export * from './types'
