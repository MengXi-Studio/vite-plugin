/**
 * HTML 安全过滤模块
 *
 * @module common/html/security
 * @description 提供 HTML 内容安全过滤和验证功能，防止 XSS 攻击和危险内容注入，
 * 包括危险标签检测、危险属性过滤和安全配置验证等能力。
 */

import type { SecurityConfig } from './type'
import { containsScriptTag } from '@/common/script'

/**
 * 默认阻止的 HTML 标签列表
 *
 * @description 包含可能导致安全风险的 HTML 标签：
 * - `script`：可执行 JavaScript 代码
 * - `iframe`：可嵌入外部页面
 * - `object`/`embed`/`applet`：可嵌入插件
 * - `form`/`input`/`textarea`/`select`/`button`：可创建表单
 */
export const DEFAULT_BLOCKED_TAGS = ['script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'textarea', 'select', 'button']

/**
 * 默认阻止的 HTML 事件属性列表
 *
 * @description 包含所有可能导致 JavaScript 执行的事件处理属性，
 * 涵盖鼠标事件、键盘事件、表单事件、拖拽事件和动画事件等。
 */
export const DEFAULT_BLOCKED_ATTRIBUTES = [
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
 * 验证安全配置的合法性
 *
 * @param security - 安全配置对象
 * @throws 当 `blockedTags` 不是字符串数组时抛出错误
 * @throws 当 `allowedTags` 不是字符串数组时抛出错误
 * @throws 当 `blockedAttributes` 不是字符串数组时抛出错误
 *
 * @description 检查安全配置中的数组字段是否为合法的字符串数组类型，
 * 传入 `undefined` 时直接跳过验证。
 *
 * @example
 * ```typescript
 * // 合法配置
 * validateSecurityConfig({ blockedTags: ['iframe'], allowedTags: ['div'] })
 *
 * // 非法配置（抛出错误）
 * validateSecurityConfig({ blockedTags: 'iframe' })
 * // Error: security.blockedTags 必须是字符串数组
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
 * 内容消毒规则选项
 *
 * @description 定义对单条注入规则内容进行安全过滤时的选项，
 * 控制是否允许脚本注入等特殊行为。
 */
export interface SanitizeRuleOptions {
	/** 规则标识符，用于错误消息和警告日志中标识来源规则 */
	id?: string
	/**
	 * 是否允许注入 `<script>` 标签和被阻止的标签/属性
	 *
	 * @description 设置为 `true` 时，将跳过对危险标签和属性的安全检查，
	 * 但仍会输出警告日志提醒开发者注意安全风险。
	 * 仅在注入内容来源可信时使用此选项。
	 *
	 * @default false
	 */
	allowScriptInjection?: boolean
}

/**
 * 对注入内容进行安全过滤
 *
 * @param content - 待过滤的 HTML 内容字符串
 * @param rule - 当前注入规则的消毒选项
 * @param security - 全局安全配置
 * @param logger - 日志记录器（需提供 `warn` 方法），用于输出安全警告
 * @returns 过滤后的安全 HTML 内容字符串
 * @throws 当内容包含被阻止的标签且未启用 `allowScriptInjection` 时抛出错误
 * @throws 当内容包含危险属性且未启用 `allowScriptInjection` 时抛出错误
 *
 * @description 对 HTML 内容进行安全过滤，防止 XSS 攻击：
 * 1. **标签过滤**：检测并阻止默认阻止列表中的标签（如 script、iframe），
 *    可通过 `security.allowedTags` 放行特定标签
 * 2. **属性过滤**：检测并阻止事件处理属性（如 onclick、onerror）
 * 3. **脚本检测**：特别检测 `<script>` 标签，需要显式启用 `allowScriptInjection`
 *
 * 当 `rule.allowScriptInjection` 为 `true` 时，跳过安全检查但输出警告日志。
 *
 * @example
 * ```typescript
 * // 安全内容直接通过
 * sanitizeContent('<div>safe</div>', { id: 'rule1' })
 *
 * // 包含 script 标签（抛出错误）
 * sanitizeContent('<script>alert(1)</script>', { id: 'rule2' })
 *
 * // 允许脚本注入（通过但输出警告）
 * sanitizeContent('<script>alert(1)</script>', { id: 'rule3', allowScriptInjection: true }, undefined, console)
 *
 * // 自定义安全配置
 * sanitizeContent('<iframe>test</iframe>', { id: 'rule4' }, { allowedTags: ['iframe'] })
 * ```
 */
export function sanitizeContent(content: string, rule: SanitizeRuleOptions, security?: SecurityConfig, logger?: { warn: (msg: string) => void }): string {
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
