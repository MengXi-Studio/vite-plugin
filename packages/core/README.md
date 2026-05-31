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

- **开箱即用** - 提供 9 个实用插件，覆盖构建进度展示、构建产物压缩、文件复制、路由生成、版本管理、版本更新检查、HTML 注入、图标注入、全局 Loading 状态管理等常见场景
- **插件开发框架** - 导出 BasePlugin、Logger、Validator 等核心组件，快速构建符合规范的自定义 Vite 插件
- **完整生命周期** - 支持初始化、配置解析、销毁等生命周期管理，自动组合钩子逻辑
- **类型安全** - 完整的 TypeScript 类型定义，配置验证器确保参数正确性
- **灵活配置** - 所有插件支持详细配置，满足多样化场景需求
- **安全执行** - 内置错误处理策略（throw / log / ignore），统一异常管理
- **按需导入** - 支持子路径导出，减少打包体积

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
import { buildProgress, compressAssets, copyFile, generateRouter, generateVersion, versionUpdateChecker, htmlInject, faviconManager, loadingManager } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		buildProgress(),
		compressAssets({ algorithm: 'gzip' }),
		copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' }),
		generateRouter({ pagesJsonPath: 'src/pages.json', outputPath: 'src/router.config.ts' }),
		generateVersion({ format: 'datetime', outputType: 'both' }),
		versionUpdateChecker(),
		htmlInject({
			rules: [{ id: 'meta-description', content: '<meta name="description" content="My App">', position: 'head-end' }]
		}),
		faviconManager('/assets'),
		loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
	]
})
```

### 访问插件实例

所有内置插件返回的对象包含 `pluginInstance` 属性，可访问插件内部状态：

```typescript
import type { PluginWithInstance } from '@meng-xi/vite-plugin/factory'
import type { GenerateRouterOptions } from '@meng-xi/vite-plugin'

const routerPlugin = generateRouter({ watch: true }) as PluginWithInstance<GenerateRouterOptions>
console.log(routerPlugin.pluginInstance?.options)
```

## 内置插件

| 插件                 | 说明                                                            |
| -------------------- | --------------------------------------------------------------- |
| buildProgress        | 终端实时构建进度条，支持 bar / spinner / minimal                |
| compressAssets       | 构建产物压缩，支持 gzip / brotli / both，并发压缩和统计报告     |
| copyFile             | 构建完成后复制文件或目录，支持增量复制                          |
| generateRouter       | 根据 pages.json 自动生成路由配置（uni-app）                     |
| generateVersion      | 自动生成版本号，支持文件输出和全局变量注入                      |
| versionUpdateChecker | 运行时版本更新检查，支持多种提示样式和自定义回调                |
| htmlInject           | HTML 内容注入，支持多种位置、条件注入、模板变量替换和安全过滤   |
| faviconManager       | 管理网站图标（favicon）链接注入到 HTML 文件，支持字符串简写配置 |
| loadingManager       | 全局 Loading 状态管理，支持请求拦截和白屏 Loading               |

---

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
buildProgress()
buildProgress({ format: 'spinner' })
buildProgress({ format: 'minimal' })
buildProgress({ width: 40, completeChar: '■', incompleteChar: '□', clearOnComplete: false })
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

---

### compressAssets

在 Vite 构建完成后自动压缩输出目录中的文件，支持 gzip 和 brotli 两种压缩算法。

| 选项               | 类型                               | 默认值                                                      | 描述                           |
| ------------------ | ---------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| algorithm          | `'gzip'` \| `'brotli'` \| `'both'` | `'gzip'`                                                    | 压缩算法                       |
| threshold          | `number`                           | `1024`                                                      | 最小压缩阈值（字节）           |
| deleteOriginalFile | `boolean`                          | `false`                                                     | 压缩后是否删除原始文件         |
| includeExtensions  | `string[]`                         | `['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt']` | 需要压缩的文件扩展名           |
| excludeExtensions  | `string[]`                         | `[]`                                                        | 需要排除的文件扩展名           |
| excludePaths       | `string[]`                         | `[]`                                                        | 需要排除的路径前缀             |
| compressionLevel   | `number`                           | `9`                                                         | gzip 压缩级别（1-9）           |
| brotliQuality      | `number`                           | `11`                                                        | brotli 压缩质量（1-11）        |
| reportOutput       | `string` \| `false`                | `'compress-report.json'`                                    | 压缩报告输出路径，false 不生成 |
| parallelLimit      | `number`                           | `10`                                                        | 并发压缩最大文件数             |

```typescript
compressAssets()
compressAssets({ algorithm: 'brotli' })
compressAssets({ algorithm: 'both', threshold: 2048, compressionLevel: 9, brotliQuality: 11 })
compressAssets({ deleteOriginalFile: true, reportOutput: 'compress-report.json' })
compressAssets({ includeExtensions: ['.js', '.css'], excludePaths: ['assets/images'], parallelLimit: 5 })
```

---

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
copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' })
copyFile({ sourceDir: 'src/static', targetDir: 'dist/static', overwrite: false, incremental: false })
```

