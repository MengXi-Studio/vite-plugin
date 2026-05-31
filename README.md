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

- **开箱即用** - 提供 10 个实用插件，覆盖构建进度展示、构建产物分析与压缩、文件复制、路由生成、版本管理、版本更新检查、HTML 注入、图标注入、全局 Loading 状态管理等常见场景
- **插件开发框架** - 导出 BasePlugin、Logger、Validator 等核心组件，快速构建符合规范的自定义 Vite 插件
- **通用工具库** - 内置 Common 工具模块，提供格式化、文件系统、压缩、路径处理、HTML 注入、对象操作、脚本生成、参数验证等可复用工具函数
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
import { buildProgress, bundleAnalyzer, compressAssets, copyFile, generateRouter, generateVersion, versionUpdateChecker, htmlInject, faviconManager, loadingManager } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		buildProgress(),
		bundleAnalyzer({ outputFormat: 'both', sizeThreshold: 200 }),
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

| 插件                 | 说明                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| buildProgress        | 终端实时构建进度条，支持 bar / spinner / minimal                      |
| bundleAnalyzer       | 构建产物体积分析，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比  |
| compressAssets       | 构建产物压缩，支持 gzip / brotli / both，并发压缩和统计报告           |
| copyFile             | 构建完成后复制文件或目录，支持增量复制                                |
| generateRouter       | 根据 pages.json 自动生成路由配置（uni-app）                           |
| generateVersion      | 自动生成版本号，支持文件输出和全局变量注入                            |
| versionUpdateChecker | 运行时版本更新检查，支持多种提示样式和自定义回调                      |
| htmlInject           | HTML 内容注入，支持多种位置、选择器定位、条件注入、模板变量和安全过滤 |
| faviconManager       | 管理网站图标链接注入和文件复制，支持字符串简写配置                    |
| loadingManager       | 全局 Loading 状态管理，支持请求拦截、防抖、过渡动画和白屏 Loading     |

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

### bundleAnalyzer

在 Vite 构建完成后自动分析输出目录中的构建产物，生成体积统计、模块排行、文件类型分布等关键指标，支持 JSON 报告和 HTML 可视化图表。

**核心功能：**

- 扫描构建输出目录，分析 chunk、模块和资源文件
- 计算原始大小和 gzip 压缩大小
- 按文件类型统计体积分布
- Top N 大模块排行
- 体积阈值告警（超过阈值 2 倍标记为 critical）
- 与上次构建结果对比，生成差异报告
- HTML 报告支持 treemap / sunburst / list 三种可视化图表

| 选项               | 类型                                    | 默认值              | 描述                                     |
| ------------------ | --------------------------------------- | ------------------- | ---------------------------------------- |
| outputFormat       | `'json'` \| `'html'` \| `'both'`        | `'json'`            | 报告输出格式                             |
| outputFile         | `string`                                | `'bundle-analysis'` | 报告输出文件名（不含扩展名）             |
| openAnalyzer       | `boolean`                               | `false`             | 是否在生成 HTML 报告后自动打开浏览器     |
| sizeThreshold      | `number`                                | `100`               | 体积告警阈值（KB）                       |
| topModules         | `number`                                | `20`                | Top N 大模块排行数量                     |
| gzipSize           | `boolean`                               | `true`              | 是否计算 gzip 大小                       |
| excludeNodeModules | `boolean`                               | `false`             | 是否排除 node_modules 中的模块           |
| excludePatterns    | `string[]`                              | `[]`                | 需要排除的文件路径模式列表               |
| includeExtensions  | `string[]`                              | `[]`                | 需要包含的文件扩展名列表，为空则包含所有 |
| compareWith        | `string` \| `null`                      | `null`              | 用于对比的之前分析报告路径               |
| defaultChartType   | `'treemap'` \| `'sunburst'` \| `'list'` | `'treemap'`         | HTML 报告中图表的默认展示形式            |

