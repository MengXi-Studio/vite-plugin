import type { ImportInline, VueDirectivesConfig } from '../types'
import { JS_KEYWORDS, stripCommentsAndStrings } from '@/common/code'
import { escapeRegex } from '@/common/string'

/**
 * 分析代码中使用的标识符，匹配自动导入映射
 *
 * @param code 源代码字符串
 * @param nameLookup 名称→模块映射表
 * @param ignore 需要忽略的标识符集合
 * @returns 需要自动导入的 ImportInline 列表
 *
 * @description 增强版：同时匹配原名和别名(as)
 */
export function detectUsedImports(code: string, nameLookup: Map<string, ImportInline>, ignore: Set<string>): ImportInline[] {
	const usedImports: ImportInline[] = []
	const seen = new Set<string>()

	const strippedCode = stripCommentsAndStrings(code)
	const identifierPattern = /(?<![.\w$])([a-zA-Z_$][\w$]*)(?=\s*[<(.,:;\n\r)\]}]|$)/g

	let match: RegExpExecArray | null
	while ((match = identifierPattern.exec(strippedCode)) !== null) {
		const name = match[1]

		if (JS_KEYWORDS.has(name)) continue
		if (seen.has(name) || ignore.has(name)) continue

		const resolved = nameLookup.get(name)
		if (resolved) {
			seen.add(name)
			usedImports.push(resolved)
		}
	}

	return usedImports
}

/**
 * 检查标识符是否已在代码中被显式导入
 *
 * @param code 源代码字符串
 * @param name 标识符名称
 * @returns 如果标识符已被显式导入返回 true
 *
 * @description 增强版：也检测 `import type` 形式
 */
export function isAlreadyImported(code: string, name: string): boolean {
	// 匹配 import { name } from '...'
	const namedImportRegex = new RegExp(`import\\s*\\{[^}]*\\b${escapeRegex(name)}\\b[^}]*\\}\\s*from`, 'm')
	if (namedImportRegex.test(code)) return true

	// 匹配 import type { name } from '...'
	const typeImportRegex = new RegExp(`import\\s+type\\s*\\{[^}]*\\b${escapeRegex(name)}\\b[^}]*\\}\\s*from`, 'm')
	if (typeImportRegex.test(code)) return true

	// 匹配 import name from '...'
	const defaultImportRegex = new RegExp(`import\\s+${escapeRegex(name)}\\s+from`, 'm')
	if (defaultImportRegex.test(code)) return true

	// 匹配 import * as name from '...'
	const namespaceImportRegex = new RegExp(`import\\s*\\*\\s*as\\s+${escapeRegex(name)}\\s+from`, 'm')
	if (namespaceImportRegex.test(code)) return true

	return false
}

/**
 * 生成 import 语句字符串（增强版）
 *
 * @param imports ImportInline 列表
 * @returns 生成的 import 语句字符串（多行）
 *
 * @description 增强版合并规则：
 * - 同模块的多个命名导入合并为 `import { a, b as c } from 'mod'`
 * - 别名导入生成 `import { name as alias } from 'mod'`
 * - 类型导入和值导入分开生成（先值后类型）
 * - 默认导入与命名导入合并为 `import Default, { named } from 'mod'`
 */
export function generateImportStatements(imports: ImportInline[]): string {
	// 分离值导入和类型导入
	const valueImports = imports.filter(imp => !imp.type)
	const typeImports = imports.filter(imp => imp.type)

	const valueStatements = generateStatementsForGroup(valueImports)
	const typeStatements = generateStatementsForGroup(typeImports, true)

	return [valueStatements, typeStatements].filter(s => s).join('\n')
}

/**
 * 为一组导入项生成合并的 import 语句
 *
 * @param imports 同组（值或类型）的导入项
 * @param isType 是否为类型导入
 * @returns 合并后的 import 语句字符串
 *
 * @description 支持特殊导入形式：
 * - `name: '*'` → `import * as alias from 'mod'`（命名空间导入）
 * - `name: '='` → `import alias from 'mod'`（export assignment 导入，如 TypeScript 的 `export =`）
 */
