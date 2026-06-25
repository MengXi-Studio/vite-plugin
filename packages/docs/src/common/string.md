# string

字符串处理工具，提供大小写转换、JSON 注释移除、正则转义等通用字符串处理功能。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { toCamelCase, toPascalCase, stripJsonComments, escapeRegex } from '@meng-xi/vite-plugin/common/string'

// barrel 导入
import { toCamelCase, toPascalCase, stripJsonComments, escapeRegex } from '@meng-xi/vite-plugin/common'
```

---

## toCamelCase

将字符串转换为驼峰命名（camelCase），首单词小写，后续单词首字母大写。

```typescript
function toCamelCase(str: string, separators?: RegExp): string
```

**参数**

| 参数       | 类型      | 默认值    | 说明                       |
| ---------- | --------- | --------- | -------------------------- |
| str        | `string`  | -         | 待转换的字符串             |
| separators | `RegExp`  | `/[/-]/`  | 单词分隔符正则（斜杠或连字符） |

**返回值**

`string` - 驼峰命名字符串

**说明**

- 先移除开头的斜杠 `/`（用于处理路径式字符串）
- 按分隔符拆分单词
- 第一个单词全小写，后续单词首字母大写其余小写
- 空字符串部分会被过滤

**示例**

```typescript
toCamelCase('user-name')      // 'userName'
toCamelCase('user/name')      // 'userName'
toCamelCase('/api/user/list') // 'apiUserList'
toCamelCase('foo')            // 'foo'
toCamelCase('USER-NAME')      // 'userName'

// 自定义分隔符
toCamelCase('user.name', '.') // 'userName'
toCamelCase('user_name', '_') // 'userName'
```

---

## toPascalCase

将字符串转换为帕斯卡命名（PascalCase），所有单词首字母大写。

```typescript
function toPascalCase(str: string, separators?: RegExp): string
```

**参数**

| 参数       | 类型      | 默认值    | 说明                       |
| ---------- | --------- | --------- | -------------------------- |
| str        | `string`  | -         | 待转换的字符串             |
| separators | `RegExp`  | `/[/-]/`  | 单词分隔符正则（斜杠或连字符） |

**返回值**

`string` - 帕斯卡命名字符串

**说明**

- 先移除开头的斜杠 `/`（用于处理路径式字符串）
- 按分隔符拆分单词
- 每个单词首字母大写，其余小写
- 空字符串部分会被过滤

**示例**

```typescript
toPascalCase('user-name')      // 'UserName'
toPascalCase('user/name')      // 'UserName'
toPascalCase('/api/user/list') // 'ApiUserList'
toPascalCase('foo')            // 'Foo'
toPascalCase('USER-NAME')      // 'UserName'

// 自定义分隔符
toPascalCase('user.name', '.') // 'UserName'
toPascalCase('user_name', '_') // 'UserName'

// 常用于生成类名或组件名
const componentName = toPascalCase('my-component')  // 'MyComponent'
```

---

## stripJsonComments

移除 JSON 字符串中的注释，使其可被 `JSON.parse` 解析。

```typescript
function stripJsonComments(jsonString: string): string
```

**参数**

| 参数       | 类型     | 说明             |
| ---------- | -------- | ---------------- |
| jsonString | `string` | 含注释的 JSON 字符串 |

**返回值**

`string` - 移除注释后的 JSON 字符串

**说明**

- 移除单行注释 `// ...`（到行尾）
- 移除多行注释 `/* ... */`
- 适用于解析带注释的 JSON 配置文件（如 `tsconfig.json`、`pages.json` 等）
- 不处理字符串字面量内的注释符号（简单实现，适用于常见场景）

**示例**

```typescript
const json = `
{
  // 这是一个注释
  "name": "test",
  /* 多行
     注释 */
  "value": 42
}
`

const cleaned = stripJsonComments(json)
const parsed = JSON.parse(cleaned)
// { name: 'test', value: 42 }

// 处理 pages.json（uni-app）
const pagesJson = `
{
  "pages": [
    { "path": "pages/index/index" }
  ],
  // 全局样式
  "globalStyle": { "navigationBarTitleText": "App" }
}
`
const config = JSON.parse(stripJsonComments(pagesJson))
```

---

## escapeRegex

转义字符串中的正则表达式特殊字符，使其可作为字面量用于正则匹配。

```typescript
function escapeRegex(str: string): string
```

**参数**

| 参数 | 类型     | 说明             |
| ---- | -------- | ---------------- |
| str  | `string` | 待转义的字符串   |

**返回值**

`string` - 转义后的字符串（可直接用于 `new RegExp()`）

**说明**

- 转义以下特殊字符：`. * + ? ^ $ { } ( ) | [ ] \`
- 适用于动态构建正则表达式时，将用户输入作为字面量匹配
- 防止用户输入中的特殊字符破坏正则表达式结构

**示例**

```typescript
// 基本转义
escapeRegex('hello.world')    // 'hello\\.world'
escapeRegex('a+b*c?')         // 'a\\+b\\*c\\?'
escapeRegex('(test)')         // '\\(test\\)'
escapeRegex('[abc]')          // '\\[abc\\]'
escapeRegex('C:\\Users')      // 'C:\\\\Users'

// 用于动态正则构建
const userInput = 'file.txt'
const pattern = new RegExp(escapeRegex(userInput), 'g')
text.match(pattern)  // 精确匹配 'file.txt' 而非 'fileXtxt'

// 用于路径匹配
const pathToMatch = '/api/v1/users'
const regex = new RegExp(`^${escapeRegex(pathToMatch)}`)
// 正确匹配 '/api/v1/users'，不会因 '.' 等特殊字符误匹配
```
