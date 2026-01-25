/**
 * 错误处理策略
 */
export enum ErrorHandlingStrategy {
	/** 抛出错误，中断执行 */
	THROW = 'throw',
	/** 记录日志，继续执行 */
	LOG = 'log',
	/** 忽略错误，继续执行 */
	IGNORE = 'ignore'
}
