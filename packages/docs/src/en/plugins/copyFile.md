# copyFile Plugin

The copyFile plugin is used to copy files or directories to specified locations during the Vite build process, supporting multiple configuration options.

## Features

- Copy files or directories to specified locations
- Support recursive copying
- Support overwriting existing files
- Support enabling/disabling the plugin
- Support detailed log output

## Basic Usage

### Simple Configuration

```typescript
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    vitePlugin.copyFile({
      sourceDir: 'src/assets',
      targetDir: 'dist/assets'
    })
  ]
})
```

### Complete Configuration

```typescript
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    vitePlugin.copyFile({
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

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| sourceDir | string | Required | The path of the source file directory |
| targetDir | string | Required | The path of the target file directory |
| overwrite | boolean | true | Whether to overwrite existing files |
| recursive | boolean | true | Whether to support recursive copying |
| enabled | boolean | true | Whether to enable the plugin |
| verbose | boolean | true | Whether to show detailed logs |

## Examples

### Copy a Single File

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/favicon.ico',
  targetDir: 'dist/favicon.ico'
})
```

### Copy a Directory

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets'
})
```

### Disable Overwriting

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets',
  overwrite: false
})
```

### Disable Recursive Copying

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets',
  recursive: false
})
```

### Disable the Plugin

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets',
  enabled: false
})
```

## Notes

- Ensure the source file directory exists, otherwise an error will be thrown
- The target directory will be automatically created if it doesn't exist
- When `overwrite` is `false`, if the target file already exists, copying will be skipped
- When `recursive` is `false`, only files in the source directory will be copied, not subdirectories
- When `enabled` is `false`, the plugin will not perform any operations
