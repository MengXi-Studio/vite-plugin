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
| exportTypes         | `boolean`                  | `true`       | Export type definitions (TS)       |
| headerTemplate      | `boolean \| string`        | `false`      | File header comment template       |
| customFields        | `Record<string, string>`   | `{}`         | Custom field key-value pairs       |

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

### name Property in pages.json

The `name` field in a page configuration object in `pages.json` is used directly as the route name, and takes **priority over `nameStrategy` auto-generation**.

```json
{
  "pages": [
    {
      "path": "pages/user/profile",
      "name": "UserProfile",
      "style": { "navigationBarTitleText": "Profile" }
    }
  ]
}
```

In the above configuration, the route name is `'UserProfile'` instead of the auto-generated `'pagesUserProfile'` from `nameStrategy`.

### meta Object in pages.json

The `meta` field in a page configuration object in `pages.json` is directly merged into the route's `meta`, and takes **priority over `metaMapping`**.

```json
{
  "pages": [
    {
      "path": "pages/user/profile",
      "style": { "navigationBarTitleText": "Profile" },
      "meta": { "requireAuth": true, "customField": "value" }
    }
  ]
}
```

In the above configuration, `meta.requireAuth` and `meta.customField` are written directly to the route meta, while `style.navigationBarTitleText` is mapped to `title` via `metaMapping`. When both have the same field name, the `meta` object value takes priority.

### preserveRouteChanges Route Modification Preservation

When enabled, the plugin reads the existing file during regeneration and merges user modifications, avoiding overwriting manually added content.

**Merge Strategy:**

| Field | Behavior |
| ----- | -------- |
| `path` | Always follows `pages.json`, cannot be overridden |
| `name` | Always follows `pages.json` (`pageConfig.name` or `nameStrategy` auto-generation) |
| `meta` | Fields generated from `pages.json` always use new values, user custom fields are preserved |
| Non-standard properties | User-added custom properties like `beforeEnter`, `component` are fully preserved |

**Example:** Suppose `pages.json` has updated the page title, and the user has added `beforeEnter` to an existing route:

```typescript
// User-modified route config
export const routes: RouteConfig[] = [
  {
    path: '/pages/index/index',
    name: 'pagesIndexIndex',
    meta: { title: 'Custom Title', customField: 'value' },
    beforeEnter: (to, from, next) => { next() }  // User-added guard
  }
]
```

After regeneration (`navigationBarTitleText` in `pages.json` has been changed to "Home"):

```typescript
export const routes: RouteConfig[] = [
  {
    path: '/pages/index/index',
    name: 'pagesIndexIndex',
    meta: { title: 'Home', isTab: true, customField: 'value' },  // title synced from pages.json, customField preserved
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

### Add File Header Comment

```typescript
// Use default template ({name} {date} {version})
generateRouter({ headerTemplate: true })
// Generates: /**
//  * generate-router 2026-06-23 14:30:00 0.2.4
//  */

// Custom date format
generateRouter({ headerTemplate: '{name} {date:YYYY-MM-DD} {version}' })
// Generates: /**
//  * generate-router 2026-06-23 0.2.4
//  */

// Custom fields
generateRouter({
  headerTemplate: '{name} {custom:author} {date} {version}',
  customFields: { author: 'MengXi Studio' }
})
// Generates: /**
//  * generate-router MengXi Studio 2026-06-23 14:30:00 0.2.4
//  */
```

**Placeholder Reference:**

| Placeholder | Replacement | Example |
|-------------|-------------|---------|
| `{name}` | Plugin name | `generate-router` |
| `{date}` | Generation datetime (default format `YYYY-MM-DD HH:mm:ss`) | `2026-06-23 14:30:00` |
| `{date:format}` | Datetime in specified format | `{date:YYYY-MM-DD}` → `2026-06-23` |
| `{version}` | Plugin version | `0.2.4` |
| `{custom:key}` | Custom field, value from `customFields` | `{custom:author}` → `MengXi Studio` |

## Output Example

```typescript
export interface RouteMeta {
	title?: string
	isTab?: boolean
	requireAuth?: boolean
	[key: string]: any
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
