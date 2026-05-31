# compressAssets

在 Vite 构建完成后自动压缩输出目录中的文件，支持 gzip 和 brotli 两种压缩算法。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress-assets'
import type { CompressAssetsOptions, CompressStats, CompressSummary } from '@meng-xi/vite-plugin/plugins/compress-assets'

// barrel 导入
import { compressAssets } from '@meng-xi/vite-plugin'
```

## 快速开始

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

## 配置选项

| 选项               | 类型                               | 默认值                                                      | 说明                           |
| ------------------ | ---------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| algorithm          | `'gzip'` \| `'brotli'` \| `'both'` | `'gzip'`                                                    | 压缩算法                       |
| threshold          | `number`                           | `1024`                                                      | 最小压缩阈值（字节）           |
| deleteOriginalFile | `boolean`                          | `false`                                                     | 压缩后是否删除原始文件         |
| includeExtensions  | `string[]`                         | `['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt']` | 需要压缩的文件扩展名           |
| excludeExtensions  | `string[]`                         | `[]`                                                        | 需要排除的文件扩展名           |
| excludePaths       | `string[]`                         | `[]`                                                        | 需要排除的路径前缀             |
| compressionLevel   | `number`                           | `9`                                                         | gzip 压缩级别（1-9）           |
| brotliQuality      | `number`                           | `11`                                                        | brotli 压缩质量（1-11）        |
| reportOutput       | `string` \| `false`                | `'compress-report.json'`                                    | 压缩报告输出路径，false 不生成 |
| parallelLimit      | `number`                           | `10`                                                        | 并发压缩最大文件数             |
| enabled            | `boolean`                          | `true`                                                      | 启用插件                       |
| verbose            | `boolean`                          | `true`                                                      | 显示详细日志                   |
| errorStrategy      | `'throw'` \| `'log'` \| `'ignore'` | `'throw'`                                                   | 错误处理策略                   |

## 类型定义

### CompressStats

单个文件的压缩统计信息。

| 属性           | 类型                   | 说明                   |
| -------------- | ---------------------- | ---------------------- |
| file           | `string`               | 原始文件路径           |
| originalSize   | `number`               | 原始文件大小（字节）   |
| compressedSize | `number`               | 压缩后文件大小（字节） |
| ratio          | `number`               | 压缩率百分比（0-100）  |
| algorithm      | `'gzip'` \| `'brotli'` | 使用的压缩算法         |

### CompressSummary

压缩操作的汇总统计信息。

| 属性                | 类型              | 说明                       |
| ------------------- | ----------------- | -------------------------- |
| totalFiles          | `number`          | 压缩的文件总数             |
| totalOriginalSize   | `number`          | 所有文件的原始大小总和     |
| totalCompressedSize | `number`          | 所有文件的压缩后大小总和   |
| totalRatio          | `number`          | 总体压缩率百分比           |
| gzipFiles           | `number`          | 使用 gzip 压缩的文件数量   |
| brotliFiles         | `number`          | 使用 brotli 压缩的文件数量 |
| executionTime       | `number`          | 压缩操作总耗时（毫秒）     |
| stats               | `CompressStats[]` | 每个文件的详细压缩统计     |

## 示例

### 使用 brotli 压缩

```typescript
compressAssets({ algorithm: 'brotli' })
```

### 同时生成 gzip 和 brotli

```typescript
compressAssets({
	algorithm: 'both',
	threshold: 2048,
	compressionLevel: 9,
	brotliQuality: 11
})
```

### 压缩后删除原始文件

```typescript
compressAssets({
	deleteOriginalFile: true,
	reportOutput: 'compress-report.json'
})
```

### 自定义文件过滤

```typescript
compressAssets({
	includeExtensions: ['.js', '.css'],
	excludePaths: ['assets/images'],
	parallelLimit: 5
})
```

### 仅生产环境启用

```typescript
compressAssets({
	algorithm: 'gzip',
	enabled: process.env.NODE_ENV === 'production'
})
```

### 记录错误但不中断构建

```typescript
compressAssets({
	algorithm: 'gzip',
	errorStrategy: 'log'
})
```

## 注意事项

- 使用 `enforce: 'post'` 确保在构建产物写入完成后执行
- `algorithm: 'both'` 时会同时生成 `.gz` 和 `.br` 文件
- `threshold` 设为 0 将压缩所有文件（不推荐，极小文件压缩后可能更大）
- `deleteOriginalFile: true` 时仅保留压缩版本，需确保服务器支持对应的压缩格式
- 压缩报告包含每个文件的压缩率和总体统计，便于优化配置
- 并发压缩通过 `parallelLimit` 控制资源占用，默认 10 个并发
