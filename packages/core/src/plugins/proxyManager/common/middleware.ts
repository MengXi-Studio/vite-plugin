import type { IncomingMessage, ServerResponse } from 'node:http'
import type { DelayConfig, ResolvedProxyRule } from '../types'
import { matchRule } from './matcher'

/**
 * 计算延迟时间（毫秒）
 *
 * @param {DelayConfig} delay - 延迟配置
 * @returns {number} 延迟毫秒数
 *
 * @description 支持三种配置：
 * - `false`: 不延迟，返回 0
 * - `number`: 固定延迟
 * - `{ min, max }`: 在 [min, max] 范围内随机延迟
 */
export function calculateDelay(delay: DelayConfig): number {
	if (delay === false) return 0

	if (typeof delay === 'number') {
		return Math.max(0, delay)
	}

	const { min, max } = delay
	const safeMin = Math.max(0, min)
	const safeMax = Math.max(safeMin, max)
	return safeMin + Math.random() * (safeMax - safeMin)
}

/**
 * 获取规则的有效延迟配置
 *
 * @param {ResolvedProxyRule} rule - 已解析的代理规则
 * @param {DelayConfig} defaultDelay - 全局默认延迟
 * @returns {DelayConfig} 规则的实际延迟配置
 *
 * @description 规则自身的 delay 优先，未配置时使用 defaultDelay
 */
export function getEffectiveDelay(rule: ResolvedProxyRule, defaultDelay: DelayConfig): DelayConfig {
	if (rule.rule.delay !== undefined) return rule.rule.delay
	return defaultDelay
}

/**
 * 创建延迟模拟中间件
 *
 * @param {ResolvedProxyRule[]} rules - 已解析的代理规则
 * @param {DelayConfig} defaultDelay - 全局默认延迟
 * @param {(msg: string) => void} logFn - 日志输出函数
 * @returns {(req: IncomingMessage, res: ServerResponse, next: () => void) => void} Connect 中间件
 *
 * @description 在开发服务器中拦截匹配代理规则的请求，
 * 按配置的延迟时间暂停后再转发，用于模拟慢网络环境。
 * 仅对匹配代理规则且配置了延迟的请求生效。
 */
export function createDelayMiddleware(rules: ResolvedProxyRule[], defaultDelay: DelayConfig, logFn: (msg: string) => void): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
	if (defaultDelay === false && rules.every(r => r.rule.delay === undefined)) {
		// 无任何延迟配置，跳过中间件
		return (_req: IncomingMessage, _res: ServerResponse, next: () => void) => next()
	}

	return (req: IncomingMessage, _res: ServerResponse, next: () => void) => {
		const url = req.url || '/'

		// 查找匹配的规则
		const matched = rules.find(r => matchRule(url, r.rule))

		if (!matched) {
			next()
			return
		}

		const effectiveDelay = getEffectiveDelay(matched, defaultDelay)
		const delayMs = calculateDelay(effectiveDelay)

		if (delayMs <= 0) {
			next()
			return
		}

		const method = req.method || 'GET'
		logFn(`${method} ${url} ⏱ 延迟 ${Math.round(delayMs)}ms`)

		setTimeout(() => next(), delayMs)
	}
}
