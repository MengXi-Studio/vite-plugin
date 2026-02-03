# Installation

`@meng-xi/vite-plugin` supports installation via command line package managers.

## Package Managers

For an existing Vite project using JavaScript package managers, you can install @meng-xi/vite-plugin from the npm registry:

::: code-group

```bash [npm]
npm install @meng-xi/vite-plugin --save-dev
```

```bash [yarn]
yarn add @meng-xi/vite-plugin --save-dev
```

```bash [pnpm]
pnpm add @meng-xi/vite-plugin --save-dev
```

:::

## Basic Usage

### Using Built-in Plugins

```typescript
import { defineConfig } from 'vite'
import { copyFile, injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),
		injectIco({
			base: '/assets'
		})
	]
})
```

### Developing Custom Plugins

```typescript
import { BasePlugin, createPluginFactory, Validator } from '@meng-xi/vite-plugin'
import type { Plugin } from 'vite'

interface MyPluginOptions {
	path: string
	enabled?: boolean
	verbose?: boolean
	errorStrategy?: 'throw' | 'log' | 'ignore'
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getDefaultOptions() {
		return {
			path: './default'
		}
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

## Learn More

Check the [GitHub Repository](https://github.com/MengXi-Studio/vite-plugin) for more information and examples.
