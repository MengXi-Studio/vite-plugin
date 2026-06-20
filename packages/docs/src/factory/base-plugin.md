# BasePlugin

插件基类，提供生命周期管理、日志记录、配置验证等核心功能。所有插件均继承此类。

```typescript
import { BasePlugin } from '@meng-xi/vite-plugin/factory'
```

## 类定义

```typescript
abstract class BasePlugin<T extends BasePluginOptions = BasePluginOptions>
```

## 构造函数

```typescript
constructor(options: T, loggerConfig?: LoggerOptions)
```

| 参数         | 类型            | 说明             |
| ------------ | --------------- | ---------------- |
| options      | `T`             | 插件配置         |
| loggerConfig | `LoggerOptions` | 日志配置（可选） |

构造函数自动完成：合并配置 → 初始化日志 → 创建验证器 → 执行配置验证。

---

## 抽象方法

子类**必须**实现的方法。

### getPluginName

返回插件名称，用于 Vite 插件系统识别。

```typescript
protected abstract getPluginName(): string
```

### addPluginHooks

添加 Vite 插件钩子。

```typescript
protected abstract addPluginHooks(plugin: Plugin): void
```

| 参数   | 类型     | 说明          |
| ------ | -------- | ------------- |
| plugin | `Plugin` | Vite 插件对象 |

---

## 可选重写方法

### getDefaultOptions

返回插件默认配置。

```typescript
protected getDefaultOptions(): Partial<T>
```

默认返回 `{}`，子类可重写以提供插件特定的默认值。

### validateOptions

验证插件配置参数。

```typescript
protected validateOptions(): void
```

默认无验证，子类可重写以添加自定义验证逻辑。

### getEnforce

获取插件执行时机。

```typescript
protected getEnforce(): Plugin['enforce']
```

默认 `undefined`，可选 `'pre'`、`'post'`。

### onConfigResolved

处理配置解析完成事件。

```typescript
protected onConfigResolved(config: ResolvedConfig): void
```

默认行为：存储配置到 `this.viteConfig`。

### destroy

插件销毁生命周期，在 `closeBundle` 钩子中自动调用。

```typescript
protected destroy(): void
```

默认行为：注销插件的日志配置。子类重写时应先调用 `super.destroy()`。

---

## 内置属性

| 属性       | 类型                | 说明                   |
| ---------- | ------------------- | ---------------------- |
| options    | `Required<T>`       | 合并后的完整配置       |
| logger     | `PluginLogger`      | 插件日志记录器         |
| validator  | `Validator<T>`      | 配置验证器             |
| viteConfig | `ResolvedConfig \| null` | Vite 解析后的配置 |

---

## 内置方法

### safeExecute

安全执行异步函数，根据 `errorStrategy` 自动处理错误。

```typescript
protected async safeExecute<T>(fn: () => Promise<T>, context: string): Promise<T | undefined>
```

### safeExecuteSync

安全执行同步函数，根据 `errorStrategy` 自动处理错误。

```typescript
protected safeExecuteSync<T>(fn: () => T, context: string): T | undefined
```

### handleError

根据 `errorStrategy` 处理错误。

```typescript
protected handleError<T>(error: unknown, context: string): T | undefined
```

| 策略 | 行为                             |
| ---- | -------------------------------- |
| `throw` | 记录错误日志并抛出异常，中断构建 |
| `log` | 仅记录错误日志，继续执行         |
| `ignore` | 仅记录错误日志，继续执行       |

### toPlugin

将插件实例转换为 Vite 插件对象。

```typescript
public toPlugin(): Plugin
```

**自动组合的钩子**

- `configResolved`：先执行基类 `onConfigResolved`，再执行子类钩子
- `closeBundle`：先执行子类钩子，再执行基类 `destroy`

返回的插件对象上挂载了 `pluginInstance` 属性，可访问插件内部状态。

---

## 完整示例

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
		this.logger.info('插件已销毁')
	}
}
```
