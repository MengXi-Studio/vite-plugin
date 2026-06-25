# 插件概览

`@meng-xi/vite-plugin` 内置 **15 款插件**，按功能动词分为 **7 组**：compress / generate / inject / analyze / copy / guard / proxy。

## 分组总览

| 分组 | 数量 | 说明 | 子路径 |
| ---- | ---- | ---- | ------ |
| compress | 2 | 压缩类 | `plugins/compress` |
| generate | 3 | 生成类 | `plugins/generate` |
| inject | 4 | 注入类 | `plugins/inject` |
| analyze | 2 | 分析类 | `plugins/analyze` |
| copy | 2 | 拷贝类 | `plugins/copy` |
| guard | 1 | 守卫类 | `plugins/guard` |
| proxy | 1 | 代理类 | `plugins/proxy` |

## compress — 压缩类

减少构建产物体积，支持文本压缩与图片优化。

| 插件 | 功能 | 适用阶段 |
| ---- | ---- | -------- |
| [compressAssets](/plugins/compress-assets) | gzip/brotli 压缩 JS/CSS/HTML 产物 | 生产构建 |
| [imageOptimizer](/plugins/image-optimizer) | 图片压缩与格式转换（支持 WebP/AVIF） | 生产构建 |

```typescript
import { compressAssets, imageOptimizer } from '@meng-xi/vite-plugin/plugins/compress'
```

## generate — 生成类

自动化代码生成，减少样板代码。

| 插件 | 功能 | 适用阶段 |
| ---- | ---- | -------- |
| [autoImport](/plugins/auto-import) | 自动导入 Vue/React 等 API，生成 `.d.ts` | 开发 + 构建 |
| [generateRouter](/plugins/generate-router) | 基于目录结构自动生成路由配置 | 开发 + 构建 |
| [generateVersion](/plugins/generate-version) | 生成版本号（时间戳/语义化/哈希） | 构建 |

```typescript
import { autoImport, generateRouter, generateVersion } from '@meng-xi/vite-plugin/plugins/generate'
```

## inject — 注入类

向 HTML、运行时或页面注入内容。

| 插件 | 功能 | 适用阶段 |
| ---- | ---- | -------- |
| [htmlInject](/plugins/html-inject) | 向 HTML 注入 meta/script/style/变量 | 构建 |
| [loadingManager](/plugins/loading-manager) | 注入全局 Loading 动画 | 开发 + 构建 |
| [faviconManager](/plugins/favicon-manager) | 自动生成并注入多尺寸 favicon | 构建 |
| [versionUpdateChecker](/plugins/version-update-checker) | 运行时检测新版本并提示刷新 | 生产 |

```typescript
import { htmlInject, loadingManager, faviconManager, versionUpdateChecker } from '@meng-xi/vite-plugin/plugins/inject'
```

## analyze — 分析类

构建过程可视化与监控。

| 插件 | 功能 | 适用阶段 |
| ---- | ---- | -------- |
| [bundleAnalyzer](/plugins/bundle-analyzer) | 产物体积分析报告（HTML/JSON） | 构建 |
| [buildProgress](/plugins/build-progress) | 终端构建进度条 | 开发 + 构建 |

```typescript
import { bundleAnalyzer, buildProgress } from '@meng-xi/vite-plugin/plugins/analyze'
```

## copy — 拷贝类

构建产物文件管理。

| 插件 | 功能 | 适用阶段 |
| ---- | ---- | -------- |
| [copyFile](/plugins/copy-file) | 复制静态资源到产物目录 | 构建 |
| [assetManifest](/plugins/asset-manifest) | 生成资源清单文件 | 构建 |

```typescript
import { copyFile, assetManifest } from '@meng-xi/vite-plugin/plugins/copy'
```

## guard — 守卫类

构建前校验，防止问题代码进入产物。

| 插件 | 功能 | 适用阶段 |
| ---- | ---- | -------- |
| [envGuard](/plugins/env-guard) | 环境变量校验（类型/范围/必填/自定义） | 构建 |

```typescript
import { envGuard } from '@meng-xi/vite-plugin/plugins/guard'
```

## proxy — 代理类

开发服务器代理管理。

| 插件 | 功能 | 适用阶段 |
| ---- | ---- | -------- |
| [proxyManager](/plugins/proxy-manager) | 声明式代理配置，支持环境切换与日志 | 开发 |

```typescript
import { proxyManager } from '@meng-xi/vite-plugin/plugins/proxy'
```

## 通用配置

所有插件继承自 `BasePlugin`，共享以下配置：

```typescript
interface BasePluginOptions {
  enabled?: boolean          // 是否启用，默认 true
  verbose?: boolean          // 详细日志，默认 true
  errorStrategy?: 'throw' | 'log' | 'ignore'  // 错误处理，默认 'throw'
}
```

详细说明请参阅 [基础概念](/guide/concepts#通用配置)。

## 下一步

- [快速开始](/guide/quick-start) — 5 分钟上手
- [基础概念](/guide/concepts) — 理解插件系统
- [最佳实践](/guide/best-practices) — 场景化推荐
- [按需导入](/guide/on-demand-import) — 优化打包体积
