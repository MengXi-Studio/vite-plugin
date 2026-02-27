# generateVersion 插件

`generateVersion` 插件用于在 Vite 构建过程中自动生成版本号，支持多种格式和输出方式。

## 功能特性

- 支持多种版本号格式（时间戳、日期、语义化版本、哈希等）
- 支持自定义格式模板
- 支持输出到文件或注入到代码中
- 支持添加版本号前缀和后缀
- 支持附加额外的版本信息
- 支持启用/禁用插件
- 支持详细日志输出
- 提供灵活的错误处理机制

## 基本用法

### 简单配置

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [generateVersion()]
})
```

### 完整配置

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'custom',
			customFormat: '{YYYY}.{MM}.{DD}-{hash}',
			hashLength: 6,
			outputType: 'both',
			outputFile: 'version.json',
			defineName: '__APP_VERSION__',
			prefix: 'v',
			suffix: '-beta',
			enabled: true,
			verbose: true,
			errorStrategy: 'throw',
			extra: {
				environment: 'production',
				author: 'MengXi Studio'
			}
		})
	]
})
```

## 配置选项

| 选项          | 类型                         | 默认值                | 描述                                                              |
| ------------- | ---------------------------- | --------------------- | ----------------------------------------------------------------- |
| format        | VersionFormat                | 'timestamp'           | 版本号格式                                                        |
| customFormat  | string                       | -                     | 自定义格式模板，仅当 format 为 'custom' 时有效                    |
| semverBase    | string                       | '1.0.0'               | 语义化版本基础值，用于 semver 格式                                |
| autoIncrement | boolean                      | false                 | 是否自动递增补丁版本号                                            |
| outputType    | OutputType                   | 'file'                | 输出类型：'file' 输出到文件，'define' 注入代码，'both' 两者兼具   |
| outputFile    | string                       | 'version.json'        | 输出文件路径（相对于构建输出目录）                                |
| defineName    | string                       | '\_\_APP_VERSION\_\_' | 注入到代码中的全局变量名                                          |
| hashLength    | number                       | 8                     | 哈希长度，范围 1-32                                               |
| prefix        | string                       | ''                    | 版本号前缀                                                        |
| suffix        | string                       | ''                    | 版本号后缀                                                        |
| extra         | object                       | -                     | 额外的版本信息，会包含在输出的 JSON 文件中                        |
| enabled       | boolean                      | true                  | 是否启用插件                                                      |
| verbose       | boolean                      | true                  | 是否显示详细日志                                                  |
| errorStrategy | 'throw' \| 'log' \| 'ignore' | 'throw'               | 错误处理策略：'throw' 抛出错误，'log' 记录日志，'ignore' 忽略错误 |

### 版本号格式 (VersionFormat)

| 格式      | 说明           | 示例              |
| --------- | -------------- | ----------------- |
| timestamp | 时间戳格式     | 20260203153000    |
| date      | 日期格式       | 2026.02.03        |
| datetime  | 日期时间格式   | 2026.02.03.153000 |
| semver    | 语义化版本格式 | 1.0.0             |
| hash      | 随机哈希格式   | a1b2c3d4          |
| custom    | 自定义格式     | 根据 customFormat |

### 自定义格式占位符

| 占位符      | 说明       | 示例       |
| ----------- | ---------- | ---------- |
| {YYYY}      | 四位年份   | 2026       |
| {YY}        | 两位年份   | 26         |
| {MM}        | 两位月份   | 02         |
| {DD}        | 两位日期   | 03         |
| {HH}        | 两位小时   | 15         |
| {mm}        | 两位分钟   | 30         |
| {ss}        | 两位秒数   | 00         |
| {SSS}       | 三位毫秒   | 123        |
| {timestamp} | 时间戳     | 1738567800 |
| {hash}      | 随机哈希   | a1b2c3d4   |
| {major}     | 主版本号   | 1          |
| {minor}     | 次版本号   | 0          |
| {patch}     | 补丁版本号 | 0          |

## 示例

### 时间戳格式

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'timestamp'
		})
	]
})
// 输出: 20260203153000
```

### 日期格式 + 前缀

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'date',
			prefix: 'v'
		})
	]
})
// 输出: v2026.02.03
```

### 语义化版本格式

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'semver',
			semverBase: '2.0.0',
			prefix: 'v'
		})
	]
})
// 输出: v2.0.0
```

### 自定义格式

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'custom',
			customFormat: '{YYYY}.{MM}.{DD}-{hash}',
			hashLength: 6
		})
	]
})
// 输出: 2026.02.03-a1b2c3
```

### 注入到代码中

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			outputType: 'define',
			defineName: '__VERSION__'
		})
	]
})

// 在代码中使用
console.log(__VERSION__) // '20260203153000'
```

### 同时输出文件和注入代码

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			outputType: 'both',
			outputFile: 'build-info.json',
			defineName: '__BUILD_VERSION__',
			extra: {
				environment: 'production',
				author: 'MengXi Studio'
			}
		})
	]
})
```

### 根据环境启用

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			enabled: process.env.NODE_ENV === 'production'
		})
	]
})
```

## 输出文件格式

当 `outputType` 为 `'file'` 或 `'both'` 时，会生成如下格式的 JSON 文件：

```json
{
	"version": "v2026.02.03-a1b2c3",
	"buildTime": "2026-02-03T15:30:00.000Z",
	"timestamp": 1738567800000,
	"format": "custom",
	"environment": "production",
	"author": "MengXi Studio"
}
```

## 注意事项

- 插件在 Vite 配置解析阶段生成版本号，确保版本号在整个构建过程中保持一致
- 当 `format` 为 `'custom'` 时，必须提供 `customFormat` 选项
- `hashLength` 必须在 1-32 之间
- 当 `outputType` 为 `'define'` 或 `'both'` 时，会同时注入 `defineName` 和 `defineName_INFO` 两个全局变量
- `extra` 中的额外信息只会包含在输出的 JSON 文件中，不会影响版本号字符串
- 当 `enabled` 为 `false` 时，插件不会执行任何操作
- `errorStrategy` 选项决定了错误处理方式：
  - `'throw'`：抛出错误，中断构建流程
  - `'log'`：记录错误日志，但不中断构建
  - `'ignore'`：忽略错误，继续执行
