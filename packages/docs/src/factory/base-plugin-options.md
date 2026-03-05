# BasePluginOptions

所有插件的基础配置选项类型。

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
```

## 类型定义

```typescript
interface BasePluginOptions {
	/** 是否启用插件 */
	enabled?: boolean
	/** 是否显示详细日志 */
	verbose?: boolean
	/** 错误处理策略 */
	errorStrategy?: 'throw' | 'log' | 'ignore'
}
```

## 属性

### enabled

是否启用插件。

| 类型      | 默认值 | 说明                            |
| --------- | ------ | ------------------------------- |
| `boolean` | `true` | 为 `false` 时插件不执行任何操作 |

**示例**

```typescript
myPlugin({
	enabled: process.env.NODE_ENV === 'production'
})
```

---

### verbose

是否显示详细日志。

| 类型      | 默认值 | 说明                              |
| --------- | ------ | --------------------------------- |
| `boolean` | `true` | 为 `false` 时禁用该插件的日志输出 |

**示例**

```typescript
myPlugin({
	verbose: false // 静默模式
})
```

---

### errorStrategy

错误处理策略。

| 类型                           | 默认值    | 说明         |
| ------------------------------ | --------- | ------------ |
| `'throw' \| 'log' \| 'ignore'` | `'throw'` | 错误处理方式 |

**策略说明**

| 策略     | 行为                             |
| -------- | -------------------------------- |
| `throw`  | 记录错误日志并抛出异常，中断构建 |
| `log`    | 仅记录错误日志，继续执行         |
| `ignore` | 仅记录错误日志，继续执行         |

**示例**

```typescript
// 生产环境中断构建，开发环境仅记录日志
myPlugin({
	errorStrategy: process.env.NODE_ENV === 'production' ? 'throw' : 'log'
})
```

---

## 扩展配置

自定义插件配置应继承 `BasePluginOptions`。

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

interface MyPluginOptions extends BasePluginOptions {
	// 插件特定配置
	outputPath: string
	format?: 'json' | 'yaml'
}
```

---

## 完整示例

```typescript
import { defineConfig } from 'vite'
import { myPlugin } from './my-plugin'

export default defineConfig({
	plugins: [
		myPlugin({
			// 基础配置
			enabled: true,
			verbose: true,
			errorStrategy: 'throw',

			// 插件特定配置
			outputPath: 'dist/output.json',
			format: 'json'
		})
	]
})
```
