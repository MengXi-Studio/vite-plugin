# generatePages

Scan Vue files and dynamically generate / update the page-related config (`pages` / `subPackages` / `tabBar`) of uni-app's `pages.json`, combined with a per-page `<route-config>` block to fully eliminate manual page configuration.

::: tip Relationship with generateRouter
`generateRouter` reads `pages.json` to generate route configs; `generatePages` works in reverse — it scans Vue files to generate `pages.json`. They can be used together or independently.
:::

## Import Methods

```typescript
// Submodule import (recommended)
import { generatePages } from '@meng-xi/vite-plugin/plugins/generate/generate-pages'

// Barrel import
import { generatePages } from '@meng-xi/vite-plugin'
```

## Quick Start

By default it scans `src/pages` as the main package and `src/pages-sub` as sub-packages, generating `src/pages.json`.

```typescript
import { defineConfig } from 'vite'
import { generatePages } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [generatePages()]
})
```

Declare title, meta, tabBar membership, etc. in a per-page `<route-config>` block:

```vue
<!-- src/pages/index/index.vue -->
<route-config>
{
  "title": "Home",
  "isTab": true,
  "tab": {
    "iconPath": "static/tab/home.png",
    "selectedIconPath": "static/tab/home-active.png"
  }
}
</route-config>
```

Generated `pages.json` fragment:

```json
{
  "pages": [
    { "path": "pages/index/index", "style": { "navigationBarTitleText": "Home" }, "meta": { "isTab": true } }
  ],
  "tabBar": {
    "color": "#999999",
    "list": [
      { "pagePath": "pages/index/index", "text": "Home", "iconPath": "static/tab/home.png", "selectedIconPath": "static/tab/home-active.png" }
    ]
  }
}
```

## Options

| Option           | Type                         | Default                                  | Description                          |
| ---------------- | ---------------------------- | ---------------------------------------- | ------------------------------------ |
| pagesJsonPath    | `string`                     | `'src/pages.json'`                       | Path to pages.json                   |
| pagesDir         | `string`                     | `'src/pages'`                            | Main package pages directory         |
| subPackages      | `SubPackageConfig[]`         | `[{ root: 'pages-sub', dir: 'src/pages-sub' }]` | Sub-package config list (skipped if directory missing) |
| routeConfigBlock | `string`                     | `'route-config'`                         | Name of the page config custom block |
| titleFallback    | `'filename' \| 'none'`       | `'filename'`                             | Fallback strategy when title is missing |
| tabBar           | `TabBarTemplate`             | -                                        | tabBar template (generated only when provided) |
| includeExtensions| `string[]`                   | `['.vue']`                               | Page file extension list             |
| excludePatterns  | `string[]`                   | `['node_modules']`                       | Path patterns to exclude             |
| watch            | `boolean`                    | `true`                                   | Watch page directories and regenerate |

> Inherits [BasePluginOptions](/en/factory/base-plugin-options): `enabled`, `logLevel`, `errorStrategy`

### subPackages

The `root` is written to `subPackages[].root`, and `dir` is the actual source directory. **`dir` should align with the directory implied by `root`** (default `src/pages-sub` ↔ `pages-sub`), otherwise uni-app won't locate the sub-package files.

```typescript
generatePages({
	subPackages: [
		{ root: 'pages-sub', dir: 'src/pages-sub' },
		{ root: 'pages-home', dir: 'src/pages-home' }
	]
})
```

## route-config Block

Declare config in a per-page `<route-config>` block; the content is JSON (comments supported).

| Field | Type | Description |
| ----- | ---- | ----------- |
| title | `string` | Page title, mapped to `style.navigationBarTitleText` |
| name | `string` | Page name, written to the `name` field of pages.json |
| style | `object` | Page style, written to the `style` field as-is |
| meta | `object` | Page meta, written to the `meta` field as-is |
| isTab | `boolean` | Whether it is a tabBar page; auto-collected into `tabBar.list` |
| tab | `TabBarItemOverride` | tabBar icon and text override |

```vue
<route-config>
{
  "title": "Detail",
  "name": "DetailPage",
  "meta": { "requireAuth": true }
}
</route-config>
```

## tabBar Generation

Once a `tabBar` template is provided, the plugin collects all `isTab: true` main-package pages (tabBar only permits main-package pages) into `list`.

```typescript
generatePages({
	tabBar: {
		color: '#999999',
		selectedColor: '#42b883',
		iconPath: 'static/tab/home.png',            // global default icon, inherited by all tabs
		selectedIconPath: 'static/tab/home-active.png',
		overrides: {                                // per-page overrides (optional)
			'pages/about/about': {
				text: 'About Us',
				iconPath: 'static/tab/about.png',
				selectedIconPath: 'static/tab/about-active.png'
			}
		}
	}
})
```

**Icon & text priority (high → low):**

1. Per-page `<route-config>.tab` declaration
2. `tabBar.overrides[pagePath]`
3. `tabBar.iconPath` / `selectedIconPath` (global template)
4. Page title / filename (as `text` fallback)

It is recommended to declare icons locally in the page; the factory only needs to provide global styles and default icons:

```vue
<!-- src/pages/mine/mine.vue -->
<route-config>
{
  "title": "Mine",
  "isTab": true,
  "tab": {
    "iconPath": "static/tab/mine.png",
    "selectedIconPath": "static/tab/mine-active.png"
  }
}
</route-config>
```

## Merge Strategy

The plugin only generates the page parts and keeps the rest:

- **Always overwrites**: `pages` (main package pages)
- **Overwrites when sub-packages present**: `subPackages`; otherwise keeps existing
- **Overwrites when template provided**: `tabBar`; otherwise keeps existing
- **Keeps as-is**: non-page fields such as `globalStyle`, `condition`, `easycom`

## Type Exports

### GeneratePagesOptions

Plugin options, see "Options" above.

### RouteConfigBlock

The page config declarable in the `<route-config>` block (`title` / `name` / `style` / `meta` / `isTab` / `tab`).

### TabBarTemplate

tabBar template (overall styles + global icons + `overrides`).

### TabBarItemOverride

Per-tab `text` / `iconPath` / `selectedIconPath` override.

### SubPackageConfig

Sub-package config: `root` (sub-package id) + `dir` (source directory).

## Examples

### Use with a conventional directory structure

```typescript
generatePages()
// Scans src/pages → pages, src/pages-sub → subPackages
```

### Custom sub-packages and tabBar

```typescript
generatePages({
	pagesDir: 'src/pages',
	subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }],
	tabBar: {
		color: '#999999',
		selectedColor: '#42b883',
		iconPath: 'static/tab.png',
		selectedIconPath: 'static/tab-active.png'
	}
})
```

## Notes

- Main-package page paths are relative to the directory of `pages.json`; sub-package page paths are relative to the sub-package directory, and the sub-package `dir` should align with the `root` directory structure
- tabBar pages are only allowed in the main package; `isTab` in sub-packages is ignored
- In dev mode, `watch: true` watches the main and sub-package directories; adding / removing / modifying pages triggers regeneration
- Generated results are stably sorted by page path, ensuring consistent `pages.json` ordering across file systems
- The first run auto-creates the directory that contains `pages.json`