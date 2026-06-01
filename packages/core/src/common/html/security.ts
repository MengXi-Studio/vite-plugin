import type { SecurityConfig } from './type'
import { containsScriptTag } from '@/common/script'

export const DEFAULT_BLOCKED_TAGS = ['script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'textarea', 'select', 'button']

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

export interface SanitizeRuleOptions {
	id?: string
	allowScriptInjection?: boolean
}

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
