# injectIco

Inject website icon links into HTML files during Vite build.

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [injectIco({ base: '/assets' })]
})
```

You can also pass a string as the base path:

```typescript
export default defineConfig({
	plugins: [injectIco('/assets')]
})
```

## Options

| Option        | Type                           | Default   | Description             |
| ------------- | ------------------------------ | --------- | ----------------------- |
| base          | `string`                       | `'/'`     | Icon base path          |
| url           | `string`                       | -         | Full icon URL           |
| link          | `string`                       | -         | Custom link tag HTML    |
| icons         | `IconConfig[]`                 | -         | Custom icon array       |
| copyOptions   | `CopyOptions`                  | -         | Icon file copy config   |
| enabled       | `boolean`                      | `true`    | Enable the plugin       |
| verbose       | `boolean`                      | `true`    | Show detailed logs      |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | Error handling strategy |

### copyOptions

| Option    | Type      | Default  | Description              |
| --------- | --------- | -------- | ------------------------ |
| sourceDir | `string`  | Required | Source directory         |
| targetDir | `string`  | Required | Target directory         |
| overwrite | `boolean` | `true`   | Overwrite existing files |
| recursive | `boolean` | `true`   | Recursive copy           |

### Priority

`link` > `icons` > `url` > `base + favicon.ico`

## Examples

### Custom Icon Array

```typescript
injectIco({
	icons: [
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		{ rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
	]
})
```

### Full URL

```typescript
injectIco({
	url: 'https://example.com/favicon.ico'
})
```

### Custom Link Tag

```typescript
injectIco({
	link: '<link rel="icon" href="/custom.ico" type="image/x-icon">'
})
```

### With File Copy

```typescript
injectIco({
	base: '/assets',
	copyOptions: {
		sourceDir: 'src/assets/icons',
		targetDir: 'dist/assets/icons'
	}
})
```

### Full Configuration

```typescript
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
```

## Notes

- Icon links are injected before the `</head>` tag
- Skips injection with warning if `</head>` is not found
- `copyOptions` uses incremental copy by default
- Incomplete `copyOptions` throws validation error
