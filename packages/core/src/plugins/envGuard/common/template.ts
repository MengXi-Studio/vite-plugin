import type { EnvFieldRule } from '@/common/validation'

/**
 * 生成 .env 模板文件内容
 *
 * @param {Record<string, EnvFieldRule>} rules - 环境变量校验规则映射
 * @returns {string} 模板文件内容字符串
 *
 * @description 根据 required 配置自动生成 .env.template 文件内容，
 * 包含变量注释（类型、描述、是否必需、枚举值、默认值、敏感标记等），
 * 支持按 group 分组展示
 */
export function generateTemplate(rules: Record<string, EnvFieldRule>): string {
	const groups = new Map<string, Array<{ key: string; rule: EnvFieldRule }>>()
	const ungrouped: Array<{ key: string; rule: EnvFieldRule }> = []

	for (const [key, rule] of Object.entries(rules)) {
		const effectiveRule: EnvFieldRule = {
			type: 'string',
			required: true,
			...rule
		}

		if (effectiveRule.group) {
			const existing = groups.get(effectiveRule.group) || []
			existing.push({ key, rule: effectiveRule })
			groups.set(effectiveRule.group, existing)
		} else {
			ungrouped.push({ key, rule: effectiveRule })
		}
	}

	const lines: string[] = []
	lines.push('# 环境变量模板文件')
	lines.push(`# 生成时间: ${new Date().toISOString()}`)
	lines.push('# 由 @meng-xi/vite-plugin envGuard 自动生成')
	lines.push('')

	if (ungrouped.length > 0) {
		appendGroup(lines, '通用配置', ungrouped)
	}

	for (const [groupName, items] of groups) {
		appendGroup(lines, groupName, items)
	}

	return lines.join('\n')
}

/**
 * 向模板行数组中追加一个分组的变量条目
 *
 * @param lines - 模板行数组，将被原地修改
 * @param groupName - 分组名称
 * @param items - 该分组下的变量条目列表
 *
 * @description 生成包含分组标题、变量注释（类型、是否必需、枚举值、默认值等）
 * 和变量赋值行的模板内容，追加到 lines 数组中。
 */
function appendGroup(lines: string[], groupName: string, items: Array<{ key: string; rule: EnvFieldRule }>): void {
	lines.push(`# ==============================`)
	lines.push(`# ${groupName}`)
	lines.push(`# ==============================`)
	lines.push('')

	for (const { key, rule } of items) {
		if (rule.description) {
			lines.push(`# ${rule.description}`)
		}

		const tags: string[] = []
		tags.push(`类型: ${rule.type || 'string'}`)
		tags.push(rule.required !== false ? '必需' : '可选')

		if (rule.enumValues && rule.enumValues.length > 0) {
			tags.push(`枚举值: ${rule.enumValues.join(' | ')}`)
		}

		if (rule.minValue !== undefined) tags.push(`最小值: ${rule.minValue}`)
		if (rule.maxValue !== undefined) tags.push(`最大值: ${rule.maxValue}`)
		if (rule.minLength !== undefined) tags.push(`最小长度: ${rule.minLength}`)
		if (rule.maxLength !== undefined) tags.push(`最大长度: ${rule.maxLength}`)

		if (rule.sensitive) tags.push('⚠️ 敏感信息')

		lines.push(`# [${tags.join(' | ')}]`)

		if (rule.default !== undefined) {
			lines.push(`${key}=${rule.sensitive ? '********' : rule.default}`)
		} else {
			lines.push(`${key}=`)
		}

		lines.push('')
	}
}
