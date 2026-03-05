# fs

File system utilities.

```typescript
import { checkSourceExists, ensureTargetDir, fileExists, shouldUpdateFile, copySourceToTarget, writeFileContent, readFileSync, runWithConcurrency } from '@meng-xi/vite-plugin/common'
```

## checkSourceExists

Check if source file exists, throws if not.

```typescript
async function checkSourceExists(sourcePath: string): Promise<void>
```

---

## ensureTargetDir

Ensure target directory exists, create recursively if not.

```typescript
async function ensureTargetDir(targetPath: string): Promise<void>
```

---

## fileExists

Check if file exists.

```typescript
async function fileExists(filePath: string): Promise<boolean>
```

---

## shouldUpdateFile

Check if file needs update (compare mtime and size).

```typescript
async function shouldUpdateFile(sourceFile: string, targetFile: string): Promise<boolean>
```

---

## copySourceToTarget

Copy files or directories to target location.

```typescript
async function copySourceToTarget(sourcePath: string, targetPath: string, options: CopyOptions): Promise<CopyResult>
```

**CopyOptions**

| Property      | Type      | Default | Description        |
| ------------- | --------- | ------- | ------------------ |
| recursive     | `boolean` | -       | Recursively copy   |
| overwrite     | `boolean` | -       | Overwrite existing |
| incremental   | `boolean` | `false` | Only copy modified |
| parallelLimit | `number`  | `10`    | Concurrency limit  |

**CopyResult**

| Property      | Type     | Description         |
| ------------- | -------- | ------------------- |
| copiedFiles   | `number` | Files copied        |
| skippedFiles  | `number` | Files skipped       |
| copiedDirs    | `number` | Directories copied  |
| executionTime | `number` | Execution time (ms) |

---

## writeFileContent

Write content to file.

```typescript
async function writeFileContent(filePath: string, content: string): Promise<void>
```

---

## readFileSync

Synchronously read file content.

```typescript
function readFileSync(filePath: string): string
```

---

## runWithConcurrency

Execute tasks with concurrency limit.

```typescript
async function runWithConcurrency<T, R>(items: T[], handler: (item: T) => Promise<R>, concurrency: number): Promise<R[]>
```
