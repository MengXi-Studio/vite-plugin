import { execSync } from 'child_process'

/**
 * 获取 Git 提交哈希
 * @returns Git 提交哈希
 */
export function getGitCommitHash(): string {
	try {
		return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).toString().replace('\n', '').trim()
	} catch {
		throw new Error('获取Git提交哈希失败！请确保当前目录是Git仓库目录。')
	}
}

/**
 * 获取 SVN 修订号
 * @returns SVN 修订号
 */
export function getSvnRevisionNumber(): string {
	try {
		return execSync('svnversion', { encoding: 'utf8' }).toString().replace('\n', '').trim()
	} catch {
		throw new Error('获取SVN修订号失败！请确保当前目录是SVN仓库目录。')
	}
}
