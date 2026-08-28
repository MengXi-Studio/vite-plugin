import type { RouteConfigBlock } from '../types'

/**
 * `defineUniPage` 宏的默认名称
 *
 * @description 在 Vue SFC 的 `<script setup>` 中调用该宏声明页面配置，
 * 功能与 `<route-config>` 自定义块一致，但优先级更高：
 * 当页面同时声明宏与自定义块时，以宏为准。
 */
export const DEFINE_UNI_PAGE = 'defineUniPage'

/** 解析失败哨兵值（区别于合法的 null / undefined 结果） */
const PARSE_ERROR = Symbol('parse-error')

/**
 * 从源码文本中定位与起始 `(` 匹配的 `)` 索引
 *
 * @param text 源码文本
 * @param openIndex 起始 `(` 的索引（指向字符 `(`）
 * @returns 匹配的 `)` 索引；未闭合返回 -1
 *
 * @description 扫描时跳过字符串（单/双引号）与注释（行注释 `//` 与块注释），
 * 确保括号只在真实语法层级上计数，避免对象内的字符串（如标题文本）干扰。
 */
function findMatchingParen(text: string, openIndex: number): number {
	let depth = 0
	let i = openIndex
	const len = text.length

	while (i < len) {
		const ch = text[i]
		if (ch === '"' || ch === "'") {
			i = skipQuotedString(text, i)
			continue
		}
		if (ch === '/' && text[i + 1] === '/') {
			const nl = text.indexOf('\n', i)
			i = nl === -1 ? len : nl + 1
			continue
		}
		if (ch === '/' && text[i + 1] === '*') {
			const end = text.indexOf('*/', i + 2)
			i = end === -1 ? len : end + 2
			continue
		}
		if (ch === '(') {
			depth++
		} else if (ch === ')') {
			depth--
			if (depth === 0) return i
		}
		i++
	}
	return -1
}

/**
 * 跳过以指定引号包裹的字符串（处理转义字符）
 *
 * @param text 源码文本
 * @param start 开引号索引
 * @returns 闭合引号之后的索引（未闭合时返回文本末尾）
 */
function skipQuotedString(text: string, start: number): number {
	const quote = text[start]
	let i = start + 1
	while (i < text.length) {
		if (text[i] === '\\') {
			i += 2
			continue
		}
		if (text[i] === quote) return i + 1
		i++
	}
	return i
}

/**
 * 定位下一个不在字符串 / 注释中的宏名候选位置
 *
 * @param code 源码文本
 * @param macroName 宏名称
 * @param from 起始搜索位置
 * @returns 宏名起始索引；未找到返回 -1
 *
 * @description 逐字符扫描，遇到引号（单/双）或注释（行/块）时整体跳过，
 * 避免误匹配字符串或注释中出现的同名文本。
 */
function findMacroCandidate(code: string, macroName: string, from: number): number {
	let i = from
	const len = code.length
	while (i < len) {
		const ch = code[i]
		if (ch === '"' || ch === "'") {
			i = skipQuotedString(code, i)
			continue
		}
		if (ch === '/' && code[i + 1] === '/') {
			const nl = code.indexOf('\n', i)
			i = nl === -1 ? len : nl + 1
			continue
		}
		if (ch === '/' && code[i + 1] === '*') {
			const end = code.indexOf('*/', i + 2)
			i = end === -1 ? len : end + 2
			continue
		}
		if (code.startsWith(macroName, i)) return i
		i++
	}
	return -1
}

/**
 * 轻量 JS 对象字面量解析器（递归下降）
 *
 * @description 用于解析 `defineUniPage({ ... })` 宏的参数。对象字面量是 JS 语法
 * 而非严格 JSON，故需支持：键不加引号、单引号字符串、尾随逗号、注释、
 * 数字 / 布尔 / null / undefined / 数组 / 嵌套对象。解析失败返回 null，
 * 由调用方静默忽略，不影响其他页面生成。
 */
class LiteralParser {
	/** 当前扫描位置 */
	private pos = 0

	/**
	 * @param text 待解析的源码文本
	 */
	constructor(private readonly text: string) {}

	/**
	 * 解析完整对象字面量
	 *
	 * @returns 解析结果；文本不是对象或含多余尾部内容返回 null
	 */
	parse(): Record<string, any> | null {
		this.skipTrivia()
		if (this.peek() !== '{') return null
		const obj = this.parseObject()
		if (obj === PARSE_ERROR) return null
		this.skipTrivia()
		return this.pos === this.text.length ? (obj as Record<string, any>) : null
	}

