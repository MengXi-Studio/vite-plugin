/**
 * HTML 注入结果
 */
export interface HtmlInjectResult {
	/** 注入后的 HTML 内容 */
	html: string
	/** 是否成功注入 */
	injected: boolean
}

/**
 * 双区域 HTML 注入结果
 */
export interface DualInjectResult {
	/** 注入后的 HTML 内容 */
	html: string
	/** head 区域是否成功注入 */
	headInjected: boolean
	/** body 区域是否成功注入 */
	bodyInjected: boolean
	/** body 注入是否使用了回退策略（追加到末尾） */
	usedFallback: boolean
}
