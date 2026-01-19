# copyFile 插件

copyFile 插件用于在 Vite 构建过程中复制文件或目录到指定位置，支持多种配置选项。

## 功能特性

- 复制文件或目录到指定位置
- 支持递归复制
- 支持覆盖同名文件
- 支持启用/禁用插件
- 支持详细日志输出

## 基本用法

### 简单配置

```typescript
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    vitePlugin.copyFile({
      sourceDir: 'src/assets',
      targetDir: 'dist/assets'
    })
  ]
})
```

### 完整配置

```typescript
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    vitePlugin.copyFile({
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

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| sourceDir | string | 必填 | 源文件目录的路径 |
| targetDir | string | 必填 | 目标文件目录的路径 |
| overwrite | boolean | true | 是否覆盖同名文件 |
| recursive | boolean | true | 是否支持递归复制 |
| enabled | boolean | true | 是否启用插件 |
| verbose | boolean | true | 是否显示详细日志 |

## 示例

### 复制单个文件

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/favicon.ico',
  targetDir: 'dist/favicon.ico'
})
```

### 复制目录

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets'
})
```

### 禁用覆盖

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets',
  overwrite: false
})
```

### 禁用递归复制

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets',
  recursive: false
})
```

### 禁用插件

```typescript
vitePlugin.copyFile({
  sourceDir: 'src/assets',
  targetDir: 'dist/assets',
  enabled: false
})
```

## 注意事项

- 确保源文件目录存在，否则会抛出错误
- 目标目录会自动创建，如果不存在
- 当 `overwrite` 为 `false` 时，如果目标文件已存在，会跳过复制
- 当 `recursive` 为 `false` 时，只会复制源目录下的文件，不会复制子目录
- 当 `enabled` 为 `false` 时，插件不会执行任何操作
