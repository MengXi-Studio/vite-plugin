import type { Plugin } from 'vite'
import type { BasePlugin } from './index'

/**
 * 带插件实例引用的 Vite 插件类型
 *
 * @template T 插件配置类型
 */
export interface PluginWithInstance<T extends BasePluginOptions = BasePluginOptions> extends Plugin {
	/**
	 * 原始插件实例的引用，方便外部访问插件内部状态
	 */
	pluginInstance?: BasePlugin<T>
}

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
export type PluginFactory<T extends BasePluginOptions = BasePluginOptions, R = T> = (options?: R) => PluginWithInstance<T>

/**
 * 仅保留函数型钩子（或含 handler 的对象型钩子）的键映射
 *
 * @description 用于将 `Plugin` 类型过滤为「可作为钩子注册」的键集合，
 * 排除 `name` / `enforce` / `apply` 等非函数属性，提升 registerHook 的类型安全。
 */
export type FunctionHookMap<P> = {
	[K in keyof P]: P[K] extends (...args: any[]) => any ? P[K] : P[K] extends { handler: (...args: any[]) => any } ? P[K] : never
}
