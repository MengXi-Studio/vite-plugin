# Installation

## Package Managers

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

## uni-app Plugin Marketplace

If you are using a uni-app project, you can install it directly from the plugin marketplace:

[Plugin Marketplace](https://ext.dcloud.net.cn/plugin?id=26652)

## Import Methods

### Main Entry Import

Import all plugins and framework components from the main entry:

```typescript
import { compressAssets, autoImport, buildProgress } from '@meng-xi/vite-plugin'
```

### Import by Group (Recommended)

Import by functional group for better semantics and Tree-shaking:

```typescript
// Compression
import { compressAssets, imageOptimizer } from '@meng-xi/vite-plugin/plugins/compress'

// Generation
import { autoImport, generateRouter, generateVersion } from '@meng-xi/vite-plugin/plugins/generate'

// Injection
import { htmlInject, loadingManager, faviconManager, versionUpdateChecker } from '@meng-xi/vite-plugin/plugins/inject'

// Analysis
import { bundleAnalyzer, buildProgress } from '@meng-xi/vite-plugin/plugins/analyze'

// Copy
import { copyFile, assetManifest } from '@meng-xi/vite-plugin/plugins/copy'

// Guard
import { envGuard } from '@meng-xi/vite-plugin/plugins/guard'

// Proxy
import { proxyManager } from '@meng-xi/vite-plugin/plugins/proxy'
```

### Single Plugin Import

The most granular import method, only importing the plugins you use:

```typescript
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress/compress-assets'
import { autoImport } from '@meng-xi/vite-plugin/plugins/generate/auto-import'
import type { CompressAssetsOptions } from '@meng-xi/vite-plugin/plugins/compress/compress-assets'
```

::: tip
For a detailed comparison of import strategies, see [On-demand Import](/en/guide/on-demand-import).
:::

## Requirements

- Node.js >= 16
- Vite >= 4
- TypeScript >= 5 (recommended)

## Next Steps

- [Quick Start](/en/guide/quick-start) — Get started in 5 minutes
- [Core Concepts](/en/guide/concepts) — Understand the plugin system
- [Plugins Overview](/en/plugins) — Browse all plugins
