/**
 * ANSI 转义码工具集
 */
declare const ANSI: {
    /** 将光标重置到行首 */
    reset: string;
    /** 清除当前行内容 */
    clearLine: string;
    /** 隐藏终端光标 */
    hideCursor: string;
    /** 显示终端光标 */
    showCursor: string;
    green: (t: string) => string;
    cyan: (t: string) => string;
    gray: (t: string) => string;
    bold: (t: string) => string;
    red: (t: string) => string;
    yellow: (t: string) => string;
    magenta: (t: string) => string;
};

export { ANSI };
