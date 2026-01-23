import { LogLevelEnum } from '@/enum'
import type { LoggerOptions, LogLevel } from './type'

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
	 * 日志级别
	 */
	private logLevel: LogLevel

	/**
	 * 构造函数
	 * @param options 配置选项
	 */
	constructor(options: LoggerOptions) {
		this.name = options.name
		this.enabled = options.enabled ?? true
		this.showTimestamp = options.showTimestamp ?? false
		this.logLevel = options.logLevel ?? LogLevelEnum.INFO
	}

	/**
	 * 生成日志前缀
	 * @returns 格式化的日志前缀
	 */
	private formatPrefix(): string {
		let prefix = `[${this.libName}:${this.name}]`

		if (this.showTimestamp) {
			const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
			prefix = `[${timestamp}] ${prefix}`
		}

		return prefix
	}

	/**
	 * 检查日志级别是否允许输出
	 * @param level 要检查的日志级别
	 * @returns 是否允许输出
	 */
	private shouldLog(level: LogLevel): boolean {
		const levels = Object.values(LogLevelEnum) as string[]
		return levels.indexOf(this.logLevel as string) <= levels.indexOf(level as string)
	}

	/**
	 * 统一日志输出方法
	 * @param level 日志级别
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	private log(level: LogLevel, message: string, data?: any): void {
		if (!this.enabled || !this.shouldLog(level)) return

		const prefix = this.formatPrefix()
		const levelPrefix = `[${level.toUpperCase()}]`
		const logPrefix = `${prefix} ${levelPrefix}`

		const consoleMethod = this.getConsoleMethod(level)

		if (data !== undefined && data !== null) {
			consoleMethod(logPrefix, message, data)
		} else {
			consoleMethod(logPrefix, message)
		}
	}

	/**
	 * 获取对应的控制台方法
	 * @param level 日志级别
	 * @returns 控制台方法
	 */
	private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
		switch (level) {
			case LogLevelEnum.ERROR:
				return console.error
			case LogLevelEnum.WARN:
				return console.warn
			case LogLevelEnum.INFO:
				return console.info
			case LogLevelEnum.DEBUG:
				return console.debug
			case LogLevelEnum.TRACE:
				return console.trace
			default:
				return console.log
		}
	}

	/**
	 * 输出成功日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	success(message: string, data?: any): void {
		this.log(LogLevelEnum.INFO, message, data)
	}

	/**
	 * 输出信息日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	info(message: string, data?: any): void {
		this.log(LogLevelEnum.INFO, message, data)
	}

	/**
	 * 输出警告日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	warn(message: string, data?: any): void {
		this.log(LogLevelEnum.WARN, message, data)
	}

	/**
	 * 输出错误日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	error(message: string, data?: any): void {
		this.log(LogLevelEnum.ERROR, message, data)
	}

	/**
	 * 输出调试日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	debug(message: string, data?: any): void {
		this.log(LogLevelEnum.DEBUG, message, data)
	}

	/**
	 * 输出跟踪日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	trace(message: string, data?: any): void {
		this.log(LogLevelEnum.TRACE, message, data)
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
		if (options.logLevel !== undefined) {
			this.logLevel = options.logLevel
		}
	}
}
