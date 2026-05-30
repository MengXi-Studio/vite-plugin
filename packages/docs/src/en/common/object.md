# object

Object handling utilities.

## Import Methods

```typescript
// Submodule import (recommended)
import { deepMerge } from '@meng-xi/vite-plugin/common/object'

// Barrel import
import { deepMerge } from '@meng-xi/vite-plugin/common'
```

---

## deepMerge

Deep merge objects.

```typescript
function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T
```

**Features**

- `undefined` values are skipped, won't override existing values
- Nested objects are recursively merged
- Arrays are overwritten (not merged)
- `null` values override existing values

**Parameters**

| Parameter | Type           | Description        |
| --------- | -------------- | ------------------ |
| sources   | `Partial<T>[]` | Source object list |

**Returns**

`T` - Merged object

**Examples**

```typescript
// Basic merge
deepMerge({ a: 1 }, { b: 2 })
// { a: 1, b: 2 }

// undefined doesn't override
deepMerge({ a: 1 }, { a: undefined })
// { a: 1 }

// Nested object merge
deepMerge({ a: { b: 1 } }, { a: { c: 2 } })
// { a: { b: 1, c: 2 } }

// Array override
deepMerge({ a: [1, 2] }, { a: [3, 4] })
// { a: [3, 4] }

// null overrides existing value
deepMerge({ a: 1 }, { a: null })
// { a: null }

// Multi-object merge
deepMerge({ enabled: true }, { verbose: true }, { enabled: false, custom: 'value' })
// { enabled: false, verbose: true, custom: 'value' }
```
