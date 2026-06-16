import type { ImageOptimizeStats, ImageOptimizeSummary } from '../types'
import { writeJsonReport, resolveReportPath, deleteFiles } from '@/common/fs'
import { calcRatio } from '@/common/format'

/**
 * 根据优化统计数据构建汇总信息
 *
 * @param {ImageOptimizeStats[]} stats - 所有文件的优化统计列表
 * @param {number} skippedFiles - 跳过的文件数量
 * @param {number} failedFiles - 失败的文件数量
 * @param {number} executionTime - 优化操作总耗时（毫秒）
 * @returns {ImageOptimizeSummary} 优化汇总统计信息
 *
 * @description 汇总所有文件的原始大小、优化后大小、压缩率等数据，
 * 并按输出格式分组统计。
 *
 * @example
 * ```typescript
 * const summary = buildSummary(allStats, 2, 0, 1234)
 * console.log(`总压缩率: ${summary.totalRatio}%`)
 * ```
 */
export function buildSummary(stats: ImageOptimizeStats[], skippedFiles: number, failedFiles: number, executionTime: number): ImageOptimizeSummary {
	const totalOriginalSize = stats.reduce((sum, s) => sum + s.originalSize, 0)
	const totalOptimizedSize = stats.reduce((sum, s) => sum + s.optimizedSize, 0)
	const totalRatio = calcRatio(totalOriginalSize, totalOptimizedSize)
	const convertedFiles = stats.filter(s => s.converted).length

	// 按输出格式分组统计
	const byFormat: Record<string, { count: number; originalSize: number; optimizedSize: number; ratio: number }> = {}
	for (const stat of stats) {
		const key = stat.outputFormat
		if (!byFormat[key]) {
			byFormat[key] = { count: 0, originalSize: 0, optimizedSize: 0, ratio: 0 }
		}
		byFormat[key].count++
		byFormat[key].originalSize += stat.originalSize
		byFormat[key].optimizedSize += stat.optimizedSize
	}

	// 计算每组的压缩率
	for (const entry of Object.values(byFormat)) {
		entry.ratio = calcRatio(entry.originalSize, entry.optimizedSize)
	}

	return {
		totalFiles: stats.length,
		skippedFiles,
		failedFiles,
		totalOriginalSize,
		totalOptimizedSize,
		totalRatio,
		byFormat,
		convertedFiles,
		executionTime,
		stats
	}
}

/**
 * 将优化报告写入 JSON 文件
 *
 * @async
 * @param {string} outDir - 构建输出目录路径
 * @param {string | false} reportPath - 报告文件路径，为 false 时不生成报告
 * @param {ImageOptimizeSummary} summary - 优化汇总统计信息
 * @returns {Promise<void>}
 *
 * @description 生成包含时间戳、总体统计、按格式分组统计和逐文件详情的 JSON 报告。
 * 当 `reportPath` 为相对路径时，将相对于 `outDir` 解析；
 * 为绝对路径时直接使用；为 false 时跳过报告生成。
 *
 * @example
 * ```typescript
 * await writeReport('dist', 'image-optimize-report.json', summary)
 * // 生成 dist/image-optimize-report.json
 * ```
 */
export async function writeReport(outDir: string, reportPath: string | false, summary: ImageOptimizeSummary): Promise<void> {
	const outputPath = resolveReportPath(outDir, reportPath)
	if (!outputPath) return

	const report = {
		timestamp: new Date().toISOString(),
		summary: {
			totalFiles: summary.totalFiles,
			skippedFiles: summary.skippedFiles,
			failedFiles: summary.failedFiles,
			totalOriginalSize: summary.totalOriginalSize,
			totalOptimizedSize: summary.totalOptimizedSize,
			totalRatio: summary.totalRatio,
			convertedFiles: summary.convertedFiles,
			executionTime: summary.executionTime
		},
		byFormat: summary.byFormat,
		files: summary.stats.map(s => ({
			file: s.file,
			relativePath: s.relativePath,
			originalSize: s.originalSize,
			optimizedSize: s.optimizedSize,
			ratio: s.ratio,
			sourceFormat: s.sourceFormat,
			outputFormat: s.outputFormat,
			converted: s.converted,
			duration: s.duration
		}))
	}

	await writeJsonReport(outputPath, report)
}

/**
 * 删除优化统计中记录的原始文件（格式转换且 keepOriginal=false 时使用）
 *
 * @async
 * @param {ImageOptimizeStats[]} stats - 优化统计列表
 * @param {string[]} originalPaths - 需要删除的原始文件绝对路径列表
 * @returns {Promise<void>}
 *
 * @description 根据提供的原始文件路径列表删除文件。
 * 仅删除存在且未与输出文件同路径的文件。
 * 删除失败时静默忽略错误。
 */
export async function deleteOriginalFiles(stats: ImageOptimizeStats[], originalPaths: string[]): Promise<void> {
	const outputPaths = new Set(stats.map(s => s.file))
	const filesToDelete = originalPaths.filter(p => !outputPaths.has(p))
	await deleteFiles(filesToDelete)
}
