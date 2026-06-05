import type { BasePluginOptions } from '@/factory/plugin'

/**
 * 进度条显示格式类型
 *
 * @description
 * - 'bar': 完整进度条模式，显示旋转动画 + 阶段标签 + 进度条 + 百分比 + 模块名
 * - 'spinner': 旋转动画模式，显示旋转动画 + 阶段标签 + 百分比
 * - 'minimal': 精简模式，仅显示阶段标签 + 百分比
 */
export type ProgressFormat = 'bar' | 'spinner' | 'minimal'

/**
 * 构建进度插件的配置选项接口
 *
 * @interface BuildProgressOptions
 */
export interface BuildProgressOptions extends BasePluginOptions {
	/**
	 * 进度条宽度（字符数）
	 *
	 * @default 30
	 */
	width?: number

	/**
	 * 进度条显示格式
	 *
	 * @default 'bar'
	 */
	format?: ProgressFormat

	/**
	 * 已完成部分的填充字符
	 *
	 * @default '█'
	 * @example '█'、'■'、'='
	 */
	completeChar?: string

	/**
	 * 未完成部分的填充字符
	 *
	 * @default '░'
	 * @example '░'、'□'、'-'
	 */
	incompleteChar?: string

	/**
	 * 构建完成后是否清除进度条
	 *
	 * @default true
	 * @description 设为 false 时，构建完成后保留 100% 进度条在终端中
	 */
	clearOnComplete?: boolean

	/**
	 * 是否显示当前正在处理的模块名称
	 *
	 * @default true
	 * @description 仅在 transform 阶段显示，模块名超长时自动截断
	 */
	showModuleName?: boolean

	/**
	 * 自定义颜色主题
	 *
	 * @remarks
	 * 每个属性是一个接受字符串并返回带 ANSI 颜色码字符串的函数。
	 * 未提供的属性将使用默认主题。
	 */
	theme?: ProgressTheme
}

/**
 * 进度条颜色主题接口
 *
 * @interface ProgressTheme
 * @description 定义进度条各部分的颜色渲染函数，每个函数接受文本并返回带 ANSI 颜色码的字符串
 */
export interface ProgressTheme {
	/**
	 * 已完成部分的颜色渲染函数
	 *
	 * @param text - 需要着色的文本
	 * @returns 带 ANSI 颜色码的字符串
	 */
	completeColor: (text: string) => string

	/**
	 * 未完成部分的颜色渲染函数
	 *
	 * @param text - 需要着色的文本
	 * @returns 带 ANSI 颜色码的字符串
	 */
	incompleteColor: (text: string) => string

	/**
	 * 百分比数字的颜色渲染函数
	 *
	 * @param text - 需要着色的文本
	 * @returns 带 ANSI 颜色码的字符串
	 */
	percentageColor: (text: string) => string

	/**
	 * 阶段标签的颜色渲染函数
	 *
	 * @param text - 需要着色的文本
	 * @returns 带 ANSI 颜色码的字符串
	 */
	phaseColor: (text: string) => string

	/**
	 * 模块名称的颜色渲染函数
	 *
	 * @param text - 需要着色的文本
	 * @returns 带 ANSI 颜色码的字符串
	 */
	moduleColor: (text: string) => string
}

/**
 * 构建阶段类型
 *
 * @description
 * - 'idle': 空闲状态，插件尚未开始工作
 * - 'config': 读取配置阶段
 * - 'resolve': 解析模块依赖阶段
 * - 'transform': 转换模块阶段
 * - 'bundle': 打包阶段（仅生产构建）
 * - 'write': 写入文件阶段
 * - 'done': 构建完成
 */
export type BuildPhase = 'idle' | 'config' | 'resolve' | 'transform' | 'bundle' | 'write' | 'done'
