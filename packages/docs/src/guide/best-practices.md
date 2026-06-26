# 最佳实践

基于实际项目场景的插件组合推荐、性能调优与常见陷阱规避。

## 场景化推荐

### 场景一：通用 Web 应用

适用于大多数 SPA 项目（Vue / React）：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  buildProgress,
  compressAssets,
  autoImport,
  envGuard,
  generateVersion
} from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    vue(),
    // 开发体验
    buildProgress(),
    proxyManager({ rules: [{ context: '/api', target: 'http://localhost:3000' }] }),

    // 代码生成
    autoImport({ imports: { vue: ['ref', 'reactive', 'computed'] } }),
    generateVersion({ format: 'datetime' }),

    // 构建校验与优化
    envGuard({ rules: { VITE_API_URL: { type: 'string', required: true } } }),
    compressAssets({ algorithm: 'gzip' })
  ]
})
```

### 场景二：移动端 H5 / uni-app

强调体积优化与加载体验：

```typescript
import {
  compressAssets,
  imageOptimizer,
  loadingManager,
  faviconManager,
  bundleAnalyzer
} from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // 资源优化
    imageOptimizer({ quality: { jpeg: 75, webp: 70 } }),
    compressAssets({ algorithm: 'brotli' }),

    // 加载体验
    loadingManager({ type: 'spinner' }),
    faviconManager({ source: 'src/favicon.png' }),

    // 体积分析
    bundleAnalyzer({ outputFormat: 'html' })
  ]
})
```

### 场景三：组件库 / SDK 开发

仅保留必要插件，避免影响产物：

```typescript
import { generateVersion, copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    generateVersion({ format: 'semver', outputType: 'json' }),
    copyFile({ patterns: [{ from: 'src/styles', to: 'dist/styles' }] })
  ]
})
```

### 场景四：大型企业应用

完整功能 + 严格校验：

```typescript
import {
  buildProgress, bundleAnalyzer, compressAssets, imageOptimizer,
  autoImport, generateRouter, generateVersion,
  htmlInject, loadingManager, versionUpdateChecker,
  copyFile, assetManifest,
  envGuard, proxyManager
} from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // 分析与监控
    buildProgress(),
    bundleAnalyzer(),

    // 代码生成
    autoImport({ imports: { vue: ['ref', 'reactive', 'computed', 'watch'] } }),
    generateRouter({ pagesDir: 'src/pages' }),
    generateVersion({ format: 'datetime' }),

    // 构建优化
    compressAssets({ algorithm: 'both' }),
    imageOptimizer(),

    // 注入
    htmlInject({ inject: { head: ['<meta name="version" content="%VERSION%">'] } }),
    loadingManager(),
    versionUpdateChecker({ interval: 300000 }),

    // 资源管理
    copyFile({ patterns: [{ from: 'public', to: 'dist' }] }),
    assetManifest({ output: 'manifest.json' }),

    // 守卫与代理
    envGuard({
      rules: {
        VITE_API_URL: { type: 'string', required: true },
        VITE_APP_NAME: { type: 'string', required: true }
      }
    }),
    proxyManager({ config: 'proxy.config.json' })
  ]
})
```

## 性能调优

### 1. 合理使用 enabled 区分环境

```typescript
const isProd = process.env.NODE_ENV === 'production'

compressAssets({ enabled: isProd }),
imageOptimizer({ enabled: isProd }),
bundleAnalyzer({ enabled: isProd }),
buildProgress({ enabled: !isProd }),
proxyManager({ enabled: !isProd })
```

### 2. 调整压缩阈值

```typescript
compressAssets({
  algorithm: 'brotli',
  threshold: 10240,  // 仅压缩大于 10KB 的文件
  deleteOriginalAssets: false  // 保留原始文件，避免影响开发
})
```

### 3. 并发控制

涉及文件系统批量操作的插件（如 `imageOptimizer`）已内置并发控制。如果项目文件特别多，可以调整：

```typescript
imageOptimizer({
  concurrency: 4  // 默认值，CPU 密集型可调低，IO 密集型可调高
})
```

### 4. 关闭非必要的 verbose 日志

```typescript
// 生产环境关闭详细日志
compressAssets({ verbose: !isProd })
imageOptimizer({ verbose: !isProd })
```

## 错误处理策略

### 按场景选择 errorStrategy

| 场景 | 推荐策略 | 原因 |
| ---- | -------- | ---- |
| 本地开发 | `throw` | 快速暴露问题 |
| CI 构建 | `throw` | 阻止问题代码上线 |
| 生产构建（容错） | `log` | 避免非关键插件中断发布 |
| 非关键插件 | `ignore` | 静默处理 |

```typescript
// 关键插件：构建失败必须中断
envGuard({ errorStrategy: 'throw' })
autoImport({ errorStrategy: 'throw' })

// 非关键插件：失败不影响主流程
imageOptimizer({ errorStrategy: 'log' })
faviconManager({ errorStrategy: 'ignore' })
```

## 常见陷阱

### 1. 插件顺序

Vite 插件按声明顺序执行。**生成类插件应在注入类之前**：

```typescript
// ✅ 正确：先生成版本号，再注入到 HTML
generateVersion(),
htmlInject()

// ❌ 错误：注入时版本号尚未生成
htmlInject(),
generateVersion()
```

### 2. 多实例命名冲突

同类型插件多次使用时，框架会自动分配实例 ID（`插件名#1`、`插件名#2`），日志互不干扰。但需注意配置上的逻辑冲突：

```typescript
// 同一目录被两个 copyFile 操作，注意 patterns 不要重叠
copyFile({ patterns: [{ from: 'public/a', to: 'dist/a' }] }),
copyFile({ patterns: [{ from: 'public/b', to: 'dist/b' }] })
```

### 3. envGuard 规则与构建时机的匹配

`envGuard` 在 `configResolved` 阶段执行校验，**晚于** Vite 配置加载。如果其他插件依赖环境变量，请确保 `envGuard` 不会阻止它们读取：

```typescript
// 推荐将 envGuard 放在插件数组靠前位置
envGuard({ rules: { ... } }),
// 后续插件可安全使用 process.env.VITE_XXX
```

### 4. compressAssets 与 deleteOriginalAssets

```typescript
// ⚠️ 生产环境慎用 deleteOriginalAssets: true
// 部分服务器/CDN 需要原始文件作为回退
compressAssets({
  algorithm: 'brotli',
  deleteOriginalAssets: false  // 保留原始文件（推荐）
})
```

### 5. autoImport 与 TypeScript

`autoImport` 生成的 `.d.ts` 文件需在 `tsconfig.json` 中引入：

```json
{
  "compilerOptions": {
    "include": ["src/**/*.ts", "src/auto-imports.d.ts"]
  }
}
```

## 下一步

- [插件概览](/plugins/index) — 浏览全部插件详细文档
- [插件开发框架](/factory/index) — 开发自定义插件
- [基础概念](/guide/concepts) — 深入理解插件系统
