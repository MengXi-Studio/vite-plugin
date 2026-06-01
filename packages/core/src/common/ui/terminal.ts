/**
 * 终端 UI 工具模块
 *
 * @module common/ui/terminal
 * @description 提供终端 ANSI 转义码处理、Spinner 动画帧和字符串清理等工具函数，
 * 用于在终端中实现彩色输出、光标控制和进度动画等功能。
 */

/**
 * Spinner 动画帧序列
 *
 * @description 根据操作系统平台自动选择合适的动画帧：
 * - Windows：使用 ASCII 字符 `|`, `/`, `-`, `\`，确保在传统终端中正常显示
 * - 其他平台：使用 Unicode Braille 字符 `⠋`-`⠏`，视觉效果更流畅
 *
 * @example
 * ```typescript
 * let frameIndex = 0
 * setInterval(() => {
 *   process.stdout.write(`\r${SPINNER_FRAMES[frameIndex]} Loading...`)
 *   frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length
 * }, 80)
 * ```
 */
export const SPINNER_FRAMES = process.platform === 'win32' ? ['|', '/', '-', '\\'] : ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

/**
 * ANSI 转义码工具集
 *
 * @description 提供常用的终端 ANSI 转义码常量和彩色文本包装函数，
 * 用于在终端中实现文本着色、光标控制和行清理等操作。
 *
 * @property reset - 将光标重置到行首（`\x1b[0G`）
 * @property clearLine - 清除当前行内容（`\x1b[2K`）
 * @property hideCursor - 隐藏终端光标（`\x1b[?25l`）
 * @property showCursor - 显示终端光标（`\x1b[?25h`）
 * @property green - 将文本包装为绿色
 * @property cyan - 将文本包装为青色
 * @property gray - 将文本包装为灰色
 * @property bold - 将文本包装为粗体
 * @property red - 将文本包装为红色
 * @property yellow - 将文本包装为黄色
 * @property magenta - 将文本包装为品红色
 *
 * @example
 * ```typescript
 * // 彩色输出
 * console.log(ANSI.green('✓') + ' 构建成功')
 * console.log(ANSI.red('✗') + ' 构建失败')
 * console.log(ANSI.bold(ANSI.cyan('信息:')) + ' 正在处理...')
 *
 * // 光标控制
 * process.stdout.write(ANSI.hideCursor)
 * // ... 动画逻辑 ...
 * process.stdout.write(ANSI.showCursor)
 *
 * // 行清理与重写
 * process.stdout.write(ANSI.clearLine + ANSI.reset + ANSI.green('完成'))
 * ```
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
	/**
	 * 将文本包装为绿色
	 * @param t - 要着色的文本
	 * @returns 包含绿色 ANSI 转义码的字符串
	 */
	green: (t: string) => `\x1b[32m${t}\x1b[39m`,
	/**
	 * 将文本包装为青色
	 * @param t - 要着色的文本
	 * @returns 包含青色 ANSI 转义码的字符串
	 */
	cyan: (t: string) => `\x1b[36m${t}\x1b[39m`,
	/**
	 * 将文本包装为灰色
	 * @param t - 要着色的文本
	 * @returns 包含灰色 ANSI 转义码的字符串
	 */
	gray: (t: string) => `\x1b[90m${t}\x1b[39m`,
	/**
	 * 将文本包装为粗体
	 * @param t - 要加粗的文本
	 * @returns 包含粗体 ANSI 转义码的字符串
	 */
	bold: (t: string) => `\x1b[1m${t}\x1b[22m`,
	/**
	 * 将文本包装为红色
	 * @param t - 要着色的文本
	 * @returns 包含红色 ANSI 转义码的字符串
	 */
	red: (t: string) => `\x1b[31m${t}\x1b[39m`,
	/**
	 * 将文本包装为黄色
	 * @param t - 要着色的文本
	 * @returns 包含黄色 ANSI 转义码的字符串
	 */
	yellow: (t: string) => `\x1b[33m${t}\x1b[39m`,
	/**
	 * 将文本包装为品红色
	 * @param t - 要着色的文本
	 * @returns 包含品红色 ANSI 转义码的字符串
	 */
	magenta: (t: string) => `\x1b[35m${t}\x1b[39m`
}

/** ANSI 转义码匹配正则表达式 */
const ANSI_REGEX = /\x1b\[[0-9;]*m/g

/**
 * 移除字符串中的所有 ANSI 转义码
 *
 * @param str - 可能包含 ANSI 转义码的字符串
 * @returns 不包含任何 ANSI 转义码的纯文本字符串
 *
 * @description 使用正则表达式匹配并移除所有形如 `\x1b[...m` 的 ANSI 转义序列，
 * 常用于计算文本实际显示宽度或将彩色输出转为纯文本。
 *
 * @example
 * ```typescript
 * const colored = ANSI.green('hello') + ' ' + ANSI.red('world')
 * stripAnsi(colored) // 'hello world'
 *
 * // 计算终端显示宽度
 * const text = ANSI.bold(ANSI.cyan('状态:')) + ' 完成'
 * stripAnsi(text).length // 7 (不含转义码的实际字符数)
 * ```
 */
export function stripAnsi(str: string): string {
	return str.replace(ANSI_REGEX, '')
}
