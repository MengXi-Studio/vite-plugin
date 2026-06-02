# ui

终端 UI 工具模块，提供 ANSI 转义码处理、Spinner 动画帧和字符串清理等工具函数。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { ANSI, SPINNER_FRAMES, stripAnsi } from '@meng-xi/vite-plugin/common/ui'

// barrel 导入
import { ANSI, SPINNER_FRAMES, stripAnsi } from '@meng-xi/vite-plugin/common'
```

## ANSI

ANSI 转义码工具集，提供终端文本着色和光标控制功能。

### 光标控制

| 属性       | 值            | 说明             |
| ---------- | ------------- | ---------------- |
| reset      | `'\x1b[0G'`   | 将光标重置到行首 |
| clearLine  | `'\x1b[2K'`   | 清除当前行内容   |
| hideCursor | `'\x1b[?25l'` | 隐藏终端光标     |
| showCursor | `'\x1b[?25h'` | 显示终端光标     |

### 文本着色

每个着色函数接收一个字符串参数，返回包含 ANSI 转义码的字符串。

| 函数    | 签名                    | 说明       |
| ------- | ----------------------- | ---------- |
| green   | `(t: string) => string` | 绿色文本   |
| cyan    | `(t: string) => string` | 青色文本   |
| gray    | `(t: string) => string` | 灰色文本   |
| bold    | `(t: string) => string` | 粗体文本   |
| red     | `(t: string) => string` | 红色文本   |
| yellow  | `(t: string) => string` | 黄色文本   |
| magenta | `(t: string) => string` | 品红色文本 |

**示例**

```typescript
// 彩色输出
console.log(ANSI.green('✓') + ' 构建成功')
console.log(ANSI.red('✗') + ' 构建失败')
console.log(ANSI.bold(ANSI.cyan('信息:')) + ' 正在处理...')

// 光标控制
process.stdout.write(ANSI.hideCursor)
// ... 动画逻辑 ...
process.stdout.write(ANSI.showCursor)

// 行清理与重写
process.stdout.write(ANSI.clearLine + ANSI.reset + ANSI.green('完成'))
```

---

## SPINNER_FRAMES

Spinner 动画帧序列，根据操作系统平台自动选择合适的动画帧：

- **Windows**：使用 ASCII 字符 `|`, `/`, `-`, `\`，确保在传统终端中正常显示
- **其他平台**：使用 Unicode Braille 字符 `⠋`-`⠏`，视觉效果更流畅

**类型**

```typescript
const SPINNER_FRAMES: string[]
```

**示例**

```typescript
let frameIndex = 0
setInterval(() => {
	process.stdout.write(`\r${SPINNER_FRAMES[frameIndex]} Loading...`)
	frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length
}, 80)
```

---

## stripAnsi

移除字符串中的所有 ANSI 转义码。

```typescript
function stripAnsi(str: string): string
```

**参数**

| 参数 | 类型     | 说明                         |
| ---- | -------- | ---------------------------- |
| str  | `string` | 可能包含 ANSI 转义码的字符串 |

**返回值**

`string` - 不包含任何 ANSI 转义码的纯文本字符串

**说明**

使用正则表达式匹配并移除所有形如 `\x1b[...m` 的 ANSI 转义序列，常用于计算文本实际显示宽度或将彩色输出转为纯文本。

**示例**

```typescript
const colored = ANSI.green('hello') + ' ' + ANSI.red('world')
stripAnsi(colored) // 'hello world'

// 计算终端显示宽度
const text = ANSI.bold(ANSI.cyan('状态:')) + ' 完成'
stripAnsi(text).length // 7（不含转义码的实际字符数）
```
