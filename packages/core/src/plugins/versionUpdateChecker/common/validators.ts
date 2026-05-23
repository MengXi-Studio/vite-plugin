import type { VersionUpdateCheckerOptions } from '../types'
import { containsScriptTag, validateIdentifierName } from '@/common'

/**
 * 验证 customPromptTemplate 不包含 script 标签（XSS 防护）
 */
export function validateCustomTemplate(options: VersionUpdateCheckerOptions): void {
	if (!options.customPromptTemplate) return
	if (containsScriptTag(options.customPromptTemplate)) {
		throw new Error('customPromptTemplate 不允许包含 <script> 标签')
	}
}

/**
 * 验证回调字符串不包含 script 标签
 */
export function validateCallbacks(options: VersionUpdateCheckerOptions): void {
	const callbackFields = ['onUpdateAvailable', 'onRefresh', 'onDismiss'] as const
	for (const field of callbackFields) {
		if (options[field] && containsScriptTag(options[field]!)) {
			throw new Error(`callbacks.${field} 不允许包含 <script> 标签`)
		}
	}
}

/**
 * 验证 checkInterval 合法性
 */
export function validateCheckInterval(options: VersionUpdateCheckerOptions): void {
	if (options.checkInterval !== undefined) {
		if (typeof options.checkInterval !== 'number' || options.checkInterval < 5000) {
			throw new Error('checkInterval 必须是大于等于 5000 的数字（毫秒）')
		}
	}
}

/**
 * 验证 defineName 合法性
 */
export function validateDefineName(options: VersionUpdateCheckerOptions): void {
	if (!options.defineName) return
	try {
		validateIdentifierName(options.defineName)
	} catch (e) {
		throw new Error(`defineName ${(e as Error).message}`)
	}
}

/**
 * 执行所有验证（checkInterval 已在主类 validator 中校验，此处不重复）
 */
export function validateAll(options: VersionUpdateCheckerOptions): void {
	validateCustomTemplate(options)
	validateCallbacks(options)
	validateDefineName(options)
}