function generateStatementsForGroup(imports: ImportInline[], isType: boolean = false): string {
	// 先提取特殊导入（命名空间和 export assignment），它们无法合并
	const specialStatements: string[] = []
	const normalImports: ImportInline[] = []
	const importKeyword = isType ? 'import type' : 'import'

	for (const imp of imports) {
		if (imp.name === '*') {
			// 命名空间导入: import * as alias from 'mod'
			const alias = imp.as || imp.from
			specialStatements.push(`${importKeyword} * as ${alias} from '${imp.from}'`)
		} else if (imp.name === '=') {
			// export assignment 导入: import alias from 'mod'
			const alias = imp.as || imp.from
			specialStatements.push(`${importKeyword} ${alias} from '${imp.from}'`)
		} else {
			normalImports.push(imp)
		}
	}

	// 常规导入合并逻辑
	const moduleMap = new Map<string, { named: Array<{ name: string; as?: string }>; default_: string | null }>()

	for (const imp of normalImports) {
		if (!moduleMap.has(imp.from)) {
			moduleMap.set(imp.from, { named: [], default_: null })
		}

		const group = moduleMap.get(imp.from)!

		if (imp.isDefault || imp.name === 'default') {
			if (group.default_ === null) {
				group.default_ = imp.as || imp.name
			}
		} else {
			// 检查重复
			const alreadyHas = group.named.some(n => n.name === imp.name && n.as === imp.as)
			if (!alreadyHas) {
				group.named.push({ name: imp.name, as: imp.as })
			}
		}
	}

	const statements: string[] = [...specialStatements]

	for (const [mod, group] of moduleMap) {
		const parts: string[] = []

		if (group.default_) {
			parts.push(group.default_)
		}

		if (group.named.length > 0) {
			const namedParts = group.named.map(n => {
				if (n.as) {
					return `${n.name} as ${n.as}`
				}
				return n.name
			})
			parts.push(`{ ${namedParts.join(', ')} }`)
		}

		if (parts.length > 0) {
			statements.push(`${importKeyword} ${parts.join(', ')} from '${mod}'`)
		}
	}

	return statements.join('\n')
}

/**
 * 将 import 语句注入到源代码中
 *
 * @param code 原始源代码字符串
 * @param importStatements 要注入的 import 语句字符串
 * @param position 注入位置
 * @returns 注入后的代码字符串
 */
export function injectImports(code: string, importStatements: string, position: 'top' | 'after-last-import'): string {
	if (!importStatements.trim()) return code

	if (position === 'top') {
		return injectAtTop(code, importStatements)
	}

	const lastImportEnd = findLastImportEnd(code)
	if (lastImportEnd === -1) {
		return injectAtTop(code, importStatements)
	}

	return code.slice(0, lastImportEnd) + '\n' + importStatements + '\n' + code.slice(lastImportEnd)
}

/**
 * 在代码顶部注入 import 语句，自动跳过 shebang 和 "use strict"
 */
