/**
 * 环境变量验证模块
 *
 * @module common/validation/env
 * @description 提供环境变量的类型校验、范围验证、长度验证和批量验证等功能，
 * 支持 string、number、url、boolean、enum、json、semver、path 等多种类型，
 * 为 envGuard 等插件提供统一的环境变量校验能力。
 */

/**
 * 环境变量值类型
 *
 * @description 定义环境变量支持的所有值类型：
 * - `string`：普通字符串（默认类型）
 * - `number`：数字类型
 * - `url`：URL 地址
 * - `boolean`：布尔值
 * - `enum`：枚举值
 * - `json`：JSON 字符串
 * - `semver`：语义化版本号
 * - `path`：文件路径
 */
export type EnvType = 'string' | 'number' | 'url' | 'boolean' | 'enum' | 'json' | 'semver' | 'path'

/**
 * 环境变量字段校验规则
 *
 * @description 定义单个环境变量的校验规则，包括类型约束、范围限制、
 * 自定义验证函数和元数据信息等。
 *
 * @example
 * ```typescript
 * // 基本字符串字段
 * const rule: EnvFieldRule = { type: 'string', required: true }
 *
 * // 带范围的数字字段
 * const portRule: EnvFieldRule = { type: 'number', required: true, minValue: 1, maxValue: 65535 }
 *
 * // 枚举字段
 * const envRule: EnvFieldRule = { type: 'enum', required: true, enumValues: ['development', 'staging', 'production'] }
 *
 * // 自定义验证
 * const customRule: EnvFieldRule = {
 *   type: 'string',
 *   required: true,
 *   validator: (v) => v.startsWith('https://') || '必须使用 HTTPS'
 * }
 * ```
 */
export interface EnvFieldRule {
	/** 值类型，默认为 `'string'` */
	type?: EnvType
	/** 是否为必需字段，默认为 `true` */
	required?: boolean
	/** 正则表达式，值必须匹配此模式 */
	pattern?: RegExp
	/**
	 * 自定义验证函数
	 *
	 * @description 返回 `true` 表示验证通过，返回字符串表示验证失败且字符串为错误消息
	 */
	validator?: (value: string) => boolean | string
	/** 自定义错误消息，覆盖默认的错误提示 */
	message?: string
	/** 当值为空时使用的默认值 */
	default?: string
	/** 枚举值列表（仅 `enum` 类型需要） */
	enumValues?: string[]
	/** 数值最小值（仅 `number` 类型） */
	minValue?: number
	/** 数值最大值（仅 `number` 类型） */
	maxValue?: number
	/** 字符串最小长度（仅字符串类类型） */
	minLength?: number
	/** 字符串最大长度（仅字符串类类型） */
	maxLength?: number
	/** 变量分组名称，用于模板生成时的分组显示 */
	group?: string
	/** 变量描述信息，用于模板生成时的说明文本 */
	description?: string
	/** 是否为敏感变量，模板中会隐藏实际值 */
	sensitive?: boolean
}

/**
 * 环境变量验证结果
 *
 * @description 表示单个环境变量的验证结果，包含验证状态、错误消息和有效值。
 */
export interface EnvValidationResult {
	/** 环境变量名 */
	key: string
	/**
	 * 验证状态：
	 * - `pass`：验证通过
	 * - `missing`：必需变量缺失
	 * - `type_error`：类型不匹配
	 * - `custom_error`：自定义验证失败或正则不匹配
	 * - `enum_mismatch`：枚举值不匹配
	 * - `range_error`：数值超出范围
	 * - `length_error`：字符串长度不符合要求
	 */
	status: 'pass' | 'missing' | 'type_error' | 'custom_error' | 'enum_mismatch' | 'range_error' | 'length_error'
	/** 验证消息（验证通过时为空字符串，失败时为错误描述） */
	message: string
	/** 环境变量的有效值（缺失时可能为 `undefined` 或默认值） */
	value: string | undefined
	/** 应用的校验规则（含默认值填充后的完整规则） */
	rule: EnvFieldRule
}

/**
 * 字符串类类型集合
 *
 * @description 包含所有以字符串形式存储的值类型（以及未指定类型的默认情况），
 * 用于在长度验证时判断是否需要检查 `minLength`/`maxLength`。
 * 非字符串类类型（如 `number`、`boolean`、`json`）不进行长度验证。
 */
export const STRING_LIKE_TYPES: ReadonlySet<EnvType | undefined> = new Set(['string', 'url', 'path', 'enum', 'semver', undefined])

/**
 * 验证环境变量值的类型
 *
 * @param value - 环境变量值的字符串表示
 * @param rule - 校验规则（需包含 `type` 字段）
 * @returns 验证结果对象，包含是否合法、状态码和错误消息
 *
 * @description 根据规则中指定的类型对值进行类型校验：
 * - `string`：始终通过（默认类型）
 * - `number`：必须为合法数字
 * - `url`：必须能被 `URL` 构造函数解析
 * - `boolean`：必须为 `true`/`false`/`1`/`0`/`yes`/`no`（不区分大小写）
 * - `enum`：必须在 `enumValues` 列表中
 * - `json`：必须能被 `JSON.parse` 解析
 * - `semver`：必须匹配 `x.y.z` 格式（支持 prerelease 和 build metadata）
 * - `path`：必须以 `./`、`/`、`\\` 或盘符开头
 *
 * @example
 * ```typescript
 * validateType('123', { type: 'number' })  // { valid: true, status: 'pass', message: '' }
 * validateType('abc', { type: 'number' })  // { valid: false, status: 'type_error', message: '...' }
 * validateType('d', { type: 'enum', enumValues: ['a', 'b', 'c'] })
 * // { valid: false, status: 'enum_mismatch', message: '...' }
 * ```
 */
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

