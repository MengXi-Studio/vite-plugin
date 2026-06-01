export const SPINNER_FRAMES = process.platform === 'win32' ? ['|', '/', '-', '\\'] : ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export const ANSI = {
	reset: '\x1b[0G',
	clearLine: '\x1b[2K',
	hideCursor: '\x1b[?25l',
	showCursor: '\x1b[?25h',
	green: (t: string) => `\x1b[32m${t}\x1b[39m`,
	cyan: (t: string) => `\x1b[36m${t}\x1b[39m`,
	gray: (t: string) => `\x1b[90m${t}\x1b[39m`,
	bold: (t: string) => `\x1b[1m${t}\x1b[22m`,
	red: (t: string) => `\x1b[31m${t}\x1b[39m`,
	yellow: (t: string) => `\x1b[33m${t}\x1b[39m`,
	magenta: (t: string) => `\x1b[35m${t}\x1b[39m`
}

const ANSI_REGEX = /\x1b\[[0-9;]*m/g

export function stripAnsi(str: string): string {
	return str.replace(ANSI_REGEX, '')
}
