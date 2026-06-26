# common

Common utilities module providing 14 submodules covering concurrency control, code processing, compression, environment variables, file system operations, formatting, hashing, HTML injection, object merging, path handling, script utilities, strings, terminal UI, and validation.

All submodules support on-demand imports, and internal plugins also reuse logic through these common modules.

## Import Methods

### Barrel import (import all submodules)

```typescript
import { ... } from '@meng-xi/vite-plugin/common'
```

### Submodule import (recommended, supports tree-shaking)

```typescript
import { ... } from '@meng-xi/vite-plugin/common/code'
import { ... } from '@meng-xi/vite-plugin/common/compress'
import { ... } from '@meng-xi/vite-plugin/common/concurrency'
import { ... } from '@meng-xi/vite-plugin/common/env'
import { ... } from '@meng-xi/vite-plugin/common/fs'
import { ... } from '@meng-xi/vite-plugin/common/format'
import { ... } from '@meng-xi/vite-plugin/common/hash'
import { ... } from '@meng-xi/vite-plugin/common/html'
import { ... } from '@meng-xi/vite-plugin/common/object'
import { ... } from '@meng-xi/vite-plugin/common/path'
import { ... } from '@meng-xi/vite-plugin/common/script'
import { ... } from '@meng-xi/vite-plugin/common/string'
import { ... } from '@meng-xi/vite-plugin/common/ui'
import { ... } from '@meng-xi/vite-plugin/common/validation'
```

::: tip
Submodule imports allow bundlers to only include the code you actually use, avoiding unnecessary dependencies (e.g., `common/fs` depends on Node.js `fs`/`path` modules).
:::

## Module Categories

### File & Path

| Module | Description | Exports | Submodule Path |
| ------ | ----------- | ------- | -------------- |
| [fs](./fs) | File system utilities | 10 functions + 4 types | `@meng-xi/vite-plugin/common/fs` |
| [path](./path) | Path utilities | 4 functions | `@meng-xi/vite-plugin/common/path` |

### Formatting & Templates

| Module | Description | Exports | Submodule Path |
| ------ | ----------- | ------- | -------------- |
| [format](./format) | Date formatting, template variable replacement, plugin template parsing, file size formatting, compression ratio | 7 functions + 1 type | `@meng-xi/vite-plugin/common/format` |

### HTML & Script

| Module | Description | Exports | Submodule Path |
| ------ | ----------- | ------- | -------------- |
| [html](./html) | HTML injection, security filtering, attribute escaping | 4 functions + 8 types | `@meng-xi/vite-plugin/common/html` |
| [script](./script) | Callback function wrapping | 1 function | `@meng-xi/vite-plugin/common/script` |

### Code & String

| Module | Description | Exports | Submodule Path |
| ------ | ----------- | ------- | -------------- |
| [code](./code) | JS keyword set, code comment & string stripping | 1 constant + 1 function | `@meng-xi/vite-plugin/common/code` |
| [string](./string) | Case conversion, JSON comment removal, regex escaping | 4 functions | `@meng-xi/vite-plugin/common/string` |

### Object & Environment

| Module | Description | Exports | Submodule Path |
| ------ | ----------- | ------- | -------------- |
| [object](./object) | Deep object merging | 1 function | `@meng-xi/vite-plugin/common/object` |
| [env](./env) | `.env` file content parsing | 1 function | `@meng-xi/vite-plugin/common/env` |

### Hash & Compression

| Module | Description | Exports | Submodule Path |
| ------ | ----------- | ------- | -------------- |
| [hash](./hash) | Random hash generation | 1 function | `@meng-xi/vite-plugin/common/hash` |
| [compress](./compress) | gzip size calculation | 1 function | `@meng-xi/vite-plugin/common/compress` |

### Utilities & Validation

| Module | Description | Exports | Submodule Path |
| ------ | ----------- | ------- | -------------- |
| [concurrency](./concurrency) | Concurrency control | 1 function | `@meng-xi/vite-plugin/common/concurrency` |
| [validation](./validation) | Chainable parameter validator + 3 validation functions | 1 class + 3 functions | `@meng-xi/vite-plugin/common/validation` |
| [ui](./ui) | Terminal ANSI escape code toolkit | 1 object | `@meng-xi/vite-plugin/common/ui` |
