# fs

文件系统操作工具。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { checkSourceExists, copySourceToTarget, writeFileContent, scanDirectory, writeJsonReport } from '@meng-xi/vite-plugin/common/fs'
import type { CopyOptions, CopyResult, ScannedFile, ScanDirectoryOptions } from '@meng-xi/vite-plugin/common/fs'

// barrel 导入
import { checkSourceExists, copySourceToTarget, writeFileContent, scanDirectory, writeJsonReport } from '@meng-xi/vite-plugin/common'
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

---

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
