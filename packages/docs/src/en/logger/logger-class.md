# Logger

Global singleton log manager that centrally manages log output for all plugins.

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

## Static Methods

### create

Create a logger (factory method), register plugin config and return the singleton instance.

```typescript
static create(options: LoggerOptions): Logger
```

| Parameter | Type            | Description    |
| --------- | --------------- | -------------- |
| options   | `LoggerOptions` | Logger config  |

**Returns**

`Logger` - Singleton instance

::: tip
Multiple `create` calls return the same instance, but each call registers the corresponding plugin's log config.
:::

**Example**

```typescript
const logger = Logger.create({ name: 'my-plugin', enabled: true })
```

---

### unregister

Unregister a plugin's log config.

```typescript
static unregister(pluginName: string): void
```

| Parameter   | Type     | Description             |
| ----------- | -------- | ----------------------- |
| pluginName  | `string` | Plugin name to unregister |

Typically called automatically by `BasePlugin.destroy()`.

**Example**

```typescript
Logger.unregister('my-plugin')
```

---

### destroy

Destroy the singleton instance and release all resources.

```typescript
static destroy(): void
```

Clears all registered plugin configs and resets the singleton. Mainly used in test scenarios.

**Example**

```typescript
afterEach(() => {
	Logger.destroy()
})
```

---

## Instance Methods

### createPluginLogger

Create a plugin log proxy object.

```typescript
createPluginLogger(pluginName: string): PluginLogger
```

| Parameter  | Type     | Description  |
| ---------- | -------- | ------------ |
| pluginName | `string` | Plugin name  |

**Returns**

`PluginLogger` - Plugin log proxy object

::: warning
This method is for internal `BasePlugin` use. You generally don't need to call it directly.
:::

**Example**

```typescript
const logger = Logger.create({ name: 'my-plugin', enabled: true })
const pluginLogger = logger.createPluginLogger('my-plugin')

pluginLogger.info('Info message')
pluginLogger.success('Success message')
```

---

## Singleton Pattern

Logger uses the singleton pattern to ensure only one log manager instance globally.

```typescript
const logger1 = Logger.create({ name: 'plugin-a', enabled: true })
const logger2 = Logger.create({ name: 'plugin-b', enabled: false })

// logger1 and logger2 are the same Logger instance
// But each plugin's log config is managed independently
```

---

## Plugin-Level Control

Each plugin's logging can be controlled independently.

```typescript
Logger.create({ name: 'plugin-a', enabled: true })
Logger.create({ name: 'plugin-b', enabled: false })

const logger = Logger.create({ name: 'plugin-a', enabled: true })
const loggerA = logger.createPluginLogger('plugin-a')
const loggerB = logger.createPluginLogger('plugin-b')

loggerA.info('This will be output')
loggerB.info('This will not be output')
```
