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

		// Inject website icon
		injectIco({
			base: '/assets'
		}),

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

export const myPlugin = createPluginFactory(MyPlugin)
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
const result = await this.safeExecute(async () => {
	return await someAsyncOperation()
}, 'Execute async operation')
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

## Built-in Plugins

| Plugin          | Description                                                                               |
| --------------- | ----------------------------------------------------------------------------------------- |
| buildProgress   | Real-time build progress bar in terminal, supports bar / spinner / minimal                |
| copyFile        | Copy files or directories after build, supports incremental copying                       |
| generateRouter  | Auto-generate router config from pages.json (uni-app)                                     |
| generateVersion | Auto-generate version numbers, supports file output and global variable injection         |
| injectIco       | Inject website icon links into HTML files                                                 |
| injectLoading   | Inject global Loading state management with request interception and white-screen Loading |

### buildProgress

Display real-time build progress bar in terminal during Vite build, supporting three display formats.

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
```

### copyFile

Copy files or directories to specified locations after Vite build is completed.

| Option      | Type      | Default | Description                                |
| ----------- | --------- | ------- | ------------------------------------------ |
| sourceDir   | `string`  | -       | Source directory path (required)           |
| targetDir   | `string`  | -       | Target directory path (required)           |
| overwrite   | `boolean` | `true`  | Whether to overwrite existing files        |
| recursive   | `boolean` | `true`  | Whether to recursively copy subdirectories |
| incremental | `boolean` | `true`  | Whether to enable incremental copying      |

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

### injectIco

Inject website icon links into the head of HTML files during the Vite build process.

| Option      | Type     | Default | Description                     |
| ----------- | -------- | ------- | ------------------------------- |
| base        | `string` | `'/'`   | Base path for icon files        |
| url         | `string` | -       | Complete URL for the icon       |
| link        | `string` | -       | Custom complete link tag HTML   |
| icons       | `Icon[]` | -       | Custom icon array               |
| copyOptions | `object` | -       | Icon file copying configuration |

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

### injectLoading

Inject global Loading state management with XHR/Fetch request interception, white-screen Loading, custom styles, and lifecycle callbacks.

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

| Property           | Type      | Default                   | Description                     |
| ------------------ | --------- | ------------------------- | ------------------------------- |
| overlayColor       | `string`  | `'rgba(255,255,255,0.7)'` | Overlay background color        |
| spinnerColor       | `string`  | `'#4361ee'`               | Spinner color                   |
| spinnerSize        | `string`  | `'40px'`                  | Spinner size                    |
| textColor          | `string`  | `'#333'`                  | Text color                      |
| textSize           | `string`  | `'14px'`                  | Text size                       |
| customClass        | `string`  | -                         | Custom CSS class name           |
| customStyle        | `string`  | -                         | Custom inline style string      |
| zIndex             | `number`  | `9999`                    | z-index value                   |
| pointerEvents      | `boolean` | `false`                   | Whether to allow click-through  |
| backdropBlur       | `boolean` | `false`                   | Whether to enable backdrop blur |
| backdropBlurAmount | `number`  | `4`                       | Backdrop blur amount (px)       |

**TransitionConfig**

| Property | Type      | Default      | Description                  |
| -------- | --------- | ------------ | ---------------------------- |
| enabled  | `boolean` | `true`       | Whether to enable transition |
| duration | `number`  | `200`        | Transition duration (ms)     |
| easing   | `string`  | `'ease-out'` | Easing function              |

**MinDisplayTime**

| Property | Type      | Default | Description               |
| -------- | --------- | ------- | ------------------------- |
| enabled  | `boolean` | `true`  | Whether to enable         |
| duration | `number`  | `300`   | Minimum display time (ms) |

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

| Method              | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `show(text?)`       | Show Loading, optionally pass text                                  |
| `hide()`            | Hide Loading (subject to min display time and debounce constraints) |
| `forceHide()`       | Force hide, ignoring min display time and debounce                  |
| `destroy()`         | Destroy instance and restore original interceptors                  |
| `updateText(t)`     | Update text content                                                 |
| `isVisible()`       | Get whether Loading is currently visible                            |
| `getPendingCount()` | Get the number of pending requests                                  |

```typescript
// White-screen Loading: visible on page load, auto-hide on DOMContentLoaded
injectLoading({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })

// Auto-intercept all requests
injectLoading({ autoBind: 'all' })

// Custom styles + request filtering
injectLoading({
	style: { overlayColor: 'rgba(0,0,0,0.5)', spinnerColor: '#fff' },
	autoBind: 'fetch',
	requestFilter: { excludeUrls: [/\/api\/health/] }
})

// Manual control
injectLoading()
window.__LOADING_MANAGER__.show('Saving...')
window.__LOADING_MANAGER__.hide()
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
