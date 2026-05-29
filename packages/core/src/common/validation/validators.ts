import { containsScriptTag, validateIdentifierName } from '../script'

/**
 * 验证全局变量名的合法性（包装 validateIdentifierName，附加字段上下文信息）
 *
 * @param name - 全局变量名
 * @param fieldName - 字段名称，用于错误消息上下文（如 'globalName'、'defineName'）
 * @throws 当名称不合法时抛出带字段上下文的错误
 *
 * @example
 * ```typescript
 * validateGlobalName('__LOADING_MANAGER__', 'globalName')
 * validateGlobalName('__APP_VERSION__', 'defineName')
 * ```
 */
export function validateGlobalName(name: string | undefined, fieldName: string): void {
	if (!name) return
	try {
		validateIdentifierName(name)
	} catch (e) {
		throw new Error(`${fieldName} ${(e as Error).message}`)
	}
}

/**
 * 验证模板字符串不包含 script 标签（XSS 防护）
 *
 * @param template - 模板字符串
 * @param fieldName - 字段名称，用于错误消息上下文
 * @throws 当模板包含 `<script>` 标签时抛出错误
 *
 * @example
 * ```typescript
 * validateNoScriptInTemplate('<div>safe</div>', 'customTemplate')
 * validateNoScriptInTemplate(options.customPromptTemplate, 'customPromptTemplate')
 * ```
 */
export function validateNoScriptInTemplate(template: string | undefined, fieldName: string): void {
	if (!template) return
	if (containsScriptTag(template)) {
		throw new Error(`${fieldName} 不允许包含 <script> 标签`)
	}
}

/**
 * 验证回调字段不包含 script 标签
 *
 * @param callbacks - 回调配置对象
 * @param fields - 需要验证的回调字段名数组
 * @param objectName - 回调所属对象名称，用于错误消息上下文
 * @throws 当回调字段非字符串类型时抛出错误
 * @throws 当回调字符串包含 `<script>` 标签时抛出错误
 *
 * @example
 * ```typescript
 * validateCallbackFields(callbacks, ['onShow', 'onHide'], 'callbacks')
 * validateCallbackFields(options, ['onUpdateAvailable', 'onRefresh'], 'callbacks')
 * ```
 */
export function validateCallbackFields(callbacks: Record<string, any>, fields: string[], objectName: string): void {
	for (const field of fields) {
		const value = callbacks[field]
		if (value !== undefined && typeof value !== 'string') {
			throw new Error(`${objectName}.${field} 必须是字符串类型`)
		}
		if (value && containsScriptTag(value)) {
			throw new Error(`${objectName}.${field} 不允许包含 <script> 标签`)
		}
	}
}

/**
 * 验证数值为非负数
 *
 * @param value - 待验证的数值
 * @param fieldName - 字段名称，用于错误消息
 * @throws 当值存在但不是数字或为负数时抛出错误
 *
 * @example
 * ```typescript
 * validateNonNegativeNumber(100, 'zIndex')
 * validateNonNegativeNumber(-1, 'duration') // 抛出错误
 * ```
 */
export function validateNonNegativeNumber(value: number | undefined, fieldName: string): void {
	if (value !== undefined && (typeof value !== 'number' || value < 0)) {
		throw new Error(`${fieldName} 必须是非负数`)
	}
}

/**
 * 验证嵌套配置项的 duration 合法性
 *
 * @param config - 嵌套配置对象（包含 enabled 和 duration 字段）
 * @param errorMsg - 验证失败时的错误提示信息
 * @throws 当 duration 存在但不是非负数时抛出错误
 *
 * @example
 * ```typescript
 * validateNestedDuration({ enabled: true, duration: 300 }, 'minDisplayTime.duration 必须是非负数')
 * ```
 */
export function validateNestedDuration(config: { enabled?: boolean; duration?: number } | undefined, errorMsg: string): void {
	if (config?.duration !== undefined && (typeof config.duration !== 'number' || config.duration < 0)) {
		throw new Error(errorMsg)
	}
}

/**
 * 验证字符串值是否在允许的枚举列表中
 *
 * @param value - 待验证的值
 * @param allowedValues - 允许的值列表
 * @param fieldName - 字段名称，用于错误消息
 * @throws 当值存在但不在允许列表中时抛出错误
 *
 * @example
 * ```typescript
 * validateEnumValue('center', ['center', 'top', 'bottom'], 'position')
 * validateEnumValue('modal', ['modal', 'banner', 'toast'], 'promptStyle')
 * ```
 */
export function validateEnumValue(value: string | undefined, allowedValues: string[], fieldName: string): void {
	if (!value) return
	if (!allowedValues.includes(value)) {
		throw new Error(`${fieldName} 必须是 ${allowedValues.join(', ')}`)
	}
}
