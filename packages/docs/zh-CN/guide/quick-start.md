# 快速开始

本指南将帮助您快速开始使用 Vite 自定义插件。

## 安装

### 使用 pnpm

```bash
pnpm add -D @meng-xi/vite-plugin
```

### 使用 npm

```bash
npm install -D @meng-xi/vite-plugin
```

### 使用 yarn

```bash
yarn add -D @meng-xi/vite-plugin
```

## 基本使用

在您的 Vite 配置文件中导入并使用所需的插件：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // 使用 copyFile 插件
    vitePlugin.copyFile({
      sourceDir: 'src/assets',
      targetDir: 'dist/assets'
    }),
    
    // 使用 injectIco 插件
    vitePlugin.injectIco({
      base: '/assets'
    })
  ]
})
```

## 配置选项

每个插件都有自己的配置选项，您可以根据需要进行配置。请查看相应的插件文档了解详细的配置选项。

## 插件列表

- [copyFile 插件](../plugins/copyFile)：复制文件或目录到指定位置
- [injectIco 插件](../plugins/injectIco)：注入网站图标链接到 HTML 文件的头部
