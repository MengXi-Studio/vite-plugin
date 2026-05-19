# Logger

Global singleton logger manager, managing log output for all plugins.

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'
```

## Class Definition

```typescript
class Logger {
	static create(options: LoggerOptions): Logger
	static unregister(pluginName: string): void
	static destroy(): void
	createPluginLogger(pluginName: string): PluginLogger
}
```

---

## create

Create logger instance (factory method).

```typescript
static create(options: LoggerOptions): Logger
```

**Parameters**

| Parameter | Type            | Description   |
| --------- | --------------- | ------------- |
| options   | `LoggerOptions` | Logger config |

**Returns**

`Logger` - Singleton instance

**Notes**

- Uses singleton pattern, multiple calls return the same instance
- Registers independent log config for each plugin

**Example**

```typescript
const logger = Logger.create({
	name: 'my-plugin',
	enabled: true
})
```

---

## unregister

Unregister a plugin's log config.

```typescript
static unregister(pluginName: string): void
```

**Parameters**

| Parameter  | Type     | Description               |
| ---------- | -------- | ------------------------- |
| pluginName | `string` | Plugin name to unregister |

**Notes**

- Removes the specified plugin's log config from the singleton
- Automatically called by `BasePlugin.destroy()` during plugin cleanup
- After calling, the plugin's logs will no longer be output

**Example**

```typescript
Logger.unregister('my-plugin')
```

---

## destroy

Destroy the singleton instance and release all resources.

```typescript
static destroy(): void
```

**Notes**

- Clears all registered plugin configs
- Resets the singleton instance to `null`
- Primarily used in test scenarios to reset Logger state between tests

**Example**

```typescript
// Reset Logger after each test
afterEach(() => {
	Logger.destroy()
})
```

---

## createPluginLogger

Create plugin logger proxy object.

```typescript
createPluginLogger(pluginName: string): PluginLogger
```

**Parameters**

| Parameter  | Type     | Description |
| ---------- | -------- | ----------- |
| pluginName | `string` | Plugin name |

**Returns**

`PluginLogger` - Plugin logger proxy object

**Notes**

This method is used internally by `BasePlugin` to provide each plugin with an independent log interface.

**Example**

```typescript
const logger = Logger.create({ name: 'my-plugin', enabled: true })
const pluginLogger = logger.createPluginLogger('my-plugin')

pluginLogger.info('Info message')
pluginLogger.success('Success message')
pluginLogger.warn('Warning message')
pluginLogger.error('Error message')
```

---

## Singleton Pattern

Logger uses singleton pattern to ensure only one logger manager instance globally.

```typescript
// Multiple calls return the same instance
const logger1 = Logger.create({ name: 'plugin-a', enabled: true })
const logger2 = Logger.create({ name: 'plugin-b', enabled: false })

// logger1 and logger2 are the same Logger instance
// But each plugin's log config is managed independently
```

---

## Plugin-Level Control

Each plugin's logs can be controlled independently.

```typescript
// plugin-a enables logs
Logger.create({ name: 'plugin-a', enabled: true })

// plugin-b disables logs
Logger.create({ name: 'plugin-b', enabled: false })

const logger = Logger.create({ name: 'plugin-a', enabled: true })
const loggerA = logger.createPluginLogger('plugin-a')
const loggerB = logger.createPluginLogger('plugin-b')

loggerA.info('This will be output')
loggerB.info('This will not be output')
```

---

## Log Output Format

```
ℹ️ [@meng-xi/vite-plugin:my-plugin] Info message
✅ [@meng-xi/vite-plugin:my-plugin] Success message
⚠️ [@meng-xi/vite-plugin:my-plugin] Warning message
❌ [@meng-xi/vite-plugin:my-plugin] Error message
```

---

## Integration with BasePlugin

Logger is automatically integrated in `BasePlugin`.

```typescript
class MyPlugin extends BasePlugin<MyOptions> {
	protected addPluginHooks(plugin: Plugin) {
		plugin.buildStart = () => {
			// Use this.logger directly
			this.logger.info('Build started')
			this.logger.success('Initialization complete')
		}

		plugin.buildEnd = () => {
			this.logger.warn('Build is about to end')
		}
	}
}
```

Log toggle is controlled by `options.verbose`:

```typescript
myPlugin({
	verbose: false // Disable this plugin's log output
})
```
