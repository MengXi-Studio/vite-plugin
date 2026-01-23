/**
 * 构造函数参数接口
 */
export interface LoggerOptions {
	/**
	 * 插件名称
	 */
	name: string
	/**
	 * 是否启用日志
	 */
	enabled?: boolean
	/**
	 * 是否显示时间戳
	 */
	showTimestamp?: boolean
}