function injectAtTop(code: string, importStatements: string): string {
	let insertOffset = 0

	if (code.startsWith('#!')) {
		const shebangEnd = code.indexOf('\n')
		if (shebangEnd !== -1) {
			insertOffset = shebangEnd + 1
		} else {
			insertOffset = code.length
		}
	}

	const rest = code.slice(insertOffset)
	const useStrictMatch = rest.match(/^\s*["']use strict["'];?\s*\n?/)
	if (useStrictMatch) {
		insertOffset += useStrictMatch[0].length
	}

	return code.slice(0, insertOffset) + importStatements + '\n' + code.slice(insertOffset)
}

/**
 * 查找代码中最后一个 import 语句的结束位置
 */
export function findLastImportEnd(code: string): number {
	let lastEnd = -1
	const importRegex = /^import\s+(?:type\s+)?[\s\S]+?from\s+['"][^'"]+['"];?\s*$/gm
	let match: RegExpExecArray | null

	while ((match = importRegex.exec(code)) !== null) {
		const end = match.index + match[0].length
		if (end > lastEnd) lastEnd = end
	}

	return lastEnd
}

/**
 * 处理 Vue SFC 文件中的模板自动导入
 *
 * @param code Vue SFC 代码字符串
 * @param nameLookup 名称→模块映射表
 * @param ignore 需要忽略的标识符集合
 * @returns 需要自动导入的 ImportInline 列表
 */
export function detectVueTemplateImports(code: string, nameLookup: Map<string, ImportInline>, ignore: Set<string>): ImportInline[] {
	const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/)
	if (!templateMatch) return []

	const templateContent = templateMatch[1]
	const expressionParts: string[] = []

	// 提取 {{ ... }} 插值
	const interpolationRegex = /\{\{([\s\S]*?)\}\}/g
	let match: RegExpExecArray | null
	while ((match = interpolationRegex.exec(templateContent)) !== null) {
		expressionParts.push(match[1])
	}

	// 提取 v-xxx="..." 和 :attr="..." 和 @event="..."
	const directiveRegex = /(?:v-[\w-]+|:[\w-]+|@[\w-]+)(?:\.[\w-]+)*="([^"]*)"/g
	while ((match = directiveRegex.exec(templateContent)) !== null) {
		expressionParts.push(match[1])
	}

	// 提取 v-model="..."
	const vModelRegex = /v-model="([^"]*)"/g
	while ((match = vModelRegex.exec(templateContent)) !== null) {
		expressionParts.push(match[1])
	}

	if (expressionParts.length === 0) return []

	const expressionCode = expressionParts.join('\n')
	const usedImports: ImportInline[] = []
	const seen = new Set<string>()
	const identifierPattern = /(?<![.\w$])([a-zA-Z_$][\w$]*)(?=\s*[<(.,:;\n\r)\]}]|$)/g

	while ((match = identifierPattern.exec(expressionCode)) !== null) {
		const name = match[1]

		if (seen.has(name) || ignore.has(name)) continue
		if (JS_KEYWORDS.has(name)) continue
		if (isHtmlTag(name)) continue
		if (isVueDirective(name)) continue

		const resolved = nameLookup.get(name)
		if (resolved) {
			seen.add(name)
			usedImports.push(resolved)
		}
	}

	return usedImports
}

/**
 * 检测 Vue 模板中使用的指令，匹配指令自动导入
 *
 * @param code Vue SFC 代码字符串
 * @param nameLookup 名称→模块映射表
 * @param ignore 忽略集合
 * @param config 指令配置
 * @returns 需要自动导入的 ImportInline 列表
 *
 * @description 扫描模板中 `v-xxx` 形式的指令使用，
 * 匹配 nameLookup 中 meta.vueDirective 为 true 的导入项。
 */
export function detectVueDirectiveImports(code: string, nameLookup: Map<string, ImportInline>, ignore: Set<string>, config?: boolean | VueDirectivesConfig): ImportInline[] {
	if (!config) return []

	const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/)
	if (!templateMatch) return []

	const templateContent = templateMatch[1]
	const isDirective = typeof config === 'object' ? config.isDirective : undefined

	// 提取所有 v-xxx 指令名
	const directiveRegex = /v-(\w+)/g
	const directiveNames = new Set<string>()
	let match: RegExpExecArray | null
	while ((match = directiveRegex.exec(templateContent)) !== null) {
		directiveNames.add(match[1])
	}

	if (directiveNames.size === 0) return []

	// 从 nameLookup 中查找匹配的指令
	const usedImports: ImportInline[] = []
	const seen = new Set<string>()

	for (const [name, imp] of nameLookup) {
		if (seen.has(name) || ignore.has(name)) continue

		// 检查是否为指令：meta.vueDirective 或 isDirective 函数
		const isDirectiveImport = imp.meta?.vueDirective === true || (isDirective && isDirective(imp.from, imp))

		if (isDirectiveImport) {
			// 检查指令名是否在模板中使用
			// 如 v-focus → 查找 "Focus" 或 "vFocus" 或 "v-focus"
			const directiveName = imp.as || imp.name
			const kebabName = camelToKebab(directiveName)
			if (directiveNames.has(kebabName) || directiveNames.has(directiveName)) {
				seen.add(name)
				usedImports.push(imp)
			}
		}
	}

	return usedImports
}

/**
 * 驼峰转 kebab-case
 *
 * @param str 驼峰命名字符串
 * @returns kebab-case 字符串
 */
