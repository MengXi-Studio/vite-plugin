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
	/** Error handling strategy, default 'log' */
	errorStrategy?: 'throw' | 'log' | 'ignore'
	/** Plugin log level, default 'info' */
	logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent'
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

| Value     | Description                                      |
| --------- | ------------------------------------------------ |
| `throw`   | Log error and throw exception, aborts build      |
| `log`     | Log error only, continues execution (default)    |
| `ignore`  | Log error only, continues execution              |

::: warning
The `throw` strategy will abort the entire build process. Only use it when strict build correctness is required.
:::

```typescript
// Use throw strategy for critical build plugins
myPlugin({ errorStrategy: 'throw' })
```

### logLevel

Controls plugin log output level. Logs below the set level are ignored.

| Value     | Description                      |
| --------- | -------------------------------- |
| `debug`   | Output all level logs            |
| `info`    | Output info/warn/error logs      |
| `warn`    | Output warn/error logs           |
| `error`   | Output error logs only           |
| `silent`  | No log output                    |

```typescript
// Silent logs in production
myPlugin({ logLevel: process.env.NODE_ENV === 'production' ? 'silent' : 'info' })
```

---

## Inheritance Example

When creating custom plugin options, extend `BasePluginOptions` to automatically get common fields.

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

interface MyPluginOptions extends BasePluginOptions {
	// Custom fields
	outputPath: string
	verbose?: boolean
}
```

Common and custom fields can be passed together:

```typescript
myPlugin({
	// Common fields
	enabled: true,
	errorStrategy: 'log',
	logLevel: 'info',
	// Custom fields
	outputPath: 'dist/output.json',
	verbose: true
})
```
