import type { Plugin, ResolvedConfig } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { BuildProgressOptions, BuildPhase, ProgressTheme } from './types'
import { DEFAULT_THEME, PHASE_LABELS, SPINNER_FRAMES } from './helpers'
import { ANSI, stripAnsi } from '@/common/ui'

/**
 * 构建进度条插件类，用于在终端实时显示构建进度
 *
 * @class BuildProgressPlugin
 * @extends {BasePlugin<BuildProgressOptions>}
 * @description 该插件通过监听 Vite 构建生命周期钩子，在终端实时显示可视化的构建进度条，
 * 包括进度百分比、阶段标签、旋转动画和当前处理模块名称
 */
class BuildProgressPlugin extends BasePlugin<BuildProgressOptions> {
	/**
	 * 已发现的模块总数
	 *
	 * @private
	 */
	private totalModules = 0

	/**
	 * 已完成转换的模块数
	 *
	 * @private
	 */
	private transformedModules = 0

	/**
	 * 当前正在处理的模块标识符
	 *
	 * @private
	 */
	private currentModule = ''

	/**
	 * 当前构建阶段
	 *
	 * @private
	 */
	private phase: BuildPhase = 'idle'

	/**
	 * Spinner 动画当前帧索引
	 *
	 * @private
	 */
	private spinnerIndex = 0

	/**
	 * Spinner 动画定时器引用
	 *
	 * @private
	 */
	private spinnerTimer: ReturnType<typeof setInterval> | null = null

	/**
	 * 是否为开发环境模式
	 *
	 * @private
	 */
	private isDev = false

	/**
	 * 当前使用的颜色主题
	 *
	 * @private
	 */
	private theme: ProgressTheme = DEFAULT_THEME

	/**
	 * 上一次计算的进度百分比，用于防止进度倒退
	 *
	 * @private
	 */
	private lastPercentage = 0

	protected getDefaultOptions(): Partial<BuildProgressOptions> {
		return {
			width: 30,
			format: 'bar',
			completeChar: '█',
			incompleteChar: '░',
			clearOnComplete: true,
			showModuleName: true
		}
	}

	protected validateOptions(): void {
		this.validator
			.field('width')
			.number()
			.minValue(1)
			.field('format')
			.enum(['bar', 'spinner', 'minimal'])
			.field('completeChar')
			.string()
			.field('incompleteChar')
			.string()
			.field('clearOnComplete')
			.boolean()
			.field('showModuleName')
			.boolean()
			.validate()
	}

	protected getPluginName(): string {
		return 'build-progress'
	}

	protected onConfigResolved(config: ResolvedConfig): void {
		super.onConfigResolved(config)
		this.theme = this.options.theme || DEFAULT_THEME
	}

	/**
	 * 计算当前构建进度百分比
	 *
	 * @private
	 * @returns {number} 0-100 的进度百分比
	 * @description 根据当前构建阶段和模块转换进度计算总体进度：
	 * - config 阶段：5%
	 * - resolve 阶段：10%
	 * - transform 阶段：15%-85%（按模块转换比例）
	 * - bundle 阶段：+10%
	 * - write 阶段：+5%
	 * - done 阶段：100%
	 */
	private getPercentage(): number {
		if (this.phase === 'done') return (this.lastPercentage = 100)
		if (this.phase === 'config') return (this.lastPercentage = 5)
		if (this.phase === 'resolve') return (this.lastPercentage = 10)
		if (this.totalModules === 0) return (this.lastPercentage = 15)
		const transformProgress = Math.min((this.transformedModules / this.totalModules) * 70, 70)
		const bundleProgress = this.phase === 'bundle' ? 10 : 0
		const writeProgress = this.phase === 'write' ? 5 : 0
		const calculated = Math.min(Math.floor(15 + transformProgress + bundleProgress + writeProgress), 99)
		this.lastPercentage = Math.max(calculated, this.lastPercentage)
		return this.lastPercentage
	}

	/**
	 * 渲染进度条字符串
	 *
	 * @private
	 * @param {number} percentage - 当前进度百分比
	 * @returns {string} 带颜色码的进度条字符串
	 */
	private renderBar(percentage: number): string {
		const width = this.options.width || 30
		const complete = this.options.completeChar || '█'
		const incomplete = this.options.incompleteChar || '░'
		const filled = Math.round((percentage / 100) * width)
		const empty = width - filled
		const bar = this.theme.completeColor(complete.repeat(filled)) + this.theme.incompleteColor(incomplete.repeat(empty))
		return bar
	}

