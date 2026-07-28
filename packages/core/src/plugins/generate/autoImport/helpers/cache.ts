import fs from 'node:fs'
import path from 'node:path'
import type { ScannedModule, ImportInline } from '../types'

/**
 * 自动导入缓存
 *
 * @description 缓存策略：
 * - 以文件路径 + 修改时间为 key，缓存解析结果
 * - 目录扫描结果缓存，文件未变化时跳过解析
 * - 预设解析结果缓存（预设为静态数据，只需计算一次）
 * - DTS 内容缓存，避免重复生成
 */
export class AutoImportCache {
	/** 文件解析缓存：filePath → { mtimeMs, result } */
	private fileCache: Map<string, { mtimeMs: number; result: ScannedModule }> = new Map()

	/** 预设解析缓存：presetName → results */
	private presetCache: Map<string, ImportInline[]> = new Map()

	/** DTS 内容缓存 */
	private dtsContent: string | null = null

	constructor(config?: { enabled: boolean; dir?: string }) {
		// 缓存目录（预留，后续可用于持久化缓存）
		const _cacheDir = config?.dir || path.join('node_modules', '.cache', 'auto-import')
		void _cacheDir
	}

	/**
	 * 获取文件解析缓存
	 *
	 * @param filePath 文件路径
	 * @returns 缓存的解析结果，文件变化或无缓存返回 null
	 */
	getFileResult(filePath: string): ScannedModule | null {
		const cached = this.fileCache.get(filePath)
		if (!cached) return null

		try {
			const stat = fs.statSync(filePath)
			if (stat.mtimeMs === cached.mtimeMs) {
				return cached.result
			}
		} catch {
			// 文件不存在或无法访问
			this.fileCache.delete(filePath)
		}

		return null
	}

	/**
	 * 设置文件解析缓存
	 *
	 * @param filePath 文件路径
	 * @param result 解析结果
	 */
	setFileResult(filePath: string, result: ScannedModule): void {
		try {
			const stat = fs.statSync(filePath)
			this.fileCache.set(filePath, { mtimeMs: stat.mtimeMs, result })
		} catch {
			// 文件无法访问，不缓存
		}
	}

	/**
	 * 获取预设解析缓存
	 *
	 * @param presetName 预设名称
	 * @returns 缓存的解析结果，无缓存返回 null
	 */
	getPresetResult(presetName: string): ImportInline[] | null {
		return this.presetCache.get(presetName) ?? null
	}

	/**
	 * 设置预设解析缓存
	 *
	 * @param presetName 预设名称
	 * @param result 解析结果
	 */
	setPresetResult(presetName: string, result: ImportInline[]): void {
		this.presetCache.set(presetName, result)
	}

	/**
	 * 获取 DTS 内容缓存
	 *
	 * @returns 缓存的 DTS 内容，无缓存返回 null
	 */
	getDtsContent(): string | null {
		return this.dtsContent
	}

	/**
	 * 设置 DTS 内容缓存
	 *
	 * @param content DTS 内容
	 */
	setDtsContent(content: string): void {
		this.dtsContent = content
	}

	/**
	 * 检查 DTS 内容是否变化
	 *
	 * @param newContent 新的 DTS 内容
	 * @returns 如果内容变化返回 true
	 */
	isDtsContentChanged(newContent: string): boolean {
		return this.dtsContent !== newContent
	}

	/**
	 * 清除所有缓存
	 */
	clear(): void {
		this.fileCache.clear()
		this.presetCache.clear()
		this.dtsContent = null
	}
}
