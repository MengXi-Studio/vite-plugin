/**
 * 基础插件配置接口
 */
export interface BasePluginOptions {
	/**
	 * 是否启用插件
	 * @default true
	 */
	enabled?: boolean
	/**
	 * 是否启用详细日志
	 * @default true
	 */
	verbose?: boolean
}
