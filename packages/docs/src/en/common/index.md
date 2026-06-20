# common

Common utilities module providing 8 submodules covering concurrency control, file system operations, formatting, HTML injection, path handling, script utilities, terminal UI, and validation.

All submodules support on-demand imports, and internal plugins also reuse logic through these common modules.

## Import Methods

### Barrel import (import all submodules)

```typescript
import { ... } from '@meng-xi/vite-plugin/common'
```

### Submodule import (recommended, supports tree-shaking)

```typescript
import { ... } from '@meng-xi/vite-plugin/common/concurrency'
import { ... } from '@meng-xi/vite-plugin/common/fs'
import { ... } from '@meng-xi/vite-plugin/common/format'
import { ... } from '@meng-xi/vite-plugin/common/html'
import { ... } from '@meng-xi/vite-plugin/common/path'
import { ... } from '@meng-xi/vite-plugin/common/script'
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
| [format](./format) | Date formatting, template variable replacement, file size formatting, compression ratio | 6 functions + 1 type | `@meng-xi/vite-plugin/common/format` |

### HTML & Script

| Module | Description | Exports | Submodule Path |
| ------ | ----------- | ------- | -------------- |
| [html](./html) | HTML injection, security filtering, attribute escaping | 4 functions + 8 types | `@meng-xi/vite-plugin/common/html` |
| [script](./script) | Callback function wrapping | 1 function | `@meng-xi/vite-plugin/common/script` |

### Utilities & Validation

| Module | Description | Exports | Submodule Path |
| ------ | ----------- | ------- | -------------- |
| [concurrency](./concurrency) | Concurrency control | 1 function | `@meng-xi/vite-plugin/common/concurrency` |
| [validation](./validation) | Chainable parameter validator + 3 validation functions | 1 class + 3 functions | `@meng-xi/vite-plugin/common/validation` |
| [ui](./ui) | Terminal ANSI escape code toolkit | 1 object | `@meng-xi/vite-plugin/common/ui` |
