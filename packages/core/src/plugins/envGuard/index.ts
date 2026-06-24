import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { EnvGuardOptions, EnvGuardResult } from './types'
import type { EnvValidationResult } from './common'
import { validateEnvironment, generateTemplate, generateRuntimeGuard } from './common'
import { parseEnvContent } from '@/common/env'
import { formatDate } from '@/common/format'
import { injectBeforeTag } from '@/common/html'
import { writeFileContent } from '@/common/fs'
import path from 'node:path'
import fs from 'node:fs'

/**
 * 环境变量守卫插件
 *
 * @class EnvGuardPlugin
 * @extends {BasePlugin<EnvGuardOptions>}
 *
 * @description 在 Vite 构建前校验环境变量的存在性和合法性，
 * 支持多种值类型校验（string/number/url/boolean/enum/json/semver/path）、
 * 正则匹配、自定义校验函数、范围约束和长度约束。
 * 可选生成 .env 模板文件和注入运行时守卫代码。
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { envGuard } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     envGuard({
 *       required: {
 *         VITE_API_BASE_URL: {
 *           type: 'url',
 *           required: true,
 *           message: 'API 基础地址必须为合法 URL'
 *         },
 *         VITE_APP_TITLE: {
 *           type: 'string',
 *           required: true,
 *           minLength: 1,
 *           maxLength: 50
 *         }
 *       },
 *       failAction: 'error',
 *       generateTemplate: true,
 *       runtimeGuard: true
 *     })
 *   ]
 * })
 * ```
 */
