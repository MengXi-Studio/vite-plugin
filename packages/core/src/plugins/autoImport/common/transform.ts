import type { ResolvedImport } from '../types'
import { JS_KEYWORDS, stripCommentsAndStrings } from '@/common/code'
import { escapeRegex } from '@/common/string'

/**
 * 分析代码中使用的标识符，匹配自动导入映射
 *
 * @param code 源代码字符串
 * @param nameLookup 名称→模块映射表，用于查找标识符对应的导入信息
 * @param ignore 需要忽略的标识符集合
 * @returns 需要自动导入的 {@link ResolvedImport} 列表
 *
 * @description 通过正则表达式扫描代码中出现的标识符，
 * 与映射表匹配后确定需要自动导入的模块。
 *
 * **处理流程：**
 * 1. 先移除注释和字符串字面量，避免误判
 * 2. 使用正则匹配标识符使用场景
 * 3. 过滤掉 JS 关键字、已处理和忽略的标识符
 * 4. 与 nameLookup 匹配，收集需要自动导入的项
 *
 * **性能优化：**
 * - 使用 Set 进行 O(1) 查找，避免重复匹配
 * - 预处理代码仅一次，减少正则匹配范围
 *
 * @example
 * ```typescript
 * const lookup = new Map([
 *   ['ref', { module: 'vue', name: 'ref', isDefault: false }],
 *   ['reactive', { module: 'vue', name: 'reactive', isDefault: false }]
 * ])
 * detectUsedImports('const count = ref(0)', lookup, new Set())
 * // [{ module: 'vue', name: 'ref', isDefault: false }]
 * ```
 */
