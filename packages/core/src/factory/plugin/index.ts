import type { ResolvedConfig, Plugin } from 'vite'
import type { BasePluginOptions, PluginFactory } from './types'
import { Logger } from '@/logger'

/**
 * 基础插件类
 *
 * @template T 插件配置类型，默认继承自 BasePluginOptions
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
	 */
	constructor(options: T) {
		// 合并插件配置
		this.options = this.mergeOptions(options)

		// 初始化插件日志记录器
		this.logger = new Logger({
			name: this.getPluginName(),
			enabled: this.options.verbose
		})
	}

	/**
	 * 验证插件配置
	 *
	 * @throws {Error} 如果配置无效
	 */
	protected validateOptions(): void {}

	/**
	 * 合并插件配置
	 *
	 * @param options 插件配置
	 * @returns 合并后的插件配置
	 */
	protected mergeOptions(options: T): Required<T> {
		const defaultOptions: BasePluginOptions = {
			enabled: true,
			verbose: true
		}

		return {
			...defaultOptions,
			...options
		} as Required<T>
	}

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
	protected async safeExecute<T>(fn: () => Promise<T>, context: string): Promise<T> {
		try {
			return await fn()
		} catch (error) {
			this.handleError(error, context)
		}
	}

	/**
	 * 处理插件错误
	 *
	 * @param error 错误对象
	 * @param context 插件上下文
	 */
	protected handleError(error: unknown, context: string): never {
		let errorMessage = `${context}: `

		if (error instanceof Error) {
			errorMessage += error.message
		} else if (typeof error === 'string') {
			errorMessage += error
		} else {
			errorMessage += String(error)
		}

		this.logger.error(errorMessage)
		throw error
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
 * @template P 插件实例类型，默认继承自 BasePlugin<T>
 * @param PluginClass 插件类构造函数
 * @returns 插件工厂函数
 */
export function createPluginFactory<T extends BasePluginOptions, P extends BasePlugin<T>>(PluginClass: new (options: T) => P): PluginFactory<T> {
	return (options: T = {} as T) => {
		const plugin = new PluginClass(options)
		return plugin.toPlugin()
	}
}
