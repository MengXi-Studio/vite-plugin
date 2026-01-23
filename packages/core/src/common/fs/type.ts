/**
 * 复制操作的选项接口
 */
export interface CopyOptions {
	/**
	 * 是否支持递归复制
	 */
	recursive: boolean
	/**
	 * 是否覆盖同名文件
	 */
	overwrite: boolean
	/**
	 * 是否启用增量复制（基于文件哈希）
	 */
	incremental?: boolean
	/**
	 * 并行处理的最大文件数
	 */
	parallelLimit?: number
	/**
	 * 是否跳过空目录
	 */
	skipEmptyDirs?: boolean
}

/**
 * 复制结果接口
 */
export interface CopyResult {
	/**
	 * 复制的文件数量
	 */
	copiedFiles: number
	/**
	 * 跳过的文件数量
	 */
	skippedFiles: number
	/**
	 * 复制的目录数量
	 */
	copiedDirs: number
	/**
	 * 总执行时间（毫秒）
	 */
	executionTime: number
}
