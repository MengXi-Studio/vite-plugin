# Plugins List

Vite plugin collection provided by @meng-xi/vite-plugin.

## Import Methods

### Barrel import (import all plugins)

```typescript
import { buildProgress, bundleAnalyzer, compressAssets, copyFile, faviconManager, generateRouter, generateVersion, htmlInject, loadingManager, versionUpdateChecker } from '@meng-xi/vite-plugin'
```

### Submodule import (recommended, supports tree-shaking)

```typescript
import { buildProgress } from '@meng-xi/vite-plugin/plugins/build-progress'
import { bundleAnalyzer } from '@meng-xi/vite-plugin/plugins/bundle-analyzer'
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress-assets'
import { copyFile } from '@meng-xi/vite-plugin/plugins/copy-file'
import { faviconManager } from '@meng-xi/vite-plugin/plugins/favicon-manager'
import { generateRouter } from '@meng-xi/vite-plugin/plugins/generate-router'
import { generateVersion } from '@meng-xi/vite-plugin/plugins/generate-version'
import { htmlInject } from '@meng-xi/vite-plugin/plugins/html-inject'
import { loadingManager } from '@meng-xi/vite-plugin/plugins/loading-manager'
import { versionUpdateChecker } from '@meng-xi/vite-plugin/plugins/version-update-checker'
```

::: tip Submodule imports allow bundlers to only include the plugin code you actually use, avoiding unnecessary dependencies. :::

## Plugins

| Plugin                                           | Description                                                                                                   | Submodule Path                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [buildProgress](./build-progress)                | Display real-time build progress bar in terminal                                                              | `@meng-xi/vite-plugin/plugins/build-progress`         |
| [bundleAnalyzer](./bundle-analyzer)              | Build artifact size analysis with JSON/HTML reports, gzip calculation, threshold alerts, and build comparison | `@meng-xi/vite-plugin/plugins/bundle-analyzer`        |
| [compressAssets](./compress-assets)              | Compress build artifacts with gzip / brotli / both                                                            | `@meng-xi/vite-plugin/plugins/compress-assets`        |
| [copyFile](./copy-file)                          | Copy files or directories after build                                                                         | `@meng-xi/vite-plugin/plugins/copy-file`              |
| [faviconManager](./favicon-manager)              | Manage website favicon links injection into HTML                                                              | `@meng-xi/vite-plugin/plugins/favicon-manager`        |
| [generateRouter](./generate-router)              | Auto-generate route config from uni-app pages.json                                                            | `@meng-xi/vite-plugin/plugins/generate-router`        |
| [generateVersion](./generate-version)            | Generate version with file output or global variable                                                          | `@meng-xi/vite-plugin/plugins/generate-version`       |
| [htmlInject](./html-inject)                      | HTML content injection with multiple positions and conditions                                                 | `@meng-xi/vite-plugin/plugins/html-inject`            |
| [loadingManager](./loading-manager)              | Global Loading state management with request interception                                                     | `@meng-xi/vite-plugin/plugins/loading-manager`        |
| [versionUpdateChecker](./version-update-checker) | Runtime version update check with refresh prompt                                                              | `@meng-xi/vite-plugin/plugins/version-update-checker` |

## Common Options

All plugins extend `BasePlugin` and share these base options:

| Option        | Type                           | Default   | Description             |
| ------------- | ------------------------------ | --------- | ----------------------- |
| enabled       | `boolean`                      | `true`    | Enable the plugin       |
| verbose       | `boolean`                      | `true`    | Show detailed logs      |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | Error handling strategy |
