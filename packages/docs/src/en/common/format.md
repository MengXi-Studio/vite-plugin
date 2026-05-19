# format

Formatting utilities.

```typescript
import { padNumber, generateRandomHash, getDateFormatParams, formatDate, parseTemplate, toCamelCase, toPascalCase, stripJsonComments } from '@meng-xi/vite-plugin/common'
```

## padNumber

Pad number with leading zeros.

```typescript
function padNumber(num: number, length?: number): string
```

**Parameters**

| Parameter | Type     | Default | Description      |
| --------- | -------- | ------- | ---------------- |
| num       | `number` | -       | Number to format |
| length    | `number` | `2`     | Target length    |

**Returns**

`string` - Zero-padded string

**Examples**

```typescript
padNumber(5, 2) // '05'
padNumber(12, 3) // '012'
padNumber(123, 2) // '123'
```

---

## generateRandomHash

Generate random hash string (length 1-64).

```typescript
function generateRandomHash(length?: number): string
```

**Parameters**

| Parameter | Type     | Default | Description        |
| --------- | -------- | ------- | ------------------ |
| length    | `number` | `8`     | Hash length (1-64) |

**Returns**

`string` - Random hash string

**Examples**

```typescript
generateRandomHash(8) // 'a1b2c3d4'
generateRandomHash(16) // 'a1b2c3d4e5f6g7h8'
```

---

## getDateFormatParams

Get date formatting parameters object.

```typescript
function getDateFormatParams(date?: Date): DateFormatOptions
```

**Parameters**

| Parameter | Type   | Default      | Description |
| --------- | ------ | ------------ | ----------- |
| date      | `Date` | `new Date()` | Date object |

**DateFormatOptions**

| Property  | Type     | Description        |
| --------- | -------- | ------------------ |
| YYYY      | `string` | Four-digit year    |
| YY        | `string` | Two-digit year     |
| MM        | `string` | Two-digit month    |
| DD        | `string` | Two-digit day      |
| HH        | `string` | Two-digit hour     |
| mm        | `string` | Two-digit minute   |
| ss        | `string` | Two-digit second   |
| SSS       | `string` | Three-digit millis |
| timestamp | `string` | Timestamp (ms)     |

**Example**

```typescript
const params = getDateFormatParams(new Date())
// { YYYY: '2026', MM: '02', DD: '03', HH: '15', mm: '30', ss: '00', ... }
```

---

## formatDate

Format date with placeholders.

```typescript
function formatDate(date: Date, format: string): string
```

**Parameters**

| Parameter | Type     | Description     |
| --------- | -------- | --------------- |
| date      | `Date`   | Date object     |
| format    | `string` | Format template |

**Supported Placeholders**

| Placeholder | Description        | Example    |
| ----------- | ------------------ | ---------- |
| {YYYY}      | Four-digit year    | 2026       |
| {YY}        | Two-digit year     | 26         |
| {MM}        | Two-digit month    | 02         |
| {DD}        | Two-digit day      | 03         |
| {HH}        | Two-digit hour     | 15         |
| {mm}        | Two-digit minute   | 30         |
| {ss}        | Two-digit second   | 00         |
| {SSS}       | Three-digit millis | 123        |
| {timestamp} | Timestamp          | 1738567800 |

**Examples**

```typescript
formatDate(new Date(), '{YYYY}-{MM}-{DD}') // '2026-02-03'
formatDate(new Date(), '{YYYY}{MM}{DD}{HH}{mm}{ss}') // '20260203153000'
formatDate(new Date(), '{YYYY}.{MM}.{DD}') // '2026.02.03'
```

---

## parseTemplate

Parse template string with placeholders.

```typescript
function parseTemplate(template: string, values: Record<string, string>): string
```

**Parameters**

| Parameter | Type                     | Description           |
| --------- | ------------------------ | --------------------- |
| template  | `string`                 | Template string       |
| values    | `Record<string, string>` | Placeholder value map |

**Returns**

`string` - Replaced string

**Example**

```typescript
parseTemplate('{name}-{version}', { name: 'app', version: '1.0.0' })
// 'app-1.0.0'
```

---

## toCamelCase

Convert string to camelCase.

```typescript
function toCamelCase(str: string, separators?: RegExp): string
```

**Parameters**

| Parameter  | Type     | Default  | Description     |
| ---------- | -------- | -------- | --------------- |
| str        | `string` | -        | Input string    |
| separators | `RegExp` | `/[/-]/` | Separator regex |

**Returns**

`string` - CamelCase string

**Examples**

```typescript
toCamelCase('pages/user/profile') // 'pagesUserProfile'
toCamelCase('user-profile-page') // 'userProfilePage'
toCamelCase('/pages/index') // 'pagesIndex'
```

---

## toPascalCase

Convert string to PascalCase.

```typescript
function toPascalCase(str: string, separators?: RegExp): string
```

**Parameters**

| Parameter  | Type     | Default  | Description     |
| ---------- | -------- | -------- | --------------- |
| str        | `string` | -        | Input string    |
| separators | `RegExp` | `/[/-]/` | Separator regex |

**Returns**

`string` - PascalCase string

**Examples**

```typescript
toPascalCase('pages/user/profile') // 'PagesUserProfile'
toPascalCase('user-profile-page') // 'UserProfilePage'
toPascalCase('/pages/index') // 'PagesIndex'
```

---

## stripJsonComments

Remove comments from JSON string.

```typescript
function stripJsonComments(jsonString: string): string
```

**Parameters**

| Parameter  | Type     | Description               |
| ---------- | -------- | ------------------------- |
| jsonString | `string` | JSON string with comments |

**Returns**

`string` - JSON string without comments

**Example**

```typescript
stripJsonComments('{\n  // comment\n  "name": "test"\n}')
// '{\n  "name": "test"\n}'
```
