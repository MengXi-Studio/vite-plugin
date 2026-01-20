# injectIco Plugin

The `injectIco` plugin is used to inject website icon links into the head of HTML files during the Vite build process, supporting multiple configuration options.

## Features

- Transform HTML entry files during the Vite build process, injecting website icon links
- Execute icon file copying after Vite build is completed (when copyOptions is configured)
- Support multiple icon configuration methods (base, url, link, icons, copyOptions)
- Support icon file copying functionality
- Support enabling/disabling the plugin
- Support detailed log output
- Support custom icon arrays
- Provide error handling mechanism to ensure build process can catch errors

## Basic Usage

### String Form (treated as base path)

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [injectIco('/assets')]
})
```

### Basic Configuration (base + default favicon.ico)

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets'
		})
	]
})
```

### Complete Configuration

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			enabled: true,
			verbose: true,
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons',
				overwrite: true,
				recursive: true
			}
		})
	]
})
```

## Configuration Options

| Option      | Type    | Default   | Description                                                                                              |
| ----------- | ------- | --------- | -------------------------------------------------------------------------------------------------------- |
| base        | string  | /         | The base path of icon files, default is root path `/`                                                    |
| url         | string  | undefined | The complete URL of the icon, if provided it will be used preferentially (overriding base + favicon.ico) |
| link        | string  | undefined | Custom complete link tag HTML, if provided it will be used preferentially (overriding url and base)      |
| icons       | array   | undefined | Custom icon array, supporting multiple icon formats and sizes                                            |
| verbose     | boolean | true      | Whether to show detailed logs                                                                            |
| enabled     | boolean | true      | Whether to enable the plugin                                                                             |
| copyOptions | object  | undefined | Icon file copying configuration, when provided, icon file copying will be executed                       |

### copyOptions Configuration

| Option    | Type    | Default  | Description                                                                        |
| --------- | ------- | -------- | ---------------------------------------------------------------------------------- |
| sourceDir | string  | Required | Icon source file directory, used to copy icons to the build directory              |
| targetDir | string  | Required | Icon target directory (build directory), used to copy icons to the build directory |
| overwrite | boolean | true     | Whether to overwrite existing files                                                |
| recursive | boolean | true     | Whether to support recursive copying                                               |

## Examples

### Basic Usage

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [injectIco({ base: '/assets' })]
})
```

### Custom Icons

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			icons: [
				{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
				{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
				{ rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
			]
		})
	]
})
```

### With File Copy Functionality

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons'
			}
		})
	]
})
```

### With Complete Copy Configuration

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons',
				overwrite: false,
				recursive: true
			}
		})
	]
})
```

### Disable Log Output

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			verbose: false,
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons'
			}
		})
	]
})
```

### Enable Based on Environment

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			enabled: process.env.NODE_ENV === 'production',
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons'
			}
		})
	]
})
```

### Disable the Plugin

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			enabled: false,
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons'
			}
		})
	]
})
```

## Notes

- The plugin transforms HTML entry files during the Vite build process, injecting website icon links
- The plugin executes icon file copying after Vite build is completed (when copyOptions is configured)
- If `link` option is provided, it will be used preferentially, ignoring other configurations
- If `icons` option is provided, it will be used to generate icon tags, ignoring `url` and `base`
- If `url` option is provided, it will be used to generate standard link tags, ignoring `base`
- If only `base` option is provided, it will use `base + favicon.ico` to generate link tags
- When `copyOptions` is provided, it will copy icon files from source directory to target directory
- When `enabled` is `false`, the plugin will not perform any operations
- The plugin will throw errors to ensure the build process can catch them
- When `verbose` is `true`, detailed execution logs will be output, facilitating debugging and problem troubleshooting
- When no `</head>` tag is found, the plugin will skip icon injection and output a warning log
