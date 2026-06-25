# hash

Hash utilities, providing cryptographically random hash generation for version identification, cache busting, unique ID generation, and similar scenarios.

## Import Methods

```typescript
// Submodule import (recommended)
import { generateRandomHash } from '@meng-xi/vite-plugin/common/hash'

// Barrel import
import { generateRandomHash } from '@meng-xi/vite-plugin/common'
```

---

## generateRandomHash

Generates a random hexadecimal hash string of the specified length.

```typescript
function generateRandomHash(length?: number): string
```

**Parameters**

| Parameter | Type     | Default | Description                          |
| --------- | -------- | ------- | ------------------------------------ |
| length    | `number` | `8`     | Hash string length (between 1 and 64) |

**Returns**

`string` - Random hexadecimal hash string

**Description**

- Based on Node.js `crypto.randomBytes`, uses cryptographically strong random values
- Length is automatically clamped between `1` and `64` (out-of-range values are clamped to the boundary)
- The returned string contains only hexadecimal characters (`0-9`, `a-f`)
- Suitable for version identification, cache busting, unique ID generation, etc.

**Examples**

```typescript
// Default length (8 characters)
generateRandomHash()
// e.g., 'a3f2b9c1'

// Custom length
generateRandomHash(16)
// e.g., '7d8e9f0a1b2c3d4e'

// Out-of-range lengths are clamped
generateRandomHash(100)  // generates a 64-character hash
generateRandomHash(0)    // generates a 1-character hash
generateRandomHash(-5)   // generates a 1-character hash

// For file name versioning
const version = generateRandomHash(8)
const filename = `app.${version}.js`
// e.g., 'app.a3f2b9c1.js'

// For cache busting
const cacheKey = generateRandomHash(12)
const url = `/api/data?v=${cacheKey}`
```
