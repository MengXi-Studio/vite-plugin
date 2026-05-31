# @meng-xi/vite-plugin

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

Vite 实用插件集与插件开发框架（uni-app 版本）。

---

## 概览

| 层级       | 内容                             | 说明                                                              |
| ---------- | -------------------------------- | ----------------------------------------------------------------- |
| **插件层** | 10 个内置插件                    | 构建优化 / HTML 注入 / 路由与版本 / 运行时状态 / 体积分析         |
| **框架层** | BasePlugin + createPluginFactory | 生命周期管理、配置合并、钩子自动组合                              |
| **工具层** | Logger / Validator / Common      | 单例日志、流式验证器、压缩/文件/格式/HTML/对象/路径/脚本/校验工具 |

所有插件参数均为**可选**，提供合理默认值，零配置即可使用。

## 安装

### uni_modules（推荐）

将 `vite-plugin` 目录复制到项目的 `uni_modules` 目录下：

```
src/
  └── uni_modules/
        └── vite-plugin/
              └── js_sdk/
                    └── index.mjs
```

### npm

```bash
pnpm add @meng-xi/vite-plugin -D
```

> npm 方式需将导入路径改为 `@meng-xi/vite-plugin`。

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { buildProgress, bundleAnalyzer, compressAssets, copyFile, faviconManager, generateRouter, generateVersion, htmlInject, loadingManager, versionUpdateChecker } from './uni_modules/vite-plugin/js_sdk/index.mjs'

export default defineConfig({
	plugins: [
		buildProgress(),
		bundleAnalyzer({ outputFormat: 'json' }),
		compressAssets({ algorithm: 'both' }),
		copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' }),
		faviconManager('/assets'),
		generateRouter(),
		generateVersion({ outputType: 'both' }),
		htmlInject({ rules: [{ id: 'meta-desc', content: '<meta name="description" content="My App">', position: 'head-end' }] }),
		loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' }),
		versionUpdateChecker()
	]
})
```

---

## 内置插件

### 插件总览

| 插件                   | 分类       | 一句话说明                                                 |
| ---------------------- | ---------- | ---------------------------------------------------------- |
| `buildProgress`        | 构建优化   | 终端构建进度条，bar / spinner / minimal 三种格式           |
| `bundleAnalyzer`       | 构建优化   | 构建产物体积分析，支持 JSON/HTML 报告、gzip 计算、阈值告警 |
| `compressAssets`       | 构建优化   | 构建产物 gzip / brotli 压缩，生成统计报告                  |
| `copyFile`             | 构建优化   | 构建后复制文件或目录，支持增量复制                         |
| `faviconManager`       | HTML 注入  | 网站图标 link 标签注入，支持字符串简写                     |
| `htmlInject`           | HTML 注入  | 通用 HTML 内容注入，支持选择器定位和条件注入               |
| `generateRouter`       | 路由与版本 | 根据 pages.json 自动生成路由配置                           |
| `generateVersion`      | 路由与版本 | 自动生成版本号，支持文件输出和全局变量注入                 |
| `versionUpdateChecker` | 路由与版本 | 运行时版本更新检查与提示                                   |
| `loadingManager`       | 运行时状态 | 全局 Loading 状态管理，支持请求拦截                        |

---

### buildProgress

终端实时构建进度条。进度计算：config（5%）→ resolve（10%）→ transform（15%-85%）→ bundle（+10%）→ write（+5%）→ 100%。非 TTY 终端自动降级为日志输出。

| 选项              | 类型                                  | 默认值  | 说明                       |
| ----------------- | ------------------------------------- | ------- | -------------------------- |
| `width`           | `number`                              | `30`    | 进度条宽度（字符数）       |
| `format`          | `'bar'` \| `'spinner'` \| `'minimal'` | `'bar'` | 显示格式                   |
| `completeChar`    | `string`                              | `'█'`   | 已完成部分填充字符         |
| `incompleteChar`  | `string`                              | `'░'`   | 未完成部分填充字符         |
| `clearOnComplete` | `boolean`                             | `true`  | 完成后是否清除进度条       |
| `showModuleName`  | `boolean`                             | `true`  | 是否显示当前处理的模块名称 |
| `theme`           | `ProgressTheme`                       | —       | 自定义颜色主题             |

**ProgressTheme**

| 属性              | 类型                       | 说明           |
| ----------------- | -------------------------- | -------------- |
| `completeColor`   | `(text: string) => string` | 已完成部分颜色 |
| `incompleteColor` | `(text: string) => string` | 未完成部分颜色 |
| `percentageColor` | `(text: string) => string` | 百分比数字颜色 |
| `phaseColor`      | `(text: string) => string` | 阶段标签颜色   |
| `moduleColor`     | `(text: string) => string` | 模块名称颜色   |

```typescript
buildProgress()
buildProgress({ format: 'spinner' })
buildProgress({ width: 40, completeChar: '■', incompleteChar: '□' })
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

