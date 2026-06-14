import { readdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'

interface PluginInfo {
	directoryName: string
	kebabName: string
	camelName: string
	hasTypes: boolean
	hasIndex: boolean
	optionsInterface: string | null
	description: string | null
}

interface SyncResult {
	plugin: PluginInfo
	zhDocExists: boolean
	enDocExists: boolean
	sidebarZhExists: boolean
	sidebarEnExists: boolean
	indexZhExists: boolean
	indexEnExists: boolean
	actions: string[]
}

const SCRIPT_DIR = import.meta.dirname ?? __dirname
const DOCS_DIR = resolve(SCRIPT_DIR, '..')
const PLUGIN_DIR = resolve(SCRIPT_DIR, '..', '..', 'core', 'src', 'plugins')
const ZH_PLUGINS_DIR = join(DOCS_DIR, 'src', 'plugins')
const EN_PLUGINS_DIR = join(DOCS_DIR, 'src', 'en', 'plugins')
const ZH_CONFIG_PATH = join(DOCS_DIR, '.vitepress', 'config', 'zh.ts')
const EN_CONFIG_PATH = join(DOCS_DIR, '.vitepress', 'config', 'en.ts')
const ZH_INDEX_PATH = join(ZH_PLUGINS_DIR, 'index.md')
const EN_INDEX_PATH = join(EN_PLUGINS_DIR, 'index.md')

const PLUGIN_DESCRIPTIONS_ZH: Record<string, string> = {
	assetManifest: '构建产物资源清单生成，支持多种输出格式、按入口分组和运行时注入',
	autoImport: '自动注入 import 语句，支持预设映射、目录扫描和 Vue 模板自动导入',
	buildProgress: '在终端实时显示构建进度条',
	bundleAnalyzer: '构建产物体积分析，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比',
	compressAssets: '构建产物压缩，支持 gzip / brotli / both',
	copyFile: '构建完成后复制文件或目录到指定位置',
	faviconManager: '管理网站图标（favicon）链接注入到 HTML 文件',
	generateRouter: '根据 uni-app pages.json 自动生成路由配置',
	generateVersion: '自动生成版本号，支持文件输出和全局变量注入',
	htmlInject: 'HTML 内容注入，支持多种位置和条件注入',
	loadingManager: '全局 Loading 状态管理，支持请求拦截',
	versionUpdateChecker: '运行时版本更新检查，发现新版本时提示用户刷新'
}

const PLUGIN_DESCRIPTIONS_EN: Record<string, string> = {
	assetManifest: 'Build artifact manifest generation with multiple output formats, entry grouping, and runtime injection',
	autoImport: 'Auto-inject import statements with preset mappings, directory scanning, and Vue template support',
	buildProgress: 'Display real-time build progress bar in terminal',
	bundleAnalyzer: 'Build artifact size analysis with JSON/HTML reports, gzip calculation, threshold alerts, and build comparison',
	compressAssets: 'Compress build artifacts with gzip / brotli / both',
	copyFile: 'Copy files or directories after build',
	faviconManager: 'Manage website favicon links injection into HTML',
	generateRouter: 'Auto-generate route config from uni-app pages.json',
	generateVersion: 'Generate version with file output or global variable',
	htmlInject: 'HTML content injection with multiple positions and conditions',
	loadingManager: 'Global Loading state management with request interception',
	versionUpdateChecker: 'Runtime version update check with refresh prompt'
}

const BT = '`'
const TBT = '```'

function toKebabCase(str: string): string {
	return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

function scanPlugins(): PluginInfo[] {
	const plugins: PluginInfo[] = []
	const entries = readdirSync(PLUGIN_DIR, { withFileTypes: true })

	for (const entry of entries) {
		if (!entry.isDirectory()) continue
		if (entry.name === 'index.ts' || entry.name === 'common') continue

		const pluginPath = join(PLUGIN_DIR, entry.name)
		const kebabName = toKebabCase(entry.name)
		const camelName = entry.name

		const typesPath = join(pluginPath, 'types.ts')
		const indexPath = join(pluginPath, 'index.ts')

		let optionsInterface: string | null = null
		let description: string | null = null

		if (existsSync(typesPath)) {
			const content = readFileSync(typesPath, 'utf-8')
			const interfaceMatch = content.match(/export\s+interface\s+(\w+Options)\s/)
			if (interfaceMatch) {
				optionsInterface = interfaceMatch[1]
			}
			const descMatch = content.match(/@description\s+(.+)/)
			if (descMatch) {
				description = descMatch[1].trim()
			}
		}

		plugins.push({
			directoryName: entry.name,
			kebabName,
			camelName,
			hasTypes: existsSync(typesPath),
			hasIndex: existsSync(indexPath),
			optionsInterface,
			description
		})
	}

	return plugins.sort((a, b) => a.kebabName.localeCompare(b.kebabName))
}

function extractOptionsFromTypes(plugin: PluginInfo): Array<{ name: string; type: string; description: string; defaultVal: string }> {
	const typesPath = join(PLUGIN_DIR, plugin.directoryName, 'types.ts')
	if (!existsSync(typesPath)) return []

	const content = readFileSync(typesPath, 'utf-8')
	const options: Array<{ name: string; type: string; description: string; defaultVal: string }> = []

	const interfaceRegex = /export\s+interface\s+\w+Options[^{]*\{([\s\S]*?)\}/
	const match = content.match(interfaceRegex)
	if (!match) return options

	const body = match[1]
	const fieldRegex = /\/\*\*\s*([^*]*(?:\*(?!\/)[^*]*)*)\*\/\s*(\w+)(\??):\s*([^;\n]+)/g
	let fieldMatch: RegExpExecArray | null

	while ((fieldMatch = fieldRegex.exec(body)) !== null) {
		const desc = fieldMatch[1].replace(/\*\s*/g, ' ').trim()
		const name = fieldMatch[2]
		const type = fieldMatch[4].trim()

		options.push({
			name,
			type,
			description: desc,
			defaultVal: '-'
		})
	}

	const defaultsPath = join(PLUGIN_DIR, plugin.directoryName, 'index.ts')
	if (existsSync(defaultsPath)) {
		const defaultsContent = readFileSync(defaultsPath, 'utf-8')
		const defaultsMatch = defaultsContent.match(/getDefaultOptions\(\)[\s\S]*?return\s*\{([\s\S]*?)\}/)
		if (defaultsMatch) {
			const defaultsBody = defaultsMatch[1]
			for (const opt of options) {
				const defaultRegex = new RegExp(`${opt.name}\\s*:\\s*([^,\\n]+)`)
				const defaultMatch = defaultsBody.match(defaultRegex)
				if (defaultMatch) {
					opt.defaultVal = defaultMatch[1].trim().replace(/['"]/g, "'")
				}
			}
		}
	}

	const baseOptions = [
		{ name: 'enabled', type: 'boolean', description: '启用插件', defaultVal: 'true' },
		{ name: 'verbose', type: 'boolean', description: '显示详细日志', defaultVal: 'true' },
		{ name: 'errorStrategy', type: "'throw' | 'log' | 'ignore'", description: '错误处理策略', defaultVal: "'throw'" }
	]

	for (const base of baseOptions) {
		if (!options.find(o => o.name === base.name)) {
			options.push(base)
		}
	}

	return options
}

function generateZhDoc(plugin: PluginInfo, options: Array<{ name: string; type: string; description: string; defaultVal: string }>): string {
	const desc = PLUGIN_DESCRIPTIONS_ZH[plugin.camelName] || plugin.description || `${plugin.camelName} 插件`
	const optionsRows = options.map(o => `| ${o.name} | ${BT}${o.type}${BT} | ${o.defaultVal} | ${o.description} |`).join('\n')
	const interfaceName = plugin.optionsInterface || `${plugin.camelName}Options`

	const lines = [
		`# ${plugin.camelName}`,
		'',
		`${desc}。`,
		'',
		'## 导入方式',
		'',
		`${TBT}typescript`,
		`// 子模块独立导入（推荐）`,
		`import { ${plugin.camelName} } from '@meng-xi/vite-plugin/plugins/${plugin.kebabName}'`,
		`import type { ${interfaceName} } from '@meng-xi/vite-plugin/plugins/${plugin.kebabName}'`,
		'',
		`// barrel 导入`,
		`import { ${plugin.camelName} } from '@meng-xi/vite-plugin'`,
		TBT,
		'',
		'## 快速开始',
		'',
		`${TBT}typescript`,
		`import { defineConfig } from 'vite'`,
		`import { ${plugin.camelName} } from '@meng-xi/vite-plugin'`,
		'',
		'export default defineConfig({',
		'	plugins: [',
		`		${plugin.camelName}()`,
		'	]',
		'})',
		TBT,
		'',
		'## 配置选项',
		'',
		'| 选项          | 类型                           | 默认值    | 说明               |',
		'| ------------- | ------------------------------ | --------- | ------------------ |',
		optionsRows,
		'',
		'## 示例',
		'',
		'### 基本用法',
		'',
		`${TBT}typescript`,
		`${plugin.camelName}()`,
		TBT,
		'',
		'### 仅生产环境启用',
		'',
		`${TBT}typescript`,
		`${plugin.camelName}({`,
		"	enabled: process.env.NODE_ENV === 'production'",
		'})',
		TBT,
		'',
		'### 记录错误但不中断构建',
		'',
		`${TBT}typescript`,
		`${plugin.camelName}({`,
		"	errorStrategy: 'log'",
		'})',
		TBT,
		'',
		'## 注意事项',
		'',
		'- <!-- 请根据插件实际情况补充注意事项 -->',
		''
	]

	return lines.join('\n')
}

function generateEnDoc(plugin: PluginInfo, options: Array<{ name: string; type: string; description: string; defaultVal: string }>): string {
	const desc = PLUGIN_DESCRIPTIONS_EN[plugin.camelName] || plugin.description || `${plugin.camelName} plugin`
	const optionsRows = options.map(o => `| ${o.name} | ${BT}${o.type}${BT} | ${o.defaultVal} | ${o.description} |`).join('\n')
	const interfaceName = plugin.optionsInterface || `${plugin.camelName}Options`

	const lines = [
		`# ${plugin.camelName}`,
		'',
		`${desc}.`,
		'',
		'## Import Methods',
		'',
		`${TBT}typescript`,
		'// Submodule import (recommended)',
		`import { ${plugin.camelName} } from '@meng-xi/vite-plugin/plugins/${plugin.kebabName}'`,
		`import type { ${interfaceName} } from '@meng-xi/vite-plugin/plugins/${plugin.kebabName}'`,
		'',
		'// Barrel import',
		`import { ${plugin.camelName} } from '@meng-xi/vite-plugin'`,
		TBT,
		'',
		'## Quick Start',
		'',
		`${TBT}typescript`,
		`import { defineConfig } from 'vite'`,
		`import { ${plugin.camelName} } from '@meng-xi/vite-plugin'`,
		'',
		'export default defineConfig({',
		'	plugins: [',
		`		${plugin.camelName}()`,
		'	]',
		'})',
		TBT,
		'',
		'## Options',
		'',
		'| Option         | Type                            | Default   | Description        |',
		'| -------------- | ------------------------------- | --------- | ------------------ |',
		optionsRows,
		'',
		'## Examples',
		'',
		'### Basic Usage',
		'',
		`${TBT}typescript`,
		`${plugin.camelName}()`,
		TBT,
		'',
		'### Production Only',
		'',
		`${TBT}typescript`,
		`${plugin.camelName}({`,
		"	enabled: process.env.NODE_ENV === 'production'",
		'})',
		TBT,
		'',
		'### Log Errors Without Breaking Build',
		'',
		`${TBT}typescript`,
		`${plugin.camelName}({`,
		"	errorStrategy: 'log'",
		'})',
		TBT,
		'',
		'## Notes',
		'',
		"- <!-- Please add notes based on the plugin's actual behavior -->",
		''
	]

	return lines.join('\n')
}

function checkSidebarEntry(configPath: string, kebabName: string, prefix: string): boolean {
	const content = readFileSync(configPath, 'utf-8')
	const linkPattern = `${prefix}/plugins/${kebabName}.html`
	return content.includes(linkPattern)
}

function addSidebarEntry(configPath: string, plugin: PluginInfo, prefix: string): void {
	const content = readFileSync(configPath, 'utf-8')
	const linkPattern = `${prefix}/plugins/${plugin.kebabName}.html`

	if (content.includes(linkPattern)) return

	const insertAfterLink = `${prefix}/plugins/build-progress.html`

	const newEntry = `\t\t\t\t\t\t{\n\t\t\t\t\t\t\ttext: '${plugin.camelName}',\n\t\t\t\t\t\t\tlink: '${prefix}/plugins/${plugin.kebabName}.html'\n\t\t\t\t\t\t},`

	const anchorIdx = content.indexOf(insertAfterLink)
	if (anchorIdx === -1) return

	const lineStart = content.lastIndexOf('{', anchorIdx)
	const lineEnd = content.indexOf('}', anchorIdx + insertAfterLink.length)
	if (lineStart === -1 || lineEnd === -1) return

	const existingBlock = content.substring(lineStart, lineEnd + 1)
	const newBlock = existingBlock + ',\n' + newEntry

	const updated = content.replace(existingBlock, newBlock)
	writeFileSync(configPath, updated)
	console.log(`  ✓ 已添加 ${plugin.camelName} 到 ${relative(DOCS_DIR, configPath)} 侧边栏`)
}

function checkIndexEntry(indexPath: string, camelName: string): boolean {
	const content = readFileSync(indexPath, 'utf-8')
	return content.includes(camelName)
}

function updateZhIndex(plugins: PluginInfo[]): void {
	const barrelImports = plugins.map(p => p.camelName).join(', ')
	const submoduleImports = plugins.map(p => `import { ${p.camelName} } from '@meng-xi/vite-plugin/plugins/${p.kebabName}'`).join('\n')
	const tableRows = plugins
		.map(p => {
			const desc = PLUGIN_DESCRIPTIONS_ZH[p.camelName] || p.description || ''
			return `| [${p.camelName}](./${p.kebabName}) | ${desc} | ${BT}@meng-xi/vite-plugin/plugins/${p.kebabName}${BT} |`
		})
		.join('\n')

	const lines = [
		'# 插件列表',
		'',
		'@meng-xi/vite-plugin 提供的 Vite 插件集合。',
		'',
		'## 导入方式',
		'',
		'### 通过 barrel 导入（导入所有插件）',
		'',
		`${TBT}typescript`,
		`import { ${barrelImports} } from '@meng-xi/vite-plugin'`,
		TBT,
		'',
		'### 通过子模块独立导入（推荐，支持 tree-shaking）',
		'',
		`${TBT}typescript`,
		submoduleImports,
		TBT,
		'',
		'::: tip 子模块独立导入可让打包工具仅打包使用到的插件代码，避免引入不需要的依赖。 :::',
		'',
		'## 插件',
		'',
		'| 插件 | 说明 | 子模块路径 |',
		'| --- | --- | --- |',
		tableRows,
		'',
		'## 通用配置',
		'',
		'所有插件继承自 `BasePlugin`，共享以下基础配置：',
		'',
		'| 选项          | 类型                           | 默认值    | 说明         |',
		'| ------------- | ------------------------------ | --------- | ------------ |',
		`| enabled       | ${BT}boolean${BT}                      | ${BT}true${BT}    | 启用插件     |`,
		`| verbose       | ${BT}boolean${BT}                      | ${BT}true${BT}    | 显示详细日志 |`,
		`| errorStrategy | ${BT}'throw' \\| 'log' \\| 'ignore'${BT} | ${BT}'throw'${BT} | 错误处理策略 |`,
		''
	]

	writeFileSync(ZH_INDEX_PATH, lines.join('\n'))
	console.log('  ✓ 已更新中文 plugins/index.md')
}

function updateEnIndex(plugins: PluginInfo[]): void {
	const barrelImports = plugins.map(p => p.camelName).join(', ')
	const submoduleImports = plugins.map(p => `import { ${p.camelName} } from '@meng-xi/vite-plugin/plugins/${p.kebabName}'`).join('\n')
	const tableRows = plugins
		.map(p => {
			const desc = PLUGIN_DESCRIPTIONS_EN[p.camelName] || p.description || ''
			return `| [${p.camelName}](./${p.kebabName}) | ${desc} | ${BT}@meng-xi/vite-plugin/plugins/${p.kebabName}${BT} |`
		})
		.join('\n')

	const lines = [
		'# Plugins List',
		'',
		'Vite plugin collection provided by @meng-xi/vite-plugin.',
		'',
		'## Import Methods',
		'',
		'### Barrel import (import all plugins)',
		'',
		`${TBT}typescript`,
		`import { ${barrelImports} } from '@meng-xi/vite-plugin'`,
		TBT,
		'',
		'### Submodule import (recommended, supports tree-shaking)',
		'',
		`${TBT}typescript`,
		submoduleImports,
		TBT,
		'',
		'::: tip Submodule imports allow bundlers to only include the plugin code you actually use, avoiding unnecessary dependencies. :::',
		'',
		'## Plugins',
		'',
		'| Plugin | Description | Submodule Path |',
		'| --- | --- | --- |',
		tableRows,
		'',
		'## Common Options',
		'',
		'All plugins extend `BasePlugin` and share these base options:',
		'',
		'| Option        | Type                           | Default   | Description             |',
		'| ------------- | ------------------------------ | --------- | ----------------------- |',
		`| enabled       | ${BT}boolean${BT}                      | ${BT}true${BT}    | Enable the plugin       |`,
		`| verbose       | ${BT}boolean${BT}                      | ${BT}true${BT}    | Show detailed logs      |`,
		`| errorStrategy | ${BT}'throw' \\| 'log' \\| 'ignore'${BT} | ${BT}'throw'${BT} | Error handling strategy |`,
		''
	]

	writeFileSync(EN_INDEX_PATH, lines.join('\n'))
	console.log('  ✓ 已更新英文 plugins/index.md')
}

function syncDocs(): void {
	console.log('=== 文档同步工具 ===\n')

	console.log('1. 扫描 core 插件目录...')
	const plugins = scanPlugins()
	console.log(`   发现 ${plugins.length} 个插件: ${plugins.map(p => p.camelName).join(', ')}\n`)

	console.log('2. 检查文档完整性...')
	const results: SyncResult[] = []

	for (const plugin of plugins) {
		const zhDocPath = join(ZH_PLUGINS_DIR, `${plugin.kebabName}.md`)
		const enDocPath = join(EN_PLUGINS_DIR, `${plugin.kebabName}.md`)

		const zhDocExists = existsSync(zhDocPath)
		const enDocExists = existsSync(enDocPath)
		const sidebarZhExists = checkSidebarEntry(ZH_CONFIG_PATH, plugin.kebabName, '')
		const sidebarEnExists = checkSidebarEntry(EN_CONFIG_PATH, plugin.kebabName, '/en')
		const indexZhExists = checkIndexEntry(ZH_INDEX_PATH, plugin.camelName)
		const indexEnExists = checkIndexEntry(EN_INDEX_PATH, plugin.camelName)

		const actions: string[] = []
		if (!zhDocExists) actions.push('创建中文文档')
		if (!enDocExists) actions.push('创建英文文档')
		if (!sidebarZhExists) actions.push('添加中文侧边栏')
		if (!sidebarEnExists) actions.push('添加英文侧边栏')
		if (!indexZhExists) actions.push('添加中文索引')
		if (!indexEnExists) actions.push('添加英文索引')

		results.push({
			plugin,
			zhDocExists,
			enDocExists,
			sidebarZhExists,
			sidebarEnExists,
			indexZhExists,
			indexEnExists,
			actions
		})

		const status = actions.length === 0 ? '✅ 完整' : `⚠️  缺失: ${actions.join(', ')}`
		console.log(`   ${plugin.camelName}: ${status}`)
	}

	const needsAction = results.filter(r => r.actions.length > 0)
	if (needsAction.length === 0) {
		console.log('\n✅ 所有文档已同步，无需更新！')
		return
	}

	console.log('\n3. 执行同步操作...\n')

	for (const result of needsAction) {
		const { plugin } = result
		console.log(`处理 ${plugin.camelName}...`)

		if (!result.zhDocExists) {
			const options = extractOptionsFromTypes(plugin)
			const content = generateZhDoc(plugin, options)
			writeFileSync(join(ZH_PLUGINS_DIR, `${plugin.kebabName}.md`), content)
			console.log(`  ✓ 已创建中文文档: plugins/${plugin.kebabName}.md`)
		}

		if (!result.enDocExists) {
			const options = extractOptionsFromTypes(plugin)
			const content = generateEnDoc(plugin, options)
			writeFileSync(join(EN_PLUGINS_DIR, `${plugin.kebabName}.md`), content)
			console.log(`  ✓ 已创建英文文档: en/plugins/${plugin.kebabName}.md`)
		}

		if (!result.sidebarZhExists) {
			addSidebarEntry(ZH_CONFIG_PATH, plugin, '')
		}

		if (!result.sidebarEnExists) {
			addSidebarEntry(EN_CONFIG_PATH, plugin, '/en')
		}
	}

	console.log('\n4. 更新索引页面...')
	updateZhIndex(plugins)
	updateEnIndex(plugins)

	console.log('\n✅ 文档同步完成！')

	const generatedDocs = needsAction.filter(r => !r.zhDocExists || !r.enDocExists)
	if (generatedDocs.length > 0) {
		console.log('\n⚠️  以下文档为自动生成的模板，请手动完善内容：')
		for (const result of generatedDocs) {
			if (!result.zhDocExists) console.log(`  - plugins/${result.plugin.kebabName}.md`)
			if (!result.enDocExists) console.log(`  - en/plugins/${result.plugin.kebabName}.md`)
		}
	}
}

function validateDocs(): void {
	console.log('=== 文档验证工具 ===\n')

	const plugins = scanPlugins()
	let errors = 0

	for (const plugin of plugins) {
		const zhDocPath = join(ZH_PLUGINS_DIR, `${plugin.kebabName}.md`)
		const enDocPath = join(EN_PLUGINS_DIR, `${plugin.kebabName}.md`)

		if (!existsSync(zhDocPath)) {
			console.log(`❌ 缺失中文文档: plugins/${plugin.kebabName}.md`)
			errors++
		} else {
			const content = readFileSync(zhDocPath, 'utf-8')
			if (!content.includes(plugin.camelName)) {
				console.log(`⚠️  中文文档可能过时: plugins/${plugin.kebabName}.md (未找到 ${plugin.camelName})`)
				errors++
			}
		}

		if (!existsSync(enDocPath)) {
			console.log(`❌ 缺失英文文档: en/plugins/${plugin.kebabName}.md`)
			errors++
		} else {
			const content = readFileSync(enDocPath, 'utf-8')
			if (!content.includes(plugin.camelName)) {
				console.log(`⚠️  英文文档可能过时: en/plugins/${plugin.kebabName}.md (未找到 ${plugin.camelName})`)
				errors++
			}
		}

		if (!checkSidebarEntry(ZH_CONFIG_PATH, plugin.kebabName, '')) {
			console.log(`⚠️  中文侧边栏缺少: ${plugin.camelName}`)
			errors++
		}

		if (!checkSidebarEntry(EN_CONFIG_PATH, plugin.kebabName, '/en')) {
			console.log(`⚠️  英文侧边栏缺少: ${plugin.camelName}`)
			errors++
		}

		if (!checkIndexEntry(ZH_INDEX_PATH, plugin.camelName)) {
			console.log(`⚠️  中文索引缺少: ${plugin.camelName}`)
			errors++
		}

		if (!checkIndexEntry(EN_INDEX_PATH, plugin.camelName)) {
			console.log(`⚠️  英文索引缺少: ${plugin.camelName}`)
			errors++
		}
	}

	if (errors === 0) {
		console.log('✅ 所有文档验证通过！')
	} else {
		console.log(`\n发现 ${errors} 个问题，请运行同步脚本修复: tsx scripts/sync-docs.ts`)
	}
}

const command = process.argv[2]

if (command === 'validate' || command === '--validate' || command === '-v') {
	validateDocs()
} else {
	syncDocs()
}
