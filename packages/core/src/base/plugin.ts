import type { Plugin, ResolvedConfig } from 'vite'
import { Logger } from '@/common'
import type { BasePluginOptions } from './types'

/**
 * 插件基类
 */
export abstract class BasePlugin<T extends BasePluginOptions = BasePluginOptions> {
	protected options: Required<T>
	protected logger: Logger
	protected viteConfig: ResolvedConfig | null = null

	/**
	 * 构造函数
	 * @param options 插件配置
	 */
	constructor(options: T) {
		// 合并默认配置
		this.options = this.mergeDefaultOptions(options)

		// 初始化日志工具
		this.logger = new Logger({
			name: this.getPluginName(),
			enabled: this.options.verbose
		})
	}

	/**
	 * 获取插件名称
	 * @returns 插件名称
	 */
	protected abstract getPluginName(): string

	/**
	 * 合并默认配置
	 * @param options 插件配置
	 * @returns 合并后的配置
	 */
	protected mergeDefaultOptions(options: T): Required<T> {
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
	 * 配置解析完成钩子
	 * @param config Vite 解析后的配置
	 */
	protected onConfigResolved(config: ResolvedConfig): void {
		this.viteConfig = config
		this.logger.info(`配置解析完成，插件 ${this.getPluginName()} 已初始化`)
	}

	/**
	 * 生成 Vite 插件对象
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

	/**
	 * 添加插件钩子
	 * @param plugin Vite 插件对象
	 */
	protected abstract addPluginHooks(plugin: any): void

	/**
	 * 获取插件强制执行顺序
	 * @returns 强制执行顺序
	 */
	protected getEnforce(): Plugin['enforce'] {
		return undefined
	}

	/**
	 * 验证配置
	 * @throws 配置验证失败时抛出错误
	 */
	protected validateOptions(): void {
		// 默认实现，子类可以重写
	}

	/**
	 * 安全执行异步函数，处理错误
	 * @param fn 异步函数
	 * @param errorMsg 错误消息
	 */
	protected async safeExecute(fn: () => Promise<void>, errorMsg: string): Promise<void> {
		try {
			await fn()
		} catch (error) {
			this.handleError(error, errorMsg)
		}
	}

	/**
	 * 错误处理
	 * @param error 错误对象
	 * @param context 错误上下文
	 */
	protected handleError(error: unknown, context: string): never {
		let errorMessage = `${context}: `

		if (error instanceof Error) {
			errorMessage += error.message
		} else {
			errorMessage += String(error)
		}

		this.logger.error(errorMessage)
		throw error
	}
}

/**
 * 插件工厂函数类型
 */
export type PluginFactory<T extends BasePluginOptions = BasePluginOptions> = (options?: T) => Plugin

/**
 * 创建插件工厂函数
 * @param PluginClass 插件类
 * @returns 插件工厂函数
 */
export function createPluginFactory<T extends BasePluginOptions, P extends BasePlugin<T>>(PluginClass: new (options: T) => P): PluginFactory<T> {
	return (options: T = {} as T) => {
		const plugin = new PluginClass(options)
		return plugin.toPlugin()
	}
}
