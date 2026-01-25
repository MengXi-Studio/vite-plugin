/**
 * 参数验证器，提供流畅的 API 用于验证插件配置
 *
 * @class Validator
 * @description 该类提供了流畅的 API 用于验证插件配置，支持必填字段、类型验证、自定义验证规则等
 * @example
 * ```typescript
 * const validator = new Validator(options)
 * validator
 *   .field('sourceDir').required().string()
 *   .field('targetDir').required().string()
 *   .field('overwrite').boolean().default(true)
 *   .validate()
 * ```
 */
export class Validator<T extends Record<string, any>> {
	/**
	 * 要验证的选项对象
	 */
	private options: T

	/**
	 * 当前正在验证的字段名
	 */
	private currentField: string | null = null

	/**
	 * 验证错误信息
	 */
	private errors: string[] = []

	/**
	 * 构造函数
	 * @param options 要验证的选项对象
	 */
	constructor(options: T) {
		this.options = options
	}

	/**
	 * 指定要验证的字段
	 * @param field 字段名
	 * @returns Validator 实例，用于链式调用
	 */
	field(field: keyof T): this {
		this.currentField = field as string
		return this
	}

	/**
	 * 标记字段为必填
	 * @returns Validator 实例，用于链式调用
	 */
	required(): this {
		if (!this.currentField) {
			throw new Error('必须先调用 field() 方法指定要验证的字段')
		}

		const value = this.options[this.currentField]
		if (value === undefined || value === null) {
			this.errors.push(`${this.currentField} 是必填字段`)
		}

		return this
	}

	/**
	 * 验证字段值是否为字符串类型
	 * @returns Validator 实例，用于链式调用
	 */
	string(): this {
		if (!this.currentField) {
			throw new Error('必须先调用 field() 方法指定要验证的字段')
		}

		const value = this.options[this.currentField]
		if (value !== undefined && value !== null && typeof value !== 'string') {
			this.errors.push(`${this.currentField} 必须是字符串类型`)
		}

		return this
	}

	/**
	 * 验证字段值是否为布尔类型
	 * @returns Validator 实例，用于链式调用
	 */
	boolean(): this {
		if (!this.currentField) {
			throw new Error('必须先调用 field() 方法指定要验证的字段')
		}

		const value = this.options[this.currentField]
		if (value !== undefined && value !== null && typeof value !== 'boolean') {
			this.errors.push(`${this.currentField} 必须是布尔类型`)
		}

		return this
	}

	/**
	 * 验证字段值是否为数字类型
	 * @returns Validator 实例，用于链式调用
	 */
	number(): this {
		if (!this.currentField) {
			throw new Error('必须先调用 field() 方法指定要验证的字段')
		}

		const value = this.options[this.currentField]
		if (value !== undefined && value !== null && typeof value !== 'number') {
			this.errors.push(`${this.currentField} 必须是数字类型`)
		}

		return this
	}

	/**
	 * 验证字段值是否为数组类型
	 * @returns Validator 实例，用于链式调用
	 */
	array(): this {
		if (!this.currentField) {
			throw new Error('必须先调用 field() 方法指定要验证的字段')
		}

		const value = this.options[this.currentField]
		if (value !== undefined && value !== null && !Array.isArray(value)) {
			this.errors.push(`${this.currentField} 必须是数组类型`)
		}

		return this
	}

	/**
	 * 验证字段值是否为对象类型
	 * @returns Validator 实例，用于链式调用
	 */
	object(): this {
		if (!this.currentField) {
			throw new Error('必须先调用 field() 方法指定要验证的字段')
		}

		const value = this.options[this.currentField]
		if (value !== undefined && value !== null && typeof value !== 'object' && !Array.isArray(value)) {
			this.errors.push(`${this.currentField} 必须是对象类型`)
		}

		return this
	}

	/**
	 * 为字段设置默认值（仅当字段值为 undefined 或 null 时生效）
	 * @param defaultValue 默认值
	 * @returns Validator 实例，用于链式调用
	 */
	default(defaultValue: any): this {
		if (!this.currentField) {
			throw new Error('必须先调用 field() 方法指定要验证的字段')
		}

		const value = this.options[this.currentField]
		if (value === undefined || value === null) {
			// 使用类型断言确保类型安全
			;(this.options as Record<string, any>)[this.currentField] = defaultValue
		}

		return this
	}

	/**
	 * 使用自定义函数验证字段值
	 * @param validator 自定义验证函数，返回 true 表示验证通过，返回 false 表示验证失败
	 * @param message 验证失败时的错误信息
	 * @returns Validator 实例，用于链式调用
	 */
	custom(validator: (value: any) => boolean, message: string): this {
		if (!this.currentField) {
			throw new Error('必须先调用 field() 方法指定要验证的字段')
		}

		const value = this.options[this.currentField]
		if (value !== undefined && value !== null && !validator(value)) {
			this.errors.push(message)
		}

		return this
	}

	/**
	 * 执行验证，验证失败时抛出错误
	 * @returns 验证后的选项对象
	 * @throws {Error} 验证失败时抛出包含所有错误信息的异常
	 */
	validate(): T {
		if (this.errors.length > 0) {
			throw new Error(`配置验证失败：\n${this.errors.map(err => `- ${err}`).join('\n')}`)
		}

		return this.options
	}
}
