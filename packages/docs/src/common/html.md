# html

HTML 注入工具，提供向 HTML 文件中注入代码的功能。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { injectBeforeTag, injectHtmlByPriority, injectBeforeTagWithFallback, injectHeadAndBody } from '@meng-xi/vite-plugin/common/html'
import type { HtmlInjectResult, DualInjectResult } from '@meng-xi/vite-plugin/common/html'

// barrel 导入
import { injectBeforeTag, injectHtmlByPriority, injectBeforeTagWithFallback, injectHeadAndBody } from '@meng-xi/vite-plugin/common'
import type { HtmlInjectResult, DualInjectResult } from '@meng-xi/vite-plugin/common'
```

---

## 类型导出

### HtmlInjectResult

HTML 注入结果接口。

```typescript
interface HtmlInjectResult {
	/** 注入后的 HTML 内容 */
	html: string
	/** 是否成功注入 */
	injected: boolean
}
```

### DualInjectResult

双区域 HTML 注入结果接口。

```typescript
interface DualInjectResult {
	/** 注入后的 HTML 内容 */
	html: string
	/** head 区域是否成功注入 */
	headInjected: boolean
	/** body 区域是否成功注入 */
	bodyInjected: boolean
	/** body 注入是否使用了回退策略（追加到末尾） */
	usedFallback: boolean
}
```

---

## injectBeforeTag

在 HTML 中指定闭合标签前注入代码。

```typescript
function injectBeforeTag(html: string, tag: string, code: string): HtmlInjectResult
```

**参数**

| 参数 | 类型     | 说明                                               |
| ---- | -------- | -------------------------------------------------- |
| html | `string` | 原始 HTML 内容                                     |
| tag  | `string` | 目标闭合标签（如 `</head>`、`</body>`、`</html>`） |
| code | `string` | 要注入的代码                                       |

**返回值**

`HtmlInjectResult` - 注入结果对象

**示例**

```typescript
// 在 </head> 前注入 CSS
const result = injectBeforeTag(html, '</head>', '<style>...</style>')

// 在 </body> 前注入 JS
const result = injectBeforeTag(html, '</body>', '<script>...</script>')

// 检查是否成功注入
if (result.injected) {
	console.log('注入成功')
}
```

---

## injectHtmlByPriority

按优先级向 HTML 中注入代码。

依次尝试在指定标签前注入代码，优先注入到靠前的标签位置。适用于需要注入到页面中但无特定位置要求的场景。

```typescript
function injectHtmlByPriority(html: string, code: string, targets?: string[]): HtmlInjectResult
```

**参数**

| 参数    | 类型       | 默认值                              | 说明               |
| ------- | ---------- | ----------------------------------- | ------------------ |
| html    | `string`   | -                                   | 原始 HTML 内容     |
| code    | `string`   | -                                   | 要注入的代码       |
| targets | `string[]` | `['</head>', '</body>', '</html>']` | 目标标签优先级列表 |

**返回值**

`HtmlInjectResult` - 注入结果对象。若所有标签均未找到，代码将追加到末尾。

**示例**

```typescript
// 默认优先级：</head> > </body> > </html>
const result = injectHtmlByPriority(html, scriptCode)

// 自定义优先级：优先注入到 </body> 前
const result = injectHtmlByPriority(html, scriptCode, ['</body>', '</html>'])
```

---

## injectBeforeTagWithFallback

带回退策略的 HTML 注入。

依次尝试在 `</body>`、`</html>` 前注入代码，如果均未找到目标标签，则将代码追加到 HTML 末尾。适用于需要注入到页面底部但不确定 HTML 结构是否完整的场景。

```typescript
function injectBeforeTagWithFallback(html: string, code: string, fallbackMessage?: string): HtmlInjectResult & { usedFallback: boolean }
```

**参数**

| 参数            | 类型     | 默认值 | 说明                                     |
| --------------- | -------- | ------ | ---------------------------------------- |
| html            | `string` | -      | 原始 HTML 内容                           |
| code            | `string` | -      | 要注入的代码                             |
| fallbackMessage | `string` | -      | 回退到末尾时的警告信息，为空则不输出警告 |

**返回值**

`HtmlInjectResult & { usedFallback: boolean }` - 注入结果对象，包含注入后的 HTML、是否成功标志和是否使用了回退策略

**示例**

```typescript
// 注入 JS 脚本到页面底部
const result = injectBeforeTagWithFallback(html, '<script>...</script>')

// 带自定义警告信息
const result = injectBeforeTagWithFallback(html, scriptCode, '未找到 </body> 标签，代码追加到文件末尾')

// 检查是否使用了回退策略
if (result.usedFallback) {
	console.warn('代码追加到了 HTML 末尾')
}
```

---

## injectHeadAndBody

双区域 HTML 注入（head + body）。

将代码分别注入到 HTML 的 `</head>` 前和 `</body>` 前（带回退策略）。这是插件中常见的注入模式：CSS/HTML 注入到 head，JS 注入到 body。

```typescript
function injectHeadAndBody(html: string, headCode: string | undefined, bodyCode: string): DualInjectResult
```

**参数**

| 参数     | 类型                  | 默认值 | 说明                                                                   |
| -------- | --------------------- | ------ | ---------------------------------------------------------------------- |
| html     | `string`              | -      | 原始 HTML 内容                                                         |
| headCode | `string \| undefined` | -      | 注入到 `</head>` 前的代码（如 CSS、meta 标签），不提供则跳过 head 注入 |
| bodyCode | `string`              | -      | 注入到 `</body>` 前的代码（如 JS 脚本），回退到 `</html>` 前或末尾     |

**返回值**

`DualInjectResult` - 双区域注入结果对象

**示例**

```typescript
// CSS 注入到 head，JS 注入到 body
const result = injectHeadAndBody(html, '<style>...</style>', '<script>...</script>')
if (!result.headInjected) console.warn('未找到 </head> 标签')
if (result.usedFallback) console.warn('代码追加到文件末尾')

// 仅注入到 body
const result = injectHeadAndBody(html, undefined, '<script>...</script>')
```
