import type { LoadingCallbacks, LoadingStyle } from '../types'

/**
 * 验证样式配置的合法性
 *
 * @param style - 样式配置对象
 * @throws 当 `zIndex` 为非数字或负数时抛出错误
 * @throws 当 `pointerEvents` 为非布尔值时抛出错误
 * @throws 当 `backdropBlurAmount` 为非数字或负数时抛出错误
 */
export function validateStyle(style?: LoadingStyle): void {
	if (!style) return
	const { zIndex, pointerEvents, backdropBlurAmount } = style
	if (zIndex !== undefined && (typeof zIndex !== 'number' || zIndex < 0)) {
		throw new Error('style.zIndex 必须是非负数')
	}
	if (pointerEvents !== undefined && typeof pointerEvents !== 'boolean') {
		throw new Error('style.pointerEvents 必须是布尔值')
	}
	if (backdropBlurAmount !== undefined && (typeof backdropBlurAmount !== 'number' || backdropBlurAmount < 0)) {
		throw new Error('style.backdropBlurAmount 必须是非负数')
	}
}

/**
 * 验证嵌套配置项的 duration 合法性
 *
 * @param config - 嵌套配置对象（minDisplayTime / delayShow / debounceHide）
 * @param errorMsg - 验证失败时的错误提示信息
 * @throws 当 `duration` 为非数字或负数时抛出指定错误信息
 */
export function validateNestedConfig(config: { enabled?: boolean; duration?: number } | undefined, errorMsg: string): void {
	if (config?.duration !== undefined && (typeof config.duration !== 'number' || config.duration < 0)) {
		throw new Error(errorMsg)
	}
}

/**
 * 验证过渡动画配置的合法性
 *
 * @param transition - 过渡动画配置对象
 * @throws 当 `duration` 为非数字或负数时抛出错误
 * @throws 当 `easing` 为非字符串类型时抛出错误
 */
export function validateTransition(transition?: { enabled?: boolean; duration?: number; easing?: string }): void {
	if (!transition) return
	const { duration, easing } = transition
	if (duration !== undefined && (typeof duration !== 'number' || duration < 0)) {
		throw new Error('transition.duration 必须是非负数')
	}
	if (easing !== undefined && typeof easing !== 'string') {
		throw new Error('transition.easing 必须是字符串类型')
	}
}

/**
 * 验证生命周期回调配置的合法性
 *
 * @remarks 检查所有回调字段是否为字符串类型，并检测是否包含 `<script>` 标签
 *
 * @param callbacks - 回调配置对象
 * @throws 当回调字段非字符串类型时抛出错误
 * @throws 当回调字符串包含 `<script>` 标签时抛出错误
 */
export function validateCallbacks(callbacks?: LoadingCallbacks): void {
	if (!callbacks) return
	const callbackFields: (keyof LoadingCallbacks)[] = ['onBeforeShow', 'onShow', 'onBeforeHide', 'onHide', 'onDestroy']
	for (const field of callbackFields) {
		if (callbacks[field] !== undefined && typeof callbacks[field] !== 'string') {
			throw new Error(`callbacks.${field} 必须是字符串类型`)
		}
		if (callbacks[field] && /<script\b/i.test(callbacks[field]!)) {
			throw new Error(`callbacks.${field} 不允许包含 <script> 标签`)
		}
	}
}

/**
 * 验证自定义模板的安全性
 *
 * @param customTemplate - 自定义 HTML 模板字符串
 * @throws 当模板包含 `<script>` 标签时抛出错误
 */
export function validateCustomTemplate(customTemplate?: string): void {
	if (!customTemplate) return
	if (/<script\b/i.test(customTemplate)) {
		throw new Error('customTemplate 不允许包含 <script> 标签，请使用 callbacks 配置回调逻辑')
	}
}

/**
 * 验证 globalName 的合法性
 *
 * @remarks globalName 将作为 `window[globalName]` 的属性名，
 * 必须是合法的 JavaScript 标识符，防止原型污染（如 `__proto__`、`constructor`）
 *
 * @param name - 全局变量名
 * @throws 当名称不是合法标识符时抛出错误
 * @throws 当名称为 JavaScript 内置属性时抛出错误
 */
export function validateGlobalName(name?: string): void {
	if (!name) return
	if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
		throw new Error(`globalName "${name}" 不是合法的 JavaScript 标识符，必须以字母、下划线或美元符开头，仅包含字母、数字、下划线和美元符`)
	}
	const dangerous = ['__proto__', 'constructor', 'prototype']
	if (dangerous.includes(name)) {
		throw new Error(`globalName "${name}" 是 JavaScript 内置属性，可能导致原型污染，请使用其他名称`)
	}
}

/**
 * 验证默认文本的有效性
 *
 * @param defaultText - 默认文本内容
 * @returns 当 `defaultText` 为空字符串时返回警告信息，否则返回 `null`
 */
export function validateDefaultText(defaultText?: string): string | null {
	if (defaultText === '') {
		return 'defaultText 为空字符串，loading 将不显示文本内容'
	}
	return null
}

/**
 * 验证 autoHideOn 与 defaultVisible 的配置一致性
 *
 * @param defaultVisible - 是否默认可见
 * @param autoHideOn - 自动隐藏时机
 * @returns 当配置不一致时返回警告信息，否则返回 `null`
 */
export function validateAutoHideOn(defaultVisible?: boolean, autoHideOn?: string): string | null {
	if (!defaultVisible && autoHideOn && autoHideOn !== 'DOMContentLoaded') {
		return 'autoHideOn 仅在 defaultVisible 为 true 时生效，当前 defaultVisible 为 false，autoHideOn 配置将被忽略'
	}
	return null
}
