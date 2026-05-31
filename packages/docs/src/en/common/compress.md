# compress

Compression utilities.

## Import Methods

```typescript
// Submodule import (recommended)
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'

// Barrel import
import { calculateGzipSize } from '@meng-xi/vite-plugin/common'
```

## calculateGzipSize

Calculate the gzip-compressed size of given data.

```typescript
async function calculateGzipSize(data: Buffer | string): Promise<number>
```

**Parameters**

| Parameter | Type               | Description       |
| --------- | ------------------ | ----------------- |
| data      | `Buffer \| string` | Data to calculate |

**Returns**

`Promise<number>` - Gzip-compressed size in bytes

**Description**

Compresses data through a gzip stream and calculates the compressed size, useful for estimating actual network transfer size. Uses the highest compression level (level: 9) for the smallest compressed size.

- When a `string` is passed, it is automatically encoded to `Buffer` using `utf-8`
- Uses Node.js `zlib` module's `createGzip` for streaming compression
- Compression level is fixed at 9 (highest compression ratio) for consistent and accurate results

**Examples**

```typescript
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'

// Calculate gzip size of a Buffer
const gzipSize = await calculateGzipSize(Buffer.from('hello world'))
console.log(`gzip size: ${gzipSize} bytes`)

// Calculate gzip size of a string
const stringData = 'some long string content...'
const size = await calculateGzipSize(stringData)
console.log(`gzip size: ${size} bytes`)

// Use for build artifact size analysis
import { readFileContent } from '@meng-xi/vite-plugin/common/fs'
const content = await readFileContent('dist/app.js')
const originalSize = Buffer.byteLength(content)
const compressedSize = await calculateGzipSize(content)
console.log(`Original: ${originalSize}B, gzip: ${compressedSize}B, Ratio: ${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`)
```
