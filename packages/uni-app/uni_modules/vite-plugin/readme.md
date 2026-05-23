# @meng-xi/vite-plugin

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

为 Vite 提供实用插件与插件开发框架的工具包。

## 特性

- **开箱即用** - 提供 6 个实用插件，覆盖构建进度展示、文件复制、路由生成、版本管理、图标注入、全局 Loading 状态管理等常见场景
- **插件开发框架** - 导出 BasePlugin、Logger、Validator 等核心组件，快速构建符合规范的自定义 Vite 插件
- **完整生命周期** - 支持初始化、配置解析、销毁等生命周期管理，自动组合钩子逻辑
- **类型安全** - 完整的 TypeScript 类型定义，配置验证器确保参数正确性
- **灵活配置** - 所有插件支持详细配置，满足多样化场景需求
- **安全执行** - 内置错误处理策略（throw / log / ignore），统一异常管理
- **按需导入** - 支持子路径导出，减少打包体积

## 文档

完整文档：[https://mengxi-studio.github.io/vite-plugin/](https://mengxi-studio.github.io/vite-plugin/)

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
import { buildProgress, copyFile, generateRouter, generateVersion, injectIco, loadingManager } from './uni_modules/vite-plugin/js_sdk/index.mjs'

export default defineConfig({
	plugins: [
		// 构建进度条
		buildProgress(),

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

		// 注入网站图标（支持字符串简写）
		injectIco('/assets'),

		// 全局 Loading 状态管理
		loadingManager({
			defaultVisible: true,
			autoHideOn: 'DOMContentLoaded'
		})
	]
})
```

### 访问插件实例

所有内置插件返回的对象包含 `pluginInstance` 属性，可访问插件内部状态：

```typescript
import type { PluginWithInstance } from './uni_modules/vite-plugin/js_sdk/factory/index.mjs'
import type { GenerateRouterOptions } from './uni_modules/vite-plugin/js_sdk/plugins/index.mjs'

const routerPlugin = generateRouter({ watch: true }) as PluginWithInstance<GenerateRouterOptions>

// 通过 pluginInstance 访问插件内部
console.log(routerPlugin.pluginInstance?.options)
```

### 运行时控制 Loading

`loadingManager` 会在浏览器端注入 `window.__LOADING_MANAGER__`（可通过 `globalName` 自定义），提供运行时 API：

| 方法                       | 说明                                       |
| -------------------------- | ------------------------------------------ |
| `show(text?)`              | 显示 Loading，可传入文本                   |
| `hide()`                   | 隐藏 Loading（受最小显示时间和防抖约束）   |
| `forceHide()`              | 强制隐藏，忽略最小显示时间和防抖           |
| `toggle(text?)`            | 切换 Loading 显示/隐藏状态                 |
| `updateText(text)`         | 更新文本内容                               |
| `isVisible()`              | 获取当前是否显示                           |
| `isPointerEventsEnabled()` | 获取当前是否启用了指针事件                 |
| `enablePointerEvents()`    | 启用遮罩层指针事件，拦截所有点击和滚动操作 |
| `disablePointerEvents()`   | 禁用遮罩层指针事件，允许交互穿透           |
| `togglePointerEvents()`    | 切换遮罩层指针事件状态                     |
| `getPendingCount()`        | 获取当前挂起的请求数量                     |
| `destroy()`                | 销毁实例，清理 DOM 并恢复原始拦截器        |

```typescript
// 显示 Loading
window.__LOADING_MANAGER__.show('正在加载...')

// 隐藏 Loading
window.__LOADING_MANAGER__.hide()

// 强制隐藏（忽略最小显示时间和防抖）
window.__LOADING_MANAGER__.forceHide()

// 切换显示/隐藏
window.__LOADING_MANAGER__.toggle('切换触发的 Loading')

// 更新文本
window.__LOADING_MANAGER__.updateText('正在保存...')

// 指针事件控制
window.__LOADING_MANAGER__.enablePointerEvents()
window.__LOADING_MANAGER__.disablePointerEvents()
window.__LOADING_MANAGER__.togglePointerEvents()

// 查询状态
window.__LOADING_MANAGER__.isVisible() // boolean
window.__LOADING_MANAGER__.isPointerEventsEnabled() // boolean
window.__LOADING_MANAGER__.getPendingCount() // number

// 销毁实例（清理 DOM 和拦截器）
window.__LOADING_MANAGER__.destroy()
```

### 开发自定义插件

```typescript
import { BasePlugin, createPluginFactory } from './uni_modules/vite-plugin/js_sdk/factory/index.mjs'
import type { BasePluginOptions, PluginWithInstance } from './uni_modules/vite-plugin/js_sdk/factory/index.mjs'
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

	protected destroy(): void {
		super.destroy()
		// 自定义清理逻辑，如关闭连接、停止监听等
	}
}

