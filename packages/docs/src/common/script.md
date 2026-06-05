# script

脚本工具，提供回调函数包装功能。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { makeCallback } from '@meng-xi/vite-plugin/common/script'

// barrel 导入
import { makeCallback } from '@meng-xi/vite-plugin/common'
```

---

## makeCallback

将回调函数体字符串包装为安全的函数表达式（包含 try-catch 保护）。

```typescript
function makeCallback(body?: string, context?: string, params?: string): string
```

**参数**

| 参数    | 类型     | 默认值       | 说明                         |
| ------- | -------- | ------------ | ---------------------------- |
| body    | `string` | -            | 函数体代码字符串             |
| context | `string` | `'callback'` | 回调上下文标识，用于错误日志 |
| params  | `string` | `''`         | 函数参数列表字符串           |

**返回值**

`string` - 安全的函数表达式字符串

**示例**

```typescript
makeCallback('console.log("done")')
// 'function() { try { console.log("done") } catch(e) { console.error('[callback] error:', e); } }'

makeCallback('console.log(a, b)', 'callback', 'a, b')
// 'function(a, b) { try { console.log(a, b) } catch(e) { console.error('[callback] error:', e); } }'

makeCallback('')
// 'function() {}'

makeCallback(undefined)
// 'function() {}'
```
