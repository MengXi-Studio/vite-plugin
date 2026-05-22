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

- **Ready to Use** - Provides 6 practical plugins covering build progress display, file copying, router generation, version management, icon injection, and global Loading state management
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
import { buildProgress, copyFile, generateRouter, generateVersion, injectIco, injectLoading } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// Build progress bar
		buildProgress(),

		// Copy files
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),

		// Generate router config (uni-app)
		generateRouter({
			pagesJsonPath: 'src/pages.json',
			outputPath: 'src/router.config.ts'
		}),

		// Generate version
		generateVersion({
			format: 'datetime',
			outputType: 'both'
		}),

		// Inject website icon (supports string shorthand)
		injectIco('/assets'),

		// Inject global Loading
		injectLoading({
			defaultVisible: true,
			autoHideOn: 'DOMContentLoaded'
		})
	]
})
```

### Accessing Plugin Instance

All built-in plugins return an object with a `pluginInstance` property for accessing internal state:

```typescript
import type { PluginWithInstance } from '@meng-xi/vite-plugin/factory'
import type { GenerateRouterOptions } from '@meng-xi/vite-plugin'

const routerPlugin = generateRouter({ watch: true }) as PluginWithInstance<GenerateRouterOptions>

// Access plugin internals via pluginInstance
console.log(routerPlugin.pluginInstance?.options)
```

### Developing Custom Plugins

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin'
import type { BasePluginOptions, PluginWithInstance } from '@meng-xi/vite-plugin/factory'
import type { Plugin } from 'vite'

interface MyPluginOptions extends BasePluginOptions {
	path: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getDefaultOptions() {
		return { path: './default' }
	}

	protected validateOptions(): void {
		this.validator.field('path').required().string().validate()
	}

	protected getPluginName(): string {
		return 'my-plugin'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.buildStart = () => {
			this.logger.info(`Plugin started with path: ${this.options.path}`)
		}
	}

	protected destroy(): void {
		super.destroy()
		// Custom cleanup logic, e.g. close connections, stop watchers
	}
}

// Basic usage
export const myPlugin = createPluginFactory(MyPlugin)

// With normalizer (supports shorthand string config)
export const myPluginWithNormalizer = createPluginFactory(MyPlugin, opt => (typeof opt === 'string' ? { path: opt } : opt))
// Usage with shorthand: myPluginWithNormalizer('./custom-path')
```

## Plugin Development Framework

### BasePlugin Core Concepts

`BasePlugin` is the base class for all plugins, providing complete lifecycle management and development conventions:

#### Lifecycle

| Phase             | Method             | Description                                                    |
| ----------------- | ------------------ | -------------------------------------------------------------- |
| Initialization    | `constructor`      | Merge options, initialize logger and validator                 |
| Config Resolution | `onConfigResolved` | Called when Vite config is resolved                            |
| Hook Registration | `addPluginHooks`   | Register Vite plugin hooks                                     |
| Destroy           | `destroy`          | Automatically called during `closeBundle` for resource cleanup |

#### Automatic Hook Composition

The `toPlugin()` method automatically composes the following hooks:

- **configResolved** - Base class `onConfigResolved` runs first, then subclass hook
- **closeBundle** - Subclass hook runs first, then base class `destroy`

> Subclasses don't need to manually register `closeBundle` hooks for cleanup — just override the `destroy()` method.

#### Required Methods

| Method                   | Description           |
| ------------------------ | --------------------- |
| `getPluginName()`        | Return plugin name    |
| `addPluginHooks(plugin)` | Add Vite plugin hooks |

#### Optional Methods

| Method                     | Default Behavior  | Description                                 |
| -------------------------- | ----------------- | ------------------------------------------- |
| `getDefaultOptions()`      | Returns `{}`      | Provide plugin default options              |
| `validateOptions()`        | No validation     | Validate configuration parameters           |
| `getEnforce()`             | `undefined`       | Plugin execution order (`'pre'` / `'post'`) |
| `onConfigResolved(config)` | Store config      | Config resolved callback                    |
| `destroy()`                | Unregister logger | Cleanup logic when plugin is destroyed      |

