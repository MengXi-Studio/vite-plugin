import type { LoggerOptions } from './types'

/**
 * 日志工具类（单例模式）
 * @description 全局单例日志管理器，统一管理所有插件的日志输出
 */
export class Logger {
	/**
	 * 单例实例
	 */
	private static instance: Logger | null = null

	/**
	 * 库名称
	 */
	private readonly libName: string = '@meng-xi/vite-plugin'

	/**
	 * 插件日志配置映射表
	 * @description 存储每个插件的日志开关状态
	 */
	private pluginConfigs: Map<string, boolean> = new Map()

	/**
	 * 日志类型映射
	 */
	private readonly logTypes = {
		info: {
			method: console.log,
			icon: '',
			color: '',
			reset: ''
		},
		success: {
			method: console.log,
			icon: '✅',
			color: '\x1b[32m', // 绿色
			reset: '\x1b[0m'
		},
		warn: {
			method: console.warn,
			icon: '⚠️',
			color: '\x1b[33m', // 黄色
			reset: '\x1b[0m'
		},
		error: {
			method: console.error,
			icon: '❌',
			color: '\x1b[31m', // 红色
			reset: '\x1b[0m'
		}
	}

	/**
	 * 私有构造函数，防止外部实例化
	 */
	private constructor() {}

	/**
	 * 获取单例实例
	 * @returns Logger 单例实例
	 */
	private static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger()
		}
		return Logger.instance
	}

	/**
	 * 创建日志记录器（工厂方法）
	 * @param options 配置选项
	 * @returns Logger 单例实例
	 * @description 为插件创建日志记录器，实际返回单例实例并注册插件配置
	 */
	static create(options: LoggerOptions): Logger {
		const instance = Logger.getInstance()
		instance.registerPlugin(options.name, options.enabled ?? true)
		return instance
	}

	/**
	 * 注册插件日志配置
	 * @param pluginName 插件名称
	 * @param enabled 是否启用日志
	 */
	private registerPlugin(pluginName: string, enabled: boolean): void {
		this.pluginConfigs.set(pluginName, enabled)
	}

	/**
	 * 生成日志前缀
	 * @param pluginName 插件名称
	 * @returns 格式化的日志前缀
	 */
	private formatPrefix(pluginName: string): string {
		let prefix = `[${this.libName}:${pluginName}]`

		const timestamp = new Date().toLocaleString()
		prefix = `[${timestamp}] ${prefix}`

		return prefix
	}

	/**
	 * 检查插件日志是否启用
	 * @param pluginName 插件名称
	 * @returns 是否启用
	 */
	private isPluginEnabled(pluginName: string): boolean {
		return this.pluginConfigs.get(pluginName) ?? true
	}

	/**
	 * 统一日志输出方法
	 * @param pluginName 插件名称
	 * @param type 日志类型
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	private log(pluginName: string, type: keyof typeof this.logTypes, message: string, data?: any): void {
		// 检查插件日志状态
		if (!this.isPluginEnabled(pluginName)) return

		const prefix = this.formatPrefix(pluginName)
		const logConfig = this.logTypes[type]
		const { method, icon, color, reset } = logConfig
		const logPrefix = icon ? `${icon} ${prefix}` : prefix

		method('==================================')
		if (data !== undefined && data !== null) {
			method(color + logPrefix + reset, color + message + reset, data)
		} else {
			method(color + logPrefix + reset, color + message + reset)
		}
		method('==================================')
	}

	/**
	 * 创建插件日志代理对象
	 * @param pluginName 插件名称
	 * @returns 插件日志代理对象
	 * @internal 供 BasePlugin 内部使用
	 */
	createPluginLogger(pluginName: string): PluginLogger {
		return {
			success: (message: string, data?: any) => this.log(pluginName, 'success', message, data),
			info: (message: string, data?: any) => this.log(pluginName, 'info', message, data),
			warn: (message: string, data?: any) => this.log(pluginName, 'warn', message, data),
			error: (message: string, data?: any) => this.log(pluginName, 'error', message, data)
		}
	}
}

/**
 * 插件日志代理接口
 * @description 为每个插件提供独立的日志接口
 */
export interface PluginLogger {
	/**
	 * 输出成功日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	success(message: string, data?: any): void

	/**
	 * 输出信息日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	info(message: string, data?: any): void

	/**
	 * 输出警告日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	warn(message: string, data?: any): void

	/**
	 * 输出错误日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	error(message: string, data?: any): void
}
