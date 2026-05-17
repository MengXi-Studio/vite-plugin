# @meng-xi/vite-plugin [![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin) ![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

## 简介

`@meng-xi/vite-plugin` 是一个为 Vite 提供实用插件的工具包，同时也是一个完整的插件开发框架。

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
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { Plugin } from 'vite'

interface MyPluginOptions extends BasePluginOptions {
	path: string
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

| 选项          | 类型                         | 默认值  | 描述                 |
| ------------- | ---------------------------- | ------- | -------------------- |
| sourceDir     | string                       | -       | 源目录路径（必填）   |
| targetDir     | string                       | -       | 目标目录路径（必填） |
| overwrite     | boolean                      | true    | 是否覆盖现有文件     |
| recursive     | boolean                      | true    | 是否递归复制子目录   |
| incremental   | boolean                      | true    | 是否启用增量复制     |
| enabled       | boolean                      | true    | 是否启用插件         |
| verbose       | boolean                      | true    | 是否输出详细日志     |
| errorStrategy | 'throw' \| 'log' \| 'ignore' | 'throw' | 错误处理策略         |

### generateRouter

根据 uni-app 项目的 `pages.json` 自动生成路由配置文件。

| 选项                 | 类型                         | 默认值                 | 描述                          |
| -------------------- | ---------------------------- | ---------------------- | ----------------------------- |
| pagesJsonPath        | string                       | 'src/pages.json'       | pages.json 文件路径           |
| outputPath           | string                       | 'src/router.config.ts' | 输出文件路径                  |
| outputFormat         | 'ts' \| 'js'                 | 'ts'                   | 输出文件格式                  |
| nameStrategy         | string                       | 'camelCase'            | 路由名称策略                  |
| customNameGenerator  | (path: string) => string     | -                      | 自定义路由名称生成函数        |
| includeSubPackages   | boolean                      | true                   | 是否包含子包路由              |
| watch                | boolean                      | true                   | 是否监听变化自动重新生成      |
| metaMapping          | object                       | -                      | 页面 style 字段到 meta 的映射 |
| exportTypes          | boolean                      | true                   | 是否导出类型定义（TS）        |
| preserveRouteChanges | boolean                      | true                   | 是否保留用户对 routes 的修改  |
| enabled              | boolean                      | true                   | 是否启用插件                  |
| verbose              | boolean                      | true                   | 是否输出详细日志              |
| errorStrategy        | 'throw' \| 'log' \| 'ignore' | 'throw'                | 错误处理策略                  |

### generateVersion

在 Vite 构建过程中自动生成版本号。

| 选项          | 类型                         | 默认值            | 描述                    |
| ------------- | ---------------------------- | ----------------- | ----------------------- |
| format        | string                       | 'timestamp'       | 版本格式                |
| customFormat  | string                       | -                 | 自定义格式模板          |
| semverBase    | string                       | '1.0.0'           | 语义化版本基础值        |
| outputType    | string                       | 'file'            | 输出类型                |
| outputFile    | string                       | 'version.json'    | 输出文件路径            |
| defineName    | string                       | '**APP_VERSION**' | 注入的全局变量名        |
| hashLength    | number                       | 8                 | 哈希长度（1-32）        |
| prefix        | string                       | -                 | 版本号前缀              |
| suffix        | string                       | -                 | 版本号后缀              |
| extra         | Record<string, unknown>      | -                 | 额外版本信息（仅 JSON） |
| enabled       | boolean                      | true              | 是否启用插件            |
| verbose       | boolean                      | true              | 是否输出详细日志        |
| errorStrategy | 'throw' \| 'log' \| 'ignore' | 'throw'           | 错误处理策略            |

### injectIco

在 Vite 构建过程中将网站图标链接注入到 HTML 文件的 head 中。

| 选项          | 类型                         | 默认值  | 描述                        |
| ------------- | ---------------------------- | ------- | --------------------------- |
| base          | string                       | '/'     | 图标文件的基础路径          |
| url           | string                       | -       | 图标的完整 URL              |
| link          | string                       | -       | 自定义完整的 link 标签 HTML |
| icons         | Icon[]                       | -       | 自定义图标数组              |
| copyOptions   | object                       | -       | 图标文件复制配置            |
| enabled       | boolean                      | true    | 是否启用插件                |
| verbose       | boolean                      | true    | 是否输出详细日志            |
| errorStrategy | 'throw' \| 'log' \| 'ignore' | 'throw' | 错误处理策略                |

**Icon 类型**

| 属性  | 类型   | 描述           |
| ----- | ------ | -------------- |
| rel   | string | 图标关系类型   |
| href  | string | 图标 URL       |
| sizes | string | 图标尺寸       |
| type  | string | 图标 MIME 类型 |

**copyOptions**

| 属性      | 类型    | 默认值 | 描述                 |
| --------- | ------- | ------ | -------------------- |
| sourceDir | string  | -      | 源目录路径（必填）   |
| targetDir | string  | -      | 目标目录路径（必填） |
| overwrite | boolean | true   | 是否覆盖现有文件     |
| recursive | boolean | true   | 是否递归复制         |

## 插件开发框架

### BasePlugin

所有插件的基类，提供生命周期管理、日志记录、配置验证等核心功能。

**抽象方法（必须实现）**

| 方法                     | 描述               |
| ------------------------ | ------------------ |
| `getPluginName()`        | 返回插件名称       |
| `addPluginHooks(plugin)` | 添加 Vite 插件钩子 |

**可选方法**

| 方法                       | 描述                                 |
| -------------------------- | ------------------------------------ |
| `getDefaultOptions()`      | 返回插件默认配置                     |
| `validateOptions()`        | 验证插件配置参数                     |
| `getEnforce()`             | 返回插件执行时机（'pre' / 'post'）   |
| `onConfigResolved(config)` | 处理 Vite 配置解析完成事件           |
| `destroy()`                | 插件销毁时调用，基类默认注销日志配置 |

**内置方法**

| 方法                           | 描述                           |
| ------------------------------ | ------------------------------ |
| `safeExecute(fn, context)`     | 安全执行异步函数，自动处理错误 |
| `safeExecuteSync(fn, context)` | 安全执行同步函数，自动处理错误 |
| `handleError(error, context)`  | 根据 errorStrategy 处理错误    |

**内置属性**

| 属性         | 类型            | 描述             |
| ------------ | --------------- | ---------------- | --------- |
| `options`    | `Required<T>`   | 合并后的插件配置 |
| `logger`     | `PluginLogger`  | 插件日志记录器   |
| `validator`  | `Validator<T>`  | 配置验证器       |
| `viteConfig` | `ResolvedConfig | null`            | Vite 配置 |

### Logger

单例日志管理器，支持插件级别的日志控制。

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'
import type { PluginLogger, LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

| 方法                       | 描述                       |
| -------------------------- | -------------------------- |
| `Logger.create(options)`   | 创建日志实例（工厂方法）   |
| `Logger.unregister(name)`  | 注销插件的日志配置         |
| `Logger.destroy()`         | 销毁单例实例，释放所有资源 |
| `createPluginLogger(name)` | 创建插件日志代理           |

**PluginLogger 方法**：`success`、`info`、`warn`、`error`，均支持可选附加数据。

### Validator

链式配置验证器，确保参数类型正确。

```typescript
import { Validator } from '@meng-xi/vite-plugin/common'
```

| 方法              | 描述         |
| ----------------- | ------------ |
| `field(name)`     | 指定验证字段 |
| `required()`      | 标记为必填   |
| `string()`        | 验证为字符串 |
| `boolean()`       | 验证为布尔值 |
| `number()`        | 验证为数字   |
| `array()`         | 验证为数组   |
| `object()`        | 验证为对象   |
| `default(value)`  | 设置默认值   |
| `custom(fn, msg)` | 自定义验证   |
| `validate()`      | 执行验证     |

### 子路径导出

支持按需导入模块和类型定义：

```typescript
// 插件和工厂函数
import { copyFile, generateRouter, generateVersion, injectIco } from '@meng-xi/vite-plugin'
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'

// 类型导入（按需导入类型定义）
import type { BasePluginOptions, PluginFactory, PluginWithInstance, OptionsNormalizer } from '@meng-xi/vite-plugin/factory'
import type { CopyFileOptions, GenerateRouterOptions, GenerateVersionOptions, InjectIcoOptions, Icon } from '@meng-xi/vite-plugin/plugins'
import type { CopyOptions, CopyResult, DateFormatOptions } from '@meng-xi/vite-plugin/common'
```

### 通用配置

所有插件都继承自 BasePlugin，支持以下通用配置：

```typescript
interface BasePluginOptions {
	enabled?: boolean
	verbose?: boolean
	errorStrategy?: 'throw' | 'log' | 'ignore'
}
```

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
