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
	/** 是否启用日志 */
	enabled?: boolean
}
```

## 属性

### name

插件名称。

| 类型     | 必填 | 说明                 |
| -------- | ---- | -------------------- |
| `string` | 是   | 用于日志前缀标识插件 |

**说明**

插件名称会显示在日志前缀中：`[@meng-xi/vite-plugin:name]`

**示例**

```typescript
Logger.create({
	name: 'my-plugin'
})
// 输出: ℹ️ [@meng-xi/vite-plugin:my-plugin] ...
```

---

### enabled

是否启用日志。

| 类型      | 默认值 | 说明                          |
| --------- | ------ | ----------------------------- |
| `boolean` | `true` | 为 `false` 时不输出该插件日志 |

**示例**

```typescript
// 启用日志
Logger.create({
	name: 'plugin-a',
	enabled: true
})

// 禁用日志
Logger.create({
	name: 'plugin-b',
	enabled: false
})
```

---

## 使用示例

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'

// 基本使用
const logger = Logger.create({
	name: 'my-plugin'
})

// 禁用日志
const silentLogger = Logger.create({
	name: 'silent-plugin',
	enabled: false
})

// 根据环境控制
const envLogger = Logger.create({
	name: 'env-plugin',
	enabled: process.env.DEBUG === 'true'
})
```
