import type { Plugin, ResolvedConfig } from 'vite'
import path from 'node:path'
import { BasePlugin, createPluginFactory } from '@/factory'
import { stripCommentsAndStrings } from '@/common/code'
import type { AutoImportOptions, ImportInline } from './types'
import { resolveImportsConfig, buildNameLookup } from './helpers/resolver'
import { scanDirectories, scannedModulesToImports } from './helpers/scanner'
import { detectUsedImports, isAlreadyImported, generateImportStatements, injectImports, injectIntoScriptSetup, isRawSfc, detectVueTemplateImports, detectVueDirectiveImports, hasDisableComment } from './helpers/transform'
import { generateDtsContent, writeDtsFile, shouldUpdateDts, mergeDtsContent } from './helpers/dts'
import { AutoImportCache } from './helpers/cache'
import { generateEslintrc, generateBiomelintrc } from './helpers/lint'
import { resolvePackagePreset } from './helpers/presets'

/**
 * 自动导入插件
 *
 * @class AutoImportPlugin
 * @extends {BasePlugin<AutoImportOptions>}
 *
 * @description 自动注入 import 语句的 Vite 插件，支持预设系统、别名导入、类型导入、
 * 目录 glob 扫描、ESLint/Biome 配置生成、缓存机制等增强功能。
 *
 * **核心功能：**
 * - 内置预设：`imports: ['vue', 'vue-router', 'pinia']` 一键配置
 * - 别名导入：`['useFetch', 'useMyFetch']` 生成 `import { useFetch as useMyFetch }`
 * - 类型导入：`{ from: 'vue-router', imports: ['RouteLocationRaw'], type: true }`
 * - 命名空间导入：`['*', '_']` 生成 `import * as _ from 'lodash'`
 * - export assignment 导入：`['=', 'browser']` 生成 `import browser from 'webextension-polyfill'`
 * - 目录 glob 扫描：`dirs: ['./composables/**']`
 * - ESLint/Biome 配置自动生成
 * - Vite optimizeDeps 自动集成
 * - `@unimport-disable` 注释禁用支持
 * - 自定义 Resolver 支持
 * - HMR 热更新支持（扫描目录变更自动刷新）
 *
 * **生命周期钩子：**
 * - `configResolved`：初始化映射表、目录扫描、Vite optimizeDeps 集成
 * - `transform`（order: 'pre'）：代码转换，注入 import 语句
 * - `buildEnd`：生成 DTS、ESLint/Biome 配置
 * - `handleHotUpdate`：HMR 时扫描目录变更自动刷新映射表
 */
class AutoImportPlugin extends BasePlugin<AutoImportOptions> {
	/** 名称→模块映射表 */
	private nameLookup: Map<string, ImportInline> = new Map()

	/** 所有解析后的导入列表 */
	private allImports: ImportInline[] = []

	/** 忽略标识符集合 */
	private ignoreSet: Set<string> = new Set()

	/** 缓存实例 */
	private cache: AutoImportCache | null = null

	/** 插件是否已完成初始化 */
	private initialized = false

	/** DTS 是否已在初始化阶段生成（避免 buildEnd 重复写入） */
	private dtsGeneratedInInit = false

	/** Vite 配置引用 */
	private resolvedConfig: ResolvedConfig | null = null

	/**
	 * 获取插件默认配置
	 *
	 * @returns {Partial<AutoImportOptions>} 默认配置对象
	 */
	protected getDefaultOptions(): Partial<AutoImportOptions> {
		return {
			imports: [],
			dirs: [],
			dts: 'src/auto-imports.d.ts',
			vueTemplate: false,
			vueDirectives: false,
			ignore: [],
			include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
			exclude: [/node_modules/, /\.git/],
			injectAtPosition: 'top',
			defaultExportByFilename: false,
			viteOptimizeDeps: false,
			commentsDisable: ['@unimport-disable'],
			cache: true,
			eslintrc: { enabled: false },
			biomelintrc: { enabled: false },
			dirsScanOptions: {},
			ignoreDts: [],
			resolvers: [],
			packagePresets: []
		}
	}

