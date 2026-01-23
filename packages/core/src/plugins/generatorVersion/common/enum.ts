import { EnumValues } from '@/types'

/**
 * 输出文件类型枚举
 */
export enum OutputTypeEnum {
	Txt = 'txt',
	Json = 'json',
	Version = 'version',
	Custom = 'custom'
}

/**
 * 输出文件类型枚举类型
 */
export type OutputType = EnumValues<typeof OutputTypeEnum>

/**
 * 版本类型枚举
 */
export enum VersionTypeEnum {
	GitCommitHash = 'git_commit_hash',
	SvnRevisionNumber = 'svn_revision_number',
	PkgVersion = 'pkg_version',
	BuildTimestamp = 'build_timestamp',
	Custom = 'custom'
}

/**
 * 版本类型枚举类型
 */
export type VersionType = EnumValues<typeof VersionTypeEnum>
