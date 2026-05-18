import type { BuildPhase, ProgressTheme } from './types'

/**
 * Spinner 旋转动画帧序列
 *
 * @description 使用 Unicode Braille 字符实现流畅的旋转动画效果
 */
export const SPINNER_FRAMES = process.platform === 'win32' ? ['|', '/', '-', '\\'] : ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/**
 * ANSI 转义码常量集合
 *
 * @description 提供终端控制所需的 ANSI 转义序列和颜色函数
 */
export const ANSI = {
	/** 光标移至行首 */
	reset: '\x1b[0G',
	/** 清除当前行 */
	clearLine: '\x1b[2K',
	/** 隐藏光标 */
	hideCursor: '\x1b[?25l',
	/** 显示光标 */
	showCursor: '\x1b[?25h',
	/** 绿色 */
	green: (t: string) => `\x1b[32m${t}\x1b[39m`,
	/** 青色 */
	cyan: (t: string) => `\x1b[36m${t}\x1b[39m`,
	/** 灰色 */
	gray: (t: string) => `\x1b[90m${t}\x1b[39m`,
	/** 粗体 */
	bold: (t: string) => `\x1b[1m${t}\x1b[22m`
}

/**
 * 默认颜色主题
 *
 * @description 使用 ANSI 颜色码定义进度条各部分的默认颜色方案
 */
export const DEFAULT_THEME: ProgressTheme = {
	completeColor: ANSI.green,
	incompleteColor: ANSI.gray,
	percentageColor: ANSI.bold,
	phaseColor: ANSI.cyan,
	moduleColor: ANSI.gray
}

/**
 * 构建阶段对应的中文标签映射
 *
 * @description 将 BuildPhase 枚举值映射为用户友好的中文标签
 */
export const PHASE_LABELS: Record<BuildPhase, string> = {
	idle: '等待中',
	config: '读取配置',
	resolve: '解析模块',
	transform: '转换模块',
	bundle: '打包中',
	write: '写入文件',
	done: '构建完成'
}
