# imageOptimizer

构建后自动优化图片，支持 JPEG、PNG、WebP、AVIF、GIF、TIFF、SVG 格式的压缩与格式转换，使用 sharp 和 svgo 作为优化引擎。

## 导入

```typescript
import { imageOptimizer } from '@meng-xi/vite-plugin'
// 或子模块导入
import { imageOptimizer } from '@meng-xi/vite-plugin/plugins/image-optimizer'
```

## 快速开始

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

## 依赖说明

本插件依赖以下可选依赖：

- **sharp** — 位图优化（JPEG/PNG/WebP/AVIF/GIF/TIFF），未安装时跳过位图优化
- **svgo** — SVG 优化，未安装时跳过 SVG 优化

```bash
# 安装依赖
npm install sharp svgo -D

# 仅安装位图优化
npm install sharp -D

# 仅安装 SVG 优化
npm install svgo -D
```

::: tip
两个依赖均为可选，插件会自动检测已安装的依赖并仅执行对应的优化任务。
:::

## 配置选项

| 选项              | 类型                                                            | 默认值                                                                 | 说明                     |
| ----------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------ |
| quality           | `FormatQualityOptions`                                          | `{ jpeg: 80, png: 6, webp: 75, avif: 50, gif: true, tiff: 'deflate' }` | 各格式的压缩质量参数     |
| convertToWebp     | `Partial<Record<'jpeg' \| 'png' \| 'gif' \| 'tiff', boolean>>` | `{}`                                                                   | 将指定格式转换为 WebP    |
| convertToAvif     | `Partial<Record<'jpeg' \| 'png' \| 'gif' \| 'tiff', boolean>>` | `{}`                                                                   | 将指定格式转换为 AVIF    |
| keepOriginal      | `boolean`                                                       | `true`                                                                 | 格式转换时是否保留原始文件 |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### 高级选项

| 选项              | 类型              | 默认值                                                                        | 说明                                   |
| ----------------- | ----------------- | ----------------------------------------------------------------------------- | -------------------------------------- |
| convertMapping    | `ConvertMapping`  | `{}`                                                                          | 自定义格式转换映射，优先级高于上述两项 |
| svgo              | `SvgoOptions`     | `{}`                                                                          | SVG 优化配置                           |
| includeExtensions | `string[]`        | `['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tiff', '.tif', '.svg']` | 需要优化的文件扩展名                   |
| excludePaths      | `string[]`        | `[]`                                                                          | 需要排除的路径前缀                     |
| threshold         | `number`          | `0`                                                                           | 最小优化阈值（字节），0 表示不限制     |
| reportOutput      | `string \| false` | `'image-optimize-report.json'`                                                | 优化报告输出路径，false 不生成         |
| parallelLimit     | `number`          | `5`                                                                           | 并发优化最大文件数                     |
| maxPixels         | `number`          | `0`                                                                           | 单个图片最大像素数，0 表示不限制       |

## 类型导出

### ImageFormat

支持的图片格式类型：`'jpeg' | 'png' | 'webp' | 'avif' | 'gif' | 'tiff' | 'svg'`

### FormatQualityOptions

各格式的压缩质量参数。

| 属性  | 类型                                           | 默认值       | 说明               |
| ----- | ---------------------------------------------- | ------------ | ------------------ |
| jpeg  | `number`                                       | `80`         | JPEG 质量（1-100） |
| png   | `number`                                       | `6`          | PNG 压缩级别（1-9）|
| webp  | `number`                                       | `75`         | WebP 质量（1-100） |
| avif  | `number`                                       | `50`         | AVIF 质量（1-100） |
| gif   | `boolean`                                      | `true`       | GIF 是否尝试调色板优化 |
| tiff  | `'none' \| 'lzw' \| 'deflate' \| 'packbits'`  | `'deflate'`  | TIFF 压缩算法      |

### ConvertMapping

格式转换映射，键为源格式，值为目标格式。

```typescript
type ConvertMapping = Partial<Record<ImageFormat, ImageFormat>>
```

### SvgoOptions

SVG 优化配置。

| 属性      | 类型           | 默认值  | 说明               |
| --------- | -------------- | ------- | ------------------ |
| plugins   | `SvgoPlugin[]` | `[]`    | SVGO 插件列表      |
| multipass | `boolean`      | `false` | 是否启用多进程优化 |

### ImageOptimizeStats

单个文件的优化统计信息。

| 属性          | 类型          | 说明                                             |
| ------------- | ------------- | ------------------------------------------------ |
| file          | `string`      | 原始文件路径                                     |
| relativePath  | `string`      | 相对于输出目录的相对路径                         |
| originalSize  | `number`      | 原始文件大小（字节）                             |
| optimizedSize | `number`      | 优化后文件大小（字节）                           |
| ratio         | `number`      | 压缩率百分比（0-100）                            |
| sourceFormat  | `ImageFormat` | 源图片格式                                       |
| outputFormat  | `ImageFormat` | 输出图片格式（与 sourceFormat 不同表示格式转换） |
| converted     | `boolean`     | 是否发生了格式转换                               |
| duration      | `number`      | 优化耗时（毫秒）                                 |

### ImageOptimizeSummary

优化操作的汇总统计信息。

| 属性               | 类型                                                            | 说明                     |
| ------------------ | --------------------------------------------------------------- | ------------------------ |
| totalFiles         | `number`                                                        | 优化的文件总数           |
| skippedFiles       | `number`                                                        | 跳过的文件数量           |
| failedFiles        | `number`                                                        | 失败的文件数量           |
| totalOriginalSize  | `number`                                                        | 所有文件的原始大小总和   |
| totalOptimizedSize | `number`                                                        | 所有文件的优化后大小总和 |
| totalRatio         | `number`                                                        | 总体压缩率百分比         |
| byFormat           | `Record<string, { count, originalSize, optimizedSize, ratio }>` | 按格式分组的统计         |
| convertedFiles     | `number`                                                        | 格式转换的文件数量       |
| executionTime      | `number`                                                        | 优化操作总耗时（毫秒）   |
| stats              | `ImageOptimizeStats[]`                                          | 每个文件的详细优化统计   |

## 示例

### 基础压缩

```typescript
imageOptimizer({
  quality: { jpeg: 80, png: 6, webp: 75 }
})
```

### PNG 转 WebP

```typescript
imageOptimizer({
  convertToWebp: { png: true }
})
```

### 多格式转换

```typescript
imageOptimizer({
  convertToWebp: { png: true, jpeg: true },
  convertToAvif: { png: true },
  keepOriginal: true
})
```

### 自定义格式转换映射

```typescript
imageOptimizer({
  convertMapping: {
    jpeg: 'webp',
    png: 'avif'
  }
})
```

### SVG 优化

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

### 限制大图尺寸

```typescript
imageOptimizer({
  maxPixels: 1920 * 1080, // 超过 1080p 的图片将被缩放
  quality: { jpeg: 75, webp: 70 }
})
```

## 注意事项

- 插件使用 `enforce: 'post'` 确保在构建产物写入完成后执行
- **体积守恒**：仅压缩时，如果优化后文件更大则跳过（保留原文件）；格式转换时始终生成新格式文件
- `keepOriginal: true` 时格式转换会保留原始文件，输出文件使用新扩展名（如 `logo.png` → `logo.webp`）
- `keepOriginal: false` 时格式转换会替换原始文件
- `sharp` 和 `svgo` 均为可选依赖，未安装时插件会自动跳过对应类型的优化
- 并发优化通过 `parallelLimit` 控制资源占用，默认 5 个并发
- `maxPixels` 可用于限制超大图片的像素数，避免内存溢出
