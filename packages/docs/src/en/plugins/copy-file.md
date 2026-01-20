# copyFile Plugin

The `copyFile` plugin is used to copy files or directories to specified locations after Vite build is completed, supporting multiple configuration options.

## Features

- Execute at the final stage of the Vite build process (ensuring file copying is performed after other build tasks are completed)
- Copy files or directories to specified locations
- Support recursive copying
- Support overwriting existing files
- Support enabling/disabling the plugin
- Support detailed log output
- Provide error handling mechanism to ensure build process can catch errors

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
			enabled: true,
			verbose: true
		})
	]
})
```

## Configuration Options

| Option    | Type    | Default  | Description                           |
| --------- | ------- | -------- | ------------------------------------- |
| sourceDir | string  | Required | The path of the source file directory |
| targetDir | string  | Required | The path of the target file directory |
| overwrite | boolean | true     | Whether to overwrite existing files   |
| recursive | boolean | true     | Whether to support recursive copying  |
| enabled   | boolean | true     | Whether to enable the plugin          |
| verbose   | boolean | true     | Whether to show detailed logs         |

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
			recursive: false
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

- The plugin executes at the final stage of the Vite build process (enforce: 'post'), ensuring file copying is performed after other build tasks are completed
- Ensure the source file directory exists, otherwise an error will be thrown
- The target directory will be automatically created if it doesn't exist
- When `overwrite` is `false`, if the target file already exists, copying will be skipped
- When `recursive` is `false`, only files in the source directory will be copied, not subdirectories
- When `enabled` is `false`, the plugin will not perform any operations
- The plugin will throw errors to ensure the build process can catch them
- When `verbose` is `true`, detailed execution logs will be output, facilitating debugging and problem troubleshooting
