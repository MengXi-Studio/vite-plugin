# bundleAnalyzer

构建产物体积分析插件，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比。

## 导入

```typescript
import { bundleAnalyzer } from '@meng-xi/vite-plugin'
// 或子模块导入
import { bundleAnalyzer } from '@meng-xi/vite-plugin/plugins/bundle-analyzer'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { bundleAnalyzer } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [bundleAnalyzer()]
})
```

## 配置选项

| 选项               | 类型                                | 默认值              | 说明                                     |
| ------------------ | ----------------------------------- | ------------------- | ---------------------------------------- |
| outputFormat       | `'json' \| 'html' \| 'both'`        | `'json'`            | 报告输出格式                             |
| outputFile         | `string`                            | `'bundle-analysis'` | 报告输出文件名（不含扩展名）             |
| openAnalyzer       | `boolean`                           | `false`             | 是否在生成 HTML 报告后自动打开浏览器     |
| sizeThreshold      | `number`                            | `100`               | 体积告警阈值（KB）                       |
| compareWith        | `string \| null`                    | `null`              | 用于对比的历史报告路径                   |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### 高级选项

| 选项               | 类型                                | 默认值     | 说明                                     |
| ------------------ | ----------------------------------- | ---------- | ---------------------------------------- |
| topModules         | `number`                            | `20`       | Top N 大模块排行数量                     |
| gzipSize           | `boolean`                           | `true`     | 是否计算 gzip 大小                       |
| excludeNodeModules | `boolean`                           | `false`    | 是否排除 node_modules 中的模块           |
| excludePatterns    | `string[]`                          | `[]`       | 需要排除的文件路径模式列表               |
| includeExtensions  | `string[]`                          | `[]`       | 需要包含的文件扩展名列表，为空则包含所有 |
| defaultChartType   | `'treemap' \| 'sunburst' \| 'list'` | `'treemap'` | HTML 报告中图表的默认展示形式           |

## 类型导出

### BundleAnalysisResult

分析结果接口。

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

单个 chunk 的统计信息。

| 字段      | 类型                            | 说明                  |
| --------- | ------------------------------- | --------------------- |
| name      | `string`                        | chunk 名称            |
| size      | `number`                        | 原始大小（字节）      |
| gzipSize  | `number`                        | gzip 压缩大小（字节） |
| modules   | `ModuleStats[]`                 | 包含的模块列表        |
| type      | `'entry' \| 'chunk' \| 'asset'` | chunk 类型            |
| fileCount | `number`                        | 包含的文件数量        |

### SizeWarning

体积告警信息。

| 字段        | 类型                  | 说明           |
| ----------- | --------------------- | -------------- |
| level       | `'module' \| 'chunk'` | 告警级别       |
| name        | `string`              | 告警目标名称   |
| sizeKB      | `number`              | 实际大小（KB） |
| thresholdKB | `number`              | 阈值大小（KB） |
| message     | `string`              | 告警消息       |

### ComparisonDiff

构建对比差异项。

| 字段           | 类型                                                                | 说明            |
| -------------- | ------------------------------------------------------------------- | --------------- |
| name           | `string`                                                            | 模块/chunk 名称 |
| previousSize   | `number`                                                            | 上次构建大小    |
| currentSize    | `number`                                                            | 本次构建大小    |
| diff           | `number`                                                            | 体积变化量      |
| diffPercentage | `number`                                                            | 变化百分比      |
| trend          | `'increased' \| 'decreased' \| 'unchanged' \| 'added' \| 'removed'` | 变化趋势        |

## 示例

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

## 注意事项

- 插件在 `writeBundle` 阶段执行（`enforce: 'post'`），确保在所有构建产物写入完成后分析
- gzip 大小计算使用最高压缩级别（level: 9），计算耗时可能较长，大项目可设置 `gzipSize: false` 关闭
- 构建对比需要先手动保存一份 JSON 报告作为基线，然后通过 `compareWith` 指定路径
- HTML 报告中的可视化图表依赖内联的 JavaScript，在严格 CSP 策略下可能无法正常显示
- `openAnalyzer` 选项跨平台支持 Windows（`start`）、macOS（`open`）和 Linux（`xdg-open`）
