import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { CopyFileOptions } from './types'
import { checkSourceExists, copySourceToTarget } from '@/common'

/**
 * 复制文件插件
 */
class CopyFilePlugin extends BasePlugin<CopyFileOptions> {
	/**
	 * 获取插件名称
	 */
	protected getPluginName() {
		return 'copy-file'
	}

	/**
	 * 获取插件执行时机
	 */
	protected getEnforce(): Plugin['enforce'] {
		return 'post'
	}

	/**
	 * 复制文件
	 */
	async copyFiles() {
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
	 * 添加插件钩子
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
 * @param options - 配置参数
 * @returns 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * copyFile({
 *   sourceDir: 'src/assets',
 *   targetDir: 'dist/assets'
 * })
 * ```
 *
 * @remarks
 * 该插件会在 Vite 构建完成后执行，将指定源目录的所有文件和子目录复制到目标目录
 */
export const copyFile = createPluginFactory(CopyFilePlugin)