function camelToKebab(str: string): string {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * 常见 HTML 标签名集合
 */
const HTML_TAGS = new Set([
	'div',
	'span',
	'p',
	'a',
	'img',
	'ul',
	'ol',
	'li',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'table',
	'tr',
	'td',
	'th',
	'thead',
	'tbody',
	'form',
	'input',
	'button',
	'select',
	'option',
	'textarea',
	'label',
	'section',
	'article',
	'header',
	'footer',
	'nav',
	'main',
	'aside',
	'script',
	'style',
	'link',
	'meta',
	'title',
	'head',
	'body',
	'html',
	'br',
	'hr',
	'pre',
	'code',
	'em',
	'strong',
	'b',
	'i',
	'u',
	'sub',
	'sup',
	'small',
	'mark',
	'del',
	'ins',
	'blockquote',
	'q',
	'cite',
	'abbr',
	'dfn',
	'kbd',
	'samp',
	'var',
	'time',
	'figure',
	'figcaption',
	'details',
	'summary',
	'dialog',
	'menu',
	'template',
	'slot',
	'component',
	'transition',
	'transition-group',
	'keep-alive',
	'teleport',
	'suspense',
	'video',
	'audio',
	'source',
	'canvas',
	'svg',
	'path',
	'circle',
	'rect',
	'line',
	'polygon',
	'iframe',
	'embed',
	'object',
	'picture',
	'area',
	'map',
	'base',
	'col',
	'colgroup',
	'datalist',
	'fieldset',
	'legend',
	'meter',
	'optgroup',
	'output',
	'progress',
	'ruby',
	'rt',
	'rp',
	'wbr',
	// uni-app 内置组件
	'view',
	'text',
	'image',
	'scroll-view',
	'swiper',
	'swiper-item',
	'icon',
	'progress',
	'rich-text',
	'navigator',
	'web-view',
	'picker',
	'picker-view',
	'checkbox',
	'checkbox-group',
	'radio',
	'radio-group',
	'switch',
	'slider',
	'stepper',
	'editor',
	'ad',
	'cover-view',
	'cover-image',
	'map',
	'camera',
	'live-player',
	'live-pusher',
	'movable-view',
	'movable-area',
	'uni-icons',
	'uni-badge',
	'uni-card',
	'uni-list',
	'uni-list-item',
	'uni-nav-bar'
])

/**
 * 判断名称是否为 HTML 标签名
 */
function isHtmlTag(name: string): boolean {
	return HTML_TAGS.has(name.toLowerCase())
}

/**
 * 将 import 语句注入到 Vue SFC 的 `<script setup>` 块内部
 *
 * @param code Vue SFC 源代码字符串
 * @param importStatements 要注入的 import 语句字符串
 * @returns 注入后的 SFC 代码字符串
 */
export function injectIntoScriptSetup(code: string, importStatements: string): string {
	if (!importStatements.trim()) return code

	const scriptSetupMatch = code.match(/<script\s+setup[^>]*>/)
	if (!scriptSetupMatch) return code

	const insertPos = scriptSetupMatch.index! + scriptSetupMatch[0].length
	return code.slice(0, insertPos) + '\n' + importStatements + '\n' + code.slice(insertPos)
}

/**
 * 判断代码是否为原始 Vue SFC 文件
 *
 * @param code 源代码字符串
 * @returns 如果是原始 SFC 文件返回 true
 */
export function isRawSfc(code: string): boolean {
	return /<script[\s>]/.test(code)
}

/**
 * 判断名称是否为 Vue 指令前缀
 */
function isVueDirective(name: string): boolean {
	return name.startsWith('v') && name.length > 1 && name[1] === name[1].toUpperCase()
}

/**
 * 检测代码中是否包含禁用自动导入的注释
 *
 * @param code 源代码字符串
 * @param commentsDisable 禁用注释标记列表
 * @returns 如果包含禁用注释返回 true
 *
 * @example
 * ```typescript
 * // 检测 // @unimport-disable
 * hasDisableComment('// @unimport-disable\nconst x = 1', ['@unimport-disable'])
 * // true
 * ```
 */
export function hasDisableComment(code: string, commentsDisable: string[]): boolean {
	for (const marker of commentsDisable) {
		// 匹配 // marker 或 /* marker */
		const singleLineRegex = new RegExp(`//\\s*${escapeRegex(marker)}`)
		if (singleLineRegex.test(code)) return true

		const multiLineRegex = new RegExp(`/\\*\\s*${escapeRegex(marker)}\\s*\\*/`)
		if (multiLineRegex.test(code)) return true
	}

	return false
}
