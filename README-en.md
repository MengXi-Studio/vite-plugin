**English** | [中文](./README.md)

<div align="center">
	<a href="https://github.com/MengXi-Studio/vite-plugin">
		<img alt="MengXi Studio Logo" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/logo.png">
	</a>
	<br>
	<h1>@meng-xi/vite-plugin</h1>
	<p>A toolkit providing practical plugins for Vite, also a complete plugin development framework</p>

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

</div>

## Features

- **Ready to Use** - Provides 10 practical plugins covering build progress display, build artifact analysis & compression, file copying, router generation, version management, version update checking, HTML injection,
  icon injection, and global Loading state management
- **Plugin Development Framework** - Exports core components like BasePlugin, Logger, Validator for building custom Vite plugins that follow conventions
- **Common Utility Library** - Built-in Common module providing reusable utility functions for formatting, file system, compression, path handling, HTML injection, object operations, script generation, and parameter
  validation
- **Complete Lifecycle** - Supports initialization, config resolution, destroy lifecycle management with automatic hook composition
- **Type Safe** - Complete TypeScript type definitions with configuration validators ensuring parameter correctness
- **Flexible Configuration** - All plugins support detailed configuration to meet diverse scenario requirements
- **Safe Execution** - Built-in error handling strategies (throw / log / ignore) for unified exception management
- **On-demand Import** - Supports sub-path exports to reduce bundle size

## Documentation

