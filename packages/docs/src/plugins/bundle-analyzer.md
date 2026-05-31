# bundleAnalyzer

构建产物体积分析插件，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { bundleAnalyzer } from '@meng-xi/vite-plugin/plugins/bundle-analyzer'
import type { BundleAnalyzerOptions, BundleAnalysisResult, BundleOutputFormat } from '@meng-xi/vite-plugin/plugins/bundle-analyzer'

// barrel 导入
import { bundleAnalyzer } from '@meng-xi/vite-plugin'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { bundleAnalyzer } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [bundleAnalyzer()]
})
```

## 功能特点

- **多格式报告输出**：支持 JSON、HTML 或同时输出两种格式
- **体积分析**：计算原始大小和 gzip 压缩大小
- **阈值告警**：超过指定大小的 chunk 自动产生告警
- **构建对比**：与历史报告对比体积变化趋势
- **可视化图表**：HTML 报告支持树状图（treemap）、旭日图（sunburst）和列表视图
- **模块排行**：Top N 大模块排行，区分源码和 node_modules
- **文件类型分布**：按扩展名统计体积占比

## 配置选项

| 选项               | 类型                                | 默认值              | 说明                                     |
| ------------------ | ----------------------------------- | ------------------- | ---------------------------------------- |
| outputFormat       | `'json' \| 'html' \| 'both'`        | `'json'`            | 报告输出格式                             |
| outputFile         | `string`                            | `'bundle-analysis'` | 报告输出文件名（不含扩展名）             |
| openAnalyzer       | `boolean`                           | `false`             | 是否在生成 HTML 报告后自动打开浏览器     |
| sizeThreshold      | `number`                            | `100`               | 体积告警阈值（KB）                       |
| topModules         | `number`                            | `20`                | Top N 大模块排行数量                     |
| compareWith        | `string \| null`                    | `null`              | 用于对比的历史报告路径                   |
| gzipSize           | `boolean`                           | `true`              | 是否计算 gzip 大小                       |
| excludeNodeModules | `boolean`                           | `false`             | 是否排除 node_modules 中的模块           |
| excludePatterns    | `string[]`                          | `[]`                | 需要排除的文件路径模式列表               |
| includeExtensions  | `string[]`                          | `[]`                | 需要包含的文件扩展名列表，为空则包含所有 |
| defaultChartType   | `'treemap' \| 'sunburst' \| 'list'` | `'treemap'`         | HTML 报告中图表的默认展示形式            |
| enabled            | `boolean`                           | `true`              | 启用插件                                 |
| verbose            | `boolean`                           | `true`              | 显示详细日志                             |
| errorStrategy      | `'throw' \| 'log' \| 'ignore'`      | `'throw'`           | 错误处理策略                             |

## 类型导出

### BundleOutputFormat

```typescript
type BundleOutputFormat = 'json' | 'html' | 'both'
```

报告输出格式类型。

### BundleAnalysisResult

分析结果接口，包含以下字段：

| 字段                 | 类型                     | 说明                   |
| -------------------- | ------------------------ | ---------------------- |
| timestamp            | `string`                 | 分析时间戳（ISO 格式） |
| totalSize            | `number`                 | 构建产物总大小（字节） |
| totalGzipSize        | `number`                 | gzip 总大小（字节）    |
| chunks               | `ChunkStats[]`           | chunk 统计列表         |
| topModules           | `ModuleStats[]`          | Top N 大模块排行       |
| fileTypeDistribution | `FileTypeDistribution[]` | 文件类型分布统计       |
| warnings             | `SizeWarning[]`          | 体积阈值告警列表       |
| comparisonDiffs      | `ComparisonDiff[]`       | 构建对比差异列表       |
| analysisTime         | `number`                 | 分析耗时（毫秒）       |

### ChunkStats

单个 chunk 的统计信息：

| 字段      | 类型                            | 说明                  |
| --------- | ------------------------------- | --------------------- |
| name      | `string`                        | chunk 名称            |
| size      | `number`                        | 原始大小（字节）      |
| gzipSize  | `number`                        | gzip 压缩大小（字节） |
| modules   | `ModuleStats[]`                 | 包含的模块列表        |
| type      | `'entry' \| 'chunk' \| 'asset'` | chunk 类型            |
| fileCount | `number`                        | 包含的文件数量        |

### SizeWarning

体积告警信息：

| 字段        | 类型                  | 说明           |
| ----------- | --------------------- | -------------- |
| level       | `'module' \| 'chunk'` | 告警级别       |
| name        | `string`              | 告警目标名称   |
| sizeKB      | `number`              | 实际大小（KB） |
| thresholdKB | `number`              | 阈值大小（KB） |
| message     | `string`              | 告警消息       |

### ComparisonDiff

构建对比差异项：

| 字段           | 类型                                                                | 说明            |
| -------------- | ------------------------------------------------------------------- | --------------- |
| name           | `string`                                                            | 模块/chunk 名称 |
| previousSize   | `number`                                                            | 上次构建大小    |
| currentSize    | `number`                                                            | 本次构建大小    |
| diff           | `number`                                                            | 体积变化量      |
| diffPercentage | `number`                                                            | 变化百分比      |
| trend          | `'increased' \| 'decreased' \| 'unchanged' \| 'added' \| 'removed'` | 变化趋势        |

## 示例

### 基本用法

```typescript
bundleAnalyzer()
```

### 生成 HTML 可视化报告

```typescript
bundleAnalyzer({
	outputFormat: 'html',
	openAnalyzer: true
})
```

### 同时输出 JSON 和 HTML 报告

```typescript
bundleAnalyzer({
	outputFormat: 'both',
	outputFile: 'bundle-report'
})
```

### 设置体积阈值告警

```typescript
bundleAnalyzer({
	sizeThreshold: 200,
	gzipSize: true
})
```

超过 200KB 的 chunk 将产生告警，超过阈值 2 倍的标记为严重告警。

### 与历史构建对比

```typescript
bundleAnalyzer({
	compareWith: 'dist/bundle-analysis.json',
	outputFormat: 'json'
})
```

首次构建生成报告后，后续构建会自动与上次结果对比，显示增大、减小、新增和移除的模块。

### 排除特定模块

```typescript
bundleAnalyzer({
	excludeNodeModules: true,
	excludePatterns: ['vendor', 'polyfill'],
	includeExtensions: ['.js', '.css']
})
```

### 仅生产环境启用

```typescript
bundleAnalyzer({
	enabled: process.env.NODE_ENV === 'production'
})
```

### 记录错误但不中断构建

```typescript
bundleAnalyzer({
	errorStrategy: 'log'
})
```

## 注意事项

- 插件在 `writeBundle` 阶段执行（`enforce: 'post'`），确保在所有构建产物写入完成后分析
- gzip 大小计算使用最高压缩级别（level: 9），计算耗时可能较长，大项目可设置 `gzipSize: false` 关闭
- 构建对比需要先手动保存一份 JSON 报告作为基线，然后通过 `compareWith` 指定路径
- HTML 报告中的可视化图表依赖内联的 JavaScript，在严格 CSP 策略下可能无法正常显示
- `openAnalyzer` 选项跨平台支持 Windows（`start`）、macOS（`open`）和 Linux（`xdg-open`）
