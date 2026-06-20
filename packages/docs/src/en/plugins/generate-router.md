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
| nameStrategy         | `NameStrategy`                 | `'camelCase'`            | Route naming strategy                   |
| includeSubPackages   | `boolean`                      | `true`                   | Include sub-package routes              |
| dts                  | `string \| boolean`            | `false`                  | Route type declaration file output path |
| preserveRouteChanges | `boolean`                      | `true`                   | Preserve user modifications to route configs |

> Inherits [BasePluginOptions](/factory/base-plugin-options): `enabled`, `logLevel`, `errorStrategy`

### Advanced Options

| Option              | Type                       | Default      | Description                             |
| ------------------- | -------------------------- | ------------ | --------------------------------------- |
| outputFormat        | `'ts' \| 'js'`             | `'ts'`       | Output format                           |
| customNameGenerator | `(path: string) => string` | -            | Custom name generator                   |
| watch               | `boolean`                  | `true`       | Watch for changes                       |
| metaMapping         | `Record<string, string>`   | See below    | Style to meta field mapping             |
| exportTypes         | `boolean`                  | `true`       | Export type definitions (TS)            |
| fileHeader          | `boolean`                  | `false`      | Add comment header at file top          |

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

### preserveRouteChanges Route Modification Preservation

When enabled, the plugin reads the existing file during regeneration and merges user modifications, avoiding overwriting manually added content.

**Merge Strategy:**

| Field | Behavior |
| ----- | -------- |
| `path` | Always follows `pages.json`, cannot be overridden |
| `name` | User-modified values take priority |
| `meta` | User-modified values take priority, new fields from `pages.json` are auto-added |
| Non-standard properties | User-added custom properties like `beforeEnter`, `component` are fully preserved |

**Example:** Suppose `pages.json` adds a new page, and the user has added `beforeEnter` to an existing route:

```typescript
// User-modified route config
export const routes: RouteConfig[] = [
  {
    path: '/pages/index/index',
    name: 'pagesIndexIndex',
    meta: { title: 'Custom Title' },
    beforeEnter: (to, from, next) => { next() }  // User-added guard
  }
]
```

After regeneration:

```typescript
export const routes: RouteConfig[] = [
  {
    path: '/pages/index/index',
    name: 'pagesIndexIndex',
    meta: { title: 'Custom Title', isTab: true },  // User title preserved, new isTab auto-added
    beforeEnter: (to, from, next) => { next() }     // Custom property preserved
  },
  {
    path: '/pages/new/page',                         // New page auto-generated
    name: 'pagesNewPage',
    meta: { title: 'New Page' }
  }
]
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
