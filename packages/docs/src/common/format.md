# format

格式化工具。

```typescript
import { padNumber, generateRandomHash, getDateFormatParams, formatDate, parseTemplate, toCamelCase, toPascalCase, stripJsonComments } from '@meng-xi/vite-plugin/common'
```

## padNumber

数字补零格式化。

```typescript
function padNumber(num: number, length?: number): string
```

**参数**

| 参数   | 类型     | 默认值 | 说明           |
| ------ | -------- | ------ | -------------- |
| num    | `number` | -      | 要格式化的数字 |
| length | `number` | `2`    | 目标长度       |

**返回值**

`string` - 补零后的字符串

**示例**

```typescript
padNumber(5, 2) // '05'
padNumber(12, 3) // '012'
padNumber(123, 2) // '123'
```

---

## generateRandomHash

生成随机哈希字符串。

```typescript
function generateRandomHash(length?: number): string
```

**参数**

| 参数   | 类型     | 默认值 | 说明             |
| ------ | -------- | ------ | ---------------- |
| length | `number` | `8`    | 哈希长度（1-64） |

**返回值**

`string` - 随机哈希字符串

**示例**

```typescript
generateRandomHash(8) // 'a1b2c3d4'
generateRandomHash(16) // 'a1b2c3d4e5f6g7h8'
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

**DateFormatOptions**

| 属性      | 类型     | 说明           |
| --------- | -------- | -------------- |
| YYYY      | `string` | 四位年份       |
| YY        | `string` | 两位年份       |
| MM        | `string` | 两位月份       |
| DD        | `string` | 两位日期       |
| HH        | `string` | 两位小时       |
| mm        | `string` | 两位分钟       |
| ss        | `string` | 两位秒数       |
| SSS       | `string` | 三位毫秒       |
| timestamp | `string` | 时间戳（毫秒） |

**示例**

```typescript
const params = getDateFormatParams(new Date())
// { YYYY: '2026', MM: '02', DD: '03', HH: '15', mm: '30', ss: '00', ... }
```

---

## formatDate

格式化日期。

```typescript
function formatDate(date: Date, format: string): string
```

**参数**

| 参数   | 类型     | 说明     |
| ------ | -------- | -------- |
| date   | `Date`   | 日期对象 |
| format | `string` | 格式模板 |

**支持的占位符**

| 占位符      | 说明     | 示例       |
| ----------- | -------- | ---------- |
| {YYYY}      | 四位年份 | 2026       |
| {YY}        | 两位年份 | 26         |
| {MM}        | 两位月份 | 02         |
| {DD}        | 两位日期 | 03         |
| {HH}        | 两位小时 | 15         |
| {mm}        | 两位分钟 | 30         |
| {ss}        | 两位秒数 | 00         |
| {SSS}       | 三位毫秒 | 123        |
| {timestamp} | 时间戳   | 1738567800 |

**示例**

```typescript
formatDate(new Date(), '{YYYY}-{MM}-{DD}') // '2026-02-03'
formatDate(new Date(), '{YYYY}{MM}{DD}{HH}{mm}{ss}') // '20260203153000'
formatDate(new Date(), '{YYYY}.{MM}.{DD}') // '2026.02.03'
```

---

## parseTemplate

解析模板字符串，替换占位符。

```typescript
function parseTemplate(template: string, values: Record<string, string>): string
```

**参数**

| 参数     | 类型                     | 说明         |
| -------- | ------------------------ | ------------ |
| template | `string`                 | 模板字符串   |
| values   | `Record<string, string>` | 占位符值映射 |

**返回值**

`string` - 替换后的字符串

**示例**

```typescript
parseTemplate('{name}-{version}', { name: 'app', version: '1.0.0' })
// 'app-1.0.0'
```

---

## toCamelCase

将字符串转换为驼峰命名（camelCase）。

```typescript
function toCamelCase(str: string, separators?: RegExp): string
```

**参数**

| 参数       | 类型     | 默认值   | 说明       |
| ---------- | -------- | -------- | ---------- |
| str        | `string` | -        | 输入字符串 |
| separators | `RegExp` | `/[/-]/` | 分隔符正则 |

**返回值**

`string` - 驼峰命名字符串

**示例**

```typescript
toCamelCase('pages/user/profile') // 'pagesUserProfile'
toCamelCase('user-profile-page') // 'userProfilePage'
toCamelCase('/pages/index') // 'pagesIndex'
```

---

## toPascalCase

将字符串转换为帕斯卡命名（PascalCase）。

```typescript
function toPascalCase(str: string, separators?: RegExp): string
```

**参数**

| 参数       | 类型     | 默认值   | 说明       |
| ---------- | -------- | -------- | ---------- |
| str        | `string` | -        | 输入字符串 |
| separators | `RegExp` | `/[/-]/` | 分隔符正则 |

**返回值**

`string` - 帕斯卡命名字符串

**示例**

```typescript
toPascalCase('pages/user/profile') // 'PagesUserProfile'
toPascalCase('user-profile-page') // 'UserProfilePage'
toPascalCase('/pages/index') // 'PagesIndex'
```

---

## stripJsonComments

移除 JSON 字符串中的注释。

```typescript
function stripJsonComments(jsonString: string): string
```

**参数**

| 参数       | 类型     | 说明            |
| ---------- | -------- | --------------- |
| jsonString | `string` | 包含注释的 JSON |

**返回值**

`string` - 移除注释后的 JSON 字符串

**示例**

```typescript
stripJsonComments('{\n  // comment\n  "name": "test"\n}')
// '{\n  "name": "test"\n}'
```
