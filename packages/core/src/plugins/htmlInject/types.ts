import type { BasePluginOptions } from '@/factory/types'
import type { SelectorMatch, InjectPosition, InjectCondition, SecurityConfig } from '@/common/html'

export interface InjectRule {
	id?: string
	content: string
	position: InjectPosition
	selector?: string
	selectorMatch?: SelectorMatch
	priority?: number
	condition?: InjectCondition
	templateVars?: Record<string, string>
	allowScriptInjection?: boolean
}

export interface InjectionLogEntry {
	ruleId: string
	position: InjectPosition
	selector?: string
	injected: boolean
	reason?: string
	timestamp: number
}

export interface HtmlInjectOptions extends BasePluginOptions {
	targetFile?: string
	rules: InjectRule[]
	security?: SecurityConfig
	templateVars?: Record<string, string>
	logInjection?: boolean
}
