import type { RouteConfigBlock } from '../types'
import { stripJsonComments } from '@/common/string'

/**
 * 从 Vue SFC 源码中提取指定自定义块的内容
 *
 * @param source Vue SFC 源码
 * @param blockName 自定义块名称（如 'route-config'）
 * @returns 块内原始文本；未找到返回 null
 *
 * @description 支持带属性形式（如 `<route-config lang="json">`），块名大小写不敏感。
 */
export function extractCustomBlock(source: string, blockName: string): string | null {
	// 匹配 <block-name ...> ... </block-name>，其中 <block-name> 后可带 lang 等属性，
	// 属性值可能包含括号，因此分两步：先捕获标签起始与闭合标签。
	const regex = new RegExp(`<${blockName}(\\s[^>]*)?>([\\s\\S]*?)<\\/${blockName}>`, 'i')
	const match = regex.exec(source)
	return match ? match[2] : null
}

/**
 * 解析 `<route-config>` 块内容为配置对象
 *
 * @param raw 块内原始文本
 * @returns 解析后的配置对象；解析失败返回 null
 *
 * @description 内容为 JSON（支持注释），解析失败或内容非法时返回 null，
 * 由调用方静默忽略，不影响其他页面生成。
 */
export function parseRouteConfig(raw: string | null): RouteConfigBlock | null {
	if (!raw || !raw.trim()) return null

	try {
		const normalized = stripJsonComments(raw).trim()
		const parsed = JSON.parse(normalized)
		// 仅接受对象，若误传数组 / 原始值则忽略
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as RouteConfigBlock) : null
	} catch {
		return null
	}
}

/**
 * 从 Vue SFC 源码中提取并解析 `<route-config>` 配置
 *
 * @param source Vue SFC 源码
 * @param blockName 自定义块名称
 * @returns 解析后的配置对象；无块或解析失败返回 null
 */
export function extractRouteConfig(source: string, blockName: string): RouteConfigBlock | null {
	return parseRouteConfig(extractCustomBlock(source, blockName))
}
