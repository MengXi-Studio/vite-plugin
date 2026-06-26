# Plugins Overview

`@meng-xi/vite-plugin` ships with **15 plugins** grouped by functional verb into **7 categories**: compress / generate / inject / analyze / copy / guard / proxy.

## Group Overview

| Group    | Count | Description   | Sub-path           |
| -------- | ----- | ------------- | ------------------ |
| compress | 2     | Compression   | `plugins/compress` |
| generate | 3     | Generation    | `plugins/generate` |
| inject   | 4     | Injection     | `plugins/inject`   |
| analyze  | 2     | Analysis      | `plugins/analyze`  |
| copy     | 2     | Copy          | `plugins/copy`     |
| guard    | 1     | Guard         | `plugins/guard`    |
| proxy    | 1     | Proxy         | `plugins/proxy`    |

## compress — Compression

Reduce build output size; supports text compression and image optimization.

| Plugin | Function | Phase |
| ------ | -------- | ----- |
| [compressAssets](/en/plugins/compress-assets) | gzip/brotli compression for JS/CSS/HTML output | Production build |
| [imageOptimizer](/en/plugins/image-optimizer) | Image compression and format conversion (supports WebP/AVIF) | Production build |

```typescript
import { compressAssets, imageOptimizer } from '@meng-xi/vite-plugin/plugins/compress'
```

## generate — Generation

Automated code generation to reduce boilerplate.

| Plugin | Function | Phase |
| ------ | -------- | ----- |
| [autoImport](/en/plugins/auto-import) | Auto import Vue/React APIs and generate `.d.ts` | Dev + Build |
| [generateRouter](/en/plugins/generate-router) | Auto-generate router config from directory structure | Dev + Build |
| [generateVersion](/en/plugins/generate-version) | Generate version number (timestamp/semantic/hash) | Build |

```typescript
import { autoImport, generateRouter, generateVersion } from '@meng-xi/vite-plugin/plugins/generate'
```

## inject — Injection

Inject content into HTML, runtime, or pages.

| Plugin | Function | Phase |
| ------ | -------- | ----- |
| [htmlInject](/en/plugins/html-inject) | Inject meta/script/style/variables into HTML | Build |
| [loadingManager](/en/plugins/loading-manager) | Inject global Loading animation | Dev + Build |
| [faviconManager](/en/plugins/favicon-manager) | Auto-generate and inject multi-size favicons | Build |
| [versionUpdateChecker](/en/plugins/version-update-checker) | Detect new version at runtime and prompt refresh | Production |

```typescript
import { htmlInject, loadingManager, faviconManager, versionUpdateChecker } from '@meng-xi/vite-plugin/plugins/inject'
```

## analyze — Analysis

Build process visualization and monitoring.

| Plugin | Function | Phase |
| ------ | -------- | ----- |
| [bundleAnalyzer](/en/plugins/bundle-analyzer) | Output size analysis report (HTML/JSON) | Build |
| [buildProgress](/en/plugins/build-progress) | Terminal build progress bar | Dev + Build |

```typescript
import { bundleAnalyzer, buildProgress } from '@meng-xi/vite-plugin/plugins/analyze'
```

## copy — Copy

Build output file management.

| Plugin | Function | Phase |
| ------ | -------- | ----- |
| [copyFile](/en/plugins/copy-file) | Copy static assets to output directory | Build |
| [assetManifest](/en/plugins/asset-manifest) | Generate asset manifest file | Build |

```typescript
import { copyFile, assetManifest } from '@meng-xi/vite-plugin/plugins/copy'
```

## guard — Guard

Pre-build validation to prevent problematic code from entering output.

| Plugin | Function | Phase |
| ------ | -------- | ----- |
| [envGuard](/en/plugins/env-guard) | Environment variable validation (type/range/required/custom) | Build |

```typescript
import { envGuard } from '@meng-xi/vite-plugin/plugins/guard'
```

## proxy — Proxy

Dev server proxy management.

| Plugin | Function | Phase |
| ------ | -------- | ----- |
| [proxyManager](/en/plugins/proxy-manager) | Declarative proxy config with env switching and logging | Dev |

```typescript
import { proxyManager } from '@meng-xi/vite-plugin/plugins/proxy'
```

## Common Options

All plugins extend `BasePlugin` and share these options:

```typescript
interface BasePluginOptions {
  enabled?: boolean          // Enable, default true
  verbose?: boolean          // Verbose logs, default true
  errorStrategy?: 'throw' | 'log' | 'ignore'  // Error handling, default 'throw'
}
```

For details, see [Core Concepts](/en/guide/concepts#common-options).

## Next Steps

- [Quick Start](/en/guide/quick-start) — Get started in 5 minutes
- [Core Concepts](/en/guide/concepts) — Understand the plugin system
- [Best Practices](/en/guide/best-practices) — Scenario-based recommendations
- [On-demand Import](/en/guide/on-demand-import) — Optimize bundle size
