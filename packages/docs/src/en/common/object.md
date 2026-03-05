# object

Object handling utilities.

```typescript
import { deepMerge } from '@meng-xi/vite-plugin/common'
```

## deepMerge

Deep merge objects.

```typescript
function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T
```

**Features**

- `undefined` values are skipped
- Nested objects are recursively merged
- Arrays are overwritten (not merged)
- `null` values override existing values

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
```