View full documentation: [https://mengxi-studio.github.io/vite-plugin/](https://mengxi-studio.github.io/vite-plugin/)

## Installation

```bash
# npm
npm install @meng-xi/vite-plugin -D

# yarn
yarn add @meng-xi/vite-plugin -D

# pnpm
pnpm add @meng-xi/vite-plugin -D
```

## Quick Start

### Using Built-in Plugins

```typescript
import { defineConfig } from 'vite'
import { buildProgress, bundleAnalyzer, compressAssets, copyFile, generateRouter, generateVersion, versionUpdateChecker, htmlInject, faviconManager, loadingManager } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		buildProgress(),
		bundleAnalyzer({ outputFormat: 'both', sizeThreshold: 200 }),
		compressAssets({ algorithm: 'gzip' }),
		copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' }),
		generateRouter({ pagesJsonPath: 'src/pages.json', outputPath: 'src/router.config.ts' }),
		generateVersion({ format: 'datetime', outputType: 'both' }),
		versionUpdateChecker(),
		htmlInject({
			rules: [{ id: 'meta-description', content: '<meta name="description" content="My App">', position: 'head-end' }]
		}),
		faviconManager('/assets'),
		loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
	]
})
```

### Accessing Plugin Instance

All built-in plugins return an object with a `pluginInstance` property for accessing internal state:

```typescript
import type { PluginWithInstance } from '@meng-xi/vite-plugin/factory'
import type { GenerateRouterOptions } from '@meng-xi/vite-plugin'

const routerPlugin = generateRouter({ watch: true }) as PluginWithInstance<GenerateRouterOptions>
console.log(routerPlugin.pluginInstance?.options)
```

## Built-in Plugins

| Plugin               | Description                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| buildProgress        | Real-time build progress bar in terminal, supports bar / spinner / minimal                                           |
| bundleAnalyzer       | Build artifact size analysis with JSON/HTML reports, gzip calculation, threshold alerts, and build comparison        |
| compressAssets       | Compress build artifacts with gzip / brotli / both, concurrent compression and statistics report                     |
| copyFile             | Copy files or directories after build, supports incremental copying                                                  |
| generateRouter       | Auto-generate router config from pages.json (uni-app)                                                                |
| generateVersion      | Auto-generate version numbers, supports file output and global variable injection                                    |
| versionUpdateChecker | Runtime version update checking with multiple prompt styles and custom callbacks                                     |
| htmlInject           | HTML content injection with multiple positions, conditional injection, template variables, and security filtering    |
| faviconManager       | Manage website favicon links injection and file copying, supports string shorthand config                            |
| loadingManager       | Global Loading state management with request interception, debounce, transition animations, and white-screen Loading |

---

### buildProgress

Display real-time build progress bar in terminal during Vite build, supporting three display formats.

**Progress calculation logic:**

1. config phase (5%) → resolve phase (10%) → transform phase (15%-85%, by module conversion ratio) → bundle phase (+10%) → write phase (+5%) → done (100%)
2. Non-TTY terminal environments (e.g. CI/CD) automatically degrade to log output mode

| Option          | Type                                  | Default | Description                                          |
| --------------- | ------------------------------------- | ------- | ---------------------------------------------------- |
| width           | `number`                              | `30`    | Progress bar width (characters)                      |
| format          | `'bar'` \| `'spinner'` \| `'minimal'` | `'bar'` | Progress bar display format                          |
| completeChar    | `string`                              | `'█'`   | Fill character for completed portion                 |
| incompleteChar  | `string`                              | `'░'`   | Fill character for incomplete portion                |
| clearOnComplete | `boolean`                             | `true`  | Whether to clear progress bar on build completion    |
| showModuleName  | `boolean`                             | `true`  | Whether to show the currently processing module name |
| theme           | `ProgressTheme`                       | -       | Custom color theme                                   |

**ProgressTheme**

| Property        | Type                       | Description              |
| --------------- | -------------------------- | ------------------------ |
| completeColor   | `(text: string) => string` | Completed portion color  |
| incompleteColor | `(text: string) => string` | Incomplete portion color |
| percentageColor | `(text: string) => string` | Percentage number color  |
| phaseColor      | `(text: string) => string` | Phase label color        |
| moduleColor     | `(text: string) => string` | Module name color        |

```typescript
buildProgress()
buildProgress({ format: 'spinner' })
buildProgress({ format: 'minimal' })
buildProgress({ width: 40, completeChar: '■', incompleteChar: '□', clearOnComplete: false })
buildProgress({
	theme: {
		completeColor: t => `\x1b[32m${t}\x1b[39m`,
		incompleteColor: t => `\x1b[90m${t}\x1b[39m`,
		percentageColor: t => `\x1b[1m${t}\x1b[22m`,
		phaseColor: t => `\x1b[36m${t}\x1b[39m`,
		moduleColor: t => `\x1b[90m${t}\x1b[39m`
	}
})
```

---

### bundleAnalyzer

Automatically analyze build artifacts in the output directory after Vite build, generating size statistics, module rankings, file type distribution, and other key metrics, with JSON report and HTML visualization support.

**Core Features:**

- Scan build output directory, analyze chunks, modules, and asset files
- Calculate original size and gzip compressed size
- File type distribution statistics by extension
- Top N largest modules ranking
- Size threshold alerts (2x threshold marked as critical)
- Compare with previous build results and generate diff report
- HTML reports support treemap / sunburst / list visualization charts

| Option             | Type                                    | Default             | Description                                               |
| ------------------ | --------------------------------------- | ------------------- | --------------------------------------------------------- |
| outputFormat       | `'json'` \| `'html'` \| `'both'`        | `'json'`            | Report output format                                      |
| outputFile         | `string`                                | `'bundle-analysis'` | Report output filename (without extension)                |
| openAnalyzer       | `boolean`                               | `false`             | Whether to auto-open browser after generating HTML report |
| sizeThreshold      | `number`                                | `100`               | Size alert threshold (KB)                                 |
| topModules         | `number`                                | `20`                | Top N largest modules ranking count                       |
| gzipSize           | `boolean`                               | `true`              | Whether to calculate gzip size                            |
| excludeNodeModules | `boolean`                               | `false`             | Whether to exclude node_modules modules                   |
| excludePatterns    | `string[]`                              | `[]`                | File path patterns to exclude                             |
| includeExtensions  | `string[]`                              | `[]`                | File extensions to include, empty means all               |
| compareWith        | `string` \| `null`                      | `null`              | Path to previous analysis report for comparison           |
| defaultChartType   | `'treemap'` \| `'sunburst'` \| `'list'` | `'treemap'`         | Default chart type in HTML report                         |

```typescript
bundleAnalyzer()
bundleAnalyzer({ outputFormat: 'both', openAnalyzer: true })
bundleAnalyzer({ sizeThreshold: 200, topModules: 30, gzipSize: true })
bundleAnalyzer({ compareWith: 'dist/bundle-analysis.json', defaultChartType: 'sunburst' })
bundleAnalyzer({ excludeNodeModules: true, includeExtensions: ['.js', '.css'] })
```

---

### compressAssets

Automatically compress files in the output directory after Vite build, supporting both gzip and brotli compression algorithms.

| Option             | Type                               | Default                                                     | Description                                        |
| ------------------ | ---------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| algorithm          | `'gzip'` \| `'brotli'` \| `'both'` | `'gzip'`                                                    | Compression algorithm                              |
| threshold          | `number`                           | `1024`                                                      | Minimum compression threshold (bytes)              |
| deleteOriginalFile | `boolean`                          | `false`                                                     | Whether to delete original files after compression |
| includeExtensions  | `string[]`                         | `['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt']` | File extensions to compress                        |
| excludeExtensions  | `string[]`                         | `[]`                                                        | File extensions to exclude                         |
| excludePaths       | `string[]`                         | `[]`                                                        | Path prefixes to exclude                           |
| compressionLevel   | `number`                           | `9`                                                         | Gzip compression level (1-9)                       |
| brotliQuality      | `number`                           | `11`                                                        | Brotli compression quality (1-11)                  |
| reportOutput       | `string` \| `false`                | `'compress-report.json'`                                    | Compression report output path, false to skip      |
| parallelLimit      | `number`                           | `10`                                                        | Maximum concurrent file compression count          |

```typescript
compressAssets()
compressAssets({ algorithm: 'brotli' })
compressAssets({ algorithm: 'both', threshold: 2048, compressionLevel: 9, brotliQuality: 11 })
compressAssets({ deleteOriginalFile: true, reportOutput: 'compress-report.json' })
compressAssets({ includeExtensions: ['.js', '.css'], excludePaths: ['assets/images'], parallelLimit: 5 })
```

---

### copyFile

Copy files or directories to specified locations after Vite build is completed, with `enforce: 'post'`.

| Option      | Type      | Default | Description                                |
| ----------- | --------- | ------- | ------------------------------------------ |
| sourceDir   | `string`  | -       | Source directory path (required)           |
| targetDir   | `string`  | -       | Target directory path (required)           |
| overwrite   | `boolean` | `true`  | Whether to overwrite existing files        |
| recursive   | `boolean` | `true`  | Whether to recursively copy subdirectories |
| incremental | `boolean` | `true`  | Whether to enable incremental copying      |

```typescript
copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' })
copyFile({ sourceDir: 'src/static', targetDir: 'dist/static', overwrite: false, incremental: false })
```

---

### generateRouter

Automatically generate router configuration files based on uni-app project's `pages.json`.

| Option               | Type                                                      | Default                  | Description                                      |
| -------------------- | --------------------------------------------------------- | ------------------------ | ------------------------------------------------ |
| pagesJsonPath        | `string`                                                  | `'src/pages.json'`       | Path to pages.json file                          |
| outputPath           | `string`                                                  | `'src/router.config.ts'` | Output file path                                 |
| outputFormat         | `'ts'` \| `'js'`                                          | `'ts'`                   | Output file format                               |
| nameStrategy         | `'path'` \| `'camelCase'` \| `'pascalCase'` \| `'custom'` | `'camelCase'`            | Route name strategy                              |
| customNameGenerator  | `(path: string) => string`                                | -                        | Custom route name generator function             |
| includeSubPackages   | `boolean`                                                 | `true`                   | Whether to include sub-package routes            |
| watch                | `boolean`                                                 | `true`                   | Whether to watch changes and auto-regenerate     |
| metaMapping          | `Record<string, string>`                                  | -                        | Mapping from page style fields to meta           |
| exportTypes          | `boolean`                                                 | `true`                   | Whether to export type definitions               |
| preserveRouteChanges | `boolean`                                                 | `true`                   | Whether to preserve user modifications to routes |

> Default `metaMapping` is `{ navigationBarTitleText: 'title', requireAuth: 'requireAuth' }`. When `nameStrategy` is `'custom'`, `customNameGenerator` must be provided.

```typescript
generateRouter()
generateRouter({ pagesJsonPath: 'pages.json' })
generateRouter({ outputFormat: 'js', outputPath: 'src/router.config.js' })
generateRouter({ nameStrategy: 'pascalCase' })
generateRouter({ nameStrategy: 'custom', customNameGenerator: path => `route_${path.replace(/\//g, '_')}` })
generateRouter({ metaMapping: { navigationBarTitleText: 'title', requireAuth: 'requireAuth', customField: 'custom' } })
```

---

### generateVersion

Automatically generate version numbers during the Vite build process.

| Option       | Type                                                                              | Default             | Description                      |
| ------------ | --------------------------------------------------------------------------------- | ------------------- | -------------------------------- |
| format       | `'timestamp'` \| `'date'` \| `'datetime'` \| `'semver'` \| `'hash'` \| `'custom'` | `'timestamp'`       | Version number format            |
| customFormat | `string`                                                                          | -                   | Custom format template           |
| semverBase   | `string`                                                                          | `'1.0.0'`           | Semantic version base value      |
| outputType   | `'file'` \| `'define'` \| `'both'`                                                | `'file'`            | Output type                      |
| outputFile   | `string`                                                                          | `'version.json'`    | Output file path                 |
| defineName   | `string`                                                                          | `'__APP_VERSION__'` | Injected global variable name    |
| hashLength   | `number`                                                                          | `8`                 | Hash length (1-32)               |
| prefix       | `string`                                                                          | -                   | Version number prefix            |
| suffix       | `string`                                                                          | -                   | Version number suffix            |
| extra        | `Record<string, unknown>`                                                         | -                   | Additional info (JSON file only) |

**customFormat placeholders:**

| Placeholder   | Description                         | Example         |
| ------------- | ----------------------------------- | --------------- |
| `{YYYY}`      | Four-digit year                     | `2026`          |
| `{YY}`        | Two-digit year                      | `26`            |
| `{MM}`        | Two-digit month                     | `05`            |
| `{DD}`        | Two-digit day                       | `22`            |
| `{HH}`        | Two-digit hour (24h)                | `15`            |
| `{mm}`        | Two-digit minute                    | `30`            |
| `{ss}`        | Two-digit second                    | `00`            |
| `{SSS}`       | Three-digit millisecond             | `123`           |
| `{timestamp}` | Timestamp (milliseconds)            | `1779464601000` |
| `{hash}`      | Random hash                         | `a1b2c3d4`      |
| `{major}`     | Major version (requires semverBase) | `1`             |
| `{minor}`     | Minor version (requires semverBase) | `0`             |
| `{patch}`     | Patch version (requires semverBase) | `0`             |

> When `format` is `'custom'`, `customFormat` must be provided. When `outputType` is `'define'` or `'both'`, a `{defineName}_INFO` global variable is also injected, containing complete info such as version, build time,
> and timestamp.

```typescript
generateVersion()
generateVersion({ format: 'date' })
generateVersion({ format: 'semver', semverBase: '2.0.0', prefix: 'v' })
generateVersion({ format: 'custom', customFormat: '{YYYY}.{MM}.{DD}-{hash}', hashLength: 6 })
generateVersion({ outputType: 'define', defineName: '__VERSION__' })
generateVersion({ outputType: 'both', outputFile: 'build-info.json', defineName: '__BUILD_VERSION__', extra: { environment: 'production' } })
```

---

### versionUpdateChecker

Periodically check for version changes at runtime, prompting users to refresh when a new version is detected. Typically used with the `generateVersion` plugin.

**How it works:**

1. `generateVersion` generates a version file (`version.json`) or injects a global variable at build time
2. `versionUpdateChecker` periodically requests the version file at runtime and compares it with the current version
3. When a version mismatch is detected, a prompt is shown to guide the user to refresh

| Option                  | Type                                 | Default                                      | Description                                                  |
| ----------------------- | ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| versionSource           | `'define'` \| `'file'` \| `'auto'`   | `'auto'`                                     | Current version source                                       |
| defineName              | `string`                             | `'__APP_VERSION__'`                          | Global variable name in define mode                          |
| checkUrl                | `string`                             | `'/version.json'`                            | URL path for version check file                              |
| checkInterval           | `number`                             | `300000`                                     | Check interval (ms, default 5 minutes)                       |
| checkOnVisibilityChange | `boolean`                            | `true`                                       | Whether to check immediately on page visibility change       |
| enableInDev             | `boolean`                            | `false`                                      | Whether to enable in development mode                        |
| promptStyle             | `'modal'` \| `'banner'` \| `'toast'` | `'modal'`                                    | Update prompt UI style                                       |
| promptMessage           | `string`                             | `'A new version is available. Refresh now?'` | Prompt message text                                          |
| refreshButtonText       | `string`                             | `'Refresh Now'`                              | Refresh button text                                          |
| dismissButtonText       | `string`                             | `'Later'`                                    | Dismiss button text                                          |
| customPromptTemplate    | `string`                             | -                                            | Custom HTML template for the prompt UI                       |
| customStyle             | `string`                             | -                                            | Custom CSS style string                                      |
| onUpdateAvailable       | `string`                             | -                                            | Callback when new version is found (function body string)    |
| onRefresh               | `string`                             | -                                            | Callback when user chooses to refresh (function body string) |
| onDismiss               | `string`                             | -                                            | Callback when user chooses to dismiss (function body string) |

> `versionSource` explanation: `'define'` reads from global variable, `'file'` reads from version file, `'auto'` prefers define and falls back to file. Custom templates can use `{{message}}`, `{{currentVersion}}`,
> `{{newVersion}}`, `{{refreshButton}}`, `{{dismissButton}}` placeholders. Callbacks are provided as function body strings, available variables: `currentVersion`, `newVersion`.

```typescript
generateVersion({ outputType: 'both' })
versionUpdateChecker()
versionUpdateChecker({ versionSource: 'file' })
versionUpdateChecker({ checkInterval: 60000, promptStyle: 'banner' })
versionUpdateChecker({ promptStyle: 'toast' })
versionUpdateChecker({ promptMessage: 'System updated, refresh to experience new features', refreshButtonText: 'Update', dismissButtonText: 'Cancel' })
versionUpdateChecker({ onUpdateAvailable: 'console.log("New version:", newVersion); return true;', onRefresh: 'console.log("User chose refresh");', onDismiss: 'console.log("User chose dismiss");' })
versionUpdateChecker({ enableInDev: true })
```

---

### htmlInject

Inject custom content into HTML files, supporting multiple positions, selector targeting, conditional injection, template variable replacement, and security filtering.

| Option       | Type                     | Default        | Description                                 |
| ------------ | ------------------------ | -------------- | ------------------------------------------- |
| targetFile   | `string`                 | `'index.html'` | Target HTML file path or filename           |
| rules        | `InjectRule[]`           | -              | Injection rules list (required)             |
| security     | `SecurityConfig`         | -              | Security filtering config                   |
| templateVars | `Record<string, string>` | `{}`           | Global template variable mapping            |
| logInjection | `boolean`                | `true`         | Whether to output injection logs to console |

**InjectRule**

| Property             | Type                                                                                                                                  | Default    | Description                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| id                   | `string`                                                                                                                              | -          | Unique rule identifier                                    |
| content              | `string`                                                                                                                              | -          | Content to inject                                         |
| position             | `'head-start'` \| `'head-end'` \| `'body-start'` \| `'body-end'` \| `'before-selector'` \| `'after-selector'` \| `'replace-selector'` | -          | Injection position                                        |
| selector             | `string`                                                                                                                              | -          | Selector string (required for selector-related positions) |
| selectorMatch        | `'string'` \| `'regex'`                                                                                                               | `'string'` | Selector match mode                                       |
| priority             | `number`                                                                                                                              | `100`      | Rule priority, lower values execute first                 |
| condition            | `InjectCondition`                                                                                                                     | -          | Injection condition                                       |
| templateVars         | `Record<string, string>`                                                                                                              | -          | Rule-level template variables (override global)           |
| allowScriptInjection | `boolean`                                                                                                                             | `false`    | Whether to allow injecting scripts and dangerous content  |

**InjectCondition**

| Property | Type                                       | Default | Description                            |
| -------- | ------------------------------------------ | ------- | -------------------------------------- |
| type     | `'env'` \| `'file-contains'` \| `'custom'` | -       | Condition type                         |
| value    | `string` \| `(...args: any[]) => boolean`  | -       | Condition value                        |
| negate   | `boolean`                                  | `false` | Whether to negate the condition result |

**SecurityConfig**

| Property                 | Type       | Default | Description                                           |
| ------------------------ | ---------- | ------- | ----------------------------------------------------- |
| blockDangerousTags       | `boolean`  | `true`  | Whether to block dangerous tags (script, etc.)        |
| blockDangerousAttributes | `boolean`  | `true`  | Whether to block dangerous attributes (onclick, etc.) |
| allowedTags              | `string[]` | -       | Whitelist of allowed tags                             |
| blockedTags              | `string[]` | -       | Custom blocked tags list                              |
| blockedAttributes        | `string[]` | -       | Custom blocked attributes list                        |

```typescript
htmlInject({
	rules: [
		{ id: 'meta-description', content: '<meta name="description" content="My App">', position: 'head-end' },
		{ id: 'analytics', content: '<script src="https://analytics.example.com/track.js"></script>', position: 'body-end', allowScriptInjection: true },
		{ id: 'env-var', content: '<script>window.__ENV__ = "{{env}}"</script>', position: 'head-end', templateVars: { env: 'production' }, allowScriptInjection: true },
		{ id: 'before-app', content: '<div>Before App</div>', position: 'before-selector', selector: '<div id="app">' },
		{ id: 'prod-only', content: '<meta name="robots" content="noindex">', position: 'head-end', condition: { type: 'env', value: 'PRODUCTION' } }
	]
})
```

---

### faviconManager

Manage website favicon links injection into HTML files, supports icon file copying, supports string shorthand config.

| Option      | Type          | Default | Description                                            |
| ----------- | ------------- | ------- | ------------------------------------------------------ |
| base        | `string`      | `'/'`   | Base path for icon files                               |
| url         | `string`      | -       | Complete icon URL (overrides base + favicon.ico)       |
| link        | `string`      | -       | Custom complete link tag HTML (highest priority)       |
| icons       | `Icon[]`      | -       | Custom icon array, supports multiple formats and sizes |
| copyOptions | `CopyOptions` | -       | Icon file copying config                               |

**Icon**

| Property | Type     | Description        |
| -------- | -------- | ------------------ |
| rel      | `string` | Icon relation type |
| href     | `string` | Icon URL           |
| sizes    | `string` | Icon sizes         |
| type     | `string` | Icon MIME type     |

**CopyOptions**

| Property  | Type      | Default | Description                         |
| --------- | --------- | ------- | ----------------------------------- |
| sourceDir | `string`  | -       | Icon source directory (required)    |
| targetDir | `string`  | -       | Icon target directory (required)    |
| overwrite | `boolean` | `true`  | Whether to overwrite existing files |
| recursive | `boolean` | `true`  | Whether to copy recursively         |

```typescript
faviconManager('/assets')
faviconManager({ base: '/assets', url: '/assets/favicon.ico' })
faviconManager({
	base: '/assets',
	icons: [
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
	]
})
faviconManager({
	base: '/assets',
	copyOptions: { sourceDir: 'src/assets/icons', targetDir: 'dist/assets/icons' }
})
```

---

### loadingManager

Global Loading state management with request interception, debounce, transition animations, and white-screen Loading.

| Option         | Type               | Default                 | Description                                                   |
| -------------- | ------------------ | ----------------------- | ------------------------------------------------------------- |
| position       | `LoadingPosition`  | `'center'`              | Loading display position                                      |
| defaultText    | `string`           | `'Loading...'`          | Default display text                                          |
| spinnerType    | `SpinnerType`      | `'spinner'`             | Spinner icon type                                             |
| style          | `LoadingStyle`     | -                       | Custom style config                                           |
| transition     | `TransitionConfig` | -                       | Transition animation config                                   |
| minDisplayTime | `MinDisplayTime`   | -                       | Minimum display time config                                   |
| delayShow      | `DelayShow`        | -                       | Delay show config                                             |
| debounceHide   | `DebounceHide`     | -                       | Debounce hide config                                          |
| autoBind       | `AutoBindMode`     | `'none'`                | Auto-bind request interception mode                           |
| requestFilter  | `RequestFilter`    | -                       | Request filter config                                         |
| globalName     | `string`           | `'__LOADING_MANAGER__'` | Injected global variable name                                 |
| customTemplate | `string`           | -                       | Custom Loading HTML template                                  |
| defaultVisible | `boolean`          | `false`                 | Loading DOM initial visibility (white-screen Loading)         |
| autoHideOn     | `AutoHideOn`       | `'DOMContentLoaded'`    | Auto-hide timing (only effective when defaultVisible is true) |
| callbacks      | `LoadingCallbacks` | -                       | Lifecycle callbacks                                           |

**LoadingPosition**: `'center'` | `'top'` | `'bottom'`

**SpinnerType**: `'spinner'` | `'dots'` | `'pulse'` | `'bar'`

**AutoBindMode**: `'fetch'` | `'xhr'` | `'all'` | `'none'`

**AutoHideOn**: `'DOMContentLoaded'` | `'load'` | `'manual'`

**LoadingStyle**

| Property           | Type      | Default                   | Description                              |
| ------------------ | --------- | ------------------------- | ---------------------------------------- |
| overlayColor       | `string`  | `'rgba(255,255,255,0.7)'` | Overlay background color                 |
| spinnerColor       | `string`  | `'#4361ee'`               | Loading icon color                       |
| spinnerSize        | `string`  | `'40px'`                  | Loading icon size                        |
| textColor          | `string`  | `'#333'`                  | Text color                               |
| textSize           | `string`  | `'14px'`                  | Text size                                |
| customClass        | `string`  | -                         | Custom CSS class name                    |
| customStyle        | `string`  | -                         | Custom inline style string               |
| zIndex             | `number`  | `9999`                    | Overlay z-index                          |
| pointerEvents      | `boolean` | `true`                    | Whether to enable overlay pointer events |
| backdropBlur       | `boolean` | `false`                   | Whether to enable backdrop blur          |
| backdropBlurAmount | `number`  | `4`                       | Backdrop blur amount (px)                |

**TransitionConfig**

| Property | Type      | Default      | Description                    |
| -------- | --------- | ------------ | ------------------------------ |
| enabled  | `boolean` | `true`       | Whether to enable transition   |
| duration | `number`  | `200`        | Transition duration (ms)       |
| easing   | `string`  | `'ease-out'` | CSS transition easing function |

**MinDisplayTime**

| Property | Type      | Default | Description                            |
| -------- | --------- | ------- | -------------------------------------- |
| enabled  | `boolean` | `true`  | Whether to enable minimum display time |
| duration | `number`  | `300`   | Minimum display time (ms)              |

**DelayShow**

| Property | Type      | Default | Description                                                     |
| -------- | --------- | ------- | --------------------------------------------------------------- |
| enabled  | `boolean` | `true`  | Whether to enable delay show                                    |
| duration | `number`  | `200`   | Delay time (ms), requests completed within this time won't show |

**DebounceHide**

| Property | Type      | Default | Description                     |
| -------- | --------- | ------- | ------------------------------- |
| enabled  | `boolean` | `false` | Whether to enable debounce hide |
| duration | `number`  | `100`   | Debounce wait time (ms)         |

**RequestFilter**

| Property           | Type       | Description                    |
| ------------------ | ---------- | ------------------------------ |
| excludeUrls        | `RegExp[]` | URL regex patterns to exclude  |
| includeUrls        | `RegExp[]` | URL regex patterns to include  |
| excludeMethods     | `string[]` | HTTP methods to exclude        |
| excludeUrlPrefixes | `string[]` | URL string prefixes to exclude |

**LoadingCallbacks**

| Property     | Type     | Description                                              |
| ------------ | -------- | -------------------------------------------------------- |
| onBeforeShow | `string` | Before show callback (`return false` to prevent showing) |
| onShow       | `string` | After show callback                                      |
| onBeforeHide | `string` | Before hide callback (`return false` to prevent hiding)  |
| onHide       | `string` | After hide callback                                      |
| onDestroy    | `string` | On destroy callback                                      |

> Callbacks are provided as function body strings because they need to be injected into client-side code. `customTemplate` must contain an element with the `data-loading-text` attribute for text display.

**Runtime API:**

```typescript
window.__LOADING_MANAGER__.show('Loading...')
window.__LOADING_MANAGER__.hide()
window.__LOADING_MANAGER__.forceHide()
window.__LOADING_MANAGER__.toggle('Loading...')
window.__LOADING_MANAGER__.updateText('Processing...')
window.__LOADING_MANAGER__.isVisible()
window.__LOADING_MANAGER__.getPendingCount()
window.__LOADING_MANAGER__.enablePointerEvents()
window.__LOADING_MANAGER__.disablePointerEvents()
window.__LOADING_MANAGER__.destroy()
```

```typescript
loadingManager()
loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
loadingManager({ position: 'top', defaultText: 'Please wait...', spinnerType: 'dots' })
loadingManager({ autoBind: 'fetch', requestFilter: { excludeUrls: [/\/api\/health/] } })
loadingManager({
	style: { overlayColor: 'rgba(0,0,0,0.5)', spinnerColor: '#ff6b6b', backdropBlur: true, backdropBlurAmount: 6 }
})
loadingManager({ transition: { enabled: true, duration: 300, easing: 'cubic-bezier(0.4,0,0.2,1)' } })
loadingManager({ debounceHide: { enabled: true, duration: 100 } })
loadingManager({ callbacks: { onShow: 'console.log("shown")', onBeforeShow: 'return true' } })
loadingManager({ customTemplate: '<div class="my-loader"><span data-loading-text></span></div>' })
loadingManager({ defaultVisible: true, autoHideOn: 'manual' })
```

---

## Plugin Development Framework

This package not only provides built-in plugins but also exports a complete plugin development framework to help quickly build custom Vite plugins that follow conventions.

### BasePlugin

The base class for all built-in plugins, providing core capabilities such as configuration management, logging, error handling, and lifecycle management.

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin'
import type { Plugin } from 'vite'

interface MyPluginOptions {
	prefix?: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getPluginName() {
		return 'my-plugin'
	}

	protected getDefaultOptions() {
		return { prefix: '[app]' }
	}

	protected validateOptions() {
		this.validator.field('prefix').string().notEmpty().validate()
	}

	protected addPluginHooks(plugin: Plugin) {
		plugin.writeBundle = {
			order: 'post',
			handler: async () => {
				await this.safeExecute(async () => {
					this.logger.info('Plugin executing...')
				}, 'Execute custom logic')
			}
		}
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

**BasePlugin Core Methods:**

| Method              | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `getDefaultOptions` | Returns plugin default config, can be overridden by subclasses |
| `validateOptions`   | Validates user config, can be overridden by subclasses         |
| `getPluginName`     | Returns plugin name (abstract method, must be implemented)     |
| `getEnforce`        | Returns plugin execution timing (pre / post / undefined)       |
| `addPluginHooks`    | Registers Vite hooks (abstract method, must be implemented)    |
| `onConfigResolved`  | Config resolution complete callback                            |
| `destroy`           | Plugin destroy callback                                        |
| `safeExecute`       | Safely execute async function with automatic error handling    |
| `safeExecuteSync`   | Safely execute sync function with automatic error handling     |
| `handleError`       | Handle errors based on errorStrategy                           |
| `toPlugin`          | Convert to Vite plugin object                                  |

**BasePluginOptions Base Config:**

| Option        | Type                               | Default   | Description             |
| ------------- | ---------------------------------- | --------- | ----------------------- |
| enabled       | `boolean`                          | `true`    | Whether to enable       |
| verbose       | `boolean`                          | `true`    | Whether to log          |
| errorStrategy | `'throw'` \| `'log'` \| `'ignore'` | `'throw'` | Error handling strategy |

### createPluginFactory

Creates a plugin factory function that converts a BasePlugin subclass into a directly usable Vite plugin function.

```typescript
import { createPluginFactory } from '@meng-xi/vite-plugin'

const myPlugin = createPluginFactory(MyPlugin)

// Supports options normalizer (e.g. string shorthand config)
const myPluginWithNormalizer = createPluginFactory(MyPlugin, opt => (typeof opt === 'string' ? { prefix: opt } : opt))
```

### Logger

Global singleton log manager, providing independent log proxies for each plugin.

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'

const logger = Logger.create({ name: 'my-plugin', enabled: true })
logger.info('Info log')
logger.success('Success log')
logger.warn('Warning log')
logger.error('Error log')
```

### Validator

Chain-style configuration validator for validating plugin configuration parameters.

```typescript
import { Validator } from '@meng-xi/vite-plugin/common/validation'

const validator = new Validator(myOptions)
validator.field('port').number().minValue(1).maxValue(65535).field('host').string().notEmpty().field('mode').enum(['development', 'production']).validate()
```

---

## Common Utility Modules

Built-in general-purpose utility function library, organized by functional modules, supporting on-demand sub-path imports.

### Import Methods

```typescript
// Import all utilities
import { formatFileSize, scanDirectory } from '@meng-xi/vite-plugin/common'

// Import by module
import { formatFileSize } from '@meng-xi/vite-plugin/common/format'
import { scanDirectory, writeJsonReport } from '@meng-xi/vite-plugin/common/fs'
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'
import { isNodeModule } from '@meng-xi/vite-plugin/common/path'
```

### Module List

| Sub-path                                 | Description             |
| ---------------------------------------- | ----------------------- |
| `@meng-xi/vite-plugin/common/compress`   | Compression utilities   |
| `@meng-xi/vite-plugin/common/format`     | Formatting utilities    |
| `@meng-xi/vite-plugin/common/fs`         | File system utilities   |
| `@meng-xi/vite-plugin/common/html`       | HTML injection utils    |
| `@meng-xi/vite-plugin/common/object`     | Object operation utils  |
| `@meng-xi/vite-plugin/common/path`       | Path handling utils     |
| `@meng-xi/vite-plugin/common/script`     | Script generation utils |
| `@meng-xi/vite-plugin/common/validation` | Validation utilities    |

### compress — Compression

| Function            | Description                                          |
| ------------------- | ---------------------------------------------------- |
| `calculateGzipSize` | Calculate gzip compressed size of given data (bytes) |

```typescript
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'

const size = await calculateGzipSize(Buffer.from('hello world'))
```

### format — Formatting

| Function              | Description                                        |
| --------------------- | -------------------------------------------------- |
| `formatFileSize`      | Format bytes to human-readable file size string    |
| `getExtension`        | Get file extension (lowercase)                     |
| `formatDate`          | Format date                                        |
| `parseTemplate`       | Parse template string, replace placeholders        |
| `toCamelCase`         | Convert string to camelCase                        |
| `toPascalCase`        | Convert string to PascalCase                       |
| `padNumber`           | Pad number with leading zeros                      |
| `generateRandomHash`  | Generate random hash string                        |
| `getDateFormatParams` | Get date formatting parameters                     |
| `stripJsonComments`   | Remove comments from JSON string                   |
| `escapeHtmlAttr`      | Escape special characters in HTML attribute values |

```typescript
import { formatFileSize, formatDate, toCamelCase } from '@meng-xi/vite-plugin/common/format'

formatFileSize(2461726) // '2.35MB'
formatDate(new Date(), '{YYYY}-{MM}-{DD}') // '2026-05-31'
toCamelCase('pages/user/profile') // 'pagesUserProfile'
```

### fs — File System

| Function             | Description                                   |
| -------------------- | --------------------------------------------- |
| `scanDirectory`      | Recursively scan directory, collect file info |
| `writeJsonReport`    | Write data to JSON file                       |
| `writeFileContent`   | Write file content                            |
| `readFileContent`    | Read file content                             |
| `fileExists`         | Check if file exists                          |
| `checkSourceExists`  | Check if source file exists                   |
| `ensureTargetDir`    | Create target directory                       |
| `copySourceToTarget` | Execute file copy operation                   |
| `runWithConcurrency` | Batch execution with concurrency limit        |

```typescript
import { scanDirectory, writeJsonReport } from '@meng-xi/vite-plugin/common/fs'

const files = await scanDirectory('dist', {
	includeExtensions: ['.js', '.css'],
	excludePatterns: ['node_modules'],
	filter: (filePath, ext, size) => size > 1024
})

await writeJsonReport('dist/report.json', { timestamp: Date.now(), files })
```

### html — HTML Injection

| Function                      | Description                              |
| ----------------------------- | ---------------------------------------- |
| `injectBeforeTag`             | Inject code before specified closing tag |
| `injectHtmlByPriority`        | Inject code into HTML by priority        |
| `injectBeforeTagWithFallback` | Inject code with fallback strategy       |
| `injectHeadAndBody`           | Dual-zone HTML injection (head + body)   |

```typescript
import { injectBeforeTag, injectHeadAndBody } from '@meng-xi/vite-plugin/common/html'

const result = injectBeforeTag(html, '</head>', '<style>body{margin:0}</style>')
const dual = injectHeadAndBody(html, '<style>...</style>', '<script>...</script>')
```

### object — Object Operations

| Function    | Description        |
| ----------- | ------------------ |
| `deepMerge` | Deep merge objects |

```typescript
import { deepMerge } from '@meng-xi/vite-plugin/common/object'

deepMerge({ a: { b: 1 } }, { a: { c: 2 } }) // { a: { b: 1, c: 2 } }
```

### path — Path Handling

| Function       | Description                             |
| -------------- | --------------------------------------- |
| `isNodeModule` | Check if module ID is from node_modules |

```typescript
import { isNodeModule } from '@meng-xi/vite-plugin/common/path'

isNodeModule('node_modules/lodash/index.js') // true
isNodeModule('src/utils/helper.ts') // false
```

### script — Script Generation

| Function                 | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `makeCallback`           | Wrap callback function body string as safe function expression |
| `containsScriptTag`      | Detect if string contains `<script>` tag                       |
| `validateIdentifierName` | Validate if string is a valid JS identifier                    |

```typescript
import { makeCallback, validateIdentifierName } from '@meng-xi/vite-plugin/common/script'

makeCallback('console.log("done")')
// 'function() { try { console.log("done") } catch(e) { console.error("[callback] error:", e); } }'

validateIdentifierName('__APP_VERSION__') // passes
```

### validation — Validation

| Function                     | Description                         |
| ---------------------------- | ----------------------------------- |
| `Validator`                  | Chain-style configuration validator |
| `validateGlobalName`         | Validate global variable name       |
| `validateNoScriptInTemplate` | Validate no script tag in template  |
| `validateCallbackFields`     | Validate callback function fields   |
| `validateNonNegativeNumber`  | Validate non-negative number        |
| `validateNestedDuration`     | Validate nested duration config     |
| `validateEnumValue`          | Validate enum value                 |

```typescript
import { Validator } from '@meng-xi/vite-plugin/common/validation'

const validator = new Validator(options)
validator.field('port').number().minValue(1).maxValue(65535).validate()
```

---

## Sub-path Exports

| Sub-path                                              | Description                          |
| ----------------------------------------------------- | ------------------------------------ |
| `@meng-xi/vite-plugin`                                | Main entry (all plugins + framework) |
| `@meng-xi/vite-plugin/factory`                        | Plugin development framework         |
| `@meng-xi/vite-plugin/logger`                         | Log manager                          |
| `@meng-xi/vite-plugin/plugins`                        | All plugins                          |
| `@meng-xi/vite-plugin/common`                         | All utility functions                |
| `@meng-xi/vite-plugin/common/compress`                | Compression utilities                |
| `@meng-xi/vite-plugin/common/format`                  | Formatting utilities                 |
| `@meng-xi/vite-plugin/common/fs`                      | File system utilities                |
| `@meng-xi/vite-plugin/common/html`                    | HTML injection utilities             |
| `@meng-xi/vite-plugin/common/object`                  | Object operation utilities           |
| `@meng-xi/vite-plugin/common/path`                    | Path handling utilities              |
| `@meng-xi/vite-plugin/common/script`                  | Script generation utilities          |
| `@meng-xi/vite-plugin/common/validation`              | Validation utilities                 |
| `@meng-xi/vite-plugin/plugins/build-progress`         | buildProgress plugin                 |
| `@meng-xi/vite-plugin/plugins/bundle-analyzer`        | bundleAnalyzer plugin                |
| `@meng-xi/vite-plugin/plugins/compress-assets`        | compressAssets plugin                |
| `@meng-xi/vite-plugin/plugins/copy-file`              | copyFile plugin                      |
| `@meng-xi/vite-plugin/plugins/favicon-manager`        | faviconManager plugin                |
| `@meng-xi/vite-plugin/plugins/generate-router`        | generateRouter plugin                |
| `@meng-xi/vite-plugin/plugins/generate-version`       | generateVersion plugin               |
| `@meng-xi/vite-plugin/plugins/html-inject`            | htmlInject plugin                    |
| `@meng-xi/vite-plugin/plugins/loading-manager`        | loadingManager plugin                |
| `@meng-xi/vite-plugin/plugins/version-update-checker` | versionUpdateChecker plugin          |

---

## License

[MIT](LICENSE)
