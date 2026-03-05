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
	message: string
	enabled?: boolean
	verbose?: boolean
	errorStrategy?: 'throw' | 'log' | 'ignore'
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

- [copyFile Plugin](/en/plugins/copy-file) - File copying
- [generateRouter Plugin](/en/plugins/generate-router) - Router generation
- [generateVersion Plugin](/en/plugins/generate-version) - Version management
- [injectIco Plugin](/en/plugins/inject-ico) - Icon injection
