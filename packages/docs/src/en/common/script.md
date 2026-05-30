# script

Script utilities providing callback wrapping and security validation.

## Import Methods

```typescript
// Submodule import (recommended)
import { makeCallback, containsScriptTag, validateIdentifierName } from '@meng-xi/vite-plugin/common/script'

// Barrel import
import { makeCallback, containsScriptTag, validateIdentifierName } from '@meng-xi/vite-plugin/common'
```

---

## makeCallback

Wrap a callback function body string into a safe function expression (with try-catch protection).

```typescript
function makeCallback(body?: string, context?: string, params?: string): string
```

**Parameters**

| Parameter | Type     | Default      | Description                                |
| --------- | -------- | ------------ | ------------------------------------------ |
| body      | `string` | -            | Function body code string                  |
| context   | `string` | `'callback'` | Callback context identifier for error logs |
| params    | `string` | `''`         | Function parameter list string             |

**Returns**

`string` - Safe function expression string

**Examples**

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

Check if a string contains a `<script>` tag.

```typescript
function containsScriptTag(str: string): boolean
```

**Parameters**

| Parameter | Type     | Description     |
| --------- | -------- | --------------- |
| str       | `string` | String to check |

**Returns**

`boolean` - Whether the string contains a script tag

**Examples**

```typescript
containsScriptTag('<div onclick="alert(1)">') // false
containsScriptTag('<script>alert(1)</script>') // true
```

---

## validateIdentifierName

Validate whether a string is a valid JavaScript identifier.

Checks that the name starts with a letter, underscore, or dollar sign, contains only letters, digits, underscores, and dollar signs, and excludes built-in properties that could cause prototype pollution.

```typescript
function validateIdentifierName(name: string): void
```

**Parameters**

| Parameter | Type     | Description                 |
| --------- | -------- | --------------------------- |
| name      | `string` | Identifier name to validate |

**Throws**

| Condition          | Error Message                                                                      |
| ------------------ | ---------------------------------------------------------------------------------- |
| Invalid identifier | `"<name>" is not a valid JavaScript identifier...`                                 |
| Built-in property  | `"<name>" is a JavaScript built-in property that may cause prototype pollution...` |

**Examples**

```typescript
validateIdentifierName('__LOADING_MANAGER__') // Passes
validateIdentifierName('123abc') // Throws: not a valid identifier
validateIdentifierName('__proto__') // Throws: built-in property
validateIdentifierName('constructor') // Throws: built-in property
```
