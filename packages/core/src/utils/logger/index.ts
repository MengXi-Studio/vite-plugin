import type { LoggerOptions } from './type'

/**
 * 日志工具类
 */
export class Logger {
	/**
	 * 库名称
	 */
	private readonly libName: string = '@meng-xi/vite-plugin'
	/**
	 * 插件名称
	 */
	private name: string
	/**
	 * 是否启用日志
	 */
	private enabled: boolean
	/**
	 * 是否显示时间戳
	 */
	private showTimestamp: boolean

	/**
	 * 构造函数
	 * @param options 配置选项
	 */
	constructor(options: LoggerOptions) {
		this.name = options.name
		this.enabled = options.enabled ?? false
		this.showTimestamp = options.showTimestamp ?? false
	}

	/**
	 * 生成日志前缀
	 * @returns 格式化的日志前缀
	 */
	private formatPrefix(): string {
		let prefix = `[${this.libName}:${this.name}]`

		if (this.showTimestamp) {
			const timestamp = new Date().toLocaleString()
			prefix = `[${timestamp}] ${prefix}`
		}

		return prefix
	}

	/**
	 * 统一日志输出方法
	 * @param method 日志方法
	 * @param message 日志消息
	 * @param data 附加数据
	 * @param icon 日志图标
	 */
	private log(method: (...args: any[]) => void, message: string, data?: any, icon?: string): void {
		if (!this.enabled) return

		const prefix = this.formatPrefix()
		const logPrefix = icon ? `${icon} ${prefix}` : prefix

		if (data !== undefined && data !== null) {
			method(logPrefix, message, data)
		} else {
			method(logPrefix, message)
		}
	}

	/**
	 * 输出成功日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	success(message: string, data?: any): void {
		this.log(console.log, message, data, '✅')
	}

	/**
	 * 输出信息日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	info(message: string, data?: any): void {
		this.log(console.log, message, data)
	}

	/**
	 * 输出警告日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	warn(message: string, data?: any): void {
		this.log(console.warn, message, data, '⚠')
	}

	/**
	 * 输出错误日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	error(message: string, data?: any): void {
		this.log(console.error, message, data, '❌')
	}

	/**
	 * 更新日志配置
	 * @param options 配置选项
	 */
	configure(options: Partial<LoggerOptions>): void {
		if (options.enabled !== undefined) {
			this.enabled = options.enabled
		}
		if (options.showTimestamp !== undefined) {
			this.showTimestamp = options.showTimestamp
		}
	}
}
