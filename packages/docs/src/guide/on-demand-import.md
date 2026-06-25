# 按需导入

`@meng-xi/vite-plugin` 支持三种导入粒度，按需选择以平衡开发体验与打包体积。

## 导入策略对比

| 策略 | 导入路径 | 粒度 | Tree-shaking | 适用场景 |
| ---- | -------- | ---- | ------------ | -------- |
| 主入口 | `@meng-xi/vite-plugin` | 粗 | 依赖打包工具 | 快速原型、使用多个分组 |
| 按分组 | `@meng-xi/vite-plugin/plugins/{group}` | 中 | 良好 | 仅使用某一类插件 |
| 单插件 | `@meng-xi/vite-plugin/plugins/{group}/{plugin}` | 细 | 最优 | 仅使用 1-2 个插件 |

## 策略一：主入口导入

```typescript
import { compressAssets, autoImport, buildProgress } from '@meng-xi/vite-plugin'
```

**优点**：写法简洁，无需记忆分组路径。
**缺点**：打包工具需要分析整个入口，Tree-shaking 效果依赖工具能力。

::: tip
Vite/Rollup 的 Tree-shaking 能力较强，主入口导入在生产构建时通常也能有效剔除未使用的代码。但对于仅使用 1-2 个插件的场景，仍推荐更细粒度的导入。
:::

## 策略二：按分组导入（推荐）

```typescript
// 仅使用压缩类插件
import { compressAssets, imageOptimizer } from '@meng-xi/vite-plugin/plugins/compress'

// 仅使用生成类插件
import { autoImport, generateVersion } from '@meng-xi/vite-plugin/plugins/generate'
```

**优点**：语义清晰，Tree-shaking 效果良好，是大多数场景的最佳选择。

### 可用分组路径

| 分组 | 路径 | 包含插件 |
| ---- | ---- | -------- |
| compress | `plugins/compress` | compressAssets, imageOptimizer |
| generate | `plugins/generate` | autoImport, generateRouter, generateVersion |
| inject | `plugins/inject` | htmlInject, loadingManager, faviconManager, versionUpdateChecker |
| analyze | `plugins/analyze` | bundleAnalyzer, buildProgress |
| copy | `plugins/copy` | copyFile, assetManifest |
| guard | `plugins/guard` | envGuard |
| proxy | `plugins/proxy` | proxyManager |

## 策略三：单插件导入

```typescript
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress/compress-assets'
import type { CompressAssetsOptions } from '@meng-xi/vite-plugin/plugins/compress/compress-assets'
```

**优点**：粒度最细，打包体积最小。
**缺点**：路径较长，多个插件时写法繁琐。

## 框架与工具导入

插件开发框架和通用工具同样支持子路径导入：

```typescript
// 插件开发框架
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

// 日志模块
import { Logger } from '@meng-xi/vite-plugin/logger'

// 通用工具（按模块）
import { runWithConcurrency } from '@meng-xi/vite-plugin/common/concurrency'
import { formatFileSize } from '@meng-xi/vite-plugin/common/format'
import { scanDirectory } from '@meng-xi/vite-plugin/common/fs'
```

## 类型导入

所有插件和工具的类型定义都支持子路径导入：

```typescript
import type {
  CompressAssetsOptions,
  CompressAlgorithm
} from '@meng-xi/vite-plugin/plugins/compress/compress-assets'

import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

## 推荐选择

| 场景 | 推荐策略 |
| ---- | -------- |
| 快速原型 / Demo | 主入口 |
| 生产项目（使用 3+ 分组） | 主入口 |
| 生产项目（使用 1-2 分组） | 按分组 |
| 库开发（仅用 1 个插件） | 单插件 |
| 开发自定义插件 | `factory` + `logger` 子路径 |

## 下一步

- [最佳实践](/guide/best-practices) — 场景化配置推荐
- [插件概览](/plugins) — 浏览全部插件
- [插件开发框架](/factory) — 开发自定义插件