	/**
	 * 渲染当前帧的 Spinner 动画字符
	 *
	 * @private
	 * @returns {string} 带颜色码的 Spinner 字符
	 */
	private renderSpinner(): string {
		const frame = SPINNER_FRAMES[this.spinnerIndex % SPINNER_FRAMES.length]
		this.spinnerIndex++
		return this.theme.phaseColor(frame)
	}

	/**
	 * 根据当前格式渲染完整的进度行
	 *
	 * @private
	 * @param {number} percentage - 当前进度百分比
	 * @returns {string} 完整的进度显示行
	 * @description 根据 format 选项渲染不同格式的进度行：
	 * - bar: Spinner + 阶段标签 + 进度条 + 百分比 [+ 模块名]
	 * - spinner: Spinner + 阶段标签 + 百分比 [+ 模块名]
	 * - minimal: 阶段标签 + 百分比
	 */
	private render(percentage: number): string {
		const format = this.options.format || 'bar'
		const phaseLabel = this.theme.phaseColor(PHASE_LABELS[this.phase])
		const pct = this.theme.percentageColor(`${percentage}%`)

		let line = ''

		if (format === 'bar') {
			line = `${this.renderSpinner()} ${phaseLabel} ${this.renderBar(percentage)} ${pct}`
		} else if (format === 'spinner') {
			line = `${this.renderSpinner()} ${phaseLabel} ${pct}`
		} else {
			line = `${phaseLabel} ${pct}`
		}

		if (this.options.showModuleName && this.currentModule && this.phase === 'transform') {
			const visibleLineLen = stripAnsi(line).length
			const maxModuleLen = Math.max((process.stdout.columns || 80) - visibleLineLen - 3, 20)
			const moduleDisplay = this.currentModule.length > maxModuleLen ? '...' + this.currentModule.slice(-maxModuleLen + 3) : this.currentModule
			line += ` ${this.theme.moduleColor(moduleDisplay)}`
		}

		return line
	}

	/**
	 * 刷新终端中的进度显示
	 *
	 * @private
	 * @description 仅在 TTY 终端环境下执行输出，非 TTY 环境自动跳过
	 */
	private update(): void {
		if (!process.stdout.isTTY) return
		const percentage = this.getPercentage()
		const line = this.render(percentage)
		this.safeExecuteSync(() => {
			process.stdout.write(ANSI.clearLine + ANSI.reset + line)
		}, '更新进度显示')
	}

	/**
	 * 启动 Spinner 动画定时器
	 *
	 * @private
	 * @description 以 80ms 间隔定时刷新进度显示，实现流畅的旋转动画效果
	 */
	private startSpinner(): void {
		if (this.spinnerTimer) return
		if (!process.stdout.isTTY) return
		this.spinnerTimer = setInterval(() => this.update(), 80)
	}

	/**
	 * 停止 Spinner 动画定时器
	 *
	 * @private
	 */
	private stopSpinner(): void {
		if (this.spinnerTimer) {
			clearInterval(this.spinnerTimer)
			this.spinnerTimer = null
		}
	}

	/**
	 * 完成构建进度显示
	 *
	 * @private
	 * @description 将进度设为 100%，停止动画，根据 clearOnComplete 选项决定是否清除进度行。
	 * 非 TTY 环境下降级为日志输出。
	 */
	private complete(): void {
		this.phase = 'done'
		this.stopSpinner()

		if (!process.stdout.isTTY) {
			this.logger.success('构建完成')
			return
		}

		if (this.options.clearOnComplete) {
			this.safeExecuteSync(() => {
				process.stdout.write(ANSI.clearLine + ANSI.reset)
			}, '清除进度行')
		} else {
			const line = this.render(100)
			this.safeExecuteSync(() => {
				process.stdout.write(ANSI.clearLine + ANSI.reset + line + '\n')
			}, '输出完成进度')
		}

		this.safeExecuteSync(() => {
			process.stdout.write(ANSI.showCursor)
		}, '恢复光标显示')
	}

