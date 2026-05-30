# html

HTML injection utilities for injecting code into HTML files.

## Import Methods

```typescript
// Submodule import (recommended)
import { injectBeforeTag, injectHtmlByPriority, injectBeforeTagWithFallback, injectHeadAndBody } from '@meng-xi/vite-plugin/common/html'
import type { HtmlInjectResult, DualInjectResult } from '@meng-xi/vite-plugin/common/html'

// Barrel import
import { injectBeforeTag, injectHtmlByPriority, injectBeforeTagWithFallback, injectHeadAndBody } from '@meng-xi/vite-plugin/common'
import type { HtmlInjectResult, DualInjectResult } from '@meng-xi/vite-plugin/common'
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
	/** Whether head injection was successful */
	headInjected: boolean
	/** Whether body injection was successful */
	bodyInjected: boolean
	/** Whether body injection used fallback strategy (appended to end) */
	usedFallback: boolean
}
```

---

## injectBeforeTag

Inject code before a specified closing tag in HTML.

```typescript
function injectBeforeTag(html: string, tag: string, code: string): HtmlInjectResult
```

**Parameters**

| Parameter | Type     | Description                                                |
| --------- | -------- | ---------------------------------------------------------- |
| html      | `string` | Original HTML content                                      |
| tag       | `string` | Target closing tag (e.g., `</head>`, `</body>`, `</html>`) |
| code      | `string` | Code to inject                                             |

**Returns**

`HtmlInjectResult` - Injection result object

**Examples**

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

## injectHtmlByPriority

Inject code into HTML by priority.

Tries to inject code before each specified tag in order, preferring earlier tag positions. Suitable for cases where code needs to be injected into the page without a specific position requirement.

```typescript
function injectHtmlByPriority(html: string, code: string, targets?: string[]): HtmlInjectResult
```

**Parameters**

| Parameter | Type       | Default                             | Description              |
| --------- | ---------- | ----------------------------------- | ------------------------ |
| html      | `string`   | -                                   | Original HTML content    |
| code      | `string`   | -                                   | Code to inject           |
| targets   | `string[]` | `['</head>', '</body>', '</html>']` | Target tag priority list |

**Returns**

`HtmlInjectResult` - Injection result object. If no tags are found, code is appended to the end.

**Examples**

```typescript
// Default priority: </head> > </body> > </html>
const result = injectHtmlByPriority(html, scriptCode)

// Custom priority: prefer injecting before </body>
const result = injectHtmlByPriority(html, scriptCode, ['</body>', '</html>'])
```

---

## injectBeforeTagWithFallback

HTML injection with fallback strategy.

Tries to inject code before `</body>` and `</html>` in order. If neither target tag is found, the code is appended to the end of the HTML. Suitable for cases where code needs to be injected at the bottom of the page but
the HTML structure may be incomplete.

```typescript
function injectBeforeTagWithFallback(html: string, code: string, fallbackMessage?: string): HtmlInjectResult & { usedFallback: boolean }
```

**Parameters**

| Parameter       | Type     | Default | Description                                                 |
| --------------- | -------- | ------- | ----------------------------------------------------------- |
| html            | `string` | -       | Original HTML content                                       |
| code            | `string` | -       | Code to inject                                              |
| fallbackMessage | `string` | -       | Warning message when falling back to end, empty to suppress |

**Returns**

`HtmlInjectResult & { usedFallback: boolean }` - Injection result object, including the HTML after injection, success flag, and whether fallback strategy was used

**Examples**

```typescript
// Inject JS script at the bottom of the page
const result = injectBeforeTagWithFallback(html, '<script>...</script>')

// With custom warning message
const result = injectBeforeTagWithFallback(html, scriptCode, 'No </body> tag found, code appended to end of file')

// Check if fallback strategy was used
if (result.usedFallback) {
	console.warn('Code was appended to the end of HTML')
}
```

---

## injectHeadAndBody

Dual-zone HTML injection (head + body).

Injects code before `</head>` and `</body>` (with fallback strategy) respectively. This is a common injection pattern in plugins: CSS/HTML injected into head, JS injected into body.

```typescript
function injectHeadAndBody(html: string, headCode: string | undefined, bodyCode: string): DualInjectResult
```

**Parameters**

| Parameter | Type                  | Default | Description                                                                                 |
| --------- | --------------------- | ------- | ------------------------------------------------------------------------------------------- |
| html      | `string`              | -       | Original HTML content                                                                       |
| headCode  | `string \| undefined` | -       | Code to inject before `</head>` (e.g., CSS, meta tags), skip head injection if not provided |
| bodyCode  | `string`              | -       | Code to inject before `</body>` (e.g., JS scripts), falls back to before `</html>` or end   |

**Returns**

`DualInjectResult` - Dual-zone injection result object

**Examples**

```typescript
// CSS injected into head, JS injected into body
const result = injectHeadAndBody(html, '<style>...</style>', '<script>...</script>')
if (!result.headInjected) console.warn('No </head> tag found')
if (result.usedFallback) console.warn('Code appended to end of file')

// Inject into body only
const result = injectHeadAndBody(html, undefined, '<script>...</script>')
```
