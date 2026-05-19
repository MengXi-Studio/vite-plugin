# BasePlugin

Plugin base class providing lifecycle management, logging, and validation.

```typescript
import { BasePlugin } from '@meng-xi/vite-plugin/factory'
```

## Class Definition

```typescript
abstract class BasePlugin<T extends BasePluginOptions = BasePluginOptions>
```

---

## Constructor

```typescript
constructor(options: T, loggerConfig?: LoggerOptions)
```

**Parameters**

| Parameter    | Type            | Description              |
| ------------ | --------------- | ------------------------ |
| options      | `T`             | Plugin configuration     |
| loggerConfig | `LoggerOptions` | Logger config (optional) |

---

## Abstract Methods

Methods that subclasses must implement.

### getPluginName

Return plugin name.

```typescript
protected abstract getPluginName(): string
```

**Returns**

`string` - Plugin name for Vite plugin system identification

**Example**

```typescript
protected getPluginName(): string {
	return 'my-plugin'
}
```

---

### addPluginHooks

Add Vite plugin hooks.

```typescript
protected abstract addPluginHooks(plugin: Plugin): void
```

**Parameters**

| Parameter | Type     | Description        |
| --------- | -------- | ------------------ |
| plugin    | `Plugin` | Vite plugin object |

**Example**

```typescript
protected addPluginHooks(plugin: Plugin): void {
	plugin.buildStart = () => {
		if (!this.options.enabled) return
		this.logger.info('Build started')
	}

	plugin.configResolved = async config => {
		await this.safeExecute(async () => {
			// Execute async operation
		}, 'Execute operation')
	}
}
```

---

## Optional Override Methods

### getDefaultOptions

Return plugin default options.

```typescript
protected getDefaultOptions(): Partial<T>
```

**Returns**

`Partial<T>` - Plugin-specific default configuration

**Default Behavior**

Returns empty object `{}`, subclasses can override to provide plugin-specific default values

**Example**

```typescript
protected getDefaultOptions(): Partial<MyPluginOptions> {
	return {
		outputPath: 'dist/output.json',
		format: 'json'
	}
}
```

---

### validateOptions

Validate plugin configuration parameters.

```typescript
protected validateOptions(): void
```

**Default Behavior**

No validation

**Example**

```typescript
protected validateOptions(): void {
	this.validator
		.field('sourceDir').required().string()
		.field('targetDir').required().string()
		.validate()
}
```

---

### getEnforce

Get plugin execution timing.

```typescript
protected getEnforce(): Plugin['enforce']
```

**Returns**

`'pre' | 'post' | undefined` - Plugin execution timing

**Default Value**

`undefined`

**Example**

```typescript
protected getEnforce(): Plugin['enforce'] {
	return 'post' // Execute after build
}
```

---

### onConfigResolved

Handle config resolved event.

```typescript
protected onConfigResolved(config: ResolvedConfig): void
```

**Parameters**

| Parameter | Type             | Description          |
| --------- | ---------------- | -------------------- |
| config    | `ResolvedConfig` | Resolved Vite config |

**Default Behavior**

Stores config to `this.viteConfig`

---

### destroy

Plugin destroy lifecycle, automatically called in `closeBundle` hook.

```typescript
protected destroy(): void
```

**Default Behavior**

Unregisters plugin's log config

**Notes**

- Base class automatically calls this method in `closeBundle` hook
- Subclass should call `super.destroy()` first, then add custom cleanup logic
- No need to manually register `closeBundle` hook for resource cleanup in subclass

**Example**

```typescript
protected destroy(): void {
	super.destroy()
	this.stopWatching()
}
```

---

## Built-in Properties

### options

Merged complete configuration.

```typescript
protected options: Required<T>
```

---

### logger

Plugin logger.

```typescript
protected logger: PluginLogger
```

**Methods**

| Method      | Description |
| ----------- | ----------- |
| `info()`    | Info log    |
| `success()` | Success log |
| `warn()`    | Warning log |
| `error()`   | Error log   |

---

### validator

Configuration validator.

```typescript
protected validator: Validator<T>
```

---

### viteConfig

Resolved Vite configuration.

```typescript
protected viteConfig: ResolvedConfig | null
```

---

## Built-in Methods

### safeExecute

Safely execute async functions with automatic error handling.

```typescript
protected async safeExecute<T>(
	fn: () => Promise<T>,
	context: string
): Promise<T | undefined>
```

**Parameters**

| Parameter | Type               | Description       |
| --------- | ------------------ | ----------------- |
| fn        | `() => Promise<T>` | Async function    |
| context   | `string`           | Execution context |

**Returns**

`Promise<T | undefined>` - Function result or undefined

**Example**

```typescript
const result = await this.safeExecute(async () => {
	return await someAsyncOperation()
}, 'Execute async operation')
```

---

### safeExecuteSync

Safely execute sync functions with automatic error handling.

```typescript
protected safeExecuteSync<T>(fn: () => T, context: string): T | undefined
```

**Parameters**

| Parameter | Type      | Description       |
| --------- | --------- | ----------------- |
| fn        | `() => T` | Sync function     |
| context   | `string`  | Execution context |

**Returns**

`T | undefined` - Function result or undefined

**Example**

```typescript
const result = this.safeExecuteSync(() => {
	return someSyncOperation()
}, 'Execute sync operation')
```

---

### handleError

Handle errors based on error strategy.

```typescript
protected handleError<T>(error: unknown, context: string): T | undefined
```

**Parameters**

| Parameter | Type      | Description   |
| --------- | --------- | ------------- |
| error     | `unknown` | Error object  |
| context   | `string`  | Error context |

**Behavior**

Based on `errorStrategy` configuration:

- `'throw'`: Log error and throw
- `'log'`: Log error, continue
- `'ignore'`: Log error, continue

---

### toPlugin

Convert plugin instance to Vite plugin object.

```typescript
public toPlugin(): Plugin
```

**Returns**

`Plugin` - Vite plugin object with `pluginInstance` property pointing to original plugin instance

**Notes**

- Automatically composes `configResolved` hook: base class `onConfigResolved` runs first, then subclass hook
- Automatically composes `closeBundle` hook: subclass hook runs first, then base class `destroy`
- The returned plugin object has a `pluginInstance` property for accessing plugin internal state

**Example**

```typescript
const plugin = new MyPlugin(options)
const vitePlugin = plugin.toPlugin()
```

---

## Complete Example

```typescript
import type { Plugin } from 'vite'
import { BasePlugin } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

interface MyPluginOptions extends BasePluginOptions {
	message: string
	count?: number
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getPluginName(): string {
		return 'my-plugin'
	}

	protected getDefaultOptions(): Partial<MyPluginOptions> {
		return {
			message: 'Hello',
			count: 1
		}
	}

	protected validateOptions(): void {
		this.validator.field('message').required().string().field('count').number().validate()
	}

	protected getEnforce(): Plugin['enforce'] {
		return 'post'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.buildStart = () => {
			if (!this.options.enabled) return
			this.logger.info(`${this.options.message} x ${this.options.count}`)
		}
	}

	protected destroy(): void {
		super.destroy()
		this.logger.info('Plugin destroyed')
	}
}
```
