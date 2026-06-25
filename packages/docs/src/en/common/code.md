# code

Code processing utilities, providing a JavaScript keyword set and a function to strip comments and strings, used for static code analysis and keyword detection scenarios.

## Import Methods

```typescript
// Submodule import (recommended)
import { JS_KEYWORDS, stripCommentsAndStrings } from '@meng-xi/vite-plugin/common/code'

// Barrel import
import { JS_KEYWORDS, stripCommentsAndStrings } from '@meng-xi/vite-plugin/common'
```

---

## JS_KEYWORDS

A set of JavaScript keywords and global built-in objects, used for keyword detection, lexical analysis, and similar scenarios.

```typescript
const JS_KEYWORDS: Set<string>
```

**Description**

- Includes ECMAScript keywords (`break`, `case`, `class`, `const`, `let`, etc.)
- Includes reserved words (`await`, `async`, `yield`, `of`, etc.)
- Includes literals (`true`, `false`, `null`, `undefined`, `NaN`, `Infinity`)
- Includes global objects (`console`, `window`, `document`, `globalThis`, `process`, etc.)
- Includes built-in constructors and types (`Object`, `Array`, `String`, `Number`, `Promise`, `Map`, `Set`, `RegExp`, `Date`, etc.)
- Includes error types (`Error`, `TypeError`, `RangeError`, `SyntaxError`, `ReferenceError`)
- Includes typed arrays (`Int8Array`, `Uint8Array`, `Float32Array`, `DataView`, `ArrayBuffer`, etc.)

**Examples**

```typescript
JS_KEYWORDS.has('class')    // true
JS_KEYWORDS.has('myVar')    // false
JS_KEYWORDS.has('Promise')  // true

// Used to filter out non-business identifiers
const identifiers = ['myFunc', 'console', 'myVar', 'class']
const businessIds = identifiers.filter(id => !JS_KEYWORDS.has(id))
// ['myFunc', 'myVar']
```

---

## stripCommentsAndStrings

Removes comments and string contents from JavaScript/TypeScript code while preserving the code structure, for subsequent static analysis (such as identifier extraction, keyword detection).

```typescript
function stripCommentsAndStrings(code: string): string
```

**Parameters**

| Parameter | Type     | Description       |
| --------- | -------- | ----------------- |
| code      | `string` | Source code string |

**Returns**

`string` - Code with comments and string contents removed (preserves newlines to keep line numbers aligned)

**Processing Rules**

| Syntax Element        | Processing                                                   |
| --------------------- | ------------------------------------------------------------ |
| Single-line comment `//` | Content replaced with spaces, newline preserved              |
| Multi-line comment `/* */` | Content replaced with spaces, newlines preserved (to keep line numbers aligned) |
| Single-quoted string `'...'` | Content replaced with spaces, escape sequences preserve length |
| Double-quoted string `"..."` | Content replaced with spaces, escape sequences preserve length |
| Template literal `` `...` `` | Content replaced with spaces, but `${...}` expression content is preserved |

**Description**

- Newlines are preserved to maintain line number alignment for error location
- Escape sequences in strings (e.g., `\n`, `\t`) are treated as 2-character length to keep length consistent
- `${expression}` content in template literals is preserved as-is because it may contain business logic
- Suitable for preprocessing before static code analysis to avoid comments and strings interfering with identifier extraction

**Examples**

```typescript
const code = `
  // single-line comment
  const name = "hello"
  /* multi-line
     comment */
  const template = \`prefix \${value} suffix\`
`

const stripped = stripCommentsAndStrings(code)
// Result:
//   (spaces)
//   const name =           (string content removed)
//   (spaces, newline preserved)
//   (spaces)
//   const template = `prefix ${value} suffix`  (template string content removed, but ${value} preserved)
```
