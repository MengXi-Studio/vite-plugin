# Best Practices

Scenario-based plugin recommendations, performance tuning, and common pitfall avoidance based on real-world projects.

## Scenario Recommendations

### Scenario 1: General Web Application

Suitable for most SPA projects (Vue / React):

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
    // Developer experience
    buildProgress(),
    proxyManager({ rules: [{ context: '/api', target: 'http://localhost:3000' }] }),

    // Code generation
    autoImport({ imports: { vue: ['ref', 'reactive', 'computed'] } }),
    generateVersion({ format: 'datetime' }),

    // Build validation and optimization
    envGuard({ rules: { VITE_API_URL: { type: 'string', required: true } } }),
    compressAssets({ algorithm: 'gzip' })
  ]
})
```

### Scenario 2: Mobile H5 / uni-app

Emphasizes size optimization and loading experience:

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
    // Asset optimization
    imageOptimizer({ quality: { jpeg: 75, webp: 70 } }),
    compressAssets({ algorithm: 'brotli' }),

    // Loading experience
    loadingManager({ type: 'spinner' }),
    faviconManager({ source: 'src/favicon.png' }),

    // Size analysis
    bundleAnalyzer({ outputFormat: 'html' })
  ]
})
```

### Scenario 3: Component Library / SDK Development

Keep only essential plugins to avoid affecting output:

```typescript
import { generateVersion, copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    generateVersion({ format: 'semver', outputType: 'json' }),
    copyFile({ patterns: [{ from: 'src/styles', to: 'dist/styles' }] })
  ]
})
```

### Scenario 4: Large Enterprise Application

Full features + strict validation:

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
    // Analysis and monitoring
    buildProgress(),
    bundleAnalyzer(),

    // Code generation
    autoImport({ imports: { vue: ['ref', 'reactive', 'computed', 'watch'] } }),
    generateRouter({ pagesDir: 'src/pages' }),
    generateVersion({ format: 'datetime' }),

    // Build optimization
    compressAssets({ algorithm: 'both' }),
    imageOptimizer(),

    // Injection
    htmlInject({ inject: { head: ['<meta name="version" content="%VERSION%">'] } }),
    loadingManager(),
    versionUpdateChecker({ interval: 300000 }),

    // Resource management
    copyFile({ patterns: [{ from: 'public', to: 'dist' }] }),
    assetManifest({ output: 'manifest.json' }),

    // Guard and proxy
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

## Performance Tuning

### 1. Use `enabled` to Differentiate Environments

```typescript
const isProd = process.env.NODE_ENV === 'production'

compressAssets({ enabled: isProd }),
imageOptimizer({ enabled: isProd }),
bundleAnalyzer({ enabled: isProd }),
buildProgress({ enabled: !isProd }),
proxyManager({ enabled: !isProd })
```

### 2. Adjust Compression Threshold

```typescript
compressAssets({
  algorithm: 'brotli',
  threshold: 10240,  // Only compress files larger than 10KB
  deleteOriginalAssets: false  // Keep original files to avoid affecting development
})
```

### 3. Concurrency Control

Plugins involving batch file system operations (like `imageOptimizer`) have built-in concurrency control. If your project has many files, you can adjust:

```typescript
imageOptimizer({
  concurrency: 4  // Default; lower for CPU-intensive, higher for IO-intensive
})
```

### 4. Disable Non-essential Verbose Logs

```typescript
// Disable verbose logs in production
compressAssets({ verbose: !isProd })
imageOptimizer({ verbose: !isProd })
```

## Error Handling Strategy

### Choose `errorStrategy` by Scenario

| Scenario                | Recommended | Reason                                    |
| ----------------------- | ----------- | ----------------------------------------- |
| Local development       | `throw`     | Quickly surface issues                    |
| CI build                | `throw`     | Block problematic code from going live    |
| Production (fault-tolerant) | `log`   | Avoid non-critical plugins halting release |
| Non-critical plugins    | `ignore`    | Silent handling                           |

```typescript
// Critical plugins: build failure must halt
envGuard({ errorStrategy: 'throw' })
autoImport({ errorStrategy: 'throw' })

// Non-critical plugins: failure doesn't affect main flow
imageOptimizer({ errorStrategy: 'log' })
faviconManager({ errorStrategy: 'ignore' })
```

## Common Pitfalls

### 1. Plugin Order

Vite plugins execute in declaration order. **Generation plugins should come before Injection plugins**:

```typescript
// ✅ Correct: generate version first, then inject into HTML
generateVersion(),
htmlInject()

// ❌ Wrong: version not yet generated when injecting
htmlInject(),
generateVersion()
```

### 2. Multi-instance Naming Conflicts

When using the same type of plugin multiple times, the framework auto-assigns instance IDs (`pluginName#1`, `pluginName#2`) with non-interfering logs. But watch out for logical config conflicts:

```typescript
// Same directory operated by two copyFile calls — ensure patterns don't overlap
copyFile({ patterns: [{ from: 'public/a', to: 'dist/a' }] }),
copyFile({ patterns: [{ from: 'public/b', to: 'dist/b' }] })
```

### 3. envGuard Rules and Build Timing

`envGuard` validates at the `configResolved` phase, **after** Vite config loads. If other plugins depend on env variables, ensure `envGuard` doesn't block them from reading:

```typescript
// Recommended: place envGuard early in the plugins array
envGuard({ rules: { ... } }),
// Subsequent plugins can safely use process.env.VITE_XXX
```

### 4. compressAssets and deleteOriginalAssets

```typescript
// ⚠️ Use deleteOriginalAssets: true with caution in production
// Some servers/CDNs need original files as fallback
compressAssets({
  algorithm: 'brotli',
  deleteOriginalAssets: false  // Keep original files (recommended)
})
```

### 5. autoImport and TypeScript

The `.d.ts` file generated by `autoImport` needs to be included in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "include": ["src/**/*.ts", "src/auto-imports.d.ts"]
  }
}
```

## Next Steps

- [Plugins Overview](/en/plugins/index) — Browse all plugin docs
- [Plugin Factory](/en/factory/index) — Develop custom plugins
- [Core Concepts](/en/guide/concepts) — Deep dive into the plugin system