	/**
	 * 注册 Vite 构建生命周期钩子
	 *
	 * @protected
	 * @param {Plugin} plugin - Vite 插件实例
	 * @description 监听以下 Vite 钩子实现进度追踪：
	 * - config: 识别开发/生产环境
	 * - configResolved: 初始化进度显示
	 * - buildStart: 重置模块计数
	 * - resolveId: 统计模块总数
	 * - transform: 追踪模块转换进度
	 * - writeBundle: 标记写入阶段
	 * - closeBundle: 完成进度显示
	 * - buildEnd: 标记打包阶段（仅生产构建）
	 * - configureServer: 开发服务器就绪时完成进度（仅开发模式）
	 */
	protected addPluginHooks(plugin: Plugin): void {
		plugin.config = (_config, { command }) => {
			if (!this.options.enabled) return null
			this.isDev = command === 'serve'
			return null
		}

		plugin.configResolved = () => {
			if (!this.options.enabled) return
			this.phase = 'config'
			if (process.stdout.isTTY) {
				this.safeExecuteSync(() => {
					process.stdout.write(ANSI.hideCursor)
				}, '隐藏光标')
			}
			this.startSpinner()
		}

		plugin.buildStart = () => {
			if (!this.options.enabled) return
			this.phase = 'resolve'
			this.totalModules = 0
			this.transformedModules = 0
		}

		plugin.resolveId = {
			handler: (id: string) => {
				if (!this.options.enabled) return
				if (id.includes('node_modules') || id.includes('.virtual')) return
				this.totalModules++
			}
		}

		plugin.transform = {
			handler: (_code: string, id: string) => {
				if (!this.options.enabled) return
				if (id.includes('node_modules') || id.includes('.virtual')) return
				this.phase = 'transform'
				this.transformedModules++
				this.currentModule = id
			}
		}

		plugin.writeBundle = () => {
			if (!this.options.enabled) return
			this.phase = 'write'
			this.update()
		}

		plugin.closeBundle = () => {
			if (!this.options.enabled) return
			this.complete()
		}

		plugin.buildEnd = () => {
			if (!this.options.enabled) return
			if (!this.isDev) {
				this.phase = 'bundle'
				this.update()
			}
		}

		plugin.configureServer = () => {
			if (!this.options.enabled) return
			if (this.isDev) {
				this.complete()
			}
		}
	}

	/**
	 * 插件销毁时的清理逻辑
	 *
	 * @protected
	 * @description 调用基类销毁方法注销日志配置，停止 Spinner 动画定时器并恢复终端光标显示，防止终端状态异常
	 */
	protected destroy(): void {
		super.destroy()
		this.stopSpinner()
		if (process.stdout.isTTY) {
			this.safeExecuteSync(() => {
				process.stdout.write(ANSI.showCursor)
			}, '恢复光标显示')
		}
	}
}

/**
 * 构建进度条插件
 *
 * @param {BuildProgressOptions} options - 插件配置选项
 * @returns {Plugin} 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用 - 默认进度条格式
 * buildProgress()
 *
 * // 旋转动画格式
 * buildProgress({
 *   format: 'spinner'
 * })
 *
 * // 精简格式
 * buildProgress({
 *   format: 'minimal'
 * })
 *
 * // 自定义进度条外观
 * buildProgress({
 *   width: 40,
 *   completeChar: '■',
 *   incompleteChar: '□',
 *   clearOnComplete: false
 * })
 *
 * // 自定义颜色主题
 * buildProgress({
 *   theme: {
 *     completeColor: (t) => `\x1b[32m${t}\x1b[39m`,
 *     incompleteColor: (t) => `\x1b[90m${t}\x1b[39m`,
 *     percentageColor: (t) => `\x1b[1m${t}\x1b[22m`,
 *     phaseColor: (t) => `\x1b[36m${t}\x1b[39m`,
 *     moduleColor: (t) => `\x1b[90m${t}\x1b[39m`
 *   }
 * })
 *
 * // 禁用模块名显示
 * buildProgress({
 *   showModuleName: false
 * })
 * ```
 *
 * @remarks
 * 该插件在 Vite 构建过程中实时显示终端进度条，支持三种显示格式：
 * - bar: 完整进度条（默认），包含旋转动画、阶段标签、进度条和百分比
 * - spinner: 旋转动画模式，仅显示动画、阶段标签和百分比
 * - minimal: 精简模式，仅显示阶段标签和百分比
 *
 * 进度计算基于 Vite 构建生命周期：
 * 1. config 阶段（5%）→ resolve 阶段（10%）→ transform 阶段（15%-85%）→ bundle 阶段（+10%）→ write 阶段（+5%）→ 完成（100%）
 *
 * 在非 TTY 终端环境下（如 CI/CD），自动降级为日志输出模式。
 */
export const buildProgress = createPluginFactory(BuildProgressPlugin)
export * from './types'
