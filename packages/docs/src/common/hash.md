# hash

哈希工具，提供基于加密随机数的随机哈希生成功能，用于版本标识、缓存破坏、唯一 ID 生成等场景。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { generateRandomHash } from '@meng-xi/vite-plugin/common/hash'

// barrel 导入
import { generateRandomHash } from '@meng-xi/vite-plugin/common'
```

---

## generateRandomHash

生成指定长度的随机十六进制哈希字符串。

```typescript
function generateRandomHash(length?: number): string
```

**参数**

| 参数   | 类型     | 默认值 | 说明                          |
| ------ | -------- | ------ | ----------------------------- |
| length | `number` | `8`    | 哈希字符串长度（1-64 之间）   |

**返回值**

`string` - 随机十六进制哈希字符串

**说明**

- 基于 Node.js `crypto.randomBytes` 生成，使用加密级随机数
- 长度自动限制在 `1` 到 `64` 之间（超出范围会被截断到边界值）
- 返回字符串仅包含十六进制字符（`0-9`、`a-f`）
- 适用于版本标识、缓存破坏（cache busting）、唯一 ID 生成等场景

**示例**

```typescript
// 默认长度（8 位）
generateRandomHash()
// 例如：'a3f2b9c1'

// 自定义长度
generateRandomHash(16)
// 例如：'7d8e9f0a1b2c3d4e'

// 长度超出范围会被限制
generateRandomHash(100)  // 生成 64 位哈希
generateRandomHash(0)    // 生成 1 位哈希
generateRandomHash(-5)   // 生成 1 位哈希

// 用于文件名版本化
const version = generateRandomHash(8)
const filename = `app.${version}.js`
// 例如：'app.a3f2b9c1.js'

// 用于缓存破坏
const cacheKey = generateRandomHash(12)
const url = `/api/data?v=${cacheKey}`
```