/**
 * 验证数值范围
 *
 * @param value - 环境变量值的字符串表示
 * @param rule - 校验规则（需包含 `minValue`/`maxValue` 字段）
 * @returns 验证结果对象，包含是否合法、状态码和错误消息
 *
 * @description 仅对 `number` 类型进行范围验证，检查值是否在 `minValue` 和 `maxValue` 之间。
 * 非 `number` 类型始终返回验证通过。
 *
 * @example
 * ```typescript
 * validateRange('5', { type: 'number', minValue: 1, maxValue: 10 })
 * // { valid: true, status: 'pass', message: '' }
 *
 * validateRange('0', { type: 'number', minValue: 1 })
 * // { valid: false, status: 'range_error', message: '数值 0 小于最小值 1' }
 * ```
 */
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

/**
 * 验证字符串长度
 *
 * @param value - 环境变量值
 * @param rule - 校验规则（需包含 `minLength`/`maxLength` 字段）
 * @returns 验证结果对象，包含是否合法、状态码和错误消息
 *
 * @description 仅对字符串类类型（`string`、`url`、`path`、`enum`、`semver` 及未指定类型）
 * 进行长度验证。非字符串类类型（如 `number`、`boolean`、`json`）始终返回验证通过。
 *
 * @example
 * ```typescript
 * validateLength('hello', { type: 'string', minLength: 1, maxLength: 10 })
 * // { valid: true, status: 'pass', message: '' }
 *
 * validateLength('hi', { type: 'string', minLength: 5 })
 * // { valid: false, status: 'length_error', message: '字符串长度 2 小于最小长度 5' }
 * ```
 */
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

/**
 * 验证单个环境变量值
 *
 * @param key - 环境变量名
 * @param value - 环境变量值（可能为 `undefined`）
 * @param rule - 校验规则
 * @returns 验证结果对象
 *
 * @description 按顺序执行以下验证步骤：
 * 1. **缺失检查**：必需变量为空时返回 `missing` 状态，非必需变量为空时使用默认值
 * 2. **类型验证**：调用 `validateType` 检查值的类型
 * 3. **范围验证**：调用 `validateRange` 检查数值范围
 * 4. **长度验证**：调用 `validateLength` 检查字符串长度
 * 5. **正则验证**：检查值是否匹配 `pattern` 正则
 * 6. **自定义验证**：执行 `validator` 函数
 *
 * 所有验证步骤中，自定义 `message` 会覆盖默认的错误消息。
 *
 * @example
 * ```typescript
 * // 必需变量缺失
 * validateValue('API_KEY', undefined, { type: 'string', required: true })
 * // { key: 'API_KEY', status: 'missing', message: '缺少必需的环境变量: API_KEY', ... }
 *
 * // 类型错误
 * validateValue('PORT', 'abc', { type: 'number', required: true })
 * // { key: 'PORT', status: 'type_error', message: '...', ... }
 *
 * // 使用默认值
 * validateValue('DEBUG', undefined, { type: 'boolean', required: false, default: 'false' })
 * // { key: 'DEBUG', status: 'pass', value: 'false', ... }
 * ```
 */
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

/**
 * 批量验证环境变量
 *
 * @param env - 环境变量键值对对象
 * @param rules - 环境变量校验规则映射
 * @returns 所有变量的验证结果数组
 *
 * @description 遍历所有规则，对每个环境变量调用 `validateValue` 进行验证，
 * 返回包含所有验证结果的数组。可用于汇总展示所有验证错误。
 *
 * @example
 * ```typescript
 * const results = validateEnvironment(
 *   { API_URL: 'https://api.example.com', PORT: 'abc', MISSING_VAR: undefined },
 *   {
 *     API_URL: { type: 'url', required: true },
 *     PORT: { type: 'number', required: true },
 *     MISSING_VAR: { type: 'string', required: true }
 *   }
 * )
 * // [
 * //   { key: 'API_URL', status: 'pass', ... },
 * //   { key: 'PORT', status: 'type_error', ... },
 * //   { key: 'MISSING_VAR', status: 'missing', ... }
 * // ]
 *
 * // 检查是否有错误
 * const hasErrors = results.some(r => r.status !== 'pass')
 * ```
 */
export function validateEnvironment(env: Record<string, string | undefined>, rules: Record<string, EnvFieldRule>): EnvValidationResult[] {
	const results: EnvValidationResult[] = []

	for (const [key, rule] of Object.entries(rules)) {
		const value = env[key]
		results.push(validateValue(key, value, rule))
	}

	return results
}
