import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { HtmlInjectOptions, InjectionLogEntry } from './types'
import { validateAll, processRules } from './helpers'
import path from 'node:path'
import { normalizePath } from '@/common/path'

/**
 * HTML 内容注入插件类
 *
 * @class HtmlInjectPlugin
 * @extends {BasePlugin<HtmlInjectOptions>}
 * @description 该插件在 Vite 构建过程中，根据配置规则将 HTML 内容注入到目标 HTML 文件中。
 * 支持多种注入位置（head/body 首尾、选择器前后/替换）、条件注入、模板变量替换和安全过滤。
 */
class HtmlInjectPlugin extends BasePlugin<HtmlInjectOptions> {
	/**
	 * 注入日志记录，存储每条规则的执行结果
	 *
	 * @private
	 */
	private injectionLogs: InjectionLogEntry[] = []

	/**
	 * 获取默认配置选项
	 *
	 * @protected
	 * @returns {Partial<HtmlInjectOptions>} 默认配置
	 */
	protected getDefaultOptions(): Partial<HtmlInjectOptions> {
		return {
			targetFile: 'index.html',
			logInjection: true,
			security: {
				blockDangerousTags: true,
				blockDangerousAttributes: true
			}
		}
	}

	/**
	 * 验证配置选项的合法性
	 *
	 * @protected
	 * @throws {Error} 当配置不合法时抛出错误
	 */
	protected validateOptions(): void {
		this.validator.field('targetFile').string().field('rules').required().field('logInjection').boolean().validate()

		validateAll(this.options)
	}

	/**
	 * 获取插件名称
	 *
	 * @protected
	 * @returns {string} 插件名称 'html-inject'
	 */
	protected getPluginName(): string {
		return 'html-inject'
	}

	/**
	 * 判断文件是否为目标注入文件
	 *
	 * @private
	 * @param filename - 当前处理的文件名
	 * @param targetFile - 配置的目标文件路径或文件名
	 * @returns {boolean} 是否匹配目标文件
	 *
	 * @example
	 * ```ts
	 * isTargetFile('dist/index.html', 'index.html')    // true
	 * isTargetFile('dist/about.html', 'index.html')    // false
	 * isTargetFile('src/views/home.html', 'home.html') // true
	 * ```
	 */
	private isTargetFile(filename: string, targetFile: string): boolean {
		if (targetFile === 'index.html') {
			return filename.endsWith('index.html') || filename.endsWith('index.htm')
		}
		const normalizedTarget = normalizePath(targetFile)
		const normalizedFilename = normalizePath(filename)
		if (normalizedFilename.endsWith(normalizedTarget)) {
			return true
		}
		return path.basename(normalizedFilename) === path.basename(normalizedTarget)
	}

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @protected
	 * @param {Plugin} plugin - Vite 插件实例
	 * @description 注册 transformIndexHtml 和 buildEnd 钩子：
	 * - transformIndexHtml: 在 HTML 转换阶段执行内容注入
	 * - buildEnd: 在构建结束时输出注入统计信息
	 */
	protected addPluginHooks(plugin: Plugin): void {
		plugin.transformIndexHtml = {
			order: 'post',
			handler: (html: string, ctx) => {
				const filename = ctx.filename || ''
				const targetFile = this.options.targetFile || 'index.html'

				if (!this.isTargetFile(filename, targetFile)) {
					return html
				}

				const loggerProxy = {
					warn: (msg: string) => this.logger.warn(msg)
				}

				const result = processRules(html, this.options.rules, this.options.templateVars, this.options.security, loggerProxy)

				this.injectionLogs = result.logs

				if (this.options.logInjection) {
					this.logInjectionResults(result.logs)
				}

				return result.html
			}
		}

		plugin.buildEnd = () => {
			if (this.options.logInjection && this.injectionLogs.length > 0) {
				this.logger.info(`注入完成，共处理 ${this.injectionLogs.length} 条规则`)
			}
		}
	}

	/**
	 * 输出注入结果日志
	 *
	 * @private
	 * @param {InjectionLogEntry[]} logs - 注入日志条目数组
	 */
	private logInjectionResults(logs: InjectionLogEntry[]): void {
		for (const log of logs) {
			if (log.injected) {
				this.logger.success(`规则 "${log.ruleId}" 注入成功 (位置: ${log.position}${log.selector ? `, 选择器: ${log.selector}` : ''})`)
			} else {
				this.logger.warn(`规则 "${log.ruleId}" 注入失败: ${log.reason || '未知原因'}`)
			}
		}
	}

	/**
	 * 获取注入日志的副本
	 *
	 * @returns {InjectionLogEntry[]} 注入日志条目数组的浅拷贝
	 */
	public getInjectionLogs(): InjectionLogEntry[] {
		return [...this.injectionLogs]
	}
}

/**
 * HTML 内容注入插件工厂函数
 *
 * @description 创建 htmlInject Vite 插件实例，用于在构建过程中将自定义 HTML 内容注入到目标 HTML 文件中
 *
 * @param {HtmlInjectOptions} options - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @example
 * ```ts
 * import { htmlInject } from '@mengxi-studio/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     htmlInject({
 *       rules: [
 *         {
 *           id: 'meta-description',
 *           content: '<meta name="description" content="{{appName}}">',
 *           position: 'head-end',
 *           templateVars: { appName: 'My Application' }
 *         },
 *         {
 *           id: 'analytics',
 *           content: '<script src="/analytics.js"></script>',
 *           position: 'body-end',
 *           condition: { type: 'env', value: 'PRODUCTION' },
 *           allowScriptInjection: true
 *         }
 *       ]
 *     })
 *   ]
 * })
 * ```
 */
export const htmlInject = createPluginFactory(HtmlInjectPlugin)
export * from './types'