	/** 读取当前位置字符（可偏移） */
	private peek(offset = 0): string {
		return this.text[this.pos + offset]
	}

	/** 跳过空白与注释 */
	private skipTrivia(): void {
		while (this.pos < this.text.length) {
			const ch = this.peek()
			if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
				this.pos++
			} else if (ch === '/' && this.peek(1) === '/') {
				this.pos += 2
				while (this.pos < this.text.length && this.peek() !== '\n') this.pos++
			} else if (ch === '/' && this.peek(1) === '*') {
				const end = this.text.indexOf('*/', this.pos + 2)
				this.pos = end === -1 ? this.text.length : end + 2
			} else {
				break
			}
		}
	}

	/** 解析对象字面量（调用前 pos 指向 `{`） */
	private parseObject(): Record<string, any> | typeof PARSE_ERROR {
		this.pos++ // 跳过 '{'
		const obj: Record<string, any> = {}
		for (;;) {
			this.skipTrivia()
			if (this.peek() === '}') {
				this.pos++
				return obj
			}
			// 解析键：字符串（带引号）或标识符
			let key: string | null = null
			if (this.peek() === '"' || this.peek() === "'") {
				key = this.parseString()
			} else {
				const match = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(this.text.slice(this.pos))
				if (match) {
					key = match[0]
					this.pos += match[0].length
				}
			}
			if (key === null) return PARSE_ERROR
			this.skipTrivia()
			if (this.peek() !== ':') return PARSE_ERROR
			this.pos++ // 跳过 ':'
			const value = this.parseValue()
			if (value === PARSE_ERROR) return PARSE_ERROR
			obj[key] = value
			this.skipTrivia()
			if (this.peek() === ',') {
				this.pos++ // 跳过 ','（允许尾随逗号）
				continue
			}
			if (this.peek() === '}') {
				this.pos++
				return obj
			}
			return PARSE_ERROR
		}
	}

	/** 解析数组字面量（调用前 pos 指向 `[`） */
	private parseArray(): any[] | typeof PARSE_ERROR {
		this.pos++ // 跳过 '['
		const arr: any[] = []
		for (;;) {
			this.skipTrivia()
			if (this.peek() === ']') {
				this.pos++
				return arr
			}
			const value = this.parseValue()
			if (value === PARSE_ERROR) return PARSE_ERROR
			arr.push(value)
			this.skipTrivia()
			if (this.peek() === ',') {
				this.pos++ // 允许尾随逗号
				continue
			}
			if (this.peek() === ']') {
				this.pos++
				return arr
			}
			return PARSE_ERROR
		}
	}

	/** 解析一个值（对象 / 数组 / 字符串 / 数字 / 关键字） */
	private parseValue(): any {
		this.skipTrivia()
		const ch = this.peek()
		if (ch === '{') return this.parseObject()
		if (ch === '[') return this.parseArray()
		if (ch === '"' || ch === "'") return this.parseString()
		if (ch === '-' || (ch >= '0' && ch <= '9')) return this.parseNumber()
		return this.parseKeyword()
	}

	/** 解析字符串字面量（单/双引号，处理常见转义） */
	private parseString(): string {
		const quote = this.peek()
		this.pos++ // 跳过开引号
		let result = ''
		while (this.pos < this.text.length) {
			const ch = this.peek()
			if (ch === quote) {
				this.pos++
				return result
			}
			if (ch === '\\') {
				this.pos++
				const esc = this.peek()
				switch (esc) {
					case 'n':
						result += '\n'
						break
					case 't':
						result += '\t'
						break
					case 'r':
						result += '\r'
						break
					case 'b':
						result += '\b'
						break
					case 'f':
						result += '\f'
						break
					case 'v':
						result += '\v'
						break
					case '0':
						result += '\0'
						break
					case 'u': {
						const hex = this.text.slice(this.pos + 1, this.pos + 5)
						if (/^[0-9a-fA-F]{4}$/.test(hex)) {
							result += String.fromCharCode(parseInt(hex, 16))
							this.pos += 4
						} else {
							result += esc
						}
						break
					}
					default:
						// 含 \\ \" \' / 等：原样输出转义后的字符
						result += esc
				}
				this.pos++
				continue
			}
			result += ch
			this.pos++
		}
		// 未闭合字符串：容忍返回已收集部分
		return result
	}

	/** 解析数字字面量（整数 / 小数 / 科学计数法 / 负数） */
	private parseNumber(): number | typeof PARSE_ERROR {
		const match = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(this.text.slice(this.pos))
		if (!match) return PARSE_ERROR
		this.pos += match[0].length
		return Number(match[0])
	}

	/** 解析关键字：true / false / null / undefined */
	private parseKeyword(): any {
		const match = /^(true|false|null|undefined)\b/.exec(this.text.slice(this.pos))
		if (!match) return PARSE_ERROR
		this.pos += match[0].length
		switch (match[0]) {
			case 'true':
				return true
			case 'false':
				return false
			case 'null':
				return null
			default:
				return undefined
		}
	}
}

