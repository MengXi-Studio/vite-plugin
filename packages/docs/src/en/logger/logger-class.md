# Logger

Global singleton logger manager.

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'
```

## create

Create logger instance (factory method).

```typescript
static create(options: LoggerOptions): Logger
```

Returns singleton instance with plugin config registered.

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

```typescript
// Reset Logger after each test
afterEach(() => {
	Logger.destroy()
})
```

---

## createPluginLogger

Create plugin logger proxy.

```typescript
createPluginLogger(pluginName: string): PluginLogger
```

```typescript
const pluginLogger = logger.createPluginLogger('my-plugin')

pluginLogger.info('Info message')
pluginLogger.success('Success message')
pluginLogger.warn('Warning message')
pluginLogger.error('Error message')
```

## Output Format

```
ℹ️ [@meng-xi/vite-plugin:my-plugin] Info message
✅ [@meng-xi/vite-plugin:my-plugin] Success message
⚠️ [@meng-xi/vite-plugin:my-plugin] Warning message
❌ [@meng-xi/vite-plugin:my-plugin] Error message
```

## Singleton Pattern

Multiple calls return the same instance, but each plugin's config is managed independently.

```typescript
Logger.create({ name: 'plugin-a', enabled: true })
Logger.create({ name: 'plugin-b', enabled: false })
// Same Logger instance, different plugin configs
```
