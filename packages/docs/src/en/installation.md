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
import { buildProgress, bundleAnalyzer, compressAssets, copyFile, envGuard, faviconManager, generateRouter, generateVersion, htmlInject, loadingManager, versionUpdateChecker, autoImport } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// Auto import
		autoImport({
			imports: { vue: ['*'] },
			dts: 'src/auto-imports.d.ts',
			vueTemplate: true
		}),

		// Build progress bar
		buildProgress(),

		// Build artifact size analysis
		bundleAnalyzer({
			outputFormat: 'both',
			sizeThreshold: 200
		}),

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

		// Environment variable validation
		envGuard({
			required: {
				VITE_API_URL: { type: 'url', required: true }
			}
		}),

		// Generate router config (uni-app)
		generateRouter({
			pagesJsonPath: 'src/pages.json',
			outputPath: 'src/router.config.ts',
			dts: true
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
import { bundleAnalyzer } from '@meng-xi/vite-plugin/plugins/bundle-analyzer'
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress-assets'
import { copyFile } from '@meng-xi/vite-plugin/plugins/copy-file'
import type { CompressAssetsOptions } from '@meng-xi/vite-plugin/plugins/compress-assets'
```

### Using Common Utility Modules

```typescript
import { formatFileSize, parseTemplate, formatDate, copySourceToTarget, scanDirectory, writeFileSyncSafely, escapeHtmlAttr } from '@meng-xi/vite-plugin'

// File size formatting
formatFileSize(1024 * 1024) // '1.00MB'

// Template variable replacement
parseTemplate('Hello {{name}}!', { name: 'World' }) // 'Hello World!'

// Date formatting
formatDate(new Date(), '{YYYY}-{MM}-{DD}') // '2026-06-06'

// Copy files (with incremental copying)
const result = await copySourceToTarget('src/assets', 'dist/assets', {
	recursive: true,
	overwrite: true,
	incremental: true
})

// Scan directory
const files = await scanDirectory('src', {
	includeExtensions: ['.ts', '.js'],
	excludePatterns: ['node_modules']
})

// Sync safe write (auto-creates directories)
writeFileSyncSafely('src/auto-imports.d.ts', 'declare global { ... }')

// HTML attribute value escaping
escapeHtmlAttr('hello "world"') // 'hello &quot;world&quot;'
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

- [autoImport](/en/plugins/auto-import) - Auto import
- [buildProgress](/en/plugins/build-progress) - Build progress display
- [bundleAnalyzer](/en/plugins/bundle-analyzer) - Build artifact size analysis
- [compressAssets](/en/plugins/compress-assets) - Build artifact compression
- [copyFile](/en/plugins/copy-file) - File copying
- [envGuard](/en/plugins/env-guard) - Environment variable validation
- [faviconManager](/en/plugins/favicon-manager) - Favicon management
- [generateRouter](/en/plugins/generate-router) - Router generation
- [generateVersion](/en/plugins/generate-version) - Version management
- [htmlInject](/en/plugins/html-inject) - HTML content injection
- [loadingManager](/en/plugins/loading-manager) - Global Loading state management
- [versionUpdateChecker](/en/plugins/version-update-checker) - Version update detection
