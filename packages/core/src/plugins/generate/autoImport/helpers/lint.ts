import path from 'node:path'
import type { ImportInline, EslintrcConfig, BiomelintrcConfig } from '../types'
import { writeFileSyncSafely } from '@/common/fs'

/**
 * 生成 ESLint globals 配置文件
 *
 * @param imports 所有解析后的 ImportInline 列表
 * @param config ESLint 配置
 * @param root 项目根目录
 *
 * @description 生成 `.eslintrc-auto-import.json` 文件，
 * 将所有自动导入的标识符注册为 ESLint 全局变量，
 * 解决 `no-undef` 规则报错问题。
 *
 * 输出示例：
 * ```json
 * {
 *   "globals": {
 *     "ref": "readonly",
 *     "reactive": "readonly",
 *     "useRouter": "readonly"
 *   }
 * }
 * ```
 */
export function generateEslintrc(imports: ImportInline[], config: EslintrcConfig, root: string): void {
	if (!config.enabled) return

	const filepath = config.filepath || './.eslintrc-auto-import.json'
	const absolutePath = path.isAbsolute(filepath) ? filepath : path.resolve(root, filepath)

	const globalsPropValue = config.globalsPropValue ?? true
	let globalsValue: string | boolean
	if (typeof globalsPropValue === 'string') {
		globalsValue = globalsPropValue
	} else if (globalsPropValue === true) {
		globalsValue = 'readonly'
	} else {
		globalsValue = false
	}

	const globals: Record<string, string | boolean> = {}
	for (const imp of imports) {
		// 跳过类型导入（类型在运行时不存在）
		if (imp.type) continue

		const name = imp.as || imp.name
		// 跳过 default 导出的别名（通常是模块名，如 'axios'）
		if (imp.name === 'default' && imp.as) {
			globals[imp.as] = globalsValue
		} else {
			globals[name] = globalsValue
		}
	}

	const content = JSON.stringify({ globals }, null, 2) + '\n'

	writeFileSyncSafely(absolutePath, content)
}

/**
 * 生成 Biome globals 配置文件
 *
 * @param imports 所有解析后的 ImportInline 列表
 * @param config Biome 配置
 * @param root 项目根目录
 *
 * @description 生成 `.biomelintrc-auto-import.json` 文件，
 * 将所有自动导入的标识符注册为 Biome 全局变量。
 *
 * 输出示例：
 * ```json
 * {
 *   "linter": {
 *     "rules": {
 *       "correctness": {
 *         "noUndeclaredVariables": "off"
 *       }
 *     }
 *   },
 *   "javascript": {
 *     "globals": ["ref", "reactive", "useRouter"]
 *   }
 * }
 * ```
 */
export function generateBiomelintrc(imports: ImportInline[], config: BiomelintrcConfig, root: string): void {
	if (!config.enabled) return

	const filepath = config.filepath || './.biomelintrc-auto-import.json'
	const absolutePath = path.isAbsolute(filepath) ? filepath : path.resolve(root, filepath)

	const globalNames: string[] = []
	for (const imp of imports) {
		if (imp.type) continue

		const name = imp.as || imp.name
		globalNames.push(name)
	}

	const content =
		JSON.stringify(
			{
				linter: {
					rules: {
						correctness: {
							noUndeclaredVariables: 'off'
						}
					}
				},
				javascript: {
					globals: globalNames
				}
			},
			null,
			2
		) + '\n'

	writeFileSyncSafely(absolutePath, content)
}
