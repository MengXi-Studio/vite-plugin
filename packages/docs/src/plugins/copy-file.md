# copyFile 插件

`copyFile` 插件用于在 Vite 构建完成后复制文件或目录到指定位置，支持多种配置选项。

## 功能特性

- 在 Vite 构建流程的最后阶段执行（确保其他构建任务完成后再进行文件复制）
- 复制文件或目录到指定位置
- 支持递归复制
- 支持覆盖同名文件
- 支持启用/禁用插件
- 支持详细日志输出
- 提供错误处理机制，确保构建流程能捕获到错误

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
			enabled: true,
			verbose: true
		})
	]
})
```

## 配置选项

| 选项      | 类型    | 默认值 | 描述               |
| --------- | ------- | ------ | ------------------ |
| sourceDir | string  | 必填   | 源文件目录的路径   |
| targetDir | string  | 必填   | 目标文件目录的路径 |
| overwrite | boolean | true   | 是否覆盖同名文件   |
| recursive | boolean | true   | 是否支持递归复制   |
| enabled   | boolean | true   | 是否启用插件       |
| verbose   | boolean | true   | 是否显示详细日志   |

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
			recursive: false
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

- 插件在 Vite 构建流程的最后阶段执行（enforce: 'post'），确保其他构建任务完成后再进行文件复制
- 确保源文件目录存在，否则会抛出错误
- 目标目录会自动创建，如果不存在
- 当 `overwrite` 为 `false` 时，如果目标文件已存在，会跳过复制
- 当 `recursive` 为 `false` 时，只会复制源目录下的文件，不会复制子目录
- 当 `enabled` 为 `false` 时，插件不会执行任何操作
- 插件会抛出错误，确保构建流程能捕获到错误
- 当 `verbose` 为 `true` 时，会输出详细的执行日志，便于调试和问题排查
