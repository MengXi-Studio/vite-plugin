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

- **开箱即用** - 提供 6 个实用插件，覆盖构建进度展示、文件复制、路由生成、版本管理、图标注入、全局 Loading 状态管理等常见场景
- **插件开发框架** - 导出 BasePlugin、Logger、Validator 等核心组件，快速构建符合规范的自定义 Vite 插件
- **完整生命周期** - 支持初始化、配置解析、销毁等生命周期管理，自动组合钩子逻辑
- **类型安全** - 完整的 TypeScript 类型定义，配置验证器确保参数正确性
- **灵活配置** - 所有插件支持详细配置，满足多样化场景需求
- **安全执行** - 内置错误处理策略（throw / log / ignore），统一异常管理

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
			autoHideOn: 'DOMContentLoaded'
		})
	]
})
```

### 访问插件实例

所有内置插件返回的对象包含 `pluginInstance` 属性，可访问插件内部状态：

```typescript
import type { PluginWithInstance } from '@meng-xi/vite-plugin/factory'
import type { GenerateRouterOptions } from '@meng-xi/vite-plugin'

const routerPlugin = generateRouter({ watch: true }) as PluginWithInstance<GenerateRouterOptions>

// 通过 pluginInstance 访问插件内部
console.log(routerPlugin.pluginInstance?.options)
```

### 开发自定义插件

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin'
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
		// 自定义清理逻辑，如关闭连接、停止监听等
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
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
const result = await this.safeExecute(async () => {
	return await someAsyncOperation()
}, '执行异步操作')
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

### Logger

全局单例日志管理器，为每个插件提供独立的日志控制：

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'

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

## 内置插件

| 插件            | 说明                                                  |
| --------------- | ----------------------------------------------------- |
| buildProgress   | 终端实时构建进度条，支持 bar / spinner / minimal      |
| copyFile        | 构建完成后复制文件或目录，支持增量复制                |
| generateRouter  | 根据 pages.json 自动生成路由配置（uni-app）           |
| generateVersion | 自动生成版本号，支持文件输出和全局变量注入            |
| injectIco       | 将网站图标链接注入到 HTML 文件                        |
| injectLoading   | 注入全局 Loading 状态管理，支持请求拦截和白屏 Loading |

### buildProgress

在终端实时显示 Vite 构建进度条，支持三种显示格式。

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
```

### copyFile

在 Vite 构建完成后复制文件或目录到指定位置。

| 选项        | 类型      | 默认值 | 描述                 |
| ----------- | --------- | ------ | -------------------- |
| sourceDir   | `string`  | -      | 源目录路径（必填）   |
| targetDir   | `string`  | -      | 目标目录路径（必填） |
| overwrite   | `boolean` | `true` | 是否覆盖现有文件     |
| recursive   | `boolean` | `true` | 是否递归复制子目录   |
| incremental | `boolean` | `true` | 是否启用增量复制     |

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

### injectIco

在 Vite 构建过程中将网站图标链接注入到 HTML 文件的 head 中。

| 选项        | 类型     | 默认值 | 描述                        |
| ----------- | -------- | ------ | --------------------------- |
| base        | `string` | `'/'`  | 图标文件的基础路径          |
| url         | `string` | -      | 图标的完整 URL              |
| link        | `string` | -      | 自定义完整的 link 标签 HTML |
| icons       | `Icon[]` | -      | 自定义图标数组              |
| copyOptions | `object` | -      | 图标文件复制配置            |

`Icon` 接口定义：

| 属性  | 类型     | 必填 | 描述           |
| ----- | -------- | ---- | -------------- |
| rel   | `string` | 是   | 图标关系类型   |
| href  | `string` | 是   | 图标 URL       |
| sizes | `string` | 否   | 图标尺寸       |
| type  | `string` | 否   | 图标 MIME 类型 |

`copyOptions` 接口定义：

