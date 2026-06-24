**中文** | [English](./README-en.md)

<div align="center">
	<a href="https://github.com/MengXi-Studio/vite-plugin">
		<img alt="梦曦工作室 Logo" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/logo.png">
	</a>
	<a href="https://github.com/MengXi-Studio/vite-plugin">
		<img alt="微信公众号 二维码" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/QR_code.jpg">
	</a>
	<br>
	<h1>@meng-xi/vite-plugin</h1>
	<p>一个为 Vite 提供实用插件的工具包，同时也是一个完整的插件开发框架</p>

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

</div>

## 特性

- **开箱即用** - 15 个实用插件，覆盖自动导入、构建进度、产物分析与压缩、文件复制、环境变量校验、路由生成、版本管理、HTML 注入、图标管理、全局 Loading、图片优化、开发代理 等场景
- **插件开发框架** - 导出 BasePlugin、Logger、Validator 等核心组件，快速构建自定义 Vite 插件
- **通用工具库** - 内置 8 大 Common 工具模块，支持按需子路径导入
- **类型安全** - 完整 TypeScript 类型定义与配置验证器
- **按需导入** - 支持子路径导出，减少打包体积

📖 **完整文档：[https://mengxi-studio.github.io/vite-plugin/](https://mengxi-studio.github.io/vite-plugin/)**

## 安装

```bash
# npm
npm install @meng-xi/vite-plugin -D

# yarn
yarn add @meng-xi/vite-plugin -D

# pnpm
pnpm add @meng-xi/vite-plugin -D
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
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

export default defineConfig({
	plugins: [
		assetManifest({ outputFormat: 'vite', groupByEntry: true }),
		autoImport({ imports: { vue: ['ref', 'reactive', 'computed'] }, dts: 'src/auto-imports.d.ts' }),
		buildProgress(),
		bundleAnalyzer({ outputFormat: 'both' }),
		compressAssets({ algorithm: 'gzip' }),
		copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' }),
		envGuard({ rules: { VITE_API_URL: { type: 'string', required: true } } }),
		faviconManager('/assets'),
		generateRouter(),
		generateVersion({ format: 'datetime', outputType: 'both' }),
		htmlInject({ rules: [{ id: 'meta', content: '<meta name="description" content="My App">', position: 'head-end' }] }),
		imageOptimizer({ quality: { jpeg: 80, webp: 75 }, convertToWebp: { png: true } }),
		loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' }),
		proxyManager({ rules: [{ context: '/api', target: 'http://localhost:3000' }], logLevel: 'basic' }),
		versionUpdateChecker()
	]
})
```

## 内置插件

- **[assetManifest](https://mengxi-studio.github.io/vite-plugin/plugins/asset-manifest.html)** - 构建产物资源清单生成，支持多种输出格式、按入口分组和运行时注入
- **[autoImport](https://mengxi-studio.github.io/vite-plugin/plugins/auto-import.html)** - 自动注入 import 语句，支持预设映射、目录扫描和 Vue 模板自动导入
- **[buildProgress](https://mengxi-studio.github.io/vite-plugin/plugins/build-progress.html)** - 终端实时构建进度条，支持 bar / spinner / minimal
- **[bundleAnalyzer](https://mengxi-studio.github.io/vite-plugin/plugins/bundle-analyzer.html)** - 构建产物体积分析，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比
- **[compressAssets](https://mengxi-studio.github.io/vite-plugin/plugins/compress-assets.html)** - 构建产物压缩，支持 gzip / brotli / both，并发压缩和统计报告
- **[copyFile](https://mengxi-studio.github.io/vite-plugin/plugins/copy-file.html)** - 构建完成后复制文件或目录，支持增量复制
- **[envGuard](https://mengxi-studio.github.io/vite-plugin/plugins/env-guard.html)** - 环境变量校验，支持类型检查、范围验证、自定义规则和运行时守卫
- **[faviconManager](https://mengxi-studio.github.io/vite-plugin/plugins/favicon-manager.html)** - 管理网站图标链接注入和文件复制，支持字符串简写配置
- **[generateRouter](https://mengxi-studio.github.io/vite-plugin/plugins/generate-router.html)** - 根据 pages.json 自动生成路由配置与类型声明（uni-app）
- **[generateVersion](https://mengxi-studio.github.io/vite-plugin/plugins/generate-version.html)** - 自动生成版本号，支持文件输出和全局变量注入
- **[htmlInject](https://mengxi-studio.github.io/vite-plugin/plugins/html-inject.html)** - HTML 内容注入，支持多种位置、选择器定位、条件注入、模板变量和安全过滤
- **[imageOptimizer](https://mengxi-studio.github.io/vite-plugin/plugins/image-optimizer.html)** - 图片优化压缩与格式转换，支持 JPEG/PNG/WebP/AVIF/GIF/TIFF/SVG，并发处理和统计报告
- **[loadingManager](https://mengxi-studio.github.io/vite-plugin/plugins/loading-manager.html)** - 全局 Loading 状态管理，支持请求拦截、防抖、过渡动画和白屏 Loading
- **[proxyManager](https://mengxi-studio.github.io/vite-plugin/plugins/proxy-manager.html)** - 开发服务器代理管理，支持环境切换、规则文件、请求日志、延迟模拟和响应修改
- **[versionUpdateChecker](https://mengxi-studio.github.io/vite-plugin/plugins/version-update-checker.html)** - 运行时版本更新检查，支持多种提示样式和自定义回调

## 插件开发框架

本包导出完整的插件开发框架，帮助快速构建符合规范的自定义 Vite 插件。

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin'
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
// 并发控制：带并发限制的批量执行
import { runWithConcurrency } from '@meng-xi/vite-plugin/common/concurrency'

// 格式化：日期参数、模板变量替换（支持自定义分隔符）、文件大小、日期格式化、压缩率计算
import { getDateFormatParams, parseTemplate, parseTemplateWithDelimiter, formatDate, formatFileSize, calcRatio } from '@meng-xi/vite-plugin/common/format'

// 文件系统：源文件检查、文件/目录复制、目录扫描、扫描+映射、批量删除、文件写入、JSON报告、安全写入、变更检测、报告路径解析
import {
	checkSourceExists,
	copySourceToTarget,
	scanDirectory,
	scanAndMapFiles,
	deleteFiles,
	writeFileContent,
	writeJsonReport,
	writeFileSyncSafely,
	shouldUpdateFileContent,
	resolveReportPath
} from '@meng-xi/vite-plugin/common/fs'

// HTML：标签注入、内容消毒、属性转义
import { injectBeforeTag, injectHeadAndBody, sanitizeContent, escapeHtmlAttr } from '@meng-xi/vite-plugin/common/html'

// 路径处理：路径规范化、扩展名过滤、路径排除匹配、预压缩检测
import { normalizePath, isExtensionIncluded, isPathExcluded, isPreCompressed } from '@meng-xi/vite-plugin/common/path'

// 脚本生成：回调函数包装
import { makeCallback } from '@meng-xi/vite-plugin/common/script'

// 终端 UI：ANSI 颜色码
import { ANSI } from '@meng-xi/vite-plugin/common/ui'

// 参数验证：链式验证器、通用校验函数
import { Validator, validateGlobalName, validateNoScriptInTemplate, validateCallbackFields } from '@meng-xi/vite-plugin/common/validation'
```

| 子路径                                                                                      | 描述                                                                                                                   |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [`common/concurrency`](https://mengxi-studio.github.io/vite-plugin/common/concurrency.html) | 带并发限制的批量异步执行                                                                                               |
| [`common/format`](https://mengxi-studio.github.io/vite-plugin/common/format.html)           | 日期参数提取、模板变量替换 `{{key}}`/`{key}`（支持自定义分隔符）、日期格式化、文件大小格式化、压缩率计算               |
| [`common/fs`](https://mengxi-studio.github.io/vite-plugin/common/fs.html)                   | 源文件检查、文件/目录复制、目录扫描、扫描+映射、批量删除、文件写入、JSON报告、同步安全写入、文件变更检测、报告路径解析 |
| [`common/html`](https://mengxi-studio.github.io/vite-plugin/common/html.html)               | HTML 标签注入、双区域注入、内容安全消毒、HTML 属性值转义                                                               |
| [`common/path`](https://mengxi-studio.github.io/vite-plugin/common/path.html)               | 路径规范化、扩展名过滤、路径排除匹配、预压缩格式检测                                                                   |
| [`common/script`](https://mengxi-studio.github.io/vite-plugin/common/script.html)           | 回调函数体包装为安全的函数表达式（含 try-catch）                                                                       |
| [`common/ui`](https://mengxi-studio.github.io/vite-plugin/common/ui.html)                   | 终端 ANSI 颜色码常量                                                                                                   |
| [`common/validation`](https://mengxi-studio.github.io/vite-plugin/common/validation.html)   | 链式配置验证器、全局名称校验、脚本检测、回调字段校验                                                                   |

## 子路径导出

| 子路径                                                | 描述                      |
| ----------------------------------------------------- | ------------------------- |
| `@meng-xi/vite-plugin`                                | 主入口（所有插件+框架）   |
| `@meng-xi/vite-plugin/factory`                        | 插件开发框架              |
| `@meng-xi/vite-plugin/logger`                         | 日志管理器                |
| `@meng-xi/vite-plugin/plugins`                        | 所有插件                  |
| `@meng-xi/vite-plugin/common`                         | 所有工具函数              |
| `@meng-xi/vite-plugin/common/*`                       | 各工具子模块              |
| `@meng-xi/vite-plugin/common/concurrency`             | 并发控制工具              |
| `@meng-xi/vite-plugin/plugins/asset-manifest`         | assetManifest 插件        |
| `@meng-xi/vite-plugin/plugins/auto-import`            | autoImport 插件           |
| `@meng-xi/vite-plugin/plugins/build-progress`         | buildProgress 插件        |
| `@meng-xi/vite-plugin/plugins/bundle-analyzer`        | bundleAnalyzer 插件       |
| `@meng-xi/vite-plugin/plugins/compress-assets`        | compressAssets 插件       |
| `@meng-xi/vite-plugin/plugins/copy-file`              | copyFile 插件             |
| `@meng-xi/vite-plugin/plugins/env-guard`              | envGuard 插件             |
| `@meng-xi/vite-plugin/plugins/favicon-manager`        | faviconManager 插件       |
| `@meng-xi/vite-plugin/plugins/generate-router`        | generateRouter 插件       |
| `@meng-xi/vite-plugin/plugins/generate-version`       | generateVersion 插件      |
| `@meng-xi/vite-plugin/plugins/html-inject`            | htmlInject 插件           |
| `@meng-xi/vite-plugin/plugins/image-optimizer`        | imageOptimizer 插件       |
| `@meng-xi/vite-plugin/plugins/loading-manager`        | loadingManager 插件       |
| `@meng-xi/vite-plugin/plugins/proxy-manager`          | proxyManager 插件         |
| `@meng-xi/vite-plugin/plugins/version-update-checker` | versionUpdateChecker 插件 |

## License

[MIT](LICENSE)
