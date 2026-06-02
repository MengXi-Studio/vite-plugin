**中文** | [English](./README-en.md)

<div align="center">
	<a href="https://github.com/MengXi-Studio/vite-plugin">
		<img alt="梦曦工作室 Logo" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/logo.png">
	</a>
	<br>
	<h1>@meng-xi/vite-plugin</h1>
	<p>一个为 Vite 提供实用插件的工具包，同时也是一个完整的插件开发框架</p>

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

</div>

## 特性

- **开箱即用** - 11 个实用插件，覆盖构建进度、产物分析与压缩、文件复制、环境变量校验、路由生成、版本管理、HTML 注入、图标管理、全局 Loading 等场景
- **插件开发框架** - 导出 BasePlugin、Logger、Validator 等核心组件，快速构建自定义 Vite 插件
- **通用工具库** - 内置 Common 工具模块，支持按需子路径导入
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
import { buildProgress, bundleAnalyzer, compressAssets, copyFile, envGuard, generateRouter, generateVersion, versionUpdateChecker, htmlInject, faviconManager, loadingManager } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		buildProgress(),
		bundleAnalyzer({ outputFormat: 'both' }),
		compressAssets({ algorithm: 'gzip' }),
		copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' }),
		envGuard({ rules: { VITE_API_URL: { type: 'string', required: true } } }),
		generateRouter(),
		generateVersion({ format: 'datetime', outputType: 'both' }),
		versionUpdateChecker(),
		htmlInject({ rules: [{ id: 'meta', content: '<meta name="description" content="My App">', position: 'head-end' }] }),
		faviconManager('/assets'),
		loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
	]
})
```

## 内置插件

| 插件                                                                                                    | 说明                                                                  |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [buildProgress](https://mengxi-studio.github.io/vite-plugin/plugins/build-progress.html)                | 终端实时构建进度条，支持 bar / spinner / minimal                      |
| [bundleAnalyzer](https://mengxi-studio.github.io/vite-plugin/plugins/bundle-analyzer.html)              | 构建产物体积分析，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比  |
| [compressAssets](https://mengxi-studio.github.io/vite-plugin/plugins/compress-assets.html)              | 构建产物压缩，支持 gzip / brotli / both，并发压缩和统计报告           |
| [copyFile](https://mengxi-studio.github.io/vite-plugin/plugins/copy-file.html)                          | 构建完成后复制文件或目录，支持增量复制                                |
| [envGuard](https://mengxi-studio.github.io/vite-plugin/plugins/env-guard.html)                          | 环境变量校验，支持类型检查、范围验证、自定义规则和运行时守卫          |
| [faviconManager](https://mengxi-studio.github.io/vite-plugin/plugins/favicon-manager.html)              | 管理网站图标链接注入和文件复制，支持字符串简写配置                    |
| [generateRouter](https://mengxi-studio.github.io/vite-plugin/plugins/generate-router.html)              | 根据 pages.json 自动生成路由配置（uni-app）                           |
| [generateVersion](https://mengxi-studio.github.io/vite-plugin/plugins/generate-version.html)            | 自动生成版本号，支持文件输出和全局变量注入                            |
| [htmlInject](https://mengxi-studio.github.io/vite-plugin/plugins/html-inject.html)                      | HTML 内容注入，支持多种位置、选择器定位、条件注入、模板变量和安全过滤 |
| [loadingManager](https://mengxi-studio.github.io/vite-plugin/plugins/loading-manager.html)              | 全局 Loading 状态管理，支持请求拦截、防抖、过渡动画和白屏 Loading     |
| [versionUpdateChecker](https://mengxi-studio.github.io/vite-plugin/plugins/version-update-checker.html) | 运行时版本更新检查，支持多种提示样式和自定义回调                      |

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
import { formatFileSize } from '@meng-xi/vite-plugin/common/format'
import { scanDirectory } from '@meng-xi/vite-plugin/common/fs'
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'
```

| 子路径                                                                                    | 描述          |
| ----------------------------------------------------------------------------------------- | ------------- |
| [`common/compress`](https://mengxi-studio.github.io/vite-plugin/common/compress.html)     | 压缩算法工具  |
| [`common/format`](https://mengxi-studio.github.io/vite-plugin/common/format.html)         | 格式化工具    |
| [`common/fs`](https://mengxi-studio.github.io/vite-plugin/common/fs.html)                 | 文件系统工具  |
| [`common/html`](https://mengxi-studio.github.io/vite-plugin/common/html.html)             | HTML 注入工具 |
| [`common/object`](https://mengxi-studio.github.io/vite-plugin/common/object.html)         | 对象操作工具  |
| [`common/path`](https://mengxi-studio.github.io/vite-plugin/common/path.html)             | 路径处理工具  |
| [`common/script`](https://mengxi-studio.github.io/vite-plugin/common/script.html)         | 脚本生成工具  |
| [`common/ui`](https://mengxi-studio.github.io/vite-plugin/common/ui.html)                 | 终端 UI 工具  |
| [`common/validation`](https://mengxi-studio.github.io/vite-plugin/common/validation.html) | 参数验证工具  |

## 子路径导出

| 子路径                                                | 描述                      |
| ----------------------------------------------------- | ------------------------- |
| `@meng-xi/vite-plugin`                                | 主入口（所有插件+框架）   |
| `@meng-xi/vite-plugin/factory`                        | 插件开发框架              |
| `@meng-xi/vite-plugin/logger`                         | 日志管理器                |
| `@meng-xi/vite-plugin/plugins`                        | 所有插件                  |
| `@meng-xi/vite-plugin/common`                         | 所有工具函数              |
| `@meng-xi/vite-plugin/common/*`                       | 各工具子模块              |
| `@meng-xi/vite-plugin/plugins/build-progress`         | buildProgress 插件        |
| `@meng-xi/vite-plugin/plugins/bundle-analyzer`        | bundleAnalyzer 插件       |
| `@meng-xi/vite-plugin/plugins/compress-assets`        | compressAssets 插件       |
| `@meng-xi/vite-plugin/plugins/copy-file`              | copyFile 插件             |
| `@meng-xi/vite-plugin/plugins/env-guard`              | envGuard 插件             |
| `@meng-xi/vite-plugin/plugins/favicon-manager`        | faviconManager 插件       |
| `@meng-xi/vite-plugin/plugins/generate-router`        | generateRouter 插件       |
| `@meng-xi/vite-plugin/plugins/generate-version`       | generateVersion 插件      |
| `@meng-xi/vite-plugin/plugins/html-inject`            | htmlInject 插件           |
| `@meng-xi/vite-plugin/plugins/loading-manager`        | loadingManager 插件       |
| `@meng-xi/vite-plugin/plugins/version-update-checker` | versionUpdateChecker 插件 |

## License

[MIT](LICENSE)
