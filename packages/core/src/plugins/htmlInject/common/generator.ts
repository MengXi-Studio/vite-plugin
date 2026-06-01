import type { InjectRule, InjectionLogEntry } from '../types'
import type { SecurityConfig } from '@/common/html'
import { injectAtPosition, applyTemplateVars, evaluateCondition, sortRulesByPriority, sanitizeContent } from '@/common/html'

export function processRules(
	html: string,
	rules: InjectRule[],
	globalTemplateVars?: Record<string, string>,
	security?: SecurityConfig,
	logger?: { warn: (msg: string) => void }
): { html: string; logs: InjectionLogEntry[] } {
	let result = html
	const logs: InjectionLogEntry[] = []
	const sortedRules = sortRulesByPriority(rules)

	for (const rule of sortedRules) {
		const logEntry: InjectionLogEntry = {
			ruleId: rule.id || 'unnamed',
			position: rule.position!,
			selector: rule.selector,
			injected: false,
			timestamp: Date.now()
		}

		if (rule.condition) {
			const shouldInject = evaluateCondition(rule.condition, result)
			if (!shouldInject) {
				logEntry.injected = false
				logEntry.reason = '条件不满足，跳过注入'
				logs.push(logEntry)
				continue
			}
		}

		let content = applyTemplateVars(rule.content, rule.templateVars, globalTemplateVars)

		try {
			content = sanitizeContent(content, rule, security, logger)
		} catch (e) {
			logEntry.injected = false
			logEntry.reason = (e as Error).message
			logs.push(logEntry)
			logger?.warn(`规则 "${rule.id || 'unnamed'}" 安全检查失败: ${(e as Error).message}`)
			continue
		}

		const injectResult = injectAtPosition(result, content, rule.position!, rule.selector, rule.selectorMatch)
		result = injectResult.html
		logEntry.injected = injectResult.injected
		logEntry.reason = injectResult.reason
		logs.push(logEntry)
	}

	return { html: result, logs }
}
