# 安装

## 包管理器

::: code-group

```bash [npm]
npm install @meng-xi/vite-plugin -D
```

```bash [yarn]
yarn add @meng-xi/vite-plugin -D
```

```bash [pnpm]
pnpm add @meng-xi/vite-plugin -D
```

:::

## uni-app 插件市场

如果你使用 uni-app 项目，可以通过插件市场一键安装：

[插件市场地址](https://ext.dcloud.net.cn/plugin?id=26652)

## 导入方式

### 主入口导入

从主入口导入所有插件和框架组件：

```typescript
import { compressAssets, autoImport, buildProgress } from '@meng-xi/vite-plugin'
```

### 按分组导入（推荐）

按功能分组导入，获得更好的语义化和 Tree-shaking 效果：

```typescript
// 压缩类
import { compressAssets, imageOptimizer } from '@meng-xi/vite-plugin/plugins/compress'

// 生成类
import { autoImport, generateRouter, generateVersion } from '@meng-xi/vite-plugin/plugins/generate'

// 注入类
import { htmlInject, loadingManager, faviconManager, versionUpdateChecker } from '@meng-xi/vite-plugin/plugins/inject'

// 分析类
import { bundleAnalyzer, buildProgress } from '@meng-xi/vite-plugin/plugins/analyze'

// 拷贝类
import { copyFile, assetManifest } from '@meng-xi/vite-plugin/plugins/copy'

// 守卫类
import { envGuard } from '@meng-xi/vite-plugin/plugins/guard'

// 代理类
import { proxyManager } from '@meng-xi/vite-plugin/plugins/proxy'
```

### 单个插件导入

粒度最细的导入方式，仅引入使用到的插件：

```typescript
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress/compress-assets'
import { autoImport } from '@meng-xi/vite-plugin/plugins/generate/auto-import'
import type { CompressAssetsOptions } from '@meng-xi/vite-plugin/plugins/compress/compress-assets'
```

::: tip
详细的导入策略对比请参阅 [按需导入](/guide/on-demand-import)。
:::

## 环境要求

- Node.js >= 16
- Vite >= 4
- TypeScript >= 5（推荐）

## 下一步

- [快速开始](/guide/quick-start) — 5 分钟上手
- [基础概念](/guide/concepts) — 理解插件系统
- [插件概览](/plugins) — 浏览全部插件
