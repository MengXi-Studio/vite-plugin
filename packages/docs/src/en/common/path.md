# path

Path utilities providing cross-platform path normalization, extension filtering, path exclusion matching, and compression format detection.

## Import Methods

```typescript
// Submodule import (recommended)
import { normalizePath, isExtensionIncluded, isPathExcluded, isPreCompressed } from '@meng-xi/vite-plugin/common/path'

// Barrel import
import { normalizePath, isExtensionIncluded, isPathExcluded, isPreCompressed } from '@meng-xi/vite-plugin/common'
```

---

## normalizePath

Convert backslashes to forward slashes in a path for cross-platform consistency.

```typescript
function normalizePath(filePath: string): string
```

**Parameters**

| Parameter | Type     | Description           |
| --------- | -------- | --------------------- |
| filePath  | `string` | File path to normalize |

**Returns**

`string` - Path string using forward slashes

**Description**

- Windows uses backslashes `\` while Unix uses forward slashes `/`
- Converting to forward slashes avoids cross-platform path comparison failures

**Example**

```typescript
normalizePath('assets\\index-abc123.js')
// 'assets/index-abc123.js'

normalizePath('assets/index.js')
// 'assets/index.js'
```

---

## isExtensionIncluded

Check if a file extension passes include/exclude filter conditions.

```typescript
function isExtensionIncluded(
  ext: string,
  options: { includeExtensions?: string[]; excludeExtensions?: string[] }
): boolean
```

**Parameters**

| Parameter | Type       | Description                                        |
| --------- | ---------- | -------------------------------------------------- |
| ext       | `string`   | File extension (lowercase, with dot, e.g. `.js`)   |
| options   | `object`   | Filter options                                      |

**options**

| Property          | Type       | Default | Description                                           |
| ----------------- | ---------- | ------- | ----------------------------------------------------- |
| includeExtensions | `string[]` | `[]`    | List of extensions to include (empty includes all)    |
| excludeExtensions | `string[]` | `[]`    | List of extensions to exclude                         |

**Returns**

`boolean` - Whether the extension passes the filter (`true` means the file should be included)

**Priority**

1. If `excludeExtensions` is non-empty and the extension is in it, returns `false`
2. If `includeExtensions` is non-empty and the extension is not in it, returns `false`
3. Otherwise returns `true`

**Example**

```typescript
isExtensionIncluded('.js', { includeExtensions: ['.js', '.css'], excludeExtensions: [] })
// true

isExtensionIncluded('.map', { includeExtensions: [], excludeExtensions: ['.map'] })
// false

isExtensionIncluded('.js', { includeExtensions: [], excludeExtensions: [] })
// true (both lists empty, includes all)
```

---

## isPathExcluded

Check if a file path matches an exclusion path list.

```typescript
function isPathExcluded(
  relativePath: string,
  excludePaths: string[],
  options?: { matchMode?: 'simple' | 'segment' }
): boolean
```

**Parameters**

| Parameter    | Type       | Default    | Description                                                              |
| ------------ | ---------- | ---------- | ------------------------------------------------------------------------ |
| relativePath | `string`   | -          | Relative file path (should be normalized with `normalizePath` first)     |
| excludePaths | `string[]` | -          | List of exclusion paths                                                  |
| options      | `object`   | `{}`       | Matching options                                                         |

**options**

| Property   | Type     | Default    | Description     |
| ---------- | -------- | ---------- | --------------- |
| matchMode  | `'simple' \| 'segment'` | `'simple'` | Matching mode   |

**Matching Modes**

| Mode     | Description                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------- |
| `simple` | Simple `startsWith` / `includes` matching                                                                       |
| `segment` | Path segment boundary matching, avoiding substring false matches (e.g. `testdata/` won't be excluded by `test`) |

**Returns**

`boolean` - Whether the path should be excluded (`true` means excluded)

**Description**

- Paths are automatically normalized using `normalizePath` before comparison
- `segment` mode ensures `excludePaths: ['test']` won't accidentally exclude `testdata/`

**Example**

```typescript
isPathExcluded('assets/test/file.js', ['test'])
// true (simple mode, default)

isPathExcluded('testdata/file.js', ['test'], { matchMode: 'segment' })
// false (segment mode, 'testdata' != path segment 'test')

isPathExcluded('assets/test/file.js', ['test'], { matchMode: 'segment' })
// true ('test' matches path segment)
```

---

## isPreCompressed

Check if an extension is a pre-compressed format.

```typescript
function isPreCompressed(ext: string): boolean
```

**Parameters**

| Parameter | Type     | Description                                 |
| --------- | -------- | ------------------------------------------- |
| ext       | `string` | File extension (lowercase, with dot)        |

**Returns**

`boolean` - Whether it is a pre-compressed format (`.gz` or `.br`)

**Example**

```typescript
isPreCompressed('.gz')   // true
isPreCompressed('.br')   // true
isPreCompressed('.js')   // false
```