// 基本使用
export const myPlugin = createPluginFactory(MyPlugin)

// 带标准化器（支持字符串简写配置）
export const myPluginWithNormalizer = createPluginFactory(MyPlugin, opt => (typeof opt === 'string' ? { path: opt } : opt))
// 使用时支持简写：myPluginWithNormalizer('./custom-path')
```

## 插件开发框架

### BasePlugin 核心概念

`BasePlugin` 是所有插件的基类，提供了完整的生命周期管理和开发规范：

#### 生命周期

| 阶段     | 方法               | 说明                                   |
| -------- | ------------------ | -------------------------------------- |
| 初始化   | `constructor`      | 合并配置、初始化日志和验证器           |
| 配置解析 | `onConfigResolved` | Vite 配置解析完成时调用                |
| 钩子注册 | `addPluginHooks`   | 注册 Vite 插件钩子                     |
| 销毁     | `destroy`          | `closeBundle` 时自动调用，用于清理资源 |

#### 钩子自动组合

`toPlugin()` 方法会自动组合以下钩子：

- **configResolved** - 先执行基类的 `onConfigResolved`，再执行子类注册的钩子
- **closeBundle** - 先执行子类注册的钩子，再执行基类的 `destroy`

> 子类无需手动注册 `closeBundle` 钩子来清理资源，只需重写 `destroy()` 方法即可。

#### 必须实现的方法

| 方法                     | 说明               |
| ------------------------ | ------------------ |
| `getPluginName()`        | 返回插件名称       |
| `addPluginHooks(plugin)` | 添加 Vite 插件钩子 |

#### 可选重写的方法

| 方法                       | 默认行为    | 说明                               |
| -------------------------- | ----------- | ---------------------------------- |
| `getDefaultOptions()`      | 返回 `{}`   | 提供插件默认配置                   |
| `validateOptions()`        | 无验证      | 验证配置参数                       |
| `getEnforce()`             | `undefined` | 插件执行时机（`'pre'` / `'post'`） |
| `onConfigResolved(config)` | 存储配置    | 配置解析完成回调                   |
| `destroy()`                | 注销日志    | 插件销毁时的清理逻辑               |

#### 内置属性

| 属性         | 类型                     | 说明              |
| ------------ | ------------------------ | ----------------- |
| `options`    | `Required<T>`            | 合并后的完整配置  |
| `logger`     | `PluginLogger`           | 插件日志记录器    |
| `validator`  | `Validator<T>`           | 配置验证器        |
| `viteConfig` | `ResolvedConfig \| null` | Vite 解析后的配置 |

#### 错误处理策略

通过 `errorStrategy` 配置项控制错误行为：

- `'throw'`（默认）- 记录错误并抛出异常，中断构建
- `'log'` - 记录错误但不抛出，继续执行
- `'ignore'` - 记录错误但不抛出，继续执行

使用 `safeExecute` / `safeExecuteSync` 包裹可能出错的操作：

```typescript
// 异步安全执行
const result = await this.safeExecute(async () => {
	return await someAsyncOperation()
}, '执行异步操作')

