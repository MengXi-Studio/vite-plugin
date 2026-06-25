# compress

压缩工具，提供 gzip 压缩大小计算功能，用于构建产物体积分析、压缩率统计等场景。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'

// barrel 导入
import { calculateGzipSize } from '@meng-xi/vite-plugin/common'
```

---

## calculateGzipSize

异步计算内容的 gzip 压缩后大小（字节数）。

```typescript
async function calculateGzipSize(content: string | Buffer): Promise<number>
```

**参数**

| 参数    | 类型               | 说明                   |
| ------- | ------------------ | ---------------------- |
| content | `string \| Buffer` | 待计算的内容（字符串或 Buffer） |

**返回值**

`Promise<number>` - gzip 压缩后的字节数

**说明**

- 内部使用 Node.js `zlib.gzip` 进行压缩计算
- 字符串输入会先以 UTF-8 编码转换为 Buffer
- 适用于构建产物体积分析、压缩率统计等场景
- 基于 `util.promisify` 封装，返回 Promise，便于异步调用

**示例**

```typescript
const content = 'console.log("hello world")'

// 计算字符串的 gzip 大小
const gzipSize = await calculateGzipSize(content)
console.log(gzipSize) // 例如：38

// 比较 gzip 压缩率
const originalSize = Buffer.byteLength(content, 'utf-8')
const ratio = ((1 - gzipSize / originalSize) * 100).toFixed(1)
console.log(`压缩率：${ratio}%`)

// 也可直接传入 Buffer
const buffer = Buffer.from('some binary data')
const size = await calculateGzipSize(buffer)
```