构建完成后自动压缩输出目录中的文件。`enforce: 'post'`。`algorithm` 为 `'both'` 时每个文件同时生成 `.gz` 和 `.br`。

| 选项                 | 类型                               | 默认值                                                | 说明                             |
| -------------------- | ---------------------------------- | ----------------------------------------------------- | -------------------------------- |
| `algorithm`          | `'gzip'` \| `'brotli'` \| `'both'` | `'gzip'`                                              | 压缩算法                         |
| `threshold`          | `number`                           | `1024`                                                | 最小压缩阈值（字节）             |
| `deleteOriginalFile` | `boolean`                          | `false`                                               | 压缩后是否删除原始文件           |
| `includeExtensions`  | `string[]`                         | `['.js','.css','.html','.svg','.json','.xml','.txt']` | 需要压缩的扩展名                 |
| `excludeExtensions`  | `string[]`                         | `[]`                                                  | 排除的扩展名，优先级高于 include |
| `excludePaths`       | `string[]`                         | `[]`                                                  | 排除的路径前缀                   |
| `compressionLevel`   | `number`                           | `9`                                                   | gzip 压缩级别（1-9）             |
| `brotliQuality`      | `number`                           | `11`                                                  | brotli 质量参数（1-11）          |
| `reportOutput`       | `string` \| `false`                | `'compress-report.json'`                              | 压缩报告路径，`false` 不生成     |
| `parallelLimit`      | `number`                           | `10`                                                  | 并发压缩最大文件数               |

**CompressStats** — 单文件统计

| 属性             | 类型                   | 说明                  |
| ---------------- | ---------------------- | --------------------- |
| `file`           | `string`               | 原始文件路径          |
| `originalSize`   | `number`               | 原始大小（字节）      |
| `compressedSize` | `number`               | 压缩后大小（字节）    |
| `ratio`          | `number`               | 压缩率百分比（0-100） |
| `algorithm`      | `'gzip'` \| `'brotli'` | 使用的压缩算法        |

**CompressSummary** — 汇总统计

| 属性                  | 类型              | 说明                   |
| --------------------- | ----------------- | ---------------------- |
| `totalFiles`          | `number`          | 压缩文件总数           |
| `totalOriginalSize`   | `number`          | 原始大小总和（字节）   |
| `totalCompressedSize` | `number`          | 压缩后大小总和（字节） |
| `totalRatio`          | `number`          | 总体压缩率百分比       |
| `gzipFiles`           | `number`          | gzip 压缩文件数        |
| `brotliFiles`         | `number`          | brotli 压缩文件数      |
| `executionTime`       | `number`          | 总耗时（毫秒）         |
| `stats`               | `CompressStats[]` | 每个文件的详细统计     |

```typescript
compressAssets()
compressAssets({ algorithm: 'both' })
compressAssets({ algorithm: 'brotli', brotliQuality: 6 })
compressAssets({ threshold: 2048, excludePaths: ['assets/images/'] })
compressAssets({ deleteOriginalFile: true, reportOutput: false })
```

---

### bundleAnalyzer

构建产物体积分析插件。支持 JSON/HTML 报告、gzip 压缩大小计算、阈值告警和构建对比。`enforce: 'post'`。

| 选项                 | 类型                                    | 默认值              | 说明                                     |
| -------------------- | --------------------------------------- | ------------------- | ---------------------------------------- |
| `outputFormat`       | `'json'` \| `'html'` \| `'both'`        | `'json'`            | 报告输出格式                             |
| `outputFile`         | `string`                                | `'bundle-analysis'` | 报告输出文件名（不含扩展名）             |
| `openAnalyzer`       | `boolean`                               | `false`             | 是否在生成 HTML 报告后自动打开浏览器     |
| `sizeThreshold`      | `number`                                | `100`               | 体积告警阈值（KB）                       |
| `topModules`         | `number`                                | `20`                | Top N 大模块排行数量                     |
| `compareWith`        | `string` \| `null`                      | `null`              | 用于对比的历史报告路径                   |
| `gzipSize`           | `boolean`                               | `true`              | 是否计算 gzip 大小                       |
| `excludeNodeModules` | `boolean`                               | `false`             | 是否排除 node_modules 中的模块           |
| `excludePatterns`    | `string[]`                              | `[]`                | 需要排除的文件路径模式列表               |
| `includeExtensions`  | `string[]`                              | `[]`                | 需要包含的文件扩展名列表，为空则包含所有 |
| `defaultChartType`   | `'treemap'` \| `'sunburst'` \| `'list'` | `'treemap'`         | HTML 报告中图表的默认展示形式            |

