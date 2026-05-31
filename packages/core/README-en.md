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

- **Ready to Use** - Provides 9 practical plugins covering build progress display, build artifact compression, file copying, router generation, version management, version update checking, HTML injection, icon injection,
  and global Loading state management
- **Plugin Development Framework** - Exports core components like BasePlugin, Logger, Validator for building custom Vite plugins
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
import { buildProgress, compressAssets, copyFile, generateRouter, generateVersion, versionUpdateChecker, htmlInject, faviconManager, loadingManager } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		buildProgress(),
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

| Plugin               | Description                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| buildProgress        | Real-time build progress bar in terminal, supports bar / spinner / minimal                                        |
| compressAssets       | Compress build artifacts with gzip / brotli / both, concurrent compression and statistics report                  |
| copyFile             | Copy files or directories after build, supports incremental copying                                               |
| generateRouter       | Auto-generate router config from pages.json (uni-app)                                                             |
| generateVersion      | Auto-generate version numbers, supports file output and global variable injection                                 |
| versionUpdateChecker | Runtime version update checking with multiple prompt styles and custom callbacks                                  |
| htmlInject           | HTML content injection with multiple positions, conditional injection, template variables, and security filtering |
| faviconManager       | Manage website favicon links injection into HTML files, supports string shorthand config                          |
| loadingManager       | Global Loading state management with request interception and white-screen Loading                                |

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

Periodically check for version changes at runtime and prompt users to refresh when a new version is detected. Typically used in conjunction with the `generateVersion` plugin.

**How it works:**

1. `generateVersion` generates a version file (`version.json`) or injects a global variable at build time
2. `versionUpdateChecker` periodically requests the version file at runtime and compares it with the current version
3. When a version mismatch is detected, a prompt is shown to guide the user to refresh

| Option                  | Type                                 | Default                                                        | Description                                                  |
| ----------------------- | ------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------ |
| versionSource           | `'define'` \| `'file'` \| `'auto'`   | `'auto'`                                                       | Current version source                                       |
| defineName              | `string`                             | `'__APP_VERSION__'`                                            | Global variable name in define mode                          |
| checkUrl                | `string`                             | `'/version.json'`                                              | URL path for version check file                              |
| checkInterval           | `number`                             | `300000`                                                       | Check interval in milliseconds (default 5 minutes)           |
| checkOnVisibilityChange | `boolean`                            | `true`                                                         | Whether to check immediately on page visibility change       |
| enableInDev             | `boolean`                            | `false`                                                        | Whether to enable in development mode                        |
| promptStyle             | `'modal'` \| `'banner'` \| `'toast'` | `'modal'`                                                      | Update prompt UI style                                       |
| promptMessage           | `string`                             | `'A new version is available. Refresh now to get the latest?'` | Prompt message text                                          |
| refreshButtonText       | `string`                             | `'Refresh'`                                                    | Refresh button text                                          |
| dismissButtonText       | `string`                             | `'Later'`                                                      | Dismiss button text                                          |
| customPromptTemplate    | `string`                             | -                                                              | Custom HTML template for the prompt UI                       |
| customStyle             | `string`                             | -                                                              | Custom CSS style string                                      |
| onUpdateAvailable       | `string`                             | -                                                              | Callback when new version is found (function body string)    |
| onRefresh               | `string`                             | -                                                              | Callback when user chooses to refresh (function body string) |
| onDismiss               | `string`                             | -                                                              | Callback when user chooses to dismiss (function body string) |

> `versionSource` explanation: `'define'` reads from global variable, `'file'` reads from version file, `'auto'` prefers define and falls back to file. Custom templates can use `{{message}}`, `{{currentVersion}}`,
> `{{newVersion}}`, `{{refreshButton}}`, `{{dismissButton}}` placeholders. Callbacks are provided as function body strings with available variables: `currentVersion`, `newVersion`.

```typescript
generateVersion({ outputType: 'both' })
versionUpdateChecker()
versionUpdateChecker({ versionSource: 'file' })
versionUpdateChecker({ checkInterval: 60000, promptStyle: 'banner' })
versionUpdateChecker({ promptStyle: 'toast' })
versionUpdateChecker({ promptMessage: 'System updated, refresh to experience new features', refreshButtonText: 'Update', dismissButtonText: 'Cancel' })
versionUpdateChecker({ onUpdateAvailable: 'console.log("New version:", newVersion); return true;', onRefresh: 'console.log("User chose to refresh");', onDismiss: 'console.log("User chose to dismiss");' })
versionUpdateChecker({ enableInDev: true })
```

