**中文** | [English](./README-en.md)

<div align="center">
	<a href="https://github.com/MengXi-Studio/vite-plugin">
		<img alt="梦曦工作室 Logo" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/logo.svg">
	</a>
	<br>
	<h1>@meng-xi/vite-plugin</h1>
	<p>一个为 Vite 提供实用插件的工具包，同时也是一个完整的插件开发框架</p>

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

</div>

## 特性

- **开箱即用** - 提供文件复制、路由生成、版本管理、图标注入等实用插件
- **插件开发框架** - 导出 BasePlugin、Logger、Validator 等核心组件，快速构建自定义插件
- **类型安全** - 完整的 TypeScript 类型定义，配置验证器确保参数正确性
- **灵活配置** - 所有插件支持详细配置，满足多样化场景需求

## 文档

查看完整文档：[https://mengxi-studio.github.io/vite-plugin/](https://mengxi-studio.github.io/vite-plugin/)

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

### 使用内置插件

```typescript
import { defineConfig } from 'vite'
import { copyFile, generateRouter, generateVersion, injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// 复制文件
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),

		// 生成路由配置（uni-app）
		generateRouter({
			pagesJsonPath: 'src/pages.json',
			outputPath: 'src/router.config.ts'
		}),

		// 生成版本号
		generateVersion({
			format: 'datetime',
			outputType: 'both'
		}),

		// 注入网站图标
		injectIco({
			base: '/assets'
		})
	]
})
```

### 开发自定义插件

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin'
import type { Plugin } from 'vite'

interface MyPluginOptions {
	path: string
	enabled?: boolean
	verbose?: boolean
	errorStrategy?: 'throw' | 'log' | 'ignore'
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getDefaultOptions() {
		return { path: './default' }
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

| 选项        | 类型    | 默认值 | 描述                 |
| ----------- | ------- | ------ | -------------------- |
| sourceDir   | string  | -      | 源目录路径（必填）   |
| targetDir   | string  | -      | 目标目录路径（必填） |
| overwrite   | boolean | true   | 是否覆盖现有文件     |
| recursive   | boolean | true   | 是否递归复制子目录   |
| incremental | boolean | true   | 是否启用增量复制     |

### generateRouter

根据 uni-app 项目的 `pages.json` 自动生成路由配置文件。

| 选项                 | 类型         | 默认值                 | 描述                          |
| -------------------- | ------------ | ---------------------- | ----------------------------- |
| pagesJsonPath        | string       | 'src/pages.json'       | pages.json 文件路径           |
| outputPath           | string       | 'src/router.config.ts' | 输出文件路径                  |
| outputFormat         | 'ts' \| 'js' | 'ts'                   | 输出文件格式                  |
| nameStrategy         | string       | 'camelCase'            | 路由名称策略                  |
| includeSubPackages   | boolean      | true                   | 是否包含子包路由              |
| watch                | boolean      | true                   | 是否监听变化自动重新生成      |
| metaMapping          | object       | -                      | 页面 style 字段到 meta 的映射 |
| preserveRouteChanges | boolean      | true                   | 是否保留用户对 routes 的修改  |

### generateVersion

在 Vite 构建过程中自动生成版本号。

| 选项       | 类型   | 默认值                | 描述             |
| ---------- | ------ | --------------------- | ---------------- |
| format     | string | 'timestamp'           | 版本格式         |
| outputType | string | 'file'                | 输出类型         |
| outputFile | string | 'version.json'        | 输出文件路径     |
| defineName | string | '\_\_APP_VERSION\_\_' | 注入的全局变量名 |
| prefix     | string | -                     | 版本号前缀       |
| suffix     | string | -                     | 版本号后缀       |

### injectIco

在 Vite 构建过程中将网站图标链接注入到 HTML 文件的 head 中。

| 选项        | 类型   | 默认值 | 描述                        |
| ----------- | ------ | ------ | --------------------------- |
| base        | string | -      | 图标文件的基础路径          |
| url         | string | -      | 图标的完整 URL              |
| link        | string | -      | 自定义完整的 link 标签 HTML |
| icons       | array  | -      | 自定义图标数组              |
| copyOptions | object | -      | 图标文件复制配置            |

## 更新日志

查看 [GitHub Releases](https://github.com/MengXi-Studio/vite-plugin/releases)

## 贡献指南

欢迎贡献代码！请按以下步骤操作：

1. Fork 本项目
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交变更：`git commit -m "feat: your feature description"`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

## License

[MIT](LICENSE)