```typescript
bundleAnalyzer()
bundleAnalyzer({ outputFormat: 'html', openAnalyzer: true })
bundleAnalyzer({ outputFormat: 'both', sizeThreshold: 200 })
bundleAnalyzer({ compareWith: 'dist/bundle-analysis.json' })
bundleAnalyzer({ excludeNodeModules: true, gzipSize: true })
```

---

### copyFile

构建完成后复制文件或目录。`enforce: 'post'`。

| 选项          | 类型      | 默认值 | 说明                 |
| ------------- | --------- | ------ | -------------------- |
| `sourceDir`   | `string`  | —      | 源目录路径（必填）   |
| `targetDir`   | `string`  | —      | 目标目录路径（必填） |
| `overwrite`   | `boolean` | `true` | 是否覆盖现有文件     |
| `recursive`   | `boolean` | `true` | 是否递归复制子目录   |
| `incremental` | `boolean` | `true` | 是否启用增量复制     |

```typescript
copyFile({ sourceDir: 'src/assets', targetDir: 'dist/assets' })
copyFile({ sourceDir: 'src/static', targetDir: 'dist/static', overwrite: false })
```

---

### faviconManager

管理网站图标链接注入到 HTML。支持字符串简写配置。

| 选项          | 类型     | 默认值 | 说明                                    |
| ------------- | -------- | ------ | --------------------------------------- |
| `base`        | `string` | `'/'`  | 图标文件基础路径                        |
| `url`         | `string` | —      | 图标完整 URL（覆盖 base）               |
| `link`        | `string` | —      | 完整 link 标签 HTML（覆盖 url 和 base） |
| `icons`       | `Icon[]` | —      | 自定义图标数组                          |
| `copyOptions` | `object` | —      | 图标文件复制配置                        |

**Icon**

| 属性    | 类型     | 说明           |
| ------- | -------- | -------------- |
| `rel`   | `string` | 图标关系类型   |
| `href`  | `string` | 图标 URL       |
| `sizes` | `string` | 图标尺寸       |
| `type`  | `string` | 图标 MIME 类型 |

**copyOptions**

| 属性        | 类型      | 默认值 | 说明         |
| ----------- | --------- | ------ | ------------ |
| `sourceDir` | `string`  | —      | 图标源目录   |
| `targetDir` | `string`  | —      | 图标目标目录 |
| `overwrite` | `boolean` | `true` | 是否覆盖     |
| `recursive` | `boolean` | `true` | 是否递归     |

```typescript
faviconManager()
faviconManager('/assets')
faviconManager({
	base: '/assets',
	icons: [
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
	],
	copyOptions: { sourceDir: 'src/assets/icons', targetDir: 'dist/assets/icons' }
})
```

---

### htmlInject

通用 HTML 内容注入。支持 7 种注入位置、条件注入、模板变量替换和安全过滤。

| 选项           | 类型                     | 默认值         | 说明                 |
| -------------- | ------------------------ | -------------- | -------------------- |
| `targetFile`   | `string`                 | `'index.html'` | 目标 HTML 文件路径   |
| `rules`        | `InjectRule[]`           | —              | 注入规则数组（必填） |
| `security`     | `SecurityConfig`         | —              | 安全配置             |
| `templateVars` | `Record<string, string>` | —              | 全局模板变量         |
| `logInjection` | `boolean`                | `true`         | 是否输出注入日志     |

**InjectPosition** — 注入位置

`'head-start'` | `'head-end'` | `'body-start'` | `'body-end'` | `'before-selector'` | `'after-selector'` | `'replace-selector'`

**InjectRule**

| 属性                   | 类型                     | 默认值     | 说明                            |
| ---------------------- | ------------------------ | ---------- | ------------------------------- |
| `id`                   | `string`                 | —          | 规则标识符                      |
| `content`              | `string`                 | —          | 注入内容（必填）                |
| `position`             | `InjectPosition`         | —          | 注入位置（必填）                |
| `selector`             | `string`                 | —          | 选择器（selector 相关位置必填） |
| `selectorMatch`        | `'string'` \| `'regex'`  | `'string'` | 选择器匹配模式                  |
| `priority`             | `number`                 | `100`      | 优先级，数值越小越先执行        |
| `condition`            | `InjectCondition`        | —          | 注入条件                        |
| `templateVars`         | `Record<string, string>` | —          | 规则级模板变量，覆盖全局        |
| `allowScriptInjection` | `boolean`                | `false`    | 允许注入脚本（跳过安全检查）    |

**InjectCondition**

