# common

公共工具模块，提供并发控制、文件系统操作、格式化、HTML 注入、脚本工具、终端 UI、参数验证等通用功能。

所有子模块均支持按需导入，内部插件也通过这些公共模块复用逻辑。

## 导入方式

### 通过 barrel 导入（导入所有子模块）

```typescript
import { ... } from '@meng-xi/vite-plugin/common'
```

### 通过子模块独立导入（推荐，支持 tree-shaking）

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
子模块独立导入可让打包工具仅打包使用到的模块代码，避免引入不需要的依赖（如 `common/fs` 依赖 Node.js `fs`/`path` 模块）。
:::

## 模块列表

| 模块                       | 说明             | 子模块路径                                    |
| -------------------------- | ---------------- | --------------------------------------------- |
| [concurrency](./concurrency) | 并发控制工具  | `@meng-xi/vite-plugin/common/concurrency`     |
| [fs](./fs)                 | 文件系统操作工具 | `@meng-xi/vite-plugin/common/fs`              |
| [format](./format)         | 格式化工具       | `@meng-xi/vite-plugin/common/format`          |
| [html](./html)             | HTML 注入工具    | `@meng-xi/vite-plugin/common/html`            |
| [path](./path)             | 路径处理工具     | `@meng-xi/vite-plugin/common/path`            |
| [script](./script)         | 脚本工具         | `@meng-xi/vite-plugin/common/script`          |
| [ui](./ui)                 | 终端 UI 工具     | `@meng-xi/vite-plugin/common/ui`              |
| [validation](./validation) | 参数验证器       | `@meng-xi/vite-plugin/common/validation`      |