```typescript
bundleAnalyzer()
bundleAnalyzer({ outputFormat: 'both', openAnalyzer: true })
bundleAnalyzer({ sizeThreshold: 200, topModules: 30, gzipSize: true })
bundleAnalyzer({ compareWith: 'dist/bundle-analysis.json', defaultChartType: 'sunburst' })
bundleAnalyzer({ excludeNodeModules: true, includeExtensions: ['.js', '.css'] })
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

在 HTML 文件中注入自定义内容，支持多种位置、选择器定位、条件注入、模板变量替换和安全过滤。

| 选项         | 类型                     | 默认值         | 描述                       |
| ------------ | ------------------------ | -------------- | -------------------------- |
| targetFile   | `string`                 | `'index.html'` | 目标 HTML 文件路径或文件名 |
| rules        | `InjectRule[]`           | -              | 注入规则列表（必填）       |
| security     | `SecurityConfig`         | -              | 安全过滤配置               |
| templateVars | `Record<string, string>` | `{}`           | 全局模板变量映射           |
| logInjection | `boolean`                | `true`         | 是否在控制台输出注入日志   |

**InjectRule**

| 属性                 | 类型                                                                                                                                  | 默认值     | 描述                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------- |
| id                   | `string`                                                                                                                              | -          | 规则唯一标识                            |
| content              | `string`                                                                                                                              | -          | 注入内容                                |
| position             | `'head-start'` \| `'head-end'` \| `'body-start'` \| `'body-end'` \| `'before-selector'` \| `'after-selector'` \| `'replace-selector'` | -          | 注入位置                                |
| selector             | `string`                                                                                                                              | -          | 选择器字符串（selector 相关位置时必填） |
| selectorMatch        | `'string'` \| `'regex'`                                                                                                               | `'string'` | 选择器匹配模式                          |
| priority             | `number`                                                                                                                              | `100`      | 规则优先级，数值越小越先执行            |
| condition            | `InjectCondition`                                                                                                                     | -          | 注入条件                                |
| templateVars         | `Record<string, string>`                                                                                                              | -          | 规则级模板变量（覆盖全局 templateVars） |
| allowScriptInjection | `boolean`                                                                                                                             | `false`    | 是否允许注入脚本等危险内容              |

**InjectCondition**

| 属性   | 类型                                       | 默认值  | 描述               |
| ------ | ------------------------------------------ | ------- | ------------------ |
| type   | `'env'` \| `'file-contains'` \| `'custom'` | -       | 条件类型           |
| value  | `string` \| `(...args: any[]) => boolean`  | -       | 条件值             |
| negate | `boolean`                                  | `false` | 是否对条件结果取反 |

**SecurityConfig**

| 属性                     | 类型       | 默认值 | 描述                           |
| ------------------------ | ---------- | ------ | ------------------------------ |
| blockDangerousTags       | `boolean`  | `true` | 是否阻止危险标签（script 等）  |
| blockDangerousAttributes | `boolean`  | `true` | 是否阻止危险属性（onclick 等） |
| allowedTags              | `string[]` | -      | 允许通过的标签白名单           |
| blockedTags              | `string[]` | -      | 自定义阻止标签列表             |
| blockedAttributes        | `string[]` | -      | 自定义阻止属性列表             |

```typescript
htmlInject({
	rules: [
		{ id: 'meta-description', content: '<meta name="description" content="My App">', position: 'head-end' },
		{ id: 'analytics', content: '<script src="https://analytics.example.com/track.js"></script>', position: 'body-end', allowScriptInjection: true },
		{ id: 'env-var', content: '<script>window.__ENV__ = "{{env}}"</script>', position: 'head-end', templateVars: { env: 'production' }, allowScriptInjection: true },
		{ id: 'before-app', content: '<div>Before App</div>', position: 'before-selector', selector: '<div id="app">' },
		{ id: 'prod-only', content: '<meta name="robots" content="noindex">', position: 'head-end', condition: { type: 'env', value: 'PRODUCTION' } }
	]
})
```

---

### faviconManager

管理网站图标链接注入到 HTML 文件，支持图标文件复制，支持字符串简写配置。

| 选项        | 类型          | 默认值 | 描述                                      |
| ----------- | ------------- | ------ | ----------------------------------------- |
| base        | `string`      | `'/'`  | 图标文件的基础路径                        |
| url         | `string`      | -      | 图标完整 URL（优先于 base + favicon.ico） |
| link        | `string`      | -      | 自定义完整 link 标签 HTML（最高优先级）   |
| icons       | `Icon[]`      | -      | 自定义图标数组，支持多种格式和尺寸        |
| copyOptions | `CopyOptions` | -      | 图标文件复制配置                          |

**Icon**

| 属性  | 类型     | 描述           |
| ----- | -------- | -------------- |
| rel   | `string` | 图标关系类型   |
| href  | `string` | 图标 URL       |
| sizes | `string` | 图标尺寸       |
| type  | `string` | 图标 MIME 类型 |

**CopyOptions**

| 属性      | 类型      | 默认值 | 描述                   |
| --------- | --------- | ------ | ---------------------- |
| sourceDir | `string`  | -      | 图标源文件目录（必填） |
| targetDir | `string`  | -      | 图标目标目录（必填）   |
| overwrite | `boolean` | `true` | 是否覆盖同名文件       |
| recursive | `boolean` | `true` | 是否递归复制           |

```typescript
faviconManager('/assets')
faviconManager({ base: '/assets', url: '/assets/favicon.ico' })
faviconManager({
	base: '/assets',
	icons: [
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
	]
})
faviconManager({
	base: '/assets',
	copyOptions: { sourceDir: 'src/assets/icons', targetDir: 'dist/assets/icons' }
})
```

---

### loadingManager

全局 Loading 状态管理，支持请求拦截、防抖、过渡动画和白屏 Loading。

| 选项           | 类型               | 默认值                  | 描述                                             |
| -------------- | ------------------ | ----------------------- | ------------------------------------------------ |
| position       | `LoadingPosition`  | `'center'`              | Loading 显示位置                                 |
| defaultText    | `string`           | `'加载中...'`           | 默认显示文本                                     |
| spinnerType    | `SpinnerType`      | `'spinner'`             | 旋转图标类型                                     |
| style          | `LoadingStyle`     | -                       | 自定义样式配置                                   |
| transition     | `TransitionConfig` | -                       | 过渡动画配置                                     |
| minDisplayTime | `MinDisplayTime`   | -                       | 最小显示时间配置                                 |
| delayShow      | `DelayShow`        | -                       | 延迟显示配置                                     |
| debounceHide   | `DebounceHide`     | -                       | 防抖隐藏配置                                     |
| autoBind       | `AutoBindMode`     | `'none'`                | 自动绑定请求拦截模式                             |
| requestFilter  | `RequestFilter`    | -                       | 请求过滤配置                                     |
| globalName     | `string`           | `'__LOADING_MANAGER__'` | 注入的全局变量名                                 |
| customTemplate | `string`           | -                       | 自定义 Loading HTML 模板                         |
| defaultVisible | `boolean`          | `false`                 | Loading DOM 初始可见状态（白屏 Loading）         |
| autoHideOn     | `AutoHideOn`       | `'DOMContentLoaded'`    | 自动隐藏时机（仅 defaultVisible 为 true 时生效） |
| callbacks      | `LoadingCallbacks` | -                       | 生命周期回调                                     |

**LoadingPosition**：`'center'` | `'top'` | `'bottom'`

**SpinnerType**：`'spinner'` | `'dots'` | `'pulse'` | `'bar'`

**AutoBindMode**：`'fetch'` | `'xhr'` | `'all'` | `'none'`

**AutoHideOn**：`'DOMContentLoaded'` | `'load'` | `'manual'`

**LoadingStyle**

| 属性               | 类型      | 默认值                    | 描述                   |
| ------------------ | --------- | ------------------------- | ---------------------- |
| overlayColor       | `string`  | `'rgba(255,255,255,0.7)'` | 遮罩层背景色           |
| spinnerColor       | `string`  | `'#4361ee'`               | Loading 图标颜色       |
| spinnerSize        | `string`  | `'40px'`                  | Loading 图标大小       |
| textColor          | `string`  | `'#333'`                  | 文本颜色               |
| textSize           | `string`  | `'14px'`                  | 文本大小               |
| customClass        | `string`  | -                         | 自定义 CSS 类名        |
| customStyle        | `string`  | -                         | 自定义内联样式字符串   |
| zIndex             | `number`  | `9999`                    | 遮罩层 z-index         |
| pointerEvents      | `boolean` | `true`                    | 是否启用遮罩层指针事件 |
| backdropBlur       | `boolean` | `false`                   | 是否启用背景模糊效果   |
| backdropBlurAmount | `number`  | `4`                       | 背景模糊程度（px）     |

**TransitionConfig**

| 属性     | 类型      | 默认值       | 描述                   |
| -------- | --------- | ------------ | ---------------------- |
| enabled  | `boolean` | `true`       | 是否启用过渡动画       |
| duration | `number`  | `200`        | 过渡动画持续时间（ms） |
| easing   | `string`  | `'ease-out'` | CSS 过渡缓动函数       |

**MinDisplayTime**

| 属性     | 类型      | 默认值 | 描述                 |
| -------- | --------- | ------ | -------------------- |
| enabled  | `boolean` | `true` | 是否启用最小显示时间 |
| duration | `number`  | `300`  | 最小显示时间（ms）   |

**DelayShow**

| 属性     | 类型      | 默认值 | 描述                                       |
| -------- | --------- | ------ | ------------------------------------------ |
| enabled  | `boolean` | `true` | 是否启用延迟显示                           |
| duration | `number`  | `200`  | 延迟时间（ms），请求在此时间内完成则不显示 |

**DebounceHide**

| 属性     | 类型      | 默认值  | 描述               |
| -------- | --------- | ------- | ------------------ |
| enabled  | `boolean` | `false` | 是否启用防抖隐藏   |
| duration | `number`  | `100`   | 防抖等待时间（ms） |

**RequestFilter**

| 属性               | 类型       | 描述                          |
| ------------------ | ---------- | ----------------------------- |
| excludeUrls        | `RegExp[]` | 需要排除的 URL 正则表达式数组 |
| includeUrls        | `RegExp[]` | 需要包含的 URL 正则表达式数组 |
| excludeMethods     | `string[]` | 需要排除的 HTTP 方法数组      |
| excludeUrlPrefixes | `string[]` | 需要排除的 URL 字符串前缀数组 |

**LoadingCallbacks**

| 属性         | 类型     | 描述                                    |
| ------------ | -------- | --------------------------------------- |
| onBeforeShow | `string` | 显示前回调（`return false` 可阻止显示） |
| onShow       | `string` | 显示后回调                              |
| onBeforeHide | `string` | 隐藏前回调（`return false` 可阻止隐藏） |
| onHide       | `string` | 隐藏后回调                              |
| onDestroy    | `string` | 销毁时回调                              |

> 回调以函数体字符串形式提供，因为需要注入到客户端代码中。`customTemplate` 中必须包含具有 `data-loading-text` 属性的元素用于文本显示。

**运行时 API：**

```typescript
window.__LOADING_MANAGER__.show('加载中...')
window.__LOADING_MANAGER__.hide()
window.__LOADING_MANAGER__.forceHide()
window.__LOADING_MANAGER__.toggle('正在加载...')
window.__LOADING_MANAGER__.updateText('正在处理...')
window.__LOADING_MANAGER__.isVisible()
window.__LOADING_MANAGER__.getPendingCount()
window.__LOADING_MANAGER__.enablePointerEvents()
window.__LOADING_MANAGER__.disablePointerEvents()
window.__LOADING_MANAGER__.destroy()
```

```typescript
loadingManager()
loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
loadingManager({ position: 'top', defaultText: '请稍候...', spinnerType: 'dots' })
loadingManager({ autoBind: 'fetch', requestFilter: { excludeUrls: [/\/api\/health/] } })
loadingManager({
	style: { overlayColor: 'rgba(0,0,0,0.5)', spinnerColor: '#ff6b6b', backdropBlur: true, backdropBlurAmount: 6 }
})
loadingManager({ transition: { enabled: true, duration: 300, easing: 'cubic-bezier(0.4,0,0.2,1)' } })
loadingManager({ debounceHide: { enabled: true, duration: 100 } })
loadingManager({ callbacks: { onShow: 'console.log("shown")', onBeforeShow: 'return true' } })
loadingManager({ customTemplate: '<div class="my-loader"><span data-loading-text></span></div>' })
loadingManager({ defaultVisible: true, autoHideOn: 'manual' })
```

---

## 插件开发框架

本包不仅提供内置插件，还导出完整的插件开发框架，帮助快速构建符合规范的自定义 Vite 插件。

### BasePlugin

所有内置插件的基类，提供配置管理、日志记录、错误处理和生命周期管理等核心能力。

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

**BasePlugin 核心方法：**

| 方法                | 描述                                       |
| ------------------- | ------------------------------------------ |
| `getDefaultOptions` | 返回插件默认配置，子类可重写               |
| `validateOptions`   | 校验用户配置，子类可重写                   |
| `getPluginName`     | 返回插件名称（抽象方法，必须实现）         |
| `getEnforce`        | 返回插件执行时机（pre / post / undefined） |
| `addPluginHooks`    | 注册 Vite 钩子（抽象方法，必须实现）       |
| `onConfigResolved`  | 配置解析完成回调                           |
| `destroy`           | 插件销毁回调                               |
| `safeExecute`       | 安全执行异步函数，自动错误处理             |
| `safeExecuteSync`   | 安全执行同步函数，自动错误处理             |
| `handleError`       | 根据 errorStrategy 处理错误                |
| `toPlugin`          | 转换为 Vite 插件对象                       |

**BasePluginOptions 基础配置：**

| 选项          | 类型                               | 默认值    | 描述         |
| ------------- | ---------------------------------- | --------- | ------------ |
| enabled       | `boolean`                          | `true`    | 是否启用插件 |
| verbose       | `boolean`                          | `true`    | 是否启用日志 |
| errorStrategy | `'throw'` \| `'log'` \| `'ignore'` | `'throw'` | 错误处理策略 |

### createPluginFactory

创建插件工厂函数，将 BasePlugin 子类转换为可直接使用的 Vite 插件函数。

```typescript
import { createPluginFactory } from '@meng-xi/vite-plugin'

