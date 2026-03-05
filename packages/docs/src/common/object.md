# object

对象处理工具。

```typescript
import { deepMerge } from '@meng-xi/vite-plugin/common'
```

## deepMerge

深度合并对象。

```typescript
function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T
```

**特性**

- `undefined` 值会被跳过，不会覆盖已有值
- 嵌套对象会递归合并
- 数组会直接覆盖，不会合并
- `null` 值会覆盖已有值

**参数**

| 参数    | 类型           | 说明       |
| ------- | -------------- | ---------- |
| sources | `Partial<T>[]` | 源对象列表 |

**返回值**

`T` - 合并后的对象

**示例**

```typescript
// 基本合并
deepMerge({ a: 1 }, { b: 2 })
// { a: 1, b: 2 }

// undefined 不覆盖已有值
deepMerge({ a: 1 }, { a: undefined })
// { a: 1 }

// 嵌套对象递归合并
deepMerge({ a: { b: 1 } }, { a: { c: 2 } })
// { a: { b: 1, c: 2 } }

// 数组直接覆盖
deepMerge({ a: [1, 2] }, { a: [3, 4] })
// { a: [3, 4] }

// null 覆盖已有值
deepMerge({ a: 1 }, { a: null })
// { a: null }

// 多对象合并
deepMerge({ enabled: true }, { verbose: true }, { enabled: false, custom: 'value' })
// { enabled: false, verbose: true, custom: 'value' }
```
