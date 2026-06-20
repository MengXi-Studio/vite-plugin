# bundleAnalyzer

Build artifact size analysis plugin with JSON/HTML reports, gzip calculation, threshold alerts, and build comparison.

## Import Methods

```typescript
// Submodule import (recommended)
import { bundleAnalyzer } from '@meng-xi/vite-plugin/plugins/bundle-analyzer'
import type { BundleAnalyzerOptions, BundleAnalysisResult, BundleOutputFormat } from '@meng-xi/vite-plugin/plugins/bundle-analyzer'

// Barrel import
import { bundleAnalyzer } from '@meng-xi/vite-plugin'
```

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { bundleAnalyzer } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [bundleAnalyzer()]
})
```

## Features

- **Multi-format report output**: Supports JSON, HTML, or both formats simultaneously
- **Size analysis**: Calculates original size and gzip-compressed size
- **Threshold alerts**: Automatic alerts for chunks exceeding specified size
- **Build comparison**: Compare size changes with historical reports
- **Visual charts**: HTML reports support treemap, sunburst, and list views
- **Module ranking**: Top N largest modules, distinguishing source from node_modules
- **File type distribution**: Size distribution statistics by file extension

## Options

| Option             | Type                                | Default             | Description                                    |
| ------------------ | ----------------------------------- | ------------------- | ---------------------------------------------- |
| outputFormat       | `'json' \| 'html' \| 'both'`        | `'json'`            | Report output format                           |
| outputFile         | `string`                            | `'bundle-analysis'` | Report output filename (without extension)     |
| openAnalyzer       | `boolean`                           | `false`             | Whether to auto-open browser after HTML report |
| sizeThreshold      | `number`                            | `100`               | Size alert threshold (KB)                      |
| compareWith        | `string \| null`                    | `null`              | Path to historical report for comparison       |

> Inherits [BasePluginOptions](/factory/base-plugin-options): `enabled`, `logLevel`, `errorStrategy`

### Advanced Options

| Option             | Type                                | Default      | Description                                    |
| ------------------ | ----------------------------------- | ------------ | ---------------------------------------------- |
| topModules         | `number`                            | `20`         | Top N largest modules count                    |
| gzipSize           | `boolean`                           | `true`       | Whether to calculate gzip size                 |
| excludeNodeModules | `boolean`                           | `false`      | Whether to exclude node_modules modules        |
| excludePatterns    | `string[]`                          | `[]`         | File path patterns to exclude                  |
| includeExtensions  | `string[]`                          | `[]`         | File extensions to include, empty for all      |
| defaultChartType   | `'treemap' \| 'sunburst' \| 'list'` | `'treemap'`  | Default chart type in HTML report              |

## Type Exports

### BundleOutputFormat

```typescript
type BundleOutputFormat = 'json' | 'html' | 'both'
```

Report output format type.

### BundleAnalysisResult

Analysis result interface with the following fields:

| Field                | Type                     | Description                       |
| -------------------- | ------------------------ | --------------------------------- |
| timestamp            | `string`                 | Analysis timestamp (ISO format)   |
| totalSize            | `number`                 | Total build artifact size (bytes) |
| totalGzipSize        | `number`                 | Total gzip size (bytes)           |
| chunks               | `ChunkStats[]`           | Chunk statistics list             |
| topModules           | `ModuleStats[]`          | Top N largest modules             |
| fileTypeDistribution | `FileTypeDistribution[]` | File type distribution stats      |
| warnings             | `SizeWarning[]`          | Size threshold alert list         |
| comparisonDiffs      | `ComparisonDiff[]`       | Build comparison diff list        |
| analysisTime         | `number`                 | Analysis duration (ms)            |

### ChunkStats

Statistics for a single chunk:

| Field     | Type                            | Description                  |
| --------- | ------------------------------- | ---------------------------- |
| name      | `string`                        | Chunk name                   |
| size      | `number`                        | Original size (bytes)        |
| gzipSize  | `number`                        | Gzip-compressed size (bytes) |
| modules   | `ModuleStats[]`                 | Included modules list        |
| type      | `'entry' \| 'chunk' \| 'asset'` | Chunk type                   |
| fileCount | `number`                        | Number of included files     |

### SizeWarning

Size alert information:

| Field       | Type                  | Description         |
| ----------- | --------------------- | ------------------- |
| level       | `'module' \| 'chunk'` | Alert level         |
| name        | `string`              | Alert target name   |
| sizeKB      | `number`              | Actual size (KB)    |
| thresholdKB | `number`              | Threshold size (KB) |
| message     | `string`              | Alert message       |

### ComparisonDiff

Build comparison diff item:

| Field          | Type                                                                | Description         |
| -------------- | ------------------------------------------------------------------- | ------------------- |
| name           | `string`                                                            | Module/chunk name   |
| previousSize   | `number`                                                            | Previous build size |
| currentSize    | `number`                                                            | Current build size  |
| diff           | `number`                                                            | Size change amount  |
| diffPercentage | `number`                                                            | Change percentage   |
| trend          | `'increased' \| 'decreased' \| 'unchanged' \| 'added' \| 'removed'` | Change trend        |

## Examples

### Basic Usage

```typescript
bundleAnalyzer()
```

### Generate HTML Visual Report

```typescript
bundleAnalyzer({
	outputFormat: 'html',
	openAnalyzer: true
})
```

### Output Both JSON and HTML Reports

```typescript
bundleAnalyzer({
	outputFormat: 'both',
	outputFile: 'bundle-report'
})
```

### Set Size Threshold Alerts

```typescript
bundleAnalyzer({
	sizeThreshold: 200,
	gzipSize: true
})
```

Chunks exceeding 200KB will trigger alerts; those exceeding 2x the threshold are marked as critical.

### Compare with Historical Build

```typescript
bundleAnalyzer({
	compareWith: 'dist/bundle-analysis.json',
	outputFormat: 'json'
})
```

After the first build generates a report, subsequent builds will automatically compare with the previous results, showing increased, decreased, added, and removed modules.

### Exclude Specific Modules

```typescript
bundleAnalyzer({
	excludeNodeModules: true,
	excludePatterns: ['vendor', 'polyfill'],
	includeExtensions: ['.js', '.css']
})
```

### Production Only

```typescript
bundleAnalyzer({
	enabled: process.env.NODE_ENV === 'production'
})
```

### Log Errors Without Breaking Build

```typescript
bundleAnalyzer({
	errorStrategy: 'log'
})
```

## Notes

- The plugin executes during the `writeBundle` phase (`enforce: 'post'`), ensuring analysis runs after all build artifacts are written
- Gzip size calculation uses the highest compression level (level: 9), which may take longer for large projects; set `gzipSize: false` to disable
- Build comparison requires manually saving a JSON report as a baseline first, then specifying the path via `compareWith`
- Visual charts in HTML reports depend on inline JavaScript, which may not display correctly under strict CSP policies
- The `openAnalyzer` option supports cross-platform: Windows (`start`), macOS (`open`), and Linux (`xdg-open`)
