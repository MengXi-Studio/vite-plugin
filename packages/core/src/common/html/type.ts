export interface HtmlInjectResult {
	html: string
	injected: boolean
}

export interface DualInjectResult {
	html: string
	headInjected: boolean
	bodyInjected: boolean
	usedFallback: boolean
}

export type InjectPosition = 'head-start' | 'head-end' | 'body-start' | 'body-end' | 'before-selector' | 'after-selector' | 'replace-selector'

export type SelectorMatch = 'string' | 'regex'

export type ConditionType = 'env' | 'file-contains' | 'custom'

export interface InjectCondition {
	type: ConditionType
	value: string | ((...args: any[]) => boolean)
	negate?: boolean
}

export interface PositionInjectResult {
	html: string
	injected: boolean
	reason?: string
}

export interface SecurityConfig {
	blockDangerousTags?: boolean
	blockDangerousAttributes?: boolean
	allowedTags?: string[]
	blockedTags?: string[]
	blockedAttributes?: string[]
}
