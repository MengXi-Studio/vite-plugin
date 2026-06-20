# faviconManager

管理网站图标（favicon）链接注入到 HTML 文件，支持多种图标配置方式和可选的图标文件复制。

## 导入

```typescript
import { faviconManager } from '@meng-xi/vite-plugin'
// 或子模块导入
import { faviconManager } from '@meng-xi/vite-plugin/plugins/favicon-manager'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { faviconManager } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [faviconManager({ base: '/assets' })]
})
```

也可以直接传入字符串作为 base 路径：

```typescript
export default defineConfig({
  plugins: [faviconManager('/assets')]
})
```

## 配置选项

| 选项          | 类型                           | 默认值    | 说明                                    |
| ------------- | ------------------------------ | --------- | --------------------------------------- |
| base          | `string`                       | `'/'`     | 图标基础路径                            |
| url           | `string`                       | -         | 图标完整 URL（覆盖 base + favicon.ico） |
| link          | `string`                       | -         | 自定义 link 标签 HTML（优先级最高）     |
| icons         | `Icon[]`                       | -         | 自定义图标数组                          |
| copyOptions   | `CopyOptions`                  | -         | 图标文件复制配置                        |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### 配置优先级

`link` > `icons` > `url` > `base + favicon.ico`

### copyOptions

图标文件复制配置，仅当此对象存在时才开启文件复制功能。

| 选项      | 类型      | 默认值 | 说明           |
| --------- | --------- | ------ | -------------- |
| sourceDir | `string`  | 必填   | 源文件目录     |
| targetDir | `string`  | 必填   | 目标目录       |
| overwrite | `boolean` | `true` | 覆盖已存在文件 |
| recursive | `boolean` | `true` | 递归复制       |

## 类型导出

### Icon

单个网站图标的属性配置，对应 HTML `<link>` 标签。

| 属性  | 类型     | 必填 | 说明                          |
| ----- | -------- | ---- | ----------------------------- |
| rel   | `string` | 是   | 图标关系类型，如 `'icon'`     |
| href  | `string` | 是   | 图标 URL                      |
| sizes | `string` | 否   | 图标尺寸，如 `'32x32'`        |
| type  | `string` | 否   | MIME 类型，如 `'image/png'`   |

## 示例

### 自定义图标数组

```typescript
faviconManager({
  icons: [
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
  ]
})
```

### 完整 URL

```typescript
faviconManager({ url: 'https://example.com/favicon.ico' })
```

### 自定义 link 标签

```typescript
faviconManager({
  link: '<link rel="icon" href="/custom.ico" type="image/x-icon">'
})
```

### 带文件复制

```typescript
faviconManager({
  base: '/assets',
  copyOptions: {
    sourceDir: 'src/assets/icons',
    targetDir: 'dist/assets/icons'
  }
})
```

## 注意事项

- 图标链接通过 Vite 原生 `transformIndexHtml` 钩子注入到 `<head>` 中
- 使用 `link` 选项时，通过字符串替换方式注入到 `</head>` 标签前
- `copyOptions` 启用时默认使用增量复制，仅复制修改过的文件
- 不完整的 `copyOptions`（缺少 `sourceDir` 或 `targetDir`）会抛出验证错误
