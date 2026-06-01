import type { HtmlInjectOptions, InjectRule } from '../types'
import type { SecurityConfig } from '@/common/html'
import { validateSecurityConfig as commonValidateSecurityConfig, sanitizeContent as commonSanitizeContent } from '@/common/html'

/**
 * 安全配置验证函数（重导出自 @/common/html）
 *
 * @see {validateSecurityConfig} in @/common/html
 */
export { commonValidateSecurityConfig as validateSecurityConfig }

/**
 * 验证注入规则数组
 *
 * @param {HtmlInjectOptions} options - 插件配置选项
 * @throws {Error} 当 rules 不是数组、为空数组或某条规则不合法时抛出错误
 *
 * @description 校验 rules 必须为非空数组，并逐条验证每条规则的内容、位置、选择器和条件。
 */
export function validateRules(options: HtmlInjectOptions): void {
	if (!options.rules || !Array.isArray(options.rules)) {
		throw new Error('rules 必须是非空数组')
	}
	if (options.rules.length === 0) {
		throw new Error('rules 不能为空数组')
	}
	for (let i = 0; i < options.rules.length; i++) {
		validateSingleRule(options.rules[i], i)
	}
}

/**
 * 验证单条注入规则
 *
 * @param {InjectRule} rule - 注入规则对象
 * @param {number} index - 规则在数组中的索引，用于错误提示
 * @throws {Error} 当规则字段不合法时抛出包含索引的错误信息
 *
 * @description 校验规则的内容、位置、选择器、优先级和条件配置。
 */
function validateSingleRule(rule: InjectRule, index: number): void {
	if (!rule.content || typeof rule.content !== 'string') {
		throw new Error(`rules[${index}].content 必须是非空字符串`)
	}
	if (!rule.position || typeof rule.position !== 'string') {
		throw new Error(`rules[${index}].position 必须是有效的注入位置`)
	}
	const validPositions: string[] = ['head-start', 'head-end', 'body-start', 'body-end', 'before-selector', 'after-selector', 'replace-selector']
	if (!validPositions.includes(rule.position)) {
		throw new Error(`rules[${index}].position 必须是 ${validPositions.join(', ')} 之一`)
	}
	if (rule.position.includes('selector') && !rule.selector) {
		throw new Error(`rules[${index}].position 为 "${rule.position}" 时，selector 为必填项`)
	}
	if (rule.priority !== undefined && (typeof rule.priority !== 'number' || rule.priority < 0)) {
		throw new Error(`rules[${index}].priority 必须是非负数`)
	}
	if (rule.condition) {
		validateCondition(rule.condition, index)
	}
}

/**
 * 验证注入条件配置
 *
 * @param {InjectRule['condition']} condition - 条件配置对象
 * @param {number} index - 规则索引，用于错误提示
 * @throws {Error} 当条件类型或值不合法时抛出错误
 *
 * @description 校验条件的 type 必须为 'env'、'file-contains' 或 'custom'，
 * 并根据类型校验 value 的类型是否匹配。
 */
function validateCondition(condition: InjectRule['condition'], index: number): void {
	if (!condition) return
	const validTypes: string[] = ['env', 'file-contains', 'custom']
	if (!validTypes.includes(condition.type)) {
		throw new Error(`rules[${index}].condition.type 必须是 ${validTypes.join(', ')} 之一`)
	}
	if (condition.type === 'custom' && typeof condition.value !== 'function') {
		throw new Error(`rules[${index}].condition.type 为 "custom" 时，value 必须是函数`)
	}
	if (condition.type !== 'custom' && typeof condition.value !== 'string') {
		throw new Error(`rules[${index}].condition.type 为 "${condition.type}" 时，value 必须是字符串`)
	}
}

/**
 * 执行全部配置验证
 *
 * @param {HtmlInjectOptions} options - 插件配置选项
 * @throws {Error} 当规则或安全配置不合法时抛出错误
 *
 * @description 依次验证注入规则和安全配置，确保插件配置完整有效。
 */
export function validateAll(options: HtmlInjectOptions): void {
	validateRules(options)
	commonValidateSecurityConfig(options.security)
}

/**
 * 对注入内容进行安全过滤
 *
 * @param {string} content - 原始 HTML 内容
 * @param {InjectRule} rule - 注入规则，包含 id 和 allowScriptInjection 配置
 * @param {SecurityConfig} [security] - 安全配置
 * @param {{ warn: (msg: string) => void }} [logger] - 日志记录器
 * @returns {string} 过滤后的安全 HTML 内容
 *
 * @description 委托 @/common/html 的 sanitizeContent 函数执行安全过滤，
 * 根据规则和安全配置移除危险标签和属性。
 */
export function sanitizeContent(content: string, rule: InjectRule, security?: SecurityConfig, logger?: { warn: (msg: string) => void }): string {
	return commonSanitizeContent(content, { id: rule.id, allowScriptInjection: rule.allowScriptInjection }, security, logger)
}
