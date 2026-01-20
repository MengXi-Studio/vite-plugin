import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as vitePlugin from '@meng-xi/vite-plugin'

/**
 * Vite 插件使用示例配置
 *
 * 该文件展示了如何使用 @meng-xi/vite-plugin 中的各个插件
 * 每个插件都提供了基本使用示例和常见配置选项
 */
export default defineConfig({
	plugins: [
		vue(),

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
		vitePlugin.injectIco({
			// 图标文件的基础路径，默认为根路径 `/`
			base: '/assets',

			// 是否启用插件，默认值为 true
			enabled: true,

			// 图标文件复制配置（可选）
			// 当提供此配置时，会将图标文件从源目录复制到目标目录
			copyOptions: {
				// 图标源文件目录
				sourceDir: 'src/assets',
				// 图标目标目录（打包目录）
				targetDir: 'dist/assets',
				// 是否覆盖同名文件，默认值为 true
				overwrite: true,
				// 是否支持递归复制，默认值为 true
				recursive: true
			}
		}),

		/**
		 * copyFile 插件示例
		 *
		 * 用于复制文件或目录到指定位置
		 * 支持多种配置选项
		 */
		vitePlugin.copyFile({
			// 源文件目录的路径
			sourceDir: 'src/static',
			// 目标文件目录的路径
			targetDir: 'dist/static',
			// 是否覆盖同名文件，默认值为 true
			overwrite: true,
			// 是否支持递归复制，默认值为 true
			recursive: true,
			// 是否启用插件，默认值为 true
			enabled: true,
			// 是否显示详细日志，默认值为 true
			verbose: true
		})
	]
})
