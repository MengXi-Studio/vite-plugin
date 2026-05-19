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

- **Ready to Use** - Provides five practical plugins - buildProgress, copyFile, generateRouter, generateVersion, injectIco - covering build progress display, file copying, router generation, version management, and icon
  injection
- **Plugin Development Framework** - Exports core components like BasePlugin, Logger, Validator for building custom Vite plugins
- **Complete Lifecycle** - Supports initialization, config resolution, destroy lifecycle management with automatic hook composition
- **Type Safe** - Complete TypeScript type definitions with configuration validators ensuring parameter correctness
- **Flexible Configuration** - All plugins support detailed configuration to meet diverse scenario requirements
- **Safe Execution** - Built-in error handling strategies (throw / log / ignore) for unified exception management

## Documentation

View full documentation: [https://mengxi-studio.github.io/vite-plugin/](https://mengxi-studio.github.io/vite-plugin/)

## Installation

::: code-group

```bash [npm]
npm install @meng-xi/vite-plugin -D
```

```bash [yarn]
yarn add @meng-xi/vite-plugin -D
```

```bash [pnpm]
pnpm add @meng-xi/vite-plugin -D
```

:::

## Quick Start

### Using Built-in Plugins

```typescript
import { defineConfig } from 'vite'
import { buildProgress, copyFile, generateRouter, generateVersion, injectIco } from '@meng-xi/vite-plugin'

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

### buildProgress

Display real-time build progress bar in terminal during Vite build, supporting three display formats.

| Option          | Type                                  | Default | Description                                          |
| --------------- | ------------------------------------- | ------- | ---------------------------------------------------- |
| width           | number                                | 30      | Progress bar width (characters)                      |
| format          | `'bar'` \| `'spinner'` \| `'minimal'` | 'bar'   | Progress bar display format                          |
| completeChar    | string                                | '█'     | Fill character for completed portion                 |
| incompleteChar  | string                                | '░'     | Fill character for incomplete portion                |
| clearOnComplete | boolean                               | true    | Whether to clear progress bar on build completion    |
| showModuleName  | boolean                               | true    | Whether to show the currently processing module name |
| theme           | [ProgressTheme](#progresstheme)       | -       | Custom color theme                                   |

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

| Option      | Type    | Default | Description                                |
| ----------- | ------- | ------- | ------------------------------------------ |
| sourceDir   | string  | -       | Source directory path (required)           |
| targetDir   | string  | -       | Target directory path (required)           |
| overwrite   | boolean | true    | Whether to overwrite existing files        |
| recursive   | boolean | true    | Whether to recursively copy subdirectories |
| incremental | boolean | true    | Whether to enable incremental copying      |

### generateRouter

Automatically generate router configuration files based on uni-app project's `pages.json`.

| Option               | Type                                                      | Default                | Description                                      |
| -------------------- | --------------------------------------------------------- | ---------------------- | ------------------------------------------------ |
| pagesJsonPath        | string                                                    | 'src/pages.json'       | Path to pages.json file                          |
| outputPath           | string                                                    | 'src/router.config.ts' | Output file path                                 |
| outputFormat         | `'ts'` \| `'js'`                                          | 'ts'                   | Output file format                               |
| nameStrategy         | `'path'` \| `'camelCase'` \| `'pascalCase'` \| `'custom'` | 'camelCase'            | Route name strategy                              |
| customNameGenerator  | `(path: string) => string`                                | -                      | Custom route name generator function             |
| includeSubPackages   | boolean                                                   | true                   | Whether to include sub-package routes            |
| watch                | boolean                                                   | true                   | Whether to watch changes and auto-regenerate     |
| metaMapping          | `Record<string, string>`                                  | -                      | Mapping from page style fields to meta           |
| exportTypes          | boolean                                                   | true                   | Whether to export type definitions               |
| preserveRouteChanges | boolean                                                   | true                   | Whether to preserve user modifications to routes |

### generateVersion

Automatically generate version numbers during the Vite build process.

| Option       | Type                                                                              | Default           | Description                    |
| ------------ | --------------------------------------------------------------------------------- | ----------------- | ------------------------------ |
| format       | `'timestamp'` \| `'date'` \| `'datetime'` \| `'semver'` \| `'hash'` \| `'custom'` | 'timestamp'       | Version format                 |
| customFormat | string                                                                            | -                 | Custom format template         |
| semverBase   | string                                                                            | '1.0.0'           | Semantic version base          |
| outputType   | `'file'` \| `'define'` \| `'both'`                                                | 'file'            | Output type                    |
| outputFile   | string                                                                            | 'version.json'    | Output file path               |
| defineName   | string                                                                            | '**APP_VERSION**' | Global variable name to inject |
| hashLength   | number                                                                            | 8                 | Hash length (1-32)             |
| prefix       | string                                                                            | -                 | Version number prefix          |
| suffix       | string                                                                            | -                 | Version number suffix          |
| extra        | `Record<string, unknown>`                                                         | -                 | Extra info (JSON file only)    |

### injectIco

Inject website icon links into the head of HTML files during the Vite build process.

| Option      | Type   | Default | Description                     |
| ----------- | ------ | ------- | ------------------------------- |
| base        | string | '/'     | Base path for icon files        |
| url         | string | -       | Complete URL for the icon       |
| link        | string | -       | Custom complete link tag HTML   |
| icons       | Icon[] | -       | Custom icon array               |
| copyOptions | object | -       | Icon file copying configuration |

`Icon` interface definition:

| Property | Type   | Required | Description        |
| -------- | ------ | -------- | ------------------ |
| rel      | string | Yes      | Icon relation type |
| href     | string | Yes      | Icon URL           |
| sizes    | string | No       | Icon sizes         |
| type     | string | No       | Icon MIME type     |

`copyOptions` interface definition:

| Property  | Type    | Required | Default | Description                 |
| --------- | ------- | -------- | ------- | --------------------------- |
| sourceDir | string  | Yes      | -       | Icon source directory       |
| targetDir | string  | Yes      | -       | Icon target directory       |
| overwrite | boolean | No       | true    | Whether to overwrite files  |
| recursive | boolean | No       | true    | Whether to copy recursively |

## Sub-path Exports

Support importing modules on demand to reduce bundle size:

```typescript
// Full import
import { buildProgress, copyFile, BasePlugin, Logger } from '@meng-xi/vite-plugin'

// Module-level import
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import { Logger } from '@meng-xi/vite-plugin/logger'
import { buildProgress, copyFile, generateRouter } from '@meng-xi/vite-plugin/plugins'
import { Validator, readFileContent, writeFileContent } from '@meng-xi/vite-plugin/common'

// Type imports (on-demand type definitions from sub-paths)
import type { PluginWithInstance, PluginFactory, BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { BuildProgressOptions, GenerateVersionOptions, InjectIcoOptions, Icon } from '@meng-xi/vite-plugin/plugins'
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
