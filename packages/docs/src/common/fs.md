# fs

文件系统操作工具。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import {
	checkSourceExists,
	ensureTargetDir,
	fileExists,
	readDirRecursive,
	shouldUpdateFile,
	copySourceToTarget,
	writeFileContent,
	readFileContent,
	readFileSync,
	runWithConcurrency,
	scanDirectory,
	writeJsonReport
} from '@meng-xi/vite-plugin/common/fs'
import type { CopyOptions, CopyResult, ScannedFile, ScanDirectoryOptions } from '@meng-xi/vite-plugin/common/fs'

// barrel 导入
import {
	checkSourceExists,
	ensureTargetDir,
	fileExists,
	readDirRecursive,
	shouldUpdateFile,
	copySourceToTarget,
	writeFileContent,
	readFileContent,
	readFileSync,
	runWithConcurrency,
	scanDirectory,
	writeJsonReport
} from '@meng-xi/vite-plugin/common'
import type { CopyOptions, CopyResult, ScannedFile, ScanDirectoryOptions } from '@meng-xi/vite-plugin/common'
```

## 类型导出

### CopyOptions

复制操作选项接口。

```typescript
interface CopyOptions {
	recursive: boolean // 是否递归复制子目录
	overwrite: boolean // 是否覆盖已存在文件
	incremental?: boolean // 是否仅复制修改过的文件（默认 false）
	parallelLimit?: number // 并发限制数（默认 10）
	skipEmptyDirs?: boolean // 是否跳过空目录
}
```

### CopyResult

复制结果接口。

```typescript
interface CopyResult {
	copiedFiles: number // 复制的文件数量
	skippedFiles: number // 跳过的文件数量
	copiedDirs: number // 复制的目录数量
	executionTime: number // 执行时间（毫秒）
}
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

## readDirRecursive

读取目录内容，返回文件和目录条目列表。

```typescript
async function readDirRecursive(dirPath: string, recursive: boolean): Promise<FileEntry[]>
```

**参数**

| 参数      | 类型      | 说明               |
| --------- | --------- | ------------------ |
| dirPath   | `string`  | 目录路径           |
| recursive | `boolean` | 是否递归读取子目录 |

**返回值**

`Promise<FileEntry[]>` - 文件和目录条目列表

**FileEntry**

| 属性        | 类型      | 说明       |
| ----------- | --------- | ---------- |
| path        | `string`  | 完整路径   |
| isFile      | `boolean` | 是否为文件 |
| isDirectory | `boolean` | 是否为目录 |

**示例**

```typescript
const entries = await readDirRecursive('src/assets', true)
for (const entry of entries) {
	if (entry.isFile) {
		console.log('文件:', entry.path)
	} else if (entry.isDirectory) {
		console.log('目录:', entry.path)
	}
}
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

## readFileContent

异步读取文件内容。

```typescript
async function readFileContent(filePath: string): Promise<string>
```

**参数**

| 参数     | 类型     | 说明     |
| -------- | -------- | -------- |
| filePath | `string` | 文件路径 |

**返回值**

`Promise<string>` - 文件内容

**示例**

```typescript
const content = await readFileContent('/path/to/file.txt')
```

---

## readFileSync

同步读取文件内容。

::: danger 已废弃请使用异步版本 `readFileContent` :::

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

---

## scanDirectory

递归扫描目录，收集所有文件信息。

```typescript
async function scanDirectory(dirPath: string, options?: ScanDirectoryOptions): Promise<ScannedFile[]>
```

**参数**

| 参数    | 类型                   | 默认值 | 说明     |
| ------- | ---------------------- | ------ | -------- |
| dirPath | `string`               | -      | 目录路径 |
| options | `ScanDirectoryOptions` | `{}`   | 扫描选项 |

**ScanDirectoryOptions**

| 属性              | 类型                                                             | 默认值 | 说明                         |
| ----------------- | ---------------------------------------------------------------- | ------ | ---------------------------- |
| includeExtensions | `string[]`                                                       | `[]`   | 包含的文件扩展名，为空则全部 |
| excludePatterns   | `string[]`                                                       | `[]`   | 排除的路径模式列表           |
| filter            | `(filePath: string, extension: string, size: number) => boolean` | -      | 自定义文件过滤函数           |

**ScannedFile**

| 属性      | 类型     | 说明                       |
| --------- | -------- | -------------------------- |
| filePath  | `string` | 文件绝对路径               |
| size      | `number` | 文件大小（字节）           |
| extension | `string` | 文件扩展名（小写，含点号） |

**返回值**

`Promise<ScannedFile[]>` - 文件信息列表

**示例**

```typescript
// 扫描所有 .js 文件
const jsFiles = await scanDirectory('dist', { includeExtensions: ['.js'] })

// 排除 node_modules
const files = await scanDirectory('dist', { excludePatterns: ['node_modules'] })

// 使用自定义过滤
const largeFiles = await scanDirectory('dist', {
	filter: (filePath, ext, size) => size > 1024
})
```

---

## writeJsonReport

将数据写入 JSON 文件。

```typescript
async function writeJsonReport(filePath: string, data: object, indent?: number): Promise<void>
```

**参数**

| 参数     | 类型     | 默认值 | 说明               |
| -------- | -------- | ------ | ------------------ |
| filePath | `string` | -      | 输出文件路径       |
| data     | `object` | -      | 要序列化的数据对象 |
| indent   | `number` | `2`    | JSON 缩进空格数    |

**示例**

```typescript
await writeJsonReport('dist/report.json', { timestamp: Date.now(), stats: [] })
await writeJsonReport('dist/report.json', data, 4)
```
