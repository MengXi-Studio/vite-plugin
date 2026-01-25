import type { Plugin } from 'vite'
import { ErrorHandlingStrategy } from '@/enums'

/**
 * 基础插件配置
 *
 * @interface BasePluginOptions
 */
export interface BasePluginOptions {
	/**
	 * 是否启用插件
	 *
	 * @default true
	 */
	enabled?: boolean

	/**
	 * 是否启用日志
	 *
	 * @default true
	 */
	verbose?: boolean

	/**
	 * 错误处理策略
	 *
	 * @default ErrorHandlingStrategy.THROW
	 */
	errorStrategy?: ErrorHandlingStrategy
}

/**
 * 插件工厂函数类型
 *
 * @template T 插件配置类型，默认继承自 BasePluginOptions
 */
export type PluginFactory<T extends BasePluginOptions = BasePluginOptions> = (options?: T) => Plugin
