import { type VersionType, VersionTypeEnum } from './enum'
import { getGitCommitHash, getSvnRevisionNumber, isExist } from '@/common'

/**
 * 获取 package.json 版本号
 * @returns package.json 版本号
 */
function getPkgVersion(): string {
	try {
		return process.env.npm_package_version as string
	} catch {
		throw new Error('获取package.json版本号失败！请确保当前项目存在package.json文件。')
	}
}

/**
 * 获取当前时间戳
 * @returns 当前时间戳字符串
 */
function getTimestamp(): string {
	return Date.now().toString()
}

/**
 * 获取自定义版本号
 * @param version 自定义版本号
 * @returns 自定义版本号
 */
function getCustomVersion(version?: string) {
	isExist(version, '自定义版本号不能为空！')

	return version!
}

/**
 * 获取版本号
 * @param versionType 版本类型
 * @param customVersion 自定义版本号（可选）
 * @returns 版本号
 */
export function getVersion(versionType: VersionType, customVersion?: string): string {
	try {
		// 根据版本类型获取版本号
		const getVersionStrategies: Record<VersionType, () => string> = {
			[VersionTypeEnum.GitCommitHash]: getGitCommitHash,
			[VersionTypeEnum.SvnRevisionNumber]: getSvnRevisionNumber,
			[VersionTypeEnum.PkgVersion]: getPkgVersion,
			[VersionTypeEnum.BuildTimestamp]: getTimestamp,
			[VersionTypeEnum.Custom]: () => getCustomVersion(customVersion)
		}

		return getVersionStrategies[versionType]()
	} catch (err) {
		throw err
	}
}
