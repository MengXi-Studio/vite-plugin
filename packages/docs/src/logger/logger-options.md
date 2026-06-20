# LoggerOptions

日志配置选项类型。

```typescript
import type { LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

## 类型定义

```typescript
interface LoggerOptions {
	/** 插件名称 */
	name: string
	/** 是否启用日志，默认 true */
	enabled?: boolean
}
```

---

## 属性说明

### name

插件名称，用于日志前缀标识。

| 类型     | 必填 | 说明                                    |
| -------- | ---- | --------------------------------------- |
| `string` | 是   | 显示在日志前缀 `[@meng-xi/vite-plugin:name]` 中 |

```typescript
Logger.create({ name: 'my-plugin' })
// 输出: ℹ️ [@meng-xi/vite-plugin:my-plugin] ...
```

### enabled

是否启用日志。

| 类型      | 默认值 | 说明                          |
| --------- | ------ | ----------------------------- |
| `boolean` | `true` | 为 `false` 时不输出该插件日志 |

```typescript
// 禁用日志
Logger.create({ name: 'my-plugin', enabled: false })

// 根据环境控制
Logger.create({ name: 'my-plugin', enabled: process.env.DEBUG === 'true' })
```