export function detectUsedImports(code: string, nameLookup: Map<string, ResolvedImport>, ignore: Set<string>): ResolvedImport[] {
	const usedImports: ResolvedImport[] = []
	const seen = new Set<string>()

	// 预处理：移除注释和字符串，避免误判
	const strippedCode = stripCommentsAndStrings(code)

	// 匹配标识符使用场景：
	// 1. 独立使用：ref( / ref< / ref. / ref,
	// 2. 解构使用：{ ref }
	// 3. 不匹配：obj.ref / .ref / import { ref }
	// 前瞻确保标识符后面跟着分隔符或行尾
	const identifierPattern = /(?<![.\w$])([a-zA-Z_$][\w$]*)(?=\s*[<(.,:;\n\r)\]}]|$)/g

	let match: RegExpExecArray | null
	while ((match = identifierPattern.exec(strippedCode)) !== null) {
		const name = match[1]

		// 跳过 JS 关键字
		if (JS_KEYWORDS.has(name)) continue

		// 跳过已处理和忽略的标识符
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
 * @returns 如果标识符已被显式导入返回 `true`，否则返回 `false`
 *
 * @description 检查代码中是否已有以下形式的导入语句，避免重复导入：
 * - `import { name } from '...'` — 命名导入
 * - `import name from '...'` — 默认导入
 * - `import * as name from '...'` — 命名空间导入
 *
 * @example
 * ```typescript
 * isAlreadyImported("import { ref } from 'vue'", 'ref')    // true
 * isAlreadyImported("import React from 'react'", 'React')  // true
 * isAlreadyImported("import * as _ from 'lodash'", '_')    // true
 * isAlreadyImported("const x = 1", 'ref')                  // false
 * ```
 */
export function isAlreadyImported(code: string, name: string): boolean {
	// 匹配 import { name } from '...'
	const namedImportRegex = new RegExp(`import\\s*\\{[^}]*\\b${escapeRegex(name)}\\b[^}]*\\}\\s*from`, 'm')
	if (namedImportRegex.test(code)) return true

	// 匹配 import name from '...' (默认导入)
	const defaultImportRegex = new RegExp(`import\\s+${escapeRegex(name)}\\s+from`, 'm')
	if (defaultImportRegex.test(code)) return true

	// 匹配 import * as name from '...'
	const namespaceImportRegex = new RegExp(`import\\s*\\*\\s*as\\s+${escapeRegex(name)}\\s+from`, 'm')
	if (namespaceImportRegex.test(code)) return true

	return false
}

/**
 * 生成 import 语句字符串
 *
 * @param imports 需要导入的 {@link ResolvedImport} 映射列表
 * @returns 生成的 import 语句字符串（多行，每行一条 import 语句）
 *
 * @description 将 {@link ResolvedImport} 列表按模块分组，
 * 生成合并后的 import 语句。同一模块的命名导入会合并为一条语句，
 * 默认导入与命名导入也会合并为同一条语句。
 *
 * **合并规则：**
 * - 同一模块的多个命名导入合并为 `import { a, b, c } from 'mod'`
 * - 默认导入 + 命名导入合并为 `import Default, { named } from 'mod'`
 * - 不同模块的导入分别生成独立语句
 *
 * @example
 * ```typescript
 * generateImportStatements([
 *   { module: 'vue', name: 'ref', isDefault: false },
 *   { module: 'vue', name: 'reactive', isDefault: false }
 * ])
 * // "import { ref, reactive } from 'vue'"
 *
 * generateImportStatements([
 *   { module: 'react', name: 'React', isDefault: true },
 *   { module: 'react', name: 'useState', isDefault: false }
 * ])
 * // "import React, { useState } from 'react'"
 * ```
 */
export function generateImportStatements(imports: ResolvedImport[]): string {
	// 按模块分组
	const moduleMap = new Map<string, { named: string[]; default_: string | null }>()

	for (const imp of imports) {
		if (!moduleMap.has(imp.module)) {
			moduleMap.set(imp.module, { named: [], default_: null })
		}

		const group = moduleMap.get(imp.module)!
		if (imp.isDefault) {
			// 如果已有默认导入，保留第一个（后续的忽略，因为一个模块只能有一个默认导入）
			if (group.default_ === null) {
				group.default_ = imp.name
			}
		} else {
			if (!group.named.includes(imp.name)) {
				group.named.push(imp.name)
			}
		}
	}

	const statements: string[] = []

	for (const [mod, group] of moduleMap) {
		const parts: string[] = []

		if (group.default_) {
			parts.push(group.default_)
		}

		if (group.named.length > 0) {
			parts.push(`{ ${group.named.join(', ')} }`)
		}

		if (parts.length > 0) {
			statements.push(`import ${parts.join(', ')} from '${mod}'`)
		}
	}

	return statements.join('\n')
}

/**
 * 将 import 语句注入到源代码中
 *
 * @param code 原始源代码字符串
 * @param importStatements 要注入的 import 语句字符串
 * @param position 注入位置：`'top'` 或 `'after-last-import'`
 * @returns 注入 import 语句后的代码字符串
 *
 * @description 根据 `position` 配置决定注入位置：
 * - `'top'`: 插入到文件有效代码最顶部（跳过 shebang 和 `"use strict"`）
 * - `'after-last-import'`: 找到最后一个 import 语句的位置，在其后插入
 *
 * **边界处理：**
 * - 空 import 语句不修改代码
 * - `after-last-import` 模式下若无已有 import，回退到顶部注入
 * - `top` 模式下自动跳过 `#!/usr/bin/env node` 和 `"use strict"`
 *
 * @example
 * ```typescript
 * injectImports('const x = 1', "import { ref } from 'vue'", 'top')
 * // "import { ref } from 'vue'\nconst x = 1"
 *
 * injectImports("import { a } from 'x'\nconst y = 1", "import { b } from 'y'", 'after-last-import')
 * // "import { a } from 'x'\nimport { b } from 'y'\nconst y = 1"
 * ```
 */
export function injectImports(code: string, importStatements: string, position: 'top' | 'after-last-import'): string {
	if (!importStatements.trim()) return code

	if (position === 'top') {
		return injectAtTop(code, importStatements)
	}

	// after-last-import: 找到最后一个 import 语句的结束位置
	const lastImportEnd = findLastImportEnd(code)

	if (lastImportEnd === -1) {
		// 没有 import 语句，插入到顶部
		return injectAtTop(code, importStatements)
	}

	return code.slice(0, lastImportEnd) + '\n' + importStatements + '\n' + code.slice(lastImportEnd)
}

/**
 * 在代码顶部注入 import 语句，自动跳过 shebang 和 "use strict"
 *
 * @param code 原始代码
 * @param importStatements 要注入的 import 语句
 * @returns 注入后的代码
 *
 * @description 识别并跳过以下文件头部元素：
 * - Shebang 行（`#!/usr/bin/env node`）
 * - `"use strict"` 或 `'use strict'` 声明
 *
 * import 语句会插入在这些头部元素之后
 */
function injectAtTop(code: string, importStatements: string): string {
	let insertOffset = 0

	// 跳过 shebang
	if (code.startsWith('#!')) {
		const shebangEnd = code.indexOf('\n')
		if (shebangEnd !== -1) {
			insertOffset = shebangEnd + 1
		} else {
			insertOffset = code.length
		}
	}

	// 跳过 "use strict" 或 'use strict'
	const rest = code.slice(insertOffset)
	const useStrictMatch = rest.match(/^\s*["']use strict["'];?\s*\n?/)
	if (useStrictMatch) {
		insertOffset += useStrictMatch[0].length
	}

	return code.slice(0, insertOffset) + importStatements + '\n' + code.slice(insertOffset)
}

/**
 * 查找代码中最后一个 import 语句的结束位置
 *
 * @param code 源代码字符串
 * @returns 最后一个 import 语句结束的位置索引；如果没有 import 语句返回 `-1`
 *
 * @description 支持以下 import 语句格式：
 * - 单行：`import { ref } from 'vue'`
 * - 多行：`import {\n  ref,\n  reactive\n} from 'vue'`
 * - 默认导入：`import React from 'react'`
 * - 命名空间导入：`import * as _ from 'lodash'`
 * - 混合导入：`import React, { useState } from 'react'`
 *
 * @example
 * ```typescript
 * findLastImportEnd("import { ref } from 'vue'\nconst x = 1")
 * // 27 (指向 'vue'\n 后的位置)
 *
 * findLastImportEnd('const x = 1')
 * // -1
 * ```
 */
export function findLastImportEnd(code: string): number {
	let lastEnd = -1

	// 统一匹配所有 import 语句，包括多行格式
	// import ... from '...' — 支持多行（[\s\S] 跨行匹配）
	const importRegex = /^import\s+[\s\S]+?from\s+['"][^'"]+['"];?\s*$/gm
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
 * @returns 需要自动导入的 {@link ResolvedImport} 列表
 *
 * @description 扫描 Vue 模板部分（`<template>` 标签内）使用的标识符，
 * 确保模板中引用的 API 也会被自动导入。
 *
 * **检测范围：**
 * - 插值表达式：`{{ ref }}` / `{{ computed() }}`
 * - 绑定表达式：`:prop="computed"` / `v-model="ref"`
 * - 事件处理器：`@click="handler"`
 *
 * **过滤策略：**
 * - 过滤 HTML 标签名（div, span 等）
 * - 过滤 Vue 内置组件和指令
 * - 过滤 HTML 属性名和 Vue 指令属性名
 * - 仅匹配在表达式上下文中出现的标识符
 *
 * @example
 * ```typescript
 * const lookup = new Map([
 *   ['ref', { module: 'vue', name: 'ref', isDefault: false }]
 * ])
 * detectVueTemplateImports(
 *   '<template><div>{{ count }}</div></template>',
 *   lookup, new Set()
 * )
 * ```
 */
export function detectVueTemplateImports(code: string, nameLookup: Map<string, ResolvedImport>, ignore: Set<string>): ResolvedImport[] {
	// 提取 <template> 内容
	const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/)
	if (!templateMatch) return []

	const templateContent = templateMatch[1]

	// 提取模板中的表达式上下文：
	// 1. 插值表达式 {{ ... }}
	// 2. v-bind / :attr="..."
	// 3. v-on / @event="..."
	// 4. v-model="..."
	// 5. v-if / v-show="..."
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

	// 提取 v-model (无值形式): v-model="..."
	const vModelRegex = /v-model="([^"]*)"/g
	while ((match = vModelRegex.exec(templateContent)) !== null) {
		expressionParts.push(match[1])
	}

	if (expressionParts.length === 0) return []

	const expressionCode = expressionParts.join('\n')

	// 在表达式上下文中检测标识符
	const usedImports: ResolvedImport[] = []
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
 * 常见 HTML 标签名集合（小写）
 *
 * @description 用于在 Vue 模板检测中过滤 HTML 标签名，
 * 避免将 `<div>`、`<span>` 等标签名误判为需要自动导入的标识符。
 * 同时包含 Vue 内置组件名。
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
	'wbr'
])

