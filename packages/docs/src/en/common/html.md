# html

HTML injection utilities for injecting code into HTML files.

```typescript
import { injectBeforeTag, injectHtmlByPriority } from '@meng-xi/vite-plugin/common'
import type { HtmlInjectResult } from '@meng-xi/vite-plugin/common'
```

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
