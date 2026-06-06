import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { AutoImportOptions, ResolvedImport } from './types'
import {
	resolveImports,
	buildNameLookup,
	scanDirectories,
	scannedModulesToImports,
	detectUsedImports,
	isAlreadyImported,
	generateImportStatements,
	injectImports,
	injectIntoScriptSetup,
	isRawSfc,
	detectVueTemplateImports,
	generateDtsContent,
	writeDtsFile,
	shouldUpdateDts
} from './common'
import path from 'node:path'

/**
 * 自动导入插件
 *
 * @class AutoImportPlugin
 * @extends {BasePlugin<AutoImportOptions>}
 *
 * @description 自动注入 import 语句的 Vite 插件，支持预设映射和目录扫描两种方式，
 * 可选生成 TypeScript 类型声明文件，支持 Vue 模板自动导入。
 *
 * **核心功能：**
 * - 根据配置的 `imports` 映射自动注入 import 语句
 * - 递归扫描指定目录，自动发现并注册导出
 * - 生成 `.d.ts` 类型声明文件，提供 TypeScript 类型提示
 * - 支持 Vue SFC 模板中的标识符自动导入
 * - 自动跳过已显式导入的标识符，避免重复
 * - 自动跳过 shebang 和 `"use strict"` 声明
 *
 * **生命周期钩子：**
 * - `configResolved`：初始化映射表和目录扫描
 * - `transform`：代码转换，注入 import 语句
 * - `buildEnd`：生成类型声明文件
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { autoImport } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     autoImport({
 *       imports: {
 *         vue: ['ref', 'reactive', 'computed', 'watch', 'onMounted'],
 *         'vue-router': ['useRouter', 'useRoute']
 *       },
 *       dirs: ['src/composables', 'src/stores'],
 *       dts: 'src/auto-imports.d.ts',
 *       vueTemplate: true
 *     })
 *   ]
 * })
 * ```
 */
class AutoImportPlugin extends BasePlugin<AutoImportOptions> {
	/**
	 * 名称→模块映射表，用于快速查找标识符对应的导入信息
	 *
	 * @description 在 `initialize()` 中构建，key 为标识符名称，
	 * value 为对应的 {@link ResolvedImport} 信息
	 */
	private nameLookup: Map<string, ResolvedImport> = new Map()

	/**
	 * 所有解析后的导入映射列表
	 *
	 * @description 包含来自 `imports` 配置和 `dirs` 目录扫描的所有导入映射，
	 * 用于生成类型声明文件
	 */
	private allResolvedImports: ResolvedImport[] = []

	/**
	 * 忽略标识符集合
	 *
	 * @description 从 `options.ignore` 构建，这些标识符不会被自动导入
	 */
	private ignoreSet: Set<string> = new Set()