const myPlugin = createPluginFactory(MyPlugin)

// 支持选项标准化器（如字符串简写配置）
const myPluginWithNormalizer = createPluginFactory(MyPlugin, opt => (typeof opt === 'string' ? { prefix: opt } : opt))
```

### Logger

全局单例日志管理器，为每个插件提供独立的日志代理。

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'

const logger = Logger.create({ name: 'my-plugin', enabled: true })
logger.info('信息日志')
logger.success('成功日志')
logger.warn('警告日志')
logger.error('错误日志')
```

### Validator

链式配置验证器，用于校验插件配置参数。

```typescript
import { Validator } from '@meng-xi/vite-plugin/common/validation'

const validator = new Validator(myOptions)
validator.field('port').number().minValue(1).maxValue(65535).field('host').string().notEmpty().field('mode').enum(['development', 'production']).validate()
```

---

## Common 工具模块

内置通用工具函数库，按功能模块组织，支持子路径按需导入。

### 导入方式

```typescript
// 导入所有工具
import { formatFileSize, scanDirectory } from '@meng-xi/vite-plugin/common'

// 按模块导入
import { formatFileSize } from '@meng-xi/vite-plugin/common/format'
import { scanDirectory, writeJsonReport } from '@meng-xi/vite-plugin/common/fs'
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'
import { isNodeModule } from '@meng-xi/vite-plugin/common/path'
```

