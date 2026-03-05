**English** | [中文](./README.md)

<div align="center">
	<a href="https://github.com/MengXi-Studio/vite-plugin">
		<img alt="MengXi Studio Logo" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/logo.svg">
	</a>
	<br>
	<h1>@meng-xi/vite-plugin</h1>
	<p>A toolkit providing practical plugins for Vite, also a complete plugin development framework</p>

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

</div>

## Features

- **Ready to Use** - Provides practical plugins for file copying, router generation, version management, icon injection
- **Plugin Development Framework** - Exports core components like BasePlugin, Logger, Validator for building custom plugins
- **Type Safe** - Complete TypeScript type definitions with configuration validators ensuring parameter correctness
- **Flexible Configuration** - All plugins support detailed configuration to meet diverse scenario requirements

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
import { copyFile, generateRouter, generateVersion, injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
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

### Developing Custom Plugins

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin'
import type { Plugin } from 'vite'

interface MyPluginOptions {
	path: string
	enabled?: boolean
	verbose?: boolean
	errorStrategy?: 'throw' | 'log' | 'ignore'
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
}

export const myPlugin = createPluginFactory(MyPlugin)
```

## Built-in Plugins

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

| Option               | Type         | Default                | Description                                      |
| -------------------- | ------------ | ---------------------- | ------------------------------------------------ |
| pagesJsonPath        | string       | 'src/pages.json'       | Path to pages.json file                          |
| outputPath           | string       | 'src/router.config.ts' | Output file path                                 |
| outputFormat         | 'ts' \| 'js' | 'ts'                   | Output file format                               |
| nameStrategy         | string       | 'camelCase'            | Route name strategy                              |
| includeSubPackages   | boolean      | true                   | Whether to include sub-package routes            |
| watch                | boolean      | true                   | Whether to watch changes and auto-regenerate     |
| metaMapping          | object       | -                      | Mapping from page style fields to meta           |
| preserveRouteChanges | boolean      | true                   | Whether to preserve user modifications to routes |

### generateVersion

Automatically generate version numbers during the Vite build process.

| Option     | Type   | Default               | Description                    |
| ---------- | ------ | --------------------- | ------------------------------ |
| format     | string | 'timestamp'           | Version format                 |
| outputType | string | 'file'                | Output type                    |
| outputFile | string | 'version.json'        | Output file path               |
| defineName | string | '\_\_APP_VERSION\_\_' | Global variable name to inject |
| prefix     | string | -                     | Version number prefix          |
| suffix     | string | -                     | Version number suffix          |

### injectIco

Inject website icon links into the head of HTML files during the Vite build process.

| Option      | Type   | Default | Description                     |
| ----------- | ------ | ------- | ------------------------------- |
| base        | string | -       | Base path for icon files        |
| url         | string | -       | Complete URL for the icon       |
| link        | string | -       | Custom complete link tag HTML   |
| icons       | array  | -       | Custom icon array               |
| copyOptions | object | -       | Icon file copying configuration |

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
