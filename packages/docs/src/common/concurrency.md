# concurrency

并发控制工具，提供带并发限制的批量异步执行与串行任务队列能力。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { runWithConcurrency, TaskQueue } from '@meng-xi/vite-plugin/common/concurrency'

// barrel 导入
import { runWithConcurrency, TaskQueue } from '@meng-xi/vite-plugin/common'
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

---

## TaskQueue

串行任务队列，将异步任务按提交顺序依次执行，确保同一时刻只有一个任务在运行。

```typescript
class TaskQueue {
  run<T>(task: () => Promise<T>): Promise<T>
}
```

**run**

| 参数 | 类型                     | 说明             |
| ---- | ------------------------ | ---------------- |
| task | `() => Promise<T>`       | 待执行的异步任务 |

**返回值**

`Promise<T>` - 任务执行结果；任务执行失败时返回 reject 的 Promise

**说明**

- 任务按提交顺序串行执行，后提交的任务等待先提交的任务完成后才开始
- 单个任务失败**不会阻塞**队列中后续任务的执行，调用方可通过 catch 感知本次失败
- 适用于高频触发（如文件监听）时避免并发读改写竞态
- 内部插件（如 `generatePages`、`generateRouter`、`generateUni`）使用它串行化生成任务

**示例**

```typescript
const queue = new TaskQueue()

// 高频触发时串行执行，避免并发读写竞态
queue.run(() => generatePages())
queue.run(() => generatePages())
// 第二个任务会等待第一个完成后执行

// 任务失败不影响后续任务
queue.run(() => Promise.reject(new Error('失败')))
queue.run(() => Promise.resolve('继续执行'))
```
