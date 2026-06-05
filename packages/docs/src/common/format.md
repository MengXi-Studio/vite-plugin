# format

格式化工具。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { getDateFormatParams, formatFileSize } from '@meng-xi/vite-plugin/common/format'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common/format'

// barrel 导入
import { getDateFormatParams, formatFileSize } from '@meng-xi/vite-plugin/common'
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
