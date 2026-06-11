# common

Common utilities module providing concurrency control, file system operations, formatting, HTML injection, script utilities, terminal UI, and validation.

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
import { ... } from '@meng-xi/vite-plugin/common/script'
import { ... } from '@meng-xi/vite-plugin/common/ui'
import { ... } from '@meng-xi/vite-plugin/common/validation'
```

::: tip Submodule imports allow bundlers to only include the code you actually use, avoiding unnecessary dependencies (e.g., `common/fs` depends on Node.js `fs`/`path` modules). :::

## Modules

| Module                       | Description              | Submodule Path                                   |
| ---------------------------- | ------------------------ | ------------------------------------------------ |
| [concurrency](./concurrency) | Concurrency control      | `@meng-xi/vite-plugin/common/concurrency`        |
| [fs](./fs)                   | File system utilities    | `@meng-xi/vite-plugin/common/fs`                 |
| [format](./format)           | Formatting utilities     | `@meng-xi/vite-plugin/common/format`             |
| [html](./html)               | HTML injection utilities | `@meng-xi/vite-plugin/common/html`               |
| [script](./script)           | Script utilities         | `@meng-xi/vite-plugin/common/script`             |
| [ui](./ui)                   | Terminal UI utilities    | `@meng-xi/vite-plugin/common/ui`                 |
| [validation](./validation)   | Parameter validator      | `@meng-xi/vite-plugin/common/validation`         |
