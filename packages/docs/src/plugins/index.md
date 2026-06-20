# 插件列表

@meng-xi/vite-plugin 提供的 Vite 插件集合，共 15 个插件，覆盖构建优化、开发体验和运行时增强三大场景。

## 导入方式

### 通过 barrel 导入（导入所有插件）

```typescript
import {
	assetManifest,
	autoImport,
	buildProgress,
	bundleAnalyzer,
	compressAssets,
	copyFile,
	envGuard,
	faviconManager,
	generateRouter,
	generateVersion,
	htmlInject,
	imageOptimizer,
	loadingManager,
	proxyManager,
	versionUpdateChecker
} from '@meng-xi/vite-plugin'
```

### 通过子模块独立导入（推荐，支持 tree-shaking）

```typescript
import { assetManifest } from '@meng-xi/vite-plugin/plugins/asset-manifest'
import { autoImport } from '@meng-xi/vite-plugin/plugins/auto-import'
import { buildProgress } from '@meng-xi/vite-plugin/plugins/build-progress'
import { bundleAnalyzer } from '@meng-xi/vite-plugin/plugins/bundle-analyzer'
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress-assets'
import { copyFile } from '@meng-xi/vite-plugin/plugins/copy-file'
import { envGuard } from '@meng-xi/vite-plugin/plugins/env-guard'
import { faviconManager } from '@meng-xi/vite-plugin/plugins/favicon-manager'
import { generateRouter } from '@meng-xi/vite-plugin/plugins/generate-router'
import { generateVersion } from '@meng-xi/vite-plugin/plugins/generate-version'
import { htmlInject } from '@meng-xi/vite-plugin/plugins/html-inject'
import { imageOptimizer } from '@meng-xi/vite-plugin/plugins/image-optimizer'
import { loadingManager } from '@meng-xi/vite-plugin/plugins/loading-manager'
import { proxyManager } from '@meng-xi/vite-plugin/plugins/proxy-manager'
import { versionUpdateChecker } from '@meng-xi/vite-plugin/plugins/version-update-checker'
```

::: tip
子模块独立导入可让打包工具仅打包使用到的插件代码，避免引入不需要的依赖。
:::

## 插件分类

### 构建优化

构建阶段的产物处理与优化插件。

| 插件 | 说明 | 子模块路径 |
| ---- | ---- | ---------- |
| [assetManifest](./asset-manifest) | 构建产物资源清单生成，支持多种输出格式、按入口分组和运行时注入 | `@meng-xi/vite-plugin/plugins/asset-manifest` |
| [bundleAnalyzer](./bundle-analyzer) | 构建产物体积分析，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比 | `@meng-xi/vite-plugin/plugins/bundle-analyzer` |
| [compressAssets](./compress-assets) | 构建产物压缩，支持 gzip / brotli / both | `@meng-xi/vite-plugin/plugins/compress-assets` |
| [copyFile](./copy-file) | 构建完成后复制文件或目录到指定位置 | `@meng-xi/vite-plugin/plugins/copy-file` |
| [imageOptimizer](./image-optimizer) | 图片优化压缩与格式转换，支持 JPEG/PNG/WebP/AVIF/GIF/TIFF/SVG | `@meng-xi/vite-plugin/plugins/image-optimizer` |

### 开发体验

提升开发效率和调试体验的插件。

| 插件 | 说明 | 子模块路径 |
| ---- | ---- | ---------- |
| [autoImport](./auto-import) | 自动注入 import 语句，支持预设映射、目录扫描和 Vue 模板自动导入 | `@meng-xi/vite-plugin/plugins/auto-import` |
| [envGuard](./env-guard) | 环境变量校验，支持类型检查、范围验证、自定义规则和运行时守卫 | `@meng-xi/vite-plugin/plugins/env-guard` |
| [generateRouter](./generate-router) | 根据 uni-app pages.json 自动生成路由配置 | `@meng-xi/vite-plugin/plugins/generate-router` |
| [generateVersion](./generate-version) | 自动生成版本号，支持文件输出和全局变量注入 | `@meng-xi/vite-plugin/plugins/generate-version` |
| [proxyManager](./proxy-manager) | 声明式开发代理管理，支持环境切换、规则文件、请求日志和延迟模拟 | `@meng-xi/vite-plugin/plugins/proxy-manager` |
| [buildProgress](./build-progress) | 在终端实时显示构建进度条 | `@meng-xi/vite-plugin/plugins/build-progress` |

### 运行时增强

增强应用运行时体验的插件。

| 插件 | 说明 | 子模块路径 |
| ---- | ---- | ---------- |
| [faviconManager](./favicon-manager) | 管理网站图标（favicon）链接注入到 HTML 文件 | `@meng-xi/vite-plugin/plugins/favicon-manager` |
| [htmlInject](./html-inject) | HTML 内容注入，支持多种位置和条件注入 | `@meng-xi/vite-plugin/plugins/html-inject` |
| [loadingManager](./loading-manager) | 全局 Loading 状态管理，支持请求拦截 | `@meng-xi/vite-plugin/plugins/loading-manager` |
| [versionUpdateChecker](./version-update-checker) | 运行时版本更新检查，发现新版本时提示用户刷新 | `@meng-xi/vite-plugin/plugins/version-update-checker` |

## 通用配置

所有插件继承自 `BasePlugin`，共享以下基础配置：

| 选项 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------ | ---- |
| enabled | `boolean` | `true` | 启用插件 |
| logLevel | `'verbose' \| 'basic' \| 'none'` | `'basic'` | 日志输出级别 |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | 错误处理策略 |

详见 [BasePluginOptions](/factory/base-plugin-options)。
