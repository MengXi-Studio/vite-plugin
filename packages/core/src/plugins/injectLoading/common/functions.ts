import type { LoadingPosition, LoadingStyle, SpinnerType, TransitionConfig } from '../types'
import { CLS_OVERLAY, CLS_HIDDEN, CLS_VISIBLE, CLS_TOP, CLS_CENTER, CLS_BOTTOM, CLS_SPINNER, CLS_TEXT, CLS_DOT, ID_ROOT, ATTR_TEXT, ANIM_SPIN, ANIM_DOTS, ANIM_PULSE, ANIM_BAR, POSITION_CLASS_MAP } from './constants'

/**
 * 生成 Loading CSS 样式
 *
 * @remarks 根据样式配置和图标类型生成完整的 CSS 代码，
 * 包含遮罩层、位置布局、图标动画、文本样式和可见性过渡
 *
 * @param style - 样式配置对象
 * @param spinnerType - 内置图标类型，默认 `'spinner'`
 * @returns 完整的 CSS 样式字符串
 */
export function generateCSS(style: LoadingStyle, spinnerType: SpinnerType = 'spinner', transition?: TransitionConfig): string {
	const {
		overlayColor = 'rgba(255, 255, 255, 0.7)',
		spinnerColor = '#4361ee',
		spinnerSize = '40px',
		textColor = '#333',
		textSize = '14px',
		zIndex = 9999,
		pointerEvents = false,
		backdropBlur = false,
		backdropBlurAmount = 4
	} = style

	const pointerEventsCSS = pointerEvents ? '' : 'pointer-events: none;'
	const backdropCSS = backdropBlur ? `backdrop-filter: blur(${backdropBlurAmount}px);-webkit-backdrop-filter: blur(${backdropBlurAmount}px);` : ''

	const spinnerCSS = getSpinnerCSS(spinnerType, spinnerColor, spinnerSize)

	// 根据 transition 配置生成过渡 CSS，避免与 JS 动态设置的 transition 冲突
	const transitionEnabled = transition?.enabled !== false
	const transitionDuration = transition?.duration ?? 200
	const transitionEasing = transition?.easing ?? 'ease-out'
	const transitionCSS = transitionEnabled ? `transition: opacity ${transitionDuration}ms ${transitionEasing}, visibility ${transitionDuration}ms ${transitionEasing};` : ''

	return `
.${CLS_OVERLAY} {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${overlayColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: ${zIndex};
  ${pointerEventsCSS}
  ${backdropCSS}
  contain: layout style paint;
  will-change: opacity;
}
.${CLS_OVERLAY}.${CLS_TOP} {
  justify-content: flex-start;
  padding-top: 60px;
}
.${CLS_OVERLAY}.${CLS_CENTER} {
  justify-content: center;
}
.${CLS_OVERLAY}.${CLS_BOTTOM} {
  justify-content: flex-end;
  padding-bottom: 60px;
}
${spinnerCSS}
.${CLS_TEXT} {
  margin-top: 12px;
  color: ${textColor};
  font-size: ${textSize};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
}
.${CLS_OVERLAY}.${CLS_HIDDEN} {
  opacity: 0;
  visibility: hidden;
  ${transitionCSS}
}
.${CLS_OVERLAY}.${CLS_VISIBLE} {
  opacity: 1;
  visibility: visible;
  ${transitionCSS}
}`
}

/**
 * 根据图标类型生成对应的 CSS
 *
 * @remarks 生成包含图标容器样式和 keyframe 动画的完整 CSS 代码，
 * 支持 spinner（旋转圆环）、dots（三点跳动）、pulse（脉冲）、bar（进度条）四种类型
 *
 * @param type - 内置图标类型
 * @param color - 图标颜色（CSS 颜色值）
 * @param size - 图标大小（CSS 长度值）
 * @returns 图标对应的 CSS 样式字符串
 */