class EnvGuardPlugin extends BasePlugin<EnvGuardOptions> {
	/** 校验结果列表 */
	private validationResults: EnvValidationResult[] = []
	/** 整体校验结果 */
	private guardResult: EnvGuardResult | null = null

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<EnvGuardOptions>} 默认配置对象
	 *
	 * @description 默认配置：
	 * - required: {}
	 * - failAction: 'error'
	 * - generateTemplate: true
	 * - templateOutput: '.env.template'
	 * - runtimeGuard: false
	 * - runtimeGlobalName: '__ENV_GUARD__'
	 * - runtimeGuardMode: 'console'
	 * - envFiles: ['.env', '.env.local', '.env.production', '.env.development']
	 * - autoLoadEnv: true
	 * - reportOutput: false
	 * - validateBeforeBuild: true
	 * - showSummary: true
	 */
	protected getDefaultOptions(): Partial<EnvGuardOptions> {
		return {
			required: {},
			failAction: 'error',
			generateTemplate: true,
			templateOutput: '.env.template',
			runtimeGuard: false,
			runtimeGlobalName: '__ENV_GUARD__',
			runtimeGuardMode: 'console',
			envFiles: ['.env', '.env.local', '.env.production', '.env.development'],
			autoLoadEnv: true,
			reportOutput: false,
			validateBeforeBuild: true,
			showSummary: true
		}
	}

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当配置项不合法时抛出校验错误
	 *
	 * @description 校验规则：
	 * - failAction: 必须为 'error' | 'warn' | 'ignore'
	 * - generateTemplate: 布尔值
	 * - runtimeGuard: 布尔值
	 * - runtimeGuardMode: 必须为 'console' | 'throw' | 'overlay'
	 * - autoLoadEnv: 布尔值
	 * - reportOutput: false 或字符串路径
	 * - validateBeforeBuild: 布尔值
	 * - showSummary: 布尔值
	 */
	protected validateOptions(): void {
		this.validator
			.field('failAction')
			.enum(['error', 'warn', 'ignore'])
			.field('generateTemplate')
			.boolean()
			.field('runtimeGuard')
			.boolean()
			.field('runtimeGuardMode')
			.enum(['console', 'throw', 'overlay'])
			.field('autoLoadEnv')
			.boolean()
			.field('reportOutput')
			.custom(v => v === false || typeof v === 'string', 'reportOutput 必须为 false 或字符串路径')
			.field('validateBeforeBuild')
			.boolean()
			.field('showSummary')
			.boolean()
			.validate()
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 'env-guard'
	 */
	protected getPluginName(): string {
		return 'env-guard'
	}

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @param {Plugin} plugin - Vite 插件对象
	 *
	 * @description 注册 `configResolved` 钩子用于构建前校验，
	 * 可选注册 `transformIndexHtml` 钩子用于注入运行时守卫代码。
	 */
	protected addPluginHooks(plugin: Plugin): void {
		if (this.options.validateBeforeBuild) {
			plugin.configResolved = config => {
				this.viteConfig = config
				this.runValidation()
			}
		}

		if (this.options.runtimeGuard) {
			plugin.transformIndexHtml = {
				order: 'post',
				handler: (html: string) => {
					return this.safeExecuteSync(() => this.injectRuntimeGuard(html), '注入运行时守卫') || html
				}
			}
		}
	}

	/**
	 * 执行环境变量校验流程
	 *
	 * @description 完整流程：
	 * 1. 可选加载 .env 文件中的变量到 process.env
	 * 2. 根据 required 配置校验所有环境变量
	 * 3. 汇总校验结果
	 * 4. 根据失败变量和 failAction 配置处理校验失败
	 * 5. 可选生成 .env 模板文件
	 * 6. 可选生成校验报告
	 * 7. 可选输出校验摘要
	 */
	private runValidation(): void {
		if (this.options.autoLoadEnv) {
			this.loadEnvFiles()
		}

		this.validationResults = validateEnvironment(process.env as Record<string, string | undefined>, this.options.required)

		this.guardResult = this.buildResult()

		if (this.options.generateTemplate) {
			this.writeEnvTemplate()
		}

		if (this.options.reportOutput) {
			this.writeReport()
		}

		if (this.options.showSummary) {
			this.logSummary()
		}

		this.handleResults()
	}

	/**
	 * 加载 .env 文件中的变量到 process.env
	 *
	 * @description 按配置的 envFiles 列表依次查找并加载 .env 文件，
	 * 使用 Vite 的 loadEnv 工具函数（如果可用），
	 * 否则使用简易的行解析逻辑
	 */
	private loadEnvFiles(): void {
		if (!this.viteConfig) return

		const root = this.viteConfig.root || process.cwd()

		for (const envFile of this.options.envFiles) {
			const filePath = path.resolve(root, envFile)

			if (!fs.existsSync(filePath)) continue

			try {
				this.parseAndLoadEnvFile(filePath)
			} catch {
				this.logger.warn(`加载 .env 文件失败: ${filePath}`)
			}
		}
	}

	/**
	 * 解析并加载单个 .env 文件
	 *
	 * @param {string} filePath - .env 文件路径
	 * @description 解析 .env 文件内容，将变量注入到 process.env 中，
	 * 仅注入以 VITE_ 开头的变量（Vite 约定）
	 */
	private parseAndLoadEnvFile(filePath: string): void {
		const content = fs.readFileSync(filePath, 'utf-8')
		const vars = parseEnvContent(content, { prefix: 'VITE_' })

		for (const [key, value] of Object.entries(vars)) {
			if (process.env[key] === undefined) {
				process.env[key] = value
			}
		}
	}

	/**
	 * 构建校验结果汇总
	 *
	 * @returns {EnvGuardResult} 校验结果汇总对象
	 */
	private buildResult(): EnvGuardResult {
		const total = this.validationResults.length
		const passed = this.validationResults.filter(r => r.status === 'pass').length
		const missing = this.validationResults.filter(r => r.status === 'missing').length
		const invalid = this.validationResults.filter(r => r.status !== 'pass' && r.status !== 'missing').length

		return {
			timestamp: formatDate(new Date(), '{YYYY}-{MM}-{DD}T{HH}:{mm}:{ss}'),
			total,
			passed,
			missing,
			invalid,
			results: this.validationResults,
			allPassed: missing === 0 && invalid === 0
		}
	}

	/**
	 * 根据校验结果和 failAction 配置处理失败情况
	 *
	 * @description 当存在缺失或校验失败的变量时：
	 * - failAction='error': 抛出错误，中断构建
	 * - failAction='warn': 输出警告，继续构建
	 * - failAction='ignore': 静默忽略
	 */
	private handleResults(): void {
		if (!this.guardResult || this.guardResult.allPassed) return

		const missingKeys = this.validationResults.filter(r => r.status === 'missing').map(r => r.key)
		const invalidKeys = this.validationResults.filter(r => r.status !== 'pass' && r.status !== 'missing')

		const messages: string[] = []

		if (missingKeys.length > 0) {
			messages.push(`缺少必需的环境变量: ${missingKeys.join(', ')}`)
		}

		for (const item of invalidKeys) {
			messages.push(`${item.key}: ${item.message}`)
		}

		const fullMessage = messages.join('\n  ')

		switch (this.options.failAction) {
			case 'error':
				throw new Error(fullMessage)
			case 'warn':
				this.logger.warn(fullMessage)
				break
			case 'ignore':
				break
		}
	}

	/**
	 * 生成并写入 .env 模板文件
	 *
	 * @description 根据 required 配置生成 .env.template 文件，
	 * 写入到项目根目录下
	 */
	private writeEnvTemplate(): void {
		const root = this.viteConfig?.root || process.cwd()
		const outputPath = path.resolve(root, this.options.templateOutput)
		const content = generateTemplate(this.options.required)

		this.safeExecuteSync(() => {
			writeFileContent(outputPath, content)
			this.logger.info(`环境变量模板已生成: ${this.options.templateOutput}`)
		}, '生成 .env 模板')
	}

	/**
	 * 生成并写入校验报告
	 *
	 * @description 将校验结果写入 JSON 报告文件
	 */
	private writeReport(): void {
		if (!this.guardResult || !this.options.reportOutput) return

		const outDir = this.viteConfig?.build?.outDir || 'dist'
		const outputPath = path.resolve(outDir, this.options.reportOutput)

		this.safeExecuteSync(() => {
			const json = JSON.stringify(
				this.guardResult,
				(_key, value) => {
					if (value instanceof RegExp) return value.toString()
					if (typeof value === 'function') return '[Function]'
					return value
				},
				2
			)
			writeFileContent(outputPath, json)
			this.logger.info(`校验报告已生成: ${this.options.reportOutput}`)
		}, '生成校验报告')
	}

	/**
	 * 输出校验摘要日志
	 *
	 * @description 输出校验统计信息，包括通过/缺失/失败的变量数，
	 * 以及每个失败变量的详细错误信息
	 */
	private logSummary(): void {
		if (!this.guardResult) return

		const { total, passed, missing, invalid, allPassed } = this.guardResult

		if (allPassed) {
			this.logger.success(`环境变量校验通过: ${total} 个变量全部合法`)
			return
		}

		this.logger.info(`环境变量校验结果: 总计 ${total} | 通过 ${passed} | 缺失 ${missing} | 失败 ${invalid}`)

		const failedResults = this.validationResults.filter(r => r.status !== 'pass')
		for (const result of failedResults) {
			const statusLabel = result.status === 'missing' ? '缺失' : '失败'
			this.logger.warn(`  [${statusLabel}] ${result.key}: ${result.message}`)
		}
	}

	/**
	 * 注入运行时环境变量守卫代码到 HTML
	 *
	 * @param {string} html - 原始 HTML 内容
	 * @returns {string} 注入守卫代码后的 HTML 内容
	 */
	private injectRuntimeGuard(html: string): string {
		const guardCode = generateRuntimeGuard(this.options.required, this.options.runtimeGlobalName, this.options.runtimeGuardMode, this.validationResults)

		if (!guardCode) return html

		const result = injectBeforeTag(html, '</head>', guardCode)

		if (!result.injected) {
			this.logger.warn('未找到 </head> 标签，运行时守卫代码未能注入')
			return html
		}

		return result.html
	}

	/**
	 * 获取校验结果
	 *
	 * @returns {EnvGuardResult | null} 校验结果，校验未执行时返回 null
	 *
	 * @example
	 * ```typescript
	 * const plugin = envGuard({ required: { VITE_API_URL: { type: 'url' } } })
	 * // 构建完成后...
	 * const result = (plugin as any).pluginInstance?.getResult?.()
	 * if (result) {
	 *   console.log(`通过: ${result.passed}/${result.total}`)
	 * }
	 * ```
	 */
	public getResult(): EnvGuardResult | null {
		return this.guardResult
	}

	/**
	 * 获取校验结果详情列表
	 *
	 * @returns {EnvValidationResult[]} 校验结果列表
	 */
	public getValidationResults(): EnvValidationResult[] {
		return [...this.validationResults]
	}
}

