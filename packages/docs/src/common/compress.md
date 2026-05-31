# compress

压缩算法工具。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'

// barrel 导入
import { calculateGzipSize } from '@meng-xi/vite-plugin/common'
```

## calculateGzipSize

计算给定数据的 gzip 压缩后大小。

```typescript
async function calculateGzipSize(data: Buffer | string): Promise<number>
```

**参数**

| 参数 | 类型               | 说明         |
| ---- | ------------------ | ------------ |
| data | `Buffer \| string` | 待计算的数据 |

**返回值**

`Promise<number>` - gzip 压缩后的字节大小

**说明**

将数据通过 gzip 流压缩后计算压缩体积，用于估算网络传输时的实际体积。使用最高压缩级别（level: 9）以获得最小的压缩体积。

- 当传入 `string` 类型时，会自动使用 `utf-8` 编码转换为 `Buffer`
- 使用 Node.js `zlib` 模块的 `createGzip` 实现流式压缩
- 压缩级别固定为 9（最高压缩比），确保结果的一致性和准确性

**示例**

```typescript
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'

// 计算 Buffer 的 gzip 大小
const gzipSize = await calculateGzipSize(Buffer.from('hello world'))
console.log(`gzip 大小: ${gzipSize} 字节`)

// 计算字符串的 gzip 大小
const stringData = 'some long string content...'
const size = await calculateGzipSize(stringData)
console.log(`gzip 大小: ${size} 字节`)

// 用于构建产物体积分析
import { readFileContent } from '@meng-xi/vite-plugin/common/fs'
const content = await readFileContent('dist/app.js')
const originalSize = Buffer.byteLength(content)
const compressedSize = await calculateGzipSize(content)
console.log(`原始: ${originalSize}B, gzip: ${compressedSize}B, 压缩率: ${((1 - compressedSize / originalSize) * 100).toFixed(1)}%`)
```
