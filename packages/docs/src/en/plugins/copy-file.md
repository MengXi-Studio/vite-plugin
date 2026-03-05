# copyFile

Copy files or directories to specified locations after Vite build is completed.

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		})
	]
})
```

## Options

| Option        | Type                           | Default   | Description              |
| ------------- | ------------------------------ | --------- | ------------------------ |
| sourceDir     | `string`                       | Required  | Source directory path    |
| targetDir     | `string`                       | Required  | Target directory path    |
| overwrite     | `boolean`                      | `true`    | Overwrite existing files |
| recursive     | `boolean`                      | `true`    | Recursively copy subdirs |
| incremental   | `boolean`                      | `true`    | Copy only modified files |
| enabled       | `boolean`                      | `true`    | Enable the plugin        |
| verbose       | `boolean`                      | `true`    | Show detailed logs       |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | Error handling strategy  |

## Examples

### Disable Recursive and Incremental

```typescript
copyFile({
	sourceDir: 'src/static',
	targetDir: 'dist/static',
	recursive: false,
	incremental: false
})
```

### Production Only

```typescript
copyFile({
	sourceDir: 'src/assets',
	targetDir: 'dist/assets',
	enabled: process.env.NODE_ENV === 'production'
})
```

### Log Errors Without Breaking Build

```typescript
copyFile({
	sourceDir: 'src/assets',
	targetDir: 'dist/assets',
	errorStrategy: 'log'
})
```

## Notes

- Uses `enforce: 'post'` to execute after other build tasks
- Source directory must exist; target directory is created automatically
- `incremental: true` only copies files with updated modification times
