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
}