#### Built-in Properties

| Property     | Type                     | Description                   |
| ------------ | ------------------------ | ----------------------------- |
| `options`    | `Required<T>`            | Merged complete configuration |
| `logger`     | `PluginLogger`           | Plugin logger                 |
| `validator`  | `Validator<T>`           | Configuration validator       |
| `viteConfig` | `ResolvedConfig \| null` | Resolved Vite configuration   |

#### Error Handling Strategy

Control error behavior via the `errorStrategy` configuration option:

- `'throw'` (default) - Log error and throw exception, halting the build
- `'log'` - Log error but don't throw, continue execution
- `'ignore'` - Log error but don't throw, continue execution

Wrap error-prone operations with `safeExecute` / `safeExecuteSync`:

```typescript
// Async safe execution
const result = await this.safeExecute(async () => {
	return await someAsyncOperation()
}, 'Execute async operation')

// Sync safe execution
const value = this.safeExecuteSync(() => {
	return someSyncOperation()
}, 'Execute sync operation')
```

### createPluginFactory

Create plugin factory functions with optional normalizer support:

```typescript
// Basic usage
const myPlugin = createPluginFactory(MyPlugin)

// With normalizer (supports shorthand string config)
const myPlugin = createPluginFactory(MyPlugin, opt => (typeof opt === 'string' ? { path: opt } : opt))

// Usage with shorthand
myPlugin('./custom-path')
```

### Validator

Fluent configuration validator with chainable API:

```typescript
import { Validator } from '@meng-xi/vite-plugin/common'

const validator = new Validator(options)
validator
	.field('sourceDir')
	.required()
	.string()
	.field('targetDir')
	.required()
	.string()
	.field('overwrite')
	.boolean()
	.default(true)
	.field('port')
	.number()
	.field('list')
	.array()
	.field('config')
	.object()
	.field('name')
	.custom(val => val.length > 0, 'name cannot be empty')
	.validate()
```

| Method       | Description                                                     |
| ------------ | --------------------------------------------------------------- |
| `field()`    | Specify the field to validate                                   |
| `required()` | Mark field as required                                          |
| `string()`   | Validate field value is a string type                           |
| `boolean()`  | Validate field value is a boolean type                          |
| `number()`   | Validate field value is a number type                           |
| `array()`    | Validate field value is an array type                           |
| `object()`   | Validate field value is an object type                          |
| `default()`  | Set default value for field (only when value is undefined/null) |
| `custom()`   | Validate field value with a custom function                     |
| `validate()` | Execute validation, throws error on failure                     |

### Logger

Global singleton log manager providing independent log control for each plugin:

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'

// Create logger (usually called automatically by BasePlugin)
Logger.create({ name: 'my-plugin', enabled: true })

// Unregister plugin log config (automatically called on plugin destroy)
Logger.unregister('my-plugin')

