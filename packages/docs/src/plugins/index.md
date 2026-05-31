# 插件列表

@meng-xi/vite-plugin 提供的 Vite 插件集合。

## 导入方式

### 通过 barrel 导入（导入所有插件）

```typescript
import { buildProgress, compressAssets, copyFile, faviconManager, generateRouter, generateVersion, htmlInject, loadingManager, versionUpdateChecker } from '@meng-xi/vite-plugin'
```

### 通过子模块独立导入（推荐，支持 tree-shaking）

```typescript
import { buildProgress } from '@meng-xi/vite-plugin/plugins/build-progress'
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress-assets'
import { copyFile } from '@meng-xi/vite-plugin/plugins/copy-file'
import { faviconManager } from '@meng-xi/vite-plugin/plugins/favicon-manager'
import { generateRouter } from '@meng-xi/vite-plugin/plugins/generate-router'
import { generateVersion } from '@meng-xi/vite-plugin/plugins/generate-version'
import { htmlInject } from '@meng-xi/vite-plugin/plugins/html-inject'
import { loadingManager } from '@meng-xi/vite-plugin/plugins/loading-manager'
import { versionUpdateChecker } from '@meng-xi/vite-plugin/plugins/version-update-checker'
```

::: tip子模块独立导入可让打包工具仅打包使用到的插件代码，避免引入不需要的依赖。:::

## 插件

| 插件                                             | 说明                                         | 子模块路径                                            |
| ------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------- |
| [buildProgress](./build-progress)                | 在终端实时显示构建进度条                     | `@meng-xi/vite-plugin/plugins/build-progress`         |
| [compressAssets](./compress-assets)              | 构建产物压缩，支持 gzip / brotli / both      | `@meng-xi/vite-plugin/plugins/compress-assets`        |
| [copyFile](./copy-file)                          | 构建完成后复制文件或目录到指定位置           | `@meng-xi/vite-plugin/plugins/copy-file`              |
| [faviconManager](./favicon-manager)              | 管理网站图标（favicon）链接注入到 HTML 文件  | `@meng-xi/vite-plugin/plugins/favicon-manager`        |
| [generateRouter](./generate-router)              | 根据 uni-app pages.json 自动生成路由配置     | `@meng-xi/vite-plugin/plugins/generate-router`        |
| [generateVersion](./generate-version)            | 自动生成版本号，支持文件输出和全局变量注入   | `@meng-xi/vite-plugin/plugins/generate-version`       |
| [htmlInject](./html-inject)                      | HTML 内容注入，支持多种位置和条件注入        | `@meng-xi/vite-plugin/plugins/html-inject`            |
| [loadingManager](./loading-manager)              | 全局 Loading 状态管理，支持请求拦截          | `@meng-xi/vite-plugin/plugins/loading-manager`        |
| [versionUpdateChecker](./version-update-checker) | 运行时版本更新检查，发现新版本时提示用户刷新 | `@meng-xi/vite-plugin/plugins/version-update-checker` |

## 通用配置

所有插件继承自 `BasePlugin`，共享以下基础配置：

| 选项          | 类型                           | 默认值    | 说明         |
| ------------- | ------------------------------ | --------- | ------------ |
| enabled       | `boolean`                      | `true`    | 启用插件     |
| verbose       | `boolean`                      | `true`    | 显示详细日志 |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | 错误处理策略 |
