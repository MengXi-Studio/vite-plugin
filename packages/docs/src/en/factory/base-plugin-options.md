# BasePluginOptions

Base configuration options type for all plugins.

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
```

## Type Definition

```typescript
interface BasePluginOptions {
	/** Enable plugin */
	enabled?: boolean
	/** Show verbose logs */
	verbose?: boolean
	/** Error handling strategy */
	errorStrategy?: 'throw' | 'log' | 'ignore'
}
```

## Properties

### enabled

Enable plugin.

| Type      | Default | Description                       |
| --------- | ------- | --------------------------------- |
| `boolean` | `true`  | When `false`, plugin does nothing |

**Example**

```typescript
myPlugin({
	enabled: process.env.NODE_ENV === 'production'
})
```

---

### verbose

Show verbose logs.

| Type      | Default | Description                              |
| --------- | ------- | ---------------------------------------- |
| `boolean` | `true`  | When `false`, disables plugin log output |

**Example**

```typescript
myPlugin({
	verbose: false // Silent mode
})
```

---

### errorStrategy

Error handling strategy.

| Type                           | Default   | Description         |
| ------------------------------ | --------- | ------------------- |
| `'throw' \| 'log' \| 'ignore'` | `'throw'` | Error handling mode |

**Strategy Details**

| Strategy | Behavior                                  |
| -------- | ----------------------------------------- |
| `throw`  | Log error and throw exception, halt build |
| `log`    | Log error only, continue execution        |
| `ignore` | Log error only, continue execution        |

**Example**

```typescript
// Throw in production, log only in development
myPlugin({
	errorStrategy: process.env.NODE_ENV === 'production' ? 'throw' : 'log'
})
```

---

## Extending

Custom plugin options should extend `BasePluginOptions`.

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

interface MyPluginOptions extends BasePluginOptions {
	// Plugin-specific options
	outputPath: string
	format?: 'json' | 'yaml'
}
```

---

## Complete Example

```typescript
import { defineConfig } from 'vite'
import { myPlugin } from './my-plugin'

export default defineConfig({
	plugins: [
		myPlugin({
			// Base options
			enabled: true,
			verbose: true,
			errorStrategy: 'throw',

			// Plugin-specific options
			outputPath: 'dist/output.json',
			format: 'json'
		})
	]
})
```
