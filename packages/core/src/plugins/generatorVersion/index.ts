import type { Plugin, ResolvedConfig } from 'vite'
import type { GeneratorVersionOptions } from './type'
import { Logger, ensureTargetDir, writeFileContent } from '@/common'
import path from 'path'
import { getOutputFileName } from './common/getOutputFileName'
import { type OutputType, OutputTypeEnum, type VersionType, VersionTypeEnum } from './common/enum'
import { getVersion } from './common/getVersion'
import { generateFileContent } from './common/generateFileContent'
import { isOutputType, isVersionType, validateFilename, validateCustomVersion, validateCustomExt } from './common/is'

/**
 * 生成版本信息插件
 *
 * @param options - 配置参数
 * @returns 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用 - 默认使用构建时间戳，生成 JSON 格式文件
 * generatorVersion()
 *
 * // 使用 Git 提交哈希作为版本
 * generatorVersion({
 *   versionType: 'git_commit_hash'
 * })
 *
 * // 使用 package.json 版本
 * generatorVersion({
 *   versionType: 'pkg_version'
 * })
 *
 * // 自定义版本值
 * generatorVersion({
 *   versionType: 'custom',
 *   customVersion: '1.0.0-beta'
 * })
 *
 * // 生成文本格式版本文件
 * generatorVersion({
 *   outputType: 'txt'
 * })
 *
 * // 自定义文件名和输出类型
 * generatorVersion({
 *   filename: 'release-info',
 *   outputType: 'json',
 *   versionType: 'build_timestamp',
 *   verbose: true
 * })
 * ```
 *
 * @remarks
 * 该插件会在 Vite 构建完成后执行，生成版本信息文件并输出到 Vite 配置的打包目录
 */
export function generatorVersion(options: GeneratorVersionOptions): Plugin {
	// 提取配置参数，设置默认值
	const { filename = 'version', outputType = OutputTypeEnum.Json, customExt, versionType = VersionTypeEnum.BuildTimestamp, customVersion, verbose = true, enabled = true } = options

	// 创建日志工具实例
	const logger = new Logger({ name: 'generator-version', enabled: verbose })
	let _outputType: OutputType
	let _versionType: VersionType
	let _filename: string
	let _customExt: string | undefined
	let _customVersion: string | undefined

	try {
		// 验证输出类型是否有效
		_outputType = isOutputType(outputType)
		// 验证版本类型是否有效
		_versionType = isVersionType(versionType)
		// 验证文件名是否有效
		_filename = validateFilename(filename)
		// 条件验证：当版本类型为custom时，必须提供customVersion
		_customVersion = validateCustomVersion(_versionType, customVersion)
		// 条件验证：当输出类型为custom时，必须提供customExt
		_customExt = validateCustomExt(_outputType, customExt)
	} catch (error) {
		if (error instanceof Error) {
			logger.error(`配置校验失败：${error.message}`)
		} else {
			logger.error(`配置校验失败：未知错误`, error)
		}
		// 重新抛出错误，确保构建流程能捕获到错误
		throw error
	}

	// 存储 Vite 解析后的配置
	let viteConfig: ResolvedConfig

	return {
		// 插件名称
		name: 'generator-version',
		// 插件在构建流程的最后阶段执行
		enforce: 'post',

		/**
		 * Vite 配置解析完成后触发的钩子函数，获取 Vite 配置
		 *
		 * @param config - Vite 解析后的配置
		 */
		configResolved(config: ResolvedConfig) {
			viteConfig = config
		},

		/**
		 * Vite 构建完成后触发的钩子函数，生成版本信息文件
		 */
		async writeBundle() {
			// 如果禁用，跳过执行
			if (!enabled) {
				logger.info('插件已禁用，跳过执行')
				return
			}

			try {
				// 生成输出文件名
				const outputFileName = getOutputFileName(_outputType, _filename, _customExt)

				// 生成版本值
				const version = getVersion(_versionType, _customVersion)

				// 获取 Vite 输出目录
				const outputDir = viteConfig.build.outDir
				// 生成完整输出文件路径
				const fullOutputPath = path.resolve(outputDir, outputFileName)

				// 确保目标目录存在
				await ensureTargetDir(path.dirname(fullOutputPath))

				// 生成文件内容
				const content = generateFileContent(version, _outputType)

				// 写入版本信息文件
				await writeFileContent(fullOutputPath, content)

				// 输出成功日志
				logger.success(`版本文件生成成功：名称为${outputFileName}，版本值为${version}`)
			} catch (err) {
				// 输出错误日志
				if (err instanceof Error) {
					logger.error(`版本文件生成失败：${err.message}`)
				} else {
					logger.error(`版本文件生成失败：未知错误`, err)
				}
				// 重新抛出错误，确保构建流程能捕获到错误
				throw err
			}
		}
	}
}
