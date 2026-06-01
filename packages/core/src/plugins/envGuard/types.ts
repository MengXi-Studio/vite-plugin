import type { BasePluginOptions } from '@/factory/types'
import type { EnvFieldRule, EnvValidationResult } from '@/common/validation'

export type EnvFailAction = 'error' | 'warn' | 'ignore'

export type RuntimeGuardMode = 'console' | 'throw' | 'overlay'

export interface EnvGuardResult {
	timestamp: string
	total: number
	passed: number
	missing: number
	invalid: number
	results: EnvValidationResult[]
	allPassed: boolean
}

export interface EnvGuardOptions extends BasePluginOptions {
	required?: Record<string, EnvFieldRule>
	failAction?: EnvFailAction
	generateTemplate?: boolean
	templateOutput?: string
	runtimeGuard?: boolean
	runtimeGlobalName?: string
	runtimeGuardMode?: RuntimeGuardMode
	envFiles?: string[]
	autoLoadEnv?: boolean
	reportOutput?: string | false
	validateBeforeBuild?: boolean
	showSummary?: boolean
}
