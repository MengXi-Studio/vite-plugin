# injectIco Plugin

The injectIco plugin is used to inject website icon links into the head of HTML files during the Vite build process, supporting multiple configuration options.

## Features

- Inject website icon links into the head of HTML files
- Support multiple icon configuration methods (base, url, icons, copyOptions)
- Support icon file copying functionality
- Support enabling/disabling the plugin
- Support detailed log output
- Support custom icon arrays

## Basic Usage

### String Form (treated as base path)

```typescript
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    vitePlugin.injectIco('/assets')
  ]
})
```

### Basic Configuration (base + default favicon.ico)

```typescript
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    vitePlugin.injectIco({
      base: '/assets'
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
    vitePlugin.injectIco({
      base: '/assets',
      enabled: true,
      verbose: true,
      copyOptions: {
        sourceDir: 'src/assets',
        targetDir: 'dist/assets',
        overwrite: true,
        recursive: true
      }
    })
  ]
})
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| base | string | / | The base path of icon files, default is root path `/` |
| url | string | undefined | The complete URL of the icon |
| link | string | undefined | Custom complete link tag HTML |
| icons | array | undefined | Custom icon array |
| verbose | boolean | true | Whether to show detailed logs |
| enabled | boolean | true | Whether to enable the plugin |
| copyOptions | object | undefined | Icon file copying configuration |

### copyOptions Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| sourceDir | string | Required | Icon source file directory |
| targetDir | string | Required | Icon target directory (build directory) |
| overwrite | boolean | true | Whether to overwrite existing files |
| recursive | boolean | true | Whether to support recursive copying |

## Examples

### Using Complete URL

```typescript
vitePlugin.injectIco({
  url: 'https://example.com/favicon.ico'
})
```

### Using Custom Icon Array

```typescript
vitePlugin.injectIco({
  icons: [
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
  ]
})
```

### Using Custom Link Tag

```typescript
vitePlugin.injectIco({
  link: '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />'
})
```

### With File Copy Functionality

```typescript
vitePlugin.injectIco({
  base: '/assets',
  copyOptions: {
    sourceDir: 'src/assets',
    targetDir: 'dist/assets'
  }
})
```

### Disable the Plugin

```typescript
vitePlugin.injectIco({
  enabled: false
})
```

## Notes

- If `link` option is provided, it will be used preferentially, ignoring other configurations
- If `icons` option is provided, it will be used to generate icon tags, ignoring `url` and `base`
- If `url` option is provided, it will be used to generate standard link tags, ignoring `base`
- If only `base` option is provided, it will use `base + favicon.ico` to generate link tags
- When `copyOptions` is provided, it will copy icon files from source directory to target directory
- When `enabled` is `false`, the plugin will not perform any operations
