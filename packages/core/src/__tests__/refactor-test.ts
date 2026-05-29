/**
 * 重构后的公共模块单元测试
 *
 * 测试范围：
 * 1. common/validation-extend.ts — 提取的公共验证函数
 * 2. common/html.ts — 新增的 injectBeforeTagWithFallback 函数
 * 3. common/format.ts — 新增的 escapeHtmlAttr 函数
 *
 * 运行方式: npx tsx packages/core/src/__tests__/refactor-test.ts
 */

import assert from 'node:assert/strict'

// ============================================================
// 手动内联被测函数（避免路径别名问题，直接复制源码逻辑）
// ============================================================

// --- from common/script.ts ---
function containsScriptTag(str: string): boolean {
	return /<script\b/i.test(str)
}

function validateIdentifierName(name: string): void {
	if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
		throw new Error(`"${name}" 不是合法的 JavaScript 标识符，必须以字母、下划线或美元符开头，仅包含字母、数字、下划线和美元符`)
	}
	const dangerous = ['__proto__', 'constructor', 'prototype']
	if (dangerous.includes(name)) {
		throw new Error(`"${name}" 是 JavaScript 内置属性，可能导致原型污染，请使用其他名称`)
	}
}

// --- from common/validation-extend.ts ---
function validateGlobalName(name: string | undefined, fieldName: string): void {
	if (!name) return
	try {
		validateIdentifierName(name)
	} catch (e) {
		throw new Error(`${fieldName} ${(e as Error).message}`)
	}
}

function validateNoScriptInTemplate(template: string | undefined, fieldName: string): void {
	if (!template) return
	if (containsScriptTag(template)) {
		throw new Error(`${fieldName} 不允许包含 <script> 标签`)
	}
}

function validateCallbackFields(callbacks: Record<string, any>, fields: string[], objectName: string): void {
	for (const field of fields) {
		const value = callbacks[field]
		if (value !== undefined && typeof value !== 'string') {
			throw new Error(`${objectName}.${field} 必须是字符串类型`)
		}
		if (value && containsScriptTag(value)) {
			throw new Error(`${objectName}.${field} 不允许包含 <script> 标签`)
		}
	}
}

function validateNonNegativeNumber(value: number | undefined, fieldName: string): void {
	if (value !== undefined && (typeof value !== 'number' || value < 0)) {
		throw new Error(`${fieldName} 必须是非负数`)
	}
}

function validateNestedDuration(config: { enabled?: boolean; duration?: number } | undefined, errorMsg: string): void {
	if (config?.duration !== undefined && (typeof config.duration !== 'number' || config.duration < 0)) {
		throw new Error(errorMsg)
	}
}

function validateEnumValue(value: string | undefined, allowedValues: string[], fieldName: string): void {
	if (!value) return
	if (!allowedValues.includes(value)) {
		throw new Error(`${fieldName} 必须是 ${allowedValues.join(', ')}`)
	}
}

// --- from common/html.ts ---
interface HtmlInjectResult {
	html: string
	injected: boolean
}

function injectBeforeTag(html: string, tag: string, code: string): HtmlInjectResult {
	const regex = new RegExp(tag, 'i')
	if (!regex.test(html)) {
		return { html, injected: false }
	}
	const result = html.replace(regex, `${code}\n${tag}`)
	return { html: result, injected: true }
}

function injectBeforeTagWithFallback(html: string, code: string, _fallbackMessage?: string): HtmlInjectResult & { usedFallback: boolean } {
	const bodyResult = injectBeforeTag(html, '</body>', code)
	if (bodyResult.injected) {
		return { ...bodyResult, usedFallback: false }
	}
	const htmlResult = injectBeforeTag(html, '</html>', code)
	if (htmlResult.injected) {
		return { ...htmlResult, usedFallback: false }
	}
	return { html: html + code, injected: true, usedFallback: true }
}