| 属性      | 类型      | 必填 | 默认值 | 描述             |
| --------- | --------- | ---- | ------ | ---------------- |
| sourceDir | `string`  | 是   | -      | 图标源文件目录   |
| targetDir | `string`  | 是   | -      | 图标目标目录     |
| overwrite | `boolean` | 否   | `true` | 是否覆盖同名文件 |
| recursive | `boolean` | 否   | `true` | 是否递归复制     |

### injectLoading

注入全局 Loading 状态管理，支持 XHR/Fetch 请求拦截、白屏 Loading、自定义样式和生命周期回调。

| 选项           | 类型                                            | 默认值                  | 描述                                         |
| -------------- | ----------------------------------------------- | ----------------------- | -------------------------------------------- |
| position       | `'center'` \| `'top'` \| `'bottom'`             | `'center'`              | Loading 显示位置                             |
| defaultText    | `string`                                        | `'加载中...'`           | 默认显示文本                                 |
| spinnerType    | `'spinner'` \| `'dots'` \| `'pulse'` \| `'bar'` | `'spinner'`             | 旋转图标类型                                 |
| style          | `LoadingStyle`                                  | -                       | 自定义样式配置                               |
| transition     | `TransitionConfig`                              | `{ enabled: true }`     | 过渡动画配置                                 |
| minDisplayTime | `MinDisplayTime`                                | `{ enabled: true }`     | 最小显示时间配置                             |
| delayShow      | `DelayShow`                                     | `{ enabled: true }`     | 延迟显示配置                                 |
| debounceHide   | `DebounceHide`                                  | `{ enabled: false }`    | 防抖隐藏配置                                 |
| autoBind       | `'fetch'` \| `'xhr'` \| `'all'` \| `'none'`     | `'none'`                | 自动绑定请求拦截模式                         |
| requestFilter  | `RequestFilter`                                 | -                       | 请求过滤配置                                 |
| globalName     | `string`                                        | `'__LOADING_MANAGER__'` | 注入到浏览器的全局变量名                     |
| customTemplate | `string`                                        | -                       | 自定义 HTML 模板（需含 `data-loading-text`） |
| defaultVisible | `boolean`                                       | `false`                 | 初始是否可见（白屏 Loading）                 |
| autoHideOn     | `'DOMContentLoaded'` \| `'load'` \| `'manual'`  | `'DOMContentLoaded'`    | 自动隐藏时机（需 `defaultVisible: true`）    |
| callbacks      | `LoadingCallbacks`                              | -                       | 生命周期回调                                 |

**LoadingStyle**

| 属性               | 类型      | 默认值                    | 描述                   |
| ------------------ | --------- | ------------------------- | ---------------------- |
| overlayColor       | `string`  | `'rgba(255,255,255,0.7)'` | 遮罩层背景色           |
| spinnerColor       | `string`  | `'#4361ee'`               | 图标颜色               |
| spinnerSize        | `string`  | `'40px'`                  | 图标大小               |
| textColor          | `string`  | `'#333'`                  | 文本颜色               |
| textSize           | `string`  | `'14px'`                  | 文本大小               |
| customClass        | `string`  | -                         | 自定义 CSS 类名        |
| customStyle        | `string`  | -                         | 自定义内联样式         |
| zIndex             | `number`  | `9999`                    | z-index 值             |
| pointerEvents      | `boolean` | `true`                    | 是否启用遮罩层指针事件 |
| backdropBlur       | `boolean` | `false`                   | 是否启用背景模糊       |
| backdropBlurAmount | `number`  | `4`                       | 背景模糊程度（px）     |

**TransitionConfig**

| 属性     | 类型      | 默认值       | 描述             |
| -------- | --------- | ------------ | ---------------- |
| enabled  | `boolean` | `true`       | 是否启用过渡     |
| duration | `number`  | `200`        | 过渡持续时间(ms) |
| easing   | `string`  | `'ease-out'` | 缓动函数         |

**MinDisplayTime**

