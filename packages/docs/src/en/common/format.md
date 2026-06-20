# format

Formatting utilities, providing date formatting parameters, template variable replacement, date formatting, file size formatting, and compression ratio calculation.

## Import

```typescript
// Submodule import (recommended)
import { getDateFormatParams, parseTemplate, parseTemplateWithDelimiter, formatDate, formatFileSize, calcRatio } from '@meng-xi/vite-plugin/common/format'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common/format'

// Barrel import
import { getDateFormatParams, parseTemplate, parseTemplateWithDelimiter, formatDate, formatFileSize, calcRatio } from '@meng-xi/vite-plugin/common'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common'
```

## Type Exports

### DateFormatOptions

Date formatting parameters interface.

```typescript
interface DateFormatOptions {
	[key: string]: string // Supports arbitrary key names for custom placeholders
	YYYY: string // Four-digit year
	YY: string   // Two-digit year
	MM: string   // Two-digit month
	DD: string   // Two-digit day
	HH: string   // Two-digit hour (24-hour format)
	mm: string   // Two-digit minute
	ss: string   // Two-digit second
	SSS: string  // Three-digit millisecond
	timestamp: string // Timestamp in milliseconds
}
```

---

## getDateFormatParams

Get date formatting parameters object.

```typescript
function getDateFormatParams(date?: Date): DateFormatOptions
```

**Parameters**

| Parameter | Type   | Default      | Description |
| --------- | ------ | ------------ | ----------- |
| date      | `Date` | `new Date()` | Date object |

**Returns**

`DateFormatOptions` - Date formatting parameters object

**Example**

```typescript
const params = getDateFormatParams(new Date())
// { YYYY: '2026', MM: '02', DD: '03', HH: '15', mm: '30', ss: '00', ... }
```

---

## parseTemplate

Replace <span v-pre>`{{key}}`</span> placeholders in a template string.

```typescript
function parseTemplate(template: string, values: Record<string, string>): string
```

**Parameters**

| Parameter | Type                     | Description                                                                                             |
| --------- | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| template  | `string`                 | Template string containing <span v-pre>`{{key}}`</span> placeholders                                                       |
| values    | `Record<string, string>` | Key-value mapping for placeholders, supports merging multiple variable groups (later overrides earlier) |

**Returns**

`string` - String with placeholders replaced

**Notes**

- Regex special characters in key names are automatically escaped
- `$` in values is safely handled to avoid regex replacement issues

**Example**

```typescript
parseTemplate('Hello {{name}}!', { name: 'World' })
// 'Hello World!'

parseTemplate('{{YYYY}}-{{MM}}-{{DD}}', getDateFormatParams())
// '2026-06-06'
```

---

## parseTemplateWithDelimiter

Replace variable placeholders in a template string with custom delimiters. This is the generic version of `parseTemplate`.

```typescript
function parseTemplateWithDelimiter(
  template: string,
  values: Record<string, string>,
  leftDelimiter?: string,
  rightDelimiter?: string
): string
```

**Parameters**

| Parameter      | Type                     | Default | Description                        |
| -------------- | ------------------------ | ------- | ---------------------------------- |
| template       | `string`                 | -       | Template string with placeholders  |
| values         | `Record<string, string>` | -       | Key-value mapping for placeholders |
| leftDelimiter  | `string`                 | <span v-pre>`'{{'`</span>  | Left delimiter                     |
| rightDelimiter | `string`                 | <span v-pre>`'}}'`</span>  | Right delimiter                    |

**Returns**

`string` - String with placeholders replaced

**Notes**

- Generic template parsing function supporting custom delimiters
- Regex special characters in key names are automatically escaped
- `$` in values is safely handled to avoid regex replacement issues

**Example**

```typescript
parseTemplateWithDelimiter('Hello {{name}}!', { name: 'World' })
// 'Hello World!'

parseTemplateWithDelimiter('Hello {name}!', { name: 'World' }, '{', '}')
// 'Hello World!'

// formatDate internally uses this function with { and } delimiters
parseTemplateWithDelimiter('{YYYY}-{MM}-{DD}', getDateFormatParams(), '{', '}')
// '2026-06-06'
```

---

## formatDate

Format a date string using `{key}` single-brace placeholders.

```typescript
function formatDate(date: Date, format: string): string
```

**Parameters**

| Parameter | Type     | Description                                                                                     |
| --------- | -------- | ----------------------------------------------------------------------------------------------- |
| date      | `Date`   | Date object                                                                                     |
| format    | `string` | Format string, supports `{YYYY}`, `{MM}`, `{DD}`, `{HH}`, `{mm}`, `{ss}` and other placeholders |

**Returns**

`string` - Formatted date string

**Example**

```typescript
formatDate(new Date(), '{YYYY}-{MM}-{DD}T{HH}:{mm}:{ss}')
// '2026-06-06T15:30:00'

formatDate(new Date(), '{YYYY}.{MM}.{DD}')
// '2026.06.06'
```

---

## formatFileSize

Format bytes into a human-readable file size string.

```typescript
function formatFileSize(bytes: number): string
```

**Parameters**

| Parameter | Type     | Description        |
| --------- | -------- | ------------------ |
| bytes     | `number` | File size in bytes |

**Returns**

`string` - Formatted file size string

**Conversion Rules**

| Range            | Format   | Example  |
| ---------------- | -------- | -------- |
| Less than 1KB    | `xB`     | `512B`   |
| Less than 1MB    | `x.xKB`  | `1.5KB`  |
| Greater than 1MB | `x.xxMB` | `2.35MB` |

**Example**

```typescript
formatFileSize(512) // '512B'
formatFileSize(1536) // '1.5KB'
formatFileSize(2461726) // '2.35MB'
```

---

## calcRatio

Calculate compression ratio percentage.

```typescript
function calcRatio(originalSize: number, compressedSize: number): number
```

**Parameters**

| Parameter      | Type     | Description               |
| -------------- | -------- | ------------------------- |
| originalSize   | `number` | Original size (bytes)     |
| compressedSize | `number` | Compressed size (bytes)   |

**Returns**

`number` - Compression ratio percentage (0-100), e.g., 65.2 means 65.2% size reduction

**Notes**

- Formula: `(1 - compressedSize / originalSize) * 100`, rounded to one decimal place
- Returns 0 when `originalSize` is 0, avoiding division by zero

**Example**

```typescript
calcRatio(10000, 6000)  // 40.0
calcRatio(10000, 10000) // 0
calcRatio(0, 0)         // 0
```
