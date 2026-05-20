# @meng-xi/vite-plugin

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

为 Vite 提供实用插件与插件开发框架的工具包。

## 特性

- **六款内置插件** — buildProgress、copyFile、generateRouter、generateVersion、injectIco、injectLoading，覆盖构建进度、文件复制、路由生成、版本管理、图标注入、全局 Loading 等场景
- **插件开发框架** — 导出 BasePlugin、Logger、Validator 等核心组件，快速构建自定义插件
- **完整生命周期** — 支持初始化、配置解析、销毁等阶段管理，自动组合钩子逻辑
- **类型安全** — 完整 TypeScript 类型定义，链式验证器确保参数正确性
- **灵活配置** — 所有插件支持详细配置项，满足多样化需求
- **安全执行** — 内置错误处理策略（`throw` / `log` / `ignore`），统一异常管理

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
import { buildProgress, copyFile, generateRouter, generateVersion, injectIco, injectLoading } from '@meng-xi/vite-plugin'

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

		// 注入网站图标
		injectIco({
			base: '/assets'
		}),

		// 注入全局 Loading
		injectLoading({
			defaultVisible: true,
			autoHideOn: 'DOMContentLoaded',
			autoBind: 'all'
		})
	]
})
```

### 访问插件实例

所有内置插件返回的对象包含 `pluginInstance` 属性，可访问插件内部状态：

```typescript
import type { PluginWithInstance } from '@meng-xi/vite-plugin/factory'
import type { GenerateRouterOptions, InjectLoadingOptions } from '@meng-xi/vite-plugin'

const routerPlugin = generateRouter({ watch: true }) as PluginWithInstance<GenerateRouterOptions>
console.log(routerPlugin.pluginInstance?.options)

const loadingPlugin = injectLoading({ autoBind: 'all' }) as PluginWithInstance<InjectLoadingOptions>
console.log(loadingPlugin.pluginInstance?.options)
```

### 运行时控制 Loading

`injectLoading` 会在浏览器端注入 `window.__LOADING_MANAGER__`（可通过 `globalName` 自定义），提供运行时 API：

```typescript
// 显示 Loading
window.__LOADING_MANAGER__.show('正在加载...')

// 隐藏 Loading
window.__LOADING_MANAGER__.hide()

// 强制隐藏（忽略最小显示时间和防抖）
window.__LOADING_MANAGER__.forceHide()

// 更新文本
window.__LOADING_MANAGER__.updateText('正在保存...')

// 查询状态
window.__LOADING_MANAGER__.isVisible() // boolean
window.__LOADING_MANAGER__.getPendingCount() // number

// 销毁实例（清理 DOM 和拦截器）
window.__LOADING_MANAGER__.destroy()
```

### 开发自定义插件

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions, PluginWithInstance } from '@meng-xi/vite-plugin/factory'
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
		// 自定义清理逻辑
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

---

## 内置插件

### buildProgress

在终端实时显示 Vite 构建进度条，支持三种显示格式。

**配置项**

| 选项            | 类型                              | 默认值  | 描述                           |
| --------------- | --------------------------------- | ------- | ------------------------------ |
| width           | `number`                          | `30`    | 进度条宽度（字符数）           |
| format          | `'bar' \| 'spinner' \| 'minimal'` | `'bar'` | 进度条显示格式                 |
| completeChar    | `string`                          | `'█'`   | 已完成部分的填充字符           |
| incompleteChar  | `string`                          | `'░'`   | 未完成部分的填充字符           |
| clearOnComplete | `boolean`                         | `true`  | 构建完成后是否清除进度条       |
| showModuleName  | `boolean`                         | `true`  | 是否显示当前正在处理的模块名称 |
| theme           | [ProgressTheme](#progresstheme)   | -       | 自定义颜色主题                 |

**ProgressTheme**

| 属性            | 类型                       | 描述           |
| --------------- | -------------------------- | -------------- |
| completeColor   | `(text: string) => string` | 已完成部分颜色 |
| incompleteColor | `(text: string) => string` | 未完成部分颜色 |
| percentageColor | `(text: string) => string` | 百分比数字颜色 |
| phaseColor      | `(text: string) => string` | 阶段标签颜色   |
| moduleColor     | `(text: string) => string` | 模块名称颜色   |

**示例**

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
```