// Destroy singleton (for test scenarios)
Logger.destroy()
```

Log output format:

```
ℹ️ [@meng-xi/vite-plugin:my-plugin] Info message
✅ [@meng-xi/vite-plugin:my-plugin] Success message
⚠️ [@meng-xi/vite-plugin:my-plugin] Warning message
❌ [@meng-xi/vite-plugin:my-plugin] Error message
```

### Common Utilities

Exported via `@meng-xi/vite-plugin/common`, reusable in custom plugins:

```typescript
import { deepMerge, formatDate, parseTemplate, toCamelCase, toPascalCase, stripJsonComments, generateRandomHash, Validator } from '@meng-xi/vite-plugin/common'
import { readFileContent, writeFileContent, fileExists, copySourceToTarget } from '@meng-xi/vite-plugin/common'
```

| Function               | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `deepMerge()`          | Deep merge objects (undefined skipped, arrays overwritten)      |
| `formatDate()`         | Format date with `{YYYY}`, `{MM}`, `{DD}` etc. placeholders     |
| `parseTemplate()`      | Parse template string, replace placeholders                     |
| `toCamelCase()`        | Convert to camelCase                                            |
| `toPascalCase()`       | Convert to PascalCase                                           |
| `stripJsonComments()`  | Remove comments from JSON string                                |
| `generateRandomHash()` | Generate random hash string (1-64 characters)                   |
| `readFileContent()`    | Async read file content                                         |
| `writeFileContent()`   | Async write file content                                        |
| `fileExists()`         | Async check if file exists                                      |
| `copySourceToTarget()` | Copy files or directories with incremental copy and concurrency |

## Built-in Plugins

| Plugin          | Description                                                                               |
| --------------- | ----------------------------------------------------------------------------------------- |
| buildProgress   | Real-time build progress bar in terminal, supports bar / spinner / minimal                |
| copyFile        | Copy files or directories after build, supports incremental copying                       |
| generateRouter  | Auto-generate router config from pages.json (uni-app)                                     |
| generateVersion | Auto-generate version numbers, supports file output and global variable injection         |
| injectIco       | Inject website icon links into HTML files, supports string shorthand config               |
| injectLoading   | Inject global Loading state management with request interception and white-screen Loading |

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
// Default bar format
buildProgress()

// Spinner format
buildProgress({ format: 'spinner' })

// Minimal format
buildProgress({ format: 'minimal' })

// Custom appearance
buildProgress({
	width: 40,
	completeChar: '■',
	incompleteChar: '□',
	clearOnComplete: false
})

// Custom color theme
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
// Basic usage
copyFile({
	sourceDir: 'src/assets',
	targetDir: 'dist/assets'
})

// Disable overwrite and incremental copy
copyFile({
	sourceDir: 'src/static',
	targetDir: 'dist/static',
	overwrite: false,
	incremental: false
})
```

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

> Default `metaMapping` is `{ navigationBarTitleText: 'title', requireAuth: 'requireAuth' }`, automatically mapping page style fields to route meta. When `nameStrategy` is `'custom'`, `customNameGenerator` must be
> provided.

```typescript
// Basic usage
generateRouter()

// Custom pages.json path
generateRouter({ pagesJsonPath: 'pages.json' })

// Output JavaScript file
generateRouter({ outputFormat: 'js', outputPath: 'src/router.config.js' })

// PascalCase naming strategy
generateRouter({ nameStrategy: 'pascalCase' })

// Custom route name generator
generateRouter({
	nameStrategy: 'custom',
	customNameGenerator: path => `route_${path.replace(/\//g, '_')}`
})

// Custom meta mapping
generateRouter({
	metaMapping: {
		navigationBarTitleText: 'title',
		requireAuth: 'requireAuth',
		customField: 'custom'
	}
})
```

### generateVersion

Automatically generate version numbers during the Vite build process.

| Option       | Type                                                                              | Default             | Description                    |
| ------------ | --------------------------------------------------------------------------------- | ------------------- | ------------------------------ |
| format       | `'timestamp'` \| `'date'` \| `'datetime'` \| `'semver'` \| `'hash'` \| `'custom'` | `'timestamp'`       | Version format                 |
| customFormat | `string`                                                                          | -                   | Custom format template         |
| semverBase   | `string`                                                                          | `'1.0.0'`           | Semantic version base          |
| outputType   | `'file'` \| `'define'` \| `'both'`                                                | `'file'`            | Output type                    |
| outputFile   | `string`                                                                          | `'version.json'`    | Output file path               |
| defineName   | `string`                                                                          | `'__APP_VERSION__'` | Global variable name to inject |
| hashLength   | `number`                                                                          | `8`                 | Hash length (1-32)             |
| prefix       | `string`                                                                          | -                   | Version number prefix          |
| suffix       | `string`                                                                          | -                   | Version number suffix          |
| extra        | `Record<string, unknown>`                                                         | -                   | Extra info (JSON file only)    |

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
// Timestamp format (default)
generateVersion()

// Date format
generateVersion({ format: 'date' })

// Semantic version format
generateVersion({ format: 'semver', semverBase: '2.0.0', prefix: 'v' })

// Custom format
generateVersion({
	format: 'custom',
	customFormat: '{YYYY}.{MM}.{DD}-{hash}',
	hashLength: 6
})

// Inject into code
generateVersion({ outputType: 'define', defineName: '__VERSION__' })

// Both file output and code injection
generateVersion({
	outputType: 'both',
	outputFile: 'build-info.json',
	defineName: '__BUILD_VERSION__',
	extra: { environment: 'production' }
})
```

