# format

Formatting utilities.

## Import

```typescript
// Submodule import (recommended)
import { getDateFormatParams, formatFileSize } from '@meng-xi/vite-plugin/common/format'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common/format'

// Barrel import
import { getDateFormatParams, formatFileSize } from '@meng-xi/vite-plugin/common'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common'
```

## Type Exports

### DateFormatOptions

Date formatting parameters interface.

```typescript
interface DateFormatOptions {
	YYYY: string // Four-digit year
	YY: string // Two-digit year
	MM: string // Two-digit month
	DD: string // Two-digit day
	HH: string // Two-digit hour
	mm: string // Two-digit minute
	ss: string // Two-digit second
	SSS: string // Three-digit millisecond
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
