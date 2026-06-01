export type EnvType = 'string' | 'number' | 'url' | 'boolean' | 'enum' | 'json' | 'semver' | 'path'

export interface EnvFieldRule {
	type?: EnvType
	required?: boolean
	pattern?: RegExp
	validator?: (value: string) => boolean | string
	message?: string
	default?: string
	enumValues?: string[]
	minValue?: number
	maxValue?: number
	minLength?: number
	maxLength?: number
	group?: string
	description?: string
	sensitive?: boolean
}

export interface EnvValidationResult {
	key: string
	status: 'pass' | 'missing' | 'type_error' | 'custom_error' | 'enum_mismatch' | 'range_error' | 'length_error'
	message: string
	value: string | undefined
	rule: EnvFieldRule
}

export const STRING_LIKE_TYPES: ReadonlySet<EnvType | undefined> = new Set(['string', 'url', 'path', 'enum', 'semver', undefined])

export function validateType(value: string, rule: EnvFieldRule): { valid: boolean; status: 'type_error' | 'enum_mismatch' | 'pass'; message: string } {
	switch (rule.type) {
		case 'number': {
			if (isNaN(Number(value)) || value.trim() === '') {
				return { valid: false, status: 'type_error', message: `环境变量值 "${value}" 不是合法数字` }
			}
			break
		}
		case 'url': {
			try {
				new URL(value)
			} catch {
				return { valid: false, status: 'type_error', message: `环境变量值 "${value}" 不是合法 URL` }
			}
			break
		}
		case 'boolean': {
			const normalized = value.toLowerCase()
			if (!['true', 'false', '1', '0', 'yes', 'no'].includes(normalized)) {
				return { valid: false, status: 'type_error', message: `环境变量值 "${value}" 不是合法布尔值 (true/false/1/0/yes/no)` }
			}
			break
		}
		case 'enum': {
			if (!rule.enumValues || rule.enumValues.length === 0) {
				return { valid: false, status: 'enum_mismatch', message: 'enum 类型必须指定 enumValues' }
			}
			if (!rule.enumValues.includes(value)) {
				return { valid: false, status: 'enum_mismatch', message: `环境变量值 "${value}" 不在允许的枚举值中: ${rule.enumValues.join(', ')}` }
			}
			break
		}
		case 'json': {
			try {
				JSON.parse(value)
			} catch {
				return { valid: false, status: 'type_error', message: `环境变量值不是合法 JSON` }
			}
			break
		}
		case 'semver': {
			const semverPattern = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/
			if (!semverPattern.test(value)) {
				return { valid: false, status: 'type_error', message: `环境变量值 "${value}" 不是合法语义化版本号 (x.y.z)` }
			}
			break
		}
		case 'path': {
			const pathPattern = /^(?:[./\\]|(?:[a-zA-Z]:))/
			if (!pathPattern.test(value)) {
				return { valid: false, status: 'type_error', message: `环境变量值 "${value}" 不是合法文件路径` }
			}
			break
		}
		case 'string':
		default:
			break
	}

	return { valid: true, status: 'pass', message: '' }
}

export function validateRange(value: string, rule: EnvFieldRule): { valid: boolean; status: 'range_error' | 'pass'; message: string } {
	if (rule.type !== 'number') return { valid: true, status: 'pass', message: '' }

	const num = Number(value)

	if (rule.minValue !== undefined && num < rule.minValue) {
		return { valid: false, status: 'range_error', message: `数值 ${num} 小于最小值 ${rule.minValue}` }
	}

	if (rule.maxValue !== undefined && num > rule.maxValue) {
		return { valid: false, status: 'range_error', message: `数值 ${num} 大于最大值 ${rule.maxValue}` }
	}

	return { valid: true, status: 'pass', message: '' }
}

export function validateLength(value: string, rule: EnvFieldRule): { valid: boolean; status: 'length_error' | 'pass'; message: string } {
	if (!STRING_LIKE_TYPES.has(rule.type)) return { valid: true, status: 'pass', message: '' }

	if (rule.minLength !== undefined && value.length < rule.minLength) {
		return { valid: false, status: 'length_error', message: `字符串长度 ${value.length} 小于最小长度 ${rule.minLength}` }
	}

	if (rule.maxLength !== undefined && value.length > rule.maxLength) {
		return { valid: false, status: 'length_error', message: `字符串长度 ${value.length} 大于最大长度 ${rule.maxLength}` }
	}

	return { valid: true, status: 'pass', message: '' }
}

export function validateValue(key: string, value: string | undefined, rule: EnvFieldRule): EnvValidationResult {
	const effectiveRule: EnvFieldRule = {
		type: 'string',
		required: true,
		...rule
	}

	if (value === undefined || value === '') {
		if (effectiveRule.required !== false) {
			return {
				key,
				status: 'missing',
				message: effectiveRule.message || `缺少必需的环境变量: ${key}`,
				value,
				rule: effectiveRule
			}
		}
		return {
			key,
			status: 'pass',
			message: '',
			value: effectiveRule.default ?? value,
			rule: effectiveRule
		}
	}

	const typeResult = validateType(value, effectiveRule)
	if (!typeResult.valid) {
		return {
			key,
			status: typeResult.status,
			message: effectiveRule.message || typeResult.message,
			value,
			rule: effectiveRule
		}
	}

	const rangeResult = validateRange(value, effectiveRule)
	if (!rangeResult.valid) {
		return {
			key,
			status: rangeResult.status,
			message: effectiveRule.message || rangeResult.message,
			value,
			rule: effectiveRule
		}
	}

	const lengthResult = validateLength(value, effectiveRule)
	if (!lengthResult.valid) {
		return {
			key,
			status: lengthResult.status,
			message: effectiveRule.message || lengthResult.message,
			value,
			rule: effectiveRule
		}
	}

	if (effectiveRule.pattern && !effectiveRule.pattern.test(value)) {
		return {
			key,
			status: 'custom_error',
			message: effectiveRule.message || `环境变量 ${key} 不匹配正则: ${effectiveRule.pattern.source}`,
			value,
			rule: effectiveRule
		}
	}

	if (effectiveRule.validator) {
		const result = effectiveRule.validator(value)
		if (result !== true) {
			const customMessage = typeof result === 'string' ? result : ''
			return {
				key,
				status: 'custom_error',
				message: effectiveRule.message || customMessage || `环境变量 ${key} 自定义校验失败`,
				value,
				rule: effectiveRule
			}
		}
	}

	return {
		key,
		status: 'pass',
		message: '',
		value,
		rule: effectiveRule
	}
}

export function validateEnvironment(env: Record<string, string | undefined>, rules: Record<string, EnvFieldRule>): EnvValidationResult[] {
	const results: EnvValidationResult[] = []

	for (const [key, rule] of Object.entries(rules)) {
		const value = env[key]
		results.push(validateValue(key, value, rule))
	}

	return results
}
