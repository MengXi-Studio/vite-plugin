import fs from 'fs'

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

/**
 * 检查源文件是否存在
 *
 * @param sourcePath - 源文件路径
 * @throws 当源文件不存在或无法访问时抛出异常
 */
export async function checkSourceExists(sourcePath: string): Promise<void> {
	try {
		await fs.promises.access(sourcePath, fs.constants.F_OK)
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'ENOENT') {
			throw new Error(`❌ 复制文件失败：源文件不存在 - ${sourcePath}`)
		} else if (error.code === 'EACCES') {
			throw new Error(`❌ 复制文件失败：没有权限访问源文件 - ${sourcePath}`)
		} else {
			throw new Error(`❌ 复制文件失败：检查源文件时出错 - ${sourcePath}，错误：${error.message}`)
		}
	}
}

/**
 * 创建目标目录
 *
 * @param targetPath - 目标目录路径
 * @throws 当无法创建目标目录时抛出异常
 */
export async function ensureTargetDir(targetPath: string): Promise<void> {
	try {
		await fs.promises.mkdir(targetPath, { recursive: true })
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'EACCES') {
			throw new Error(`❌ 复制文件失败：没有权限创建目标目录 - ${targetPath}`)
		} else {
			throw new Error(`❌ 复制文件失败：创建目标目录时出错 - ${targetPath}，错误：${error.message}`)
		}
	}
}

/**
 * 执行文件复制操作
 *
 * @param sourcePath - 源文件或目录路径
 * @param targetPath - 目标文件或目录路径
 * @param options - 复制选项
 * @throws 当复制过程中出现错误时抛出异常
 */
export async function copySourceToTarget(sourcePath: string, targetPath: string, options: CopyOptions): Promise<void> {
	try {
		await fs.promises.cp(sourcePath, targetPath, {
			recursive: options.recursive,
			force: options.overwrite
		})
	} catch (err) {
		const error = err as NodeJS.ErrnoException
		if (error.code === 'ENOENT') {
			throw new Error(`❌ 复制文件失败：复制过程中源文件不存在 - ${sourcePath}`)
		} else if (error.code === 'EACCES') {
			throw new Error(`❌ 复制文件失败：复制过程中权限不足，无法访问源文件或写入目标目录 - ${sourcePath} -> ${targetPath}`)
		} else if (error.code === 'EPERM') {
			throw new Error(`❌ 复制文件失败：复制过程中操作被拒绝 - ${sourcePath} -> ${targetPath}`)
		} else {
			throw new Error(`❌ 复制文件失败：复制文件时出错 - ${sourcePath} -> ${targetPath}，错误：${error.message}`)
		}
	}
}
