import type { BuildPhase, ProgressTheme } from './types'
import { ANSI } from '@/common/ui'

/**
 * 默认进度条颜色主题
 *
 * @constant
 * @type {ProgressTheme}
 * @description 提供默认的终端颜色方案：
 * - completeColor: 绿色（已完成部分）
 * - incompleteColor: 灰色（未完成部分）
 * - percentageColor: 粗体（百分比数字）
 * - phaseColor: 青色（阶段标签）
 * - moduleColor: 灰色（模块名称）
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
 * @constant
 * @type {Record<BuildPhase, string>}
 * @description 将每个构建阶段映射为可读的中文标签：
 * - idle → 等待中
 * - config → 读取配置
 * - resolve → 解析模块
 * - transform → 转换模块
 * - bundle → 打包中
 * - write → 写入文件
 * - done → 构建完成
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