/**
 * 解析 JS 对象字面量文本为普通对象
 *
 * @param text 对象字面量源码（如 `{ title: '首页', isTab: true }`）
 * @returns 解析后的对象；解析失败返回 null
 *
 * @description 兼容单/双引号、键不加引号、尾随逗号与注释，
 * 不支持表达式（如变量、函数调用），遇到非字面量内容返回 null。
 */
export function parseJsObjectLiteral(text: string): Record<string, any> | null {
	return new LiteralParser(text).parse()
}

/**
 * 从 Vue SFC 源码中提取 `defineUniPage` 宏配置
 *
 * @param source Vue SFC 源码
 * @param macroName 宏名称，默认 {@link DEFINE_UNI_PAGE}
 * @returns 解析后的页面配置对象；未找到宏或参数非法返回 null
 *
 * @description 定位 `<script setup>` 中的 `defineUniPage({ ... })` 调用，
 * 通过平衡括号提取参数并解析为对象字面量。仅消费首个有效宏调用，
 * 参数不是纯对象字面量（如传入变量）时静默忽略。
 */
export function extractDefineUniPage(source: string, macroName = DEFINE_UNI_PAGE): RouteConfigBlock | null {
	let index = 0
	const len = source.length

	while (index < len) {
		const start = findMacroCandidate(source, macroName, index)
		if (start === -1) return null
		// 确认宏名前一个字符不是标识符字符（避免匹配 xxxdefineUniPage）
		const prev = start > 0 ? source[start - 1] : ''
		if (/[A-Za-z0-9_$]/.test(prev)) {
			index = start + macroName.length
			continue
		}
		const open = source.indexOf('(', start + macroName.length)
		if (open === -1) return null
		// 宏名与 '(' 之间只允许空白
		const between = source.slice(start + macroName.length, open)
		if (/\S/.test(between)) {
			index = open + 1
			continue
		}
		const end = findMatchingParen(source, open)
		if (end === -1) return null
		const raw = source.slice(open + 1, end)
		const parsed = parseJsObjectLiteral(raw)
		return parsed as RouteConfigBlock | null
	}
	return null
}

/**
 * 移除源码中的 `defineUniPage` 宏调用
 *
 * @param code 模块源码
 * @param macroName 宏名称，默认 {@link DEFINE_UNI_PAGE}
 * @returns 移除宏调用后的源码；无宏时原样返回
 *
 * @description 宏在扫描阶段已被消费，运行时不应保留调用（否则 `defineUniPage`
 * 未定义导致 ReferenceError）。将整段 `defineUniPage({ ... })` 替换为等量空格
 * 并保留原有换行，保持行号不变，避免源码映射错位。
 */
export function stripDefineUniPageCalls(code: string, macroName = DEFINE_UNI_PAGE): string {
	let result = code
	let index = 0

	for (;;) {
		const start = findMacroCandidate(result, macroName, index)
		if (start === -1) break
		const prev = start > 0 ? result[start - 1] : ''
		if (/[A-Za-z0-9_$]/.test(prev)) {
			index = start + macroName.length
			continue
		}
		const open = result.indexOf('(', start + macroName.length)
		if (open === -1) break
		const between = result.slice(start + macroName.length, open)
		if (/\S/.test(between)) {
			index = open + 1
			continue
		}
		const end = findMatchingParen(result, open)
		if (end === -1) break
		// 将宏调用整段替换为等量空格（保留原有换行），保持行号不变，避免源码映射错位
		const replacement = result.slice(start, end + 1).replace(/[^\n]/g, ' ')
		result = result.slice(0, start) + replacement + result.slice(end + 1)
		index = start + replacement.length
	}
	return result
}
