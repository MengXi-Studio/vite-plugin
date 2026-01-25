import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { CopyFileOptions } from './types'
import { checkSourceExists, copySourceToTarget } from '@/common'

/**
 * 复制文件插件类，用于在构建过程中复制文件
 *
 * @class CopyFilePlugin
 * @extends {BasePlugin<CopyFileOptions>}
 * @description 该插件会在 Vite 构建完成后执行，将指定源目录的文件复制到目标目录
 */
class CopyFilePlugin extends BasePlugin<CopyFileOptions> {
	/**
	 * 获取插件名称
	 *
	 * @protected
	 * @returns {string} 插件的名称，用于 Vite 插件系统识别
	 */
	protected getPluginName(): string {
		return 'copy-file'
	}

	/**
	 * 获取插件执行时机
	 *
	 * @protected
	 * @returns {Plugin['enforce']} 插件的执行时机，可选值为 'pre'、'post' 或 undefined
	 * @description 'post' 表示插件在 Vite 构建后期执行
	 */
	protected getEnforce(): Plugin['enforce'] {
		return 'post'
	}

	/**
	 * 执行文件复制操作
	 *
	 * @protected
	 * @async
	 * @returns {Promise<void>} 无返回值
	 * @description 该方法会检查插件是否启用，验证源目录存在，然后执行文件复制操作，并输出复制结果日志
	 */
	async copyFiles(): Promise<void> {
		// 提取配置参数，设置默认值
		const { sourceDir, targetDir, overwrite = true, recursive = true, incremental = true, enabled = true } = this.options

		// 检查插件是否已启用
		if (!enabled) {
			this.logger.info(`插件已禁用，跳过执行：从 ${sourceDir} 复制到 ${targetDir}`)
			return
		}

		// 检查源文件是否存在
		await checkSourceExists(sourceDir)

		// 执行文件复制操作
		const result = await copySourceToTarget(sourceDir, targetDir, {
			recursive,
			overwrite,
			incremental
		})

		// 输出成功日志
		this.logger.success(`复制文件成功：从 ${sourceDir} 到 ${targetDir}`, `复制了 ${result.copiedFiles} 个文件，跳过了 ${result.skippedFiles} 个文件，耗时 ${result.executionTime}ms`)
	}

	/**
	 * 添加插件钩子到 Vite 插件对象
	 *
	 * @protected
	 * @param {Plugin} plugin - Vite 插件对象，用于添加钩子
	 * @returns {void} 无返回值
	 * @description 为插件添加 writeBundle 钩子，该钩子在 Vite 构建完成后执行文件复制操作
	 */
	protected addPluginHooks(plugin: Plugin): void {
		plugin.writeBundle = async () => {
			await this.safeExecute(this.copyFiles, '复制文件')
		}
	}
}

/**
 * 复制文件插件
 *
 * @param {CopyFileOptions} options - 插件配置选项
 * @returns {Plugin} 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * copyFile({
 *   sourceDir: 'src/assets',
 *   targetDir: 'dist/assets'
 * })
 *
 * // 高级配置
 * copyFile({
 *   sourceDir: 'src/static',
 *   targetDir: 'dist/static',
 *   overwrite: false,
 *   recursive: true,
 *   incremental: true,
 *   enabled: true,
 *   verbose: true,
 *   errorStrategy: 'throw'
 * })
 * ```
 *
 * @remarks
 * 该插件会在 Vite 构建完成后执行，将指定源目录的所有文件和子目录复制到目标目录。
 * 支持增量复制、递归复制和覆盖控制等功能。
 */
export const copyFile = createPluginFactory(CopyFilePlugin)
