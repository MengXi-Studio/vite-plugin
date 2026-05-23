# html

HTML 注入工具，提供向 HTML 文件中注入代码的功能。

```typescript
import { injectBeforeTag, injectHtmlByPriority } from '@meng-xi/vite-plugin/common'
import type { HtmlInjectResult } from '@meng-xi/vite-plugin/common'
```

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
