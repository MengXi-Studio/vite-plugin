# generateUni

**Composite entry plugin**: orchestrates "scan pages → generate `pages.json`" and "read `pages.json` → generate route config" into a single pipeline, completing both uni-app page config and route config generation with **in-memory data passing (no disk round-trip)**.

::: tip Relationship with generatePages / generateRouter
`generateUni` is equivalent to using `generatePages` + `generateRouter` together, but the two phases are chained through **in-memory pages data**, avoiding the intermediate "write to disk then read back" round-trip. The two original plugins remain unchanged and can still be used independently.
:::

## Import Methods

```typescript
// Submodule import (recommended)
import { generateUni } from '@meng-xi/vite-plugin/plugins/generate/generate-uni'

// Barrel import
import { generateUni } from '@meng-xi/vite-plugin'
```

## Quick Start

Top-level options configure the shared `pagesJsonPath` and `watch`; the `pages` sub-object holds Phase 1 (page generation) options and the `router` sub-object holds Phase 2 (route generation) options.

```typescript
import { defineConfig } from 'vite'
import { generateUni } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateUni({
			pagesJsonPath: 'src/pages.json',
			pages: {
				pagesDir: 'src/pages',
				subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }],
				entryPage: 'pages/index/index',
				tabBar: { color: '#999999', selectedColor: '#42b883' }
			},
			router: {
				outputPath: 'src/router.config.ts',
				nameStrategy: 'camelCase',
				dts: 'src/router.d.ts'
			}
		})
	]
})
```

Page config is still declared per-page via the `<route-config>` block, exactly the same as `generatePages`:

```vue
<!-- src/pages/index/index.vue -->
<route-config>
{
  "title": "首页",
  "isTab": true,
  "tab": { "order": 0 }
}
</route-config>
```

## Configuration Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| pagesJsonPath | `string` | `'src/pages.json'` | pages.json file path (shared by both phases) |
| watch | `boolean` | `true` | Watch page directories and re-run the whole pipeline on change |
| pages | [`GeneratePagesOptions`](/en/plugins/generate-pages) | - | Phase 1 options: scan pages + `<route-config>` to generate pages.json (`pagesDir` / `subPackages` / `routeConfigBlock` / `entryPage` / `titleFallback` / `tabBar` / `includeExtensions` / `excludePatterns`) |
| router | [`GenerateRouterOptions`](/en/plugins/generate-router) | - | Phase 2 options: generate route config from pages.json (`outputPath` / `outputFormat` / `nameStrategy` / `metaMapping` / `exportTypes` / `preserveRouteChanges` / `headerTemplate` / `customFields` / `dts` / `includeSubPackages`) |

> Extends [BasePluginOptions](/en/factory/base-plugin-options): `enabled`, `logLevel`, `errorStrategy`

The `pages` / `router` sub-objects support **all options** of the corresponding standalone plugins. See [generatePages](/en/plugins/generate-pages) and [generateRouter](/en/plugins/generate-router) for details.

## Pipeline

```
generateUni(options)
   │
   ├─ Phase 1 (pages)
   │    scan page dirs + <route-config> ──► in-memory pages data (pages/subPackages/tabBar)
   │    merge existing pages.json (preserve non-page fields like globalStyle) ──► write pages.json
   │                      │
   │                      └──► in-memory pages object (passed directly, no re-read)
   ▼
   ├─ Phase 2 (router)
        parsePagesJson(pages object) ──► routes
        mergeRoutes (preserve user changes) ──► router.config.ts (+ optional dts)
```

- `pages.json` is still written to disk (`uni()` and the build pipeline need the file), but Phase 2 consumes the in-memory pages object directly without re-reading from disk
- A single `watch` listens to the page directories; on change it **serially** re-runs "Phase 1 + Phase 2" to avoid concurrent read/write races
- Virtual module requests for the `<route-config>` block are intercepted and replaced with an empty module, so the build won't try to parse them as JavaScript

## Migration from Two Plugins

Configs previously using `generatePages` + `generateRouter` can be equivalently replaced with `generateUni`:

```typescript
// Before
generatePages({ pagesDir: 'src/pages', entryPage: 'pages/index/index', tabBar: {...} }),
generateRouter({ outputPath: 'src/router.config.ts', nameStrategy: 'camelCase', dts: true })

// After
generateUni({
	pages: { pagesDir: 'src/pages', entryPage: 'pages/index/index', tabBar: {...} },
	router: { outputPath: 'src/router.config.ts', nameStrategy: 'camelCase', dts: true }
})
```

## Notes

- Top-level `pagesJsonPath` / `watch` override the same-named options inside the `pages` sub-object
- In dev mode the plugin watches main package and sub-package page directories; adding / removing / modifying pages automatically regenerates `pages.json` and the route config
- Phase 2 behaves exactly like `generateRouter`, including `preserveRouteChanges` to keep user modifications