---

### htmlInject

Inject HTML content into target files during Vite build based on configurable rules, supporting multiple injection positions, conditional injection, template variable substitution, and security filtering.

**Injection positions:**

| Position           | Description                                |
| ------------------ | ------------------------------------------ |
| `head-start`       | Inject after the `<head>` tag opening      |
| `head-end`         | Inject before the `</head>` closing tag    |
| `body-start`       | Inject after the `<body>` tag opening      |
| `body-end`         | Inject before the `</body>` closing tag    |
| `before-selector`  | Inject before the selector-matched content |
| `after-selector`   | Inject after the selector-matched content  |
| `replace-selector` | Replace the selector-matched content       |

| Option       | Type                     | Default        | Description                         |
| ------------ | ------------------------ | -------------- | ----------------------------------- |
| targetFile   | `string`                 | `'index.html'` | Target HTML file path or filename   |
| rules        | `InjectRule[]`           | -              | Array of injection rules (required) |
| security     | `SecurityConfig`         | -              | Security filtering configuration    |
| templateVars | `Record<string, string>` | -              | Global template variables           |
| logInjection | `boolean`                | `true`         | Whether to output injection logs    |

**InjectRule**

| Property             | Type                     | Default    | Description                                               |
| -------------------- | ------------------------ | ---------- | --------------------------------------------------------- |
| id                   | `string`                 | -          | Unique rule identifier                                    |
| content              | `string`                 | -          | HTML content to inject                                    |
| position             | `InjectPosition`         | -          | Injection position                                        |
| selector             | `string`                 | -          | Selector (required for selector-related positions)        |
| selectorMatch        | `'string'` \| `'regex'`  | `'string'` | Selector matching mode                                    |
| priority             | `number`                 | `100`      | Rule priority, lower values execute first                 |
| condition            | `InjectCondition`        | -          | Injection condition                                       |
| templateVars         | `Record<string, string>` | -          | Rule-level template variables, override global vars       |
| allowScriptInjection | `boolean`                | `false`    | Whether to allow injecting dangerous content like scripts |

**SecurityConfig**

| Property                 | Type       | Default | Description                       |
| ------------------------ | ---------- | ------- | --------------------------------- |
| blockDangerousTags       | `boolean`  | `true`  | Block dangerous tags              |
| blockDangerousAttributes | `boolean`  | `true`  | Block dangerous attributes        |
| allowedTags              | `string[]` | -       | Whitelist of allowed tags         |
| blockedTags              | `string[]` | -       | Custom list of blocked tags       |
| blockedAttributes        | `string[]` | -       | Custom list of blocked attributes |

```typescript
htmlInject({
	rules: [
		{ id: 'meta-description', content: '<meta name="description" content="{{appName}}">', position: 'head-end', templateVars: { appName: 'My Application' } },
		{ id: 'analytics', content: '<script src="/analytics.js"></script>', position: 'body-end', condition: { type: 'env', value: 'PRODUCTION' }, allowScriptInjection: true }
	]
})
```

---

### faviconManager

Manage website favicon links injection into HTML files, supporting string shorthand config and icon file copying.

| Option      | Type     | Default | Description                                            |
| ----------- | -------- | ------- | ------------------------------------------------------ |
| base        | `string` | `'/'`   | Base path for icon files                               |
| url         | `string` | -       | Complete icon URL, takes precedence over base          |
| link        | `string` | -       | Custom complete link tag HTML, highest priority        |
| icons       | `Icon[]` | -       | Custom icon array, supports multiple formats and sizes |
| copyOptions | `object` | -       | Icon file copy config (sourceDir, targetDir)           |

**Icon**

| Property | Type     | Description        |
| -------- | -------- | ------------------ |
| rel      | `string` | Icon relation type |
| href     | `string` | Icon URL           |
| sizes    | `string` | Icon size          |
| type     | `string` | Icon MIME type     |

```typescript
faviconManager()
faviconManager('/assets')
faviconManager({
	base: '/assets',
	icons: [
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
	]
})
faviconManager({ link: '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />' })
faviconManager({ base: '/assets', copyOptions: { sourceDir: 'src/assets/icons', targetDir: 'dist/assets/icons' } })
```

---

### loadingManager

Global Loading state management with request interception and white-screen Loading support.

