# string

String processing utilities, providing case conversion, JSON comment removal, regex escaping, and other common string processing functions.

## Import Methods

```typescript
// Submodule import (recommended)
import { toCamelCase, toPascalCase, stripJsonComments, escapeRegex } from '@meng-xi/vite-plugin/common/string'

// Barrel import
import { toCamelCase, toPascalCase, stripJsonComments, escapeRegex } from '@meng-xi/vite-plugin/common'
```

---

## toCamelCase

Converts a string to camelCase (first word lowercase, subsequent words capitalized).

```typescript
function toCamelCase(str: string, separators?: RegExp): string
```

**Parameters**

| Parameter  | Type      | Default   | Description                          |
| ---------- | --------- | --------- | ------------------------------------ |
| str        | `string`  | -         | String to convert                    |
| separators | `RegExp`  | `/[/-]/`  | Word separator regex (slash or hyphen) |

**Returns**

`string` - camelCase string

**Description**

- First removes leading slashes `/` (for handling path-like strings)
- Splits words by separator
- First word is fully lowercase; subsequent words have a capitalized first letter and lowercase rest
- Empty string segments are filtered out

**Examples**

```typescript
toCamelCase('user-name')      // 'userName'
toCamelCase('user/name')      // 'userName'
toCamelCase('/api/user/list') // 'apiUserList'
toCamelCase('foo')            // 'foo'
toCamelCase('USER-NAME')      // 'userName'

// Custom separators
toCamelCase('user.name', '.') // 'userName'
toCamelCase('user_name', '_') // 'userName'
```

---

## toPascalCase

Converts a string to PascalCase (all words capitalized).

```typescript
function toPascalCase(str: string, separators?: RegExp): string
```

**Parameters**

| Parameter  | Type      | Default   | Description                          |
| ---------- | --------- | --------- | ------------------------------------ |
| str        | `string`  | -         | String to convert                    |
| separators | `RegExp`  | `/[/-]/`  | Word separator regex (slash or hyphen) |

**Returns**

`string` - PascalCase string

**Description**

- First removes leading slashes `/` (for handling path-like strings)
- Splits words by separator
- Each word has a capitalized first letter and lowercase rest
- Empty string segments are filtered out

**Examples**

```typescript
toPascalCase('user-name')      // 'UserName'
toPascalCase('user/name')      // 'UserName'
toPascalCase('/api/user/list') // 'ApiUserList'
toPascalCase('foo')            // 'Foo'
toPascalCase('USER-NAME')      // 'UserName'

// Custom separators
toPascalCase('user.name', '.') // 'UserName'
toPascalCase('user_name', '_') // 'UserName'

// Commonly used for generating class or component names
const componentName = toPascalCase('my-component')  // 'MyComponent'
```

---

## stripJsonComments

Removes comments from a JSON string so it can be parsed by `JSON.parse`.

```typescript
function stripJsonComments(jsonString: string): string
```

**Parameters**

| Parameter  | Type     | Description                |
| ---------- | -------- | -------------------------- |
| jsonString | `string` | JSON string with comments  |

**Returns**

`string` - JSON string with comments removed

**Description**

- Removes single-line comments `// ...` (to end of line)
- Removes multi-line comments `/* ... */`
- Suitable for parsing JSON config files with comments (e.g., `tsconfig.json`, `pages.json`)
- Does not handle comment symbols inside string literals (simple implementation for common scenarios)

**Examples**

```typescript
const json = `
{
  // This is a comment
  "name": "test",
  /* Multi-line
     comment */
  "value": 42
}
`

const cleaned = stripJsonComments(json)
const parsed = JSON.parse(cleaned)
// { name: 'test', value: 42 }

// Processing pages.json (uni-app)
const pagesJson = `
{
  "pages": [
    { "path": "pages/index/index" }
  ],
  // Global style
  "globalStyle": { "navigationBarTitleText": "App" }
}
`
const config = JSON.parse(stripJsonComments(pagesJson))
```

---

## escapeRegex

Escapes regex special characters in a string so it can be used as a literal in regular expressions.

```typescript
function escapeRegex(str: string): string
```

**Parameters**

| Parameter | Type     | Description            |
| --------- | -------- | ---------------------- |
| str       | `string` | String to escape       |

**Returns**

`string` - Escaped string (can be used directly in `new RegExp()`)

**Description**

- Escapes the following special characters: `. * + ? ^ $ { } ( ) | [ ] \`
- Useful when building regex dynamically with user input as a literal match
- Prevents special characters in user input from breaking the regex structure

**Examples**

```typescript
// Basic escaping
escapeRegex('hello.world')    // 'hello\\.world'
escapeRegex('a+b*c?')         // 'a\\+b\\*c\\?'
escapeRegex('(test)')         // '\\(test\\)'
escapeRegex('[abc]')          // '\\[abc\\]'
escapeRegex('C:\\Users')      // 'C:\\\\Users'

// For dynamic regex building
const userInput = 'file.txt'
const pattern = new RegExp(escapeRegex(userInput), 'g')
text.match(pattern)  // Matches 'file.txt' exactly, not 'fileXtxt'

// For path matching
const pathToMatch = '/api/v1/users'
const regex = new RegExp(`^${escapeRegex(pathToMatch)}`)
// Correctly matches '/api/v1/users' without false matches from '.' etc.
```
