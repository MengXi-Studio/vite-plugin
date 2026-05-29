import type { VersionUpdateCheckerOptions } from '../types'
import { validateNoScriptInTemplate, validateCallbackFields, validateGlobalName } from '@/common/validation'

/**
 * 验证回调字符串不包含 script 标签
 */
export function validateCallbacks(options: VersionUpdateCheckerOptions): void {
	const callbackFields = ['onUpdateAvailable', 'onRefresh', 'onDismiss'] as const
	validateCallbackFields(options, callbackFields as unknown as string[], 'callbacks')
}

/**
 * 执行所有安全验证
 *
 * @remarks
 * - customPromptTemplate — 通过 {@link validateNoScriptInTemplate} 验证不包含 script 标签
 * - callbacks — 通过 {@link validateCallbacks} 验证回调字段类型和安全性
 * - defineName — 通过 {@link validateGlobalName} 验证标识符合法性
 */
export function validateAll(options: VersionUpdateCheckerOptions): void {
	validateNoScriptInTemplate(options.customPromptTemplate, 'customPromptTemplate')
	validateCallbacks(options)
	validateGlobalName(options.defineName, 'defineName')
}
