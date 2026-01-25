import type { ResolvedConfig, Plugin } from 'vite'
import type { BasePluginOptions, PluginFactory } from './types'
import { Logger } from '@/logger'
import type { LoggerOptions } from '@/logger/type'
import { ErrorHandlingStrategy } from '@/enums'
import { deepMerge } from '@/common'

/**
 * 基础插件类，提供插件开发的核心功能和生命周期管理
 *
 * @template T 插件配置类型，必须继承自 BasePluginOptions
 * @abstract
 */
export abstract class BasePlugin<T extends BasePluginOptions = BasePluginOptions> {
	/**
	 * 插件配置
	 */
	protected options: Required<T>

	/**
	 * 插件日志记录器
	 */
	protected logger: Logger

	/**
	 * Vite 配置
	 */
	protected viteConfig: ResolvedConfig | null = null

	/**
	 * 插件构造函数
	 *
	 * @param options 插件配置
	 * @param loggerConfig 日志配置或Logger实例，可选
	 */
	constructor(options: T, loggerConfig?: LoggerOptions | Logger) {
		// 合并插件配置
		this.options = this.mergeOptions(options)

		// 初始化插件日志记录器
		this.logger = this.initLogger(loggerConfig)

		// 验证插件配置
		this.validateOptions()
	}

	/**
	 * 合并插件配置
	 *
	 * @param options 插件配置
	 * @returns 合并后的插件配置
	 */
	protected mergeOptions(options: T): Required<T> {
		const defaultOptions: BasePluginOptions = {
			enabled: true,
			verbose: true,
			errorStrategy: ErrorHandlingStrategy.THROW
		}

		return deepMerge(defaultOptions, options) as Required<T>
	}

	/**
	 * 初始化日志记录器
	 *
	 * @param loggerConfig 日志配置或Logger实例
	 * @returns Logger实例
	 */
	private initLogger(loggerConfig?: LoggerOptions | Logger): Logger {
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
	 * 验证插件配置
	 *
	 * @throws {Error} 如果配置无效
	 */
	protected validateOptions(): void {}

	/**
	 * 获取插件名称
	 *
	 * @returns 插件名称
	 */
	protected abstract getPluginName(): string

	/**
	 * 获取插件执行顺序
	 *
	 * @returns 插件执行顺序
	 */
	protected getEnforce(): Plugin['enforce'] {
		return void 0
	}

	/**
	 * 处理配置解析完成事件
	 *
	 * @param config 解析后的 Vite 配置
	 */
	protected onConfigResolved(config: ResolvedConfig): void {
		this.viteConfig = config
		this.logger.info('配置解析完成，插件已初始化')
	}

	/**
	 * 添加插件钩子
	 *
	 * @param plugin 插件对象
	 */
	protected abstract addPluginHooks(plugin: Plugin): void

	/**
	 * 安全执行异步函数
	 *
	 * @template T 函数返回值类型
	 * @param fn 异步函数
	 * @param context 插件上下文
	 * @returns 函数执行结果
	 */
	protected async safeExecute<T>(fn: () => Promise<T>, context: string): Promise<T | undefined> {
		try {
			return await fn()
		} catch (error) {
			return this.handleError(error, context)
		}
	}

	/**
	 * 处理插件错误
	 *
	 * @template T 返回值类型，仅当错误策略为LOG或IGNORE时返回undefined
	 * @param error 错误对象
	 * @param context 插件上下文
	 * @returns 当错误策略为LOG或IGNORE时返回undefined，否则抛出错误
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
			case ErrorHandlingStrategy.THROW:
				this.logger.error(errorMessage)
				throw error

			case ErrorHandlingStrategy.LOG:
			case ErrorHandlingStrategy.IGNORE:
				this.logger.error(errorMessage)
				return undefined

			default:
				// 默认策略，抛出错误
				this.logger.error(errorMessage)
				throw error
		}
	}

	/**
	 * 转换为 Vite 插件
	 *
	 * @returns Vite 插件对象
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
 * 创建插件工厂函数
 *
 * @template T 插件配置类型，默认继承自 BasePluginOptions
 * @template P 插件实例类型，必须继承自 BasePlugin<T>
 * @param PluginClass 插件类构造函数
 * @returns 插件工厂函数
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
