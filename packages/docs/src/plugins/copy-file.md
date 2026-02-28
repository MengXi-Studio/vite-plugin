# copyFile

在 Vite 构建完成后复制文件或目录到指定位置。

## 快速开始

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

## 配置选项

| 选项          | 类型                           | 默认值    | 说明               |
| ------------- | ------------------------------ | --------- | ------------------ |
| sourceDir     | `string`                       | 必填      | 源目录路径         |
| targetDir     | `string`                       | 必填      | 目标目录路径       |
| overwrite     | `boolean`                      | `true`    | 覆盖已存在的文件   |
| recursive     | `boolean`                      | `true`    | 递归复制子目录     |
| incremental   | `boolean`                      | `true`    | 仅复制修改过的文件 |
| enabled       | `boolean`                      | `true`    | 启用插件           |
| verbose       | `boolean`                      | `true`    | 显示详细日志       |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | 错误处理策略       |

## 示例

### 禁用递归和增量复制

```typescript
copyFile({
	sourceDir: 'src/static',
	targetDir: 'dist/static',
	recursive: false,
	incremental: false
})
```

### 仅生产环境启用

```typescript
copyFile({
	sourceDir: 'src/assets',
	targetDir: 'dist/assets',
	enabled: process.env.NODE_ENV === 'production'
})
```

### 记录错误但不中断构建

```typescript
copyFile({
	sourceDir: 'src/assets',
	targetDir: 'dist/assets',
	errorStrategy: 'log'
})
```

## 注意事项

- 使用 `enforce: 'post'` 确保在其他构建任务完成后执行
- 源目录必须存在，目标目录会自动创建
- `incremental: true` 时仅复制修改时间更新的文件
