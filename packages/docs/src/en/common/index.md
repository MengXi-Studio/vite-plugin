# common

Common utilities module providing compression, file system operations, formatting, HTML injection, object handling, path utilities, script utilities, and validation.

## Import Methods

### Barrel import (import all submodules)

```typescript
import { ... } from '@meng-xi/vite-plugin/common'
```

### Submodule import (recommended, supports tree-shaking)

```typescript
import { ... } from '@meng-xi/vite-plugin/common/compress'
import { ... } from '@meng-xi/vite-plugin/common/fs'
import { ... } from '@meng-xi/vite-plugin/common/format'
import { ... } from '@meng-xi/vite-plugin/common/html'
import { ... } from '@meng-xi/vite-plugin/common/object'
import { ... } from '@meng-xi/vite-plugin/common/path'
import { ... } from '@meng-xi/vite-plugin/common/script'
import { ... } from '@meng-xi/vite-plugin/common/validation'
```

::: tip Submodule imports allow bundlers to only include the code you actually use, avoiding unnecessary dependencies (e.g., `common/fs` depends on Node.js `fs`/`path`/`crypto` modules). :::

## Modules

| Module                     | Description               | Submodule Path                           |
| -------------------------- | ------------------------- | ---------------------------------------- |
| [compress](./compress)     | Compression utilities     | `@meng-xi/vite-plugin/common/compress`   |
| [fs](./fs)                 | File system utilities     | `@meng-xi/vite-plugin/common/fs`         |
| [format](./format)         | Formatting utilities      | `@meng-xi/vite-plugin/common/format`     |
| [html](./html)             | HTML injection utilities  | `@meng-xi/vite-plugin/common/html`       |
| [object](./object)         | Object handling utilities | `@meng-xi/vite-plugin/common/object`     |
| [path](./path)             | Path utilities            | `@meng-xi/vite-plugin/common/path`       |
| [script](./script)         | Script utilities          | `@meng-xi/vite-plugin/common/script`     |
| [validation](./validation) | Parameter validator       | `@meng-xi/vite-plugin/common/validation` |
