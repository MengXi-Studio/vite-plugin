# imageOptimizer

Automatically optimize images after Vite build, supporting compression and format conversion for JPEG, PNG, WebP, AVIF, GIF, TIFF, and SVG formats.

## Import Methods

```typescript
// Submodule import (recommended)
import { imageOptimizer } from '@meng-xi/vite-plugin/plugins/image-optimizer'
import type { ImageOptimizerOptions, ImageOptimizeStats, ImageOptimizeSummary, ImageFormat, FormatQualityOptions } from '@meng-xi/vite-plugin/plugins/image-optimizer'

// Barrel import
import { imageOptimizer } from '@meng-xi/vite-plugin'
```

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { imageOptimizer } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		imageOptimizer({
			quality: { jpeg: 80, webp: 75 },
			convertToWebp: { png: true }
		})
	]
})
```

## Dependencies

This plugin relies on the following optional dependencies:

- **sharp** - Bitmap optimization (JPEG/PNG/WebP/AVIF/GIF/TIFF), skips bitmap optimization if not installed
- **svgo** - SVG optimization, skips SVG optimization if not installed

```bash
# Install both dependencies
npm install sharp svgo -D

# Bitmap optimization only
npm install sharp -D

# SVG optimization only
npm install svgo -D
```

::: tip Both dependencies are optional. The plugin automatically detects installed dependencies and only performs the corresponding optimization tasks. :::

## Options

| Option            | Type                                                                 | Default                                                                                          | Description                                                    |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| quality           | `FormatQualityOptions`                                               | `{ jpeg: 80, png: 6, webp: 75, avif: 50, gif: true, tiff: 'deflate' }`                           | Compression quality parameters for each format                 |
| convertToWebp     | `Partial<Record<'jpeg' \| 'png' \| 'gif' \| 'tiff', boolean>>`       | `{}`                                                                                             | Convert specified formats to WebP                              |
| convertToAvif     | `Partial<Record<'jpeg' \| 'png' \| 'gif' \| 'tiff', boolean>>`       | `{}`                                                                                             | Convert specified formats to AVIF                              |
| convertMapping    | `ConvertMapping`                                                     | `{}`                                                                                             | Custom format conversion mapping, takes priority over the above |
| svgo              | `SvgoOptions`                                                        | `{}`                                                                                             | SVG optimization configuration                                 |
| includeExtensions | `string[]`                                                           | `['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tiff', '.tif', '.svg']`                   | File extensions to optimize                                    |
| excludePaths      | `string[]`                                                           | `[]`                                                                                             | Path prefixes to exclude                                       |
| threshold         | `number`                                                             | `0`                                                                                              | Minimum optimization threshold (bytes), 0 for no limit         |
| keepOriginal      | `boolean`                                                            | `false`                                                                                          | Whether to keep original files during format conversion         |
| reportOutput      | `string` \| `false`                                                  | `'image-optimize-report.json'`                                                                   | Optimization report output path, false to skip                  |
| parallelLimit     | `number`                                                             | `10`                                                                                             | Maximum concurrent file optimization count                      |
| maxPixels         | `number`                                                             | `0`                                                                                              | Maximum pixels per image, 0 for no limit                       |
| enabled           | `boolean`                                                            | `true`                                                                                           | Enable the plugin                                              |
| verbose           | `boolean`                                                            | `true`                                                                                           | Show detailed logs                                             |
| errorStrategy     | `'throw'` \| `'log'` \| `'ignore'`                                  | `'throw'`                                                                                        | Error handling strategy                                        |

## Type Definitions

### FormatQualityOptions

Compression quality parameters for each format.

| Property | Type                               | Default      | Description                          |
| -------- | ---------------------------------- | ------------ | ------------------------------------ |
| jpeg     | `number`                           | `80`         | JPEG quality (1-100)                 |
| png      | `number`                           | `6`          | PNG compression level (1-9)          |
| webp     | `number`                           | `75`         | WebP quality (1-100)                 |
| avif     | `number`                           | `50`         | AVIF quality (1-100)                 |
| gif      | `boolean`                          | `true`       | Whether to try palette optimization  |
| tiff     | `'none' \| 'lzw' \| 'deflate' \| 'packbits'` | `'deflate'` | TIFF compression algorithm |

### ImageOptimizeStats

Optimization statistics for a single file.

| Property      | Type          | Description                                                    |
| ------------- | ------------- | -------------------------------------------------------------- |
| file          | `string`      | Original file path                                             |
| relativePath  | `string`      | Relative path to output directory                              |
| originalSize  | `number`      | Original file size (bytes)                                     |
| optimizedSize | `number`      | Optimized file size (bytes)                                    |
| ratio         | `number`      | Compression ratio percentage (0-100)                           |
| sourceFormat  | `ImageFormat` | Source image format                                            |
| outputFormat  | `ImageFormat` | Output image format (different from sourceFormat means conversion) |
| converted     | `boolean`     | Whether format conversion occurred                             |
| duration      | `number`      | Optimization time (ms)                                         |

### ImageOptimizeSummary

Summary statistics for the optimization operation.

| Property           | Type                                                                 | Description                          |
| ------------------ | -------------------------------------------------------------------- | ------------------------------------ |
| totalFiles         | `number`                                                             | Total number of optimized files      |
| skippedFiles       | `number`                                                             | Number of skipped files              |
| failedFiles        | `number`                                                             | Number of failed files               |
| totalOriginalSize  | `number`                                                             | Total original size of all files     |
| totalOptimizedSize | `number`                                                             | Total optimized size of all files    |
| totalRatio         | `number`                                                             | Overall compression ratio percentage |
| byFormat           | `Record<string, { count, originalSize, optimizedSize, ratio }>`      | Statistics grouped by format         |
| convertedFiles     | `number`                                                             | Number of format-converted files     |
| executionTime      | `number`                                                             | Total optimization time (ms)         |
| stats              | `ImageOptimizeStats[]`                                               | Detailed optimization stats per file |

## Examples

### Basic Compression

```typescript
imageOptimizer({
	quality: { jpeg: 80, png: 6, webp: 75 }
})
```

### PNG to WebP

```typescript
imageOptimizer({
	convertToWebp: { png: true }
})
```

### Multi-Format Conversion

```typescript
imageOptimizer({
	convertToWebp: { png: true, jpeg: true },
	convertToAvif: { png: true },
	keepOriginal: true
})
```

### Custom Format Conversion Mapping

```typescript
imageOptimizer({
	convertMapping: {
		jpeg: 'webp',
		png: 'avif'
	}
})
```

### SVG Optimization

```typescript
imageOptimizer({
	svgo: {
		plugins: [
			{ name: 'removeViewBox', active: false },
			{ name: 'removeEmptyContainers', active: true }
		],
		multipass: true
	}
})
```

### Limit Large Image Size

```typescript
imageOptimizer({
	maxPixels: 1920 * 1080, // Images exceeding 1080p will be scaled down
	quality: { jpeg: 75, webp: 70 }
})
```

### Production Only

```typescript
imageOptimizer({
	enabled: process.env.NODE_ENV === 'production',
	quality: { jpeg: 70, webp: 65 }
})
```

## Notes

- Uses `enforce: 'post'` to execute after build artifacts are written
- **Volume conservation**: When only compressing, if the optimized file is larger, it is skipped (original preserved); format conversion always generates the new format file
- `keepOriginal: true` retains the original file during conversion, output uses new extension (e.g., `logo.png` → `logo.webp`)
- `keepOriginal: false` (default) replaces the original file during conversion
- `sharp` and `svgo` are both optional dependencies; the plugin automatically skips corresponding optimization types when not installed
- Concurrent optimization is controlled via `parallelLimit` to manage resource usage, defaulting to 10 concurrent operations
- `maxPixels` can limit the pixel count of oversized images to avoid memory overflow
