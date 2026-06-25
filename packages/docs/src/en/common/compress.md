# compress

Compression utilities, providing gzip size calculation for build artifact size analysis, compression ratio statistics, and similar scenarios.

## Import Methods

```typescript
// Submodule import (recommended)
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'

// Barrel import
import { calculateGzipSize } from '@meng-xi/vite-plugin/common'
```

---

## calculateGzipSize

Asynchronously calculates the gzip-compressed size (in bytes) of the given content.

```typescript
async function calculateGzipSize(content: string | Buffer): Promise<number>
```

**Parameters**

| Parameter | Type               | Description                       |
| --------- | ------------------ | --------------------------------- |
| content   | `string \| Buffer` | Content to calculate (string or Buffer) |

**Returns**

`Promise<number>` - Size in bytes after gzip compression

**Description**

- Uses Node.js `zlib.gzip` internally for compression calculation
- String input is first converted to a Buffer using UTF-8 encoding
- Suitable for build artifact size analysis, compression ratio statistics, etc.
- Wrapped with `util.promisify`, returns a Promise for async usage

**Examples**

```typescript
const content = 'console.log("hello world")'

// Calculate gzip size of a string
const gzipSize = await calculateGzipSize(content)
console.log(gzipSize) // e.g., 38

// Compare gzip compression ratio
const originalSize = Buffer.byteLength(content, 'utf-8')
const ratio = ((1 - gzipSize / originalSize) * 100).toFixed(1)
console.log(`Compression ratio: ${ratio}%`)

// Can also accept a Buffer directly
const buffer = Buffer.from('some binary data')
const size = await calculateGzipSize(buffer)
```