### 模块列表

| 子路径                                   | 描述          |
| ---------------------------------------- | ------------- |
| `@meng-xi/vite-plugin/common/compress`   | 压缩算法工具  |
| `@meng-xi/vite-plugin/common/format`     | 格式化工具    |
| `@meng-xi/vite-plugin/common/fs`         | 文件系统工具  |
| `@meng-xi/vite-plugin/common/html`       | HTML 注入工具 |
| `@meng-xi/vite-plugin/common/object`     | 对象操作工具  |
| `@meng-xi/vite-plugin/common/path`       | 路径处理工具  |
| `@meng-xi/vite-plugin/common/script`     | 脚本生成工具  |
| `@meng-xi/vite-plugin/common/validation` | 参数验证工具  |

### compress — 压缩算法

| 函数                | 描述                                   |
| ------------------- | -------------------------------------- |
| `calculateGzipSize` | 计算给定数据的 gzip 压缩后大小（字节） |

```typescript
import { calculateGzipSize } from '@meng-xi/vite-plugin/common/compress'

const size = await calculateGzipSize(Buffer.from('hello world'))
```

### format — 格式化

| 函数                  | 描述                                     |
| --------------------- | ---------------------------------------- |
| `formatFileSize`      | 将字节数格式化为人类可读的文件大小字符串 |
| `getExtension`        | 获取文件扩展名（小写）                   |
| `formatDate`          | 格式化日期                               |
| `parseTemplate`       | 解析模板字符串，替换占位符               |
| `toCamelCase`         | 字符串转驼峰命名                         |
| `toPascalCase`        | 字符串转帕斯卡命名                       |
| `padNumber`           | 数字补零格式化                           |
| `generateRandomHash`  | 生成随机哈希字符串                       |
| `getDateFormatParams` | 获取日期格式化参数                       |
| `stripJsonComments`   | 移除 JSON 字符串中的注释                 |
| `escapeHtmlAttr`      | 转义 HTML 属性值中的特殊字符             |

