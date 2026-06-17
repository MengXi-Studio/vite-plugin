# fs

File system utilities, providing file operations, directory scanning, safe writing, change detection, report path resolution, file mapping, and batch deletion.

## Import

```typescript
// Submodule import (recommended)
import { checkSourceExists, copySourceToTarget, writeFileContent, scanDirectory, writeJsonReport, writeFileSyncSafely, shouldUpdateFileContent, resolveReportPath, scanAndMapFiles, deleteFiles } from '@meng-xi/vite-plugin/common/fs'
import type { CopyOptions, CopyResult, ScannedFile, ScanDirectoryOptions } from '@meng-xi/vite-plugin/common/fs'

// Barrel import
import { checkSourceExists, copySourceToTarget, writeFileContent, scanDirectory, writeJsonReport, writeFileSyncSafely, shouldUpdateFileContent, resolveReportPath, scanAndMapFiles, deleteFiles } from '@meng-xi/vite-plugin/common'
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

---

## writeFileSyncSafely

Synchronously write file content, automatically creating non-existent directories.

```typescript
function writeFileSyncSafely(filePath: string, content: string): void
```

**Parameters**

| Parameter | Type     | Description  |
| --------- | -------- | ------------ |
| filePath  | `string` | File path    |
| content   | `string` | File content |

**Notes**

- Synchronously writes file, automatically creates target directories recursively if they don't exist
- Suitable for scenarios requiring synchronous writes in build hooks (e.g., `transform` hook)
- Throws `NodeJS.ErrnoException` when file write fails (e.g., insufficient permissions)

**Example**

```typescript
writeFileSyncSafely('/project/src/auto-imports.d.ts', 'declare global { ... }')
```

---

## shouldUpdateFileContent

Check if file content needs to be updated (synchronous version).

```typescript
function shouldUpdateFileContent(filePath: string, newContent: string): boolean
```

**Parameters**

| Parameter  | Type     | Description                  |
| ---------- | -------- | ---------------------------- |
| filePath   | `string` | File path                    |
| newContent | `string` | Newly generated file content |

**Returns**

`boolean` - Returns `true` if update is needed, `false` otherwise

**Notes**

- Compares existing file content with newly generated content, only needs to write when content has changed
- Reduces unnecessary file IO operations
- Returns `true` when file doesn't exist

**Example**

```typescript
if (shouldUpdateFileContent('/project/src/auto-imports.d.ts', newContent)) {
	writeFileSyncSafely('/project/src/auto-imports.d.ts', newContent)
}
```

---

## resolveReportPath

Resolve report output path.

```typescript
function resolveReportPath(outDir: string, reportPath: string | false): string | null
```

**Parameters**

| Parameter  | Type             | Description                                    |
| ---------- | ---------------- | ---------------------------------------------- |
| outDir     | `string`         | Build output directory path                    |
| reportPath | `string \| false` | Report file path, false to skip report generation |

**Returns**

`string | null` - Resolved absolute path, returns `null` when `reportPath` is `false`

**Notes**

- When `reportPath` is a relative path, it is resolved relative to `outDir`
- When `reportPath` is an absolute path, it is used directly
- When `reportPath` is `false`, returns `null`

**Example**

```typescript
resolveReportPath('dist', 'report.json')   // 'dist/report.json'
resolveReportPath('dist', '/tmp/r.json')    // '/tmp/r.json'
resolveReportPath('dist', false)            // null
```

---

## scanAndMapFiles

Scan a directory and build a file path mapping table for quick file lookup.

```typescript
async function scanAndMapFiles(
  dirPath: string,
  options?: ScanDirectoryOptions
): Promise<Map<string, ScannedFile>>
```

**Parameters**

| Parameter | Type                   | Default | Description                                  |
| --------- | ---------------------- | ------- | -------------------------------------------- |
| dirPath   | `string`               | -       | Directory path                               |
| options   | `ScanDirectoryOptions` | `{}`    | Scan options (same as `scanDirectory`)       |

**Returns**

`Promise<Map<string, ScannedFile>>` - Map with file relative path as key and file info as value

**Notes**

- Built on `scanDirectory`, converts scan results to a `Map` structure for O(1) lookup
- Keys are normalized relative paths (using forward slashes) relative to `dirPath`
- Suitable for scenarios requiring quick file existence checks or file info retrieval

**Example**

```typescript
// Build file mapping table
const fileMap = await scanAndMapFiles('dist')

// Check if file exists
if (fileMap.has('assets/index.js')) {
	const file = fileMap.get('assets/index.js')!
	console.log(`File size: ${file.size} bytes`)
}

// Use with filter conditions
const jsFileMap = await scanAndMapFiles('dist', { includeExtensions: ['.js'] })
```

---

## deleteFiles

Batch delete a list of files, ignoring non-existent files.

```typescript
async function deleteFiles(files: string[]): Promise<{ deleted: number; skipped: number }>
```

**Parameters**

| Parameter | Type       | Description              |
| --------- | ---------- | ------------------------ |
| files     | `string[]` | List of file paths to delete |

**Returns**

`Promise<{ deleted: number; skipped: number }>` - Deletion result statistics

| Property | Type     | Description                                  |
| -------- | -------- | -------------------------------------------- |
| deleted  | `number` | Number of files successfully deleted         |
| skipped  | `number` | Number of files skipped (not found or failed) |

**Notes**

- Concurrently deletes files to improve batch operation efficiency
- Skips non-existent files without throwing exceptions
- Skips individual file deletion failures and continues processing other files

**Example**

```typescript
// Batch delete files
const result = await deleteFiles([
	'dist/old-file.js',
	'dist/old-file.css',
	'dist/temp.txt'
])

console.log(`Deleted ${result.deleted}, skipped ${result.skipped}`)
```
