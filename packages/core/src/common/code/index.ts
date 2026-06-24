/**
 * JavaScript/TypeScript 保留关键字和全局内置对象集合
 *
 * @description 这些标识符不应被自动导入，因为它们是语言内置关键字或全局对象，
 * 即使在映射表中存在同名条目也应跳过。
 */
export const JS_KEYWORDS = new Set([
	'break',
	'case',
	'catch',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'finally',
	'for',
	'function',
	'if',
	'in',
	'instanceof',
	'new',
	'return',
	'switch',
	'this',
	'throw',
	'try',
	'typeof',
	'var',
	'void',
	'while',
	'with',
	'class',
	'const',
	'enum',
	'export',
	'extends',
	'import',
	'super',
	'implements',
	'interface',
	'let',
	'package',
	'private',
	'protected',
	'public',
	'static',
	'yield',
	'async',
	'await',
	'of',
	'true',
	'false',
	'null',
	'undefined',
	'NaN',
	'Infinity',
	'console',
	'window',
	'document',
	'global',
	'globalThis',
	'process',
	'require',
	'module',
	'exports',
	'__dirname',
	'__filename',
	'Object',
	'Array',
	'String',
	'Number',
	'Boolean',
	'Symbol',
	'BigInt',
	'Map',
	'Set',
	'WeakMap',
	'WeakSet',
	'Promise',
	'Proxy',
	'Reflect',
	'Error',
	'TypeError',
	'RangeError',
	'SyntaxError',
	'ReferenceError',
	'Date',
	'RegExp',
	'Math',
	'JSON',
	'Intl',
	'ArrayBuffer',
	'DataView',
	'Float32Array',
	'Float64Array',
	'Int8Array',
	'Int16Array',
	'Int32Array',
	'Uint8Array',
	'Uint16Array',
	'Uint32Array',
	'Uint8ClampedArray'
])

/**
 * 从源代码中移除注释和字符串字面量，避免误判标识符
 *
 * @param code - 源代码字符串
 * @returns 处理后的代码（注释和字符串内容被替换为空白字符，保留换行以维持行号对应）
 *
 * @description 支持移除以下内容：
 * - 单行注释 `//`
 * - 多行注释 `/* *\/`
 * - 单引号字符串 `'...'`
 * - 双引号字符串 `"..."`
 * - 模板字符串 `` `...` ``（保留 `${...}` 表达式内容）
 *
 * 注释和字符串内容被替换为等长的空白字符，保留换行符以维持行号对应关系。
 */
export function stripCommentsAndStrings(code: string): string {
	const result: string[] = []
	let i = 0
	const len = code.length

	while (i < len) {
		// 单行注释 //
		if (code[i] === '/' && code[i + 1] === '/') {
			while (i < len && code[i] !== '\n') {
				result.push(' ')
				i++
			}
			continue
		}

		// 多行注释 /* */
		if (code[i] === '/' && code[i + 1] === '*') {
			result.push(' ')
			result.push(' ')
			i += 2
			while (i < len && !(code[i - 1] === '*' && code[i] === '/')) {
				result.push(code[i] === '\n' ? '\n' : ' ')
				i++
			}
			if (i < len) {
				result.push(' ')
				i++
			}
			continue
		}

		// 单引号字符串
		if (code[i] === "'") {
			result.push(' ')
			i++
			while (i < len && code[i] !== "'") {
				if (code[i] === '\\' && i + 1 < len) {
					result.push(' ')
					result.push(' ')
					i += 2
					continue
				}
				result.push(code[i] === '\n' ? '\n' : ' ')
				i++
			}
			if (i < len) {
				result.push(' ')
				i++
			}
			continue
		}

		// 双引号字符串
		if (code[i] === '"') {
			result.push(' ')
			i++
			while (i < len && code[i] !== '"') {
				if (code[i] === '\\' && i + 1 < len) {
					result.push(' ')
					result.push(' ')
					i += 2
					continue
				}
				result.push(code[i] === '\n' ? '\n' : ' ')
				i++
			}
			if (i < len) {
				result.push(' ')
				i++
			}
			continue
		}

		// 模板字符串
		if (code[i] === '`') {
			result.push(' ')
			i++
			while (i < len && code[i] !== '`') {
				if (code[i] === '\\' && i + 1 < len) {
					result.push(' ')
					result.push(' ')
					i += 2
					continue
				}
				// 模板字符串中的 ${...} 表达式保留原样
				if (code[i] === '$' && code[i + 1] === '{') {
					result.push(' ')
					result.push(' ')
					i += 2
					let depth = 1
					while (i < len && depth > 0) {
						if (code[i] === '{') depth++
						if (code[i] === '}') depth--
						if (depth > 0) {
							result.push(code[i])
							i++
						}
					}
					if (i < len) {
						result.push(' ')
						i++
					}
					continue
				}
				result.push(code[i] === '\n' ? '\n' : ' ')
				i++
			}
			if (i < len) {
				result.push(' ')
				i++
			}
			continue
		}

		result.push(code[i])
		i++
	}

	return result.join('')
}