/**
 * 判断名称是否为 HTML 标签名
 *
 * @param name 要检查的名称
 * @returns 如果是 HTML 标签名返回 `true`，否则返回 `false`
 *
 * @description 使用小写比较，因为 HTML 标签名不区分大小写
 */
function isHtmlTag(name: string): boolean {
	return HTML_TAGS.has(name.toLowerCase())
}

/**
 * 将 import 语句注入到 Vue SFC 的 `<script setup>` 块内部
 *
 * @param code Vue SFC 源代码字符串
 * @param importStatements 要注入的 import 语句字符串
 * @returns 注入 import 语句后的 SFC 代码字符串
 *
 * @description 在 `<script setup>` 标签的起始位置之后插入 import 语句。
 * 适用于 `order: 'pre'` 模式下处理原始 SFC 文件，
 * 确保 import 语句位于 `<script setup>` 块内部，
 * 以便 SFC 编译器正确编译。
 *
 * **匹配规则：**
 * - 支持 `<script setup>` 和 `<script setup lang="ts">` 等变体
 * - import 语句插入在标签闭合 `>` 之后、已有代码之前
 * - 若无 `<script setup>` 块则不注入（返回原代码）
 *
 * @example
 * ```typescript
 * injectIntoScriptSetup(
 *   '<script setup lang="ts">\nconst x = ref(0)\n</script>',
 *   "import { ref } from 'vue'"
 * )
 * // '<script setup lang="ts">\nimport { ref } from \'vue\'\nconst x = ref(0)\n</script>'
 * ```
 */
