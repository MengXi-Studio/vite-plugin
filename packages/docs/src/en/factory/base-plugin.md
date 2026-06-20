# BasePlugin

Plugin base class providing lifecycle management, logging, config validation and more. All plugins extend this class.

```typescript
import { BasePlugin } from '@meng-xi/vite-plugin/factory'
```

## Class Definition

```typescript
abstract class BasePlugin<T extends BasePluginOptions = BasePluginOptions>
```

## Constructor

```typescript
constructor(options: T, loggerConfig?: LoggerOptions)
```

| Parameter    | Type            | Description    |
| ------------ | --------------- | -------------- |
| options      | `T`             | Plugin options |
| loggerConfig | `LoggerOptions` | Logger config (optional) |

The constructor automatically: merges options → initializes logger → creates validator → runs validation.

---

## Abstract Methods

Methods that subclasses **must** implement.

### getPluginName

Return the plugin name for Vite plugin system identification.

```typescript
protected abstract getPluginName(): string
```

### addPluginHooks

Add Vite plugin hooks.

```typescript
protected abstract addPluginHooks(plugin: Plugin): void
```

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| plugin    | `Plugin` | Vite plugin object |

---

## Overridable Methods

### getDefaultOptions

Return default plugin options.

```typescript
protected getDefaultOptions(): Partial<T>
```

Default returns `{}`, subclasses can override to provide plugin-specific defaults.

### validateOptions

Validate plugin configuration.

```typescript
protected validateOptions(): void
```

Default is no validation, subclasses can override to add custom validation logic.

### getEnforce

Get plugin execution timing.

```typescript
protected getEnforce(): Plugin['enforce']
```

Default `undefined`, options: `'pre'`, `'post'`.

### onConfigResolved

Handle config resolved event.

```typescript
protected onConfigResolved(config: ResolvedConfig): void
```

Default behavior: stores config to `this.viteConfig`.

### destroy

Plugin destroy lifecycle, automatically called in `closeBundle` hook.

```typescript
protected destroy(): void
```

Default behavior: unregisters plugin's logger config. Subclasses should call `super.destroy()` first when overriding.

---

## Built-in Properties

| Property   | Type                     | Description                |
| ---------- | ------------------------ | -------------------------- |
| options    | `Required<T>`            | Merged full configuration  |
| logger     | `PluginLogger`           | Plugin logger              |
| validator  | `Validator<T>`           | Config validator           |
| viteConfig | `ResolvedConfig \| null` | Vite resolved config       |

---

## Built-in Methods

### safeExecute

Safely execute async function, automatically handling errors based on `errorStrategy`.

```typescript
protected async safeExecute<T>(fn: () => Promise<T>, context: string): Promise<T | undefined>
```

### safeExecuteSync

Safely execute sync function, automatically handling errors based on `errorStrategy`.

```typescript
protected safeExecuteSync<T>(fn: () => T, context: string): T | undefined
```

### handleError

Handle errors based on `errorStrategy`.

```typescript
protected handleError<T>(error: unknown, context: string): T | undefined
```

| Strategy | Behavior                                      |
| -------- | --------------------------------------------- |
| `throw`  | Log error and throw exception, aborts build   |
| `log`    | Log error only, continues execution           |
| `ignore` | Log error only, continues execution           |

### toPlugin

Convert plugin instance to Vite plugin object.

```typescript
public toPlugin(): Plugin
```

**Auto-composed hooks**

- `configResolved`: base class `onConfigResolved` first, then subclass hooks
- `closeBundle`: subclass hooks first, then base class `destroy`

The returned plugin object has a `pluginInstance` property for accessing internal state.

---

## Full Example

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
		return { message: 'Hello', count: 1 }
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
