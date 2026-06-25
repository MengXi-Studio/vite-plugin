import fs from 'node:fs'
import path from 'node:path'
import type { BundleAnalysisResult, ComparisonDiff } from '../types'

/**
 * 之前构建的分析报告数据结构（仅包含对比所需的字段）
 *
 * @interface PreviousReport
 * @description 从历史 JSON 报告文件中提取的精简数据结构，
 * 仅保留对比分析所需的 chunk 和模块信息。
 */
interface PreviousReport {
	/** 报告生成时间戳（ISO 格式） */
	timestamp: string
	/** 构建产物总大小（字节） */
	totalSize: number
	/** chunk 统计列表 */
	chunks: Array<{ name: string; size: number }>
	/** Top 模块统计列表 */
	topModules: Array<{ id: string; size: number }>
}

/**
 * 读取之前的分析报告文件
 *
 * @async
 * @param {string} reportPath - 报告文件路径
 * @returns {Promise<PreviousReport | null>} 之前的报告数据，读取失败时返回 null
 *
 * @description 尝试读取并解析之前生成的 JSON 分析报告。
 * 如果文件不存在或解析失败，返回 null 而不抛出异常。
 *
 * @example
 * ```typescript
 * const prev = await loadPreviousReport('bundle-analysis.json')
 * if (prev) {
 *   console.log(`上次构建体积: ${prev.totalSize} 字节`)
 * }
 * ```
 */
export async function loadPreviousReport(reportPath: string): Promise<PreviousReport | null> {
	try {
		const resolvedPath = path.isAbsolute(reportPath) ? reportPath : path.resolve(process.cwd(), reportPath)

		const exists = await fs.promises
			.access(resolvedPath, fs.constants.F_OK)
			.then(() => true)
			.catch(() => false)
		if (!exists) return null

		const content = await fs.promises.readFile(resolvedPath, 'utf-8')
		return JSON.parse(content) as PreviousReport
	} catch {
		return null
	}
}

/**
 * 对比两次构建的分析结果，生成差异列表
 *
 * @param {BundleAnalysisResult} current - 当前构建的分析结果
 * @param {PreviousReport} previous - 之前构建的分析报告
 * @returns {ComparisonDiff[]} 差异列表
 *
 * @description 将当前构建的 chunk 和模块与之前版本逐一对比，
 * 计算体积变化量和变化百分比，并标注变化趋势：
 * - `increased`: 体积增大
 * - `decreased`: 体积减小
 * - `unchanged`: 体积不变
 * - `added`: 新增的模块/chunk
 * - `removed`: 已移除的模块/chunk
 *
 * 结果按变化量绝对值降序排列，最显著的变化排在前面。
 *
 * @example
 * ```typescript
 * const diffs = compareWithPrevious(currentResult, previousReport)
 * for (const diff of diffs) {
 *   console.log(`${diff.name}: ${diff.diffPercentage}% (${diff.trend})`)
 * }
 * ```
 */
export function compareWithPrevious(current: BundleAnalysisResult, previous: PreviousReport): ComparisonDiff[] {
	const diffs: ComparisonDiff[] = []

	const previousChunks = new Map<string, number>()
	for (const chunk of previous.chunks) {
		previousChunks.set(chunk.name, chunk.size)
	}

	const currentChunks = new Map<string, number>()
	for (const chunk of current.chunks) {
		currentChunks.set(chunk.name, chunk.size)
	}

	for (const [name, currentSize] of currentChunks) {
		const previousSize = previousChunks.get(name)

		if (previousSize === undefined) {
			diffs.push({
				name,
				previousSize: -1,
				currentSize,
				diff: currentSize,
				diffPercentage: 100,
				trend: 'added'
			})
		} else {
			const diff = currentSize - previousSize
			const diffPercentage = previousSize > 0 ? Number(((diff / previousSize) * 100).toFixed(1)) : 0

			diffs.push({
				name,
				previousSize,
				currentSize,
				diff,
				diffPercentage,
				trend: diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'unchanged'
			})
		}
	}

	for (const [name, previousSize] of previousChunks) {
		if (!currentChunks.has(name)) {
			diffs.push({
				name,
				previousSize,
				currentSize: -1,
				diff: -previousSize,
				diffPercentage: -100,
				trend: 'removed'
			})
		}
	}

	return diffs.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
}
