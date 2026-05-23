# script

脚本工具，提供回调函数包装和安全性验证功能。

```typescript
import { makeCallback, containsScriptTag, validateIdentifierName } from '@meng-xi/vite-plugin/common'
```

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

---

## containsScriptTag

检测字符串是否包含 `<script>` 标签。

```typescript
function containsScriptTag(str: string): boolean
```

**参数**

| 参数 | 类型     | 说明           |
| ---- | -------- | -------------- |
| str  | `string` | 待检测的字符串 |

**返回值**

`boolean` - 是否包含 script 标签

**示例**

```typescript
containsScriptTag('<div onclick="alert(1)">') // false
containsScriptTag('<script>alert(1)</script>') // true
```

---

## validateIdentifierName

验证字符串是否为合法的 JavaScript 标识符。

检查名称是否以字母、下划线或美元符开头，仅包含字母、数字、下划线和美元符，并排除可能导致原型污染的内置属性。

```typescript
function validateIdentifierName(name: string): void
```

**参数**

| 参数 | 类型     | 说明               |
| ---- | -------- | ------------------ |
| name | `string` | 待验证的标识符名称 |

**异常**

| 条件       | 错误信息                                               |
| ---------- | ------------------------------------------------------ |
| 非法标识符 | `"<name>" 不是合法的 JavaScript 标识符...`             |
| 内置属性   | `"<name>" 是 JavaScript 内置属性，可能导致原型污染...` |

**示例**

```typescript
validateIdentifierName('__LOADING_MANAGER__') // 通过
validateIdentifierName('123abc') // 抛出错误：不是合法标识符
validateIdentifierName('__proto__') // 抛出错误：内置属性
validateIdentifierName('constructor') // 抛出错误：内置属性
```
