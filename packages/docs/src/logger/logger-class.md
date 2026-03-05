# Logger

全局单例日志管理器，统一管理所有插件的日志输出。

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'
```

## 类定义

```typescript
class Logger {
	static create(options: LoggerOptions): Logger
	createPluginLogger(pluginName: string): PluginLogger
}
```

---

## create

创建日志记录器（工厂方法）。

```typescript
static create(options: LoggerOptions): Logger
```

**参数**

| 参数    | 类型            | 说明     |
| ------- | --------------- | -------- |
| options | `LoggerOptions` | 日志配置 |

**返回值**

`Logger` - 单例实例

**说明**

- 采用单例模式，多次调用返回同一实例
- 为每个插件注册独立的日志配置

**示例**

```typescript
const logger = Logger.create({
	name: 'my-plugin',
	enabled: true
})
```

---

## createPluginLogger

创建插件日志代理对象。

```typescript
createPluginLogger(pluginName: string): PluginLogger
```

**参数**

| 参数       | 类型     | 说明     |
| ---------- | -------- | -------- |
| pluginName | `string` | 插件名称 |

**返回值**

`PluginLogger` - 插件日志代理对象

**说明**

该方法供 `BasePlugin` 内部使用，为每个插件提供独立的日志接口。

**示例**

```typescript
const logger = Logger.create({ name: 'my-plugin', enabled: true })
const pluginLogger = logger.createPluginLogger('my-plugin')

pluginLogger.info('信息日志')
pluginLogger.success('成功日志')
pluginLogger.warn('警告日志')
pluginLogger.error('错误日志')
```

---

## 单例模式

Logger 采用单例模式，确保全局只有一个日志管理器实例。

```typescript
// 多次调用返回同一实例
const logger1 = Logger.create({ name: 'plugin-a', enabled: true })
const logger2 = Logger.create({ name: 'plugin-b', enabled: false })

// logger1 和 logger2 是同一个 Logger 实例
// 但各自的插件日志配置独立管理
```

---

## 插件级别控制

每个插件的日志可以独立控制。

```typescript
// plugin-a 启用日志
Logger.create({ name: 'plugin-a', enabled: true })

// plugin-b 禁用日志
Logger.create({ name: 'plugin-b', enabled: false })

const logger = Logger.create({ name: 'plugin-a', enabled: true })
const loggerA = logger.createPluginLogger('plugin-a')
const loggerB = logger.createPluginLogger('plugin-b')

loggerA.info('这条会输出')
loggerB.info('这条不会输出')
```

---

## 日志输出格式

```
ℹ️ [@meng-xi/vite-plugin:my-plugin] 信息日志
✅ [@meng-xi/vite-plugin:my-plugin] 成功日志
⚠️ [@meng-xi/vite-plugin:my-plugin] 警告日志
❌ [@meng-xi/vite-plugin:my-plugin] 错误日志
```

---

## 与 BasePlugin 集成

在 `BasePlugin` 中自动集成日志功能。

```typescript
class MyPlugin extends BasePlugin<MyOptions> {
	protected addPluginHooks(plugin: Plugin) {
		plugin.buildStart = () => {
			// 直接使用 this.logger
			this.logger.info('构建开始')
			this.logger.success('初始化完成')
		}

		plugin.buildEnd = () => {
			this.logger.warn('构建即将结束')
		}
	}
}
```

日志开关由 `options.verbose` 控制：

```typescript
myPlugin({
	verbose: false // 禁用该插件的日志输出
})
```
