# concurrency

Concurrency control utilities, providing batch async execution with concurrency limits.

## Import

```typescript
// Submodule import (recommended)
import { runWithConcurrency } from '@meng-xi/vite-plugin/common/concurrency'

// Barrel import
import { runWithConcurrency } from '@meng-xi/vite-plugin/common'
```

---

## runWithConcurrency

Batch async execution with concurrency limit, using a worker pool pattern.

```typescript
function runWithConcurrency<T, R>(
  items: T[],
  handler: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]>
```

**Parameters**

| Parameter  | Type                        | Description            |
| ---------- | --------------------------- | ---------------------- |
| items      | `T[]`                       | List of items to process |
| handler    | `(item: T) => Promise<R>`   | Processing function    |
| concurrency | `number`                   | Maximum concurrency    |

**Returns**

`Promise<R[]>` - Array of results, in the same order as input items

**Notes**

- Uses a worker pool pattern for concurrent execution, results maintain input order
- When concurrency is greater than or equal to the number of items, all items execute simultaneously; otherwise, items are processed in batches
- Internal plugins (e.g., `imageOptimizer`, `compressAssets`) use this function for concurrency control

**Example**

```typescript
// Process file list concurrently, max 3 at a time
const results = await runWithConcurrency(
  ['a.txt', 'b.txt', 'c.txt', 'd.txt', 'e.txt'],
  async (file) => {
    const content = await fs.readFile(file, 'utf-8')
    return content.length
  },
  3
)
// [12, 8, 15, 6, 20]

// Fetch data concurrently
const data = await runWithConcurrency(
  urls,
  async (url) => {
    const res = await fetch(url)
    return res.json()
  },
  5
)
```