| 属性     | 类型      | 默认值 | 描述             |
| -------- | --------- | ------ | ---------------- |
| enabled  | `boolean` | `true` | 是否启用         |
| duration | `number`  | `300`  | 最小显示时间(ms) |

**DelayShow**

| 属性     | 类型      | 默认值 | 描述                                     |
| -------- | --------- | ------ | ---------------------------------------- |
| enabled  | `boolean` | `true` | 是否启用                                 |
| duration | `number`  | `200`  | 延迟时间(ms)，请求在此时间内完成则不显示 |

**DebounceHide**

| 属性     | 类型      | 默认值  | 描述             |
| -------- | --------- | ------- | ---------------- |
| enabled  | `boolean` | `false` | 是否启用         |
| duration | `number`  | `100`   | 防抖等待时间(ms) |

**RequestFilter**

| 属性               | 类型       | 描述                                      |
| ------------------ | ---------- | ----------------------------------------- |
| excludeUrls        | `RegExp[]` | 排除的 URL 正则数组                       |
| includeUrls        | `RegExp[]` | 包含的 URL 正则数组（优先级高于 exclude） |
| excludeMethods     | `string[]` | 排除的 HTTP 方法数组                      |
| excludeUrlPrefixes | `string[]` | 排除的 URL 前缀数组（前缀匹配，更高效）   |

**LoadingCallbacks**

回调以**函数体字符串**形式提供（构建时注入到浏览器端，无法传递函数引用）。

| 属性         | 类型     | 描述                              |
| ------------ | -------- | --------------------------------- |
| onBeforeShow | `string` | 显示前回调，`return false` 可阻止 |
| onShow       | `string` | 显示后回调                        |
| onBeforeHide | `string` | 隐藏前回调，`return false` 可阻止 |
| onHide       | `string` | 隐藏后回调                        |
| onDestroy    | `string` | 销毁时回调                        |

**LoadingManager API**

通过 `window.__LOADING_MANAGER__` 访问：

| 方法                | 说明                                     |
| ------------------- | ---------------------------------------- |
| `show(text?)`       | 显示 Loading，可传入文本                 |
| `hide()`            | 隐藏 Loading（受最小显示时间和防抖约束） |
| `forceHide()`       | 强制隐藏，忽略最小显示时间和防抖         |
| `destroy()`         | 销毁实例，恢复原始拦截器                 |
| `updateText(t)`     | 更新文本内容                             |
| `isVisible()`       | 获取当前是否显示                         |
| `getPendingCount()` | 获取当前挂起的请求数量                   |

```typescript
// 白屏 Loading：页面加载即显示，DOM 就绪后自动隐藏
injectLoading({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })

// 自动拦截所有请求
injectLoading({ autoBind: 'all' })

// 自定义样式 + 请求过滤
injectLoading({
	style: { overlayColor: 'rgba(0,0,0,0.5)', spinnerColor: '#fff' },
	autoBind: 'fetch',
	requestFilter: { excludeUrls: [/\/api\/health/] }
})

// 手动控制
injectLoading()
window.__LOADING_MANAGER__.show('正在保存...')
window.__LOADING_MANAGER__.hide()
```

## 子路径导出

支持按需导入模块，减少打包体积：

```typescript
// 完整导入
import { buildProgress, copyFile, injectLoading, BasePlugin, Logger } from '@meng-xi/vite-plugin'

// 按模块导入
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import { Logger } from '@meng-xi/vite-plugin/logger'
import { buildProgress, copyFile, generateRouter, injectLoading } from '@meng-xi/vite-plugin/plugins'
import { Validator, readFileContent, writeFileContent } from '@meng-xi/vite-plugin/common'

// 类型导入（从子路径按需导入类型定义）
import type { PluginWithInstance, PluginFactory, BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { BuildProgressOptions, GenerateVersionOptions, InjectIcoOptions, InjectLoadingOptions, Icon } from '@meng-xi/vite-plugin/plugins'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common'
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