---

### copyFile

在 Vite 构建完成后复制文件或目录到指定位置。

**配置项**

| 选项        | 类型      | 默认值 | 描述                     |
| ----------- | --------- | ------ | ------------------------ |
| sourceDir   | `string`  | -      | 源目录路径（**必填**）   |
| targetDir   | `string`  | -      | 目标目录路径（**必填**） |
| overwrite   | `boolean` | `true` | 是否覆盖现有文件         |
| recursive   | `boolean` | `true` | 是否递归复制子目录       |
| incremental | `boolean` | `true` | 是否启用增量复制         |

---

### generateRouter

根据 uni-app 项目的 `pages.json` 自动生成路由配置文件。

**配置项**

| 选项                 | 类型                                                | 默认值                                                            | 描述                          |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------- |
| pagesJsonPath        | `string`                                            | `'src/pages.json'`                                                | pages.json 文件路径           |
| outputPath           | `string`                                            | `'src/router.config.ts'`                                          | 输出文件路径                  |
| outputFormat         | `'ts' \| 'js'`                                      | `'ts'`                                                            | 输出文件格式                  |
| nameStrategy         | `'path' \| 'camelCase' \| 'pascalCase' \| 'custom'` | `'camelCase'`                                                     | 路由名称策略                  |
| customNameGenerator  | `(path: string) => string`                          | -                                                                 | 自定义路由名称生成函数        |
| includeSubPackages   | `boolean`                                           | `true`                                                            | 是否包含子包路由              |
| watch                | `boolean`                                           | `true`                                                            | 是否监听变化自动重新生成      |
| metaMapping          | `Record<string, string>`                            | `{ navigationBarTitleText: 'title', requireAuth: 'requireAuth' }` | 页面 style 字段到 meta 的映射 |
| exportTypes          | `boolean`                                           | `true`                                                            | 是否导出类型定义              |
| preserveRouteChanges | `boolean`                                           | `true`                                                            | 是否保留用户对 routes 的修改  |

---

### generateVersion

在 Vite 构建过程中自动生成版本号。

**配置项**

| 选项         | 类型                                                                    | 默认值              | 描述                                            |
| ------------ | ----------------------------------------------------------------------- | ------------------- | ----------------------------------------------- |
| format       | `'timestamp' \| 'date' \| 'datetime' \| 'semver' \| 'hash' \| 'custom'` | `'timestamp'`       | 版本号格式                                      |
| customFormat | `string`                                                                | -                   | 自定义格式模板（`format` 为 `'custom'` 时必填） |
| semverBase   | `string`                                                                | `'1.0.0'`           | 语义化版本基础值                                |
| outputType   | `'file' \| 'define' \| 'both'`                                          | `'file'`            | 输出类型                                        |
| outputFile   | `string`                                                                | `'version.json'`    | 输出文件路径                                    |
| defineName   | `string`                                                                | `'__APP_VERSION__'` | 注入的全局变量名                                |
| hashLength   | `number`                                                                | `8`                 | 哈希长度（1-32）                                |
| prefix       | `string`                                                                | `''`                | 版本号前缀                                      |
| suffix       | `string`                                                                | `''`                | 版本号后缀                                      |
| extra        | `Record<string, unknown>`                                               | -                   | 附加信息（仅 JSON 文件）                        |

---

### injectIco

在 Vite 构建过程中将网站图标链接注入到 HTML 文件的 `<head>` 中。

**配置项**

