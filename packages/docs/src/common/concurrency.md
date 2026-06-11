# concurrency

并发控制工具，提供带并发限制的批量异步执行能力。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { runWithConcurrency } from '@meng-xi/vite-plugin/common/concurrency'

// barrel 导入
import { runWithConcurrency } from '@meng-xi/vite-plugin/common'
```

---

## runWithConcurrency

带并发限制的批量异步执行，使用工作池模式控制并发数。

```typescript
function runWithConcurrency<T, R>(
  items: T[],
  handler: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]>
```

**参数**

| 参数       | 类型                        | 说明             |
| ---------- | --------------------------- | ---------------- |
| items      | `T[]`                       | 待处理项列表     |
| handler    | `(item: T) => Promise<R>`   | 处理函数         |
| concurrency | `number`                   | 最大并发数       |

**返回值**

`Promise<R[]>` - 处理结果数组，顺序与输入项对应

**说明**

- 使用工作池模式并发执行异步任务，结果顺序与输入项对应
- 当并发数大于等于项数时，所有项同时执行；否则按并发数分批执行
- 内部插件（如 `imageOptimizer`、`compressAssets`）使用此函数控制并发

**示例**

```typescript
// 并发处理文件列表，最多同时处理 3 个
const results = await runWithConcurrency(
  ['a.txt', 'b.txt', 'c.txt', 'd.txt', 'e.txt'],
  async (file) => {
    const content = await fs.readFile(file, 'utf-8')
    return content.length
  },
  3
)
// [12, 8, 15, 6, 20]

// 并发请求数据
const data = await runWithConcurrency(
  urls,
  async (url) => {
    const res = await fetch(url)
    return res.json()
  },
  5
)
```