| Option         | Type                                            | Default                 | Description                                |
| -------------- | ----------------------------------------------- | ----------------------- | ------------------------------------------ |
| position       | `'center'` \| `'top'` \| `'bottom'`             | `'center'`              | Loading display position                   |
| defaultText    | `string`                                        | `'Loading...'`          | Default display text                       |
| spinnerType    | `'spinner'` \| `'dots'` \| `'pulse'` \| `'bar'` | `'spinner'`             | Spinner icon type                          |
| autoBind       | `'fetch'` \| `'xhr'` \| `'all'` \| `'none'`     | `'none'`                | Auto-bind request interception mode        |
| globalName     | `string`                                        | `'__LOADING_MANAGER__'` | Global variable name injected into browser |
| defaultVisible | `boolean`                                       | `false`                 | Loading DOM initial visibility state       |
| autoHideOn     | `'DOMContentLoaded'` \| `'load'` \| `'manual'`  | `'DOMContentLoaded'`    | Auto-hide timing                           |
| style          | `LoadingStyle`                                  | -                       | Custom style configuration                 |
| transition     | `TransitionConfig`                              | -                       | Transition animation configuration         |
| minDisplayTime | `MinDisplayTime`                                | -                       | Minimum display time configuration         |
| delayShow      | `DelayShow`                                     | -                       | Delay show configuration                   |
| debounceHide   | `DebounceHide`                                  | -                       | Debounce hide configuration                |
| requestFilter  | `RequestFilter`                                 | -                       | Request filter configuration               |
| customTemplate | `string`                                        | -                       | Custom HTML template                       |
| callbacks      | `LoadingCallbacks`                              | -                       | Lifecycle callbacks                        |

**LoadingStyle**

| Property           | Type      | Default                   | Description                              |
| ------------------ | --------- | ------------------------- | ---------------------------------------- |
| overlayColor       | `string`  | `'rgba(255,255,255,0.7)'` | Overlay background color                 |
| spinnerColor       | `string`  | `'#4361ee'`               | Spinner icon color                       |
| spinnerSize        | `string`  | `'40px'`                  | Spinner icon size                        |
| textColor          | `string`  | `'#333'`                  | Text color                               |
| textSize           | `string`  | `'14px'`                  | Text size                                |
| zIndex             | `number`  | `9999`                    | z-index value                            |
| pointerEvents      | `boolean` | `true`                    | Whether to enable overlay pointer events |
| backdropBlur       | `boolean` | `false`                   | Whether to enable background blur        |
| backdropBlurAmount | `number`  | `4`                       | Background blur amount (px)              |
| customClass        | `string`  | -                         | Custom CSS class name                    |
| customStyle        | `string`  | -                         | Custom inline style string               |

**Runtime API:**

```typescript
window.__LOADING_MANAGER__.show('Loading...')
window.__LOADING_MANAGER__.hide()
window.__LOADING_MANAGER__.forceHide()
window.__LOADING_MANAGER__.toggle()
window.__LOADING_MANAGER__.updateText('Processing...')
window.__LOADING_MANAGER__.isVisible()
window.__LOADING_MANAGER__.getPendingCount()
window.__LOADING_MANAGER__.destroy()
window.__LOADING_MANAGER__.enablePointerEvents()
window.__LOADING_MANAGER__.disablePointerEvents()
window.__LOADING_MANAGER__.togglePointerEvents()
window.__LOADING_MANAGER__.isPointerEventsEnabled()
```

```typescript
loadingManager()
loadingManager({ position: 'top', defaultText: 'Please wait...' })
loadingManager({ spinnerType: 'dots' })
loadingManager({ autoBind: 'fetch', requestFilter: { excludeUrls: [/\/api\/health/], excludeUrlPrefixes: ['http://localhost'] } })
loadingManager({ style: { overlayColor: 'rgba(0,0,0,0.5)', spinnerColor: '#ff6b6b', backdropBlur: true, backdropBlurAmount: 6 } })
loadingManager({ transition: { enabled: true, duration: 300, easing: 'cubic-bezier(0.4,0,0.2,1)' } })
loadingManager({ debounceHide: { enabled: true, duration: 100 } })
loadingManager({ callbacks: { onShow: 'console.log("loading shown")', onBeforeShow: 'return true', onHide: 'console.log("loading hidden")' } })
loadingManager({ customTemplate: '<div class="my-loader"><span data-loading-text></span></div>' })
loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
loadingManager({ defaultVisible: true, autoHideOn: 'manual' })
```

---

## Plugin Development Framework

### BasePlugin

The base class for all built-in plugins, providing core functionality such as configuration management, logging, lifecycle management, and safe execution.

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { Plugin } from 'vite'

