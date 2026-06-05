# fs

File system utilities.

## Import

```typescript
// Submodule import (recommended)
import { checkSourceExists, copySourceToTarget, writeFileContent, scanDirectory, writeJsonReport } from '@meng-xi/vite-plugin/common/fs'
import type { CopyOptions, CopyResult, ScannedFile, ScanDirectoryOptions } from '@meng-xi/vite-plugin/common/fs'

// Barrel import
import { checkSourceExists, copySourceToTarget, writeFileContent, scanDirectory, writeJsonReport } from '@meng-xi/vite-plugin/common'
import type { CopyOptions, CopyResult, ScannedFile, ScanDirectoryOptions } from '@meng-xi/vite-plugin/common'
```

## Type Exports

### CopyOptions

Copy operation options interface.

```typescript
interface CopyOptions {
	recursive: boolean // Whether to recursively copy subdirectories
	overwrite: boolean // Whether to overwrite existing files
	incremental?: boolean // Whether to only copy modified files (default false)
	parallelLimit?: number // Concurrency limit (default 10)
	skipEmptyDirs?: boolean // Whether to skip empty directories
}
```

### CopyResult

Copy result interface.

```typescript
interface CopyResult {
	copiedFiles: number // Number of copied files
	skippedFiles: number // Number of skipped files
	copiedDirs: number // Number of copied directories
	executionTime: number // Execution time in milliseconds
}
```

---

## checkSourceExists

Check if source file exists, throw an error if not found.

```typescript
async function checkSourceExists(sourcePath: string): Promise<void>
```

**Parameters**

| Parameter  | Type     | Description |
| ---------- | -------- | ----------- |
| sourcePath | `string` | Source path |

**Example**

```typescript
await checkSourceExists('/path/to/file')
// Throws if not found: Error: 复制文件失败：源文件不存在 - /path/to/file
```

---

## copySourceToTarget

Copy files or directories to target location.

```typescript
async function copySourceToTarget(sourcePath: string, targetPath: string, options: CopyOptions): Promise<CopyResult>
```

**Parameters**

| Parameter  | Type          | Description  |
| ---------- | ------------- | ------------ |
| sourcePath | `string`      | Source path  |
| targetPath | `string`      | Target path  |
| options    | `CopyOptions` | Copy options |

**CopyOptions**

| Property      | Type      | Default | Description                     |
| ------------- | --------- | ------- | ------------------------------- |
| recursive     | `boolean` | -       | Recursively copy subdirectories |
| overwrite     | `boolean` | -       | Overwrite existing files        |
| incremental   | `boolean` | `false` | Only copy modified files        |
| parallelLimit | `number`  | `10`    | Concurrency limit               |

**CopyResult**

| Property      | Type     | Description             |
| ------------- | -------- | ----------------------- |
| copiedFiles   | `number` | Number of copied files  |
| skippedFiles  | `number` | Number of skipped files |
| copiedDirs    | `number` | Number of copied dirs   |
| executionTime | `number` | Execution time (ms)     |

**Example**

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

Write content to a file.

```typescript
async function writeFileContent(filePath: string, content: string): Promise<void>
```

**Parameters**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| filePath  | `string` | File path    |
| content   | `string` | File content |

**Example**

```typescript
await writeFileContent('/path/to/file.txt', 'Hello World')
```

---

## scanDirectory

Recursively scan a directory and collect file information.

```typescript
async function scanDirectory(dirPath: string, options?: ScanDirectoryOptions): Promise<ScannedFile[]>
```

**Parameters**

| Parameter | Type                   | Default | Description    |
| --------- | ---------------------- | ------- | -------------- |
| dirPath   | `string`               | -       | Directory path |
| options   | `ScanDirectoryOptions` | `{}`    | Scan options   |

**ScanDirectoryOptions**

| Property          | Type                                                             | Default | Description                               |
| ----------------- | ---------------------------------------------------------------- | ------- | ----------------------------------------- |
| includeExtensions | `string[]`                                                       | `[]`    | File extensions to include, empty for all |
| excludePatterns   | `string[]`                                                       | `[]`    | Path patterns to exclude                  |
| filter            | `(filePath: string, extension: string, size: number) => boolean` | -       | Custom file filter function               |

**ScannedFile**

| Property  | Type     | Description                          |
| --------- | -------- | ------------------------------------ |
| filePath  | `string` | Absolute file path                   |
| size      | `number` | File size in bytes                   |
| extension | `string` | File extension (lowercase, with dot) |

**Returns**

`Promise<ScannedFile[]>` - List of file information

**Example**

```typescript
// Scan all .js files
const jsFiles = await scanDirectory('dist', { includeExtensions: ['.js'] })

// Exclude node_modules
const files = await scanDirectory('dist', { excludePatterns: ['node_modules'] })

// Custom filter
const largeFiles = await scanDirectory('dist', {
	filter: (filePath, ext, size) => size > 1024
})
```

---

## writeJsonReport

Write data to a JSON file.

```typescript
async function writeJsonReport(filePath: string, data: object, indent?: number): Promise<void>
```

**Parameters**

| Parameter | Type     | Default | Description              |
| --------- | -------- | ------- | ------------------------ |
| filePath  | `string` | -       | Output file path         |
| data      | `object` | -       | Data object to serialize |
| indent    | `number` | `2`     | JSON indentation spaces  |

**Example**

```typescript
await writeJsonReport('dist/report.json', { timestamp: Date.now(), stats: [] })
await writeJsonReport('dist/report.json', data, 4)
```