### injectIco

Inject website icon links into the head of HTML files during the Vite build process. Supports string shorthand config.

| Option      | Type     | Default | Description                     |
| ----------- | -------- | ------- | ------------------------------- |
| base        | `string` | `'/'`   | Base path for icon files        |
| url         | `string` | -       | Complete URL for the icon       |
| link        | `string` | -       | Custom complete link tag HTML   |
| icons       | `Icon[]` | -       | Custom icon array               |
| copyOptions | `object` | -       | Icon file copying configuration |

> Priority: `link` > `url` > `base`. When `link` is provided, custom HTML is injected directly; when `url` is provided, the complete URL is used; otherwise `base + '/favicon.ico'` is used.

`Icon` interface definition:

| Property | Type     | Required | Description        |
| -------- | -------- | -------- | ------------------ |
| rel      | `string` | Yes      | Icon relation type |
| href     | `string` | Yes      | Icon URL           |
| sizes    | `string` | No       | Icon sizes         |
| type     | `string` | No       | Icon MIME type     |

`copyOptions` interface definition:

| Property  | Type      | Required | Default | Description                 |
| --------- | --------- | -------- | ------- | --------------------------- |
| sourceDir | `string`  | Yes      | -       | Icon source directory       |
| targetDir | `string`  | Yes      | -       | Icon target directory       |
| overwrite | `boolean` | No       | `true`  | Whether to overwrite files  |
| recursive | `boolean` | No       | `true`  | Whether to copy recursively |

```typescript
// Use default config
injectIco()

// String shorthand (set base path)
injectIco('/assets')

// Custom icon array
injectIco({
	base: '/assets',
	icons: [
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }
	]
})

// Custom complete link tag
injectIco({
	link: '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />'
})

// With file copying
injectIco({
	base: '/assets',
	copyOptions: {
		sourceDir: 'src/assets/icons',
		targetDir: 'dist/assets/icons'
	}
})
```

### injectLoading

Inject global Loading state management with XHR/Fetch request interception, white-screen Loading, custom styles, and lifecycle callbacks.

**Injection strategy:**

- `defaultVisible: false` (default): All code (CSS + HTML + JS) is dynamically injected via JS before `</body>`
- `defaultVisible: true`: CSS + HTML are injected as static tags before `</head>` (visible on white screen), JS is injected before `</body>`

