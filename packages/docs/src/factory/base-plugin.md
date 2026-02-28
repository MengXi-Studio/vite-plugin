# BasePlugin

插件基类，提供生命周期管理、日志记录、配置验证等核心功能。

```typescript
import { BasePlugin } from '@meng-xi/vite-plugin/factory'
```

## 类定义

```typescript
abstract class BasePlugin<T extends BasePluginOptions = BasePluginOptions>
```

---

## 构造函数

```typescript
constructor(options: T, loggerConfig?: LoggerOptions)
```

**参数**

| 参数         | 类型            | 说明             |
| ------------ | --------------- | ---------------- |
| options      | `T`             | 插件配置         |
| loggerConfig | `LoggerOptions` | 日志配置（可选） |

---

## 抽象方法

子类必须实现的方法。

### getPluginName

返回插件名称。

```typescript
protected abstract getPluginName(): string
```

**返回值**

`string` - 插件名称，用于 Vite 插件系统识别

**示例**

```typescript
protected getPluginName(): string {
	return 'my-plugin'
}
```

---

### getDefaultOptions

返回插件默认配置。

```typescript
protected abstract getDefaultOptions(): Partial<T>
```

**返回值**

`Partial<T>` - 插件特定的默认配置

**示例**

```typescript
protected getDefaultOptions(): Partial<MyPluginOptions> {
	return {
		outputPath: 'dist/output.json',
		format: 'json'
	}
}
```

---

### addPluginHooks

添加 Vite 插件钩子。

```typescript
protected abstract addPluginHooks(plugin: Plugin): void
```

**参数**

| 参数   | 类型     | 说明          |
| ------ | -------- | ------------- |
| plugin | `Plugin` | Vite 插件对象 |

**示例**

```typescript
protected addPluginHooks(plugin: Plugin): void {
	plugin.buildStart = () => {
		if (!this.options.enabled) return
		this.logger.info('构建开始')
	}

	plugin.closeBundle = async () => {
		await this.safeExecute(async () => {
			// 执行异步操作
		}, '执行操作')
	}
}
```

---

## 可选重写方法

### validateOptions

验证插件配置参数。

```typescript
protected validateOptions(): void
```

**默认行为**

无验证

**示例**

```typescript
protected validateOptions(): void {
	this.validator
		.field('sourceDir').required().string()
		.field('targetDir').required().string()
		.validate()
}
```

---

### getEnforce

获取插件执行时机。

```typescript
protected getEnforce(): Plugin['enforce']
```

**返回值**

`'pre' | 'post' | undefined` - 插件执行时机

**默认值**

`undefined`

**示例**

```typescript
protected getEnforce(): Plugin['enforce'] {
	return 'post' // 在构建后期执行
}
```

---

### onConfigResolved

处理配置解析完成事件。

```typescript
protected onConfigResolved(config: ResolvedConfig): void
```

**参数**

| 参数   | 类型             | 说明               |
| ------ | ---------------- | ------------------ |
| config | `ResolvedConfig` | 解析后的 Vite 配置 |

**默认行为**

存储配置到 `this.viteConfig`

---

## 内置属性

### options

合并后的完整配置。

```typescript
protected options: Required<T>
```

---

### logger

插件日志记录器。

```typescript
protected logger: PluginLogger
```

**方法**

| 方法        | 说明     |
| ----------- | -------- |
| `info()`    | 信息日志 |
| `success()` | 成功日志 |
| `warn()`    | 警告日志 |
| `error()`   | 错误日志 |

---

### validator

配置验证器。

```typescript
protected validator: Validator<T>
```

---

### viteConfig

Vite 解析后的配置。

```typescript
protected viteConfig: ResolvedConfig | null
```

---

## 内置方法

### safeExecute

安全执行异步函数，自动处理错误。

```typescript
protected async safeExecute<T>(
	fn: () => Promise<T>,
	context: string
): Promise<T | undefined>
```

**参数**

| 参数    | 类型               | 说明           |
| ------- | ------------------ | -------------- |
| fn      | `() => Promise<T>` | 异步函数       |
| context | `string`           | 执行上下文描述 |

**返回值**

`Promise<T | undefined>` - 函数执行结果或 undefined

**示例**

```typescript
const result = await this.safeExecute(async () => {
	return await someAsyncOperation()
}, '执行异步操作')
```

---

### safeExecuteSync

安全执行同步函数，自动处理错误。

```typescript
protected safeExecuteSync<T>(fn: () => T, context: string): T | undefined
```

**参数**

| 参数    | 类型      | 说明           |
| ------- | --------- | -------------- |
| fn      | `() => T` | 同步函数       |
| context | `string`  | 执行上下文描述 |

**返回值**

`T | undefined` - 函数执行结果或 undefined

**示例**

```typescript
const result = this.safeExecuteSync(() => {
	return someSyncOperation()
}, '执行同步操作')
```

---

### handleError

根据错误策略处理错误。

```typescript
protected handleError<T>(error: unknown, context: string): T | undefined
```

**参数**

| 参数    | 类型      | 说明           |
| ------- | --------- | -------------- |
| error   | `unknown` | 错误对象       |
| context | `string`  | 错误上下文描述 |

**行为**

根据 `errorStrategy` 配置：

- `'throw'`：记录日志并抛出错误
- `'log'`：记录日志继续执行
- `'ignore'`：记录日志继续执行

---

### toPlugin

将插件实例转换为 Vite 插件对象。

```typescript
public toPlugin(): Plugin
```

**返回值**

`Plugin` - Vite 插件对象

**示例**

```typescript
const plugin = new MyPlugin(options)
const vitePlugin = plugin.toPlugin()
```

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
		return {
			message: 'Hello',
			count: 1
		}
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

		plugin.closeBundle = async () => {
			await this.safeExecute(async () => {
				// 执行操作
				this.logger.success('操作完成')
			}, '执行操作')
		}
	}
}
```