| 属性     | 类型                                       | 说明                     |
| -------- | ------------------------------------------ | ------------------------ |
| `type`   | `'env'` \| `'file-contains'` \| `'custom'` | 条件类型                 |
| `value`  | `string` \| `(...args: any[]) => boolean`  | 条件值                   |
| `negate` | `boolean`                                  | 是否取反（默认 `false`） |

**SecurityConfig**

| 属性                       | 类型       | 默认值 | 说明               |
| -------------------------- | ---------- | ------ | ------------------ |
| `blockDangerousTags`       | `boolean`  | `true` | 阻止危险标签       |
| `blockDangerousAttributes` | `boolean`  | `true` | 阻止危险属性       |
| `allowedTags`              | `string[]` | —      | 标签白名单         |
| `blockedTags`              | `string[]` | —      | 自定义阻止标签列表 |
| `blockedAttributes`        | `string[]` | —      | 自定义阻止属性列表 |

```typescript
htmlInject({
	rules: [
		{ id: 'meta-desc', content: '<meta name="description" content="My App">', position: 'head-end' },
		{ id: 'analytics', content: '<script src="analytics.js"></script>', position: 'body-end', allowScriptInjection: true },
		{ id: 'dev-only', content: '<div>Debug Panel</div>', position: 'body-start', condition: { type: 'env', value: 'DEV' } }
	],
	templateVars: { appName: 'My App', version: '1.0.0' }
})
```

---

### generateRouter

根据 uni-app 项目的 `pages.json` 自动生成路由配置文件。

| 选项                   | 类型                                                      | 默认值                   | 说明                          |
| ---------------------- | --------------------------------------------------------- | ------------------------ | ----------------------------- |
| `pagesJsonPath`        | `string`                                                  | `'src/pages.json'`       | pages.json 文件路径           |
| `outputPath`           | `string`                                                  | `'src/router.config.ts'` | 输出文件路径                  |
| `outputFormat`         | `'ts'` \| `'js'`                                          | `'ts'`                   | 输出文件格式                  |
| `nameStrategy`         | `'path'` \| `'camelCase'` \| `'pascalCase'` \| `'custom'` | `'camelCase'`            | 路由名称策略                  |
| `customNameGenerator`  | `(path: string) => string`                                | —                        | 自定义路由名称生成函数        |
| `includeSubPackages`   | `boolean`                                                 | `true`                   | 是否包含子包路由              |
| `watch`                | `boolean`                                                 | `true`                   | 是否监听变化自动重新生成      |
| `metaMapping`          | `Record<string, string>`                                  | —                        | 页面 style 字段到 meta 的映射 |
| `exportTypes`          | `boolean`                                                 | `true`                   | 是否导出类型定义              |
| `preserveRouteChanges` | `boolean`                                                 | `true`                   | 是否保留用户对 routes 的修改  |

> 默认 `metaMapping` 为 `{ navigationBarTitleText: 'title', requireAuth: 'requireAuth' }`。`nameStrategy` 为 `'custom'` 时必须提供 `customNameGenerator`。