	/**
	 * 校验用户传入的配置选项
	 *
	 * @throws {Error} 当配置项不合法时抛出校验错误
	 */
	protected validateOptions(): void {
		this.validator
			.field('dts')
			.custom(v => v === false || v === true || typeof v === 'string' || (typeof v === 'object' && v !== null && 'filepath' in v), 'dts 必须为 false、true、字符串路径或 DtsConfigObject')
			.field('vueTemplate')
			.boolean()
			.field('vueDirectives')
			.custom(v => v === undefined || v === false || v === true || typeof v === 'object', 'vueDirectives 必须为 boolean 或 VueDirectivesConfig')
			.field('injectAtPosition')
			.enum(['top', 'after-last-import'])
			.field('viteOptimizeDeps')
			.boolean()
			.field('cache')
			.custom(v => v === true || v === false || typeof v === 'object', 'cache 必须为 boolean 或 CacheConfig')
			.validate()
	}

	/**
	 * 获取插件名称
	 *
	 * @returns {string} 插件名称 'auto-import'
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
	 * - **configResolved**：初始化插件、Vite optimizeDeps 集成
	 * - **transform**（order: 'pre'）：代码转换
	 * - **buildEnd**：生成 DTS 和 lint 配置
	 * - **handleHotUpdate**：HMR 时扫描目录变更自动刷新映射表
	 */
	protected addPluginHooks(plugin: Plugin): void {
		plugin.configResolved = (config: ResolvedConfig) => {
			this.resolvedConfig = config
			this.initialize(config)

			// Vite optimizeDeps 集成
			if (this.options.viteOptimizeDeps && config.optimizeDeps) {
				const modules = new Set<string>()
				for (const imp of this.allImports) {
					// 仅收集 npm 包名（不以 . / 开头的模块路径）
					if (!imp.from.startsWith('.') && !imp.from.startsWith('/') && !path.isAbsolute(imp.from)) {
						modules.add(imp.from)
					}
				}
				if (modules.size > 0) {
					config.optimizeDeps.include ??= []
					for (const mod of modules) {
						if (!config.optimizeDeps.include.includes(mod)) {
							config.optimizeDeps.include.push(mod)
						}
					}
				}
			}
		}

		plugin.transform = {
			order: 'pre',
			handler: (code: string, id: string) => {
				if (!this.options.enabled || !this.initialized) return null
				if (!this.shouldTransformFile(id)) return null
				return this.safeExecuteSync(() => this.transformCode(code, id), '自动导入代码转换') ?? null
			}
		}

		plugin.buildEnd = () => {
			if (!this.options.enabled) return
			if (this.initialized) {
				// 仅当 DTS 未在初始化阶段生成时才在 buildEnd 生成
				if (!this.dtsGeneratedInInit) {
					this.safeExecuteSync(() => this.generateDts(), '生成类型声明文件')
				}
				this.safeExecuteSync(() => this.generateLintConfigs(), '生成 lint 配置文件')
			}
		}

		// HMR：当扫描目录中的文件变更时，重新扫描并刷新映射表
		plugin.handleHotUpdate = (ctx: { file: string; server?: any }) => {
			if (!this.options.enabled || !this.initialized) return
			if (!this.options.dirs || this.options.dirs.length === 0) return

			const root = this.resolvedConfig?.root || process.cwd()
			const changedFile = ctx.file

			// 判断变更文件是否在扫描目录范围内
			const isDirFile = (this.options.dirs ?? []).some(dir => {
				const dirPath = typeof dir === 'string' ? dir.replace(/[/\\]\*\*$/, '').replace(/[/\\]\*$/, '') : dir.glob.replace(/[/\\]\*\*$/, '').replace(/[/\\]\*$/, '')
				const absoluteDir = path.isAbsolute(dirPath) ? dirPath : path.resolve(root, dirPath)
				return changedFile.startsWith(absoluteDir)
			})

			if (isDirFile) {
				this.safeExecuteSync(() => {
					this.initialize(this.resolvedConfig ?? undefined)
					this.logger.info(`HMR: 扫描目录文件变更，已重新加载映射表 (${changedFile})`)
				}, 'HMR 重新加载映射表')
			}
		}
	}

	/**
	 * 判断文件是否应被 transform 处理
	 *
	 * @param id 文件路径
	 * @returns 是否需要处理
	 *
	 * @description 使用 include/exclude 过滤
	 */
	private shouldTransformFile(id: string): boolean {
		// exclude 检查（优先级最高）
		if (this.options.exclude && this.options.exclude.length > 0) {
			for (const pattern of this.options.exclude) {
				if (typeof pattern === 'string') {
					if (id.includes(pattern)) return false
				} else if (pattern instanceof RegExp) {
					if (pattern.test(id)) return false
				}
			}
		}

		// include 检查
		if (this.options.include && this.options.include.length > 0) {
			for (const pattern of this.options.include) {
				if (typeof pattern === 'string') {
					if (id.includes(pattern)) return true
				} else if (pattern instanceof RegExp) {
					if (pattern.test(id)) return true
				}
			}
			return false
		}

		return true
	}

