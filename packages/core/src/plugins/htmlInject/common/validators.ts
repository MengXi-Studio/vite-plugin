import type { HtmlInjectOptions, InjectRule } from '../types'
import type { SecurityConfig } from '@/common/html'
import { validateSecurityConfig as commonValidateSecurityConfig, sanitizeContent as commonSanitizeContent } from '@/common/html'

export { commonValidateSecurityConfig as validateSecurityConfig }

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

export function validateAll(options: HtmlInjectOptions): void {
	validateRules(options)
	commonValidateSecurityConfig(options.security)
}

export function sanitizeContent(content: string, rule: InjectRule, security?: SecurityConfig, logger?: { warn: (msg: string) => void }): string {
	return commonSanitizeContent(content, { id: rule.id, allowScriptInjection: rule.allowScriptInjection }, security, logger)
}
