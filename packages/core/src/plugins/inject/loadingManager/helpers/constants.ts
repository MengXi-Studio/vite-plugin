import type { LoadingPosition } from '../types'

/** Loading 遮罩层根元素的 CSS 类名 */
export const CLS_OVERLAY = '__loading-overlay__'

/** Loading 隐藏状态的 CSS 类名 */
export const CLS_HIDDEN = '__loading-hidden__'

/** Loading 可见状态的 CSS 类名 */
export const CLS_VISIBLE = '__loading-visible__'

/** Loading 顶部位置的 CSS 类名 */
export const CLS_TOP = '__loading-top__'

/** Loading 居中位置的 CSS 类名 */
export const CLS_CENTER = '__loading-center__'

/** Loading 底部位置的 CSS 类名 */
export const CLS_BOTTOM = '__loading-bottom__'

/** Loading 旋转图标的 CSS 类名 */
export const CLS_SPINNER = '__loading-spinner__'

/** Loading 文本的 CSS 类名 */
export const CLS_TEXT = '__loading-text__'

/** Loading 圆点图标的 CSS 类名 */
export const CLS_DOT = '__loading-dot__'

/** Loading 根元素的 DOM ID */
export const ID_ROOT = '__loading-root__'

/** Loading 文本元素的 data 属性名 */
export const ATTR_TEXT = 'data-loading-text'

/** 旋转动画 keyframe 名称 */
export const ANIM_SPIN = '__loading-spin__'

/** 圆点动画 keyframe 名称 */
export const ANIM_DOTS = '__loading-dots__'

/** 脉冲动画 keyframe 名称 */
export const ANIM_PULSE = '__loading-pulse__'

/** 进度条动画 keyframe 名称 */
export const ANIM_BAR = '__loading-bar__'

/** 位置值到 CSS 类名的映射表 */
export const POSITION_CLASS_MAP: Record<LoadingPosition, string> = {
	center: CLS_CENTER,
	top: CLS_TOP,
	bottom: CLS_BOTTOM
}