---

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

> 默认 `metaMapping` 为 `{ navigationBarTitleText: 'title', requireAuth: 'requireAuth' }`。当 `nameStrategy` 为 `'custom'` 时，必须提供 `customNameGenerator`。

```typescript
generateRouter()
generateRouter({ pagesJsonPath: 'pages.json' })
generateRouter({ outputFormat: 'js', outputPath: 'src/router.config.js' })
generateRouter({ nameStrategy: 'pascalCase' })
generateRouter({ nameStrategy: 'custom', customNameGenerator: path => `route_${path.replace(/\//g, '_')}` })
generateRouter({ metaMapping: { navigationBarTitleText: 'title', requireAuth: 'requireAuth', customField: 'custom' } })
```

---

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

| 占位符        | 说明                        | 示例            |
| ------------- | --------------------------- | --------------- |
| `{YYYY}`      | 四位年份                    | `2026`          |
| `{YY}`        | 两位年份                    | `26`            |
| `{MM}`        | 两位月份                    | `05`            |
| `{DD}`        | 两位日期                    | `22`            |
| `{HH}`        | 两位小时（24h）             | `15`            |
| `{mm}`        | 两位分钟                    | `30`            |
| `{ss}`        | 两位秒数                    | `00`            |
| `{SSS}`       | 三位毫秒                    | `123`           |
| `{timestamp}` | 时间戳（毫秒）              | `1779464601000` |
| `{hash}`      | 随机哈希                    | `a1b2c3d4`      |
| `{major}`     | 主版本号（需 semverBase）   | `1`             |
| `{minor}`     | 次版本号（需 semverBase）   | `0`             |
| `{patch}`     | 补丁版本号（需 semverBase） | `0`             |

> 当 `format` 为 `'custom'` 时，必须提供 `customFormat`。当 `outputType` 为 `'define'` 或 `'both'` 时，同时注入 `{defineName}_INFO` 全局变量，包含版本号、构建时间、时间戳等完整信息。

```typescript
generateVersion()
generateVersion({ format: 'date' })
generateVersion({ format: 'semver', semverBase: '2.0.0', prefix: 'v' })
generateVersion({ format: 'custom', customFormat: '{YYYY}.{MM}.{DD}-{hash}', hashLength: 6 })
generateVersion({ outputType: 'define', defineName: '__VERSION__' })
generateVersion({ outputType: 'both', outputFile: 'build-info.json', defineName: '__BUILD_VERSION__', extra: { environment: 'production' } })
```

---

### versionUpdateChecker

在运行时定期检查版本号变更，发现新版本时提示用户刷新页面。通常与 `generateVersion` 插件配合使用。

**工作原理：**

1. `generateVersion` 在构建时生成版本号文件（`version.json`）或注入全局变量
2. `versionUpdateChecker` 在运行时定期请求版本文件，与当前版本对比
3. 发现版本不一致时，弹出提示引导用户刷新

| 选项                    | 类型                                 | 默认值                                     | 描述                                 |
| ----------------------- | ------------------------------------ | ------------------------------------------ | ------------------------------------ |
| versionSource           | `'define'` \| `'file'` \| `'auto'`   | `'auto'`                                   | 当前版本号来源                       |
| defineName              | `string`                             | `'__APP_VERSION__'`                        | define 模式下的全局变量名            |
| checkUrl                | `string`                             | `'/version.json'`                          | 版本检查文件的 URL 路径              |
| checkInterval           | `number`                             | `300000`                                   | 检查间隔时间（毫秒，默认 5 分钟）    |
| checkOnVisibilityChange | `boolean`                            | `true`                                     | 页面可见性变化时是否立即检查         |
| enableInDev             | `boolean`                            | `false`                                    | 是否在开发模式下启用                 |
| promptStyle             | `'modal'` \| `'banner'` \| `'toast'` | `'modal'`                                  | 更新提示 UI 样式                     |
| promptMessage           | `string`                             | `'发现新版本，是否立即刷新获取最新内容？'` | 提示消息文本                         |
| refreshButtonText       | `string`                             | `'立即刷新'`                               | 刷新按钮文本                         |
| dismissButtonText       | `string`                             | `'稍后再说'`                               | 忽略按钮文本                         |
| customPromptTemplate    | `string`                             | -                                          | 自定义提示 UI 的 HTML 模板           |
| customStyle             | `string`                             | -                                          | 自定义 CSS 样式字符串                |
| onUpdateAvailable       | `string`                             | -                                          | 发现新版本时的回调（函数体字符串）   |
| onRefresh               | `string`                             | -                                          | 用户选择刷新时的回调（函数体字符串） |
| onDismiss               | `string`                             | -                                          | 用户选择忽略时的回调（函数体字符串） |

> `versionSource` 说明：`'define'` 从全局变量读取，`'file'` 从版本文件读取，`'auto'` 优先使用 define，回退到 file。自定义模板中可使用
> `{{message}}`、`{{currentVersion}}`、`{{newVersion}}`、`{{refreshButton}}`、`{{dismissButton}}` 占位符。回调以函数体字符串形式提供，可用变量：`currentVersion`、`newVersion`。

```typescript
generateVersion({ outputType: 'both' })
versionUpdateChecker()
versionUpdateChecker({ versionSource: 'file' })
versionUpdateChecker({ checkInterval: 60000, promptStyle: 'banner' })
versionUpdateChecker({ promptStyle: 'toast' })
versionUpdateChecker({ promptMessage: '系统已更新，建议刷新体验新功能', refreshButtonText: '更新', dismissButtonText: '取消' })
versionUpdateChecker({ onUpdateAvailable: 'console.log("新版本:", newVersion); return true;', onRefresh: 'console.log("用户选择刷新");', onDismiss: 'console.log("用户选择忽略");' })
versionUpdateChecker({ enableInDev: true })
```

---

### htmlInject

在 Vite 构建过程中根据配置规则将 HTML 内容注入到目标文件中，支持多种注入位置、条件注入、模板变量替换和安全过滤。

**注入位置：**

| 位置               | 说明                       |
| ------------------ | -------------------------- |
| `head-start`       | 注入到 `<head>` 标签开始后 |
| `head-end`         | 注入到 `</head>` 标签前    |
| `body-start`       | 注入到 `<body>` 标签开始后 |
| `body-end`         | 注入到 `</body>` 标签前    |
| `before-selector`  | 注入到选择器匹配内容前     |
| `after-selector`   | 注入到选择器匹配内容后     |
| `replace-selector` | 替换选择器匹配的内容       |

| 选项         | 类型                     | 默认值         | 描述                       |
| ------------ | ------------------------ | -------------- | -------------------------- |
| targetFile   | `string`                 | `'index.html'` | 目标 HTML 文件路径或文件名 |
| rules        | `InjectRule[]`           | -              | 注入规则数组（必填）       |
| security     | `SecurityConfig`         | -              | 安全过滤配置               |
| templateVars | `Record<string, string>` | -              | 全局模板变量               |
| logInjection | `boolean`                | `true`         | 是否输出注入日志           |

**InjectRule**

| 属性                 | 类型                     | 默认值     | 描述                              |
| -------------------- | ------------------------ | ---------- | --------------------------------- |
| id                   | `string`                 | -          | 规则唯一标识符                    |
| content              | `string`                 | -          | 要注入的 HTML 内容                |
| position             | `InjectPosition`         | -          | 注入位置                          |
| selector             | `string`                 | -          | 选择器（selector 相关位置时必填） |
| selectorMatch        | `'string'` \| `'regex'`  | `'string'` | 选择器匹配模式                    |
| priority             | `number`                 | `100`      | 规则优先级，数值越小越先执行      |
| condition            | `InjectCondition`        | -          | 注入条件                          |
| templateVars         | `Record<string, string>` | -          | 规则级模板变量，覆盖全局变量      |
| allowScriptInjection | `boolean`                | `false`    | 是否允许注入脚本等危险内容        |

**SecurityConfig**

| 属性                     | 类型       | 默认值 | 描述                 |
| ------------------------ | ---------- | ------ | -------------------- |
| blockDangerousTags       | `boolean`  | `true` | 阻止危险标签         |
| blockDangerousAttributes | `boolean`  | `true` | 阻止危险属性         |
| allowedTags              | `string[]` | -      | 允许通过的标签白名单 |
| blockedTags              | `string[]` | -      | 自定义阻止标签列表   |
| blockedAttributes        | `string[]` | -      | 自定义阻止属性列表   |

```typescript
htmlInject({
	rules: [
		{ id: 'meta-description', content: '<meta name="description" content="{{appName}}">', position: 'head-end', templateVars: { appName: 'My Application' } },
		{ id: 'analytics', content: '<script src="/analytics.js"></script>', position: 'body-end', condition: { type: 'env', value: 'PRODUCTION' }, allowScriptInjection: true }
	]
})
```

---

### faviconManager

管理网站图标（favicon）链接注入到 HTML 文件，支持字符串简写配置和图标文件复制。

| 选项        | 类型     | 默认值 | 描述                                     |
| ----------- | -------- | ------ | ---------------------------------------- |
| base        | `string` | `'/'`  | 图标文件基础路径                         |
| url         | `string` | -      | 图标完整 URL，优先于 base                |
| link        | `string` | -      | 自定义完整 link 标签 HTML，优先级最高    |
| icons       | `Icon[]` | -      | 自定义图标数组，支持多种格式和尺寸       |
| copyOptions | `object` | -      | 图标文件复制配置（sourceDir, targetDir） |

**Icon**

| 属性  | 类型     | 描述           |
| ----- | -------- | -------------- |
| rel   | `string` | 图标关系类型   |
| href  | `string` | 图标 URL       |
| sizes | `string` | 图标尺寸       |
| type  | `string` | 图标 MIME 类型 |

```typescript
faviconManager()
faviconManager('/assets')
faviconManager({
	base: '/assets',
	icons: [
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
	]
})
faviconManager({ link: '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />' })
faviconManager({ base: '/assets', copyOptions: { sourceDir: 'src/assets/icons', targetDir: 'dist/assets/icons' } })
```

---

### loadingManager

全局 Loading 状态管理，支持请求拦截和白屏 Loading。

| 选项           | 类型                                            | 默认值                  | 描述                     |
| -------------- | ----------------------------------------------- | ----------------------- | ------------------------ |
| position       | `'center'` \| `'top'` \| `'bottom'`             | `'center'`              | Loading 显示位置         |
| defaultText    | `string`                                        | `'加载中...'`           | 默认显示文本             |
| spinnerType    | `'spinner'` \| `'dots'` \| `'pulse'` \| `'bar'` | `'spinner'`             | 旋转图标类型             |
| autoBind       | `'fetch'` \| `'xhr'` \| `'all'` \| `'none'`     | `'none'`                | 自动绑定请求拦截模式     |
| globalName     | `string`                                        | `'__LOADING_MANAGER__'` | 注入到浏览器的全局变量名 |
| defaultVisible | `boolean`                                       | `false`                 | Loading DOM 初始可见状态 |
| autoHideOn     | `'DOMContentLoaded'` \| `'load'` \| `'manual'`  | `'DOMContentLoaded'`    | 自动隐藏时机             |
| style          | `LoadingStyle`                                  | -                       | 自定义样式配置           |
| transition     | `TransitionConfig`                              | -                       | 过渡动画配置             |
| minDisplayTime | `MinDisplayTime`                                | -                       | 最小显示时间配置         |
| delayShow      | `DelayShow`                                     | -                       | 延迟显示配置             |
| debounceHide   | `DebounceHide`                                  | -                       | 防抖隐藏配置             |
| requestFilter  | `RequestFilter`                                 | -                       | 请求过滤配置             |
| customTemplate | `string`                                        | -                       | 自定义 HTML 模板         |
| callbacks      | `LoadingCallbacks`                              | -                       | 生命周期回调             |

**LoadingStyle**

| 属性               | 类型      | 默认值                    | 描述                   |
| ------------------ | --------- | ------------------------- | ---------------------- |
| overlayColor       | `string`  | `'rgba(255,255,255,0.7)'` | 遮罩层背景色           |
| spinnerColor       | `string`  | `'#4361ee'`               | 图标颜色               |
| spinnerSize        | `string`  | `'40px'`                  | 图标大小               |
| textColor          | `string`  | `'#333'`                  | 文本颜色               |
| textSize           | `string`  | `'14px'`                  | 文本大小               |
| zIndex             | `number`  | `9999`                    | z-index 值             |
| pointerEvents      | `boolean` | `true`                    | 是否启用遮罩层指针事件 |
| backdropBlur       | `boolean` | `false`                   | 是否启用背景模糊       |
| backdropBlurAmount | `number`  | `4`                       | 背景模糊程度（px）     |
| customClass        | `string`  | -                         | 自定义 CSS 类名        |
| customStyle        | `string`  | -                         | 自定义内联样式字符串   |

**运行时 API：**

```typescript
window.__LOADING_MANAGER__.show('加载中...')
window.__LOADING_MANAGER__.hide()
window.__LOADING_MANAGER__.forceHide()
window.__LOADING_MANAGER__.toggle()
window.__LOADING_MANAGER__.updateText('正在处理...')
window.__LOADING_MANAGER__.isVisible()
window.__LOADING_MANAGER__.getPendingCount()
window.__LOADING_MANAGER__.destroy()
window.__LOADING_MANAGER__.enablePointerEvents()
window.__LOADING_MANAGER__.disablePointerEvents()
window.__LOADING_MANAGER__.togglePointerEvents()
window.__LOADING_MANAGER__.isPointerEventsEnabled()
```

```typescript
loadingManager()
loadingManager({ position: 'top', defaultText: '请稍候...' })
loadingManager({ spinnerType: 'dots' })
loadingManager({ autoBind: 'fetch', requestFilter: { excludeUrls: [/\/api\/health/], excludeUrlPrefixes: ['http://localhost'] } })
loadingManager({ style: { overlayColor: 'rgba(0,0,0,0.5)', spinnerColor: '#ff6b6b', backdropBlur: true, backdropBlurAmount: 6 } })
loadingManager({ transition: { enabled: true, duration: 300, easing: 'cubic-bezier(0.4,0,0.2,1)' } })
loadingManager({ debounceHide: { enabled: true, duration: 100 } })
loadingManager({ callbacks: { onShow: 'console.log("loading shown")', onBeforeShow: 'return true', onHide: 'console.log("loading hidden")' } })
loadingManager({ customTemplate: '<div class="my-loader"><span data-loading-text></span></div>' })
loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
loadingManager({ defaultVisible: true, autoHideOn: 'manual' })
```

---

## 插件开发框架

### BasePlugin

所有内置插件的基类，提供配置管理、日志记录、生命周期管理和安全执行等核心功能。

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { Plugin } from 'vite'

interface MyPluginOptions {
	enabled?: boolean
	message?: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getPluginName() {
		return 'my-plugin'
	}
	protected getDefaultOptions() {
		return { enabled: true, message: 'Hello' }
	}
	protected validateOptions() {
		this.validator.field('message').string().validate()
	}
	protected addPluginHooks(plugin: Plugin) {
		plugin.buildStart = () => {
			this.logger.info(this.options.message)
		}
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

### 核心组件

| 组件                  | 导出路径                       | 描述                   |
| --------------------- | ------------------------------ | ---------------------- |
| `BasePlugin`          | `@meng-xi/vite-plugin/factory` | 插件基类               |
| `createPluginFactory` | `@meng-xi/vite-plugin/factory` | 插件工厂函数创建器     |
| `PluginWithInstance`  | `@meng-xi/vite-plugin/factory` | 带实例引用的插件类型   |
| `Logger`              | `@meng-xi/vite-plugin/logger`  | 日志管理器（单例模式） |
| `Validator`           | `@meng-xi/vite-plugin/common`  | 流畅 API 配置验证器    |

### 通用工具库

| 模块       | 导出路径                                 | 描述                                               |
| ---------- | ---------------------------------------- | -------------------------------------------------- |
| format     | `@meng-xi/vite-plugin/common/format`     | 日期格式化、命名转换、模板解析、HTML 转义          |
| fs         | `@meng-xi/vite-plugin/common/fs`         | 文件复制、目录遍历、并发控制                       |
| html       | `@meng-xi/vite-plugin/common/html`       | HTML 注入（injectBeforeTag, injectHeadAndBody 等） |
| object     | `@meng-xi/vite-plugin/common/object`     | 深度合并对象                                       |
| script     | `@meng-xi/vite-plugin/common/script`     | 回调包装、script 标签检测、标识符验证              |
| validation | `@meng-xi/vite-plugin/common/validation` | 全局名校验、XSS 防护、枚举验证等                   |

---

## 子路径导出

支持按需导入以减少打包体积：

```typescript
import { buildProgress, copyFile, htmlInject, loadingManager, BasePlugin, Logger } from '@meng-xi/vite-plugin'

import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import { Logger } from '@meng-xi/vite-plugin/logger'
import { buildProgress, compressAssets, copyFile, generateRouter, generateVersion, versionUpdateChecker, htmlInject, faviconManager, loadingManager } from '@meng-xi/vite-plugin/plugins'
import { Validator, readFileContent, writeFileContent, injectHeadAndBody, deepMerge } from '@meng-xi/vite-plugin/common'

import type { PluginWithInstance, PluginFactory, BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { BuildProgressOptions, CompressAssetsOptions, GenerateVersionOptions, VersionUpdateCheckerOptions, HtmlInjectOptions, FaviconManagerOptions, LoadingManagerOptions } from '@meng-xi/vite-plugin/plugins'
import type { DateFormatOptions } from '@meng-xi/vite-plugin/common/format'
import type { HtmlInjectResult, DualInjectResult } from '@meng-xi/vite-plugin/common/html'
import type { CopyOptions, CopyResult } from '@meng-xi/vite-plugin/common/fs'
```

**所有可用子路径：**

```
@meng-xi/vite-plugin
@meng-xi/vite-plugin/factory
@meng-xi/vite-plugin/logger
@meng-xi/vite-plugin/plugins
@meng-xi/vite-plugin/plugins/build-progress
@meng-xi/vite-plugin/plugins/compress-assets
@meng-xi/vite-plugin/plugins/copy-file
@meng-xi/vite-plugin/plugins/favicon-manager
@meng-xi/vite-plugin/plugins/generate-router
@meng-xi/vite-plugin/plugins/generate-version
@meng-xi/vite-plugin/plugins/html-inject
@meng-xi/vite-plugin/plugins/loading-manager
@meng-xi/vite-plugin/plugins/version-update-checker
@meng-xi/vite-plugin/common
@meng-xi/vite-plugin/common/format
@meng-xi/vite-plugin/common/fs
@meng-xi/vite-plugin/common/html
@meng-xi/vite-plugin/common/object
@meng-xi/vite-plugin/common/script
@meng-xi/vite-plugin/common/validation
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
