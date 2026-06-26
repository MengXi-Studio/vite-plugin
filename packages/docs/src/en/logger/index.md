# logger

Logger module providing a global singleton log manager with plugin-level log control.

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'
import type { PluginLogger, LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

## Module List

| Module                            | Description                    |
| --------------------------------- | ------------------------------ |
| [Logger](./logger-class)          | Log manager class (singleton)  |
| [PluginLogger](./plugin-logger)   | Plugin log proxy interface     |
| [LoggerOptions](./logger-options) | Log configuration type         |

## Log Output Format

```
ℹ️ [@meng-xi/vite-plugin:plugin-name] Info message
✅ [@meng-xi/vite-plugin:plugin-name] Success message
⚠️ [@meng-xi/vite-plugin:plugin-name] Warning message
❌ [@meng-xi/vite-plugin:plugin-name] Error message
```

## Quick Start

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'

// Create logger (register plugin config)
const logger = Logger.register({ name: 'my-plugin' })

// Create plugin log proxy
const pluginLogger = logger.createPluginLogger('my-plugin')

// Output logs
pluginLogger.info('Info message')
pluginLogger.success('Success message')
pluginLogger.warn('Warning message')
pluginLogger.error('Error message')
```

## Integration with BasePlugin

`BasePlugin` automatically integrates logging, accessible via `this.logger`.

```typescript
class MyPlugin extends BasePlugin<MyOptions> {
	protected addPluginHooks(plugin: Plugin) {
		plugin.buildStart = () => {
			this.logger.info('Build started')
			this.logger.success('Initialization complete')
		}
	}
}
```

Log output is controlled by `BasePluginOptions.logLevel`.
