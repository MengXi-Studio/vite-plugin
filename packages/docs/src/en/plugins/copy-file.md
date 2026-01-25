# copyFile Plugin

The `copyFile` plugin is used to copy files or directories to specified locations after Vite build is completed, supporting multiple configuration options.

## Features

- Execute at the final stage of the Vite build process (using `enforce: 'post'`, ensuring file copying is performed after other build tasks are completed)
- Copy files or directories to specified locations
- Support recursive copying
- Support overwriting existing files
- Support incremental copying (only copy modified files, improving build efficiency)
- Support enabling/disabling the plugin
- Support detailed log output
- Provide flexible error handling mechanism with configurable error handling strategies
- Support custom error messages and validation rules

## Basic Usage

### Simple Configuration

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

### Complete Configuration

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets',
			overwrite: true,
			recursive: true,
			incremental: true,
			enabled: true,
			verbose: true,
			errorStrategy: 'throw'
		})
	]
})
```

## Configuration Options

| Option        | Type                         | Default  | Description                                                                                      |
| ------------- | ---------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| sourceDir     | string                       | Required | The path of the source file directory, must be a non-empty string                                |
| targetDir     | string                       | Required | The path of the target file directory, must be a non-empty string                                |
| overwrite     | boolean                      | true     | Whether to overwrite existing files                                                              |
| recursive     | boolean                      | true     | Whether to support recursive copying of subdirectories                                           |
| incremental   | boolean                      | true     | Whether to enable incremental copying, only copy modified files to improve build efficiency      |
| enabled       | boolean                      | true     | Whether to enable the plugin                                                                     |
| verbose       | boolean                      | true     | Whether to show detailed logs                                                                    |
| errorStrategy | 'throw' \| 'log' \| 'ignore' | 'throw'  | Error handling strategy: 'throw' to throw errors, 'log' to log errors, 'ignore' to ignore errors |

## Examples

### Basic Usage

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

### Custom Configuration

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/static',
			targetDir: 'dist/static',
			overwrite: false,
			verbose: true,
			recursive: false,
			incremental: false, // Disable incremental copying, copy all files every time
			errorStrategy: 'log' // Only log errors, don't interrupt build
		})
	]
})
```

### Enable Based on Environment

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets',
			enabled: process.env.NODE_ENV === 'production'
		})
	]
})
```

### Disable the Plugin

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets',
			enabled: false
		})
	]
})
```

## Notes

- The plugin executes at the final stage of the Vite build process (`enforce: 'post'`), ensuring file copying is performed after other build tasks are completed
- Ensure the source file directory exists, otherwise an error will be thrown
- The target directory will be automatically created if it doesn't exist
- When `overwrite` is `false`, if the target file already exists, copying will be skipped
- When `recursive` is `false`, only files in the source directory will be copied, not subdirectories
- When `incremental` is `true`, only modified files will be copied, improving build efficiency
- When `enabled` is `false`, the plugin will not perform any operations
- The `errorStrategy` option determines the error handling behavior:
  - `'throw'`: Throw errors, interrupting the build process
  - `'log'`: Log errors but don't interrupt the build
  - `'ignore'`: Ignore errors and continue execution
- When `verbose` is `true`, detailed execution logs will be output, facilitating debugging and problem troubleshooting
- `sourceDir` and `targetDir` must be non-empty strings, otherwise validation errors will be thrown
- The plugin validates the configuration's validity and throws detailed error messages when the configuration is invalid
