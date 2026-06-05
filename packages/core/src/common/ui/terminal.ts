/**
 * ANSI 转义码工具集
 */
export const ANSI = {
	/** 将光标重置到行首 */
	reset: '\x1b[0G',
	/** 清除当前行内容 */
	clearLine: '\x1b[2K',
	/** 隐藏终端光标 */
	hideCursor: '\x1b[?25l',
	/** 显示终端光标 */
	showCursor: '\x1b[?25h',
	green: (t: string) => `\x1b[32m${t}\x1b[39m`,
	cyan: (t: string) => `\x1b[36m${t}\x1b[39m`,
	gray: (t: string) => `\x1b[90m${t}\x1b[39m`,
	bold: (t: string) => `\x1b[1m${t}\x1b[22m`,
	red: (t: string) => `\x1b[31m${t}\x1b[39m`,
	yellow: (t: string) => `\x1b[33m${t}\x1b[39m`,
	magenta: (t: string) => `\x1b[35m${t}\x1b[39m`
}