export function getSpinnerCSS(type: SpinnerType, color: string, size: string): string {
	switch (type) {
		case 'dots':
			return `
.${CLS_SPINNER} {
  display: flex;
  gap: 6px;
  align-items: center;
}
.${CLS_SPINNER} .${CLS_DOT} {
  width: calc(${size} / 4);
  height: calc(${size} / 4);
  border-radius: 50%;
  background: ${color};
  animation: ${ANIM_DOTS} 1.2s ease-in-out infinite;
}
.${CLS_SPINNER} .${CLS_DOT}:nth-child(2) { animation-delay: 0.15s; }
.${CLS_SPINNER} .${CLS_DOT}:nth-child(3) { animation-delay: 0.3s; }
@keyframes ${ANIM_DOTS} {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}`

		case 'pulse':
			return `
.${CLS_SPINNER} {
  width: ${size};
  height: ${size};
  background: ${color};
  border-radius: 50%;
  animation: ${ANIM_PULSE} 1.2s ease-in-out infinite;
}
@keyframes ${ANIM_PULSE} {
  0% { transform: scale(0.3); opacity: 0.3; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.3); opacity: 0.3; }
}`

		case 'bar':
			return `
.${CLS_SPINNER} {
  width: calc(${size} * 2.5);
  height: calc(${size} / 5);
  background: rgba(0, 0, 0, 0.08);
  border-radius: calc(${size} / 10);
  overflow: hidden;
  position: relative;
}
.${CLS_SPINNER}::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  background: ${color};
  border-radius: calc(${size} / 10);
  animation: ${ANIM_BAR} 1.2s ease-in-out infinite;
}
@keyframes ${ANIM_BAR} {
  0% { left: -40%; }
  100% { left: 100%; }
}`

		default: // spinner
			return `
.${CLS_SPINNER} {
  width: ${size};
  height: ${size};
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: ${color};
  border-radius: 50%;
  animation: ${ANIM_SPIN} 0.8s linear infinite;
}
@keyframes ${ANIM_SPIN} {
  to { transform: rotate(360deg); }
}`
	}
}

/**
 * 生成 Loading HTML 模板
 *
 * @remarks 根据配置生成 loading 的 HTML 结构，
 * 包含遮罩层容器、图标和文本元素。
 * 当提供 `customTemplate` 时使用自定义模板
 *
 * @param options - 插件配置选项
 * @returns HTML 模板字符串
 */
export function generateHTMLTemplate(options: { position?: LoadingPosition; defaultText?: string; spinnerType?: SpinnerType; defaultVisible?: boolean; customTemplate?: string; style?: LoadingStyle }): string {
	const position = options.position || 'center'
	const defaultText = options.defaultText || '加载中...'
	const spinnerType = options.spinnerType || 'spinner'
	const positionClass = POSITION_CLASS_MAP[position]
	const customClass = options.style?.customClass ? ` ${options.style.customClass}` : ''
	const customStyle = options.style?.customStyle ? ` style="${options.style.customStyle}"` : ''
	const visibilityClass = options.defaultVisible ? CLS_VISIBLE : CLS_HIDDEN

	if (options.customTemplate) {
		return `<div class="${CLS_OVERLAY} ${positionClass} ${visibilityClass}${customClass}" id="${ID_ROOT}"${customStyle}>${options.customTemplate}</div>`
	}

	const spinnerHTML = getSpinnerHTML(spinnerType)

	return `<div class="${CLS_OVERLAY} ${positionClass} ${visibilityClass}${customClass}" id="${ID_ROOT}"${customStyle}>
  ${spinnerHTML}
  <div class="${CLS_TEXT}" ${ATTR_TEXT}="">${defaultText}</div>
</div>`
}

/**
 * 根据图标类型生成对应的 HTML
 *
 * @remarks 生成图标容器的 HTML 结构。
 * `dots` 类型需要三个子元素，其他类型只需一个空容器
 *
 * @param type - 内置图标类型
 * @returns 图标的 HTML 字符串
 */
export function getSpinnerHTML(type: SpinnerType): string {
	switch (type) {
		case 'dots':
			return `<div class="${CLS_SPINNER}"><div class="${CLS_DOT}"></div><div class="${CLS_DOT}"></div><div class="${CLS_DOT}"></div></div>`
		default:
			return `<div class="${CLS_SPINNER}"></div>`
	}
}
