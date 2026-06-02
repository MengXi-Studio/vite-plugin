# common

公共工具模块，提供压缩算法、文件系统操作、格式化、HTML 注入、对象处理、路径处理、脚本工具、参数验证等通用功能。

## 导入方式

### 通过 barrel 导入（导入所有子模块）

```typescript
import { ... } from '@meng-xi/vite-plugin/common'
```

### 通过子模块独立导入（推荐，支持 tree-shaking）

```typescript
import { ... } from '@meng-xi/vite-plugin/common/compress'
import { ... } from '@meng-xi/vite-plugin/common/fs'
import { ... } from '@meng-xi/vite-plugin/common/format'
import { ... } from '@meng-xi/vite-plugin/common/html'
import { ... } from '@meng-xi/vite-plugin/common/object'
import { ... } from '@meng-xi/vite-plugin/common/path'
import { ... } from '@meng-xi/vite-plugin/common/script'
import { ... } from '@meng-xi/vite-plugin/common/ui'
import { ... } from '@meng-xi/vite-plugin/common/validation'
```

::: tip子模块独立导入可让打包工具仅打包使用到的模块代码，避免引入不需要的依赖（如 `common/fs` 依赖 Node.js `fs`/`path`/`crypto` 模块）。:::

## 模块列表

| 模块                       | 说明             | 子模块路径                               |
| -------------------------- | ---------------- | ---------------------------------------- |
| [compress](./compress)     | 压缩算法工具     | `@meng-xi/vite-plugin/common/compress`   |
| [fs](./fs)                 | 文件系统操作工具 | `@meng-xi/vite-plugin/common/fs`         |
| [format](./format)         | 格式化工具       | `@meng-xi/vite-plugin/common/format`     |
| [html](./html)             | HTML 注入工具    | `@meng-xi/vite-plugin/common/html`       |
| [object](./object)         | 对象处理工具     | `@meng-xi/vite-plugin/common/object`     |
| [path](./path)             | 路径处理工具     | `@meng-xi/vite-plugin/common/path`       |
| [script](./script)         | 脚本工具         | `@meng-xi/vite-plugin/common/script`     |
| [ui](./ui)                 | 终端 UI 工具     | `@meng-xi/vite-plugin/common/ui`         |
| [validation](./validation) | 参数验证器       | `@meng-xi/vite-plugin/common/validation` |
