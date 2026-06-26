# common

公共工具模块，提供 14 个子模块，涵盖并发控制、代码处理、压缩、环境变量、文件系统操作、格式化、哈希、HTML 注入、对象合并、路径处理、脚本工具、字符串、终端 UI 和参数验证等通用功能。

所有子模块均支持按需导入，内部插件也通过这些公共模块复用逻辑。

## 导入方式

### 通过 barrel 导入（导入所有子模块）

```typescript
import { ... } from '@meng-xi/vite-plugin/common'
```

### 通过子模块独立导入（推荐，支持 tree-shaking）

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
子模块独立导入可让打包工具仅打包使用到的模块代码，避免引入不需要的依赖（如 `common/fs` 依赖 Node.js `fs`/`path` 模块）。
:::

## 模块分类

### 文件与路径

| 模块 | 说明 | 导出数量 | 子模块路径 |
| ---- | ---- | -------- | ---------- |
| [fs](./fs) | 文件系统操作工具 | 10 个函数 + 4 个类型 | `@meng-xi/vite-plugin/common/fs` |
| [path](./path) | 路径处理工具 | 4 个函数 | `@meng-xi/vite-plugin/common/path` |

### 格式化与模板

| 模块 | 说明 | 导出数量 | 子模块路径 |
| ---- | ---- | -------- | ---------- |
| [format](./format) | 日期格式化、模板变量替换、插件模板解析、文件大小格式化、压缩率计算 | 7 个函数 + 1 个类型 | `@meng-xi/vite-plugin/common/format` |

### HTML 与脚本

| 模块 | 说明 | 导出数量 | 子模块路径 |
| ---- | ---- | -------- | ---------- |
| [html](./html) | HTML 注入、安全过滤、属性转义 | 4 个函数 + 8 个类型 | `@meng-xi/vite-plugin/common/html` |
| [script](./script) | 回调函数包装 | 1 个函数 | `@meng-xi/vite-plugin/common/script` |

### 代码与字符串

| 模块 | 说明 | 导出数量 | 子模块路径 |
| ---- | ---- | -------- | ---------- |
| [code](./code) | JS 关键字集合、代码注释与字符串移除 | 1 个常量 + 1 个函数 | `@meng-xi/vite-plugin/common/code` |
| [string](./string) | 大小写转换、JSON 注释移除、正则转义 | 4 个函数 | `@meng-xi/vite-plugin/common/string` |

### 对象与环境

| 模块 | 说明 | 导出数量 | 子模块路径 |
| ---- | ---- | -------- | ---------- |
| [object](./object) | 深度合并对象 | 1 个函数 | `@meng-xi/vite-plugin/common/object` |
| [env](./env) | `.env` 文件内容解析 | 1 个函数 | `@meng-xi/vite-plugin/common/env` |

### 哈希与压缩

| 模块 | 说明 | 导出数量 | 子模块路径 |
| ---- | ---- | -------- | ---------- |
| [hash](./hash) | 随机哈希生成 | 1 个函数 | `@meng-xi/vite-plugin/common/hash` |
| [compress](./compress) | gzip 压缩大小计算 | 1 个函数 | `@meng-xi/vite-plugin/common/compress` |

### 工具与验证

| 模块 | 说明 | 导出数量 | 子模块路径 |
| ---- | ---- | -------- | ---------- |
| [concurrency](./concurrency) | 并发控制工具 | 1 个函数 | `@meng-xi/vite-plugin/common/concurrency` |
| [validation](./validation) | 链式参数验证器 + 3 个验证函数 | 1 个类 + 3 个函数 | `@meng-xi/vite-plugin/common/validation` |
| [ui](./ui) | 终端 ANSI 转义码工具 | 1 个对象 | `@meng-xi/vite-plugin/common/ui` |
