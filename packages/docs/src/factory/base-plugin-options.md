# BasePluginOptions

所有插件的基础配置类型，定义了通用配置字段。

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
```

## 类型定义

```typescript
interface BasePluginOptions {
	/** 是否启用插件，默认 true */
	enabled?: boolean
	/** 错误处理策略，默认 'log' */
	errorStrategy?: 'throw' | 'log' | 'ignore'
	/** 插件日志级别，默认 'info' */
	logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'silent'
}
```

---

## 配置字段说明

### enabled

控制插件是否启用。设为 `false` 时，插件的所有钩子将被跳过。

```typescript
// 禁用插件
myPlugin({ enabled: false })
```

### errorStrategy

控制插件内部错误的处理方式。

| 值        | 说明                                   |
| --------- | -------------------------------------- |
| `throw`   | 记录错误日志并抛出异常，中断构建       |
| `log`     | 记录错误日志，继续执行（默认）         |
| `ignore`  | 记录错误日志，继续执行                 |

::: warning
`throw` 策略会中断整个构建流程，仅在需要严格保证构建正确性时使用。
:::

```typescript
// 构建关键插件使用 throw 策略
myPlugin({ errorStrategy: 'throw' })
```

### logLevel

控制插件日志输出级别。低于设定级别的日志将被忽略。

| 值       | 说明                     |
| -------- | ------------------------ |
| `debug`  | 输出所有级别日志         |
| `info`   | 输出 info/warn/error 日志 |
| `warn`   | 输出 warn/error 日志     |
| `error`  | 仅输出 error 日志        |
| `silent` | 不输出任何日志           |

```typescript
// 生产环境静默日志
myPlugin({ logLevel: process.env.NODE_ENV === 'production' ? 'silent' : 'info' })
```

---

## 继承示例

自定义插件配置时，继承 `BasePluginOptions` 即可自动获得通用字段。

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

interface MyPluginOptions extends BasePluginOptions {
	// 自定义字段
	outputPath: string
	verbose?: boolean
}
```

使用时通用字段和自定义字段可一起传入：

```typescript
myPlugin({
	// 通用字段
	enabled: true,
	errorStrategy: 'log',
	logLevel: 'info',
	// 自定义字段
	outputPath: 'dist/output.json',
	verbose: true
})
```