	/**
	 * 初始化插件：解析映射、扫描目录、构建查找表
	 *
	 * @param config Vite 解析后的配置
	 */
	private initialize(config?: ResolvedConfig): void {
		const root = config?.root || this.viteConfig?.root || process.cwd()

		// 1. 初始化缓存
		if (this.options.cache) {
			const cacheConfig = typeof this.options.cache === 'object' ? this.options.cache : { enabled: true }
			this.cache = new AutoImportCache(cacheConfig)
		}

		// 2. 解析 imports 配置（含预设、类型导入、别名）
		const configImports = resolveImportsConfig(this.options.imports, root)

		// 3. 解析 packagePresets
		const packageImports = (this.options.packagePresets ?? []).flatMap(p => resolvePackagePreset(p, root))

		// 4. 扫描目录
		const scannedModules = scanDirectories(this.options.dirs ?? [], root, this.options.dirsScanOptions)
		const scannedImports = scannedModulesToImports(scannedModules, {
			defaultExportByFilename: this.options.defaultExportByFilename
		})

		// 5. 合并所有导入源
		this.allImports = [...configImports, ...packageImports, ...scannedImports]

		// 6. 构建查找表
		this.nameLookup = buildNameLookup(this.allImports)

		// 7. 构建忽略集合
		this.ignoreSet = new Set(this.options.ignore)

		this.initialized = true

		this.logger.info(`初始化完成: ${this.allImports.length} 个自动导入映射, ${scannedModules.length} 个扫描模块`)

		// 8. 初始化完成后立即生成 DTS（开发模式也需要类型提示）
		this.dtsGeneratedInInit = false
		if (this.options.dts) {
			this.generateDts()
			this.dtsGeneratedInInit = true
		}
	}