	/**
	 * 插件是否已完成初始化
	 *
	 * @description 在 `configResolved` 钩子中设为 `true`，
	 * `transform` 钩子会检查此标志，未初始化时跳过转换
	 */
	private initialized = false

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<AutoImportOptions>} 默认配置对象
	 *
	 * @description 提供所有配置项的默认值，与用户配置合并后形成最终配置
	 */
	protected getDefaultOptions(): Partial<AutoImportOptions> {
		return {
			imports: {},
			dirs: [],
			dts: 'src/auto-imports.d.ts',
			vueTemplate: false,
			ignore: [],
			fileFilter: /^(?!.*node_modules).*\.(vue|jsx|tsx|ts|js|mjs)$/,
			injectAtPosition: 'top'
		}
	}

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当配置项不合法时抛出校验错误
	 *
	 * @description 使用 Validator 链式 API 校验以下配置项：
	 * - `dts`：必须为 `false` 或字符串路径
	 * - `vueTemplate`：必须为布尔值
	 * - `injectAtPosition`：必须为 `'top'` 或 `'after-last-import'`
	 */
	protected validateOptions(): void {
		this.validator
			.field('dts')
			.custom(v => v === false || v === true || typeof v === 'string', 'dts 必须为 false、true 或字符串路径')
			.field('vueTemplate')
			.boolean()
			.field('injectAtPosition')
			.enum(['top', 'after-last-import'])
			.validate()
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 `'auto-import'`
	 */
	protected getPluginName(): string {
		return 'auto-import'
	}

	/**
	 * 注册 Vite 插件钩子
	 *
	 * @param {Plugin} plugin - Vite 插件对象
	 *
	 * @description 注册以下 Vite 钩子：
	 *
	 * - **`configResolved`**：在 Vite 配置解析完成后初始化插件，
	 *   构建导入映射表和扫描目录
	 *
	 * - **`transform`**（order: 'pre'）：在代码转换阶段检测标识符使用并注入 import 语句。
	 *   使用 `pre` 顺序确保注入的 import 语句能被 Vite 的 import analysis 正确解析。
	 *   对于原始 SFC 文件，import 语句注入到 `<script setup>` 块内部；
	 *   对于已编译的 JS 文件，import 语句注入到文件顶部。
	 *   仅处理匹配 `fileFilter` 的文件。
	 *
	 * - **`buildEnd`**：在构建结束时生成 TypeScript 类型声明文件
	 */
	protected addPluginHooks(plugin: Plugin): void {
		plugin.configResolved = () => {
			this.initialize()
		}

		plugin.transform = {
			order: 'pre',
			handler: (code: string, id: string) => {
				if (!this.initialized) return null
				if (!this.options.fileFilter.test(id)) return null
				return this.transformCode(code, id)
			}
		}

		plugin.buildEnd = () => {
			if (this.options.dts && this.initialized) {
				this.generateDts()
			}
		}
	}

	/**
	 * 初始化插件：解析映射、扫描目录、构建查找表
	 *
	 * @description 完整的初始化流程：
	 * 1. 解析 `imports` 配置为 {@link ResolvedImport} 列表
	 * 2. 扫描 `dirs` 目录，发现组件和可导出模块
	 * 3. 合并所有导入映射（用户配置优先于扫描结果）
	 * 4. 构建名称→模块查找表
	 * 5. 构建忽略标识符集合
	 * 6. 标记初始化完成
	 */
	private initialize(): void {
		// 1. 解析 imports 配置
		const root = this.viteConfig?.root || process.cwd()
		const configImports = resolveImports(this.options.imports, root)

		// 2. 扫描目录
		const scannedModules = scanDirectories(this.options.dirs, root)
		const scannedImports = scannedModulesToImports(scannedModules)

		// 3. 合并：用户配置优先于扫描结果
		this.allResolvedImports = [...configImports, ...scannedImports]

		// 4. 构建查找表
		this.nameLookup = buildNameLookup(this.allResolvedImports)

		// 5. 构建忽略集合
		this.ignoreSet = new Set(this.options.ignore)

		this.initialized = true

		this.logger.info(`初始化完成: ${this.allResolvedImports.length} 个自动导入映射, ${scannedModules.length} 个扫描模块`)

		// 初始化完成后立即生成类型声明文件（开发模式也需要类型提示）
		if (this.options.dts) {
			this.generateDts()
		}
	}

	/**
	 * 转换代码：检测使用的标识符并注入 import 语句
	 *
	 * @param code 源代码字符串
	 * @param id 文件路径（由 Vite 提供）
	 * @returns 转换结果对象 `{ code, map? }`，无需转换返回 `null`
	 *
	 * @description 转换流程：
	 * 1. 判断代码是否为原始 SFC 文件（包含 `<script` 标签）
	 * 2. 使用 {@link detectUsedImports} 检测代码中使用的标识符
	 * 3. 如果启用 `vueTemplate` 且为原始 SFC 文件，
	 *    使用 {@link detectVueTemplateImports} 检测模板中的标识符
	 * 4. 过滤掉已显式导入的标识符（{@link isAlreadyImported}）
	 * 5. 使用 {@link generateImportStatements} 生成 import 语句
	 * 6. 原始 SFC 使用 {@link injectIntoScriptSetup} 注入到 `<script setup>` 块内；
	 *    编译后 JS 使用 {@link injectImports} 注入到文件顶部
	 */
	private transformCode(code: string, id: string): { code: string; map?: any } | null {
		// 判断是否为原始 SFC 文件（包含 <script 标签）
		const rawSfc = id.endsWith('.vue') && isRawSfc(code)

		// 检测代码中使用的标识符
		let usedImports = detectUsedImports(code, this.nameLookup, this.ignoreSet)

		// Vue 模板检测（仅在原始 SFC 文件中扫描模板）
		if (this.options.vueTemplate && rawSfc) {
			const templateImports = detectVueTemplateImports(code, this.nameLookup, this.ignoreSet)
			// 合并去重
			const seen = new Set(usedImports.map(i => i.name))
			for (const imp of templateImports) {
				if (!seen.has(imp.name)) {
					seen.add(imp.name)
					usedImports.push(imp)
				}
			}
		}

		// 过滤掉已显式导入的标识符
		usedImports = usedImports.filter(imp => !isAlreadyImported(code, imp.name))

		if (usedImports.length === 0) return null

		// 生成 import 语句
		const importStatements = generateImportStatements(usedImports)

		// 注入到代码中：原始 SFC 注入到 <script setup> 块内，编译后 JS 注入到顶部
		const newCode = rawSfc ? injectIntoScriptSetup(code, importStatements) : injectImports(code, importStatements, this.options.injectAtPosition)

		return { code: newCode }
	}

	/**
	 * 生成 TypeScript 类型声明文件
	 *
	 * @description 仅在内容变化时才写入文件，减少不必要的 IO。
	 * 使用 {@link shouldUpdateDts} 判断是否需要更新，
	 * 使用 {@link safeExecuteSync} 安全执行写入操作。
	 */
	private generateDts(): void {
		if (this.allResolvedImports.length === 0) return

		const root = this.viteConfig?.root || process.cwd()
		const dtsValue = typeof this.options.dts === 'string' ? this.options.dts : 'src/auto-imports.d.ts'
		const dtsPath = path.isAbsolute(dtsValue) ? dtsValue : path.resolve(root, dtsValue)

		const content = generateDtsContent(this.allResolvedImports)

		if (shouldUpdateDts(dtsPath, content)) {
			this.safeExecuteSync(() => {
				writeDtsFile(dtsPath, content)
				this.logger.info(`类型声明文件已生成: ${this.options.dts}`)
			}, '生成类型声明文件')
		}
	}

	/**
	 * 获取当前所有解析后的导入映射
	 *
	 * @returns {ResolvedImport[]} 导入映射列表的浅拷贝
	 *
	 * @description 返回当前插件解析的所有导入映射，
	 * 包括 `imports` 配置和 `dirs` 扫描结果。
	 * 返回浅拷贝以防止外部修改内部状态。
	 */
	public getResolvedImports(): ResolvedImport[] {
		return [...this.allResolvedImports]
	}

	/**
	 * 获取名称查找映射表
	 *
	 * @returns {Map<string, ResolvedImport>} 名称→模块映射表的拷贝
	 *
	 * @description 返回当前插件的名称查找映射表，
	 * 返回拷贝以防止外部修改内部状态。
	 */
	public getNameLookup(): Map<string, ResolvedImport> {
		return new Map(this.nameLookup)
	}
}

