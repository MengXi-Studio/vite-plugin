import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { injectIco, copyFile, generateVersion } from './uni_modules/vite-plugin/js_sdk/index'
import { resolve } from 'node:path'

export default defineConfig(config => {
	const viteEnv = loadEnv(config.mode, process.cwd())

	/** 是否为 H5 平台 */
	const isH5 = process.env.UNI_PLATFORM === 'h5'
	/** 是否为生产环境 */
	const isProd = viteEnv.VITE_USER_NODE_ENV === 'production'

	return {
		plugins: [
			uni(),

			/**
			 * injectIco 插件示例
			 *
			 * 用于注入网站图标链接到 HTML 文件的头部
			 * 支持多种配置方式：
			 * 1. 字符串形式（视为 base 路径）
			 * 2. 基本配置（base + 默认 favicon.ico）
			 * 3. 完整 URL（直接使用提供的 URL）
			 * 4. 自定义图标数组
			 * 5. 带文件复制功能
			 */
			injectIco({
				// 图标文件的基础路径，默认为根路径 `/`
				base: viteEnv.VITE_BASE_URL,
				// 是否启用插件，默认值为 true
				enabled: isH5 && isProd,
				// 图标文件复制配置（可选）
				// 当提供此配置时，会将图标文件从源目录复制到目标目录
				copyOptions: {
					// 图标源文件目录
					sourceDir: resolve('public'),
					// 图标目标目录（打包目录）
					targetDir: resolve('dist/build/h5'),
					// 是否覆盖同名文件，默认值为 true
					overwrite: true,
					// 是否支持递归复制，默认值为 true
					recursive: true
				}
			}),

			/**
			 * generateVersion 插件示例
			 *
			 * 用于自动生成版本号
			 * 支持多种版本格式：timestamp、date、datetime、semver、hash、custom
			 * 支持输出到文件或注入到代码中
			 */
			generateVersion({
				// 版本号格式，可选值：timestamp、date、datetime、semver、hash、custom
				format: 'custom',
				// 自定义格式模板，支持占位符：{YYYY}、{MM}、{DD}、{HH}、{mm}、{ss}、{hash} 等
				customFormat: '{YYYY}.{MM}.{DD}-{hash}',
				// 哈希长度，范围 1-32
				hashLength: 6,
				// 输出类型：'file' 输出到文件，'define' 注入代码，'both' 两者兼具
				outputType: 'both',
				// 输出文件路径（相对于构建输出目录）
				outputFile: 'version.json',
				// 注入到代码中的全局变量名
				defineName: '__APP_VERSION__',
				// 版本号前缀
				prefix: 'v',
				// 是否启用插件，默认值为 true
				enabled: isH5 && isProd,
				// 是否显示详细日志，默认值为 true
				verbose: true,
				// 额外的版本信息，会包含在输出的 JSON 文件中
				extra: {
					environment: 'development',
					author: 'MengXi Studio'
				}
			}),

			/**
			 * copyFile 插件示例
			 *
			 * 用于复制文件或目录到指定位置
			 * 支持多种配置选项
			 */
			copyFile({
				// 源文件目录的路径
				sourceDir: resolve('public'),
				// 目标文件目录的路径
				targetDir: resolve('dist/build/h5'),
				// 是否覆盖同名文件，默认值为 true
				overwrite: true,
				// 是否支持递归复制，默认值为 true
				recursive: true,
				// 是否启用插件，默认值为 true
				enabled: isH5 && isProd,
				// 是否显示详细日志，默认值为 true
				verbose: true
			})
		]
	}
})