	/**
	 * 转换代码：检测使用的标识符并注入 import 语句
	 *
	 * @param code 源代码字符串
	 * @param id 文件路径
	 * @returns 转换结果对象
	 */
	private transformCode(code: string, id: string): { code: string; map?: any } | null {
		// 检查禁用注释
		if (hasDisableComment(code, this.options.commentsDisable ?? [])) return null

		// 判断是否为原始 SFC 文件
		const rawSfc = id.endsWith('.vue') && isRawSfc(code)

		// 检测代码中使用的标识符
		let usedImports = detectUsedImports(code, this.nameLookup, this.ignoreSet)

		// Vue 模板检测
		if (this.options.vueTemplate && rawSfc) {
			const templateImports = detectVueTemplateImports(code, this.nameLookup, this.ignoreSet)
			// 合并去重
			const seen = new Set(usedImports.map(i => i.as || i.name))
			for (const imp of templateImports) {
				const key = imp.as || imp.name
				if (!seen.has(key)) {
					seen.add(key)
					usedImports.push(imp)
				}
			}
		}

		// Vue 指令检测
		if (this.options.vueDirectives && rawSfc) {
			const directiveImports = detectVueDirectiveImports(code, this.nameLookup, this.ignoreSet, this.options.vueDirectives)
			const seen = new Set(usedImports.map(i => i.as || i.name))
			for (const imp of directiveImports) {
				const key = imp.as || imp.name
				if (!seen.has(key)) {
					seen.add(key)
					usedImports.push(imp)
				}
			}
		}

		// Resolver 回退解析：对 nameLookup 未命中的标识符尝试 resolver
		if (this.options.resolvers && this.options.resolvers.length > 0) {
			const alreadyResolved = new Set(usedImports.map(i => i.as || i.name))
			const strippedCode = stripCommentsAndStrings(code)
			const identifierPattern = /(?<![.\w$])([a-zA-Z_$][\w$]*)(?=\s*[<(.,:;\n\r)\]}]|$)/g
			let match: RegExpExecArray | null
			while ((match = identifierPattern.exec(strippedCode)) !== null) {
				const name = match[1]
				// 跳过已解析、已忽略、JS 关键字
				if (alreadyResolved.has(name) || this.ignoreSet.has(name)) continue
				for (const resolver of this.options.resolvers) {
					const resolved = resolver.resolve?.(name) ?? resolver.typeResolve?.(name)
					if (resolved) {
						alreadyResolved.add(name)
						usedImports.push(resolved)
						break
					}
				}
			}
		}

		// 过滤掉已显式导入的标识符
		usedImports = usedImports.filter(imp => {
			const name = imp.as || imp.name
			return !isAlreadyImported(code, name)
		})

		if (usedImports.length === 0) return null

		// 生成 import 语句
		const importStatements = generateImportStatements(usedImports)

		// 注入到代码中
		const newCode = rawSfc ? injectIntoScriptSetup(code, importStatements) : injectImports(code, importStatements, this.options.injectAtPosition)

		return { code: newCode }
	}

	/**
	 * 生成 TypeScript 类型声明文件
	 */
	private generateDts(): void {
		if (this.allImports.length === 0) return

		const root = this.resolvedConfig?.root || this.viteConfig?.root || process.cwd()

		// 解析 DTS 路径和模式
		let dtsPath: string
		let dtsMode: 'append' | 'overwrite' = 'overwrite'

		if (typeof this.options.dts === 'string') {
			dtsPath = path.isAbsolute(this.options.dts) ? this.options.dts : path.resolve(root, this.options.dts)
		} else if (typeof this.options.dts === 'object' && 'filepath' in this.options.dts) {
			const dtsObj = this.options.dts
			dtsPath = path.isAbsolute(dtsObj.filepath) ? dtsObj.filepath : path.resolve(root, dtsObj.filepath)
			dtsMode = dtsObj.mode ?? 'overwrite'
		} else {
			dtsPath = path.resolve(root, 'src/auto-imports.d.ts')
		}

		// 生成内容
		const content = generateDtsContent(this.allImports, {
			mode: dtsMode,
			ignoreDts: this.options.ignoreDts
		})

		if (!content) return

		// 缓存检查
		if (this.cache && !this.cache.isDtsContentChanged(content)) return

		// 写入文件
		if (dtsMode === 'append') {
			const mergedContent = mergeDtsContent(dtsPath, content)
			if (shouldUpdateDts(dtsPath, mergedContent)) {
				this.safeExecuteSync(() => {
					writeDtsFile(dtsPath, mergedContent)
					this.logger.info(`类型声明文件已生成: ${this.options.dts} (append 模式)`)
				}, '生成类型声明文件')
			}
		} else {
			if (shouldUpdateDts(dtsPath, content)) {
				this.safeExecuteSync(() => {
					writeDtsFile(dtsPath, content)
					this.logger.info(`类型声明文件已生成: ${this.options.dts}`)
				}, '生成类型声明文件')
			}
		}

		// 更新缓存
		if (this.cache) {
			this.cache.setDtsContent(content)
		}
	}

	/**
	 * 生成 ESLint 和 Biome 配置文件
	 */
	private generateLintConfigs(): void {
		const root = this.resolvedConfig?.root || this.viteConfig?.root || process.cwd()

		if (this.options.eslintrc) {
			generateEslintrc(this.allImports, this.options.eslintrc, root)
		}

		if (this.options.biomelintrc) {
			generateBiomelintrc(this.allImports, this.options.biomelintrc, root)
		}
	}

	/**
	 * 获取当前所有解析后的导入映射
	 *
	 * @returns {ImportInline[]} 导入映射列表的浅拷贝
	 */
	public getImportInlines(): ImportInline[] {
		return [...this.allImports]
	}

	/**
	 * 获取名称查找映射表
	 *
	 * @returns {Map<string, ImportInline>} 名称→模块映射表的拷贝
	 */
	public getInlineNameLookup(): Map<string, ImportInline> {
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
 * @example
 * ```typescript
 * // 基本使用：使用内置预设
 * autoImport({
 *   imports: ['vue', 'vue-router', 'pinia'],
 *   dts: 'src/auto-imports.d.ts',
 *   vueTemplate: true,
 * })
 *
 * // 自定义导入（支持别名和类型）
 * autoImport({
 *   imports: [
 *     'vue',
 *     { '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']] },
 *     { from: 'vue-router', imports: ['RouteLocationRaw'], type: true },
 *   ],
 * })
 *
 * // 命名空间导入和 export assignment
 * autoImport({
 *   imports: [
 *     { lodash: [['*', '_']] },
 *     { 'webextension-polyfill': [['=', 'browser']] },
 *   ],
 * })
 *
 * // 目录扫描（支持 glob）
 * autoImport({
 *   dirs: ['./composables/**', { glob: './hooks', types: true }],
 * })
 *
 * // ESLint 配置生成
 * autoImport({
 *   imports: ['vue'],
 *   eslintrc: { enabled: true },
 * })
 * ```
 */
export const autoImport = createPluginFactory(AutoImportPlugin)
export * from './types'
