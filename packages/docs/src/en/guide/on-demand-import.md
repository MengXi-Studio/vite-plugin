# On-demand Import

`@meng-xi/vite-plugin` supports three import granularities. Choose on demand to balance developer experience and bundle size.

## Strategy Comparison

| Strategy         | Import Path                                              | Granularity | Tree-shaking | Use Case                            |
| ---------------- | -------------------------------------------------------- | ----------- | ------------ | ----------------------------------- |
| Main Entry       | `@meng-xi/vite-plugin`                                   | Coarse      | Depends on bundler | Quick prototypes, multi-group usage |
| By Group         | `@meng-xi/vite-plugin/plugins/{group}`                   | Medium      | Good         | Only using one category             |
| Single Plugin    | `@meng-xi/vite-plugin/plugins/{group}/{plugin}`          | Fine        | Optimal      | Only using 1-2 plugins              |

## Strategy 1: Main Entry Import

```typescript
import { compressAssets, autoImport, buildProgress } from '@meng-xi/vite-plugin'
```

**Pros**: Concise syntax, no need to remember group paths.
**Cons**: Bundler needs to analyze the entire entry; Tree-shaking depends on bundler capability.

::: tip
Vite/Rollup have strong Tree-shaking capabilities, so main entry imports can usually remove unused code in production builds. However, for scenarios using only 1-2 plugins, finer-grained imports are still recommended.
:::

## Strategy 2: Import by Group (Recommended)

```typescript
// Only use compression plugins
import { compressAssets, imageOptimizer } from '@meng-xi/vite-plugin/plugins/compress'

// Only use generation plugins
import { autoImport, generateVersion } from '@meng-xi/vite-plugin/plugins/generate'
```

**Pros**: Clear semantics, good Tree-shaking — best choice for most scenarios.

### Available Group Paths

| Group    | Path               | Plugins                                                              |
| -------- | ------------------ | -------------------------------------------------------------------- |
| compress | `plugins/compress` | compressAssets, imageOptimizer                                       |
| generate | `plugins/generate` | autoImport, generateRouter, generateVersion                          |
| inject   | `plugins/inject`   | htmlInject, loadingManager, faviconManager, versionUpdateChecker     |
| analyze  | `plugins/analyze`  | bundleAnalyzer, buildProgress                                        |
| copy     | `plugins/copy`     | copyFile, assetManifest                                              |
| guard    | `plugins/guard`    | envGuard                                                             |
| proxy    | `plugins/proxy`    | proxyManager                                                         |

## Strategy 3: Single Plugin Import

```typescript
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress/compress-assets'
import type { CompressAssetsOptions } from '@meng-xi/vite-plugin/plugins/compress/compress-assets'
```

**Pros**: Finest granularity, smallest bundle size.
**Cons**: Longer paths, verbose when using multiple plugins.

## Framework and Utils Imports

The plugin framework and common utils also support sub-path imports:

```typescript
// Plugin framework
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

// Logger module
import { Logger } from '@meng-xi/vite-plugin/logger'

// Common utils (by module)
import { runWithConcurrency } from '@meng-xi/vite-plugin/common/concurrency'
import { formatFileSize } from '@meng-xi/vite-plugin/common/format'
import { scanDirectory } from '@meng-xi/vite-plugin/common/fs'
```

## Type Imports

All plugin and util type definitions support sub-path imports:

```typescript
import type {
  CompressAssetsOptions,
  CompressAlgorithm
} from '@meng-xi/vite-plugin/plugins/compress/compress-assets'

import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

## Recommendation

| Scenario                          | Recommended Strategy        |
| --------------------------------- | --------------------------- |
| Quick prototype / Demo            | Main Entry                  |
| Production (using 3+ groups)      | Main Entry                  |
| Production (using 1-2 groups)     | By Group                    |
| Library development (1 plugin)    | Single Plugin               |
| Developing custom plugins         | `factory` + `logger` sub-paths |

## Next Steps

- [Best Practices](/en/guide/best-practices) — Scenario-based config recommendations
- [Plugins Overview](/en/plugins/index) — Browse all plugins
- [Plugin Factory](/en/factory/index) — Develop custom plugins
