import type { InjectRule, InjectionLogEntry } from '../types'
import type { SecurityConfig } from '@/common/html'
import { injectAtPosition, applyTemplateVars, evaluateCondition, sortRulesByPriority, sanitizeContent } from '@/common/html'

/**
 * 按优先级顺序处理所有注入规则
 *
 * @param {string} html - 原始 HTML 字符串
 * @param {InjectRule[]} rules - 注入规则数组
 * @param {Record<string, string>} [globalTemplateVars] - 全局模板变量映射
 * @param {SecurityConfig} [security] - 安全过滤配置
 * @param {{ warn: (msg: string) => void }} [logger] - 日志记录器
 * @returns {{ html: string; logs: InjectionLogEntry[] }} 处理后的 HTML 和注入日志
 *
 * @description 处理流程：
 * 1. 按优先级排序规则
 * 2. 逐条评估条件，跳过不满足条件的规则
 * 3. 应用模板变量替换
 * 4. 执行安全过滤
 * 5. 在指定位置注入内容
 * 6. 记录每条规则的执行结果日志
 *
 * @example
 * ```typescript
 * const result = processRules(html, rules, { appName: 'MyApp' }, security, logger)
 * console.log(result.logs) // 查看注入结果
 * ```
 */
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
