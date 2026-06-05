/**
 * 将回调函数体字符串包装为安全的函数表达式
 *
 * @param body - 函数体代码字符串
 * @param context - 回调上下文标识，用于错误日志
 * @param params - 函数参数列表字符串，默认为空
 * @returns 安全的函数表达式字符串（包含 try-catch 保护）
 */
export function makeCallback(body?: string, context: string = 'callback', params: string = ''): string {
	if (!body) return `function(${params}) {}`
	return `function(${params}) { try { ${body} } catch(e) { console.error('[${context}] error:', e); } }`
}
