# assetManifest

Automatically scan files in the output directory after Vite build and generate an asset manifest. Supports three output formats: Vite standard, Webpack-compatible, and custom. Also supports entry grouping, runtime
injection, and custom formatting.

## Import

```typescript
// Submodule import (recommended)
import { assetManifest } from '@meng-xi/vite-plugin/plugins/asset-manifest'
import type { AssetManifestOptions, ManifestOutputFormat, AssetMap, AssetGroup, AssetManifestResult, CustomFormatter } from '@meng-xi/vite-plugin/plugins/asset-manifest'

// Barrel import
import { assetManifest } from '@meng-xi/vite-plugin'
```

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { assetManifest } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [assetManifest()]
})
```

## Options

| Option           | Type                              | Default                  | Description                                                  |
| ---------------- | --------------------------------- | ------------------------ | ------------------------------------------------------------ |
| outputFormat     | `'vite' \| 'webpack' \| 'custom'` | `'vite'`                 | Manifest output format                                       |
| outputFile       | `string`                          | `'manifest.json'`        | Manifest output filename, relative to build output directory |
| publicPath       | `string`                          | `'/'`                    | Public path prefix prepended to all asset paths              |
| groupByEntry     | `boolean`                         | `false`                  | Whether to group assets by entry point                       |

> Inherits [BasePluginOptions](/factory/base-plugin-options): `enabled`, `logLevel`, `errorStrategy`

### Advanced Options

| Option            | Type                      | Default                  | Description                                                  |
| ----------------- | ------------------------- | ------------------------ | ------------------------------------------------------------ |
| includeExtensions | `string[]`                | `[]`                     | File extensions to include; empty means include all          |
| injectRuntime     | `boolean`                 | `false`                  | Whether to inject manifest as a runtime global variable      |
| runtimeGlobalName | `string`                  | `'__ASSET_MANIFEST__'`   | Runtime global variable name                                 |
| customFormatter   | `CustomFormatter \| null` | `null`                   | Custom formatter, only used when outputFormat is custom      |
| excludeExtensions | `string[]`                | `['.map', '.gz', '.br']` | File extensions to exclude; takes precedence over include    |
| excludePaths      | `string[]`                | `[]`                     | Path patterns to exclude                                     |

### Output Format (outputFormat)

| Value   | Description                                                                   |
| ------- | ----------------------------------------------------------------------------- |
| vite    | Vite standard format; keys are original paths, values are hashed output paths |
| webpack | Webpack-compatible format with entries and assets nested structure            |
| custom  | Custom format generated via customFormatter callback                          |

## Type Exports

### AssetMap

Asset mapping where keys are original asset paths and values are hashed output paths.

```typescript
interface AssetMap {
	[key: string]: string
}
```

### AssetGroup

Asset information grouped by entry point.

| Property | Type                                               | Description                    |
| -------- | -------------------------------------------------- | ------------------------------ |
| entry    | `string`                                           | Entry name                     |
| assets   | `{ js: string[], css: string[], other: string[] }` | Asset categories for the entry |

### AssetManifestResult

Vite standard format manifest output.

| Property   | Type           | Description                                                          |
| ---------- | -------------- | -------------------------------------------------------------------- |
| version    | `string`       | Manifest version, always `'1.0'`                                     |
| timestamp  | `string`       | Generation timestamp (ISO 8601 format)                               |
| publicPath | `string`       | Public path prefix                                                   |
| assets     | `AssetMap`     | Asset mapping                                                        |
| groups     | `AssetGroup[]` | Entry-grouped asset info (only present when groupByEntry is enabled) |

### WebpackManifestOutput

Webpack-compatible format manifest output.

| Property | Type                  | Description                         |
| -------- | --------------------- | ----------------------------------- |
| entries  | `WebpackEntryAsset[]` | Asset info for all entry points     |
| assets   | `AssetMap`            | Asset mapping (same as vite format) |

### WebpackEntryAsset

Entry asset info in Webpack-compatible format.

| Property | Type       | Description                             |
| -------- | ---------- | --------------------------------------- |
| name     | `string`   | Entry name                              |
| files    | `string[]` | List of output file paths for the entry |

### CustomFormatter

Custom formatter function type.

```typescript
type CustomFormatter = (manifest: AssetMap) => Record<string, any>
```

## Examples

### Basic Usage

```typescript
assetManifest()
```

### Webpack-Compatible Format

```typescript
assetManifest({
	outputFormat: 'webpack'
})
```

### Custom Output Filename

```typescript
assetManifest({
	outputFile: 'assets-manifest.json'
})
```

### Group by Entry

```typescript
assetManifest({
	groupByEntry: true
})
```

Grouping strategy:

- HTML files, JS files starting with `entry-` or `main`, and root-level JS files are identified as entries
- Chunk files sharing a directory prefix or name prefix with an entry are associated with that entry (longest match)
- Unassociated assets are placed in the `_shared` group

### Runtime Injection

Inject the manifest as a global variable, accessible at runtime via `window.__ASSET_MANIFEST__`:

```typescript
assetManifest({
	injectRuntime: true,
	runtimeGlobalName: '__ASSET_MANIFEST__'
})

