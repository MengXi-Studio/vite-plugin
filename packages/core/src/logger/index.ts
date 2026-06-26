import type { LoggerOptions, PluginLogger } from './types'

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
	 * @description 以实例 ID 为 key 存储每个插件实例的日志配置，避免同类型多实例互相覆盖
	 */
	private pluginConfigs: Map<string, { name: string; enabled: boolean }> = new Map()

	/**
	 * 日志类型映射
	 */
	private readonly logTypes = {
		info: {
			method: console.log,
			icon: 'ℹ️',
			color: '\x1b[36m', // 青色
			reset: '\x1b[0m'
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
	 * 注册插件日志配置并获取 Logger 实例
	 * @param options 配置选项
	 * @returns Logger 单例实例
	 * @description 注册插件日志配置，返回单例实例。使用 instanceId 作为唯一 key 避免多实例冲突
	 */
	static register(options: LoggerOptions): Logger {
		const instance = Logger.getInstance()
		const key = options.instanceId ?? options.name
		instance.registerPlugin(key, options.name, options.enabled ?? true)
		return instance
	}

	/**
	 * 注册插件日志配置
	 * @param key 实例唯一标识
	 * @param name 插件显示名称
	 * @param enabled 是否启用日志
	 */
	private registerPlugin(key: string, name: string, enabled: boolean): void {
		this.pluginConfigs.set(key, { name, enabled })
	}

	/**
	 * 注销插件日志配置
	 * @param key 实例唯一标识
	 */
	private unregisterPlugin(key: string): void {
		this.pluginConfigs.delete(key)
	}

	/**
	 * 注销指定插件实例的日志配置
	 * @param key 实例唯一标识（instanceId 或插件名称）
	 * @description 从单例中移除指定插件实例的日志配置，通常在插件销毁时调用
	 */
	static unregister(key: string): void {
		if (Logger.instance) {
			Logger.instance.unregisterPlugin(key)
		}
	}

	/**
	 * 销毁单例实例，释放所有资源
	 * @description 清除所有已注册的插件配置，重置单例实例。主要用于测试场景
	 */
	static destroy(): void {
		if (Logger.instance) {
			Logger.instance.pluginConfigs.clear()
			Logger.instance = null
		}
	}

	/**
	 * 生成日志前缀
	 * @param pluginName 插件名称
	 * @returns 格式化的日志前缀
	 */
	private formatPrefix(pluginName: string): string {
		return `[${this.libName}:${pluginName}]`
	}

	/**
	 * 检查插件日志是否启用
	 * @param key 实例唯一标识
	 * @returns 是否启用
	 */
	private isPluginEnabled(key: string): boolean {
		return this.pluginConfigs.get(key)?.enabled ?? true
	}

	/**
	 * 统一日志输出方法
	 * @param key 实例唯一标识
	 * @param type 日志类型
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	private log(key: string, type: keyof typeof this.logTypes, message: string, data?: any): void {
		// 检查插件日志状态
		if (!this.isPluginEnabled(key)) return

		const config = this.pluginConfigs.get(key)
		const displayName = config?.name ?? key
		const prefix = this.formatPrefix(displayName)
		const logConfig = this.logTypes[type]
		const { method, icon, color, reset } = logConfig
		const logPrefix = `${icon} ${prefix}`

		if (data !== undefined && data !== null) {
			method(color + logPrefix + reset, color + message + reset, data)
		} else {
			method(color + logPrefix + reset, color + message + reset)
		}
	}

	/**
	 * 创建插件日志代理对象
	 * @param key 实例唯一标识
	 * @returns 插件日志代理对象
	 * @internal 供 BasePlugin 内部使用
	 */
	createPluginLogger(key: string): PluginLogger {
		return {
			success: (message: string, data?: any) => this.log(key, 'success', message, data),
			info: (message: string, data?: any) => this.log(key, 'info', message, data),
			warn: (message: string, data?: any) => this.log(key, 'warn', message, data),
			error: (message: string, data?: any) => this.log(key, 'error', message, data)
		}
	}
}

export * from './types'
