import type { BasePluginOptions } from '@/factory/types'

/**
 * 选择器匹配模式
 *
 * @description
 * - 'string': 使用字符串精确匹配（默认）
 * - 'regex': 使用正则表达式匹配，支持更灵活的模式
 */
export type SelectorMatch = 'string' | 'regex'

/**
 * HTML 内容注入位置
 *
 * @description
 * - 'head-start': 注入到 `<head>` 标签开始之后
 * - 'head-end': 注入到 `</head>` 标签之前
 * - 'body-start': 注入到 `<body>` 标签开始之后
 * - 'body-end': 注入到 `</body>` 标签之前
 * - 'before-selector': 注入到指定选择器之前
 * - 'after-selector': 注入到指定选择器之后
 * - 'replace-selector': 替换指定选择器匹配的内容
 */
export type InjectPosition = 'head-start' | 'head-end' | 'body-start' | 'body-end' | 'before-selector' | 'after-selector' | 'replace-selector'

/**
 * 条件类型
 *
 * @description
 * - 'env': 基于环境变量判断
 * - 'file-contains': 基于 HTML 文件内容判断
 * - 'custom': 基于自定义函数判断
 */
export type ConditionType = 'env' | 'file-contains' | 'custom'

/**
 * 注入条件接口
 *
 * @interface InjectCondition
 * @description 定义内容注入的触发条件，支持环境变量检测、文件内容检测和自定义函数
 */
export interface InjectCondition {
	/**
	 * 条件类型
	 */
	type: ConditionType

	/**
	 * 条件值
	 *
	 * @description
	 * - 当 type 为 'env' 时，为环境变量名（字符串）
	 * - 当 type 为 'file-contains' 时，为要搜索的字符串（字符串）
	 * - 当 type 为 'custom' 时，为返回布尔值的判断函数
	 */
	value: string | ((...args: any[]) => boolean)

	/**
	 * 是否对条件结果取反
	 *
	 * @default false
	 */
	negate?: boolean
}

/**
 * 注入规则接口
 *
 * @interface InjectRule
 * @description 定义单条 HTML 内容注入规则，包括注入内容、位置、条件、优先级等
 */
export interface InjectRule {
	/**
	 * 规则唯一标识符，用于日志记录和调试
	 */
	id?: string

	/**
	 * 要注入的 HTML 内容
	 *
	 * @example '<meta name="description" content="My App">'
	 */
	content: string

	/**
	 * 注入位置
	 */
	position: InjectPosition

	/**
	 * 选择器字符串，当 position 为 selector 相关位置时必填
	 *
	 * @description 当 selectorMatch 为 'string' 时，使用字符串精确匹配；
	 * 当 selectorMatch 为 'regex' 时，使用正则表达式匹配
	 *
	 * @example '<div id="app">'
	 */
	selector?: string

	/**
	 * 选择器匹配模式
	 *
	 * @default 'string'
	 */
	selectorMatch?: SelectorMatch

	/**
	 * 规则优先级，数值越小优先级越高，越先执行
	 *
	 * @default 100
	 */
	priority?: number

	/**
	 * 注入条件，满足条件时才执行注入
	 */
	condition?: InjectCondition

	/**
	 * 规则级模板变量，会覆盖全局模板变量
	 *
	 * @description 使用 `{{变量名}}` 语法在 content 中引用变量
	 *
	 * @example { greeting: 'Hello', name: 'World' }
	 */
	templateVars?: Record<string, string>

	/**
	 * 是否允许注入脚本等危险内容
	 *
	 * @default false
	 * @remarks 启用此选项将跳过安全检查，请确保注入内容来源可信
	 */
	allowScriptInjection?: boolean
}

/**
 * 安全配置接口
 *
 * @interface SecurityConfig
 * @description 控制 HTML 注入内容的安全过滤行为，防止 XSS 攻击
 */
export interface SecurityConfig {
	/**
	 * 是否阻止危险标签（script、iframe、object 等）
	 *
	 * @default true
	 */
	blockDangerousTags?: boolean

	/**
	 * 是否阻止危险属性（onclick、onload 等事件处理器）
	 *
	 * @default true
	 */
	blockDangerousAttributes?: boolean

	/**
	 * 允许通过的标签白名单，白名单中的标签不会被阻止
	 *
	 * @example ['iframe', 'object']
	 */
	allowedTags?: string[]

	/**
	 * 自定义阻止标签列表，覆盖默认阻止列表
	 *
	 * @example ['div', 'span']
	 */
	blockedTags?: string[]

	/**
	 * 自定义阻止属性列表，覆盖默认阻止列表
	 *
	 * @example ['data-custom', 'data-track']
	 */
	blockedAttributes?: string[]
}

/**
 * 注入日志条目接口
 *
 * @interface InjectionLogEntry
 * @description 记录单条注入规则的执行结果，用于调试和问题排查
 */
export interface InjectionLogEntry {
	/**
	 * 规则标识符
	 */
	ruleId: string

	/**
	 * 注入位置
	 */
	position: InjectPosition

	/**
	 * 使用的选择器
	 */
	selector?: string

	/**
	 * 是否注入成功
	 */
	injected: boolean

	/**
	 * 注入失败原因
	 */
	reason?: string

	/**
	 * 日志时间戳
	 */
	timestamp: number
}

/**
 * HTML 注入插件的配置选项接口
 *
 * @interface HtmlInjectOptions
 * @extends {BasePluginOptions}
 */
export interface HtmlInjectOptions extends BasePluginOptions {
	/**
	 * 目标 HTML 文件路径或文件名
	 *
	 * @default 'index.html'
	 * @description 支持相对路径和文件名匹配，默认匹配所有 index.html 文件
	 *
	 * @example 'index.html'
	 * @example 'src/views/home.html'
	 */
	targetFile?: string

	/**
	 * 注入规则数组
	 *
	 * @description 定义要注入的 HTML 内容及其注入位置和条件，规则按 priority 升序执行
	 */
	rules: InjectRule[]

	/**
	 * 安全配置
	 *
	 * @description 控制注入内容的安全过滤行为，防止 XSS 攻击
	 */
	security?: SecurityConfig

	/**
	 * 全局模板变量，可被规则级 templateVars 覆盖
	 *
	 * @description 使用 `{{变量名}}` 语法在 content 中引用变量
	 *
	 * @example { appName: 'My App', version: '1.0.0' }
	 */
	templateVars?: Record<string, string>

	/**
	 * 是否在控制台输出注入日志
	 *
	 * @default true
	 */
	logInjection?: boolean
}