// Runtime code
const manifest = window.__ASSET_MANIFEST__
console.log(manifest['assets/index.js']) // '/assets/index-abc123.js'
```

Injection characteristics:

- Uses `Object.defineProperty` to define a read-only, non-configurable global property
- Uses `Object.freeze` to freeze the mapping, preventing runtime tampering
- Escapes `</script>` in JSON strings to prevent XSS attacks

### Custom Formatter

```typescript
assetManifest({
	outputFormat: 'custom',
	customFormatter: assetMap => ({
		files: Object.keys(assetMap),
		mappings: assetMap
	})
})
```

### Custom Public Path

```typescript
assetManifest({
	publicPath: 'https://cdn.example.com/'
})
// Output: { "assets/index.js": "https://cdn.example.com/assets/index-abc123.js" }
```

### File Filtering

```typescript
assetManifest({
	includeExtensions: ['.js', '.css'],
	excludeExtensions: ['.map', '.gz', '.br', '.woff2'],
	excludePaths: ['assets/images', 'assets/fonts']
})
```

Filter priority: `excludeExtensions` > `includeExtensions` > `excludePaths`

### Production Only

```typescript
assetManifest({
	enabled: process.env.NODE_ENV === 'production'
})
```

## Output Examples

### Vite Format

```json
{
	"version": "1.0",
	"timestamp": "2026-06-07T10:30:00.000Z",
	"publicPath": "/",
	"assets": {
		"assets/index.js": "/assets/index-abc123.js",
		"assets/index.css": "/assets/index-def456.css",
		"favicon.ico": "/favicon.ico"
	}
}
```

### Webpack Format

```json
{
	"entries": [
		{
			"name": "index",
			"files": ["/assets/index-abc123.js", "/assets/index-def456.css"]
		}
	],
	"assets": {
		"assets/index.js": "/assets/index-abc123.js",
		"assets/index.css": "/assets/index-def456.css"
	}
}
```

### Entry Grouping (Vite Format + groupByEntry)

```json
{
	"version": "1.0",
	"timestamp": "2026-06-07T10:30:00.000Z",
	"publicPath": "/",
	"assets": {
		"assets/index.js": "/assets/index-abc123.js",
		"assets/about.js": "/assets/about-xyz789.js"
	},
	"groups": [
		{
			"entry": "index",
			"assets": {
				"js": ["/assets/index-abc123.js"],
				"css": [],
				"other": []
			}
		},
		{
			"entry": "about",
			"assets": {
				"js": ["/assets/about-xyz789.js"],
				"css": [],
				"other": []
			}
		}
	]
}
```

## Notes

- The plugin runs in the `writeBundle` phase (`enforce: 'post'`), ensuring scanning happens after all build artifacts are written
- Automatically excludes source maps (`.map`) and compressed files (`.gz`, `.br`)
- Automatically excludes the manifest output file itself to avoid circular references
- Extracts original key names from hashed file paths (e.g., `index-abc123.js` → `index.js`), with hash pattern being 6-20 hex characters
- When multiple files map to the same original key (key collision), the full hashed relative path is used as the key to avoid data loss
- `runtimeGlobalName` must be a valid JavaScript identifier and cannot be a built-in property (e.g., `__proto__`, `constructor`, `prototype`)
- Runtime injection is performed in `writeBundle` (not `transformIndexHtml`) because manifest data depends on scanning the output directory, which is only complete at `writeBundle` time