| 选项        | 类型                          | 默认值 | 描述                            |
| ----------- | ----------------------------- | ------ | ------------------------------- |
| base        | `string`                      | `'/'`  | 图标文件的基础路径              |
| url         | `string`                      | -      | 图标的完整 URL                  |
| link        | `string`                      | -      | 自定义完整的 `<link>` 标签 HTML |
| icons       | [Icon](#icon)[]               | -      | 自定义图标数组                  |
| copyOptions | [CopyOptions](#copyoptions-1) | -      | 图标文件复制配置                |

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

---

### injectLoading

注入全局 Loading 状态管理，支持白屏 Loading、请求自动拦截、自定义样式与动画、生命周期回调。

**配置项**

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

| 属性               | 类型      | 默认值                       | 描述                 |
| ------------------ | --------- | ---------------------------- | -------------------- |
| overlayColor       | `string`  | `'rgba(255, 255, 255, 0.7)'` | 遮罩层背景色         |
| spinnerColor       | `string`  | `'#4361ee'`                  | Loading 图标颜色     |
| spinnerSize        | `string`  | `'40px'`                     | Loading 图标大小     |
| textColor          | `string`  | `'#333'`                     | 文本颜色             |
| textSize           | `string`  | `'14px'`                     | 文本大小             |
| customClass        | `string`  | -                            | 自定义 CSS 类名      |
| customStyle        | `string`  | -                            | 自定义内联样式字符串 |
| zIndex             | `number`  | `9999`                       | 遮罩层 z-index       |
| pointerEvents      | `boolean` | `false`                      | 是否允许点击穿透     |
| backdropBlur       | `boolean` | `false`                      | 是否启用背景模糊     |
| backdropBlurAmount | `number`  | `4`                          | 背景模糊程度（px）   |

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

**示例**

```typescript
// 白屏 Loading：页面加载时即显示，DOMContentLoaded 后自动隐藏
injectLoading({
	defaultVisible: true,
	autoHideOn: 'DOMContentLoaded'
})

// 请求自动拦截：所有 fetch/xhr 请求自动触发 Loading
injectLoading({
	autoBind: 'all',
	requestFilter: {
		excludeUrlPrefixes: ['/static/', '/api/health']
	}
})

// 自定义样式和动画
injectLoading({
	style: {
		overlayColor: 'rgba(0, 0, 0, 0.6)',
		spinnerColor: '#fff',
		textColor: '#fff',
		backdropBlur: true
	},
	transition: {
		duration: 300,
		easing: 'ease-in-out'
	}
})

// 生命周期回调
injectLoading({
	callbacks: {
		onBeforeShow: 'console.log("about to show")',
		onShow: 'console.log("shown")',
		onBeforeHide: 'if (shouldKeepVisible) return false;',
		onHide: 'console.log("hidden")'
	}
})
```

---

## 插件开发框架

### BasePlugin

所有插件的基类，提供生命周期管理、日志记录、配置验证等核心功能。

**生命周期**

| 阶段     | 方法               | 说明                                   |
| -------- | ------------------ | -------------------------------------- |
| 初始化   | `constructor`      | 合并配置、初始化日志和验证器           |
| 配置解析 | `onConfigResolved` | Vite 配置解析完成时调用                |
| 钩子注册 | `addPluginHooks`   | 注册 Vite 插件钩子                     |
| 销毁     | `destroy`          | `closeBundle` 时自动调用，用于清理资源 |

**钩子自动组合**

`toPlugin()` 方法会自动组合以下钩子：

- **configResolved** — 先执行基类的 `onConfigResolved`，再执行子类注册的钩子
- **closeBundle** — 先执行子类注册的钩子，再执行基类的 `destroy`

> 子类无需手动注册 `closeBundle` 钩子来清理资源，只需重写 `destroy()` 方法即可。

**抽象方法（必须实现）**

| 方法                     | 描述               |
| ------------------------ | ------------------ |
| `getPluginName()`        | 返回插件名称       |
| `addPluginHooks(plugin)` | 添加 Vite 插件钩子 |

**可选重写方法**

| 方法                       | 默认行为       | 描述                               |
| -------------------------- | -------------- | ---------------------------------- |
| `getDefaultOptions()`      | 返回 `{}`      | 提供插件默认配置                   |
| `validateOptions()`        | 无验证         | 验证配置参数                       |
| `getEnforce()`             | `undefined`    | 插件执行时机（`'pre'` / `'post'`） |
| `onConfigResolved(config)` | 存储 Vite 配置 | 配置解析完成回调                   |
| `destroy()`                | 注销日志       | 插件销毁时的清理逻辑               |

**内置方法**

| 方法                           | 描述                           |
| ------------------------------ | ------------------------------ |
| `safeExecute(fn, context)`     | 安全执行异步函数，自动处理错误 |
| `safeExecuteSync(fn, context)` | 安全执行同步函数，自动处理错误 |
| `handleError(error, context)`  | 根据 `errorStrategy` 处理错误  |

**内置属性**

| 属性         | 类型                     | 描述              |
| ------------ | ------------------------ | ----------------- |
| `options`    | `Required<T>`            | 合并后的完整配置  |
| `logger`     | `PluginLogger`           | 插件日志记录器    |
| `validator`  | `Validator<T>`           | 配置验证器        |
| `viteConfig` | `ResolvedConfig \| null` | Vite 解析后的配置 |

---

### Logger

单例日志管理器，支持插件级别的日志控制。

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'
import type { PluginLogger, LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

**静态方法**

| 方法                      | 描述                                           |
| ------------------------- | ---------------------------------------------- |
| `Logger.create(options)`  | 创建日志实例（工厂方法），同时注册插件日志配置 |
| `Logger.unregister(name)` | 注销指定插件的日志配置                         |
| `Logger.destroy()`        | 销毁单例实例，释放所有资源                     |

**实例方法**

| 方法                       | 描述                 |
| -------------------------- | -------------------- |
| `createPluginLogger(name)` | 创建插件日志代理对象 |

**PluginLogger 方法**：`success`、`info`、`warn`、`error`，均支持可选附加数据参数。

---

### Validator

链式配置验证器，确保参数类型正确。

```typescript
import { Validator } from '@meng-xi/vite-plugin/common'
```

| 方法              | 描述                                                  |
| ----------------- | ----------------------------------------------------- |
| `field(name)`     | 指定验证字段                                          |
| `required()`      | 标记为必填                                            |
| `string()`        | 验证为字符串                                          |
| `boolean()`       | 验证为布尔值                                          |
| `number()`        | 验证为数字                                            |
| `array()`         | 验证为数组                                            |
| `object()`        | 验证为对象                                            |
| `default(value)`  | 设置默认值（仅当字段为 `undefined` 或 `null` 时生效） |
| `custom(fn, msg)` | 自定义验证规则                                        |
| `validate()`      | 执行验证，失败时抛出包含所有错误信息的异常            |

---

### 通用配置

所有插件都继承自 BasePlugin，支持以下通用配置项：

```typescript
interface BasePluginOptions {
	/** 是否启用插件，默认 true */
	enabled?: boolean
	/** 是否输出详细日志，默认 true */
	verbose?: boolean
	/** 错误处理策略，默认 'throw' */
	errorStrategy?: 'throw' | 'log' | 'ignore'
}
```

**错误处理策略**

| 策略              | 行为                         |
| ----------------- | ---------------------------- |
| `'throw'`（默认） | 记录错误并抛出异常，中断构建 |
| `'log'`           | 记录错误但不抛出，继续执行   |
| `'ignore'`        | 记录错误但不抛出，继续执行   |

---

### 子路径导出

支持按需导入模块和类型定义：

```typescript
// 插件（主入口）
import { buildProgress, copyFile, generateRouter, generateVersion, injectIco, injectLoading } from '@meng-xi/vite-plugin'

// 插件类型
import type { BuildProgressOptions, CopyFileOptions, GenerateRouterOptions, GenerateVersionOptions, InjectIcoOptions, InjectLoadingOptions, Icon } from '@meng-xi/vite-plugin/plugins'

// 插件开发框架
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions, PluginFactory, PluginWithInstance, OptionsNormalizer } from '@meng-xi/vite-plugin/factory'

// 日志管理
import { Logger } from '@meng-xi/vite-plugin/logger'
import type { PluginLogger, LoggerOptions } from '@meng-xi/vite-plugin/logger'

// 通用工具
import { Validator, readFileContent, writeFileContent } from '@meng-xi/vite-plugin/common'
import type { CopyOptions, CopyResult, DateFormatOptions } from '@meng-xi/vite-plugin/common'
```

---

## 更新日志

查看 [GitHub Releases](https://github.com/MengXi-Studio/vite-plugin/releases)

## 贡献指南

1. Fork 本项目
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交变更：`git commit -m "feat: your feature description"`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

## License

[MIT](LICENSE)