// 同步安全执行
const value = this.safeExecuteSync(() => {
	return someSyncOperation()
}, '执行同步操作')
```

### createPluginFactory

创建插件工厂函数，支持选项标准化器：

```typescript
// 基本使用
const myPlugin = createPluginFactory(MyPlugin)

// 带标准化器（支持字符串简写配置）
const myPlugin = createPluginFactory(MyPlugin, opt => (typeof opt === 'string' ? { path: opt } : opt))

// 使用时支持简写
myPlugin('./custom-path')
```

### Validator

流畅的配置验证器，支持链式调用：

```typescript
import { Validator } from './uni_modules/vite-plugin/js_sdk/common/index.mjs'

const validator = new Validator(options)
validator
	.field('sourceDir')
	.required()
	.string()
	.field('targetDir')
	.required()
	.string()
	.field('overwrite')
	.boolean()
	.default(true)
	.field('port')
	.number()
	.field('list')
	.array()
	.field('config')
	.object()
	.field('name')
	.custom(val => val.length > 0, 'name 不能为空')
	.validate()
```

| 方法         | 说明                                               |
| ------------ | -------------------------------------------------- |
| `field()`    | 指定要验证的字段                                   |
| `required()` | 标记字段为必填                                     |
| `string()`   | 验证字段值是否为字符串类型                         |
| `boolean()`  | 验证字段值是否为布尔类型                           |
| `number()`   | 验证字段值是否为数字类型                           |
| `array()`    | 验证字段值是否为数组类型                           |
| `object()`   | 验证字段值是否为对象类型                           |
| `default()`  | 为字段设置默认值（仅当值为 undefined/null 时生效） |
| `custom()`   | 使用自定义函数验证字段值                           |
| `validate()` | 执行验证，失败时抛出错误                           |

### Logger

全局单例日志管理器，为每个插件提供独立的日志控制：

```typescript
import { Logger } from './uni_modules/vite-plugin/js_sdk/logger/index.mjs'

// 创建日志记录器（通常由 BasePlugin 自动调用）
Logger.create({ name: 'my-plugin', enabled: true })

// 注销插件日志配置（插件销毁时自动调用）
Logger.unregister('my-plugin')

