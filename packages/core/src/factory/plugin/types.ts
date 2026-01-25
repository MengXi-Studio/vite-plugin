import type { Plugin } from 'vite'

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
}

/**
 * 插件工厂函数类型
 * 
 * @template T 插件配置类型，默认继承自 BasePluginOptions
 */
export type PluginFactory<T extends BasePluginOptions = BasePluginOptions> = (options?: T) => Plugin
