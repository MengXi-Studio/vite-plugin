# logger

日志模块，提供全局单例日志管理器，支持插件级别的日志控制。

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'
import type { PluginLogger, LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

## 模块列表

| 模块                              | 说明             |
| --------------------------------- | ---------------- |
| [Logger](./logger-class)          | 日志管理器类（单例） |
| [PluginLogger](./plugin-logger)   | 插件日志代理接口 |
| [LoggerOptions](./logger-options) | 日志配置类型     |

## 日志输出格式

```
ℹ️ [@meng-xi/vite-plugin:plugin-name] 信息日志
✅ [@meng-xi/vite-plugin:plugin-name] 成功日志
⚠️ [@meng-xi/vite-plugin:plugin-name] 警告日志
❌ [@meng-xi/vite-plugin:plugin-name] 错误日志
```

## 快速开始

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'

// 创建日志记录器（注册插件配置）
const logger = Logger.register({ name: 'my-plugin' })

// 创建插件日志代理
const pluginLogger = logger.createPluginLogger('my-plugin')

// 输出日志
pluginLogger.info('信息日志')
pluginLogger.success('成功日志')
pluginLogger.warn('警告日志')
pluginLogger.error('错误日志')
```

## 与 BasePlugin 集成

`BasePlugin` 自动集成日志功能，通过 `this.logger` 直接使用。

```typescript
class MyPlugin extends BasePlugin<MyOptions> {
	protected addPluginHooks(plugin: Plugin) {
		plugin.buildStart = () => {
			this.logger.info('构建开始')
			this.logger.success('初始化完成')
		}
	}
}
```

日志开关由 `BasePluginOptions.logLevel` 控制。
