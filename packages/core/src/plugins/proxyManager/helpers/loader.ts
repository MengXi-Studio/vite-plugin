import path from 'node:path'
import fs from 'node:fs'
import type { ProxyRule } from '../types'

/**
 * 代理规则配置文件类型定义
 *
 * @description .proxyrc.ts 文件应导出此类型的对象
 */
export interface ProxyConfigFile {
	rules: ProxyRule[]
}

/**
 * 加载代理规则配置文件
 *
 * @param {string} root - 项目根目录
 * @param {string | false} configFile - 配置文件路径，为 false 时不加载
 * @returns {Promise<ProxyRule[]>} 从配置文件加载的规则列表
 *
 * @description 支持加载 `.proxyrc.ts`、`.proxyrc.js`、`.proxyrc.mjs` 格式的配置文件。
 * 配置文件应导出 `{ rules: ProxyRule[] }` 格式的对象。
 * 如果文件不存在或加载失败，返回空数组。
 *
 * @example
 * ```typescript
 * // .proxyrc.ts
 * import { defineProxyConfig } from '@meng-xi/vite-plugin'
 * export default defineProxyConfig({
 *   rules: [
 *     { context: '/api', target: 'http://localhost:3000' }
 *   ]
 * })
 * ```
 */
export async function loadConfigFile(root: string, configFile: string | false): Promise<ProxyRule[]> {
	if (configFile === false) return []

	const configPath = path.isAbsolute(configFile) ? configFile : path.resolve(root, configFile)

	if (!fs.existsSync(configPath)) return []

	try {
		const ext = path.extname(configPath)
		let config: any

		if (ext === '.mjs') {
			// ESM 文件使用动态 import
			const loaded = await import(configPath)
			config = loaded?.default ?? loaded
		} else {
			// CJS / TS 文件使用 require（Vite 环境下支持 .ts）
			const loaded = require(configPath)
			config = loaded?.default ?? loaded
		}

		if (config && Array.isArray(config.rules)) {
			return config.rules
		}

		// 兼容直接导出数组的情况
		if (Array.isArray(config)) {
			return config
		}

		return []
	} catch {
		// 配置文件加载失败，静默返回空数组
		return []
	}
}

/**
 * 合并规则配置：rules 选项优先于配置文件
 *
 * @param {ProxyRule[]} inlineRules - 插件选项中的规则
 * @param {ProxyRule[]} fileRules - 配置文件中的规则
 * @returns {ProxyRule[]} 合并后的规则列表
 *
 * @description inline 规则按 context 去重，优先级高于文件规则。
 * 文件规则中与 inline 规则 context 重复的会被忽略。
 */
export function mergeRules(inlineRules: ProxyRule[], fileRules: ProxyRule[]): ProxyRule[] {
	const inlineContexts = new Set(inlineRules.map(r => contextKey(r.context)))

	const uniqueFileRules = fileRules.filter(r => !inlineContexts.has(contextKey(r.context)))

	return [...inlineRules, ...uniqueFileRules]
}

/**
 * 获取 context 的唯一标识字符串
 *
 * @param {string | RegExp} context - 匹配上下文
 * @returns {string} 唯一标识
 */
function contextKey(context: string | RegExp): string {
	return typeof context === 'string' ? context : context.toString()
}

/**
 * 定义代理配置的辅助函数（提供类型提示）
 *
 * @param {ProxyConfigFile} config - 代理配置
 * @returns {ProxyConfigFile} 原样返回，仅用于类型推断
 *
 * @example
 * ```typescript
 * // .proxyrc.ts
 * import { defineProxyConfig } from '@meng-xi/vite-plugin'
 * export default defineProxyConfig({
 *   rules: [
 *     { context: '/api', target: 'http://localhost:3000', changeOrigin: true }
 *   ]
 * })
 * ```
 */
export function defineProxyConfig(config: ProxyConfigFile): ProxyConfigFile {
	return config
}
