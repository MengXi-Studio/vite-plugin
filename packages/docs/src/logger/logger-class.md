# Logger

全局单例日志管理器，统一管理所有插件的日志输出。

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'
```

## 类定义

```typescript
class Logger {
	static create(options: LoggerOptions): Logger
	static unregister(pluginName: string): void
	static destroy(): void
	createPluginLogger(pluginName: string): PluginLogger
}
```

---

## 静态方法

### create

创建日志记录器（工厂方法），注册插件配置并返回单例实例。

```typescript
static create(options: LoggerOptions): Logger
```

| 参数    | 类型            | 说明     |
| ------- | --------------- | -------- |
| options | `LoggerOptions` | 日志配置 |

**返回值**

`Logger` - 单例实例

::: tip
多次调用 `create` 返回同一实例，但每次调用都会注册对应插件的日志配置。
:::

**示例**

```typescript
const logger = Logger.create({ name: 'my-plugin', enabled: true })
```

---

### unregister

注销指定插件的日志配置。

```typescript
static unregister(pluginName: string): void
```

| 参数       | 类型     | 说明             |
| ---------- | -------- | ---------------- |
| pluginName | `string` | 要注销的插件名称 |

通常在插件销毁时由 `BasePlugin.destroy()` 自动调用。

**示例**

```typescript
Logger.unregister('my-plugin')
```

---

### destroy

销毁单例实例，释放所有资源。

```typescript
static destroy(): void
```

清除所有已注册的插件配置，重置单例实例。主要用于测试场景。

**示例**

```typescript
afterEach(() => {
	Logger.destroy()
})
```

---

## 实例方法

### createPluginLogger

创建插件日志代理对象。

```typescript
createPluginLogger(pluginName: string): PluginLogger
```

| 参数       | 类型     | 说明     |
| ---------- | -------- | ---------------- |
| pluginName | `string` | 插件名称 |

**返回值**

`PluginLogger` - 插件日志代理对象

::: warning
此方法供 `BasePlugin` 内部使用，一般不需要直接调用。
:::

**示例**

```typescript
const logger = Logger.create({ name: 'my-plugin', enabled: true })
const pluginLogger = logger.createPluginLogger('my-plugin')

pluginLogger.info('信息日志')
pluginLogger.success('成功日志')
```

---

## 单例模式

Logger 采用单例模式，确保全局只有一个日志管理器实例。

```typescript
const logger1 = Logger.create({ name: 'plugin-a', enabled: true })
const logger2 = Logger.create({ name: 'plugin-b', enabled: false })

// logger1 和 logger2 是同一个 Logger 实例
// 但各自的插件日志配置独立管理
```

---

## 插件级别控制

每个插件的日志可以独立控制。

```typescript
Logger.create({ name: 'plugin-a', enabled: true })
Logger.create({ name: 'plugin-b', enabled: false })

const logger = Logger.create({ name: 'plugin-a', enabled: true })
const loggerA = logger.createPluginLogger('plugin-a')
const loggerB = logger.createPluginLogger('plugin-b')

loggerA.info('这条会输出')
loggerB.info('这条不会输出')
```
