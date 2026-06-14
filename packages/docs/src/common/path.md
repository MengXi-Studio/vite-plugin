# path

路径处理工具，提供跨平台路径规范化、扩展名过滤、路径排除匹配和压缩格式检测功能。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { normalizePath, isExtensionIncluded, isPathExcluded, isPreCompressed } from '@meng-xi/vite-plugin/common/path'

// barrel 导入
import { normalizePath, isExtensionIncluded, isPathExcluded, isPreCompressed } from '@meng-xi/vite-plugin/common'
```

---

## normalizePath

将路径中的反斜杠转换为正斜杠，确保跨平台一致性。

```typescript
function normalizePath(filePath: string): string
```

**参数**

| 参数     | 类型     | 说明         |
| -------- | -------- | ------------ |
| filePath | `string` | 待规范化的文件路径 |

**返回值**

`string` - 使用正斜杠的路径字符串

**说明**

- Windows 系统下路径使用反斜杠 `\`，而 Unix 系统使用正斜杠 `/`
- 统一转换为正斜杠可避免跨平台路径比较失败

**示例**

```typescript
normalizePath('assets\\index-abc123.js')
// 'assets/index-abc123.js'

normalizePath('assets/index.js')
// 'assets/index.js'
```

---

## isExtensionIncluded

检查文件扩展名是否通过包含/排除过滤条件。

```typescript
function isExtensionIncluded(
  ext: string,
  options: { includeExtensions?: string[]; excludeExtensions?: string[] }
): boolean
```

**参数**

| 参数    | 类型       | 说明                                   |
| ------- | ---------- | -------------------------------------- |
| ext     | `string`   | 文件扩展名（小写，含点号，如 `.js`）   |
| options | `object`   | 过滤选项                               |

**options**

| 属性              | 类型       | 默认值 | 说明                                 |
| ----------------- | ---------- | ------ | ------------------------------------ |
| includeExtensions | `string[]` | `[]`   | 包含的扩展名列表（为空则包含所有）   |
| excludeExtensions | `string[]` | `[]`   | 排除的扩展名列表                     |

**返回值**

`boolean` - 扩展名是否通过过滤（`true` 表示应包含该文件）

**判断优先级**

1. 如果 `excludeExtensions` 非空且扩展名在其中，返回 `false`
2. 如果 `includeExtensions` 非空且扩展名不在其中，返回 `false`
3. 其余情况返回 `true`

**示例**

```typescript
isExtensionIncluded('.js', { includeExtensions: ['.js', '.css'], excludeExtensions: [] })
// true

isExtensionIncluded('.map', { includeExtensions: [], excludeExtensions: ['.map'] })
// false

isExtensionIncluded('.js', { includeExtensions: [], excludeExtensions: [] })
// true（两个列表均为空，包含所有）
```

---

## isPathExcluded

检查文件路径是否匹配排除路径列表。

```typescript
function isPathExcluded(
  relativePath: string,
  excludePaths: string[],
  options?: { matchMode?: 'simple' | 'segment' }
): boolean
```

**参数**

| 参数         | 类型       | 默认值     | 说明                                                   |
| ------------ | ---------- | ---------- | ------------------------------------------------------ |
| relativePath | `string`   | -          | 文件的相对路径（应先使用 `normalizePath` 规范化）      |
| excludePaths | `string[]` | -          | 排除路径列表                                           |
| options      | `object`   | `{}`       | 匹配选项                                               |

**options**

| 属性      | 类型     | 默认值    | 说明     |
| --------- | -------- | --------- | -------- |
| matchMode | `'simple' \| 'segment'` | `'simple'` | 匹配模式 |

**匹配模式说明**

| 模式      | 说明                                                                        |
| --------- | --------------------------------------------------------------------------- |
| `simple`  | 简单的 `startsWith` / `includes` 匹配                                      |
| `segment` | 基于路径段边界的精确匹配，避免子字符串误匹配（如 `testdata/` 不会被 `test` 排除） |

**返回值**

`boolean` - 路径是否应被排除（`true` 表示应排除）

**说明**

- 路径比较前会自动调用 `normalizePath` 统一分隔符
- `segment` 模式确保 `excludePaths: ['test']` 不会误排除 `testdata/`

**示例**

```typescript
isPathExcluded('assets/test/file.js', ['test'])
// true（simple 模式，默认）

isPathExcluded('testdata/file.js', ['test'], { matchMode: 'segment' })
// false（segment 模式，'testdata' 不等于路径段 'test'）

isPathExcluded('assets/test/file.js', ['test'], { matchMode: 'segment' })
// true（'test' 匹配路径段）
```

---

## isPreCompressed

检查扩展名是否为已压缩格式。

```typescript
function isPreCompressed(ext: string): boolean
```

**参数**

| 参数 | 类型     | 说明                           |
| ---- | -------- | ------------------------------ |
| ext  | `string` | 文件扩展名（小写，含点号）     |

**返回值**

`boolean` - 是否为已压缩格式（`.gz` 或 `.br`）

**示例**

```typescript
isPreCompressed('.gz')   // true
isPreCompressed('.br')   // true
isPreCompressed('.js')   // false
```