export function injectIntoScriptSetup(code: string, importStatements: string): string {
	if (!importStatements.trim()) return code

	// 匹配 <script setup> 标签（支持 lang 等属性）
	const scriptSetupMatch = code.match(/<script\s+setup[^>]*>/)
	if (!scriptSetupMatch) return code

	const insertPos = scriptSetupMatch.index! + scriptSetupMatch[0].length
	return code.slice(0, insertPos) + '\n' + importStatements + '\n' + code.slice(insertPos)
}

/**
 * 判断代码是否为原始 Vue SFC 文件（而非编译后的 JS）
 *
 * @param code 源代码字符串
 * @returns 如果是原始 SFC 文件返回 `true`，否则返回 `false`
 *
 * @description 通过检测 `<script` 标签判断是否为原始 SFC 文件。
 * 编译后的 JS 代码不会包含 `<script` 标签。
 */
export function isRawSfc(code: string): boolean {
	return /<script[\s>]/.test(code)
}

/**
 * 判断名称是否为 Vue 指令前缀
 *
 * @param name 要检查的名称
 * @returns 如果符合 Vue 指令命名模式返回 `true`，否则返回 `false`
 *
 * @description Vue 指令通常以 `v` 开头后跟大写字母，
 * 如 `vIf`、`vFor`、`vShow` 等
 */
function isVueDirective(name: string): boolean {
	return name.startsWith('v') && name.length > 1 && name[1] === name[1].toUpperCase()
}
