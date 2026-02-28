# fs

文件系统操作工具。

```typescript
import { checkSourceExists, ensureTargetDir, fileExists, readDirRecursive, shouldUpdateFile, copySourceToTarget, writeFileContent, readFileSync, runWithConcurrency } from '@meng-xi/vite-plugin/common'
```

## checkSourceExists

检查源文件是否存在，不存在时抛出异常。

```typescript
async function checkSourceExists(sourcePath: string): Promise<void>
```

**参数**

| 参数       | 类型     | 说明       |
| ---------- | -------- | ---------- |
| sourcePath | `string` | 源文件路径 |

**示例**

```typescript
await checkSourceExists('/path/to/file')
// 文件不存在时抛出: Error: 复制文件失败：源文件不存在 - /path/to/file
```

---

## ensureTargetDir

确保目标目录存在，不存在则递归创建。

```typescript
async function ensureTargetDir(targetPath: string): Promise<void>
```

**参数**

| 参数       | 类型     | 说明         |
| ---------- | -------- | ------------ |
| targetPath | `string` | 目标目录路径 |

**示例**

```typescript
await ensureTargetDir('/path/to/dir')
```

---

## fileExists

检查文件是否存在。

```typescript
async function fileExists(filePath: string): Promise<boolean>
```

**参数**

| 参数     | 类型     | 说明     |
| -------- | -------- | -------- |
| filePath | `string` | 文件路径 |

**返回值**

`boolean` - 文件是否存在

**示例**

```typescript
if (await fileExists('/path/to/file')) {
	console.log('文件存在')
}
```

---

## shouldUpdateFile

检查文件是否需要更新（比较修改时间和文件大小）。

```typescript
async function shouldUpdateFile(sourceFile: string, targetFile: string): Promise<boolean>
```

**参数**

| 参数       | 类型     | 说明         |
| ---------- | -------- | ------------ |
| sourceFile | `string` | 源文件路径   |
| targetFile | `string` | 目标文件路径 |

**返回值**

`boolean` - 是否需要更新

**示例**

```typescript
if (await shouldUpdateFile('src/file.txt', 'dist/file.txt')) {
	console.log('文件需要更新')
}
```

---

## copySourceToTarget

复制文件或目录到目标位置。

```typescript
async function copySourceToTarget(sourcePath: string, targetPath: string, options: CopyOptions): Promise<CopyResult>
```

**参数**

| 参数       | 类型          | 说明     |
| ---------- | ------------- | -------- |
| sourcePath | `string`      | 源路径   |
| targetPath | `string`      | 目标路径 |
| options    | `CopyOptions` | 复制选项 |

**CopyOptions**

| 属性          | 类型      | 默认值  | 说明               |
| ------------- | --------- | ------- | ------------------ |
| recursive     | `boolean` | -       | 递归复制子目录     |
| overwrite     | `boolean` | -       | 覆盖已存在文件     |
| incremental   | `boolean` | `false` | 仅复制修改过的文件 |
| parallelLimit | `number`  | `10`    | 并发限制数         |

**CopyResult**

| 属性          | 类型     | 说明           |
| ------------- | -------- | -------------- |
| copiedFiles   | `number` | 复制的文件数   |
| skippedFiles  | `number` | 跳过的文件数   |
| copiedDirs    | `number` | 复制的目录数   |
| executionTime | `number` | 执行时间（ms） |

**示例**

```typescript
const result = await copySourceToTarget('src/assets', 'dist/assets', {
	recursive: true,
	overwrite: true,
	incremental: true,
	parallelLimit: 10
})

console.log(result)
// { copiedFiles: 10, skippedFiles: 2, copiedDirs: 3, executionTime: 150 }
```

---

## writeFileContent

写入文件内容。

```typescript
async function writeFileContent(filePath: string, content: string): Promise<void>
```

**参数**

| 参数     | 类型     | 说明     |
| -------- | -------- | -------- |
| filePath | `string` | 文件路径 |
| content  | `string` | 文件内容 |

**示例**

```typescript
await writeFileContent('/path/to/file.txt', 'Hello World')
```

---

## readFileSync

同步读取文件内容。

```typescript
function readFileSync(filePath: string): string
```

**参数**

| 参数     | 类型     | 说明     |
| -------- | -------- | -------- |
| filePath | `string` | 文件路径 |

**返回值**

`string` - 文件内容

**示例**

```typescript
const content = readFileSync('/path/to/file.txt')
```

---

## runWithConcurrency

带并发限制的批量执行。

```typescript
async function runWithConcurrency<T, R>(items: T[], handler: (item: T) => Promise<R>, concurrency: number): Promise<R[]>
```

**参数**

| 参数        | 类型                      | 说明     |
| ----------- | ------------------------- | -------- |
| items       | `T[]`                     | 待处理项 |
| handler     | `(item: T) => Promise<R>` | 处理函数 |
| concurrency | `number`                  | 并发数   |

**返回值**

`R[]` - 处理结果数组，顺序与输入项对应

**示例**

```typescript
const urls = ['url1', 'url2', 'url3', 'url4', 'url5']
const results = await runWithConcurrency(
	urls,
	async url => fetch(url),
	3 // 最多同时处理 3 个请求
)
```
