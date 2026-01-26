import type { ResolvedConfig, Plugin } from 'vite'
import type { BasePluginOptions, PluginFactory } from './types'
import { Logger } from '@/logger'
import type { LoggerOptions } from '@/logger/types'
import { deepMerge, Validator } from '@/common'

/**
 * 基础插件抽象类，提供插件开发的核心功能和生命周期管理
 *
 * @class BasePlugin
 * @template T - 插件配置类型，必须继承自 BasePluginOptions
 * @abstract
 * @description 该类是所有插件的基类，提供了插件配置管理、日志记录、生命周期管理等核心功能
 * @example
 * ```typescript
 * class MyPlugin extends BasePlugin<MyPluginOptions> {
 *   protected getPluginName() {
 *     return 'my-plugin'
 *   }
 *
 *   protected addPluginHooks(plugin: Plugin) {
 *     // 添加插件钩子
 *   }
 * }
 * ```
 */
export abstract class BasePlugin<T extends BasePluginOptions = BasePluginOptions> {
	/**
	 * 插件配置
	 *
	 * @protected
	 * @description 插件配置，包含插件的运行参数和选项
	 */
	protected options: Required<T>

	/**
	 * 插件日志记录器
	 *
	 * @protected
	 * @description 插件日志记录器，用于记录插件运行时的日志信息
	 */
	protected logger: Logger

	/**
	 * 插件配置验证器
	 *
	 * @protected
	 * @description 插件配置验证器，用于验证插件配置参数是否符合要求
	 */
	protected validator: Validator<T>

	/**
	 * Vite 配置
	 *
	 * @protected
	 * @description Vite 配置，包含 Vite 构建的运行参数和选项
	 */
	protected viteConfig: ResolvedConfig | null = null

	/**
	 * 插件构造函数
	 *
	 * @param options 插件配置
	 * @param loggerConfig 日志配置或Logger实例，可选
	 *
	 * @protected
	 * @description 插件构造函数，初始化插件配置、日志记录器和验证插件参数
	 */
	constructor(options: T, loggerConfig?: LoggerOptions | Logger) {
		// 合并插件配置
		this.options = this.mergeOptions(options)

		// 初始化插件日志记录器
		this.logger = this.initLogger(loggerConfig)

		// 初始化插件配置验证器
		this.validator = new Validator(this.options)

		// 验证插件配置
		this.safeExecute(async () => this.validateOptions(), '插件配置验证')
	}

	/**
	 * 合并插件配置，将用户提供的配置与默认配置合并
	 *
	 * @protected
	 * @template T - 插件配置类型，必须继承自 BasePluginOptions
	 * @param {T} options - 用户提供的插件配置
	 * @returns {Required<T>} 合并后的完整插件配置，包含所有必填字段
	 * @description 将用户提供的配置与默认配置进行深度合并，确保所有必填字段都有值
	 * @example
	 * ```typescript
	 * const userOptions = { enabled: false }
	 * const mergedOptions = this.mergeOptions(userOptions)
	 * // mergedOptions 将包含 enabled: false, verbose: true, errorStrategy: 'throw'
	 * ```
	 */
	protected mergeOptions(options: T): Required<T> {
		const defaultOptions: BasePluginOptions = {
			enabled: true,
			verbose: true,
			errorStrategy: 'throw'
		}

		return deepMerge(defaultOptions, options) as Required<T>
	}

	/**
	 * 初始化日志记录器
	 *
	 * @private
	 * @param {LoggerOptions | Logger} loggerConfig - 日志配置对象或Logger实例，可选
	 * @returns {Logger} Logger实例，用于记录插件日志
	 * @description 根据提供的配置或Logger实例初始化插件日志记录器，如果直接提供了Logger实例则直接使用，否则创建新的Logger实例
	 */ private initLogger(loggerConfig?: LoggerOptions | Logger): Logger {
		if (loggerConfig instanceof Logger) {
			// 如果直接提供了Logger实例，直接使用
			return loggerConfig
		}

		// 否则创建新的Logger实例
		return new Logger({
			name: this.getPluginName(),
			enabled: this.options.verbose,
			...loggerConfig
		})
	}

