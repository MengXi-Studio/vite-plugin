import { type Plugin } from 'vite'
import type { CopyFileOptions } from './type'
import { checkSourceExists, ensureTargetDir, copySourceToTarget } from '@/utils'
import { Logger } from '@/logger'

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
 *
 * @remarks
 * 该插件会在 Vite 构建完成后执行，将指定源目录的所有文件和子目录复制到目标目录
 */
export function copyFile(options: CopyFileOptions): Plugin {
	// 提取配置参数，设置默认值
	const { sourceDir, targetDir, overwrite = true, recursive = true, verbose = true, enabled = true } = options

	// 创建日志工具实例
	const logger = new Logger({ name: 'copy-file', enabled: verbose })

	return {
		// 插件名称
		name: 'copy-file',
		// 插件在构建流程的最后阶段执行，确保其他构建任务完成后再进行文件复制
		enforce: 'post',

		/**
		 * Vite 构建完成后触发的钩子函数，执行文件复制操作
		 *
		 * @remarks
		 * 该钩子在 Vite 构建流程的最后阶段执行，确保所有构建任务完成后再进行文件复制
		 *
		 * @throws 当源文件不存在、权限不足或复制过程中出现其他错误时抛出异常
		 */
		async writeBundle() {
			// 如果 disabled，跳过执行
			if (!enabled) {
				logger.info(`插件已禁用，跳过执行：从 ${sourceDir} 到 ${targetDir}`)
				return
			}

			try {
				// 检查源文件是否存在
				await checkSourceExists(sourceDir)

				// 创建目标目录（如果不存在）
				await ensureTargetDir(targetDir)

				// 执行文件复制操作
				await copySourceToTarget(sourceDir, targetDir, { recursive, overwrite })

				// 输出成功日志
				logger.success(`复制文件成功：从 ${sourceDir} 到 ${targetDir}`)
			} catch (err) {
				// 输出错误日志
				if (err instanceof Error) {
					logger.error(err.message)
				} else {
					logger.error(`复制文件失败：未知错误 - ${sourceDir} -> ${targetDir}`, err)
				}
				// 重新抛出错误，确保构建流程能捕获到错误
				throw err
			}
		}
	}
}