interface MyPluginOptions {
	enabled?: boolean
	message?: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getPluginName() {
		return 'my-plugin'
	}
	protected getDefaultOptions() {
		return { enabled: true, message: 'Hello' }
	}
	protected validateOptions() {
		this.validator.field('message').string().validate()
	}
	protected addPluginHooks(plugin: Plugin) {
		plugin.buildStart = () => {
			this.logger.info(this.options.message)
		}
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

### Core Components

| Component             | Export Path                    | Description                         |
| --------------------- | ------------------------------ | ----------------------------------- |
| `BasePlugin`          | `@meng-xi/vite-plugin/factory` | Plugin base class                   |
| `createPluginFactory` | `@meng-xi/vite-plugin/factory` | Plugin factory function creator     |
| `PluginWithInstance`  | `@meng-xi/vite-plugin/factory` | Plugin type with instance reference |
| `Logger`              | `@meng-xi/vite-plugin/logger`  | Log manager (singleton pattern)     |
| `Validator`           | `@meng-xi/vite-plugin/common`  | Fluent API configuration validator  |

### Common Utilities

| Module     | Export Path                              | Description                                                       |
| ---------- | ---------------------------------------- | ----------------------------------------------------------------- |
| format     | `@meng-xi/vite-plugin/common/format`     | Date formatting, name conversion, template parsing, HTML escaping |
| fs         | `@meng-xi/vite-plugin/common/fs`         | File copying, directory traversal, concurrency control            |
| html       | `@meng-xi/vite-plugin/common/html`       | HTML injection (injectBeforeTag, injectHeadAndBody, etc.)         |
| object     | `@meng-xi/vite-plugin/common/object`     | Deep merge objects                                                |
| script     | `@meng-xi/vite-plugin/common/script`     | Callback wrapping, script tag detection, identifier validation    |
| validation | `@meng-xi/vite-plugin/common/validation` | Global name validation, XSS prevention, enum validation, etc.     |

---

## Sub-path Exports

Support importing modules on demand to reduce bundle size:

```typescript
import { buildProgress, copyFile, htmlInject, loadingManager, BasePlugin, Logger } from '@meng-xi/vite-plugin'

import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import { Logger } from '@meng-xi/vite-plugin/logger'
import { buildProgress, compressAssets, copyFile, generateRouter, generateVersion, versionUpdateChecker, htmlInject, faviconManager, loadingManager } from '@meng-xi/vite-plugin/plugins'
import { Validator, readFileContent, writeFileContent, injectHeadAndBody, deepMerge } from '@meng-xi/vite-plugin/common'

import type { PluginWithInstance, PluginFactory, BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { BuildProgressOptions, CompressAssetsOptions, GenerateVersionOptions, VersionUpdateCheckerOptions, HtmlInjectOptions, FaviconManagerOptions, LoadingManagerOptions } from '@meng-xi/vite-plugin/plugins'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common/format'
import type { HtmlInjectResult, DualInjectResult } from '@meng-xi/vite-plugin/common/html'
import type { CopyOptions, CopyResult } from '@meng-xi/vite-plugin/common/fs'
```

**All available sub-paths:**

```
@meng-xi/vite-plugin
@meng-xi/vite-plugin/factory
@meng-xi/vite-plugin/logger
@meng-xi/vite-plugin/plugins
@meng-xi/vite-plugin/plugins/build-progress
@meng-xi/vite-plugin/plugins/compress-assets
@meng-xi/vite-plugin/plugins/copy-file
@meng-xi/vite-plugin/plugins/favicon-manager
@meng-xi/vite-plugin/plugins/generate-router
@meng-xi/vite-plugin/plugins/generate-version
@meng-xi/vite-plugin/plugins/html-inject
@meng-xi/vite-plugin/plugins/loading-manager
@meng-xi/vite-plugin/plugins/version-update-checker
@meng-xi/vite-plugin/common
@meng-xi/vite-plugin/common/format
@meng-xi/vite-plugin/common/fs
@meng-xi/vite-plugin/common/html
@meng-xi/vite-plugin/common/object
@meng-xi/vite-plugin/common/script
@meng-xi/vite-plugin/common/validation
```

## Changelog

View [GitHub Releases](https://github.com/MengXi-Studio/vite-plugin/releases)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork this project
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: your feature description"`
4. Push branch: `git push origin feature/your-feature`
5. Create a Pull Request

## License

[MIT](LICENSE)