	/**
	 * 验证插件配置参数，确保配置符合要求
	 *
	 * @protected
	 * @virtual
	 * @returns {void} 无返回值
	 * @throws {Error} 如果配置参数无效，抛出包含错误信息的异常
	 * @description 该方法在插件初始化时被调用，用于验证插件配置的有效性。子类可以重写此方法以添加自定义验证逻辑
	 * @example
	 * ```typescript
	 * protected validateOptions(): void {
	 *   if (!this.options.sourceDir) {
	 *     throw new Error('sourceDir 是必填项')
	 *   }
	 *
	 *   if (!this.options.targetDir) {
	 *     throw new Error('targetDir 是必填项')
	 *   }
	 * }
	 * ```
	 */
	protected validateOptions(): void {}

	/**
	 * 获取插件名称
	 *
	 * @protected
	 * @returns {string} 插件的名称，用于 Vite 插件系统识别
	 */
	protected abstract getPluginName(): string

	/**
	 * 获取插件执行时机
	 *
	 * @protected
	 * @returns {Plugin['enforce']} 插件的执行时机，可选值为 'pre'、'post' 或 undefined
	 * @description 'post' 表示插件在 Vite 构建后期执行
	 */
	protected getEnforce(): Plugin['enforce'] {
		return void 0
	}

	/**
	 * 处理配置解析完成事件
	 *
	 * @param config 解析后的 Vite 配置
	 *
	 * @protected
	 * @description 处理 Vite 配置解析完成事件，将解析后的配置存储到插件实例中
	 */
	protected onConfigResolved(config: ResolvedConfig): void {
		this.viteConfig = config
		this.logger.info('配置解析完成，插件已初始化')
	}

	/**
	 * 添加插件钩子到 Vite 插件对象
	 *
	 * @protected
	 * @abstract
	 * @param {Plugin} plugin - Vite 插件对象，用于添加钩子
	 * @returns {void} 无返回值
	 * @description 添加插件钩子到 Vite 插件对象，用于在构建过程中执行插件逻辑
	 */
	protected abstract addPluginHooks(plugin: Plugin): void

	/**
	 * 安全执行异步函数，自动处理执行过程中可能出现的错误
	 *
	 * @protected
	 * @async
	 * @template T - 异步函数的返回值类型
	 * @param {() => Promise<T>} fn - 要执行的异步函数
	 * @param {string} context - 执行上下文描述，用于错误日志记录
	 * @returns {Promise<T | undefined>} 异步函数的执行结果，如果执行过程中发生错误，根据错误策略返回 undefined 或抛出错误
	 * @description 该方法封装了异步函数的执行，自动处理可能出现的错误，根据插件配置的 errorStrategy 决定如何处理错误
	 * @example
	 * ```typescript
	 * // 安全执行异步操作
	 * const result = await this.safeExecute(async () => {
	 *   return await someAsyncOperation()
	 * }, '执行异步操作')
	 *
	 * // 如果 someAsyncOperation() 抛出错误，会根据 errorStrategy 处理
	 * ```
	 */
	protected async safeExecute<T>(fn: () => Promise<T>, context: string): Promise<T | undefined> {
		try {
			return await fn()
		} catch (error) {
			return this.handleError(error, context)
		}
	}

