import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { GenerateVersionOptions, VersionInfo } from './types'
import { generateVersionString, generateVersionInfoObject } from './helpers'
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
	 * 生成的版本号字符串
	 *
	 * @description 根据配置的格式生成的版本号，在 configResolved 钩子中赋值
	 */
	private version: string = ''

	/**
	 * 构建时间
	 *
	 * @description 版本号生成时的时间戳，用于所有时间相关格式的版本号计算
	 */
	private buildTime: Date = new Date()

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<GenerateVersionOptions>} 默认配置对象
	 *
	 * @description 默认配置：
	 * - format: 'timestamp'
	 * - semverBase: '1.0.0'
	 * - outputType: 'file'
	 * - outputFile: 'version.json'
	 * - defineName: '__APP_VERSION__'
	 * - hashLength: 8
	 * - prefix: ''
	 * - suffix: ''
	 */
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

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当 format 为 'custom' 但未提供 customFormat 时抛出错误
	 *
	 * @description 校验规则：
	 * - format: 枚举值 'timestamp' | 'date' | 'datetime' | 'semver' | 'hash' | 'custom'
	 * - outputType: 枚举值 'file' | 'define' | 'both'
	 * - hashLength: 数字，范围 1-32
	 */
	protected validateOptions(): void {
		this.validator.field('format').enum(['timestamp', 'date', 'datetime', 'semver', 'hash', 'custom']).field('outputType').enum(['file', 'define', 'both']).field('hashLength').number().minValue(1).maxValue(32).validate()

		// 如果使用自定义格式，必须提供模板
		if (this.options.format === 'custom' && !this.options.customFormat) {
			throw new Error('当 format 为 custom 时，必须提供 customFormat')
		}
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 'generate-version'
	 */
	protected getPluginName(): string {
		return 'generate-version'
	}

	/**
	 * 根据格式生成版本号
	 *
	 * @returns {string} 生成的版本号字符串
	 *
	 * @description 根据配置的 format 生成不同格式的版本号：
	 * - `timestamp`: 紧凑时间戳格式，如 `20260203153000`
	 * - `date`: 日期格式，如 `2026.02.03`
	 * - `datetime`: 日期时间格式，如 `2026.02.03.153000`
	 * - `semver`: 语义化版本格式，如 `1.0.0`
	 * - `hash`: 随机哈希格式，如 `a1b2c3d4`
	 * - `custom`: 自定义格式，通过 parseCustomFormat 解析
	 *
	 * 生成的版本号会自动添加 prefix 和 suffix。
	 */
	private generateVersion(): string {
		return generateVersionString({
			format: this.options.format,
			buildTime: this.buildTime,
			hashLength: this.options.hashLength || 8,
			semverBase: this.options.semverBase,
			customFormat: this.options.customFormat,
			prefix: this.options.prefix,
			suffix: this.options.suffix
		})
	}

	/**
	 * 生成版本信息对象
	 *
	 * @returns {VersionInfo} 包含版本号、构建时间、时间戳、格式和额外信息的对象
	 *
	 * @description 生成完整的版本信息对象，包含版本号字符串、ISO 格式构建时间、
	 * 毫秒时间戳、版本格式类型以及通过 extra 选项附加的自定义字段。
	 */
	private generateVersionInfo(): VersionInfo {
		return generateVersionInfoObject({
			version: this.version,
			buildTime: this.buildTime,
			format: this.options.format,
			extra: this.options.extra
		})
	}

	/**
	 * 写入版本文件到构建输出目录
	 *
	 * @param {string} outDir - 构建输出目录路径
	 * @returns {Promise<void>} 无返回值
	 *
	 * @description 将版本信息以 JSON 格式写入到 outputFile 指定的路径，
	 * 文件路径相对于构建输出目录。
	 */
	private async writeVersionFile(outDir: string): Promise<void> {
		const outputPath = join(outDir, this.options.outputFile || 'version.json')
		const versionInfo = this.generateVersionInfo()

		await writeFileContent(outputPath, JSON.stringify(versionInfo, null, 2))
		this.logger.success(`版本文件已生成: ${outputPath}`)
	}

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @param {Plugin} plugin - Vite 插件对象
	 *
	 * @description 根据配置注册不同的 Vite 钩子：
	 * - `configResolved`: 生成版本号并记录日志
	 * - `config`: 当 outputType 为 'define' 或 'both' 时，注入全局变量
	 * - `writeBundle`: 当 outputType 为 'file' 或 'both' 时，写入版本文件
	 */
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