// 销毁单例（测试场景使用）
Logger.destroy()
```

日志输出格式：

```
ℹ️ [@meng-xi/vite-plugin:my-plugin] Info message
✅ [@meng-xi/vite-plugin:my-plugin] Success message
⚠️ [@meng-xi/vite-plugin:my-plugin] Warning message
❌ [@meng-xi/vite-plugin:my-plugin] Error message
```

### 通用工具函数

通过 `./uni_modules/vite-plugin/js_sdk/common/index.mjs` 导出，可在自定义插件中复用：

```typescript
import { deepMerge, formatDate, parseTemplate, toCamelCase, toPascalCase, stripJsonComments, generateRandomHash, Validator } from './uni_modules/vite-plugin/js_sdk/common/index.mjs'
import { readFileContent, writeFileContent, fileExists, copySourceToTarget, readDirRecursive, runWithConcurrency, shouldUpdateFile } from './uni_modules/vite-plugin/js_sdk/common/index.mjs'
```

| 函数                   | 说明                                               |
| ---------------------- | -------------------------------------------------- |
| `deepMerge()`          | 深度合并对象（undefined 不覆盖，数组直接覆盖）     |
| `formatDate()`         | 格式化日期，支持 `{YYYY}`, `{MM}`, `{DD}` 等占位符 |
| `parseTemplate()`      | 解析模板字符串，替换占位符                         |
| `toCamelCase()`        | 转换为驼峰命名（camelCase）                        |
| `toPascalCase()`       | 转换为帕斯卡命名（PascalCase）                     |
| `stripJsonComments()`  | 移除 JSON 字符串中的注释                           |
| `generateRandomHash()` | 生成随机哈希字符串（1-64 位）                      |
| `readFileContent()`    | 异步读取文件内容                                   |
| `writeFileContent()`   | 异步写入文件内容                                   |
| `fileExists()`         | 异步检查文件是否存在                               |
| `copySourceToTarget()` | 复制文件或目录，支持增量复制和并发控制             |
| `readDirRecursive()`   | 递归读取目录内容，返回文件和目录条目信息           |
| `runWithConcurrency()` | 带并发限制的批量执行                               |
| `shouldUpdateFile()`   | 检查文件是否需要更新（比较修改时间和大小）         |

## 内置插件

| 插件            | 说明                                               |
| --------------- | -------------------------------------------------- |
| buildProgress   | 终端实时构建进度条，支持 bar / spinner / minimal   |
| copyFile        | 构建完成后复制文件或目录，支持增量复制             |
| generateRouter  | 根据 pages.json 自动生成路由配置（uni-app）        |
| generateVersion | 自动生成版本号，支持文件输出和全局变量注入         |
| injectIco       | 将网站图标链接注入到 HTML 文件，支持字符串简写配置 |
| loadingManager  | 全局 Loading 状态管理，支持请求拦截和白屏 Loading  |

### buildProgress

在终端实时显示 Vite 构建进度条，支持三种显示格式。

**进度计算逻辑：**

1. config 阶段（5%）→ resolve 阶段（10%）→ transform 阶段（15%-85%，按模块转换比例）→ bundle 阶段（+10%）→ write 阶段（+5%）→ 完成（100%）
2. 非 TTY 终端环境（如 CI/CD）自动降级为日志输出模式

| 选项            | 类型                                  | 默认值  | 描述                           |
| --------------- | ------------------------------------- | ------- | ------------------------------ |
| width           | `number`                              | `30`    | 进度条宽度（字符数）           |
| format          | `'bar'` \| `'spinner'` \| `'minimal'` | `'bar'` | 进度条显示格式                 |
| completeChar    | `string`                              | `'█'`   | 已完成部分的填充字符           |
| incompleteChar  | `string`                              | `'░'`   | 未完成部分的填充字符           |
| clearOnComplete | `boolean`                             | `true`  | 构建完成后是否清除进度条       |
| showModuleName  | `boolean`                             | `true`  | 是否显示当前正在处理的模块名称 |
| theme           | `ProgressTheme`                       | -       | 自定义颜色主题                 |

**ProgressTheme**

| 属性            | 类型                       | 描述           |
| --------------- | -------------------------- | -------------- |
| completeColor   | `(text: string) => string` | 已完成部分颜色 |
| incompleteColor | `(text: string) => string` | 未完成部分颜色 |
| percentageColor | `(text: string) => string` | 百分比数字颜色 |
| phaseColor      | `(text: string) => string` | 阶段标签颜色   |
| moduleColor     | `(text: string) => string` | 模块名称颜色   |

```typescript
// 默认进度条格式
buildProgress()

// 旋转动画格式
buildProgress({ format: 'spinner' })

// 精简格式
buildProgress({ format: 'minimal' })

// 自定义外观
buildProgress({
	width: 40,
	completeChar: '■',
	incompleteChar: '□',
	clearOnComplete: false
})

// 自定义颜色主题
buildProgress({
	theme: {
		completeColor: t => `\x1b[32m${t}\x1b[39m`,
		incompleteColor: t => `\x1b[90m${t}\x1b[39m`,
		percentageColor: t => `\x1b[1m${t}\x1b[22m`,
		phaseColor: t => `\x1b[36m${t}\x1b[39m`,
		moduleColor: t => `\x1b[90m${t}\x1b[39m`
	}
})
```

### copyFile

在 Vite 构建完成后复制文件或目录到指定位置，执行时机为 `enforce: 'post'`。

| 选项        | 类型      | 默认值 | 描述                 |
| ----------- | --------- | ------ | -------------------- |
| sourceDir   | `string`  | -      | 源目录路径（必填）   |
| targetDir   | `string`  | -      | 目标目录路径（必填） |
| overwrite   | `boolean` | `true` | 是否覆盖现有文件     |
| recursive   | `boolean` | `true` | 是否递归复制子目录   |
| incremental | `boolean` | `true` | 是否启用增量复制     |

```typescript
// 基本使用
copyFile({
	sourceDir: 'src/assets',
	targetDir: 'dist/assets'
})

