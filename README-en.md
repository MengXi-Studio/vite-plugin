[中文](./README.md) | **English**

<div align="center">
	<a href="https://github.com/MengXi-Studio/vite-plugin">
		<img alt="MengXi Studio Logo" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/logo.png">
	</a>
	<br>
	<h1>@meng-xi/vite-plugin</h1>
	<p>A practical Vite plugin toolkit and a complete plugin development framework</p>

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

</div>

## Features

- **Ready to Use** - 12 practical plugins covering auto-import, build progress, bundle analysis & compression, file copying, environment variable validation, route generation, version management, HTML injection, favicon
	management, global Loading, and more
- **Plugin Development Framework** - Exports core components like BasePlugin, Logger, and Validator to quickly build custom Vite plugins
- **Common Utility Library** - Built-in Common utility modules supporting on-demand sub-path imports
- **Type Safe** - Complete TypeScript type definitions with configuration validators
- **On-demand Import** - Supports sub-path exports to reduce bundle size

📖 **Full Documentation: [https://mengxi-studio.github.io/vite-plugin/](https://mengxi-studio.github.io/vite-plugin/)**

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

```typescript
import { defineConfig } from 'vite'
import { buildProgress, bundleAnalyzer, compressAssets, copyFile, envGuard, generateRouter, generateVersion, versionUpdateChecker, htmlInject, faviconManager, loadingManager, autoImport } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		autoImport({ imports: { vue: ['ref', 'reactive', 'computed'] }, dts: 'src/auto-imports.d.ts' }),
		buildProgress(),
		bundleAnalyzer({ outputFormat: 'both' }),
		compressAssets({ algorithm: 'gzip' }),
		copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' }),
		envGuard({ rules: { VITE_API_URL: { type: 'string', required: true } } }),
		generateRouter(),
		generateVersion({ format: 'datetime', outputType: 'both' }),
		versionUpdateChecker(),
		htmlInject({ rules: [{ id: 'meta', content: '<meta name="description" content="My App">', position: 'head-end' }] }),
		faviconManager('/assets'),
		loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
	]
})
```

## Built-in Plugins

| Plugin                                                                                                     | Description                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [autoImport](https://mengxi-studio.github.io/vite-plugin/en/plugins/auto-import.html)                      | Auto-inject import statements with preset mappings, directory scanning, and Vue template auto-import                                  |
| [buildProgress](https://mengxi-studio.github.io/vite-plugin/en/plugins/build-progress.html)                | Real-time terminal build progress bar, supports bar / spinner / minimal                                                               |
| [bundleAnalyzer](https://mengxi-studio.github.io/vite-plugin/en/plugins/bundle-analyzer.html)              | Bundle volume analysis with JSON/HTML reports, gzip calculation, threshold alerts, and build diff                                     |
| [compressAssets](https://mengxi-studio.github.io/vite-plugin/en/plugins/compress-assets.html)              | Asset compression with gzip / brotli / both, concurrent compression and statistics report                                             |
| [copyFile](https://mengxi-studio.github.io/vite-plugin/en/plugins/copy-file.html)                          | Copy files or directories after build, supports incremental copying                                                                   |
| [envGuard](https://mengxi-studio.github.io/vite-plugin/en/plugins/)                                        | Environment variable validation with type checking, range validation, custom rules and runtime guard                                  |
| [faviconManager](https://mengxi-studio.github.io/vite-plugin/en/plugins/favicon-manager.html)              | Manage website favicon link injection and file copying, supports string shorthand config                                              |
| [generateRouter](https://mengxi-studio.github.io/vite-plugin/en/plugins/generate-router.html)              | Auto-generate route config from pages.json (uni-app)                                                                                  |
| [generateVersion](https://mengxi-studio.github.io/vite-plugin/en/plugins/generate-version.html)            | Auto-generate version numbers with file output and global variable injection                                                          |
| [htmlInject](https://mengxi-studio.github.io/vite-plugin/en/plugins/html-inject.html)                      | HTML content injection with multiple positions, selector targeting, conditional injection, template variables, and security filtering |
| [loadingManager](https://mengxi-studio.github.io/vite-plugin/en/plugins/loading-manager.html)              | Global Loading state management with request interception, debounce, transition animations, and white-screen Loading                  |
| [versionUpdateChecker](https://mengxi-studio.github.io/vite-plugin/en/plugins/version-update-checker.html) | Runtime version update checking with multiple prompt styles and custom callbacks                                                      |

## Plugin Development Framework

This package exports a complete plugin development framework to help quickly build custom Vite plugins that follow conventions.

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

**Core API:**

| API                                                                                                        | Description                                                                          |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`BasePlugin`](https://mengxi-studio.github.io/vite-plugin/en/factory/base-plugin.html)                    | Plugin base class providing config management, logging, error handling and lifecycle |
| [`createPluginFactory`](https://mengxi-studio.github.io/vite-plugin/en/factory/create-plugin-factory.html) | Converts a BasePlugin subclass into a Vite plugin function                           |
| [`Logger`](https://mengxi-studio.github.io/vite-plugin/en/logger/)                                         | Global singleton log manager with independent log proxies per plugin                 |
| [`Validator`](https://mengxi-studio.github.io/vite-plugin/en/factory/)                                     | Chain-style configuration validator for plugin config parameters                     |

## Common Utility Modules

Built-in general-purpose utility function library, organized by functional modules, supporting on-demand sub-path imports.

```typescript
import { formatFileSize } from '@meng-xi/vite-plugin/common/format'
import { scanDirectory } from '@meng-xi/vite-plugin/common/fs'
import { injectBeforeTag } from '@meng-xi/vite-plugin/common/html'
```

| Sub-path                                                                                     | Description             |
| -------------------------------------------------------------------------------------------- | ----------------------- |
| [`common/format`](https://mengxi-studio.github.io/vite-plugin/en/common/format.html)         | Formatting utilities    |
| [`common/fs`](https://mengxi-studio.github.io/vite-plugin/en/common/fs.html)                 | File system utilities   |
| [`common/html`](https://mengxi-studio.github.io/vite-plugin/en/common/html.html)             | HTML injection utils    |
| [`common/script`](https://mengxi-studio.github.io/vite-plugin/en/common/script.html)         | Script generation utils |
| [`common/ui`](https://mengxi-studio.github.io/vite-plugin/en/common/ui.html)                 | Terminal UI utils       |
| [`common/validation`](https://mengxi-studio.github.io/vite-plugin/en/common/validation.html) | Validation utilities    |

## Sub-path Exports

| Sub-path                                              | Description                          |
| ----------------------------------------------------- | ------------------------------------ |
| `@meng-xi/vite-plugin`                                | Main entry (all plugins + framework) |
| `@meng-xi/vite-plugin/factory`                        | Plugin development framework         |
| `@meng-xi/vite-plugin/logger`                         | Log manager                          |
| `@meng-xi/vite-plugin/plugins`                        | All plugins                          |
| `@meng-xi/vite-plugin/common`                         | All utility functions                |
| `@meng-xi/vite-plugin/common/*`                       | Utility sub-modules                  |
| `@meng-xi/vite-plugin/plugins/auto-import`            | autoImport plugin                    |
| `@meng-xi/vite-plugin/plugins/build-progress`         | buildProgress plugin                 |
| `@meng-xi/vite-plugin/plugins/bundle-analyzer`        | bundleAnalyzer plugin                |
| `@meng-xi/vite-plugin/plugins/compress-assets`        | compressAssets plugin                |
| `@meng-xi/vite-plugin/plugins/copy-file`              | copyFile plugin                      |
| `@meng-xi/vite-plugin/plugins/env-guard`              | envGuard plugin                      |
| `@meng-xi/vite-plugin/plugins/favicon-manager`        | faviconManager plugin                |
| `@meng-xi/vite-plugin/plugins/generate-router`        | generateRouter plugin                |
| `@meng-xi/vite-plugin/plugins/generate-version`       | generateVersion plugin               |
| `@meng-xi/vite-plugin/plugins/html-inject`            | htmlInject plugin                    |
| `@meng-xi/vite-plugin/plugins/loading-manager`        | loadingManager plugin                |
| `@meng-xi/vite-plugin/plugins/version-update-checker` | versionUpdateChecker plugin          |

## License

[MIT](LICENSE)
