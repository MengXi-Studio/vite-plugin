import type { SecurityConfig } from './type'

/**
 * 转义 HTML 属性值中的特殊字符
 *
 * @param str - 需要转义的字符串
 * @returns 转义后的安全字符串
 *
 * @description 将字符串中的 `&`、`"`、`'`、`<`、`>` 转义为对应的 HTML 实体，
 * 防止在 HTML 属性值中注入恶意代码。
 *
 * @example
 * ```typescript
 * escapeHtmlAttr('hello "world" & <friends>')
 * // 'hello &quot;world&quot; &amp; &lt;friends&gt;'
 * ```
 */
export function escapeHtmlAttr(str: string): string {
	return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * 检测字符串是否包含 `<script>` 标签
 */
function containsScriptTag(str: string): boolean {
	return /<script\b/i.test(str)
}

/**
 * 默认阻止的 HTML 标签列表
 */
const DEFAULT_BLOCKED_TAGS = ['script', 'iframe', 'object', 'embed', 'applet', 'form', 'input', 'textarea', 'select', 'button']

/**
 * 默认阻止的 HTML 事件属性列表
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
 * 内容消毒规则选项
 */
export interface SanitizeRuleOptions {
	id?: string
	allowScriptInjection?: boolean
}

/**
 * 对注入内容进行安全过滤
 *
 * @param content - 待过滤的 HTML 内容字符串
 * @param rule - 当前注入规则的消毒选项
 * @param security - 全局安全配置
 * @param logger - 日志记录器
 * @returns 过滤后的安全 HTML 内容字符串
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
