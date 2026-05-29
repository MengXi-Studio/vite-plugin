import type { HtmlInjectOptions, InjectRule, SecurityConfig } from '../types'
import { containsScriptTag } from '@/common'

/**
 * 默认阻止的 HTML 标签列表
 *
 * @description 这些标签可能带来安全风险（XSS 攻击、表单劫持等），
 * 默认情况下会被安全过滤机制阻止
 */
const DEFAULT_BLOCKED_TAGS = ['script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'textarea', 'select', 'button']

/**
 * 默认阻止的 HTML 属性列表
 *
 * @description 这些事件处理器属性可能被用于执行恶意脚本，
 * 默认情况下会被安全过滤机制阻止
 */
const DEFAULT_BLOCKED_ATTRIBUTES = [
	'onclick',
	'ondblclick',
	'onmouseover',
	'onmouseout',
	'onmousemove',
	'onmousedown',
	'onmouseup',
	'onkeydown',
	'onkeyup',
	'onkeypress',
	'onload',
	'onerror',
	'onfocus',
	'onblur',
	'onsubmit',
	'onchange',
	'oninput',
	'oncontextmenu',
	'ondrag',
	'ondrop',
	'onanimationend',
	'ontransitionend'
]

/**
 * 验证注入规则数组
 *
 * @description 检查 rules 是否为非空数组，并逐条验证每条规则的合法性
 *
 * @param options - 插件配置选项，包含 rules 数组
 * @throws {Error} 当 rules 不是数组、为空数组或某条规则不合法时抛出错误
 *
 * @example
 * ```ts
 * validateRules({ rules: [{ content: '<div>test</div>', position: 'head-end' }] })
 * // 验证通过，不抛出异常
 *
 * validateRules({ rules: [] })
 * // 抛出错误: "rules 不能为空数组"
 * ```
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
 * @param rule - 待验证的注入规则
 * @param index - 规则在数组中的索引，用于错误信息定位
 * @throws {Error} 当规则的字段不合法时抛出错误
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
 * @param condition - 注入条件对象
 * @param index - 规则索引，用于错误信息定位
 * @throws {Error} 当条件类型或值不合法时抛出错误
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
 * 验证安全配置
 *
 * @description 检查安全配置中的数组类型字段是否合法
 *
 * @param security - 安全配置对象
 * @throws {Error} 当配置字段类型不正确时抛出错误
 *
 * @example
 * ```ts
 * validateSecurityConfig({ blockedTags: ['div'] })  // 通过
 * validateSecurityConfig({ blockedTags: 'div' })     // 抛出错误
 * ```
 */
export function validateSecurityConfig(security?: SecurityConfig): void {
	if (!security) return
	if (security.blockedTags && !Array.isArray(security.blockedTags)) {
		throw new Error('security.blockedTags 必须是字符串数组')
	}
	if (security.allowedTags && !Array.isArray(security.allowedTags)) {
		throw new Error('security.allowedTags 必须是字符串数组')
	}
	if (security.blockedAttributes && !Array.isArray(security.blockedAttributes)) {
		throw new Error('security.blockedAttributes 必须是字符串数组')
	}
}

/**
 * 执行所有验证
 *
 * @description 依次执行规则验证和安全配置验证，确保插件配置完全合法
 *
 * @param options - 插件配置选项
 * @throws {Error} 当任何验证不通过时抛出错误
 */
export function validateAll(options: HtmlInjectOptions): void {
	validateRules(options)
	validateSecurityConfig(options.security)
}

/**
 * 安全过滤注入内容
 *
 * @description 根据安全配置对注入内容进行过滤，阻止危险标签和属性。
 * 当规则的 `allowScriptInjection` 为 true 时，会跳过安全检查但输出警告日志。
 *
 * 处理逻辑：
 * 1. 检查是否包含 `<script>` 标签，未启用脚本注入时抛出错误
 * 2. 检查是否包含其他危险标签，根据白名单和阻止列表过滤
 * 3. 检查是否包含危险属性（事件处理器），根据阻止列表过滤
 *
 * @param content - 待过滤的 HTML 内容
 * @param rule - 关联的注入规则，用于获取 allowScriptInjection 标志和规则 ID
 * @param security - 安全配置，控制过滤行为
 * @param logger - 日志记录器，用于输出安全警告
 * @returns 过滤后的安全 HTML 内容
 * @throws {Error} 当内容包含被阻止的标签或属性且未启用 allowScriptInjection 时抛出错误
 *
 * @example
 * ```ts
 * // 正常内容，通过过滤
 * sanitizeContent('<div>safe</div>', { content: '<div>safe</div>', position: 'head-end' })
 *
 * // 包含 script 标签，抛出错误
 * sanitizeContent('<script>alert(1)</script>', { content: '<script>alert(1)</script>', position: 'head-end' })
 *
 * // 启用脚本注入，通过但输出警告
 * sanitizeContent('<script>alert(1)</script>', {
 *   content: '<script>alert(1)</script>',
 *   position: 'head-end',
 *   allowScriptInjection: true
 * }, undefined, console)
 * ```
 */
export function sanitizeContent(content: string, rule: InjectRule, security?: SecurityConfig, logger?: { warn: (msg: string) => void }): string {
	const blockDangerousTags = security?.blockDangerousTags !== false
	const blockDangerousAttributes = security?.blockDangerousAttributes !== false
	const blockedTags = security?.blockedTags || DEFAULT_BLOCKED_TAGS
	const allowedTags = security?.allowedTags
	const blockedAttributes = security?.blockedAttributes || DEFAULT_BLOCKED_ATTRIBUTES

	let sanitized = content

	if (blockDangerousTags) {
		const tagsToBlock = allowedTags ? blockedTags.filter(t => !allowedTags.includes(t)) : blockedTags

		if (containsScriptTag(content)) {
			if (rule.allowScriptInjection) {
				logger?.warn(`[安全警告] 规则 "${rule.id || 'unnamed'}" 已启用脚本注入(allowScriptInjection=true)，` + `请确保注入内容来源可信。注入脚本可能带来 XSS 攻击风险。`)
			} else {
				throw new Error(`规则 "${rule.id || 'unnamed'}" 的内容包含 <script> 标签，默认被阻止。` + `如需注入脚本，请设置 allowScriptInjection: true`)
			}
		}

		for (const tag of tagsToBlock) {
			if (tag === 'script') continue
			const tagRegex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi')
			const selfCloseRegex = new RegExp(`<${tag}\\b[^>]*/?>`, 'gi')
			if (tagRegex.test(sanitized) || selfCloseRegex.test(sanitized)) {
				if (rule.allowScriptInjection) {
					logger?.warn(`[安全警告] 规则 "${rule.id || 'unnamed'}" 包含被阻止的标签 <${tag}>，` + `已通过 allowScriptInjection 跳过安全检查，请确保内容可信。`)
					continue
				} else {
					throw new Error(`规则 "${rule.id || 'unnamed'}" 的内容包含被阻止的标签 <${tag}>。` + `如需注入此标签，请设置 allowScriptInjection: true 或在 security.allowedTags 中添加 "${tag}"`)
				}
			}
			sanitized = sanitized.replace(tagRegex, '')
			sanitized = sanitized.replace(selfCloseRegex, '')
		}
	}

	if (blockDangerousAttributes) {
		for (const attr of blockedAttributes) {
			const attrRegex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi')
			if (attrRegex.test(sanitized)) {
				if (rule.allowScriptInjection) {
					logger?.warn(`[安全警告] 规则 "${rule.id || 'unnamed'}" 包含危险属性 ${attr}，` + `已通过 allowScriptInjection 跳过安全检查，请确保内容可信。`)
					continue
				} else {
					throw new Error(`规则 "${rule.id || 'unnamed'}" 的内容包含危险属性 ${attr}。` + `如需注入此属性，请设置 allowScriptInjection: true`)
				}
			}
			sanitized = sanitized.replace(attrRegex, '')
		}
	}

	return sanitized
}
