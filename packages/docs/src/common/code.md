# code

代码处理工具，提供 JS 关键字集合、代码注释与字符串移除功能，用于代码静态分析、关键字检测等场景。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { JS_KEYWORDS, stripCommentsAndStrings } from '@meng-xi/vite-plugin/common/code'

// barrel 导入
import { JS_KEYWORDS, stripCommentsAndStrings } from '@meng-xi/vite-plugin/common'
```

---

## JS_KEYWORDS

JavaScript 关键字与全局内置对象的集合，用于关键字检测、词法分析等场景。

```typescript
const JS_KEYWORDS: Set<string>
```

**说明**

- 包含 ECMAScript 关键字（`break`、`case`、`class`、`const`、`let` 等）
- 包含保留字（`await`、`async`、`yield`、`of` 等）
- 包含字面量（`true`、`false`、`null`、`undefined`、`NaN`、`Infinity`）
- 包含全局对象（`console`、`window`、`document`、`globalThis`、`process` 等）
- 包含内置构造器与类型（`Object`、`Array`、`String`、`Number`、`Promise`、`Map`、`Set`、`RegExp`、`Date` 等）
- 包含错误类型（`Error`、`TypeError`、`RangeError`、`SyntaxError`、`ReferenceError`）
- 包含类型化数组（`Int8Array`、`Uint8Array`、`Float32Array`、`DataView`、`ArrayBuffer` 等）

**示例**

```typescript
JS_KEYWORDS.has('class')    // true
JS_KEYWORDS.has('myVar')    // false
JS_KEYWORDS.has('Promise')  // true

// 用于过滤非业务标识符
const identifiers = ['myFunc', 'console', 'myVar', 'class']
const businessIds = identifiers.filter(id => !JS_KEYWORDS.has(id))
// ['myFunc', 'myVar']
```

---

## stripCommentsAndStrings

移除 JavaScript/TypeScript 代码中的注释和字符串内容，保留代码结构，便于后续静态分析（如标识符提取、关键字检测）。

```typescript
function stripCommentsAndStrings(code: string): string
```

**参数**

| 参数 | 类型     | 说明           |
| ---- | -------- | -------------- |
| code | `string` | 源代码字符串 |

**返回值**

`string` - 移除注释和字符串内容后的代码（保留换行符，保持行号对齐）

**处理规则**

| 语法元素     | 处理方式                                                     |
| ------------ | ------------------------------------------------------------ |
| 单行注释 `//` | 内容替换为空格，保留换行符                                   |
| 多行注释 `/* */` | 内容替换为空格，保留换行符（保持行号对齐）                   |
| 单引号字符串 `'...'` | 内容替换为空格，转义序列保留长度                             |
| 双引号字符串 `"..."` | 内容替换为空格，转义序列保留长度                             |
| 模板字符串 `` `...` `` | 内容替换为空格，但 `${...}` 表达式内容原样保留                |

**说明**

- 保留换行符以维持行号对齐，便于错误定位
- 字符串中的转义序列（如 `\n`、`\t`）按 2 字符长度处理，保持长度一致
- 模板字符串中的 `${expression}` 表达式内容会原样保留，因为其中可能包含业务逻辑
- 适用于代码静态分析前的预处理，避免注释和字符串干扰标识符提取

**示例**

```typescript
const code = `
  // 单行注释
  const name = "hello"
  /* 多行
     注释 */
  const template = \`prefix \${value} suffix\`
`

const stripped = stripCommentsAndStrings(code)
// 结果：
//   (空格)
//   const name =           (字符串内容被移除)
//   (空格，保留换行)
//   (空格)
//   const template = `prefix ${value} suffix`  (模板字符串内容移除，但 ${value} 保留)
```