```typescript
import { formatFileSize, formatDate, toCamelCase } from '@meng-xi/vite-plugin/common/format'

formatFileSize(2461726) // '2.35MB'
formatDate(new Date(), '{YYYY}-{MM}-{DD}') // '2026-05-31'
toCamelCase('pages/user/profile') // 'pagesUserProfile'
```

### fs — 文件系统

| 函数                 | 描述                       |
| -------------------- | -------------------------- |
| `scanDirectory`      | 递归扫描目录，收集文件信息 |
| `writeJsonReport`    | 将数据写入 JSON 文件       |
| `writeFileContent`   | 写入文件内容               |
| `readFileContent`    | 读取文件内容               |
| `fileExists`         | 检查文件是否存在           |
| `checkSourceExists`  | 检查源文件是否存在         |
| `ensureTargetDir`    | 创建目标目录               |
| `copySourceToTarget` | 执行文件复制操作           |
| `runWithConcurrency` | 带并发限制的批量执行       |

```typescript
import { scanDirectory, writeJsonReport } from '@meng-xi/vite-plugin/common/fs'

const files = await scanDirectory('dist', {
	includeExtensions: ['.js', '.css'],
	excludePatterns: ['node_modules'],
	filter: (filePath, ext, size) => size > 1024
})

await writeJsonReport('dist/report.json', { timestamp: Date.now(), files })
```

