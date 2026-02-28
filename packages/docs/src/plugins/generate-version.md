# generateVersion

在 Vite 构建过程中自动生成版本号，支持文件输出和全局变量注入。

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { generateVersion } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [generateVersion()]
})
```

## 配置选项

| 选项          | 类型                           | 默认值              | 说明                     |
| ------------- | ------------------------------ | ------------------- | ------------------------ |
| format        | `VersionFormat`                | `'timestamp'`       | 版本号格式               |
| customFormat  | `string`                       | -                   | 自定义格式模板           |
| semverBase    | `string`                       | `'1.0.0'`           | 语义化版本基础值         |
| autoIncrement | `boolean`                      | `false`             | 自动递增补丁版本号       |
| outputType    | `OutputType`                   | `'file'`            | 输出类型                 |
| outputFile    | `string`                       | `'version.json'`    | 输出文件路径             |
| defineName    | `string`                       | `'__APP_VERSION__'` | 全局变量名               |
| hashLength    | `number`                       | `8`                 | 哈希长度（1-32）         |
| prefix        | `string`                       | `''`                | 版本号前缀               |
| suffix        | `string`                       | `''`                | 版本号后缀               |
| extra         | `Record<string, unknown>`      | -                   | 附加信息（仅 JSON 文件） |
| enabled       | `boolean`                      | `true`              | 启用插件                 |
| verbose       | `boolean`                      | `true`              | 显示详细日志             |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'`           | 错误处理策略             |

### 版本号格式

| 格式      | 说明       | 示例              |
| --------- | ---------- | ----------------- |
| timestamp | 时间戳     | 20260203153000    |
| date      | 日期       | 2026.02.03        |
| datetime  | 日期时间   | 2026.02.03.153000 |
| semver    | 语义化版本 | 1.0.0             |
| hash      | 随机哈希   | a1b2c3d4          |
| custom    | 自定义模板 | -                 |

### 输出类型

| 类型   | 说明                   |
| ------ | ---------------------- |
| file   | 输出到 JSON 文件       |
| define | 注入全局变量           |
| both   | 文件和全局变量同时输出 |

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

### 日期格式 + 前缀

```typescript
generateVersion({
	format: 'date',
	prefix: 'v'
})
// 输出: v2026.02.03
```

### 自定义格式

```typescript
generateVersion({
	format: 'custom',
	customFormat: '{YYYY}.{MM}.{DD}-{hash}',
	hashLength: 6
})
// 输出: 2026.02.03-a1b2c3
```

### 注入全局变量

```typescript
generateVersion({
	outputType: 'define',
	defineName: '__VERSION__'
})

// 代码中使用
console.log(__VERSION__) // '20260203153000'
```

### 同时输出文件和注入代码

```typescript
generateVersion({
	outputType: 'both',
	outputFile: 'build-info.json',
	defineName: '__BUILD_VERSION__',
	extra: {
		environment: 'production',
		author: 'MengXi Studio'
	}
})
```

## 输出文件格式

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

- 当 `format` 为 `'custom'` 时必须提供 `customFormat`
- `hashLength` 范围为 1-32
- `outputType` 为 `'define'` 或 `'both'` 时同时注入 `defineName` 和 `defineName_INFO`
- `extra` 仅包含在 JSON 文件中，不影响版本号字符串
