import path from 'node:path'
import { shouldUpdateFileContent, writeFileSyncSafely } from '@/common/fs'

/** defineUniPage 宏全局类型声明的默认输出路径 */
export const DEFAULT_DEFINE_UNI_PAGE_DTS = 'src/define-uni-page.d.ts'

/**
 * 生成 defineUniPage 宏的全局类型声明内容
 *
 * @returns 全局 dts 文件内容
 *
 * @description `defineUniPage` 宏无需 import，在 `<script setup>` 中调用时
 * 需要通过全局声明让 TypeScript / Vue (Official) 语言服务识别，从而获得
 * 语法高亮、类型提示与编译期检查，且不报「找不到名称」。
 * 使用 inline import 类型保持声明全局（不受模块化影响）。
 */
export function getDefineUniPageDtsContent(): string {
	return `/* eslint-disable */
// @ts-nocheck
/**
 * 由 @meng-xi/vite-plugin 的 generatePages / generateUni 自动生成。
 * 提供 \`defineUniPage\` 宏的全局类型声明，供 Vue (Official) / Volar / tsc
 * 识别，以获得语法高亮、类型提示与编译期检查。
 */
declare function defineUniPage(config: import('@meng-xi/vite-plugin/plugins/generate/generate-pages').RouteConfigBlock): void
`
}

/**
 * 确保 defineUniPage 宏的全局类型声明文件已生成
 *
 * @param projectRoot - 项目根目录（绝对路径），用于解析相对 dts 路径
 * @param dts - dts 配置：`false` 关闭生成；字符串为输出路径（相对项目根目录或绝对路径）；省略使用默认路径
 * @param logger - 可选日志接口，生成时输出提示
 *
 * @description 通过「内容一致不写入」天然防重复，多次调用不会产生无意义 I/O。
 * 每次生成前比对已有文件内容，仅当内容变化（或文件不存在）时才写入。
 */
export function ensureDefineUniPageDts(projectRoot: string, dts: string | false | undefined, logger?: { info(message: string): void }): void {
	if (dts === false) return

	const file = path.resolve(projectRoot, typeof dts === 'string' ? dts : DEFAULT_DEFINE_UNI_PAGE_DTS)
	const content = getDefineUniPageDtsContent()

	if (shouldUpdateFileContent(file, content)) {
		writeFileSyncSafely(file, content)
		logger?.info(`defineUniPage 类型声明已生成: ${file}`)
	}
}
