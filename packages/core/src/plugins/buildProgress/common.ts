import type { BuildPhase, ProgressTheme } from './types'
import { ANSI, SPINNER_FRAMES } from '@/common/ui'

export { ANSI, SPINNER_FRAMES }

export const DEFAULT_THEME: ProgressTheme = {
	completeColor: ANSI.green,
	incompleteColor: ANSI.gray,
	percentageColor: ANSI.bold,
	phaseColor: ANSI.cyan,
	moduleColor: ANSI.gray
}

export const PHASE_LABELS: Record<BuildPhase, string> = {
	idle: '等待中',
	config: '读取配置',
	resolve: '解析模块',
	transform: '转换模块',
	bundle: '打包中',
	write: '写入文件',
	done: '构建完成'
}
