/**
 * 串行任务队列
 *
 * @description 将异步任务按提交顺序串行执行，确保同一时刻只有一个任务在运行。
 * 用于高频触发（如文件监听）时避免并发读改写竞态。任务之间互不阻塞失败：
 * 某个任务 reject 不会影响后续任务的执行。
 *
 * @example
 * ```typescript
 * const queue = new TaskQueue()
 * queue.run(() => generate()) // 第一个任务
 * queue.run(() => generate()) // 排队，待第一个完成后执行
 * ```
 */
export class TaskQueue {
	/** 当前队列尾部 Promise，用于串联后续任务 */
	private tail: Promise<void> = Promise.resolve()

	/**
	 * 将任务加入队列串行执行
	 *
	 * @template T - 任务返回值类型
	 * @param {() => Promise<T>} task - 待执行的异步任务
	 * @returns {Promise<T>} 任务执行结果；若任务执行失败，则返回 reject 的 Promise
	 *
	 * @description 任务失败不会阻塞队列后续任务。调用方可自行 catch 返回的 Promise
	 * 以感知本次执行失败。
	 */
	run<T>(task: () => Promise<T>): Promise<T> {
		const result = this.tail.catch(() => {}).then(() => task())
		// 无论本次任务成功与否，队列都应继续推进，故吞掉链尾错误
		this.tail = result.then(
			() => {},
			() => {}
		)
		return result
	}
}

/**
 * 带并发限制的批量执行
 *
 * @template T - 输入项类型
 * @template R - 返回结果类型
 * @param {T[]} items - 待处理项列表
 * @param {(item: T) => Promise<R>} handler - 处理函数
 * @param {number} concurrency - 最大并发数
 * @returns {Promise<R[]>} 处理结果数组，顺序与输入项对应
 *
 * @description 使用工作池模式并发执行异步任务，结果顺序与输入项对应。
 * 当并发数大于等于项数时，所有项同时执行；否则按并发数分批执行。
 *
 * @example
 * ```typescript
 * const results = await runWithConcurrency(
 *   [1, 2, 3, 4, 5],
 *   async (n) => { await delay(100); return n * 2 },
 *   2
 * )
 * // [2, 4, 6, 8, 10]
 * ```
 */
export async function runWithConcurrency<T, R>(items: T[], handler: (item: T) => Promise<R>, concurrency: number): Promise<R[]> {
	const results: R[] = []
	let index = 0

	async function runNext(): Promise<void> {
		while (index < items.length) {
			const currentIndex = index++
			const result = await handler(items[currentIndex])
			results[currentIndex] = result
		}
	}

	const workers = Array(Math.min(concurrency, items.length))
		.fill(null)
		.map(() => runNext())
	await Promise.all(workers)

	return results
}
