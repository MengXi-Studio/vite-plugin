# fs

File system utilities.

```typescript
import { checkSourceExists, ensureTargetDir, fileExists, readDirRecursive, shouldUpdateFile, copySourceToTarget, writeFileContent, readFileContent, readFileSync, runWithConcurrency } from '@meng-xi/vite-plugin/common'
import type { CopyOptions, CopyResult } from '@meng-xi/vite-plugin/common'
```

## Type Exports

### CopyOptions

Copy operation options interface.

```typescript
interface CopyOptions {
	recursive: boolean // Recursively copy subdirectories
	overwrite: boolean // Overwrite existing files
	incremental?: boolean // Only copy modified files (default false)
	parallelLimit?: number // Concurrency limit (default 10)
	skipEmptyDirs?: boolean // Skip empty directories
}
```

### CopyResult

Copy result interface.

```typescript
interface CopyResult {
	copiedFiles: number // Number of files copied
	skippedFiles: number // Number of files skipped
	copiedDirs: number // Number of directories copied
	executionTime: number // Execution time (ms)
}
```

## checkSourceExists

Check if source file exists, throws if not.

```typescript
async function checkSourceExists(sourcePath: string): Promise<void>
```

**Parameters**

| Parameter  | Type     | Description      |
| ---------- | -------- | ---------------- |
| sourcePath | `string` | Source file path |

**Example**

```typescript
await checkSourceExists('/path/to/file')
// Throws when not found: Error: 复制文件失败：源文件不存在 - /path/to/file
```

---

## ensureTargetDir

Ensure target directory exists, create recursively if not.

```typescript
async function ensureTargetDir(targetPath: string): Promise<void>
```

**Parameters**

| Parameter  | Type     | Description      |
| ---------- | -------- | ---------------- |
| targetPath | `string` | Target directory |

**Example**

```typescript
await ensureTargetDir('/path/to/dir')
```

---

## readDirRecursive

Read directory contents, returning file and directory entry list.

```typescript
async function readDirRecursive(dirPath: string, recursive: boolean): Promise<FileEntry[]>
```

**Parameters**

| Parameter | Type      | Description                    |
| --------- | --------- | ------------------------------ |
| dirPath   | `string`  | Directory path                 |
| recursive | `boolean` | Whether to read subdirectories |

**Returns**

`Promise<FileEntry[]>` - File and directory entry list

**FileEntry**

| Property    | Type      | Description               |
| ----------- | --------- | ------------------------- |
| path        | `string`  | Full path                 |
| isFile      | `boolean` | Whether it is a file      |
| isDirectory | `boolean` | Whether it is a directory |

**Example**

```typescript
const entries = await readDirRecursive('src/assets', true)
for (const entry of entries) {
	if (entry.isFile) {
		console.log('File:', entry.path)
	} else if (entry.isDirectory) {
		console.log('Directory:', entry.path)
	}
}
```

---

## fileExists

Check if file exists.

```typescript
async function fileExists(filePath: string): Promise<boolean>
```

**Parameters**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| filePath  | `string` | File path   |

**Returns**

`boolean` - Whether file exists

**Example**

```typescript
if (await fileExists('/path/to/file')) {
	console.log('File exists')
}
```

---

## shouldUpdateFile

Check if file needs update (compare mtime and size).

```typescript
async function shouldUpdateFile(sourceFile: string, targetFile: string): Promise<boolean>
```

**Parameters**

| Parameter  | Type     | Description      |
| ---------- | -------- | ---------------- |
| sourceFile | `string` | Source file path |
| targetFile | `string` | Target file path |

**Returns**

`boolean` - Whether update is needed

**Example**

```typescript
if (await shouldUpdateFile('src/file.txt', 'dist/file.txt')) {
	console.log('File needs update')
}
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

| Property      | Type      | Default | Description              |
| ------------- | --------- | ------- | ------------------------ |
| recursive     | `boolean` | -       | Recursively copy subdirs |
| overwrite     | `boolean` | -       | Overwrite existing       |
| incremental   | `boolean` | `false` | Only copy modified       |
| parallelLimit | `number`  | `10`    | Concurrency limit        |
| skipEmptyDirs | `boolean` | -       | Skip empty directories   |

**CopyResult**

| Property      | Type     | Description         |
| ------------- | -------- | ------------------- |
| copiedFiles   | `number` | Files copied        |
| skippedFiles  | `number` | Files skipped       |
| copiedDirs    | `number` | Directories copied  |
| executionTime | `number` | Execution time (ms) |

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

Write content to file.

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

## readFileContent

Asynchronously read file content.

```typescript
async function readFileContent(filePath: string): Promise<string>
```

**Parameters**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| filePath  | `string` | File path   |

**Returns**

`Promise<string>` - File content

**Example**

```typescript
const content = await readFileContent('/path/to/file.txt')
```

---

## readFileSync

Synchronously read file content.

::: danger Deprecated Use the async version `readFileContent` instead :::

```typescript
function readFileSync(filePath: string): string
```

**Parameters**

| Parameter | Type     | Description |
| --------- | -------- | ----------- |
| filePath  | `string` | File path   |

**Returns**

`string` - File content

**Example**

```typescript
const content = readFileSync('/path/to/file.txt')
```

---

## runWithConcurrency

Execute tasks with concurrency limit.

```typescript
async function runWithConcurrency<T, R>(items: T[], handler: (item: T) => Promise<R>, concurrency: number): Promise<R[]>
```

**Parameters**

| Parameter   | Type                      | Description       |
| ----------- | ------------------------- | ----------------- |
| items       | `T[]`                     | Items to process  |
| handler     | `(item: T) => Promise<R>` | Handler function  |
| concurrency | `number`                  | Concurrency count |

**Returns**

`R[]` - Result array in same order as input

**Example**

```typescript
const urls = ['url1', 'url2', 'url3', 'url4', 'url5']
const results = await runWithConcurrency(
	urls,
	async url => fetch(url),
	3 // Max 3 concurrent requests
)
```
