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

	/**
	 * 错误处理策略
	 *
	 * @default 'throw'
	 */
	errorStrategy?: 'throw' | 'log' | 'ignore'
}

/**
 * 插件选项标准化器类型
 *
 * @template T 目标选项类型
 * @template R 原始选项类型
 */
export type OptionsNormalizer<T, R = any> = (raw?: R) => T

/**
 * 插件工厂函数类型
 *
 * @template T 插件配置类型，默认继承自 BasePluginOptions
 * @template R 原始配置类型，默认与 T 相同
 */
export type PluginFactory<T extends BasePluginOptions = BasePluginOptions, R = T> = (options?: R) => Plugin