// 禁用覆盖和增量复制
copyFile({
	sourceDir: 'src/static',
	targetDir: 'dist/static',
	overwrite: false,
	incremental: false
})
```

### generateRouter

根据 uni-app 项目的 `pages.json` 自动生成路由配置文件。

| 选项                 | 类型                                                      | 默认值                   | 描述                          |
| -------------------- | --------------------------------------------------------- | ------------------------ | ----------------------------- |
| pagesJsonPath        | `string`                                                  | `'src/pages.json'`       | pages.json 文件路径           |
| outputPath           | `string`                                                  | `'src/router.config.ts'` | 输出文件路径                  |
| outputFormat         | `'ts'` \| `'js'`                                          | `'ts'`                   | 输出文件格式                  |
| nameStrategy         | `'path'` \| `'camelCase'` \| `'pascalCase'` \| `'custom'` | `'camelCase'`            | 路由名称策略                  |
| customNameGenerator  | `(path: string) => string`                                | -                        | 自定义路由名称生成函数        |
| includeSubPackages   | `boolean`                                                 | `true`                   | 是否包含子包路由              |
| watch                | `boolean`                                                 | `true`                   | 是否监听变化自动重新生成      |
| metaMapping          | `Record<string, string>`                                  | -                        | 页面 style 字段到 meta 的映射 |
| exportTypes          | `boolean`                                                 | `true`                   | 是否导出类型定义              |
| preserveRouteChanges | `boolean`                                                 | `true`                   | 是否保留用户对 routes 的修改  |

> 默认 `metaMapping` 为 `{ navigationBarTitleText: 'title', requireAuth: 'requireAuth' }`，自动将页面样式字段映射到路由元信息。当 `nameStrategy` 为 `'custom'` 时，必须提供 `customNameGenerator`。

```typescript
// 基本使用
generateRouter()

// 自定义 pages.json 路径
generateRouter({ pagesJsonPath: 'pages.json' })

// 输出 JavaScript 文件
generateRouter({ outputFormat: 'js', outputPath: 'src/router.config.js' })

// 使用帕斯卡命名策略
generateRouter({ nameStrategy: 'pascalCase' })

// 自定义路由名称生成
generateRouter({
	nameStrategy: 'custom',
	customNameGenerator: path => `route_${path.replace(/\//g, '_')}`
})

// 自定义元信息映射
generateRouter({
	metaMapping: {
		navigationBarTitleText: 'title',
		requireAuth: 'requireAuth',
		customField: 'custom'
	}
})
```

### generateVersion

在 Vite 构建过程中自动生成版本号。

| 选项         | 类型                                                                              | 默认值              | 描述                     |
| ------------ | --------------------------------------------------------------------------------- | ------------------- | ------------------------ |
| format       | `'timestamp'` \| `'date'` \| `'datetime'` \| `'semver'` \| `'hash'` \| `'custom'` | `'timestamp'`       | 版本号格式               |
| customFormat | `string`                                                                          | -                   | 自定义格式模板           |
| semverBase   | `string`                                                                          | `'1.0.0'`           | 语义化版本基础值         |
| outputType   | `'file'` \| `'define'` \| `'both'`                                                | `'file'`            | 输出类型                 |
| outputFile   | `string`                                                                          | `'version.json'`    | 输出文件路径             |
| defineName   | `string`                                                                          | `'__APP_VERSION__'` | 注入的全局变量名         |
| hashLength   | `number`                                                                          | `8`                 | 哈希长度（1-32）         |
| prefix       | `string`                                                                          | -                   | 版本号前缀               |
| suffix       | `string`                                                                          | -                   | 版本号后缀               |
| extra        | `Record<string, unknown>`                                                         | -                   | 附加信息（仅 JSON 文件） |

**customFormat 支持的占位符：**

| 占位符        | 说明                            | 示例            |
| ------------- | ------------------------------- | --------------- |
| `{YYYY}`      | 四位年份                        | `2026`          |
| `{YY}`        | 两位年份                        | `26`            |
| `{MM}`        | 两位月份                        | `05`            |
| `{DD}`        | 两位日期                        | `23`            |
| `{HH}`        | 两位小时                        | `14`            |
| `{mm}`        | 两位分钟                        | `30`            |
| `{ss}`        | 两位秒数                        | `00`            |
| `{timestamp}` | 时间戳                          | `1748000000000` |
| `{hash}`      | 随机哈希                        | `a1b2c3d4`      |
| `{major}`     | 主版本号（需配合 semverBase）   | `1`             |
| `{minor}`     | 次版本号（需配合 semverBase）   | `0`             |
| `{patch}`     | 补丁版本号（需配合 semverBase） | `0`             |

```typescript
// 时间戳格式（默认）
generateVersion()

