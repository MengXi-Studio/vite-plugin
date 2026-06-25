import type { IncomingMessage, ServerResponse } from 'node:http'
import type { ProxyLogLevel, ProxyLogEntry, ResolvedProxyRule } from '../types'
import { matchRule } from './matcher'

/**
 * 格式化请求日志字符串
 *
 * @param {ProxyLogEntry} entry - 日志条目
 * @param {ProxyLogLevel} level - 日志级别
 * @returns {string} 格式化后的日志字符串
 *
 * @description 根据日志级别输出不同详细程度的信息：
 * - basic: `[PROXY] GET /api/users → http://localhost:3000`
 * - verbose: `[PROXY] GET /api/users → http://localhost:3000 [200] 45ms`
 */
export function formatLogEntry(entry: ProxyLogEntry, level: ProxyLogLevel): string {
	const { method, path, target, ruleKey } = entry

	if (level === 'basic') {
		return `${method} ${path} → ${target} (${ruleKey})`
	}

	// verbose
	const status = entry.statusCode ? ` [${entry.statusCode}]` : ''
	const duration = entry.duration ? ` ${entry.duration}ms` : ''
	const delayed = entry.delayed ? ' ⏱' : ''
	return `${method} ${path} → ${target} (${ruleKey})${status}${duration}${delayed}`
}

/**
 * 创建代理请求日志中间件
 *
 * @param {ResolvedProxyRule[]} rules - 已解析的代理规则
 * @param {ProxyLogLevel} logLevel - 日志级别
 * @param {(msg: string) => void} logFn - 日志输出函数
 * @returns {(req: IncomingMessage, res: ServerResponse, next: () => void) => void} Connect 中间件
 *
 * @description 在开发服务器中拦截代理请求，记录请求日志。
 * 仅当 logLevel 不为 'none' 时生效。
 * 通过监听 response 的 'finish' 事件获取状态码和耗时。
 */
export function createLoggingMiddleware(rules: ResolvedProxyRule[], logLevel: ProxyLogLevel, logFn: (msg: string) => void): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
	if (logLevel === 'none') {
		return (_req: IncomingMessage, _res: ServerResponse, next: () => void) => next()
	}

	return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
		const startTime = Date.now()
		const method = req.method || 'GET'
		const url = req.url || '/'

		// 查找匹配的规则
		const matched = rules.find(r => matchRule(url, r.rule))

		if (!matched) {
			next()
			return
		}

		const entry: ProxyLogEntry = {
			timestamp: startTime,
			method,
			path: url,
			ruleKey: matched.key,
			target: matched.rule.target
		}

		// 监听响应完成事件
		res.on('finish', () => {
			entry.statusCode = res.statusCode
			entry.duration = Date.now() - startTime

			const logLine = formatLogEntry(entry, logLevel)
			logFn(logLine)
		})

		next()
	}
}
