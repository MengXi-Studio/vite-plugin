# BasePlugin

Plugin base class providing lifecycle management, logging, and validation.

```typescript
import { BasePlugin } from '@meng-xi/vite-plugin/factory'
```

## Abstract Methods (Required)

| Method                   | Description           |
| ------------------------ | --------------------- |
| `getPluginName()`        | Return plugin name    |
| `addPluginHooks(plugin)` | Add Vite plugin hooks |

## Optional Methods

| Method                     | Default           | Description              |
| -------------------------- | ----------------- | ------------------------ |
| `getDefaultOptions()`      | `{}`              | Return default options   |
| `validateOptions()`        | No validation     | Validate options         |
| `getEnforce()`             | `undefined`       | Plugin execution timing  |
| `onConfigResolved(config)` | Store config      | Config resolved callback |
| `destroy()`                | Unregister logger | Plugin destroy lifecycle |

## Built-in Properties

| Property     | Type                     | Description          |
| ------------ | ------------------------ | -------------------- |
| `options`    | `Required<T>`            | Merged options       |
| `logger`     | `PluginLogger`           | Plugin logger        |
| `validator`  | `Validator<T>`           | Config validator     |
| `viteConfig` | `ResolvedConfig \| null` | Resolved Vite config |

## Built-in Methods

### safeExecute / safeExecuteSync

Safely execute functions with error handling.

```typescript
protected async safeExecute<T>(fn: () => Promise<T>, context: string): Promise<T | undefined>
protected safeExecuteSync<T>(fn: () => T, context: string): T | undefined
```

### handleError

Handle errors based on `errorStrategy`.

```typescript
protected handleError<T>(error: unknown, context: string): T | undefined
```

### toPlugin

Convert to Vite plugin object.

```typescript
public toPlugin(): Plugin
```

Returns a plugin object with `pluginInstance` property pointing to the original plugin instance.

- Automatically composes `configResolved` hook: base class `onConfigResolved` runs first, then subclass hook
- Automatically composes `closeBundle` hook: subclass hook runs first, then base class `destroy`
- The returned plugin object has a `pluginInstance` property for accessing plugin internal state

## Example

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getPluginName() {
		return 'my-plugin'
	}

	protected getDefaultOptions() {
		return { outputPath: 'dist/output.json' }
	}

	protected addPluginHooks(plugin: Plugin) {
		plugin.buildStart = () => {
			if (!this.options.enabled) return
			this.logger.info('Build started')
		}
	}

	protected destroy(): void {
		super.destroy()
	}
}
```
