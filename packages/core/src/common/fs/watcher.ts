import fs from 'fs'

/**
 * 目录监听器配置
 */
export interface DirectoryWatcherOptions {
	/** 需要监听的目录列表（绝对路径，不存在的目录自动跳过） */
	dirs: string[]
	/** 目录内容变化时的回调 */
	onChange: (dir: string, eventType: string, filename: string | null) => void
	/** 可选日志接口（用于输出监听状态与警告） */
	logger?: {
		info(message: string): void
		warn(message: string): void
	}
	/** 日志描述文案（如 '页面目录'），用于拼接提示信息 */
	label?: string
}

/**
 * 目录递归监听器
 *
 * @description 对一组目录建立递归文件监听（`fs.watch`），统一管理监听器的
 * 启动与停止。macOS/Linux 支持 `recursive`，不支持的平台会抛出异常，由本类
 * 捕获并降级（跳过该目录），避免插件崩溃。
 *
 * @example
 * ```typescript
 * const watcher = new DirectoryWatcher({
 *   dirs: ['/abs/pages', '/abs/pages-sub'],
 *   onChange: () => regenerate(),
 *   logger,
 *   label: '页面目录'
 * })
 * watcher.start()
 * // ...
 * watcher.stop()
 * ```
 */
export class DirectoryWatcher {
	/** 已建立的监听器列表 */
	private watchers: fs.FSWatcher[] = []

	/** 监听器配置 */
	private readonly options: DirectoryWatcherOptions

	constructor(options: DirectoryWatcherOptions) {
		this.options = options
	}

	/**
	 * 启动监听
	 *
	 * @returns {number} 成功建立监听的目录数量
	 *
	 * @description 遍历配置的目录，对存在的目录逐个建立递归监听；
	 * 不支持 `recursive` 的平台会跳过并输出警告。
	 */
	start(): number {
		const { dirs, onChange, logger, label = '目录' } = this.options
		let started = 0

		for (const dir of dirs) {
			if (!fs.existsSync(dir)) continue

			try {
				const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
					onChange(dir, eventType, filename)
				})
				this.watchers.push(watcher)
				started++
			} catch {
				logger?.warn(`监听${label}失败（可能不支持 recursive），跳过: ${dir}`)
			}
		}

		if (started > 0) {
			logger?.info(`正在监听${label}: ${dirs.join(', ')}`)
		}

		return started
	}

	/**
	 * 停止所有监听
	 *
	 * @description 关闭全部已建立的监听器并清空列表。
	 */
	stop(): void {
		for (const watcher of this.watchers) {
			try {
				watcher.close()
			} catch {
				// 忽略关闭异常
			}
		}
		this.watchers = []
	}

	/**
	 * 当前活跃监听器数量
	 */
	get size(): number {
		return this.watchers.length
	}
}