```typescript
generateRouter()
generateRouter({ outputFormat: 'js', outputPath: 'src/router.config.js' })
generateRouter({ nameStrategy: 'pascalCase' })
generateRouter({ nameStrategy: 'custom', customNameGenerator: path => `route_${path.replace(/\//g, '_')}` })
```

---

### generateVersion

构建过程中自动生成版本号，支持文件输出和全局变量注入。

| 选项           | 类型                                                                              | 默认值              | 说明                                      |
| -------------- | --------------------------------------------------------------------------------- | ------------------- | ----------------------------------------- |
| `format`       | `'timestamp'` \| `'date'` \| `'datetime'` \| `'semver'` \| `'hash'` \| `'custom'` | `'timestamp'`       | 版本号格式                                |
| `customFormat` | `string`                                                                          | —                   | 自定义格式模板（format 为 custom 时必填） |
| `semverBase`   | `string`                                                                          | `'1.0.0'`           | 语义化版本基础值                          |
| `outputType`   | `'file'` \| `'define'` \| `'both'`                                                | `'file'`            | 输出类型                                  |
| `outputFile`   | `string`                                                                          | `'version.json'`    | 输出文件路径                              |
| `defineName`   | `string`                                                                          | `'__APP_VERSION__'` | 注入的全局变量名                          |
| `hashLength`   | `number`                                                                          | `8`                 | 哈希长度（1-32）                          |
| `prefix`       | `string`                                                                          | —                   | 版本号前缀                                |
| `suffix`       | `string`                                                                          | —                   | 版本号后缀                                |
| `extra`        | `Record<string, unknown>`                                                         | —                   | 附加信息（仅 JSON 文件）                  |

**customFormat 占位符**

| 占位符        | 说明                        | 示例            |
| ------------- | --------------------------- | --------------- |
| `{YYYY}`      | 四位年份                    | `2026`          |
| `{YY}`        | 两位年份                    | `26`            |
| `{MM}`        | 两位月份                    | `05`            |
| `{DD}`        | 两位日期                    | `23`            |
| `{HH}`        | 两位小时（24h）             | `14`            |
| `{mm}`        | 两位分钟                    | `30`            |
| `{ss}`        | 两位秒数                    | `00`            |
| `{SSS}`       | 三位毫秒                    | `123`           |
| `{timestamp}` | 时间戳（毫秒）              | `1748000000000` |
| `{hash}`      | 随机哈希                    | `a1b2c3d4`      |
| `{major}`     | 主版本号（需 semverBase）   | `1`             |
| `{minor}`     | 次版本号（需 semverBase）   | `0`             |
| `{patch}`     | 补丁版本号（需 semverBase） | `0`             |

> `outputType` 为 `'define'` 或 `'both'` 时，同时注入 `{defineName}_INFO` 全局变量，包含版本号、构建时间、时间戳等完整信息。

```typescript
generateVersion()
generateVersion({ format: 'date' })
generateVersion({ format: 'semver', semverBase: '2.0.0', prefix: 'v' })
generateVersion({ format: 'custom', customFormat: '{YYYY}.{MM}.{DD}-{hash}', hashLength: 6 })
generateVersion({ outputType: 'both', defineName: '__BUILD_VERSION__', extra: { env: 'production' } })
```

---

### versionUpdateChecker

运行时定期检查版本号变更，发现新版本时提示用户刷新。通常与 `generateVersion` 配合使用。

**工作原理：** `generateVersion` 构建时生成版本号 → `versionUpdateChecker` 运行时定期请求版本文件 → 发现不一致时弹出提示。

| 选项                      | 类型                                 | 默认值                                     | 说明                             |
| ------------------------- | ------------------------------------ | ------------------------------------------ | -------------------------------- |
| `versionSource`           | `'define'` \| `'file'` \| `'auto'`   | `'auto'`                                   | 当前版本号来源                   |
| `defineName`              | `string`                             | `'__APP_VERSION__'`                        | define 模式下的全局变量名        |
| `checkUrl`                | `string`                             | `'/version.json'`                          | 版本检查文件 URL                 |
| `checkInterval`           | `number`                             | `300000`                                   | 检查间隔（毫秒，默认 5 分钟）    |
| `checkOnVisibilityChange` | `boolean`                            | `true`                                     | 页面可见性变化时是否立即检查     |
| `enableInDev`             | `boolean`                            | `false`                                    | 是否在开发模式下启用             |
| `promptStyle`             | `'modal'` \| `'banner'` \| `'toast'` | `'modal'`                                  | 更新提示 UI 样式                 |
| `promptMessage`           | `string`                             | `'发现新版本，是否立即刷新获取最新内容？'` | 提示消息文本                     |
| `refreshButtonText`       | `string`                             | `'立即刷新'`                               | 刷新按钮文本                     |
| `dismissButtonText`       | `string`                             | `'稍后再说'`                               | 忽略按钮文本                     |
| `customPromptTemplate`    | `string`                             | —                                          | 自定义提示 UI 的 HTML 模板       |
| `customStyle`             | `string`                             | —                                          | 自定义 CSS 样式字符串            |
| `onUpdateAvailable`       | `string`                             | —                                          | 发现新版本回调（函数体字符串）   |
| `onRefresh`               | `string`                             | —                                          | 用户选择刷新回调（函数体字符串） |
| `onDismiss`               | `string`                             | —                                          | 用户选择忽略回调（函数体字符串） |

```typescript
versionUpdateChecker()
versionUpdateChecker({ checkInterval: 60000, promptStyle: 'banner' })
versionUpdateChecker({ enableInDev: true, onUpdateAvailable: 'console.log("新版本:", newVersion)' })
```

---

### loadingManager

全局 Loading 状态管理。支持请求拦截、白屏 Loading、过渡动画、防抖隐藏等。

| 选项             | 类型                                            | 默认值                                                 | 说明                         |
| ---------------- | ----------------------------------------------- | ------------------------------------------------------ | ---------------------------- |
| `position`       | `'center'` \| `'top'` \| `'bottom'`             | `'center'`                                             | 显示位置                     |
| `defaultText`    | `string`                                        | `'加载中...'`                                          | 默认显示文本                 |
| `spinnerType`    | `'spinner'` \| `'dots'` \| `'pulse'` \| `'bar'` | `'spinner'`                                            | 旋转图标类型                 |
| `style`          | `LoadingStyle`                                  | —                                                      | 自定义样式配置               |
| `transition`     | `TransitionConfig`                              | `{ enabled: true, duration: 200, easing: 'ease-out' }` | 过渡动画配置                 |
| `minDisplayTime` | `MinDisplayTime`                                | `{ enabled: true, duration: 300 }`                     | 最小显示时间                 |
| `delayShow`      | `DelayShow`                                     | `{ enabled: true, duration: 200 }`                     | 延迟显示                     |
| `debounceHide`   | `DebounceHide`                                  | `{ enabled: false, duration: 100 }`                    | 防抖隐藏                     |
| `autoBind`       | `'fetch'` \| `'xhr'` \| `'all'` \| `'none'`     | `'none'`                                               | 请求拦截模式                 |
| `requestFilter`  | `RequestFilter`                                 | —                                                      | 请求过滤配置                 |
| `globalName`     | `string`                                        | `'__LOADING_MANAGER__'`                                | 浏览器全局变量名             |
| `customTemplate` | `string`                                        | —                                                      | 自定义 HTML 模板             |
| `defaultVisible` | `boolean`                                       | `false`                                                | 初始可见状态（白屏 Loading） |
| `autoHideOn`     | `'DOMContentLoaded'` \| `'load'` \| `'manual'`  | `'DOMContentLoaded'`                                   | 自动隐藏时机                 |
| `callbacks`      | `LoadingCallbacks`                              | —                                                      | 生命周期回调                 |

**LoadingStyle**

| 属性                 | 类型      | 默认值                    | 说明             |
| -------------------- | --------- | ------------------------- | ---------------- |
| `overlayColor`       | `string`  | `'rgba(255,255,255,0.7)'` | 遮罩层背景色     |
| `spinnerColor`       | `string`  | `'#4361ee'`               | 图标颜色         |
| `spinnerSize`        | `string`  | `'40px'`                  | 图标大小         |
| `textColor`          | `string`  | `'#333'`                  | 文本颜色         |
| `textSize`           | `string`  | `'14px'`                  | 文本大小         |
| `customClass`        | `string`  | —                         | 自定义 CSS 类名  |
| `customStyle`        | `string`  | —                         | 自定义内联样式   |
| `zIndex`             | `number`  | `9999`                    | z-index 值       |
| `pointerEvents`      | `boolean` | `true`                    | 是否启用指针事件 |
| `backdropBlur`       | `boolean` | `false`                   | 是否启用模糊效果 |
| `backdropBlurAmount` | `number`  | `4`                       | 模糊程度（px）   |

**RequestFilter**

| 属性                 | 类型       | 说明                                  |
| -------------------- | ---------- | ------------------------------------- |
| `excludeUrls`        | `RegExp[]` | 排除的 URL 正则                       |
| `includeUrls`        | `RegExp[]` | 包含的 URL 正则（优先级高于 exclude） |
| `excludeMethods`     | `string[]` | 排除的 HTTP 方法                      |
| `excludeUrlPrefixes` | `string[]` | 排除的 URL 前缀                       |

**LoadingCallbacks** — 所有回调为函数体字符串

| 属性           | 说明                              |
| -------------- | --------------------------------- |
| `onBeforeShow` | 显示前回调，`return false` 可阻止 |
| `onShow`       | 显示后回调                        |
| `onBeforeHide` | 隐藏前回调，`return false` 可阻止 |
| `onHide`       | 隐藏后回调                        |
| `onDestroy`    | 销毁时回调                        |

**LoadingManager 实例方法** — 通过 `window.__LOADING_MANAGER__` 访问

| 方法                       | 说明                             |
| -------------------------- | -------------------------------- |
| `show(text?)`              | 显示 loading                     |
| `hide()`                   | 隐藏 loading                     |
| `forceHide()`              | 强制隐藏，忽略最小显示时间和防抖 |
| `toggle(text?)`            | 切换显示/隐藏                    |
| `updateText(text)`         | 更新文本                         |
| `isVisible()`              | 是否正在显示                     |
| `getPendingCount()`        | 当前挂起的请求数                 |
| `enablePointerEvents()`    | 启用指针事件（拦截交互）         |
| `disablePointerEvents()`   | 禁用指针事件（允许穿透）         |
| `togglePointerEvents()`    | 切换指针事件                     |
| `isPointerEventsEnabled()` | 指针事件是否启用                 |
| `destroy()`                | 销毁实例                         |

```typescript
loadingManager()
loadingManager({ defaultVisible: true, autoHideOn: 'DOMContentLoaded' })
loadingManager({ autoBind: 'fetch', requestFilter: { excludeUrls: [/\/api\/health/] } })
loadingManager({ style: { overlayColor: 'rgba(0,0,0,0.5)', spinnerColor: '#fff' } })
loadingManager({ callbacks: { onShow: 'console.log("shown")', onBeforeHide: 'return false' } })
```

---

## 公共配置

所有插件均继承 `BasePluginOptions`：

| 选项            | 类型                               | 默认值    | 说明         |
| --------------- | ---------------------------------- | --------- | ------------ |
| `enabled`       | `boolean`                          | `true`    | 是否启用插件 |
| `verbose`       | `boolean`                          | `true`    | 是否启用日志 |
| `errorStrategy` | `'throw'` \| `'log'` \| `'ignore'` | `'throw'` | 错误处理策略 |

---

## 插件开发框架

### BasePlugin

所有内置插件的基类，提供配置管理、日志记录、生命周期管理。

```typescript
import { BasePlugin, createPluginFactory } from './uni_modules/vite-plugin/js_sdk/index.mjs'

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getPluginName() {
		return 'my-plugin'
	}

	protected getDefaultOptions(): Partial<MyPluginOptions> {
		return { myOption: 'default' }
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.buildStart = () => {
			this.logger.info('构建开始')
		}
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

**核心方法**

| 方法                     | 说明                             |
| ------------------------ | -------------------------------- |
| `getPluginName()`        | 返回插件名称（抽象，必须实现）   |
| `getDefaultOptions()`    | 返回默认配置                     |
| `addPluginHooks(plugin)` | 注册 Vite 钩子（抽象，必须实现） |
| `toPlugin()`             | 转换为 Vite 插件对象             |
| `destroy()`              | 销毁插件实例                     |

**生命周期**

```
初始化 → 配置解析（deepMerge 默认值与用户配置） → 钩子注册 → 运行 → 销毁
```

### createPluginFactory

创建插件工厂函数，支持选项标准化器（如字符串简写转对象）。

```typescript
// 基本使用
const myPlugin = createPluginFactory(MyPlugin)

// 带标准化器（支持字符串或对象配置）
const myPlugin = createPluginFactory(MyPlugin, opt => (typeof opt === 'string' ? { path: opt } : opt))
```

### PluginWithInstance

内置插件返回的对象包含 `pluginInstance` 属性，可访问插件内部状态：

```typescript
import type { PluginWithInstance } from './uni_modules/vite-plugin/js_sdk/factory/index.mjs'

const routerPlugin = generateRouter({ watch: true }) as PluginWithInstance<GenerateRouterOptions>
console.log(routerPlugin.pluginInstance?.options)
```

---

## 工具层

### Logger

单例日志管理器，统一管理所有插件的日志输出。

```typescript
import { Logger } from './uni_modules/vite-plugin/js_sdk/index.mjs'

const logger = Logger.create({ name: 'my-plugin', enabled: true })
logger.success('操作成功')
logger.info('信息')
logger.warn('警告')
logger.error('错误')
```

| 方法                      | 说明              |
| ------------------------- | ----------------- |
| `Logger.create(options)`  | 创建/获取单例实例 |
| `Logger.unregister(name)` | 注销插件日志配置  |
| `Logger.destroy()`        | 销毁单例实例      |

### Validator

流式参数验证器，支持链式调用。

```typescript
import { Validator } from './uni_modules/vite-plugin/js_sdk/index.mjs'

const validated = new Validator(options)
	.field('sourceDir')
	.required()
	.string()
	.field('targetDir')
	.required()
	.string()
	.field('overwrite')
	.boolean()
	.default(true)
	.field('mode')
	.enum(['fast', 'slow'])
	.field('count')
	.number()
	.minValue(1)
	.maxValue(100)
	.field('custom')
	.custom(v => v.startsWith('/'), 'custom 必须以 / 开头')
	.validate()
```

| 方法                                                           | 说明                   |
| -------------------------------------------------------------- | ---------------------- |
| `field(name)`                                                  | 指定验证字段           |
| `required()`                                                   | 标记为必填             |
| `string()` / `boolean()` / `number()` / `array()` / `object()` | 类型验证               |
| `default(value)`                                               | 设置默认值             |
| `enum(values)`                                                 | 枚举验证               |
| `minValue(n)` / `maxValue(n)`                                  | 数值范围验证           |
| `custom(fn, msg)`                                              | 自定义验证             |
| `validate()`                                                   | 执行验证，失败抛出错误 |

### Common 工具函数

#### @common/compress — 压缩算法

| 函数                      | 说明                               |
| ------------------------- | ---------------------------------- |
| `calculateGzipSize(data)` | 计算数据的 gzip 压缩后大小（异步） |

#### @common/fs — 文件操作

| 函数                                        | 说明                       |
| ------------------------------------------- | -------------------------- |
| `checkSourceExists(path)`                   | 检查源文件是否存在         |
| `ensureTargetDir(path)`                     | 确保目标目录存在           |
| `readDirRecursive(path, recursive)`         | 递归读取目录               |
| `shouldUpdateFile(src, dest)`               | 检查文件是否需要更新       |
| `fileExists(path)`                          | 检查文件是否存在           |
| `runWithConcurrency(items, handler, limit)` | 带并发限制的批量执行       |
| `copySourceToTarget(src, dest, options)`    | 复制文件或目录             |
| `writeFileContent(path, content)`           | 写入文件                   |
| `readFileContent(path)`                     | 读取文件（异步）           |
| `readFileSync(path)`                        | 读取文件（同步，已废弃）   |
| `scanDirectory(dirPath, options?)`          | 递归扫描目录，收集文件信息 |
| `writeJsonReport(filePath, data, indent?)`  | 将数据写入 JSON 文件       |

#### @common/format — 格式化

| 函数                              | 说明                   |
| --------------------------------- | ---------------------- |
| `padNumber(num, length)`          | 数字补零               |
| `generateRandomHash(length)`      | 生成随机哈希           |
| `getDateFormatParams(date)`       | 获取日期格式化参数     |
| `formatDate(date, format)`        | 格式化日期             |
| `parseTemplate(template, values)` | 解析模板字符串         |
| `toCamelCase(str)`                | 转 camelCase           |
| `toPascalCase(str)`               | 转 PascalCase          |
| `stripJsonComments(str)`          | 移除 JSON 注释         |
| `escapeHtmlAttr(str)`             | 转义 HTML 属性特殊字符 |
| `formatFileSize(bytes)`           | 字节数格式化为可读大小 |
| `getExtension(filePath)`          | 获取文件扩展名         |

#### @common/html — HTML 注入

| 函数                                            | 说明                      |
| ----------------------------------------------- | ------------------------- |
| `injectBeforeTag(html, tag, code)`              | 在指定闭合标签前注入      |
| `injectHtmlByPriority(html, code, targets)`     | 按优先级注入              |
| `injectBeforeTagWithFallback(html, code, msg?)` | 带回退策略注入            |
| `injectHeadAndBody(html, headCode, bodyCode)`   | 双区域注入（head + body） |

#### @common/object — 对象操作

| 函数                    | 说明                                                 |
| ----------------------- | ---------------------------------------------------- |
| `deepMerge(...sources)` | 深度合并对象（undefined 不覆盖，数组覆盖，嵌套递归） |

#### @common/path — 路径处理

| 函数                     | 说明                                                |
| ------------------------ | --------------------------------------------------- |
| `isNodeModule(moduleId)` | 判断模块 ID 是否来自 node_modules（含虚拟模块检测） |

#### @common/script — 脚本安全

| 函数                                    | 说明                               |
| --------------------------------------- | ---------------------------------- |
| `makeCallback(body, context?, params?)` | 包装安全函数表达式（含 try-catch） |
| `containsScriptTag(str)`                | 检测 script 标签                   |
| `validateIdentifierName(name)`          | 验证 JS 标识符合法性               |

#### @common/validation — 验证工具

| 函数                                        | 说明                |
| ------------------------------------------- | ------------------- |
| `validateGlobalName(name, field)`           | 验证全局变量名      |
| `validateNoScriptInTemplate(tpl, field)`    | 验证模板不含 script |
| `validateCallbackFields(obj, fields, name)` | 验证回调字段        |
| `validateNonNegativeNumber(val, field)`     | 验证非负数          |
| `validateNestedDuration(config, msg)`       | 验证嵌套 duration   |
| `validateEnumValue(val, allowed, field)`    | 验证枚举值          |

---

## 类型导出

所有插件的 Options 类型、辅助类型均可从入口导出：

```typescript
import type {
	BasePluginOptions,
	PluginWithInstance,
	BuildProgressOptions,
	BundleAnalyzerOptions,
	BundleAnalysisResult,
	BundleOutputFormat,
	CompressAssetsOptions,
	CompressStats,
	CompressSummary,
	CopyFileOptions,
	FaviconManagerOptions,
	HtmlInjectOptions,
	InjectRule,
	InjectPosition,
	GenerateRouterOptions,
	RouteConfig,
	GenerateVersionOptions,
	VersionInfo,
	VersionUpdateCheckerOptions,
	LoadingManagerOptions,
	LoadingManager
} from './uni_modules/vite-plugin/js_sdk/index.mjs'
```

---

## 文档

完整文档：[https://mengxi-studio.github.io/vite-plugin/](https://mengxi-studio.github.io/vite-plugin/)

## 许可

[MIT](LICENSE)
