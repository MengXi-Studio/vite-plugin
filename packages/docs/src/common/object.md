# object

对象处理工具，提供深度合并（deep merge）功能，用于配置合并、选项合并等场景。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { deepMerge } from '@meng-xi/vite-plugin/common/object'

// barrel 导入
import { deepMerge } from '@meng-xi/vite-plugin/common'
```

---

## deepMerge

深度合并多个对象，递归合并嵌套的普通对象（plain object）。

```typescript
function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T
```

**参数**

| 参数     | 类型              | 说明                       |
| -------- | ----------------- | -------------------------- |
| sources  | `Partial<T>[]`    | 待合并的源对象（可变参数） |

**返回值**

`T` - 合并后的新对象（不修改任何源对象）

**合并规则**

| 数据类型         | 合并方式                                                     |
| ---------------- | ------------------------------------------------------------ |
| 普通对象 `{}`    | 递归深度合并                                                 |
| 数组             | 直接覆盖（后者替换前者，不合并数组元素）                     |
| 基本类型         | 直接覆盖（后者覆盖前者）                                     |
| `null`           | 视为非普通对象，直接覆盖                                     |
| `Date`/`RegExp`  | 视为非普通对象，直接覆盖                                     |
| `undefined`      | 跳过（不覆盖已有值）                                         |

**说明**

- 仅递归合并"普通对象"（通过 `Object.prototype.toString` 检测为 `[object Object]` 的对象）
- 数组、`Date`、`RegExp`、类实例等非普通对象会直接覆盖
- `undefined` 值会被跳过，不会覆盖已存在的值
- 不修改任何源对象，返回全新对象
- 后面的源对象优先级更高，会覆盖前面同名字段

**示例**

```typescript
// 基本合并
const result = deepMerge(
  { a: 1, b: 2 },
  { b: 3, c: 4 }
)
// { a: 1, b: 3, c: 4 }

// 深度合并嵌套对象
const result = deepMerge(
  { user: { name: 'Alice', age: 20 }, tags: ['a'] },
  { user: { age: 25, email: 'alice@test.com' }, tags: ['b'] }
)
// {
//   user: { name: 'Alice', age: 25, email: 'alice@test.com' },
//   tags: ['b']  // 数组直接覆盖，不是合并
// }

// 跳过 undefined
const result = deepMerge(
  { a: 1, b: 2 },
  { a: undefined, b: 3 }
)
// { a: 1, b: 3 }  // a 保持 1，因为 undefined 被跳过

// 多个源对象合并（后者优先）
const result = deepMerge(
  { x: 1 },
  { x: 2 },
  { x: 3 }
)
// { x: 3 }

// 非普通对象直接覆盖
const date = new Date()
const result = deepMerge(
  { time: new Date(2020, 0, 1) },
  { time: date }
)
// { time: date }  // Date 对象直接覆盖，不尝试合并

// 用于插件配置合并
const defaultConfig = {
  enabled: true,
  verbose: true,
  options: { timeout: 5000, retry: 3 }
}
const userConfig = {
  options: { retry: 5 }
}
const finalConfig = deepMerge(defaultConfig, userConfig)
// {
//   enabled: true,
//   verbose: true,
//   options: { timeout: 5000, retry: 5 }
// }
```