| Option         | Type                                            | Default                 | Description                                             |
| -------------- | ----------------------------------------------- | ----------------------- | ------------------------------------------------------- |
| position       | `'center'` \| `'top'` \| `'bottom'`             | `'center'`              | Loading display position                                |
| defaultText    | `string`                                        | `'Loading...'`          | Default display text                                    |
| spinnerType    | `'spinner'` \| `'dots'` \| `'pulse'` \| `'bar'` | `'spinner'`             | Spinner icon type                                       |
| style          | `LoadingStyle`                                  | -                       | Custom style configuration                              |
| transition     | `TransitionConfig`                              | `{ enabled: true }`     | Transition animation configuration                      |
| minDisplayTime | `MinDisplayTime`                                | `{ enabled: true }`     | Minimum display time configuration                      |
| delayShow      | `DelayShow`                                     | `{ enabled: true }`     | Delayed show configuration                              |
| debounceHide   | `DebounceHide`                                  | `{ enabled: false }`    | Debounced hide configuration                            |
| autoBind       | `'fetch'` \| `'xhr'` \| `'all'` \| `'none'`     | `'none'`                | Auto-bind request interception mode                     |
| requestFilter  | `RequestFilter`                                 | -                       | Request filter configuration                            |
| globalName     | `string`                                        | `'__LOADING_MANAGER__'` | Global variable name injected into browser              |
| customTemplate | `string`                                        | -                       | Custom HTML template (must include `data-loading-text`) |
| defaultVisible | `boolean`                                       | `false`                 | Whether initially visible (white-screen Loading)        |
| autoHideOn     | `'DOMContentLoaded'` \| `'load'` \| `'manual'`  | `'DOMContentLoaded'`    | Auto-hide timing (requires `defaultVisible: true`)      |
| callbacks      | `LoadingCallbacks`                              | -                       | Lifecycle callbacks                                     |

**LoadingStyle**

| Property           | Type      | Default                   | Description                              |
| ------------------ | --------- | ------------------------- | ---------------------------------------- |
| overlayColor       | `string`  | `'rgba(255,255,255,0.7)'` | Overlay background color                 |
| spinnerColor       | `string`  | `'#4361ee'`               | Spinner icon color                       |
| spinnerSize        | `string`  | `'40px'`                  | Spinner icon size                        |
| textColor          | `string`  | `'#333'`                  | Text color                               |
| textSize           | `string`  | `'14px'`                  | Text size                                |
| customClass        | `string`  | -                         | Custom CSS class name                    |
| customStyle        | `string`  | -                         | Custom inline style                      |
| zIndex             | `number`  | `9999`                    | z-index value                            |
| pointerEvents      | `boolean` | `true`                    | Whether to enable overlay pointer events |
| backdropBlur       | `boolean` | `false`                   | Whether to enable backdrop blur          |
| backdropBlurAmount | `number`  | `4`                       | Backdrop blur amount (px)                |

**TransitionConfig**

| Property | Type      | Default      | Description                  |
| -------- | --------- | ------------ | ---------------------------- |
| enabled  | `boolean` | `true`       | Whether to enable transition |
| duration | `number`  | `200`        | Transition duration (ms)     |
| easing   | `string`  | `'ease-out'` | Easing function              |

**MinDisplayTime**

| Property | Type      | Default | Description                                               |
| -------- | --------- | ------- | --------------------------------------------------------- |
| enabled  | `boolean` | `true`  | Whether to enable                                         |
| duration | `number`  | `300`   | Minimum display time (ms), prevents Loading from flashing |

**DelayShow**

| Property | Type      | Default | Description                                                                    |
| -------- | --------- | ------- | ------------------------------------------------------------------------------ |
| enabled  | `boolean` | `true`  | Whether to enable                                                              |
| duration | `number`  | `200`   | Delay duration (ms); if request completes within this time, Loading won't show |

**DebounceHide**

| Property | Type      | Default | Description             |
| -------- | --------- | ------- | ----------------------- |
| enabled  | `boolean` | `false` | Whether to enable       |
| duration | `number`  | `100`   | Debounce wait time (ms) |

**RequestFilter**

| Property           | Type       | Description                                                           |
| ------------------ | ---------- | --------------------------------------------------------------------- |
| excludeUrls        | `RegExp[]` | Array of URL regex patterns to exclude                                |
| includeUrls        | `RegExp[]` | Array of URL regex patterns to include (higher priority than exclude) |
| excludeMethods     | `string[]` | Array of HTTP methods to exclude                                      |
| excludeUrlPrefixes | `string[]` | Array of URL prefixes to exclude (prefix matching, more efficient)    |

**LoadingCallbacks**

Callbacks are provided as **function body strings** (injected into browser at build time, function references cannot be passed).

