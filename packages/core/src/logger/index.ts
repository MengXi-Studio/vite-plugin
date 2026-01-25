import type { LoggerOptions } from './types'

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
	 * 构造函数
	 * @param options 配置选项
	 */
	constructor(options: LoggerOptions) {
		this.name = options.name
		this.enabled = options.enabled ?? false
	}

	/**
	 * 生成日志前缀
	 * @returns 格式化的日志前缀
	 */
	private formatPrefix(): string {
		let prefix = `[${this.libName}:${this.name}]`

		const timestamp = new Date().toLocaleString()
		prefix = `[${timestamp}] ${prefix}`

		return prefix
	}

	/**
	 * 统一日志输出方法
	 * @param type 日志类型
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	private log(type: keyof typeof this.logTypes, message: string, data?: any): void {
		if (!this.enabled) return

		const prefix = this.formatPrefix()
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
	 * 输出成功日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	success(message: string, data?: any): void {
		this.log('success', message, data)
	}

	/**
	 * 输出信息日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	info(message: string, data?: any): void {
		this.log('info', message, data)
	}

	/**
	 * 输出警告日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	warn(message: string, data?: any): void {
		this.log('warn', message, data)
	}

	/**
	 * 输出错误日志
	 * @param message 日志消息
	 * @param data 附加数据
	 */
	error(message: string, data?: any): void {
		this.log('error', message, data)
	}
}
