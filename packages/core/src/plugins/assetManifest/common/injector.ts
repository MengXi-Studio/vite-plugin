import type { AssetMap } from '../types'
import { injectBeforeTag } from '@/common/html'

/**
 * 生成运行时注入的脚本代码
 *
 * @param {AssetMap} assetMap - 资源映射表
 * @param {string} globalName - 全局变量名称（必须是合法的 JavaScript 标识符）
 * @returns {string} 注入到 HTML 中的 `<script>` 标签代码
 *
 * @description 生成一段脚本代码，将资源映射表挂载到 `window` 上的指定全局变量。
 * 代码特点：
 * - 使用 `Object.defineProperty` 定义只读、不可配置的全局属性
 * - 使用 `Object.freeze` 冻结映射表，防止运行时篡改
 * - 设置 `writable: false` 和 `configurable: false` 确保属性不可被重写或删除
 * - 对 JSON 字符串中的 `</script>` 进行转义，防止 XSS 攻击
 *
 * @throws 不会直接抛出异常，但如果 `globalName` 不是合法的 JavaScript 标识符，
 * 生成的脚本在浏览器执行时会抛出 `SyntaxError`
 *
 * @example
 * ```typescript
 * const script = generateRuntimeScript(assetMap, '__ASSET_MANIFEST__')
 * // '<script>Object.defineProperty(window,"__ASSET_MANIFEST__",{value:Object.freeze({...}),writable:false,configurable:false})</script>'
 * ```
 */
export function generateRuntimeScript(assetMap: AssetMap, globalName: string): string {
	const json = JSON.stringify(assetMap).replace(/<\/script>/gi, '<\\/script>')
	return `<script>Object.defineProperty(window,"${globalName}",{value:Object.freeze(${json}),writable:false,configurable:false})</script>`
}

/**
 * 将运行时清单注入到 HTML 中
 *
 * @param {string} html - 原始 HTML 内容
 * @param {AssetMap} assetMap - 资源映射表
 * @param {string} globalName - 全局变量名称（必须是合法的 JavaScript 标识符）
 * @returns {{ html: string; injected: boolean }} 注入结果对象
 *   - `html`: 注入后的 HTML 内容（若注入失败则与输入相同）
 *   - `injected`: 是否成功注入
 *
 * @description 将资源映射表以全局变量的形式注入到 HTML 的 `</head>` 标签前。
 * 如果 HTML 中没有 `</head>` 标签（大小写不敏感），则不注入并返回 `injected: false`。
 *
 * @example
 * ```typescript
 * const result = injectRuntimeManifest(html, assetMap, '__ASSET_MANIFEST__')
 * if (result.injected) {
 *   console.log('运行时清单已注入')
 *   // result.html 为注入后的 HTML
 * } else {
 *   console.warn('注入失败：未找到 </head> 标签')
 * }
 * ```
 */
export function injectRuntimeManifest(html: string, assetMap: AssetMap, globalName: string): { html: string; injected: boolean } {
	const script = generateRuntimeScript(assetMap, globalName)
	return injectBeforeTag(html, '</head>', script)
}
