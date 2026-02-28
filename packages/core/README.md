**中文** | [English](./README-en.md)

<div align="center">
	<a href="https://github.com/MengXi-Studio/vite-plugin">
		<img alt="梦曦工作室 Logo" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/logo.svg">
	</a>
	<br>
	<h1>@meng-xi/vite-plugin</h1>

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

</div>

## 简介

`@meng-xi/vite-plugin` 是一个为 Vite 提供实用插件的工具包，也是一个**完整的插件开发框架**。该框架提供了常用功能的核心工具方法供扩展支持其他拓展工作开展快速开发。

## 特性

- **增强 Vite 构建流程**：提供实用插件集合，扩展 Vite 功能，简化构建过程中的常见任务，提高开发效率
- **插件开发框架**：导出核心组件如 BasePlugin、Logger、Validator，允许开发者基于相同基础设施构建自定义插件
- **高度可配置**：所有功能支持详细配置选项，可根据项目需求自定义行为，满足多样化场景
- **单例日志系统**：统一的日志管理器，支持插件级别的日志控制，便于调试和问题排查
- **类型安全验证**：强类型配置验证器，确保插件配置正确性，提供完整的 TypeScript 类型定义
- **插件工厂模式**：支持选项标准化器，轻松处理异构输入，简化插件开发工作流
- **无缝集成**：与 Vite 构建流程无缝集成，无需复杂配置即可快速启用
- **优化开发体验**：简化常见构建任务，减少手动操作，让开发者专注于核心业务逻辑

## 文档

开始阅读[文档地址](https://mengxi-studio.github.io/vite-plugin/)。

## 安装

使用包管理器安装 `@meng-xi/vite-plugin`：

```bash
# 使用 npm
npm install @meng-xi/vite-plugin --save-dev

# 使用 yarn
yarn add @meng-xi/vite-plugin --save-dev

# 使用 pnpm
pnpm add @meng-xi/vite-plugin --save-dev
```

## 基本使用

### 使用内置插件

```typescript
import { defineConfig } from 'vite'
import { copyFile, generateRouter, generateVersion, injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// 复制文件插件
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),

		// 生成路由配置插件（适用于 uni-app）
		generateRouter({
			pagesJsonPath: 'src/pages.json',
			outputPath: 'src/router.config.ts'
		}),

		// 生成版本号插件
		generateVersion({
			format: 'datetime',
			outputType: 'both'
		}),

		// 注入图标插件
		injectIco({
			base: '/assets'
		})
	]
})
```

### 开发自定义插件

```typescript
import { BasePlugin, createPluginFactory, Validator } from '@meng-xi/vite-plugin'
import type { Plugin } from 'vite'

interface MyPluginOptions {
	path: string
	enabled?: boolean
	verbose?: boolean
	errorStrategy?: 'throw' | 'log' | 'ignore'
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getDefaultOptions() {
		return {
			path: './default'
		}
	}

	protected validateOptions(): void {
		this.validator.field('path').required().string().validate()
	}

	protected getPluginName(): string {
		return 'my-plugin'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.buildStart = () => {
			this.logger.info(`Plugin started with path: ${this.options.path}`)
		}
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

## 内置插件

### copyFile

在 Vite 构建完成后复制文件或目录到指定位置。

- `sourceDir`：源目录路径（必填）
- `targetDir`：目标目录路径（必填）
- `overwrite`：是否覆盖现有文件，默认 `true`
- `recursive`：是否递归复制子目录，默认 `true`
- `incremental`：是否启用增量复制，默认 `true`

### generateRouter

根据 uni-app 项目的 `pages.json` 自动生成路由配置文件。

- `pagesJsonPath`：pages.json 文件路径，默认 `'src/pages.json'`
- `outputPath`：输出文件路径，默认 `'src/router.config.ts'`
- `outputFormat`：输出格式 `'ts'` 或 `'js'`，默认 `'ts'`
- `nameStrategy`：路由名称策略 `'camelCase'` | `'pascalCase'` | `'path'` | `'custom'`
- `includeSubPackages`：是否包含子包路由，默认 `true`
- `watch`：是否监听变化自动重新生成，默认 `true`

### generateVersion

在 Vite 构建过程中自动生成版本号。

- `format`：版本格式 `'timestamp'` | `'date'` | `'datetime'` | `'semver'` | `'hash'` | `'custom'`
- `outputType`：输出类型 `'file'` | `'define'` | `'both'`
- `outputFile`：输出文件路径，默认 `'version.json'`
- `defineName`：注入的全局变量名，默认 `'__APP_VERSION__'`
- `prefix`：版本号前缀
- `suffix`：版本号后缀

### injectIco

在 Vite 构建过程中将网站图标链接注入到 HTML 文件的 head 中。

- `base`：图标文件的基础路径
- `url`：图标的完整 URL
- `link`：自定义完整的 link 标签 HTML
- `icons`：自定义图标数组
- `copyOptions`：图标文件复制配置

## 更新日志

[CHANGELOG](https://github.com/MengXi-Studio/vite-plugin/releases)

## 如何贡献

欢迎为 `@meng-xi/vite-plugin` 贡献代码。以下是贡献代码的步骤：

1. Fork 项目：在 GitHub 上 Fork 此项目。
2. 克隆代码：将 Fork 后的项目克隆到您的本地机器。

```bash
git clone https://github.com/your-username/vite-plugin.git
cd vite-plugin
```

3. 创建新分支：基于 `master` 分支创建一个新的功能分支。

```bash
git checkout -b feature/your-feature
```

4. 提交变更：确保您的代码通过了测试，并使用清晰的提交消息提交您的变更。

```bash
git add .
git commit -m "feat: add your feature description"
```

5. Push 变更：将您的本地分支推送到 GitHub。

```bash
git push origin feature/your-feature
```

6. 创建 PR：在 GitHub 上创建一个 Pull Request，并等待审核。
