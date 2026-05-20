import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { injectIco, copyFile, generateVersion, buildProgress } from './uni_modules/vite-plugin/js_sdk/index.mjs'
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

			// ========================================================================
			// buildProgress — 构建进度条插件
			// ========================================================================
			//
			// 功能描述：
			//   在终端实时显示 Vite 构建进度条，直观展示当前构建阶段、进度百分比
			//   和正在处理的模块名称，消除构建过程中的"静默等待"体验。
			//
			// 使用场景：
			//   - 大型项目构建耗时较长，需要实时了解构建进度
			//   - CI/CD 流水线中需要构建状态可视化（自动降级为日志输出）
			//   - 多插件协作时定位构建瓶颈阶段
			//
			// 构建阶段与进度映射：
			//   config(5%) → resolve(10%) → transform(15%-85%) → bundle(+10%) → write(+5%) → done(100%)
			//
			// 配置参数：
			//   width            - 进度条宽度（字符数），默认 30
			//   format           - 显示格式：'bar'（完整进度条）| 'spinner'（旋转动画）| 'minimal'（精简），默认 'bar'
			//   completeChar     - 已完成部分填充字符，默认 '█'
			//   incompleteChar   - 未完成部分填充字符，默认 '░'
			//   clearOnComplete  - 构建完成后是否清除进度条，默认 true
			//   showModuleName   - 是否显示当前处理模块名称（仅 transform 阶段），默认 true
			//   theme            - 自定义颜色主题（ProgressTheme 接口），可选
			//   enabled          - 是否启用插件，默认 true
			//   verbose          - 是否输出详细日志，默认 true
			//   errorStrategy    - 错误处理策略：'throw' | 'log' | 'ignore'，默认 'throw'
			//
			// 注意事项：
			//   - 非 TTY 环境（如 CI/CD）自动降级为 Logger 日志输出，无需额外配置
			//   - Windows 使用 ASCII 动画字符，其他平台使用 Unicode Braille 字符
			//   - 开发模式下在服务器就绪后自动完成进度显示
			//   - 进度百分比只进不退，避免视觉闪烁
			//
			buildProgress({
				format: 'bar',
				width: 30,
				clearOnComplete: false,
				showModuleName: true
			}),

			// ========================================================================
			// injectIco — 图标注入插件
			// ========================================================================
			//
			// 功能描述：
			//   在 Vite 构建过程中将网站图标链接（<link rel="icon">）自动注入到
			//   HTML 文件的 <head> 中，并可选将图标文件从源目录复制到构建输出目录。
			//
			// 使用场景：
			//   - H5 平台构建时自动注入 favicon 到 HTML
			//   - 需要将图标文件从 public 目录复制到指定构建输出目录
			//   - 支持多种图标尺寸和格式（ico/png/svg）
			//
			// 配置参数：
			//   base          - 图标文件的基础路径，默认 '/'
			//   url           - 图标的完整 URL（与 base 互斥，优先使用），可选
			//   link          - 自定义完整的 <link> 标签 HTML，可选
			//   icons         - 自定义图标数组（Icon[]），可选
			//                    Icon { rel: string, href: string, sizes?: string, type?: string }
			//   copyOptions   - 图标文件复制配置，可选
			//                    { sourceDir: string, targetDir: string, overwrite?: boolean, recursive?: boolean }
			//   enabled       - 是否启用插件，默认 true
			//   verbose       - 是否输出详细日志，默认 true
			//   errorStrategy - 错误处理策略：'throw' | 'log' | 'ignore'，默认 'throw'
			//
			// 注意事项：
			//   - 仅 H5 平台需要注入图标，小程序和 App 平台不适用
			//   - copyOptions 中的 sourceDir 和 targetDir 均为必填
			//   - 当同时提供 base 和 url 时，url 优先
			//
			injectIco({
				base: viteEnv.VITE_BASE_URL,
				enabled: isH5 && isProd,
				copyOptions: {
					sourceDir: resolve('public'),
					targetDir: resolve('dist/build/h5'),
					overwrite: true,
					recursive: true
				}
			}),

			// ========================================================================
			// generateVersion — 版本号生成插件
			// ========================================================================
			//
			// 功能描述：
			//   在 Vite 构建过程中自动生成版本号，支持多种格式输出。
			//   可将版本信息写入 JSON 文件、注入为全局变量，或两者兼具。
			//
			// 使用场景：
			//   - 生产构建时自动生成唯一版本标识，便于追踪发布版本
			//   - 通过全局变量在运行时获取版本号，用于错误上报和用户反馈
			//   - 版本文件用于部署后的版本校验和缓存失效
			//
			// 配置参数：
			//   format        - 版本号格式，可选值：
			//                    'timestamp'  - 时间戳（默认）
			//                    'date'       - 日期格式（YYYY-MM-DD）
			//                    'datetime'   - 日期时间格式
			//                    'semver'     - 语义化版本（需配合 semverBase）
			//                    'hash'       - 随机哈希值
			//                    'custom'     - 自定义格式（需配合 customFormat）
			//   customFormat  - 自定义格式模板，支持占位符：
			//                    {YYYY}、{MM}、{DD}、{HH}、{mm}、{ss}、{hash}
			//   semverBase    - 语义化版本基础值，默认 '1.0.0'
			//   outputType    - 输出类型：'file'（JSON 文件）| 'define'（全局变量）| 'both'，默认 'file'
			//   outputFile    - 输出文件路径（相对于构建输出目录），默认 'version.json'
			//   defineName    - 注入的全局变量名，默认 '__APP_VERSION__'
			//   hashLength    - 哈希长度（1-32），默认 8
			//   prefix        - 版本号前缀，如 'v'，可选
			//   suffix        - 版本号后缀，可选
			//   extra         - 额外版本信息（仅 JSON 文件），Record<string, unknown>，可选
			//   enabled       - 是否启用插件，默认 true
			//   verbose       - 是否输出详细日志，默认 true
			//   errorStrategy - 错误处理策略：'throw' | 'log' | 'ignore'，默认 'throw'
			//
			// 注意事项：
			//   - outputType 为 'define' 或 'both' 时，通过 defineName 指定的全局变量
			//     可在代码中直接使用，需在 TypeScript 中声明类型（参考 vite-env.d.ts）
			//   - extra 中的字段仅出现在 JSON 文件中，不会注入到全局变量
			//   - customFormat 仅在 format 为 'custom' 时生效
			//
			generateVersion({
				format: 'custom',
				customFormat: '{YYYY}.{MM}.{DD}-{hash}',
				hashLength: 6,
				outputType: 'both',
				outputFile: 'version.json',
				defineName: '__APP_VERSION__',
				prefix: 'v',
				enabled: isH5 && isProd,
				verbose: true,
				extra: {
					environment: 'development',
					author: 'MengXi Studio'
				}
			}),

			// ========================================================================
			// copyFile — 文件复制插件
			// ========================================================================
			//
			// 功能描述：
			//   在 Vite 构建完成后将指定目录的文件或子目录复制到目标位置。
			//   支持递归复制、增量更新和覆盖控制。
			//
			// 使用场景：
			//   - 将 public 目录中的静态资源复制到构建输出目录
			//   - 复制第三方 SDK、字体文件等不经过 Vite 处理的资源
			//   - 构建后处理需要保留原始目录结构的文件
			//
			// 配置参数：
			//   sourceDir     - 源目录路径（必填）
			//   targetDir     - 目标目录路径（必填）
			//   overwrite     - 是否覆盖同名文件，默认 true
			//   recursive     - 是否递归复制子目录，默认 true
			//   incremental   - 是否启用增量复制（仅复制修改过的文件），默认 true
			//   enabled       - 是否启用插件，默认 true
			//   verbose       - 是否输出详细日志，默认 true
			//   errorStrategy - 错误处理策略：'throw' | 'log' | 'ignore'，默认 'throw'
			//
			// 注意事项：
			//   - 增量复制通过比较文件修改时间判断是否需要更新，可显著减少重复构建耗时
			//   - sourceDir 和 targetDir 支持相对路径和绝对路径
			//   - 复制操作在 writeBundle 钩子中执行，确保在构建输出写入完成后进行
			//   - 与 injectIco 的 copyOptions 功能类似，但 copyFile 更通用
			//
			copyFile({
				sourceDir: resolve('public'),
				targetDir: resolve('dist/build/h5'),
				overwrite: true,
				recursive: true,
				incremental: true,
				enabled: isH5 && isProd
			})
		]
	}
})
