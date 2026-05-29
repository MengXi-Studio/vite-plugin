import type { LoadingCallbacks, LoadingStyle } from '../types'
import { validateNonNegativeNumber, validateCallbackFields } from '@/common'

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
	validateNonNegativeNumber(zIndex, 'style.zIndex')
	if (pointerEvents !== undefined && typeof pointerEvents !== 'boolean') {
		throw new Error('style.pointerEvents 必须是布尔值')
	}
	validateNonNegativeNumber(backdropBlurAmount, 'style.backdropBlurAmount')
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
	validateNonNegativeNumber(duration, 'transition.duration')
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
	validateCallbackFields(callbacks, callbackFields as string[], 'callbacks')
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
	if (!defaultVisible && autoHideOn) {
		return 'autoHideOn 仅在 defaultVisible 为 true 时生效，当前 defaultVisible 为 false，autoHideOn 配置将被忽略'
	}
	return null
}
