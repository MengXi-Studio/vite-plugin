import type { BasePluginOptions } from '@/factory/types'

/**
 * 环境变量值类型
 *
 * @typedef {('string' | 'number' | 'url' | 'boolean' | 'enum' | 'json' | 'semver' | 'path')} EnvType
 * @description 支持的环境变量值类型：
 * - `string`: 字符串类型（默认）
 * - `number`: 数字类型，自动校验是否为合法数字
 * - `url`: URL 类型，使用 URL 构造函数校验
 * - `boolean`: 布尔类型，接受 'true'/'false'/'1'/'0'/'yes'/'no'
 * - `enum`: 枚举类型，必须在 enumValues 指定的值列表中
 * - `json`: JSON 类型，校验是否为合法 JSON 字符串
 * - `semver`: 语义化版本号类型，校验是否为 x.y.z 格式
 * - `path`: 文件路径类型，校验路径格式合法性
 */
export type EnvType = 'string' | 'number' | 'url' | 'boolean' | 'enum' | 'json' | 'semver' | 'path'

/**
 * 单个环境变量的校验规则
 *
 * @interface EnvFieldRule
 * @description 定义单个环境变量的校验规则，包括类型校验、
 * 自定义校验函数、正则匹配、枚举值约束等
 */
export interface EnvFieldRule {
	/** 环境变量值类型，默认 'string' */
	type?: EnvType
	/** 是否为必需变量，默认 true */
	required?: boolean
	/** 自定义正则校验 */
	pattern?: RegExp
	/** 自定义校验函数，返回 true 表示校验通过 */
	validator?: (value: string) => boolean | string
	/** 校验失败时的自定义错误信息 */
	message?: string
	/** 变量缺失时使用的默认值（仅在 required 为 false 时生效） */
	default?: string
	/** 枚举值列表（仅在 type 为 'enum' 时生效） */
	enumValues?: string[]
	/** 数值最小值（仅在 type 为 'number' 时生效） */
	minValue?: number
	/** 数值最大值（仅在 type 为 'number' 时生效） */
	maxValue?: number
	/** 字符串最小长度（仅在 type 为 'string' 时生效） */
	minLength?: number
	/** 字符串最大长度（仅在 type 为 'string' 时生效） */
	maxLength?: number
	/** 分组标签，用于模板生成时的分组展示 */
	group?: string
	/** 变量描述，用于模板生成时的注释 */
	description?: string
	/** 是否在模板中标记为敏感变量（如密码、密钥） */
	sensitive?: boolean
}

/**
 * 校验失败时的处理动作
 *
 * @typedef {('error' | 'warn' | 'ignore')} EnvFailAction
 * @description 校验失败时的处理策略：
 * - `error`: 抛出错误，中断构建
 * - `warn`: 输出警告，继续构建
 * - `ignore`: 静默忽略，不输出任何信息
 */
export type EnvFailAction = 'error' | 'warn' | 'ignore'

/**
 * 运行时守卫的行为模式
 *
 * @typedef {('console' | 'throw' | 'overlay')} RuntimeGuardMode
 * @description 运行时环境变量守卫的行为模式：
 * - `console`: 在控制台输出警告信息
 * - `throw`: 抛出运行时错误
 * - `overlay`: 在页面上显示警告覆盖层
 */
export type RuntimeGuardMode = 'console' | 'throw' | 'overlay'

/**
 * 单个环境变量的校验结果
 *
 * @interface EnvValidationResult
 * @description 记录单个环境变量的校验结果，包括变量名、
 * 校验状态、错误信息等
 */
export interface EnvValidationResult {
	/** 环境变量名 */
	key: string
	/** 校验状态：通过、缺失、类型错误、自定义校验失败、枚举值不匹配、范围越界、长度越界 */
	status: 'pass' | 'missing' | 'type_error' | 'custom_error' | 'enum_mismatch' | 'range_error' | 'length_error'
	/** 校验失败时的错误信息 */
	message: string
	/** 当前值（可能为 undefined） */
	value: string | undefined
	/** 期望的规则 */
	rule: EnvFieldRule
}

/**
 * 整体校验结果
 *
 * @interface EnvGuardResult
 * @description 包含所有环境变量的校验结果汇总
 */
export interface EnvGuardResult {
	/** 校验时间戳（ISO 格式） */
	timestamp: string
	/** 总校验变量数 */
	total: number
	/** 通过校验的变量数 */
	passed: number
	/** 缺失的变量数 */
	missing: number
	/** 校验失败的变量数 */
	invalid: number
	/** 每个变量的详细校验结果 */
	results: EnvValidationResult[]
	/** 是否全部通过 */
	allPassed: boolean
}

/**
 * 环境变量守卫插件的配置选项
 *
 * @interface EnvGuardOptions
 * @extends {BasePluginOptions}
 *
 * @example
 * ```typescript
 * envGuard({
 *   required: {
 *     VITE_API_BASE_URL: {
 *       type: 'url',
 *       required: true,
 *       message: 'API 基础地址必须为合法 URL'
 *     },
 *     VITE_APP_TITLE: {
 *       type: 'string',
 *       required: true,
 *       minLength: 1,
 *       maxLength: 50
 *     },
 *     VITE_ENABLE_ANALYTICS: {
 *       type: 'boolean',
 *       required: false,
 *       default: 'false'
 *     }
 *   },
 *   failAction: 'error',
 *   generateTemplate: true,
 *   runtimeGuard: true
 * })
 * ```
 */
export interface EnvGuardOptions extends BasePluginOptions {
	/** 必需的环境变量规则映射，键为变量名，值为校验规则 */
	required?: Record<string, EnvFieldRule>
	/** 校验失败时的处理动作，默认 'error' */
	failAction?: EnvFailAction
	/** 是否自动生成 .env 模板文件，默认 true */
	generateTemplate?: boolean
	/** 模板文件输出路径，默认 '.env.template' */
	templateOutput?: string
	/** 是否注入运行时环境变量守卫代码，默认 false */
	runtimeGuard?: boolean
	/** 运行时守卫的全局变量名，默认 '__ENV_GUARD__' */
	runtimeGlobalName?: string
	/** 运行时守卫的行为模式，默认 'console' */
	runtimeGuardMode?: RuntimeGuardMode
	/** 需要扫描的 .env 文件列表，默认 ['.env', '.env.local', '.env.production', '.env.development'] */
	envFiles?: string[]
	/** 是否在校验前自动加载 .env 文件，默认 true */
	autoLoadEnv?: boolean
	/** 校验结果报告输出路径，设为 false 则不生成报告 */
	reportOutput?: string | false
	/** 是否在构建前执行校验（configResolved 阶段），默认 true */
	validateBeforeBuild?: boolean
	/** 是否在构建后输出校验摘要，默认 true */
	showSummary?: boolean
}
