# createPluginFactory

Create a plugin factory function that converts a plugin class to a Vite plugin instance.

```typescript
import { createPluginFactory } from '@meng-xi/vite-plugin/factory'
```

## Function Signature

```typescript
function createPluginFactory<T extends BasePluginOptions, P extends BasePlugin<T>, R = T>(
  PluginClass: new (options: T, loggerConfig?: LoggerOptions) => P,
  normalizer?: OptionsNormalizer<T, R>
): PluginFactory<T, R>
```

**Generic Parameters**

| Parameter | Constraint           | Description           |
| --------- | -------------------- | --------------------- |
| T         | `BasePluginOptions`  | Plugin options type   |
| P         | `BasePlugin<T>`      | Plugin instance type  |
| R         | `T` (default)        | Raw options type      |

**Parameters**

| Parameter    | Type                      | Description               |
| ------------ | ------------------------- | ------------------------- |
| PluginClass  | Plugin class constructor  | Plugin class              |
| normalizer   | `OptionsNormalizer<T, R>` | Options normalizer (optional) |

**Returns**

`PluginFactory<T, R>` - Plugin factory function

---

## Basic Usage

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

interface MyPluginOptions extends BasePluginOptions {
	outputPath: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	// ... implementation
}

// Create factory function
export const myPlugin = createPluginFactory(MyPlugin)
```

**Usage**

```typescript
import { defineConfig } from 'vite'
import { myPlugin } from './my-plugin'

export default defineConfig({
	plugins: [
		myPlugin({ outputPath: 'dist/output.json' })
	]
})
```

---

## With Options Normalizer

Supports simplified configuration (e.g. string parameter).

```typescript
interface MyPluginOptions extends BasePluginOptions {
	path: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	// ... implementation
}

// Support string or object config
export const myPlugin = createPluginFactory(
	MyPlugin,
	(opt?: string | MyPluginOptions) =>
		typeof opt === 'string' ? { path: opt } : (opt ?? { path: '' })
)
```

**Usage**

```typescript
// Both are equivalent
myPlugin('/path/to/file')
myPlugin({ path: '/path/to/file' })
```

---

## Full Example

```typescript
import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import { writeFileContent } from '@meng-xi/vite-plugin/common'

// Define options type
interface BuildInfoOptions extends BasePluginOptions {
	outputPath?: string
}

// Implement plugin class
class BuildInfoPlugin extends BasePlugin<BuildInfoOptions> {
	protected getPluginName() {
		return 'build-info'
	}

	protected getDefaultOptions() {
		return { outputPath: 'dist/build-info.json' }
	}

	protected getEnforce(): Plugin['enforce'] {
		return 'post'
	}

	protected addPluginHooks(plugin: Plugin) {
		plugin.closeBundle = async () => {
			if (!this.options.enabled) return

			await this.safeExecute(async () => {
				const info = {
					buildTime: new Date().toISOString(),
					mode: this.viteConfig?.mode
				}
				await writeFileContent(this.options.outputPath, JSON.stringify(info, null, 2))
				this.logger.success('Build info generated')
			}, 'Generate build info')
		}
	}
}

// Export factory function
export const buildInfo = createPluginFactory(BuildInfoPlugin)
```