| Property     | Type     | Description                                     |
| ------------ | -------- | ----------------------------------------------- |
| onBeforeShow | `string` | Before show callback, `return false` to prevent |
| onShow       | `string` | After show callback                             |
| onBeforeHide | `string` | Before hide callback, `return false` to prevent |
| onHide       | `string` | After hide callback                             |
| onDestroy    | `string` | On destroy callback                             |

**LoadingManager API**

Access via `window.__LOADING_MANAGER__`:

| Method                     | Description                                                         |
| -------------------------- | ------------------------------------------------------------------- |
| `show(text?)`              | Show Loading, optionally pass text                                  |
| `hide()`                   | Hide Loading (subject to min display time and debounce constraints) |
| `forceHide()`              | Force hide, ignoring min display time and debounce                  |
| `toggle(text?)`            | Toggle Loading show/hide state                                      |
| `updateText(text)`         | Update text content                                                 |
| `isVisible()`              | Get whether Loading is currently visible                            |
| `isPointerEventsEnabled()` | Get whether pointer events are currently enabled                    |
| `enablePointerEvents()`    | Enable overlay pointer events, intercept all clicks and scrolls     |
| `disablePointerEvents()`   | Disable overlay pointer events, allow interaction passthrough       |
| `togglePointerEvents()`    | Toggle overlay pointer events state                                 |
| `getPendingCount()`        | Get the number of pending requests                                  |
| `destroy()`                | Destroy instance, clean up DOM and restore original interceptors    |

```typescript
// White-screen Loading: visible on page load, auto-hide on DOMContentLoaded
injectLoading({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })

// White-screen Loading: auto-hide after all resources loaded
injectLoading({ defaultVisible: true, autoHideOn: 'load' })

// Vue/React SPA: visible on white screen, manually hide after framework renders
injectLoading({ defaultVisible: true, autoHideOn: 'manual' })
// In app entry: window.__LOADING_MANAGER__.hide()

// Auto-intercept all requests
injectLoading({ autoBind: 'all' })

// Custom styles + request filtering
injectLoading({
	style: { overlayColor: 'rgba(0,0,0,0.5)', spinnerColor: '#fff', backdropBlur: true },
	autoBind: 'fetch',
	requestFilter: { excludeUrls: [/\/api\/health/], excludeUrlPrefixes: ['http://localhost'] }
})

// Debounced hide (prevent rapid flashing)
injectLoading({ debounceHide: { enabled: true, duration: 100 } })

// Lifecycle callbacks
injectLoading({
	callbacks: {
		onBeforeShow: 'if (shouldSkip) return false;',
		onShow: 'console.log("loading shown")',
		onBeforeHide: 'if (shouldKeepVisible) return false;',
		onHide: 'console.log("loading hidden")'
	}
})

// Manual control
injectLoading()
window.__LOADING_MANAGER__.show('Saving...')
window.__LOADING_MANAGER__.hide()
window.__LOADING_MANAGER__.toggle()
window.__LOADING_MANAGER__.disablePointerEvents()
```

## Sub-path Exports

Support importing modules on demand to reduce bundle size:

```typescript
// Full import
import { buildProgress, copyFile, injectLoading, BasePlugin, Logger } from '@meng-xi/vite-plugin'

// Module-level import
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import { Logger } from '@meng-xi/vite-plugin/logger'
import { buildProgress, copyFile, generateRouter, injectLoading } from '@meng-xi/vite-plugin/plugins'
import { Validator, readFileContent, writeFileContent } from '@meng-xi/vite-plugin/common'

// Type imports (on-demand type definitions from sub-paths)
import type { PluginWithInstance, PluginFactory, BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { BuildProgressOptions, GenerateVersionOptions, InjectIcoOptions, InjectLoadingOptions, Icon } from '@meng-xi/vite-plugin/plugins'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common'
```

## Changelog

See [GitHub Releases](https://github.com/MengXi-Studio/vite-plugin/releases)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: your feature description"`
4. Push to branch: `git push origin feature/your-feature`
5. Create a Pull Request

## License

[MIT](LICENSE)
