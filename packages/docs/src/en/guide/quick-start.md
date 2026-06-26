# Quick Start

This guide helps you integrate your first plugin in 5 minutes.

## 1. Install

::: code-group

```bash [npm]
npm install @meng-xi/vite-plugin -D
```

```bash [pnpm]
pnpm add @meng-xi/vite-plugin -D
```

:::

## 2. Minimal Example

Add two of the most commonly used plugins in `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import { buildProgress, compressAssets } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // Terminal build progress bar
    buildProgress(),

    // Gzip compression for build output
    compressAssets({ algorithm: 'gzip' })
  ]
})
```

Run `npm run build`, and you'll see the progress bar and compression report in the terminal.

## 3. Common Scenarios

### Developer Experience Optimization

```typescript
import { defineConfig } from 'vite'
import { buildProgress, proxyManager, envGuard } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // Build progress bar
    buildProgress(),

    // Dev proxy
    proxyManager({
      rules: [{ context: '/api', target: 'http://localhost:3000' }]
    }),

    // Environment variable validation
    envGuard({
      rules: { VITE_API_URL: { type: 'string', required: true } }
    })
  ]
})
```

### Production Build Optimization

```typescript
import { defineConfig } from 'vite'
import { compressAssets, imageOptimizer, bundleAnalyzer } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // Output compression
    compressAssets({ algorithm: 'brotli' }),

    // Image optimization
    imageOptimizer({ quality: { jpeg: 80, webp: 75 } }),

    // Bundle size analysis report
    bundleAnalyzer({ outputFormat: 'html' })
  ]
})
```

### Automated Code Generation

```typescript
import { defineConfig } from 'vite'
import { autoImport, generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // Auto import Vue APIs
    autoImport({
      imports: { vue: ['ref', 'reactive', 'computed'] },
      dts: 'src/auto-imports.d.ts'
    }),

    // Generate version number
    generateVersion({ format: 'datetime', outputType: 'both' })
  ]
})
```

## 4. Import by Group

If you only use plugins from one category, import by group to optimize bundle size:

```typescript
// Only use compression plugins
import { compressAssets, imageOptimizer } from '@meng-xi/vite-plugin/plugins/compress'
```

## 5. Common Options

All plugins share these base options:

```typescript
compressAssets({
  algorithm: 'gzip',
  enabled: true,           // Enable the plugin
  verbose: true,           // Show verbose logs
  errorStrategy: 'throw'   // Error handling: throw | log | ignore
})
```

## Next Steps

- [Core Concepts](/en/guide/concepts) — Deep dive into the plugin system and lifecycle
- [On-demand Import](/en/guide/on-demand-import) — Full strategies for bundle size optimization
- [Plugins Overview](/en/plugins/index) — Browse all 15 plugins
- [Best Practices](/en/guide/best-practices) — Scenario-based recommendations and common pitfalls
