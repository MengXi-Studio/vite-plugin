# common

Common utilities module providing file system operations, formatting, HTML injection, object handling, script utilities, and validation.

## Import Methods

### Barrel import (import all submodules)

```typescript
import { ... } from '@meng-xi/vite-plugin/common'
```

### Submodule import (recommended, supports tree-shaking)

```typescript
import { ... } from '@meng-xi/vite-plugin/common/fs'
import { ... } from '@meng-xi/vite-plugin/common/format'
import { ... } from '@meng-xi/vite-plugin/common/html'
import { ... } from '@meng-xi/vite-plugin/common/object'
import { ... } from '@meng-xi/vite-plugin/common/script'
import { ... } from '@meng-xi/vite-plugin/common/validation'
```

::: tip Submodule imports allow bundlers to only include the code you actually use, avoiding unnecessary dependencies (e.g., `common/fs` depends on Node.js `fs`/`path`/`crypto` modules). :::

## Modules

| Module                     | Description               | Submodule Path                           |
| -------------------------- | ------------------------- | ---------------------------------------- |
| [fs](./fs)                 | File system utilities     | `@meng-xi/vite-plugin/common/fs`         |
| [format](./format)         | Formatting utilities      | `@meng-xi/vite-plugin/common/format`     |
| [html](./html)             | HTML injection utilities  | `@meng-xi/vite-plugin/common/html`       |
| [object](./object)         | Object handling utilities | `@meng-xi/vite-plugin/common/object`     |
| [script](./script)         | Script utilities          | `@meng-xi/vite-plugin/common/script`     |
| [validation](./validation) | Parameter validator       | `@meng-xi/vite-plugin/common/validation` |
