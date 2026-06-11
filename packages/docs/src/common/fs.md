# fs

文件系统操作工具，提供文件复制、目录扫描、安全写入、变更检测和报告路径解析等功能。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { checkSourceExists, copySourceToTarget, writeFileContent, scanDirectory, writeJsonReport, writeFileSyncSafely, shouldUpdateFileContent, resolveReportPath } from '@meng-xi/vite-plugin/common/fs'
import type { CopyOptions, CopyResult, ScannedFile, ScanDirectoryOptions } from '@meng-xi/vite-plugin/common/fs'

// barrel 导入
import { checkSourceExists, copySourceToTarget, writeFileContent, scanDirectory, writeJsonReport, writeFileSyncSafely, shouldUpdateFileContent, resolveReportPath } from '@meng-xi/vite-plugin/common'
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

---

## writeFileSyncSafely

同步写入文件内容，自动创建不存在的目录。

```typescript
function writeFileSyncSafely(filePath: string, content: string): void
```

**参数**

| 参数     | 类型     | 说明     |
| -------- | -------- | -------- |
| filePath | `string` | 文件路径 |
| content  | `string` | 文件内容 |

**说明**

- 同步写入文件，如果目标目录不存在会自动递归创建
- 适用于构建钩子中需要同步写入的场景（如 `transform` 钩子）
- 当文件写入失败时（如权限不足），抛出 `NodeJS.ErrnoException`

**示例**

```typescript
writeFileSyncSafely('/project/src/auto-imports.d.ts', 'declare global { ... }')
```

---

## shouldUpdateFileContent

检查文件内容是否需要更新（同步版本）。

```typescript
function shouldUpdateFileContent(filePath: string, newContent: string): boolean
```

**参数**

| 参数       | 类型     | 说明             |
| ---------- | -------- | ---------------- |
| filePath   | `string` | 文件路径         |
| newContent | `string` | 新生成的文件内容 |

**返回值**

`boolean` - 如果需要更新返回 `true`，否则返回 `false`

**说明**

- 对比现有文件内容与新生成的内容，仅在内容发生变化时才需要写入
- 减少不必要的文件 IO 操作
- 文件不存在时返回 `true`

**示例**

```typescript
if (shouldUpdateFileContent('/project/src/auto-imports.d.ts', newContent)) {
	writeFileSyncSafely('/project/src/auto-imports.d.ts', newContent)
}
```

---

## resolveReportPath

解析报告输出路径。

```typescript
function resolveReportPath(outDir: string, reportPath: string | false): string | null
```

**参数**

| 参数       | 类型             | 说明                           |
| ---------- | ---------------- | ------------------------------ |
| outDir     | `string`         | 构建输出目录路径               |
| reportPath | `string \| false` | 报告文件路径，false 不生成报告 |

**返回值**

`string | null` - 解析后的绝对路径，`reportPath` 为 `false` 时返回 `null`

**说明**

- 当 `reportPath` 为相对路径时，相对于 `outDir` 解析
- 当 `reportPath` 为绝对路径时直接使用
- 当 `reportPath` 为 `false` 时返回 `null`

**示例**

```typescript
resolveReportPath('dist', 'report.json')   // 'dist/report.json'
resolveReportPath('dist', '/tmp/r.json')    // '/tmp/r.json'
resolveReportPath('dist', false)            // null
```
