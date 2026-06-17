# format

格式化工具，提供日期格式化参数、模板变量替换、日期格式化、文件大小格式化和压缩率计算功能。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { getDateFormatParams, parseTemplate, parseTemplateWithDelimiter, formatDate, formatFileSize, calcRatio } from '@meng-xi/vite-plugin/common/format'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common/format'

// barrel 导入
import { getDateFormatParams, parseTemplate, parseTemplateWithDelimiter, formatDate, formatFileSize, calcRatio } from '@meng-xi/vite-plugin/common'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common'
```

## 类型导出

### DateFormatOptions

日期格式化参数接口。

```typescript
interface DateFormatOptions {
	YYYY: string // 四位年份
	YY: string // 两位年份
	MM: string // 两位月份
	DD: string // 两位日期
	HH: string // 两位小时
	mm: string // 两位分钟
	ss: string // 两位秒数
	SSS: string // 三位毫秒
	timestamp: string // 时间戳（毫秒）
}
```

---

## getDateFormatParams

获取日期格式化参数对象。

```typescript
function getDateFormatParams(date?: Date): DateFormatOptions
```

**参数**

| 参数 | 类型   | 默认值       | 说明     |
| ---- | ------ | ------------ | -------- |
| date | `Date` | `new Date()` | 日期对象 |

**返回值**

`DateFormatOptions` - 日期格式化参数对象

**示例**

```typescript
const params = getDateFormatParams(new Date())
// { YYYY: '2026', MM: '02', DD: '03', HH: '15', mm: '30', ss: '00', ... }
```

---

## parseTemplate

替换模板字符串中的 `{{key}}` 占位符。

```typescript
function parseTemplate(template: string, values: Record<string, string>): string
```

**参数**

| 参数     | 类型                     | 说明                                             |
| -------- | ------------------------ | ------------------------------------------------ |
| template | `string`                 | 包含 `{{key}}` 占位符的模板字符串                |
| values   | `Record<string, string>` | 占位符键值映射，支持合并多组变量（后者覆盖前者） |

**返回值**

`string` - 替换占位符后的字符串

**说明**

- 键名中的正则特殊字符会被自动转义
- 值中的 `$` 也会被安全处理，避免正则替换问题

**示例**

```typescript
parseTemplate('Hello {{name}}!', { name: 'World' })
// 'Hello World!'

parseTemplate('{{YYYY}}-{{MM}}-{{DD}}', getDateFormatParams())
// '2026-06-06'
```

---

## parseTemplateWithDelimiter

替换模板字符串中的变量占位符（自定义分隔符），是 `parseTemplate` 的通用版本。

```typescript
function parseTemplateWithDelimiter(
  template: string,
  values: Record<string, string>,
  leftDelimiter?: string,
  rightDelimiter?: string
): string
```

**参数**

| 参数           | 类型                     | 默认值  | 说明                   |
| -------------- | ------------------------ | ------- | ---------------------- |
| template       | `string`                 | -       | 包含占位符的模板字符串 |
| values         | `Record<string, string>` | -       | 占位符键值映射         |
| leftDelimiter  | `string`                 | `'{{'`  | 左分隔符               |
| rightDelimiter | `string`                 | `'}}'`  | 右分隔符               |

**返回值**

`string` - 替换占位符后的字符串

**说明**

- 通用模板解析函数，支持自定义分隔符
- 键名中的正则特殊字符会被自动转义
- 值中的 `$` 也会被安全处理，避免正则替换问题

**示例**

```typescript
parseTemplateWithDelimiter('Hello {{name}}!', { name: 'World' })
// 'Hello World!'

parseTemplateWithDelimiter('Hello {name}!', { name: 'World' }, '{', '}')
// 'Hello World!'

// formatDate 内部使用此函数，分隔符为 { 和 }
parseTemplateWithDelimiter('{YYYY}-{MM}-{DD}', getDateFormatParams(), '{', '}')
// '2026-06-06'
```

---

## formatDate

格式化日期字符串，使用 `{key}` 单花括号占位符。

```typescript
function formatDate(date: Date, format: string): string
```

**参数**

| 参数   | 类型     | 说明                                                                       |
| ------ | -------- | -------------------------------------------------------------------------- |
| date   | `Date`   | 日期对象                                                                   |
| format | `string` | 格式字符串，支持 `{YYYY}`、`{MM}`、`{DD}`、`{HH}`、`{mm}`、`{ss}` 等占位符 |

**返回值**

`string` - 格式化后的日期字符串

**示例**

```typescript
formatDate(new Date(), '{YYYY}-{MM}-{DD}T{HH}:{mm}:{ss}')
// '2026-06-06T15:30:00'

formatDate(new Date(), '{YYYY}.{MM}.{DD}')
// '2026.06.06'
```

---

## formatFileSize

将字节数格式化为人类可读的文件大小字符串。

```typescript
function formatFileSize(bytes: number): string
```

**参数**

| 参数  | 类型     | 说明             |
| ----- | -------- | ---------------- |
| bytes | `number` | 文件大小（字节） |

**返回值**

`string` - 格式化后的文件大小字符串

**转换规则**

| 范围         | 格式     | 示例     |
| ------------ | -------- | -------- |
| 小于 1KB     | `xB`     | `512B`   |
| 小于 1MB     | `x.xKB`  | `1.5KB`  |
| 大于等于 1MB | `x.xxMB` | `2.35MB` |

**示例**

```typescript
formatFileSize(512) // '512B'
formatFileSize(1536) // '1.5KB'
formatFileSize(2461726) // '2.35MB'
```

---

## calcRatio

计算压缩率百分比。

```typescript
function calcRatio(originalSize: number, compressedSize: number): number
```

**参数**

| 参数           | 类型     | 说明             |
| -------------- | -------- | ---------------- |
| originalSize   | `number` | 原始大小（字节） |
| compressedSize | `number` | 压缩后大小（字节） |

**返回值**

`number` - 压缩率百分比（0-100），如 65.2 表示体积减少 65.2%

**说明**

- 计算公式：`(1 - compressedSize / originalSize) * 100`，保留一位小数
- 当 `originalSize` 为 0 时返回 0，避免除零错误

**示例**

```typescript
calcRatio(10000, 6000)  // 40.0
calcRatio(10000, 10000) // 0
calcRatio(0, 0)         // 0
```