### html — HTML 注入

| 函数                          | 描述                            |
| ----------------------------- | ------------------------------- |
| `injectBeforeTag`             | 在指定闭合标签前注入代码        |
| `injectHtmlByPriority`        | 按优先级向 HTML 中注入代码      |
| `injectBeforeTagWithFallback` | 带回退策略的 HTML 注入          |
| `injectHeadAndBody`           | 双区域 HTML 注入（head + body） |

```typescript
import { injectBeforeTag, injectHeadAndBody } from '@meng-xi/vite-plugin/common/html'

const result = injectBeforeTag(html, '</head>', '<style>body{margin:0}</style>')
const dual = injectHeadAndBody(html, '<style>...</style>', '<script>...</script>')
```

### object — 对象操作

| 函数        | 描述         |
| ----------- | ------------ |
| `deepMerge` | 深度合并对象 |

```typescript
import { deepMerge } from '@meng-xi/vite-plugin/common/object'

deepMerge({ a: { b: 1 } }, { a: { c: 2 } }) // { a: { b: 1, c: 2 } }
```

### path — 路径处理

| 函数           | 描述                              |
| -------------- | --------------------------------- |
| `isNodeModule` | 判断模块 ID 是否来自 node_modules |

```typescript
import { isNodeModule } from '@meng-xi/vite-plugin/common/path'

isNodeModule('node_modules/lodash/index.js') // true
isNodeModule('src/utils/helper.ts') // false
```

