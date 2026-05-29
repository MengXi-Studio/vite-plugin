import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { GenerateVersionOptions } from './types'
import { generateRandomHash, getDateFormatParams, parseTemplate } from '@/common/format'
import { writeFileContent } from '@/common/fs'
import { join } from 'path'

/**
 * 自动生成版本号插件类
 *
 * @class GenerateVersionPlugin
 * @extends {BasePlugin<GenerateVersionOptions>}
 * @description 该插件会在 Vite 构建过程中自动生成版本号，支持多种格式和输出方式
 */
class GenerateVersionPlugin extends BasePlugin<GenerateVersionOptions> {
	/**
	 * 生成的版本号
	 */
	private version: string = ''

	/**
	 * 构建时间
	 */
	private buildTime: Date = new Date()

	protected getDefaultOptions(): Partial<GenerateVersionOptions> {
		return {
			format: 'timestamp',
			semverBase: '1.0.0',
			outputType: 'file',
			outputFile: 'version.json',
			defineName: '__APP_VERSION__',
			hashLength: 8,
			prefix: '',
			suffix: ''
		}
	}

	protected validateOptions(): void {
		this.validator.field('format').enum(['timestamp', 'date', 'datetime', 'semver', 'hash', 'custom']).field('outputType').enum(['file', 'define', 'both']).field('hashLength').number().minValue(1).maxValue(32).validate()

		// 如果使用自定义格式，必须提供模板
		if (this.options.format === 'custom' && !this.options.customFormat) {
			throw new Error('当 format 为 custom 时，必须提供 customFormat')
		}
	}

	protected getPluginName(): string {
		return 'generate-version'
	}

	/**
	 * 根据格式生成版本号
	 */
	private generateVersion(): string {
		const params = getDateFormatParams(this.buildTime)
		const hash = generateRandomHash(this.options.hashLength)

		let version: string

		switch (this.options.format) {
			case 'timestamp':
				version = `${params.YYYY}${params.MM}${params.DD}${params.HH}${params.mm}${params.ss}`
				break

			case 'date':
				version = `${params.YYYY}.${params.MM}.${params.DD}`
				break

			case 'datetime':
				version = `${params.YYYY}.${params.MM}.${params.DD}.${params.HH}${params.mm}${params.ss}`
				break

			case 'semver':
				version = this.options.semverBase || '1.0.0'
				break

			case 'hash':
				version = hash
				break

			case 'custom':
				version = this.parseCustomFormat({ ...params, hash })
				break

			default:
				version = params.timestamp
		}

		// 添加前缀和后缀
		const prefix = this.options.prefix || ''
		const suffix = this.options.suffix || ''

		return `${prefix}${version}${suffix}`
	}

	/**
	 * 解析自定义格式模板
	 */
	private parseCustomFormat(values: Record<string, string>): string {
		const templateValues = { ...values }

		// 解析语义化版本占位符
		if (this.options.semverBase) {
			const [major, minor, patch] = this.options.semverBase.split('.')
			templateValues.major = major || '1'
			templateValues.minor = minor || '0'
			templateValues.patch = patch || '0'
		}

		return parseTemplate(this.options.customFormat || '', templateValues)
	}

	/**
	 * 生成版本信息对象
	 */
	private generateVersionInfo(): Record<string, any> {
		return {
			version: this.version,
			buildTime: this.buildTime.toISOString(),
			timestamp: this.buildTime.getTime(),
			format: this.options.format,
			...this.options.extra
		}
	}

	/**
	 * 写入版本文件
	 */
	private async writeVersionFile(outDir: string): Promise<void> {
		const outputPath = join(outDir, this.options.outputFile || 'version.json')
		const versionInfo = this.generateVersionInfo()

		await writeFileContent(outputPath, JSON.stringify(versionInfo, null, 2))
		this.logger.success(`版本文件已生成: ${outputPath}`)
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.configResolved = () => {
			this.buildTime = new Date()
			this.version = this.generateVersion()
			this.logger.info(`生成版本号: ${this.version}`)
		}

		if (this.options.outputType === 'define' || this.options.outputType === 'both') {
			plugin.config = () => {
				if (!this.version) {
					this.buildTime = new Date()
					this.version = this.generateVersion()
				}

				const defineName = this.options.defineName || '__APP_VERSION__'
				this.logger.info(`注入全局变量: ${defineName} = "${this.version}"`)

				return {
					define: {
						[defineName]: JSON.stringify(this.version),
						[`${defineName}_INFO`]: JSON.stringify(this.generateVersionInfo())
					}
				}
			}
		}

		if (this.options.outputType === 'file' || this.options.outputType === 'both') {
			plugin.writeBundle = async () => {
				if (!this.viteConfig) return

				await this.safeExecute(async () => {
					const outDir = this.viteConfig!.build.outDir
					await this.writeVersionFile(outDir)
				}, '写入版本文件')
			}
		}
	}
}

/**
 * 自动生成版本号插件
 *
 * @param {GenerateVersionOptions} options - 插件配置选项
 * @returns {Plugin} 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用 - 时间戳格式
 * generateVersion()
 *
 * // 日期格式
 * generateVersion({
 *   format: 'date'
 * })
 *
 * // 语义化版本格式
 * generateVersion({
 *   format: 'semver',
 *   semverBase: '2.0.0',
 *   prefix: 'v'
 * })
 *
 * // 自定义格式
 * generateVersion({
 *   format: 'custom',
 *   customFormat: '{YYYY}.{MM}.{DD}-{hash}',
 *   hashLength: 6
 * })
 *
 * // 注入到代码中
 * generateVersion({
 *   outputType: 'define',
 *   defineName: '__VERSION__'
 * })
 *
 * // 同时输出文件和注入代码
 * generateVersion({
 *   outputType: 'both',
 *   outputFile: 'build-info.json',
 *   defineName: '__BUILD_VERSION__',
 *   extra: {
 *     environment: 'production',
 *     author: 'MengXi Studio'
 *   }
 * })
 * ```
 *
 * @remarks
 * 该插件会在 Vite 构建过程中自动生成版本号，支持多种格式：
 * - timestamp: 时间戳格式 (20260203153000)
 * - date: 日期格式 (2026.02.03)
 * - datetime: 日期时间格式 (2026.02.03.153000)
 * - semver: 语义化版本格式 (1.0.0)
 * - hash: 随机哈希格式 (a1b2c3d4)
 * - custom: 自定义格式
 */
export const generateVersion = createPluginFactory(GenerateVersionPlugin)
export * from './types'
