# Installation

## Package Managers

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
import { buildProgress, compressAssets, copyFile, faviconManager, generateRouter, generateVersion, htmlInject, loadingManager, versionUpdateChecker } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// Build progress bar
		buildProgress(),

		// Compress build artifacts
		compressAssets({
			algorithm: 'gzip',
			threshold: 1024,
			deleteOriginalFile: false
		}),

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
		faviconManager({
			base: '/assets'
		}),

		// HTML content injection
		htmlInject({
			rules: [
				{
					id: 'meta-description',
					content: '<meta name="description" content="My App">',
					position: 'head-end'
				}
			]
		}),

		// Global Loading state management
		loadingManager({
			defaultVisible: true,
			autoHideOn: 'DOMContentLoaded'
		}),

		// Version update checker
		versionUpdateChecker({
			checkInterval: 300000
		})
	]
})
```

### Sub-module Independent Import

Each plugin supports independent import from sub-paths for better Tree-shaking:

```typescript
import { buildProgress } from '@meng-xi/vite-plugin/plugins/build-progress'
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress-assets'
import { copyFile } from '@meng-xi/vite-plugin/plugins/copy-file'
import type { CompressAssetsOptions } from '@meng-xi/vite-plugin/plugins/compress-assets'
```

### Using Common Utility Modules

```typescript
import { formatDate, deepMerge, copySourceToTarget } from '@meng-xi/vite-plugin'

// Date formatting
formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

// Deep merge objects
const merged = deepMerge(defaultConfig, userConfig)

// Copy files (with incremental copying and concurrency control)
const result = await copySourceToTarget('src/assets', 'dist/assets', {
	recursive: true,
	overwrite: true,
	incremental: true
})
```

### Developing Custom Plugins

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin'
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { Plugin } from 'vite'

interface MyPluginOptions extends BasePluginOptions {
	message: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getDefaultOptions() {
		return { message: 'Hello' }
	}

	protected validateOptions(): void {
		this.validator.field('message').required().string().validate()
	}

	protected getPluginName(): string {
		return 'my-plugin'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.buildStart = () => {
			this.logger.info(this.options.message)
		}
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

## Next Steps

- [buildProgress](/en/plugins/build-progress) - Build progress display
- [compressAssets](/en/plugins/compress-assets) - Build artifact compression
- [copyFile](/en/plugins/copy-file) - File copying
- [faviconManager](/en/plugins/favicon-manager) - Favicon management
- [generateRouter](/en/plugins/generate-router) - Router generation
- [generateVersion](/en/plugins/generate-version) - Version management
- [htmlInject](/en/plugins/html-inject) - HTML content injection
- [loadingManager](/en/plugins/loading-manager) - Global Loading state management
- [versionUpdateChecker](/en/plugins/version-update-checker) - Version update detection
