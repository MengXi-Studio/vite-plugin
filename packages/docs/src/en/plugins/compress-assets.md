# compressAssets

Automatically compress files in the output directory after Vite build, supporting both gzip and brotli compression algorithms.

## Import Methods

```typescript
// Submodule import (recommended)
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress-assets'
import type { CompressAssetsOptions, CompressStats, CompressSummary } from '@meng-xi/vite-plugin/plugins/compress-assets'

// Barrel import
import { compressAssets } from '@meng-xi/vite-plugin'
```

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { compressAssets } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		compressAssets({
			algorithm: 'gzip'
		})
	]
})
```

## Options

| Option             | Type                               | Default    | Description                                        |
| ------------------ | ---------------------------------- | ---------- | -------------------------------------------------- |
| algorithm          | `'gzip'` \| `'brotli'` \| `'both'` | `'gzip'`   | Compression algorithm                              |
| threshold          | `number`                           | `1024`     | Minimum compression threshold (bytes)              |
| deleteOriginalFile | `boolean`                          | `false`    | Whether to delete original files after compression |

> Inherits [BasePluginOptions](/factory/base-plugin-options): `enabled`, `logLevel`, `errorStrategy`

### Advanced Options

| Option            | Type              | Default                                                     | Description                                        |
| ----------------- | ----------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| includeExtensions | `string[]`        | `['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt']` | File extensions to compress                        |
| excludeExtensions | `string[]`        | `[]`                                                        | File extensions to exclude                         |
| excludePaths      | `string[]`        | `[]`                                                        | Path prefixes to exclude                           |
| compressionLevel  | `number`          | `9`                                                         | Gzip compression level (1-9)                       |
| brotliQuality     | `number`          | `11`                                                        | Brotli compression quality (1-11)                  |
| reportOutput      | `string` \| `false` | `'compress-report.json'`                                  | Compression report output path, false to skip      |
| parallelLimit     | `number`          | `10`                                                        | Maximum concurrent file compression count          |

## Type Definitions

### CompressStats

Compression statistics for a single file.

| Property       | Type                   | Description                          |
| -------------- | ---------------------- | ------------------------------------ |
| file           | `string`               | Original file path                   |
| originalSize   | `number`               | Original file size (bytes)           |
| compressedSize | `number`               | Compressed file size (bytes)         |
| ratio          | `number`               | Compression ratio percentage (0-100) |
| algorithm      | `'gzip'` \| `'brotli'` | Compression algorithm used           |

### CompressSummary

Summary statistics for the compression operation.

| Property            | Type              | Description                            |
| ------------------- | ----------------- | -------------------------------------- |
| totalFiles          | `number`          | Total number of compressed files       |
| totalOriginalSize   | `number`          | Total original size of all files       |
| totalCompressedSize | `number`          | Total compressed size of all files     |
| totalRatio          | `number`          | Overall compression ratio percentage   |
| gzipFiles           | `number`          | Number of files compressed with gzip   |
| brotliFiles         | `number`          | Number of files compressed with brotli |
| executionTime       | `number`          | Total compression time (ms)            |
| stats               | `CompressStats[]` | Detailed compression stats per file    |

## Examples

### Using Brotli Compression

```typescript
compressAssets({ algorithm: 'brotli' })
```

### Generate Both gzip and brotli

```typescript
compressAssets({
	algorithm: 'both',
	threshold: 2048,
	compressionLevel: 9,
	brotliQuality: 11
})
```

### Delete Original Files After Compression

```typescript
compressAssets({
	deleteOriginalFile: true,
	reportOutput: 'compress-report.json'
})
```

### Custom File Filtering

```typescript
compressAssets({
	includeExtensions: ['.js', '.css'],
	excludePaths: ['assets/images'],
	parallelLimit: 5
})
```

### Production Only

```typescript
compressAssets({
	algorithm: 'gzip',
	enabled: process.env.NODE_ENV === 'production'
})
```

### Log Errors Without Breaking Build

```typescript
compressAssets({
	algorithm: 'gzip',
	errorStrategy: 'log'
})
```

## Notes

- Uses `enforce: 'post'` to execute after build artifacts are written
- `algorithm: 'both'` generates both `.gz` and `.br` files simultaneously
- Setting `threshold` to 0 will compress all files (not recommended, as very small files may become larger after compression)
- `deleteOriginalFile: true` keeps only compressed versions; ensure your server supports the corresponding compression formats
- The compression report includes per-file compression ratios and overall statistics for configuration optimization
- Concurrent compression is controlled via `parallelLimit` to manage resource usage, defaulting to 10 concurrent operations
