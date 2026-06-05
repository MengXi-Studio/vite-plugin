# script

Script utilities, providing callback function wrapping.

## Import

```typescript
// Submodule import (recommended)
import { makeCallback } from '@meng-xi/vite-plugin/common/script'

// Barrel import
import { makeCallback } from '@meng-xi/vite-plugin/common'
```

---

## makeCallback

Wrap a callback function body string into a safe function expression (with try-catch protection).

```typescript
function makeCallback(body?: string, context?: string, params?: string): string
```

**Parameters**

| Parameter | Type     | Default      | Description                                |
| --------- | -------- | ------------ | ------------------------------------------ |
| body      | `string` | -            | Function body code string                  |
| context   | `string` | `'callback'` | Callback context identifier for error logs |
| params    | `string` | `''`         | Function parameter list string             |

**Returns**

`string` - Safe function expression string

**Example**

```typescript
makeCallback('console.log("done")')
// 'function() { try { console.log("done") } catch(e) { console.error('[callback] error:', e); } }'

makeCallback('console.log(a, b)', 'callback', 'a, b')
// 'function(a, b) { try { console.log(a, b) } catch(e) { console.error('[callback] error:', e); } }'

makeCallback('')
// 'function() {}'

makeCallback(undefined)
// 'function() {}'
```