### script — 脚本生成

| 函数                     | 描述                                     |
| ------------------------ | ---------------------------------------- |
| `makeCallback`           | 将回调函数体字符串包装为安全的函数表达式 |
| `containsScriptTag`      | 检测字符串是否包含 `<script>` 标签       |
| `validateIdentifierName` | 验证字符串是否为合法的 JS 标识符         |

```typescript
import { makeCallback, validateIdentifierName } from '@meng-xi/vite-plugin/common/script'

makeCallback('console.log("done")')
// 'function() { try { console.log("done") } catch(e) { console.error("[callback] error:", e); } }'

validateIdentifierName('__APP_VERSION__') // 通过
```

### validation — 参数验证

| 函数                         | 描述                       |
| ---------------------------- | -------------------------- |
| `Validator`                  | 链式配置验证器类           |
| `validateGlobalName`         | 验证全局变量名             |
| `validateNoScriptInTemplate` | 验证模板中不含 script 标签 |
| `validateCallbackFields`     | 验证回调函数字段           |
| `validateNonNegativeNumber`  | 验证非负数                 |
| `validateNestedDuration`     | 验证嵌套的时长配置         |
| `validateEnumValue`          | 验证枚举值                 |

```typescript
import { Validator } from '@meng-xi/vite-plugin/common/validation'

const validator = new Validator(options)
validator.field('port').number().minValue(1).maxValue(65535).validate()
```

---

## 子路径导出

| 子路径                                                | 描述                      |
| ----------------------------------------------------- | ------------------------- |
| `@meng-xi/vite-plugin`                                | 主入口（所有插件+框架）   |
| `@meng-xi/vite-plugin/factory`                        | 插件开发框架              |
| `@meng-xi/vite-plugin/logger`                         | 日志管理器                |
| `@meng-xi/vite-plugin/plugins`                        | 所有插件                  |
| `@meng-xi/vite-plugin/common`                         | 所有工具函数              |
| `@meng-xi/vite-plugin/common/compress`                | 压缩工具                  |
| `@meng-xi/vite-plugin/common/format`                  | 格式化工具                |
| `@meng-xi/vite-plugin/common/fs`                      | 文件系统工具              |
| `@meng-xi/vite-plugin/common/html`                    | HTML 注入工具             |
| `@meng-xi/vite-plugin/common/object`                  | 对象操作工具              |
| `@meng-xi/vite-plugin/common/path`                    | 路径处理工具              |
| `@meng-xi/vite-plugin/common/script`                  | 脚本生成工具              |
| `@meng-xi/vite-plugin/common/validation`              | 参数验证工具              |
| `@meng-xi/vite-plugin/plugins/build-progress`         | buildProgress 插件        |
| `@meng-xi/vite-plugin/plugins/bundle-analyzer`        | bundleAnalyzer 插件       |
| `@meng-xi/vite-plugin/plugins/compress-assets`        | compressAssets 插件       |
| `@meng-xi/vite-plugin/plugins/copy-file`              | copyFile 插件             |
| `@meng-xi/vite-plugin/plugins/favicon-manager`        | faviconManager 插件       |
| `@meng-xi/vite-plugin/plugins/generate-router`        | generateRouter 插件       |
| `@meng-xi/vite-plugin/plugins/generate-version`       | generateVersion 插件      |
| `@meng-xi/vite-plugin/plugins/html-inject`            | htmlInject 插件           |
| `@meng-xi/vite-plugin/plugins/loading-manager`        | loadingManager 插件       |
| `@meng-xi/vite-plugin/plugins/version-update-checker` | versionUpdateChecker 插件 |

---

## License

[MIT](LICENSE)