/**
 * 创建环境变量守卫插件
 *
 * @function envGuard
 * @param {Partial<EnvGuardOptions>} [options] - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @description 在 Vite 构建前校验环境变量的存在性和合法性，
 * 支持多种值类型校验、正则匹配、自定义校验函数等，
 * 可选生成 .env 模板文件和注入运行时守卫代码。
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { envGuard } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     envGuard({
 *       required: {
 *         VITE_API_BASE_URL: {
 *           type: 'url',
 *           required: true,
 *           message: 'API 基础地址必须为合法 URL'
 *         },
 *         VITE_APP_TITLE: {
 *           type: 'string',
 *           required: true,
 *           minLength: 1,
 *           maxLength: 50
 *         },
 *         VITE_ENABLE_ANALYTICS: {
 *           type: 'boolean',
 *           required: false,
 *           default: 'false'
 *         },
 *         VITE_API_TIMEOUT: {
 *           type: 'number',
 *           minValue: 1000,
 *           maxValue: 60000,
 *           message: 'API 超时时间必须在 1000-60000ms 之间'
 *         },
 *         VITE_LOG_LEVEL: {
 *           type: 'enum',
 *           enumValues: ['debug', 'info', 'warn', 'error'],
 *           default: 'info'
 *         }
 *       },
 *       failAction: 'error',
 *       generateTemplate: true,
 *       runtimeGuard: true,
 *       runtimeGuardMode: 'console'
 *     })
 *   ]
 * })
 * ```
 */
export const envGuard = createPluginFactory(EnvGuardPlugin)
export * from './types'