/**
 * 创建自动导入插件
 *
 * @function autoImport
 * @param {AutoImportOptions} [options] - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @description 自动注入 import 语句的 Vite 插件工厂函数。
 * 支持预设映射和目录扫描两种方式发现可自动导入的标识符，
 * 可选生成 TypeScript 类型声明文件，支持 Vue 模板自动导入。
 *
 * **特性：**
 * - 多格式导入映射配置（简写 / 完整 / 混合）
 * - 递归目录扫描，自动发现导出
 * - 智能去重，跳过已显式导入的标识符
 * - Vue SFC 模板自动导入支持
 * - TypeScript 类型声明自动生成
 * - 可配置注入位置（顶部 / 最后 import 后）
 * - 自动跳过 shebang 和 `"use strict"`
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { autoImport } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     autoImport({
 *       imports: {
 *         vue: ['ref', 'reactive', 'computed', 'watch', 'onMounted'],
 *         'vue-router': ['useRouter', 'useRoute']
 *       },
 *       dirs: ['src/composables'],
 *       dts: 'src/auto-imports.d.ts',
 *       vueTemplate: true,
 *       injectAtPosition: 'after-last-import'
 *     })
 *   ]
 * })
 * ```
 */
export const autoImport = createPluginFactory(AutoImportPlugin)
export * from './types'
