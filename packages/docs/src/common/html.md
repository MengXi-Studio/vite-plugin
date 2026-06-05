# html

HTML 注入工具，提供向 HTML 文件中注入代码和安全过滤的功能。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { injectBeforeTag, injectHeadAndBody, sanitizeContent } from '@meng-xi/vite-plugin/common/html'
import type { HtmlInjectResult, DualInjectResult, InjectPosition, SelectorMatch, ConditionType, InjectCondition, SecurityConfig, SanitizeRuleOptions } from '@meng-xi/vite-plugin/common/html'

// barrel 导入
import { injectBeforeTag, injectHeadAndBody, sanitizeContent } from '@meng-xi/vite-plugin/common'
import type { HtmlInjectResult, DualInjectResult, InjectPosition, SelectorMatch, ConditionType, InjectCondition, SecurityConfig, SanitizeRuleOptions } from '@meng-xi/vite-plugin/common'
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

### SanitizeRuleOptions

内容消毒规则选项。

```typescript
interface SanitizeRuleOptions {
	/** 规则 ID，用于错误提示 */
	id?: string
	/** 是否允许脚本注入（默认 false） */
	allowScriptInjection?: boolean
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

---

## sanitizeContent

对注入内容进行安全过滤，防止 XSS 攻击。

```typescript
function sanitizeContent(content: string, rule: SanitizeRuleOptions, security?: SecurityConfig, logger?: { warn: (msg: string) => void }): string
```

**参数**

| 参数     | 类型                              | 说明                     |
| -------- | --------------------------------- | ------------------------ |
| content  | `string`                          | 待过滤的 HTML 内容字符串 |
| rule     | `SanitizeRuleOptions`             | 当前注入规则的消毒选项   |
| security | `SecurityConfig`                  | 全局安全配置（可选）     |
| logger   | `{ warn: (msg: string) => void }` | 日志记录器（可选）       |

**返回值**

`string` - 过滤后的安全 HTML 内容字符串

**安全规则**

- 默认阻止危险标签（`<script>`、`<iframe>`、`<object>` 等）
- 默认阻止危险事件属性（`onclick`、`onerror` 等）
- 可通过 `rule.allowScriptInjection` 允许脚本注入（会输出安全警告）
- 可通过 `security.allowedTags` 放行特定标签

**示例**

```typescript
// 基本使用
const safe = sanitizeContent('<div>safe</div>', { id: 'my-rule' })

// 允许脚本注入
const safe = sanitizeContent('<script>...</script>', { id: 'my-rule', allowScriptInjection: true })

// 自定义安全配置
const safe = sanitizeContent(
	content,
	{ id: 'my-rule' },
	{
		blockDangerousTags: true,
		allowedTags: ['div', 'span']
	}
)
```
