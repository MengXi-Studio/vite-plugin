# object

Object processing utilities, providing deep merge functionality for config merging, option merging, and similar scenarios.

## Import Methods

```typescript
// Submodule import (recommended)
import { deepMerge } from '@meng-xi/vite-plugin/common/object'

// Barrel import
import { deepMerge } from '@meng-xi/vite-plugin/common'
```

---

## deepMerge

Deeply merges multiple objects, recursively merging nested plain objects.

```typescript
function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T
```

**Parameters**

| Parameter | Type              | Description                       |
| --------- | ----------------- | --------------------------------- |
| sources   | `Partial<T>[]`    | Source objects to merge (variadic) |

**Returns**

`T` - A new merged object (does not modify any source object)

**Merge Rules**

| Data Type        | Merge Behavior                                               |
| ---------------- | ------------------------------------------------------------ |
| Plain object `{}`| Recursively deep merged                                      |
| Array            | Directly overwritten (latter replaces former, array elements are not merged) |
| Primitive types  | Directly overwritten (latter overwrites former)              |
| `null`           | Treated as non-plain object, directly overwritten            |
| `Date`/`RegExp`  | Treated as non-plain object, directly overwritten            |
| `undefined`      | Skipped (does not overwrite existing values)                 |

**Description**

- Only recursively merges "plain objects" (objects detected as `[object Object]` via `Object.prototype.toString`)
- Arrays, `Date`, `RegExp`, class instances, and other non-plain objects are directly overwritten
- `undefined` values are skipped and do not overwrite existing values
- Does not modify any source object; returns a brand-new object
- Source objects later in the argument list have higher priority and overwrite earlier fields with the same name

**Examples**

```typescript
// Basic merge
const result = deepMerge(
  { a: 1, b: 2 },
  { b: 3, c: 4 }
)
// { a: 1, b: 3, c: 4 }

// Deep merge nested objects
const result = deepMerge(
  { user: { name: 'Alice', age: 20 }, tags: ['a'] },
  { user: { age: 25, email: 'alice@test.com' }, tags: ['b'] }
)
// {
//   user: { name: 'Alice', age: 25, email: 'alice@test.com' },
//   tags: ['b']  // Arrays are directly overwritten, not merged
// }

// Skip undefined
const result = deepMerge(
  { a: 1, b: 2 },
  { a: undefined, b: 3 }
)
// { a: 1, b: 3 }  // a remains 1 because undefined is skipped

// Multiple source objects (latter has priority)
const result = deepMerge(
  { x: 1 },
  { x: 2 },
  { x: 3 }
)
// { x: 3 }

// Non-plain objects are directly overwritten
const date = new Date()
const result = deepMerge(
  { time: new Date(2020, 0, 1) },
  { time: date }
)
// { time: date }  // Date object is directly overwritten, no merge attempted

// For plugin config merging
const defaultConfig = {
  enabled: true,
  verbose: true,
  options: { timeout: 5000, retry: 3 }
}
const userConfig = {
  options: { retry: 5 }
}
const finalConfig = deepMerge(defaultConfig, userConfig)
// {
//   enabled: true,
//   verbose: true,
//   options: { timeout: 5000, retry: 5 }
// }
```
