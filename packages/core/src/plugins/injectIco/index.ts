import { type Plugin } from 'vite'
import type { InjectIcoOptions } from './type'
import { checkSourceExists, ensureTargetDir, copySourceToTarget, generateIconTags } from '@/utils'

/**
 * 注入网站图标链接到 HTML 文件的头部
 *
 * @param options - 配置选项（字符串时视为 base）
 * @returns 一个 Vite 插件实例，用于在构建过程中修改 HTML 文件
 *
 * @example
 * ```typescript
 * // 基本使用
 * injectIco({ base: '/assets' })
 *
 * // 自定义图标
 * injectIco({
 *   icons: [
 *     { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
 *     { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
 *     { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
 *   ]
 * })
 *
 * // 带文件复制功能（适用于 uni-app 等框架）
 * injectIco({
 *   base: '/assets',
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 *
 * // 带完整复制配置的使用
 * injectIco({
 *   base: '/assets',
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons',
 *     overwrite: false,
 *     recursive: true
 *   }
 * })
 *
 * // 关闭日志输出
 * injectIco({
 *   base: '/assets',
 *   verbose: false,
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 *
 * // 根据环境启用
 * injectIco({
 *   base: '/assets',
 *   enabled: process.env.NODE_ENV === 'production',
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 *
 * // 禁用插件
 * injectIco({
 *   base: '/assets',
 *   enabled: false,
 *   copyOptions: {
 *     sourceDir: 'src/assets/icons',
 *     targetDir: 'dist/assets/icons'
 *   }
 * })
 * ```
 */
export function injectIco(options?: InjectIcoOptions | string): Plugin {
	// 标准化选项
	const normalizedOptions: InjectIcoOptions = typeof options === 'string' ? { base: options } : options || {}

	// 获取配置，设置默认值
	const { verbose = true, enabled = true } = normalizedOptions

	return {
		name: 'inject-ico',

		/**
		 * 转换 HTML 入口文件的钩子函数
		 *
		 * @param html - 原始的 HTML 内容
		 * @returns 经过修改后的 HTML 内容，在 `</head>` 标签前注入图标链接
		 */
		transformIndexHtml(html) {
			// 如果禁用了插件，跳过执行
			if (!enabled) {
				if (verbose) {
					console.log('ℹ inject-ico: 插件已禁用，跳过图标注入')
				}
				return html
			}

			// 生成图标标签
			const iconTags = generateIconTags(normalizedOptions)

			// 如果没有图标标签需要注入，直接返回原始 HTML
			if (iconTags.length === 0) {
				if (verbose) {
					console.log('ℹ inject-ico: 没有生成图标标签，跳过注入')
				}
				return html
			}

			// 检查是否已经存在图标标签，避免重复注入
			let modifiedHtml = html

			// 注入图标标签到 </head> 标签前
			const headCloseIndex = modifiedHtml.indexOf('</head>')
			if (headCloseIndex !== -1) {
				const tagsHtml = iconTags.join('\n') + '\n'
				modifiedHtml = modifiedHtml.substring(0, headCloseIndex) + tagsHtml + modifiedHtml.substring(headCloseIndex)
				if (verbose) {
					console.log(`✅ inject-ico: 成功注入 ${iconTags.length} 个图标标签到 HTML 文件`)
					iconTags.forEach(tag => {
						console.log(`  - ${tag}`)
					})
				}
			} else {
				if (verbose) {
					console.warn('⚠ inject-ico: 未找到 </head> 标签，跳过图标注入')
				}
			}

			return modifiedHtml
		},

		/**
		 * 构建完成后执行的钩子函数，用于复制图标文件到打包目录
		 *
		 * @remarks
		 * 只有当配置了 copyOptions 对象且 enabled 为 true 时才会执行复制操作
		 *
		 * @throws 当源文件不存在、权限不足或复制过程中出现其他错误时抛出异常
		 */
		async writeBundle() {
			// 如果禁用了插件，跳过执行
			if (!enabled) {
				if (verbose) {
					console.log('ℹ inject-ico: 插件已禁用，跳过文件复制')
				}
				return
			}

			// 检查是否配置了文件复制相关选项
			const { copyOptions } = normalizedOptions

			// 没有配置复制选项，跳过复制操作
			if (!copyOptions) return

			// 获取复制配置，设置默认值
			const { sourceDir, targetDir, overwrite = true, recursive = true } = copyOptions

			try {
				// 检查源文件是否存在
				await checkSourceExists(sourceDir)

				// 创建目标目录（如果不存在）
				await ensureTargetDir(targetDir)

				// 执行文件复制操作
				await copySourceToTarget(sourceDir, targetDir, { recursive, overwrite })

				// 输出成功日志
				if (verbose) {
					console.log(`✅ inject-ico: 图标文件复制成功：从 ${sourceDir} 到 ${targetDir}`)
				}
			} catch (err) {
				// 输出错误日志
				if (verbose) {
					if (err instanceof Error) {
						console.error(err.message)
					} else {
						console.error(`❌ inject-ico: 图标文件复制失败：未知错误 - ${sourceDir} -> ${targetDir}`, err)
					}
				}
				// 重新抛出错误，确保构建流程能捕获到错误
				throw err
			}
		}
	}
}