// 日期格式
generateVersion({ format: 'date' })

// 自定义格式
generateVersion({
	format: 'custom',
	customFormat: '{YYYY}.{MM}.{DD}-{hash}',
	hashLength: 6
})

// 同时输出文件和全局变量
generateVersion({
	format: 'datetime',
	outputType: 'both',
	defineName: '__APP_VERSION__'
})

// 带前缀和附加信息
generateVersion({
	format: 'semver',
	semverBase: '2.0.0',
	prefix: 'v',
	extra: { environment: 'production' }
})
```

### injectIco

在 Vite 构建过程中将网站图标链接注入到 HTML 文件的 `<head>` 中，支持字符串简写配置。

| 选项        | 类型                          | 默认值 | 描述                                      |
| ----------- | ----------------------------- | ------ | ----------------------------------------- |
| base        | `string`                      | `'/'`  | 图标文件的基础路径                        |
| url         | `string`                      | -      | 图标的完整 URL（覆盖 base + favicon.ico） |
| link        | `string`                      | -      | 自定义完整的 `<link>` 标签 HTML           |
| icons       | [Icon](#icon)[]               | -      | 自定义图标数组                            |
| copyOptions | [CopyOptions](#copyoptions-1) | -      | 图标文件复制配置                          |

> 支持字符串简写：`injectIco('/assets')` 等同于 `injectIco({ base: '/assets' })`

**Icon**

| 属性  | 类型     | 必填 | 描述           |
| ----- | -------- | ---- | -------------- |
| rel   | `string` | 是   | 图标关系类型   |
| href  | `string` | 是   | 图标 URL       |
| sizes | `string` | 否   | 图标尺寸       |
| type  | `string` | 否   | 图标 MIME 类型 |

**copyOptions**

| 属性      | 类型      | 必填 | 默认值 | 描述             |
| --------- | --------- | ---- | ------ | ---------------- |
| sourceDir | `string`  | 是   | -      | 图标源文件目录   |
| targetDir | `string`  | 是   | -      | 图标目标目录     |
| overwrite | `boolean` | 否   | `true` | 是否覆盖同名文件 |
| recursive | `boolean` | 否   | `true` | 是否递归复制     |

```typescript
// 字符串简写
injectIco('/assets')

// 自定义 URL
injectIco({ url: 'https://example.com/favicon.ico' })

// 多图标配置
injectIco({
	icons: [
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
	]
})