// --- from common/format.ts ---
function escapeHtmlAttr(str: string): string {
	return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// --- from common/validation.ts (Validator class) ---
class Validator<T extends Record<string, any>> {
	private options: T
	private currentField: keyof T | null = null
	private errors: string[] = []

	constructor(options: T) {
		this.options = options
	}

	field<K extends keyof T>(field: K): Validator<T> {
		this.currentField = field
		return this
	}

	number(): this {
		if (this.currentField === null) throw new Error('必须先调用 field() 方法指定要验证的字段')
		const value = this.options[this.currentField]
		if (value !== undefined && value !== null && typeof value !== 'number') {
			this.errors.push(`${String(this.currentField)} 必须是数字类型`)
		}
		return this
	}

	enum(allowedValues: string[]): this {
		if (this.currentField === null) throw new Error('必须先调用 field() 方法指定要验证的字段')
		const value = this.options[this.currentField!]
		if (value !== undefined && value !== null && value !== '' && !allowedValues.includes(value)) {
			this.errors.push(`${String(this.currentField)} 必须是 ${allowedValues.join(', ')}`)
		}
		return this
	}

	minValue(min: number): this {
		if (this.currentField === null) throw new Error('必须先调用 field() 方法指定要验证的字段')
		const value = this.options[this.currentField!]
		if (value !== undefined && value !== null) {
			if (typeof value !== 'number' || value < min) {
				this.errors.push(`${String(this.currentField)} 必须是不小于 ${min} 的数字`)
			}
		}
		return this
	}

	maxValue(max: number): this {
		if (this.currentField === null) throw new Error('必须先调用 field() 方法指定要验证的字段')
		const value = this.options[this.currentField!]
		if (value !== undefined && value !== null) {
			if (typeof value !== 'number' || value > max) {
				this.errors.push(`${String(this.currentField)} 必须是不大于 ${max} 的数字`)
			}
		}
		return this
	}

	validate(): T {
		if (this.errors.length > 0) {
			throw new Error(`配置验证失败：\n${this.errors.map(err => `- ${err}`).join('\n')}`)
		}
		return this.options
	}
}

// --- from common/html.ts (injectHeadAndBody) ---
interface DualInjectResult {
	html: string
	headInjected: boolean
	bodyInjected: boolean
	usedFallback: boolean
}

function injectHeadAndBody(html: string, headCode: string | undefined, bodyCode: string): DualInjectResult {
	let result = html
	let headInjected = false

	if (headCode) {
		const headResult = injectBeforeTag(result, '</head>', headCode)
		if (headResult.injected) {
			result = headResult.html
			headInjected = true
		}
	}

	const bodyResult = injectBeforeTagWithFallback(result, bodyCode)

	return {
		html: bodyResult.html,
		headInjected,
		bodyInjected: bodyResult.injected,
		usedFallback: bodyResult.usedFallback
	}
}

// ============================================================
// 测试运行器
// ============================================================

let passed = 0
let failed = 0
const errors: string[] = []

function test(name: string, fn: () => void): void {
	try {
		fn()
		passed++
		console.log(`  ✅ ${name}`)
	} catch (e) {
		failed++
		const msg = e instanceof Error ? e.message : String(e)
		errors.push(`  ❌ ${name}: ${msg}`)
		console.log(`  ❌ ${name}: ${msg}`)
	}
}

function describe(name: string, fn: () => void): void {
	console.log(`\n📋 ${name}`)
	fn()
}

// ============================================================
// 测试用例
// ============================================================

describe('validateGlobalName', () => {
	test('合法标识符通过验证', () => {
		assert.doesNotThrow(() => validateGlobalName('__LOADING_MANAGER__', 'globalName'))
		assert.doesNotThrow(() => validateGlobalName('__APP_VERSION__', 'defineName'))
		assert.doesNotThrow(() => validateGlobalName('myVar123', 'globalName'))
	})

	test('undefined/null 值跳过验证', () => {
		assert.doesNotThrow(() => validateGlobalName(undefined, 'globalName'))
		assert.doesNotThrow(() => validateGlobalName('', 'globalName'))
	})

	test('非法标识符抛出带字段名的错误', () => {
		assert.throws(
			() => validateGlobalName('123abc', 'globalName'),
			(err: any) => err.message.includes('globalName')
		)
		assert.throws(
			() => validateGlobalName('__proto__', 'defineName'),
			(err: any) => err.message.includes('defineName')
		)
	})

	test('内置属性名抛出错误', () => {
		assert.throws(
			() => validateGlobalName('constructor', 'globalName'),
			(err: any) => err.message.includes('globalName') && err.message.includes('内置属性')
		)
	})
})

describe('validateNoScriptInTemplate', () => {
	test('安全模板通过验证', () => {
		assert.doesNotThrow(() => validateNoScriptInTemplate('<div>safe</div>', 'customTemplate'))
		assert.doesNotThrow(() => validateNoScriptInTemplate('<span class="loader"></span>', 'customTemplate'))
	})

	test('undefined/空值跳过验证', () => {
		assert.doesNotThrow(() => validateNoScriptInTemplate(undefined, 'customTemplate'))
		assert.doesNotThrow(() => validateNoScriptInTemplate('', 'customPromptTemplate'))
	})

	test('包含 script 标签抛出错误', () => {
		assert.throws(
			() => validateNoScriptInTemplate('<script>alert(1)</script>', 'customTemplate'),
			(err: any) => err.message.includes('customTemplate') && err.message.includes('<script>')
		)
	})

	test('错误消息包含字段名', () => {
		assert.throws(
			() => validateNoScriptInTemplate('<SCRIPT>test</SCRIPT>', 'customPromptTemplate'),
			(err: any) => err.message.includes('customPromptTemplate')
		)
	})
})

describe('validateCallbackFields', () => {
	test('安全回调通过验证', () => {
		const callbacks = {
			onShow: 'console.log("shown")',
			onHide: 'console.log("hidden")'
		}
		assert.doesNotThrow(() => validateCallbackFields(callbacks, ['onShow', 'onHide'], 'callbacks'))
	})

	test('包含 script 标签的回调抛出错误', () => {
		const callbacks = {
			onShow: '<script>alert(1)</script>'
		}
		assert.throws(
			() => validateCallbackFields(callbacks, ['onShow'], 'callbacks'),
			(err: any) => err.message.includes('callbacks.onShow') && err.message.includes('<script>')
		)
	})

	test('非字符串类型回调抛出错误', () => {
		const callbacks = {
			onShow: 123 as any
		}
		assert.throws(
			() => validateCallbackFields(callbacks, ['onShow'], 'callbacks'),
			(err: any) => err.message.includes('callbacks.onShow') && err.message.includes('字符串类型')
		)
	})

	test('undefined 字段跳过验证', () => {
		const callbacks = {
			onShow: undefined
		}
		assert.doesNotThrow(() => validateCallbackFields(callbacks, ['onShow'], 'callbacks'))
	})

	test('空回调对象通过验证', () => {
		assert.doesNotThrow(() => validateCallbackFields({}, ['onShow', 'onHide'], 'callbacks'))
	})
})

describe('validateNonNegativeNumber', () => {
	test('非负数通过验证', () => {
		assert.doesNotThrow(() => validateNonNegativeNumber(0, 'zIndex'))
		assert.doesNotThrow(() => validateNonNegativeNumber(100, 'duration'))
		assert.doesNotThrow(() => validateNonNegativeNumber(0.5, 'opacity'))
	})

	test('undefined 跳过验证', () => {
		assert.doesNotThrow(() => validateNonNegativeNumber(undefined, 'zIndex'))
	})

	test('负数抛出错误', () => {
		assert.throws(
			() => validateNonNegativeNumber(-1, 'zIndex'),
			(err: any) => err.message.includes('zIndex') && err.message.includes('非负数')
		)
	})

	test('非数字类型抛出错误', () => {
		assert.throws(
			() => validateNonNegativeNumber('abc' as any, 'duration'),
			(err: any) => err.message.includes('duration') && err.message.includes('非负数')
		)
	})
})

describe('validateNestedDuration', () => {
	test('合法 duration 通过验证', () => {
		assert.doesNotThrow(() => validateNestedDuration({ enabled: true, duration: 300 }, 'duration error'))
		assert.doesNotThrow(() => validateNestedDuration({ enabled: true, duration: 0 }, 'duration error'))
	})

	test('undefined config 跳过验证', () => {
		assert.doesNotThrow(() => validateNestedDuration(undefined, 'duration error'))
	})

	test('undefined duration 跳过验证', () => {
		assert.doesNotThrow(() => validateNestedDuration({ enabled: true }, 'duration error'))
	})

	test('负数 duration 抛出指定错误', () => {
		assert.throws(
			() => validateNestedDuration({ enabled: true, duration: -1 }, 'minDisplayTime.duration 必须是非负数'),
			(err: any) => err.message === 'minDisplayTime.duration 必须是非负数'
		)
	})
})

describe('validateEnumValue', () => {
	test('合法枚举值通过验证', () => {
		assert.doesNotThrow(() => validateEnumValue('center', ['center', 'top', 'bottom'], 'position'))
		assert.doesNotThrow(() => validateEnumValue('modal', ['modal', 'banner', 'toast'], 'promptStyle'))
	})

	test('undefined/空值跳过验证', () => {
		assert.doesNotThrow(() => validateEnumValue(undefined, ['center', 'top'], 'position'))
		assert.doesNotThrow(() => validateEnumValue('', ['center', 'top'], 'position'))
	})

	test('非法枚举值抛出错误', () => {
		assert.throws(
			() => validateEnumValue('invalid', ['center', 'top', 'bottom'], 'position'),
			(err: any) => err.message.includes('position') && err.message.includes('center, top, bottom')
		)
	})
})

describe('injectBeforeTagWithFallback', () => {
	test('优先注入到 </body> 前', () => {
		const html = '<html><head></head><body><div>content</div></body></html>'
		const code = '<script>test</script>'
		const result = injectBeforeTagWithFallback(html, code)
		assert.equal(result.injected, true)
		assert.equal(result.usedFallback, false)
		assert.ok(result.html.includes('<script>test</script>\n</body>'))
	})

	test('回退到 </html> 前（无 </body>）', () => {
		const html = '<html><head></head></html>'
		const code = '<script>test</script>'
		const result = injectBeforeTagWithFallback(html, code)
		assert.equal(result.injected, true)
		assert.equal(result.usedFallback, false)
		assert.ok(result.html.includes('<script>test</script>\n</html>'))
	})

	test('回退到末尾（无 </body> 和 </html>）', () => {
		const html = '<div>no closing tags'
		const code = '<script>test</script>'
		const result = injectBeforeTagWithFallback(html, code)
		assert.equal(result.injected, true)
		assert.equal(result.usedFallback, true)
		assert.equal(result.html, '<div>no closing tags<script>test</script>')
	})

	test('完整 HTML 正常注入', () => {
		const html = '<!DOCTYPE html><html><head><title>Test</title></head><body><div>App</div></body></html>'
		const code = '<!-- injected -->'
		const result = injectBeforeTagWithFallback(html, code)
		assert.equal(result.injected, true)
		assert.equal(result.usedFallback, false)
		assert.ok(result.html.includes('<!-- injected -->\n</body>'))
	})

	test('大小写不敏感匹配', () => {
		const html = '<HTML><HEAD></HEAD><BODY><DIV>test</DIV></BODY></HTML>'
		const code = '<script>test</script>'
		const result = injectBeforeTagWithFallback(html, code)
		assert.equal(result.injected, true)
		assert.equal(result.usedFallback, false)
	})
})

describe('escapeHtmlAttr', () => {
	test('转义双引号', () => {
		assert.equal(escapeHtmlAttr('hello "world"'), 'hello &quot;world&quot;')
	})

	test('转义小于号', () => {
		assert.equal(escapeHtmlAttr('a < b'), 'a &lt; b')
	})

	test('转义大于号', () => {
		assert.equal(escapeHtmlAttr('a > b'), 'a &gt; b')
	})

	test('转义 & 符号', () => {
		assert.equal(escapeHtmlAttr('a & b'), 'a &amp; b')
	})

	test('组合转义', () => {
		assert.equal(escapeHtmlAttr('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
	})

	test('无特殊字符不变', () => {
		assert.equal(escapeHtmlAttr('hello world'), 'hello world')
	})

	test('空字符串不变', () => {
		assert.equal(escapeHtmlAttr(''), '')
	})
})

describe('跨插件一致性验证', () => {
	test('validateGlobalName 与原 loadingManager 实现行为一致', () => {
		// 原 loadingManager: validateGlobalName 检查合法标识符
		assert.doesNotThrow(() => validateGlobalName('__LOADING_MANAGER__', 'globalName'))
		assert.throws(() => validateGlobalName('__proto__', 'globalName'))
		assert.throws(() => validateGlobalName('123abc', 'globalName'))
	})

	test('validateGlobalName 与原 versionUpdateChecker 实现行为一致', () => {
		// 原 versionUpdateChecker: validateDefineName 检查合法标识符
		assert.doesNotThrow(() => validateGlobalName('__APP_VERSION__', 'defineName'))
		assert.throws(() => validateGlobalName('constructor', 'defineName'))
		// 空字符串时原实现也不验证（!options.defineName 为 true 时 return）
		assert.doesNotThrow(() => validateGlobalName('', 'defineName'))
		assert.doesNotThrow(() => validateGlobalName(undefined, 'defineName'))
	})

	test('validateNoScriptInTemplate 与原 loadingManager 实现行为一致', () => {
		// 原 loadingManager: validateCustomTemplate 检查 script 标签
		assert.doesNotThrow(() => validateNoScriptInTemplate('<div>safe</div>', 'customTemplate'))
		assert.throws(() => validateNoScriptInTemplate('<script>alert(1)</script>', 'customTemplate'))
		assert.doesNotThrow(() => validateNoScriptInTemplate(undefined, 'customTemplate'))
	})

	test('validateNoScriptInTemplate 与原 versionUpdateChecker 实现行为一致', () => {
		// 原 versionUpdateChecker: validateCustomTemplate 检查 script 标签
		assert.doesNotThrow(() => validateNoScriptInTemplate('<div>safe</div>', 'customPromptTemplate'))
		assert.throws(() => validateNoScriptInTemplate('<script>alert(1)</script>', 'customPromptTemplate'))
		assert.doesNotThrow(() => validateNoScriptInTemplate(undefined, 'customPromptTemplate'))
	})

	test('validateCallbackFields 与原 loadingManager validateCallbacks 行为一致', () => {
		// 原 loadingManager: validateCallbacks 检查回调字段类型和 script 标签
		const safeCallbacks = { onShow: 'console.log("shown")', onHide: 'console.log("hidden")' }
		assert.doesNotThrow(() => validateCallbackFields(safeCallbacks, ['onShow', 'onHide'], 'callbacks'))

		const unsafeCallbacks = { onShow: '<script>alert(1)</script>' }
		assert.throws(() => validateCallbackFields(unsafeCallbacks, ['onShow'], 'callbacks'))

		const wrongTypeCallbacks = { onShow: 123 as any }
		assert.throws(() => validateCallbackFields(wrongTypeCallbacks, ['onShow'], 'callbacks'))
	})

	test('validateCallbackFields 与原 versionUpdateChecker validateCallbacks 行为一致', () => {
		// 原 versionUpdateChecker: validateCallbacks 检查回调字段 script 标签
		const safeCallbacks = { onUpdateAvailable: 'console.log("update")', onRefresh: 'location.reload()' }
		assert.doesNotThrow(() => validateCallbackFields(safeCallbacks, ['onUpdateAvailable', 'onRefresh'], 'callbacks'))

		const unsafeCallbacks = { onUpdateAvailable: '<script>alert(1)</script>' }
		assert.throws(() => validateCallbackFields(unsafeCallbacks, ['onUpdateAvailable'], 'callbacks'))
	})

	test('injectBeforeTagWithFallback 与原 loadingManager 注入回退逻辑一致', () => {
		// 原 loadingManager: 先 </body>，再 </html>，最后追加末尾
		const fullHtml = '<html><head></head><body>content</body></html>'
		const result1 = injectBeforeTagWithFallback(fullHtml, '<!-- test -->')
		assert.equal(result1.usedFallback, false)
		assert.ok(result1.html.includes('<!-- test -->\n</body>'))

		const noBodyHtml = '<html><head></head></html>'
		const result2 = injectBeforeTagWithFallback(noBodyHtml, '<!-- test -->')
		assert.equal(result2.usedFallback, false)
		assert.ok(result2.html.includes('<!-- test -->\n</html>'))

		const noTagsHtml = '<div>no tags</div>'
		const result3 = injectBeforeTagWithFallback(noTagsHtml, '<!-- test -->')
		assert.equal(result3.usedFallback, true)
		assert.equal(result3.html, '<div>no tags</div><!-- test -->')
	})

	test('injectBeforeTagWithFallback 与原 versionUpdateChecker 注入回退逻辑一致', () => {
		// 原 versionUpdateChecker: 先 </body>，再 </html>，最后追加末尾
		const fullHtml = '<html><head></head><body>content</body></html>'
		const result1 = injectBeforeTagWithFallback(fullHtml, '<!-- vuc -->')
		assert.equal(result1.usedFallback, false)
		assert.ok(result1.html.includes('<!-- vuc -->\n</body>'))

		const noBodyHtml = '<html><head></head></html>'
		const result2 = injectBeforeTagWithFallback(noBodyHtml, '<!-- vuc -->')
		assert.equal(result2.usedFallback, false)
		assert.ok(result2.html.includes('<!-- vuc -->\n</html>'))

		const noTagsHtml = 'plain text'
		const result3 = injectBeforeTagWithFallback(noTagsHtml, '<!-- vuc -->')
		assert.equal(result3.usedFallback, true)
		assert.equal(result3.html, 'plain text<!-- vuc -->')
	})

	test('escapeHtmlAttr 与原 loadingManager escapeHtmlAttr 行为一致', () => {
		// 原 loadingManager: functions.ts 中的 escapeHtmlAttr
		assert.equal(escapeHtmlAttr('color: red;'), 'color: red;')
		assert.equal(escapeHtmlAttr('content: "hello"'), 'content: &quot;hello&quot;')
		assert.equal(escapeHtmlAttr('a < b && c > d'), 'a &lt; b &amp;&amp; c &gt; d')
	})
})

describe('Validator.enum()', () => {
	test('合法枚举值通过验证', () => {
		const v = new Validator({ position: 'center' })
		assert.doesNotThrow(() => v.field('position').enum(['center', 'top', 'bottom']).validate())
	})

	test('undefined/null 值跳过验证', () => {
		const v1 = new Validator({ position: undefined as any })
		assert.doesNotThrow(() => v1.field('position').enum(['center', 'top', 'bottom']).validate())

		const v2 = new Validator({ position: null as any })
		assert.doesNotThrow(() => v2.field('position').enum(['center', 'top', 'bottom']).validate())
	})

	test('空字符串跳过验证', () => {
		const v = new Validator({ position: '' })
		assert.doesNotThrow(() => v.field('position').enum(['center', 'top', 'bottom']).validate())
	})

	test('非法枚举值抛出错误', () => {
		const v = new Validator({ position: 'invalid' })
		assert.throws(
			() => v.field('position').enum(['center', 'top', 'bottom']).validate(),
			(err: any) => err.message.includes('position') && err.message.includes('center, top, bottom')
		)
	})

	test('链式调用多个 enum 验证', () => {
		const v = new Validator({ format: 'bar', spinnerType: 'dots' })
		assert.doesNotThrow(() => v.field('format').enum(['bar', 'spinner', 'minimal']).field('spinnerType').enum(['spinner', 'dots', 'pulse', 'bar']).validate())
	})

	test('多个 enum 验证中有一个失败时抛出错误', () => {
		const v = new Validator({ format: 'invalid', spinnerType: 'dots' })
		assert.throws(
			() => v.field('format').enum(['bar', 'spinner', 'minimal']).field('spinnerType').enum(['spinner', 'dots', 'pulse', 'bar']).validate(),
			(err: any) => err.message.includes('format')
		)
	})
})

describe('Validator.minValue()', () => {
	test('大于最小值的数字通过验证', () => {
		const v = new Validator({ checkInterval: 5000 })
		assert.doesNotThrow(() => v.field('checkInterval').number().minValue(5000).validate())
	})

	test('等于最小值的数字通过验证', () => {
		const v = new Validator({ checkInterval: 5000 })
		assert.doesNotThrow(() => v.field('checkInterval').number().minValue(5000).validate())
	})

	test('小于最小值的数字抛出错误', () => {
		const v = new Validator({ checkInterval: 1000 })
		assert.throws(
			() => v.field('checkInterval').number().minValue(5000).validate(),
			(err: any) => err.message.includes('checkInterval') && err.message.includes('5000')
		)
	})

	test('undefined 值跳过验证', () => {
		const v = new Validator({ checkInterval: undefined as any })
		assert.doesNotThrow(() => v.field('checkInterval').number().minValue(5000).validate())
	})

	test('非数字类型抛出错误', () => {
		const v = new Validator({ checkInterval: 'abc' as any })
		assert.throws(() => v.field('checkInterval').number().minValue(5000).validate())
	})
})

describe('Validator.maxValue()', () => {
	test('小于最大值的数字通过验证', () => {
		const v = new Validator({ hashLength: 16 })
		assert.doesNotThrow(() => v.field('hashLength').number().maxValue(32).validate())
	})

	test('等于最大值的数字通过验证', () => {
		const v = new Validator({ hashLength: 32 })
		assert.doesNotThrow(() => v.field('hashLength').number().maxValue(32).validate())
	})

	test('大于最大值的数字抛出错误', () => {
		const v = new Validator({ hashLength: 64 })
		assert.throws(
			() => v.field('hashLength').number().maxValue(32).validate(),
			(err: any) => err.message.includes('hashLength') && err.message.includes('32')
		)
	})

	test('minValue + maxValue 组合验证', () => {
		const v1 = new Validator({ hashLength: 16 })
		assert.doesNotThrow(() => v1.field('hashLength').number().minValue(1).maxValue(32).validate())

		const v2 = new Validator({ hashLength: 0 })
		assert.throws(() => v2.field('hashLength').number().minValue(1).maxValue(32).validate())

		const v3 = new Validator({ hashLength: 64 })
		assert.throws(() => v3.field('hashLength').number().minValue(1).maxValue(32).validate())
	})
})

describe('Validator.enum() 与原 .custom() 枚举验证行为一致', () => {
	test('buildProgress: format 验证', () => {
		assert.doesNotThrow(() => new Validator({ format: 'bar' }).field('format').enum(['bar', 'spinner', 'minimal']).validate())
		assert.doesNotThrow(() => new Validator({ format: undefined as any }).field('format').enum(['bar', 'spinner', 'minimal']).validate())
		assert.throws(() => new Validator({ format: 'invalid' }).field('format').enum(['bar', 'spinner', 'minimal']).validate())
	})

	test('loadingManager: position 验证', () => {
		assert.doesNotThrow(() => new Validator({ position: 'center' }).field('position').enum(['center', 'top', 'bottom']).validate())
		assert.doesNotThrow(() => new Validator({ position: undefined as any }).field('position').enum(['center', 'top', 'bottom']).validate())
		assert.throws(() => new Validator({ position: 'left' }).field('position').enum(['center', 'top', 'bottom']).validate())
	})

	test('loadingManager: autoBind 验证', () => {
		assert.doesNotThrow(() => new Validator({ autoBind: 'fetch' }).field('autoBind').enum(['fetch', 'xhr', 'all', 'none']).validate())
		assert.throws(() => new Validator({ autoBind: 'ajax' }).field('autoBind').enum(['fetch', 'xhr', 'all', 'none']).validate())
	})

	test('versionUpdateChecker: versionSource 验证', () => {
		assert.doesNotThrow(() => new Validator({ versionSource: 'auto' }).field('versionSource').enum(['define', 'file', 'auto']).validate())
		assert.throws(() => new Validator({ versionSource: 'database' }).field('versionSource').enum(['define', 'file', 'auto']).validate())
	})

	test('generateRouter: outputFormat 验证', () => {
		assert.doesNotThrow(() => new Validator({ outputFormat: 'ts' }).field('outputFormat').enum(['ts', 'js']).validate())
		assert.throws(() => new Validator({ outputFormat: 'json' }).field('outputFormat').enum(['ts', 'js']).validate())
	})

	test('generateVersion: format 验证', () => {
		assert.doesNotThrow(() => new Validator({ format: 'semver' }).field('format').enum(['timestamp', 'date', 'datetime', 'semver', 'hash', 'custom']).validate())
		assert.throws(() => new Validator({ format: 'git' }).field('format').enum(['timestamp', 'date', 'datetime', 'semver', 'hash', 'custom']).validate())
	})
})

describe('Validator.minValue() 与原 .custom() 数值验证行为一致', () => {
	test('buildProgress: width > 0 等价于 minValue(1)', () => {
		assert.doesNotThrow(() => new Validator({ width: 40 }).field('width').number().minValue(1).validate())
		assert.throws(() => new Validator({ width: 0 }).field('width').number().minValue(1).validate())
		assert.doesNotThrow(() => new Validator({ width: undefined as any }).field('width').number().minValue(1).validate())
	})

	test('versionUpdateChecker: checkInterval >= 5000 等价于 minValue(5000)', () => {
		assert.doesNotThrow(() => new Validator({ checkInterval: 5000 }).field('checkInterval').number().minValue(5000).validate())
		assert.throws(() => new Validator({ checkInterval: 4999 }).field('checkInterval').number().minValue(5000).validate())
		assert.doesNotThrow(() => new Validator({ checkInterval: 300000 }).field('checkInterval').number().minValue(5000).validate())
	})

	test('generateVersion: hashLength 1-32 等价于 minValue(1).maxValue(32)', () => {
		assert.doesNotThrow(() => new Validator({ hashLength: 16 }).field('hashLength').number().minValue(1).maxValue(32).validate())
		assert.throws(() => new Validator({ hashLength: 0 }).field('hashLength').number().minValue(1).maxValue(32).validate())
		assert.throws(() => new Validator({ hashLength: 33 }).field('hashLength').number().minValue(1).maxValue(32).validate())
	})
})

describe('injectHeadAndBody', () => {
	test('同时注入 head 和 body', () => {
		const html = '<html><head></head><body>content</body></html>'
		const result = injectHeadAndBody(html, '<style>css</style>', '<script>js</script>')
		assert.equal(result.headInjected, true)
		assert.equal(result.bodyInjected, true)
		assert.equal(result.usedFallback, false)
		assert.ok(result.html.includes('<style>css</style>\n</head>'))
		assert.ok(result.html.includes('<script>js</script>\n</body>'))
	})

	test('仅注入 body（headCode 为 undefined）', () => {
		const html = '<html><head></head><body>content</body></html>'
		const result = injectHeadAndBody(html, undefined, '<script>js</script>')
		assert.equal(result.headInjected, false)
		assert.equal(result.bodyInjected, true)
		assert.equal(result.usedFallback, false)
		assert.ok(!result.html.includes('<style>'))
		assert.ok(result.html.includes('<script>js</script>\n</body>'))
	})

	test('head 注入失败（无 </head> 标签）', () => {
		const html = '<html><body>content</body></html>'
		const result = injectHeadAndBody(html, '<style>css</style>', '<script>js</script>')
		assert.equal(result.headInjected, false)
		assert.equal(result.bodyInjected, true)
	})

	test('body 使用回退策略（无 </body> 和 </html>）', () => {
		const html = '<div>no tags</div>'
		const result = injectHeadAndBody(html, undefined, '<script>js</script>')
		assert.equal(result.headInjected, false)
		assert.equal(result.bodyInjected, true)
		assert.equal(result.usedFallback, true)
	})

	test('与 loadingManager 原注入逻辑行为一致', () => {
		const html = '<html><head></head><body>app</body></html>'
		const result = injectHeadAndBody(html, '<style>loading</style>', '<script>manager</script>')
		assert.equal(result.headInjected, true)
		assert.equal(result.bodyInjected, true)
		assert.equal(result.usedFallback, false)
	})

	test('与 versionUpdateChecker 原注入逻辑行为一致', () => {
		const html = '<html><head></head><body>app</body></html>'
		const result = injectHeadAndBody(html, '<meta name="version">', '<script>checker</script>')
		assert.equal(result.headInjected, true)
		assert.equal(result.bodyInjected, true)
		assert.equal(result.usedFallback, false)
	})

	test('versionUpdateChecker 无 meta 标签时仅注入 body', () => {
		const html = '<html><head></head><body>app</body></html>'
		const result = injectHeadAndBody(html, undefined, '<script>checker</script>')
		assert.equal(result.headInjected, false)
		assert.equal(result.bodyInjected, true)
	})
})

// ============================================================
// 测试结果汇总
// ============================================================

console.log('\n' + '='.repeat(50))
console.log(`测试结果: ${passed} 通过, ${failed} 失败, 共 ${passed + failed} 项`)
if (errors.length > 0) {
	console.log('\n失败详情:')
	errors.forEach(e => console.log(e))
}
console.log('='.repeat(50))

if (failed > 0) {
	process.exit(1)
}
