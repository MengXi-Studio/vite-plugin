# copyFile 插件

`copyFile` 插件用于在 Vite 构建完成后复制文件或目录到指定位置，支持多种配置选项。

## 功能特性

- 在 Vite 构建流程的最后阶段执行（使用 `enforce: 'post'`，确保其他构建任务完成后再进行文件复制）
- 复制文件或目录到指定位置
- 支持递归复制
- 支持覆盖同名文件
- 支持增量复制（仅复制修改过的文件，提高构建效率）
- 支持启用/禁用插件
- 支持详细日志输出
- 提供灵活的错误处理机制，可配置错误处理策略
- 支持自定义错误信息和验证规则

## 基本用法

### 简单配置

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		})
	]
})
```

### 完整配置

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets',
			overwrite: true,
			recursive: true,
			incremental: true,
			enabled: true,
			verbose: true,
			errorStrategy: 'throw'
		})
	]
})
```

## 配置选项

| 选项          | 类型                         | 默认值  | 描述                                                              |
| ------------- | ---------------------------- | ------- | ----------------------------------------------------------------- |
| sourceDir     | string                       | 必填    | 源文件目录的路径，必须是非空字符串                                |
| targetDir     | string                       | 必填    | 目标文件目录的路径，必须是非空字符串                              |
| overwrite     | boolean                      | true    | 是否覆盖同名文件                                                  |
| recursive     | boolean                      | true    | 是否支持递归复制子目录                                            |
| incremental   | boolean                      | true    | 是否启用增量复制，仅复制修改过的文件，提高构建效率                |
| enabled       | boolean                      | true    | 是否启用插件                                                      |
| verbose       | boolean                      | true    | 是否显示详细日志                                                  |
| errorStrategy | 'throw' \| 'log' \| 'ignore' | 'throw' | 错误处理策略：'throw' 抛出错误，'log' 记录日志，'ignore' 忽略错误 |

## 示例

### 基本使用

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		})
	]
})
```

### 自定义配置

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/static',
			targetDir: 'dist/static',
			overwrite: false,
			verbose: true,
			recursive: false,
			incremental: false, // 禁用增量复制，每次都复制所有文件
			errorStrategy: 'log' // 仅记录错误，不中断构建
		})
	]
})
```

### 根据环境启用

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets',
			enabled: process.env.NODE_ENV === 'production'
		})
	]
})
```

### 禁用插件

```typescript
import { defineConfig } from 'vite'
import { copyFile } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets',
			enabled: false
		})
	]
})
```

## 注意事项

- 插件在 Vite 构建流程的最后阶段执行（`enforce: 'post'`），确保其他构建任务完成后再进行文件复制
- 确保源文件目录存在，否则会抛出错误
- 目标目录会自动创建，如果不存在
- 当 `overwrite` 为 `false` 时，如果目标文件已存在，会跳过复制
- 当 `recursive` 为 `false` 时，只会复制源目录下的文件，不会复制子目录
- 当 `incremental` 为 `true` 时，仅复制修改过的文件，提高构建效率
- 当 `enabled` 为 `false` 时，插件不会执行任何操作
- `errorStrategy` 选项决定了错误处理方式：
  - `'throw'`：抛出错误，中断构建流程
  - `'log'`：记录错误日志，但不中断构建
  - `'ignore'`：忽略错误，继续执行
- 当 `verbose` 为 `true` 时，会输出详细的执行日志，便于调试和问题排查
- `sourceDir` 和 `targetDir` 必须是非空字符串，否则会抛出验证错误
- 插件会验证配置的有效性，并在配置无效时抛出详细的错误信息
