# BasePluginOptions

Base configuration type for all plugins, defining common configuration fields.

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
```

## Type Definition

```typescript
interface BasePluginOptions {
	/** Whether to enable the plugin, default true */
	enabled?: boolean
	/** Error handling strategy, default 'throw' */
	errorStrategy?: 'throw' | 'log' | 'ignore'
	/** Whether to output plugin logs, default true */
	verbose?: boolean
}
```

---

## Configuration Fields

### enabled

Controls whether the plugin is enabled. When set to `false`, all plugin hooks are skipped.

```typescript
// Disable plugin
myPlugin({ enabled: false })
```

### errorStrategy

Controls how plugin internal errors are handled.

| Value     | Description                                 |
| --------- | ------------------------------------------- |
| `throw`   | Log error and throw exception, aborts build |
| `log`     | Log error only, continues execution         |
| `ignore`  | Log error only, continues execution         |

::: warning
The `throw` strategy will abort the entire build process. Only use it when strict build correctness is required.
:::

```typescript
// Use throw strategy for critical build plugins
myPlugin({ errorStrategy: 'throw' })
```

### verbose

Controls whether the plugin outputs logs. When set to `false`, plugin logs are silenced without affecting functionality.

```typescript
// Silence plugin logs in production
myPlugin({ verbose: false })
```

---

## Inheritance Example

When creating custom plugin options, extend `BasePluginOptions` to automatically get common fields.

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

interface MyPluginOptions extends BasePluginOptions {
	// Custom fields
	outputPath: string
}
```

Common and custom fields can be passed together:

```typescript
myPlugin({
	// Common fields
	enabled: true,
	errorStrategy: 'log',
	verbose: true,
	// Custom fields
	outputPath: 'dist/output.json'
})
```
