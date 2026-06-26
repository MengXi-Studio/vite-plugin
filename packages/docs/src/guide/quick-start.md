# 快速开始

本指南帮助你在 5 分钟内完成第一个插件的接入。

## 1. 安装

::: code-group

```bash [npm]
npm install @meng-xi/vite-plugin -D
```

```bash [pnpm]
pnpm add @meng-xi/vite-plugin -D
```

:::

## 2. 最小示例

在 `vite.config.ts` 中接入两个最常用的插件：

```typescript
import { defineConfig } from 'vite'
import { buildProgress, compressAssets } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // 终端显示构建进度条
    buildProgress(),

    // 构建产物 gzip 压缩
    compressAssets({ algorithm: 'gzip' })
  ]
})
```

运行 `npm run build`，你将看到终端进度条和压缩统计报告。

## 3. 常用场景配置

### 开发体验优化

```typescript
import { defineConfig } from 'vite'
import { buildProgress, proxyManager, envGuard } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // 构建进度条
    buildProgress(),

    // 开发代理
    proxyManager({
      rules: [{ context: '/api', target: 'http://localhost:3000' }]
    }),

    // 环境变量校验
    envGuard({
      rules: { VITE_API_URL: { type: 'string', required: true } }
    })
  ]
})
```

### 生产构建优化

```typescript
import { defineConfig } from 'vite'
import { compressAssets, imageOptimizer, bundleAnalyzer } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // 产物压缩
    compressAssets({ algorithm: 'brotli' }),

    // 图片优化
    imageOptimizer({ quality: { jpeg: 80, webp: 75 } }),

    // 体积分析报告
    bundleAnalyzer({ outputFormat: 'html' })
  ]
})
```

### 自动化代码生成

```typescript
import { defineConfig } from 'vite'
import { autoImport, generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // 自动导入 Vue API
    autoImport({
      imports: { vue: ['ref', 'reactive', 'computed'] },
      dts: 'src/auto-imports.d.ts'
    }),

    // 生成版本号
    generateVersion({ format: 'datetime', outputType: 'both' })
  ]
})
```

## 4. 按分组导入

如果只使用某一类插件，可以按分组导入以优化打包体积：

```typescript
// 仅使用压缩类插件
import { compressAssets, imageOptimizer } from '@meng-xi/vite-plugin/plugins/compress'
```

## 5. 通用配置

所有插件共享以下基础配置：

```typescript
compressAssets({
  algorithm: 'gzip',
  enabled: true,           // 是否启用插件
  verbose: true,           // 是否显示详细日志
  errorStrategy: 'throw'   // 错误处理：throw | log | ignore
})
```

## 下一步

- [基础概念](/guide/concepts) — 深入理解插件系统与生命周期
- [按需导入](/guide/on-demand-import) — 优化打包体积的完整策略
- [插件概览](/plugins/index) — 浏览全部 15 个插件
- [最佳实践](/guide/best-practices) — 场景化推荐与常见陷阱
