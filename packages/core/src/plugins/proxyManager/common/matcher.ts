import type { ServerResponse } from 'node:http'
import type { ProxyRule, ResolvedProxyRule } from '../types'

/**
 * 将代理规则的 context 转换为 Vite proxy 配置的 key 字符串
 *
 * @param {string | RegExp} context - 代理规则的匹配上下文
 * @returns {string} 用于 Vite server.proxy 配置的 key
 *
 * @description 字符串 context 直接使用，正则 context 转换为 `^` + source 形式，
 * Vite 内部的 http-proxy-middleware 会将字符串作为前缀匹配，正则作为完整匹配
 */
export function contextToKey(context: string | RegExp): string {
	if (typeof context === 'string') return context
	return context.toString()
}

/**
 * 判断请求路径是否匹配代理规则
 *
 * @param {string} path - 请求路径
 * @param {ProxyRule} rule - 代理规则
 * @returns {boolean} 是否匹配
 *
 * @description 字符串 context 使用前缀匹配（与 Vite 默认行为一致），
 * 正则 context 使用 test 方法匹配
 */
export function matchRule(path: string, rule: ProxyRule): boolean {
	const { context } = rule

	if (typeof context === 'string') {
		return path.startsWith(context)
	}

	return context.test(path)
}

/**
 * 按环境过滤代理规则
 *
 * @param {ProxyRule[]} rules - 全部代理规则
 * @param {string} currentEnv - 当前环境标识
 * @returns {ProxyRule[]} 过滤后的规则列表
 *
 * @description 如果规则的 env 为空或未定义，则在所有环境生效；
 * 否则仅当 currentEnv 包含在 env 列表中时生效
 */
export function filterRulesByEnv(rules: ProxyRule[], currentEnv: string): ProxyRule[] {
	return rules.filter(rule => {
		if (!rule.env || rule.env.length === 0) return true
		return rule.env.includes(currentEnv)
	})
}

/**
 * 从环境变量解析代理目标
 *
 * @param {string | RegExp} context - 规则的匹配上下文
 * @param {string} envPrefix - 环境变量前缀（如 'PROXY_'）
 * @returns {string | undefined} 从环境变量中解析到的目标地址
 *
 * @description 将字符串 context 转换为大写环境变量名，
 * 例如 `/api` + `PROXY_` → `PROXY_API_TARGET`
 * 正则 context 不支持环境变量覆盖，返回 undefined
 */
export function resolveTargetFromEnv(context: string | RegExp, envPrefix: string): string | undefined {
	if (typeof context !== 'string') return undefined

	const suffix = context
		.replace(/^\/+/, '')
		.replace(/\/+$/, '')
		.replace(/[^a-zA-Z0-9]/g, '_')
		.toUpperCase()
	const envKey = `${envPrefix}${suffix}_TARGET`
	return process.env[envKey]
}

/**
 * 将代理规则列表解析为 Vite server.proxy 配置格式
 *
 * @param {ProxyRule[]} rules - 已过滤的代理规则列表
 * @param {string} envPrefix - 环境变量前缀
 * @returns {ResolvedProxyRule[]} 解析后的规则列表
 *
 * @description 为每条规则生成 Vite proxy 配置所需的 key 和完整配置对象，
 * 支持从环境变量覆盖 target
 */
export function resolveProxyRules(rules: ProxyRule[], envPrefix: string): ResolvedProxyRule[] {
	return rules.map(rule => {
		const key = contextToKey(rule.context)

		// 尝试从环境变量覆盖 target（仅字符串 context 支持）
		const envTarget = resolveTargetFromEnv(rule.context, envPrefix)

		return {
			key,
			rule: envTarget ? { ...rule, target: envTarget } : rule
		}
	})
}

/**
 * 将解析后的规则列表转换为 Vite server.proxy 配置对象
 *
 * @param {ResolvedProxyRule[]} resolvedRules - 解析后的规则列表
 * @returns {Record<string, any>} Vite server.proxy 配置对象
 *
 * @description 将每条规则转换为 Vite 识别的 proxy 配置格式，
 * 包括 target、changeOrigin、secure、rewrite、headers、ws 等字段
 */
export function buildViteProxyConfig(resolvedRules: ResolvedProxyRule[]): Record<string, any> {
	const proxyConfig: Record<string, any> = {}

	for (const { key, rule } of resolvedRules) {
		const config: Record<string, any> = {
			target: rule.target,
			changeOrigin: rule.changeOrigin ?? true,
			secure: rule.secure ?? false
		}

		if (rule.rewrite) {
			config.rewrite = rule.rewrite
		}

		if (rule.headers) {
			config.headers = rule.headers
		}

		if (rule.ws) {
			config.ws = rule.ws
		}

		if (rule.modifyResponse) {
			config.configure = (proxy: any, _options: any) => {
				proxy.on('proxyRes', (proxyRes: any, _req: any, res: ServerResponse) => {
					const chunks: Buffer[] = []
					proxyRes.on('data', (chunk: Buffer) => {
						chunks.push(chunk)
					})
					proxyRes.on('end', () => {
						const body = Buffer.concat(chunks).toString()
						try {
							const parsed = JSON.parse(body)
							const modified = rule.modifyResponse!(parsed, proxyRes)
							if (modified !== undefined) {
								const modifiedBody = JSON.stringify(modified)
								res.setHeader('content-length', Buffer.byteLength(modifiedBody))
								res.end(modifiedBody)
								return
							}
						} catch {
							// 非 JSON 响应，跳过修改
						}
						res.end(body)
					})
				})
			}
		}

		proxyConfig[key] = config
	}

	return proxyConfig
}
