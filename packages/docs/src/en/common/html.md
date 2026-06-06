# html

HTML injection utilities, providing code injection, security filtering, and attribute value escaping for HTML files.

## Import

```typescript
// Submodule import (recommended)
import { injectBeforeTag, injectHeadAndBody, sanitizeContent, escapeHtmlAttr } from '@meng-xi/vite-plugin/common/html'
import type { HtmlInjectResult, DualInjectResult, InjectPosition, SelectorMatch, ConditionType, InjectCondition, SecurityConfig, SanitizeRuleOptions } from '@meng-xi/vite-plugin/common/html'

// Barrel import
import { injectBeforeTag, injectHeadAndBody, sanitizeContent, escapeHtmlAttr } from '@meng-xi/vite-plugin/common'
import type { HtmlInjectResult, DualInjectResult, InjectPosition, SelectorMatch, ConditionType, InjectCondition, SecurityConfig, SanitizeRuleOptions } from '@meng-xi/vite-plugin/common'
```

---

## Type Exports

### HtmlInjectResult

HTML injection result interface.

```typescript
interface HtmlInjectResult {
	/** HTML content after injection */
	html: string
	/** Whether injection was successful */
	injected: boolean
}
```

### DualInjectResult

Dual-zone HTML injection result interface.

```typescript
interface DualInjectResult {
	/** HTML content after injection */
	html: string
	/** Whether head zone injection was successful */
	headInjected: boolean
	/** Whether body zone injection was successful */
	bodyInjected: boolean
	/** Whether body injection used fallback strategy (appended to end) */
	usedFallback: boolean
}
```

### SanitizeRuleOptions

Content sanitization rule options.

```typescript
interface SanitizeRuleOptions {
	/** Rule ID, used for error messages */
	id?: string
	/** Whether to allow script injection (default false) */
	allowScriptInjection?: boolean
}
```

---

## injectBeforeTag

Inject code before a specified closing tag in HTML.

```typescript
function injectBeforeTag(html: string, tag: string, code: string): HtmlInjectResult
```

**Parameters**

| Parameter | Type     | Description                                               |
| --------- | -------- | --------------------------------------------------------- |
| html      | `string` | Original HTML content                                     |
| tag       | `string` | Target closing tag (e.g. `</head>`, `</body>`, `</html>`) |
| code      | `string` | Code to inject                                            |

**Returns**

`HtmlInjectResult` - Injection result object

**Example**

```typescript
// Inject CSS before </head>
const result = injectBeforeTag(html, '</head>', '<style>...</style>')

// Inject JS before </body>
const result = injectBeforeTag(html, '</body>', '<script>...</script>')

// Check if injection was successful
if (result.injected) {
	console.log('Injection successful')
}
```

---

## injectHeadAndBody

Dual-zone HTML injection (head + body).

Inject code before `</head>` and `</body>` respectively (with fallback strategy). This is a common injection pattern: CSS/HTML into head, JS into body.

```typescript
function injectHeadAndBody(html: string, headCode: string | undefined, bodyCode: string): DualInjectResult
```

**Parameters**

| Parameter | Type                  | Default | Description                                                                      |
| --------- | --------------------- | ------- | -------------------------------------------------------------------------------- |
| html      | `string`              | -       | Original HTML content                                                            |
| headCode  | `string \| undefined` | -       | Code to inject before `</head>` (e.g. CSS, meta tags), skip head if not provided |
| bodyCode  | `string`              | -       | Code to inject before `</body>` (e.g. JS scripts), fallback to `</html>` or end  |

**Returns**

`DualInjectResult` - Dual-zone injection result object

**Example**

```typescript
// CSS into head, JS into body
const result = injectHeadAndBody(html, '<style>...</style>', '<script>...</script>')
if (!result.headInjected) console.warn('</head> tag not found')
if (result.usedFallback) console.warn('Code appended to end of file')

// Only inject into body
const result = injectHeadAndBody(html, undefined, '<script>...</script>')
```

---

## sanitizeContent

Sanitize injected content for security, preventing XSS attacks.

```typescript
function sanitizeContent(content: string, rule: SanitizeRuleOptions, security?: SecurityConfig, logger?: { warn: (msg: string) => void }): string
```

**Parameters**

| Parameter | Type                              | Description                       |
| --------- | --------------------------------- | --------------------------------- |
| content   | `string`                          | HTML content string to sanitize   |
| rule      | `SanitizeRuleOptions`             | Sanitization options for the rule |
| security  | `SecurityConfig`                  | Global security config (optional) |
| logger    | `{ warn: (msg: string) => void }` | Logger instance (optional)        |

**Returns**

`string` - Sanitized safe HTML content string

**Security Rules**

- Blocks dangerous tags by default (`<script>`, `<iframe>`, `<object>`, etc.)
- Blocks dangerous event attributes by default (`onclick`, `onerror`, etc.)
- Can allow script injection via `rule.allowScriptInjection` (outputs security warning)
- Can allowlist specific tags via `security.allowedTags`

**Example**

```typescript
// Basic usage
const safe = sanitizeContent('<div>safe</div>', { id: 'my-rule' })

// Allow script injection
const safe = sanitizeContent('<script>...</script>', { id: 'my-rule', allowScriptInjection: true })

// Custom security config
const safe = sanitizeContent(
	content,
	{ id: 'my-rule' },
	{
		blockDangerousTags: true,
		allowedTags: ['div', 'span']
	}
)
```

---

## escapeHtmlAttr

Escape special characters in HTML attribute values to prevent attribute injection attacks.

```typescript
function escapeHtmlAttr(value: string): string
```

**Parameters**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| value     | `string` | String to escape |

**Returns**

`string` - Escaped safe string

**Escaping Rules**

| Character | Escaped Result |
| --------- | -------------- |
| `&`       | `&amp;`        |
| `"`       | `&quot;`       |
| `'`       | `&#39;`        |
| `<`       | `&lt;`         |
| `>`       | `&gt;`         |

**Example**

```typescript
escapeHtmlAttr('hello "world"')
// 'hello &quot;world&quot;'

escapeHtmlAttr("<script>alert('xss')</script>")
// '&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;'
```