// 带文件复制
injectIco({
	base: '/assets',
	copyOptions: {
		sourceDir: 'src/assets/icons',
		targetDir: 'dist/assets/icons'
	}
})
```

### loadingManager

全局 Loading 状态管理，支持白屏 Loading、请求自动拦截、自定义样式与动画、生命周期回调。

| 选项           | 类型                                       | 默认值                  | 描述                                                 |
| -------------- | ------------------------------------------ | ----------------------- | ---------------------------------------------------- |
| position       | `'center' \| 'top' \| 'bottom'`            | `'center'`              | Loading 显示位置                                     |
| defaultText    | `string`                                   | `'加载中...'`           | 默认显示文本                                         |
| spinnerType    | `'spinner' \| 'dots' \| 'pulse' \| 'bar'`  | `'spinner'`             | 旋转图标类型                                         |
| style          | [LoadingStyle](#loadingstyle)              | 见下方                  | 自定义样式配置                                       |
| transition     | [TransitionConfig](#transitionconfig)      | `{ enabled: true }`     | 过渡动画配置                                         |
| minDisplayTime | [MinDisplayTime](#mindisplaytime)          | `{ enabled: true }`     | 最小显示时间配置                                     |
| delayShow      | [DelayShow](#delayshow)                    | `{ enabled: true }`     | 延迟显示配置                                         |
| debounceHide   | [DebounceHide](#debouncehide)              | `{ enabled: false }`    | 防抖隐藏配置                                         |
| autoBind       | `'fetch' \| 'xhr' \| 'all' \| 'none'`      | `'none'`                | 自动绑定请求拦截模式                                 |
| requestFilter  | [RequestFilter](#requestfilter)            | -                       | 请求过滤配置                                         |
| globalName     | `string`                                   | `'__LOADING_MANAGER__'` | 注入到浏览器的全局变量名                             |
| customTemplate | `string`                                   | -                       | 自定义 Loading HTML 模板                             |
| defaultVisible | `boolean`                                  | `false`                 | DOM 初始可见状态（白屏 Loading）                     |
| autoHideOn     | `'DOMContentLoaded' \| 'load' \| 'manual'` | `'DOMContentLoaded'`    | 自动隐藏时机（仅 `defaultVisible` 为 `true` 时生效） |
| callbacks      | [LoadingCallbacks](#loadingcallbacks)      | -                       | 生命周期回调                                         |

**LoadingStyle**

| 属性               | 类型      | 默认值                       | 描述                                                        |
| ------------------ | --------- | ---------------------------- | ----------------------------------------------------------- |
| overlayColor       | `string`  | `'rgba(255, 255, 255, 0.7)'` | 遮罩层背景色                                                |
| spinnerColor       | `string`  | `'#4361ee'`                  | Loading 图标颜色                                            |
| spinnerSize        | `string`  | `'40px'`                     | Loading 图标大小                                            |
| textColor          | `string`  | `'#333'`                     | 文本颜色                                                    |
| textSize           | `string`  | `'14px'`                     | 文本大小                                                    |
| customClass        | `string`  | -                            | 自定义 CSS 类名                                             |
| customStyle        | `string`  | -                            | 自定义内联样式字符串                                        |
| zIndex             | `number`  | `9999`                       | 遮罩层 z-index                                              |
| pointerEvents      | `boolean` | `true`                       | 是否启用遮罩层指针事件（`true` 拦截交互，`false` 允许穿透） |
| backdropBlur       | `boolean` | `false`                      | 是否启用背景模糊                                            |
| backdropBlurAmount | `number`  | `4`                          | 背景模糊程度（px）                                          |

**TransitionConfig**

| 属性     | 类型      | 默认值       | 描述               |
| -------- | --------- | ------------ | ------------------ |
| enabled  | `boolean` | `true`       | 是否启用过渡动画   |
| duration | `number`  | `200`        | 过渡持续时间（ms） |
| easing   | `string`  | `'ease-out'` | CSS 缓动函数       |

**MinDisplayTime**

| 属性     | 类型      | 默认值 | 描述                 |
| -------- | --------- | ------ | -------------------- |
| enabled  | `boolean` | `true` | 是否启用最小显示时间 |
| duration | `number`  | `300`  | 最小显示时间（ms）   |

**DelayShow**

| 属性     | 类型      | 默认值 | 描述                         |
| -------- | --------- | ------ | ---------------------------- |
| enabled  | `boolean` | `true` | 是否启用延迟显示             |
| duration | `number`  | `200`  | 延迟时间（ms），超时后才显示 |

**DebounceHide**

| 属性     | 类型      | 默认值  | 描述               |
| -------- | --------- | ------- | ------------------ |
| enabled  | `boolean` | `false` | 是否启用防抖隐藏   |
| duration | `number`  | `100`   | 防抖等待时间（ms） |

**RequestFilter**

| 属性               | 类型       | 描述                                                    |
| ------------------ | ---------- | ------------------------------------------------------- |
| excludeUrls        | `RegExp[]` | 需要排除的 URL 正则表达式数组                           |
| includeUrls        | `RegExp[]` | 需要包含的 URL 正则表达式数组（优先级高于 excludeUrls） |
| excludeMethods     | `string[]` | 需要排除的 HTTP 方法数组                                |
| excludeUrlPrefixes | `string[]` | 需要排除的 URL 前缀数组                                 |

**LoadingCallbacks**

回调以**函数体字符串**形式提供（构建时注入到浏览器端，无法传递函数引用）。

| 属性         | 类型     | 描述                                  |
| ------------ | -------- | ------------------------------------- |
| onBeforeShow | `string` | 显示前回调，`return false` 可阻止显示 |
| onShow       | `string` | 显示后回调                            |
| onBeforeHide | `string` | 隐藏前回调，`return false` 可阻止隐藏 |
| onHide       | `string` | 隐藏后回调                            |
| onDestroy    | `string` | 销毁时回调                            |

```typescript
// 白屏 Loading：页面加载即显示，DOM 就绪后自动隐藏
loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })

// 白屏 Loading：所有资源加载完成后隐藏
loadingManager({ defaultVisible: true, autoHideOn: 'load' })

// Vue/React SPA：白屏即显示，框架渲染完成后手动隐藏
loadingManager({ defaultVisible: true, autoHideOn: 'manual' })
// 在应用入口处：window.__LOADING_MANAGER__.hide()

// 自动拦截所有请求
loadingManager({ autoBind: 'all' })

// 自定义样式 + 请求过滤
loadingManager({
	style: { overlayColor: 'rgba(0,0,0,0.5)', spinnerColor: '#fff', backdropBlur: true },
	autoBind: 'fetch',
	requestFilter: { excludeUrls: [/\/api\/health/], excludeUrlPrefixes: ['http://localhost'] }
})

// 防抖隐藏（避免快速闪烁）
loadingManager({ debounceHide: { enabled: true, duration: 100 } })

// 生命周期回调
loadingManager({
	callbacks: {
		onBeforeShow: 'if (shouldSkip) return false;',
		onShow: 'console.log("loading shown")',
		onBeforeHide: 'if (shouldKeepVisible) return false;',
		onHide: 'console.log("loading hidden")'
	}
})

// 手动控制
loadingManager()
window.__LOADING_MANAGER__.show('正在保存...')
window.__LOADING_MANAGER__.hide()
window.__LOADING_MANAGER__.toggle()
window.__LOADING_MANAGER__.disablePointerEvents()
```

## 子路径导出

支持按需导入模块，减少打包体积：

```typescript
// 完整导入
import { buildProgress, copyFile, loadingManager, BasePlugin, Logger } from './uni_modules/vite-plugin/js_sdk/index.mjs'

// 按模块导入
import { BasePlugin, createPluginFactory } from './uni_modules/vite-plugin/js_sdk/factory/index.mjs'
import { Logger } from './uni_modules/vite-plugin/js_sdk/logger/index.mjs'
import { buildProgress, copyFile, generateRouter, loadingManager } from './uni_modules/vite-plugin/js_sdk/plugins/index.mjs'
import { Validator, readFileContent, writeFileContent } from './uni_modules/vite-plugin/js_sdk/common/index.mjs'

// 类型导入（从子路径按需导入类型定义）
import type { PluginWithInstance, PluginFactory, BasePluginOptions } from './uni_modules/vite-plugin/js_sdk/factory/index.mjs'
import type { BuildProgressOptions, GenerateVersionOptions, InjectIcoOptions, LoadingManagerOptions, Icon } from './uni_modules/vite-plugin/js_sdk/plugins/index.mjs'
import type { DateFormatOptions } from './uni_modules/vite-plugin/js_sdk/common/index.mjs'
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
