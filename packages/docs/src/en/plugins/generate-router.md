# generateRouter

Auto-generate router configuration and TypeScript type declarations from uni-app's `pages.json`.

## Import Methods

```typescript
// Submodule import (recommended)
import { generateRouter } from '@meng-xi/vite-plugin/plugins/generate-router'

// Barrel import
import { generateRouter } from '@meng-xi/vite-plugin'
```

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [generateRouter()]
})
```

## Options

| Option               | Type                           | Default                  | Description                             |
| -------------------- | ------------------------------ | ------------------------ | --------------------------------------- |
| pagesJsonPath        | `string`                       | `'src/pages.json'`       | Path to pages.json                      |
| outputPath           | `string`                       | `'src/router.config.ts'` | Output file path                        |
| outputFormat         | `'ts' \| 'js'`                 | `'ts'`                   | Output format                           |
| nameStrategy         | `NameStrategy`                 | `'camelCase'`            | Route naming strategy                   |
| customNameGenerator  | `(path: string) => string`     | -                        | Custom name generator                   |
| includeSubPackages   | `boolean`                      | `true`                   | Include sub-package routes              |
| watch                | `boolean`                      | `true`                   | Watch for changes                       |
| metaMapping          | `Record<string, string>`       | See below                | Style to meta field mapping             |
| exportTypes          | `boolean`                      | `true`                   | Export type definitions (TS)            |
| preserveRouteChanges | `boolean`                      | `true`                   | Preserve user route changes             |
| dts                  | `string \| boolean`            | `false`                  | Route type declaration file output path |
| enabled              | `boolean`                      | `true`                   | Enable the plugin                       |
| verbose              | `boolean`                      | `true`                   | Show detailed logs                      |
| errorStrategy        | `'throw' \| 'log' \| 'ignore'` | `'throw'`                | Error handling strategy                 |

### Route Naming Strategies

| Strategy   | Description     | Example Path          | Generated Name     |
| ---------- | --------------- | --------------------- | ------------------ |
| camelCase  | Camel case      | `/pages/user/profile` | pagesUserProfile   |
| pascalCase | Pascal case     | `/pages/user/profile` | PagesUserProfile   |
| path       | Path underscore | `/pages/user/profile` | pages_user_profile |
| custom     | Custom function | -                     | -                  |

### Default metaMapping

```typescript
{
  navigationBarTitleText: 'title',
  requireAuth: 'requireAuth'
}
```

### dts Type Declarations

Control whether to generate route type declaration files (`.d.ts`), extending the `RouteNameMap` interface for the `@meng-xi/uni-router` module to enable type-safe route navigation.

| Value    | Description                                      |
| -------- | ------------------------------------------------ |
| `false`  | Don't generate type declaration file (default)   |
| `true`   | Use default path `src/router.d.ts`               |
| `string` | Generate type declaration file at specified path |

Generated type declaration file example:

```typescript
import '@meng-xi/uni-router'

declare module '@meng-xi/uni-router' {
	interface RouteNameMap {
		/** Home */
		pagesIndexIndex: { path: '/pages/index/index'; meta: { title: string; isTab: true } }
		/** Profile */
		pagesUserProfile: { path: '/pages/user/profile'; meta: { title: string; requireAuth: true } }
	}
}
```

## Examples

### Output JavaScript

```typescript
generateRouter({
	outputFormat: 'js',
	outputPath: 'src/router.config.js'
})
```

### Custom Route Names

```typescript
generateRouter({
	nameStrategy: 'custom',
	customNameGenerator: path => `route_${path.replace(/\//g, '_')}`
})
```

### Custom Meta Mapping

```typescript
generateRouter({
	metaMapping: {
		navigationBarTitleText: 'title',
		requireAuth: 'requireAuth',
		customField: 'custom'
	}
})
```

### Exclude Sub-packages

```typescript
generateRouter({
	includeSubPackages: false
})
```

### Generate Route Type Declarations

```typescript
generateRouter({
	dts: true // Use default path src/router.d.ts
})

// Or custom path
generateRouter({
	dts: 'src/types/router.d.ts'
})
```

## Output Example

```typescript
export interface RouteMeta {
	title?: string
	isTab?: boolean
	requireAuth?: boolean
	[key: string]: unknown
}

export interface RouteConfig {
	path: string
	name?: string
	meta?: RouteMeta
}

export const routes: RouteConfig[] = [
	{
		path: '/pages/index/index',
		name: 'pagesIndexIndex',
		meta: { title: 'Home', isTab: true }
	},
	{
		path: '/pages/user/profile',
		name: 'pagesUserProfile',
		meta: { title: 'Profile', requireAuth: true }
	}
]

export default routes
```

## Notes

- `customNameGenerator` is required when `nameStrategy` is `'custom'`
- TabBar pages automatically get `isTab: true`
- `preserveRouteChanges: true` preserves user modifications to routes array
- Supports parsing `pages.json` with comments