	/**
	 * 处理插件执行过程中出现的错误，根据配置的错误策略决定如何处理
	 *
	 * @protected
	 * @template T - 返回值类型，仅当错误策略为 'log' 或 'ignore' 时返回 undefined
	 * @param {unknown} error - 捕获到的错误对象
	 * @param {string} context - 错误发生的上下文描述，用于错误日志记录
	 * @returns {T | undefined} 当错误策略为 'log' 或 'ignore' 时返回 undefined，否则抛出错误
	 * @description 根据插件配置的 errorStrategy 处理错误：
	 * - 'throw': 记录错误日志并抛出错误，中断执行
	 * - 'log': 记录错误日志但不抛出错误，继续执行
	 * - 'ignore': 记录错误日志但不抛出错误，继续执行
	 * - 默认：记录错误日志并抛出错误
	 * @example
	 * ```typescript
	 * // 当 errorStrategy 为 'throw' 时
	 * this.handleError(new Error('测试错误'), '测试上下文') // 记录错误日志并抛出错误
	 *
	 * // 当 errorStrategy 为 'log' 时
	 * this.handleError(new Error('测试错误'), '测试上下文') // 记录错误日志并返回 undefined
	 * ```
	 */
	protected handleError<T>(error: unknown, context: string): T | undefined {
		let errorMessage = `${context}: `

		if (error instanceof Error) {
			errorMessage += error.message
		} else if (typeof error === 'string') {
			errorMessage += error
		} else {
			errorMessage += String(error)
		}

		const strategy = this.options.errorStrategy

		switch (strategy) {
			case 'throw':
				this.logger.error(errorMessage)
				throw error

			case 'log':
			case 'ignore':
				this.logger.error(errorMessage)
				return undefined

			default:
				// 默认策略，抛出错误
				this.logger.error(errorMessage)
				throw error
		}
	}

	/**
	 * 将插件实例转换为 Vite 插件对象，用于 Vite 构建系统
	 *
	 * @public
	 * @returns {Plugin} Vite 插件对象，包含插件名称、执行时机和各种钩子函数
	 * @description 该方法创建并返回一个符合 Vite 插件规范的对象，设置了插件的基本信息和 configResolved 钩子，然后调用 addPluginHooks 方法添加插件特定的钩子
	 * @example
	 * ```typescript
	 * // 创建插件实例
	 * const pluginInstance = new MyPlugin(options)
	 *
	 * // 转换为 Vite 插件
	 * const vitePlugin = pluginInstance.toPlugin()
	 *
	 * // 导出 Vite 插件
	 * export const myPlugin = vitePlugin
	 * ```
	 */
	public toPlugin(): Plugin {
		// 创建插件对象
		const plugin: Plugin = {
			name: this.getPluginName(),
			enforce: this.getEnforce(),
			configResolved: config => {
				if (this.options.enabled) {
					this.onConfigResolved(config)
				}
			}
		}

		// 添加插件钩子
		this.addPluginHooks(plugin)

		return plugin
	}
}

/**
 * 创建插件工厂函数，用于生成 Vite 插件实例
 *
 * @template T - 插件配置类型，必须继承自 BasePluginOptions
 * @template P - 插件实例类型，必须继承自 BasePlugin<T>
 * @param {new (options: T, loggerConfig?: LoggerOptions | Logger) => P} PluginClass - 插件类构造函数
 * @returns {PluginFactory<T>} 插件工厂函数，接收插件配置并返回 Vite 插件实例
 * @description 该函数创建一个插件工厂，用于生成 Vite 插件实例。工厂函数接收插件配置，创建插件实例，转换为 Vite 插件对象，并在插件对象上添加对原始插件实例的引用
 * @example
 * ```typescript
 * // 定义插件类
 * class MyPlugin extends BasePlugin<MyPluginOptions> {
 *   protected getPluginName() { return 'my-plugin' }
 *   protected addPluginHooks(plugin: Plugin) { // 添加钩子 }
 * }
 *
 * // 创建插件工厂
 * const myPluginFactory = createPluginFactory(MyPlugin)
 *
 * // 使用工厂创建插件实例
 * const vitePlugin = myPluginFactory({
 *   enabled: true,
 *   verbose: true,
 *   // 其他自定义配置
 * })
 *
 * // 将插件添加到 Vite 配置
 * export default {
 *   plugins: [vitePlugin]
 * }
 * ```
 */
export function createPluginFactory<T extends BasePluginOptions, P extends BasePlugin<T>>(PluginClass: new (options: T, loggerConfig?: LoggerOptions | Logger) => P): PluginFactory<T> {
	return (options?: T) => {
		// 使用更安全的默认值处理，确保类型安全
		const pluginOptions = options as T
		const plugin = new PluginClass(pluginOptions)
		const vitePlugin = plugin.toPlugin()

		// 在Vite插件对象上添加对原始插件实例的引用，方便外部访问
		;(vitePlugin as any).pluginInstance = plugin

		return vitePlugin
	}
}
