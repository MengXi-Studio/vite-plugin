# copyFile

在 Vite 构建完成后复制文件或目录到指定位置，支持增量复制、递归复制和覆盖控制。

## 导入

```typescript
import { copyFile } from '@meng-xi/vite-plugin'
// 或子模块导入
import { copyFile } from '@meng-xi/vite-plugin/plugins/copy-file'
```

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

| 选项        | 类型      | 默认值 | 说明               |
| ----------- | --------- | ------ | ------------------ |
| sourceDir   | `string`  | 必填   | 源目录路径         |
| targetDir   | `string`  | 必填   | 目标目录路径       |
| overwrite   | `boolean` | `true` | 覆盖已存在的文件   |
| recursive   | `boolean` | `true` | 递归复制子目录     |
| incremental | `boolean` | `true` | 仅复制修改过的文件 |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

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

### 不覆盖已有文件

```typescript
copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets',
  overwrite: false
})
```

## 注意事项

- 使用 `enforce: 'post'` 确保在其他构建任务完成后执行
- 源目录必须存在，目标目录会自动创建
- `incremental: true` 时仅复制修改时间更新的文件
