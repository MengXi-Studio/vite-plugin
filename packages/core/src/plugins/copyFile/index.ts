import type { Plugin } from 'vite'
import type { CopyFileOptions } from './type'
import { BasePlugin, createPluginFactory } from '@/base'
import { checkSourceExists, copySourceToTarget } from '@/common'

/**
 * 复制文件插件
 *
 * @example
 * ```typescript
 * // 基本使用
 * copyFile({
 *   sourceDir: 'src/assets',
 *   targetDir: 'dist/assets'
 * })
 *
 * // 自定义配置
 * copyFile({
 *   sourceDir: 'src/static',
 *   targetDir: 'dist/static',
 *   overwrite: false,
 *   verbose: true,
 *   recursive: false
 * })
 *
 * // 根据环境启用
 * copyFile({
 *   sourceDir: 'src/assets',
 *   targetDir: 'dist/assets',
 *   enabled: process.env.NODE_ENV === 'production'
 * })
 *
 * // 禁用复制功能
 * copyFile({
 *   sourceDir: 'src/assets',
 *   targetDir: 'dist/assets',
 *   enabled: false
 * })
 * ```
 */
class CopyFilePlugin extends BasePlugin<CopyFileOptions> {
	protected getPluginName(): string {
		return 'copy-file'
	}

	protected getEnforce(): 'post' {
		return 'post'
	}

	protected addPluginHooks(plugin: Plugin): void {
		// 绑定writeBundle钩子
		plugin.writeBundle = async () => {
			// 如果禁用，跳过执行
			if (!this.options.enabled) {
				this.logger.info(`插件已禁用，跳过执行：从 ${this.options.sourceDir} 到 ${this.options.targetDir}`)
				return
			}

			try {
				const { sourceDir, targetDir, overwrite = true, recursive = true } = this.options

				// 检查源文件是否存在
				await checkSourceExists(sourceDir)

				// 执行文件复制操作
				const result = await copySourceToTarget(sourceDir, targetDir, {
					recursive,
					overwrite,
					incremental: true // 启用增量复制
				})

				// 输出成功日志
				this.logger.success(`复制文件成功：从 ${sourceDir} 到 ${targetDir}`, `复制了 ${result.copiedFiles} 个文件，跳过了 ${result.skippedFiles} 个文件，耗时 ${result.executionTime}ms`)
			} catch (error) {
				this.handleError(error, '文件复制失败')
			}
		}
	}
}

/**
 * 创建复制文件插件
 * @param options 插件配置
 * @returns Vite 插件实例
 */
export const copyFile = createPluginFactory(CopyFilePlugin)
