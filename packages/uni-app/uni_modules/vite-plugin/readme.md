# @meng-xi/vite-plugin

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

Vite 实用插件集与插件开发框架（uni-app 版本）。

---

## 特性

- **开箱即用** - 15 个实用插件，覆盖构建进度、产物分析与压缩、图片优化、资源清单、文件复制、环境变量校验、路由生成、版本管理、HTML 注入、图标管理、全局 Loading、自动导入、开发代理等场景
- **插件开发框架** - 导出 BasePlugin、Logger、Validator 等核心组件，快速构建自定义 Vite 插件
- **通用工具库** - 内置 Common 工具模块，支持按需子路径导入
- **类型安全** - 完整 TypeScript 类型定义与配置验证器
- **uni-app 适配** - 通过 uni_modules 方式集成，无需 npm 安装

📖 **完整文档：[https://mengxi-studio.github.io/vite-plugin/](https://mengxi-studio.github.io/vite-plugin/)**

## 安装

### uni_modules（推荐）

将 `vite-plugin` 目录复制到项目的 `uni_modules` 目录下：

```
src/
  └── uni_modules/
        └── vite-plugin/
              └── js_sdk/
                    └── index.mjs
```

### npm

```bash
pnpm add @meng-xi/vite-plugin -D
```

> npm 方式需将导入路径改为 `@meng-xi/vite-plugin`。

## 快速开始

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import {
	assetManifest,
	buildProgress,
	bundleAnalyzer,
	compressAssets,
	copyFile,
	envGuard,
	generateRouter,
	generateVersion,
	htmlInject,
	faviconManager,
	loadingManager,
	versionUpdateChecker,
	autoImport,
	imageOptimizer,
	proxyManager
} from './uni_modules/vite-plugin/js_sdk/index.mjs'

export default defineConfig({
	plugins: [
		uni(),
		assetManifest({ groupByEntry: true }),
		autoImport({
			imports: { vue: ['*'] },
			dts: true,
			vueTemplate: true
		}),
		buildProgress(),
		bundleAnalyzer({ outputFormat: 'json' }),
		compressAssets({ algorithm: 'both' }),
		copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' }),
		envGuard({ required: { VITE_API_URL: { type: 'url', required: true } } }),
		generateRouter({ dts: true }),
		generateVersion({ format: 'datetime', outputType: 'both' }),
		htmlInject({ rules: [{ id: 'meta', content: '<meta name="description" content="My App">', position: 'head-end' }] }),
		faviconManager('/assets'),
		loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' }),
		versionUpdateChecker(),
		imageOptimizer({ quality: { jpeg: 80, webp: 75 }, convertToWebp: { png: true, jpeg: true } }),
		proxyManager({ rules: [{ context: '/api', target: 'https://api.example.com', changeOrigin: true }] })
	]
})
```

## 内置插件

| 插件                                                                                                    | 说明                                                                                         |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [assetManifest](https://mengxi-studio.github.io/vite-plugin/plugins/asset-manifest.html)                | 构建后自动扫描产物目录生成资源映射清单，支持 Vite/Webpack/自定义格式、按入口分组和运行时注入 |
| [autoImport](https://mengxi-studio.github.io/vite-plugin/plugins/auto-import.html)                      | 自动导入，支持预设映射、通配符（`'*'`）、目录扫描、Vue 模板自动导入和类型声明生成            |
| [buildProgress](https://mengxi-studio.github.io/vite-plugin/plugins/build-progress.html)                | 终端实时构建进度条，支持 bar / spinner / minimal                                             |
| [bundleAnalyzer](https://mengxi-studio.github.io/vite-plugin/plugins/bundle-analyzer.html)              | 构建产物体积分析，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比                         |
| [compressAssets](https://mengxi-studio.github.io/vite-plugin/plugins/compress-assets.html)              | 构建产物压缩，支持 gzip / brotli / both，并发压缩和统计报告                                  |
| [copyFile](https://mengxi-studio.github.io/vite-plugin/plugins/copy-file.html)                          | 构建完成后复制文件或目录，支持增量复制                                                       |
| [envGuard](https://mengxi-studio.github.io/vite-plugin/plugins/env-guard.html)                          | 环境变量校验，支持类型检查、范围验证、自定义规则和运行时守卫                                 |
| [faviconManager](https://mengxi-studio.github.io/vite-plugin/plugins/favicon-manager.html)              | 管理网站图标链接注入和文件复制，支持字符串简写配置                                           |
| [generateRouter](https://mengxi-studio.github.io/vite-plugin/plugins/generate-router.html)              | 根据 pages.json 自动生成路由配置与类型声明（uni-app）                                        |
| [generateVersion](https://mengxi-studio.github.io/vite-plugin/plugins/generate-version.html)            | 自动生成版本号，支持文件输出和全局变量注入                                                   |
| [htmlInject](https://mengxi-studio.github.io/vite-plugin/plugins/html-inject.html)                      | HTML 内容注入，支持多种位置、选择器定位、条件注入、模板变量和安全过滤                        |
| [imageOptimizer](https://mengxi-studio.github.io/vite-plugin/plugins/image-optimizer.html)              | 图片优化压缩与格式转换，支持 WebP/AVIF 转换、SVG 优化、并发处理和压缩报告                    |
| [loadingManager](https://mengxi-studio.github.io/vite-plugin/plugins/loading-manager.html)              | 全局 Loading 状态管理，支持请求拦截、防抖、过渡动画和白屏 Loading                            |
| [proxyManager](https://mengxi-studio.github.io/vite-plugin/plugins/proxy-manager.html)                  | 开发服务器代理管理，支持环境切换、规则文件、请求日志、延迟模拟和响应修改                     |
| [versionUpdateChecker](https://mengxi-studio.github.io/vite-plugin/plugins/version-update-checker.html) | 运行时版本更新检查，支持多种提示样式和自定义回调                                             |

## 插件开发框架

本包导出完整的插件开发框架，帮助快速构建符合规范的自定义 Vite 插件。

```typescript
import { BasePlugin, createPluginFactory } from './uni_modules/vite-plugin/js_sdk/index.mjs'
import type { Plugin } from 'vite'

interface MyPluginOptions {
	prefix?: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getPluginName() {
		return 'my-plugin'
	}

	protected getDefaultOptions() {
		return { prefix: '[app]' }
	}

	protected validateOptions() {
		this.validator.field('prefix').string().notEmpty().validate()
	}

	protected addPluginHooks(plugin: Plugin) {
		plugin.writeBundle = {
			order: 'post',
			handler: async () => {
				await this.safeExecute(async () => {
					this.logger.info('插件执行中...')
				}, '执行自定义逻辑')
			}
		}
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

**核心 API：**

| API                                                                                                     | 说明                                             |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [`BasePlugin`](https://mengxi-studio.github.io/vite-plugin/factory/base-plugin.html)                    | 插件基类，提供配置管理、日志、错误处理和生命周期 |
| [`createPluginFactory`](https://mengxi-studio.github.io/vite-plugin/factory/create-plugin-factory.html) | 将 BasePlugin 子类转换为 Vite 插件函数           |
| [`Logger`](https://mengxi-studio.github.io/vite-plugin/logger/)                                         | 全局单例日志管理器，为每个插件提供独立日志代理   |
| [`Validator`](https://mengxi-studio.github.io/vite-plugin/factory/)                                     | 链式配置验证器，校验插件配置参数                 |

## Common 工具模块

内置通用工具函数库，按功能模块组织，支持子路径按需导入。

```typescript
import { formatFileSize, parseTemplate, formatDate } from './uni_modules/vite-plugin/js_sdk/common/format/index.mjs'
import { scanDirectory, writeFileSyncSafely, shouldUpdateFileContent } from './uni_modules/vite-plugin/js_sdk/common/fs/index.mjs'
import { injectBeforeTag, escapeHtmlAttr } from './uni_modules/vite-plugin/js_sdk/common/html/index.mjs'
```

| 子路径                                                                                      | 描述                                                                      |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`common/concurrency`](https://mengxi-studio.github.io/vite-plugin/common/concurrency.html) | 并发控制，限制异步任务并行执行数量                                        |
| [`common/format`](https://mengxi-studio.github.io/vite-plugin/common/format.html)           | 日期参数提取、模板变量替换 `{{key}}`、日期格式化 `{YYYY}`、文件大小格式化 |
| [`common/fs`](https://mengxi-studio.github.io/vite-plugin/common/fs.html)                   | 文件/目录复制、目录扫描、同步安全写入、文件变更检测                       |
| [`common/html`](https://mengxi-studio.github.io/vite-plugin/common/html.html)               | HTML 标签注入、双区域注入、内容安全消毒、HTML 属性值转义                  |
| [`common/path`](https://mengxi-studio.github.io/vite-plugin/common/path.html)               | 路径工具：扩展名判断、路径排除、预压缩检测、路径规范化                    |
| [`common/script`](https://mengxi-studio.github.io/vite-plugin/common/script.html)           | 回调函数体包装为安全的函数表达式（含 try-catch）                          |
| [`common/ui`](https://mengxi-studio.github.io/vite-plugin/common/ui.html)                   | 终端 ANSI 颜色码常量                                                      |
| [`common/validation`](https://mengxi-studio.github.io/vite-plugin/common/validation.html)   | 链式配置验证器、全局名称校验、脚本检测、回调字段校验                      |

## 子路径导出

| 子路径                                                                      | 描述                      |
| --------------------------------------------------------------------------- | ------------------------- |
| `./uni_modules/vite-plugin/js_sdk/index.mjs`                                | 主入口（所有插件+框架）   |
| `./uni_modules/vite-plugin/js_sdk/factory/index.mjs`                        | 插件开发框架              |
| `./uni_modules/vite-plugin/js_sdk/logger/index.mjs`                         | 日志管理器                |
| `./uni_modules/vite-plugin/js_sdk/plugins/index.mjs`                        | 所有插件                  |
| `./uni_modules/vite-plugin/js_sdk/common/index.mjs`                         | 所有工具函数              |
| `./uni_modules/vite-plugin/js_sdk/common/*/index.mjs`                       | 各工具子模块              |
| `./uni_modules/vite-plugin/js_sdk/plugins/asset-manifest/index.mjs`         | assetManifest 插件        |
| `./uni_modules/vite-plugin/js_sdk/plugins/auto-import/index.mjs`            | autoImport 插件           |
| `./uni_modules/vite-plugin/js_sdk/plugins/build-progress/index.mjs`         | buildProgress 插件        |
| `./uni_modules/vite-plugin/js_sdk/plugins/bundle-analyzer/index.mjs`        | bundleAnalyzer 插件       |
| `./uni_modules/vite-plugin/js_sdk/plugins/compress-assets/index.mjs`        | compressAssets 插件       |
| `./uni_modules/vite-plugin/js_sdk/plugins/copy-file/index.mjs`              | copyFile 插件             |
| `./uni_modules/vite-plugin/js_sdk/plugins/env-guard/index.mjs`              | envGuard 插件             |
| `./uni_modules/vite-plugin/js_sdk/plugins/favicon-manager/index.mjs`        | faviconManager 插件       |
| `./uni_modules/vite-plugin/js_sdk/plugins/generate-router/index.mjs`        | generateRouter 插件       |
| `./uni_modules/vite-plugin/js_sdk/plugins/generate-version/index.mjs`       | generateVersion 插件      |
| `./uni_modules/vite-plugin/js_sdk/plugins/html-inject/index.mjs`            | htmlInject 插件           |
| `./uni_modules/vite-plugin/js_sdk/plugins/image-optimizer/index.mjs`        | imageOptimizer 插件       |
| `./uni_modules/vite-plugin/js_sdk/plugins/loading-manager/index.mjs`        | loadingManager 插件       |
| `./uni_modules/vite-plugin/js_sdk/plugins/proxy-manager/index.mjs`          | proxyManager 插件         |
| `./uni_modules/vite-plugin/js_sdk/plugins/version-update-checker/index.mjs` | versionUpdateChecker 插件 |

## License

[MIT](LICENSE)
