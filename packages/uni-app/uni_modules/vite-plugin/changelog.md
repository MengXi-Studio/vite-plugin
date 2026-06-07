## 0.1.6（2026-06-07）

autoImport 支持通配符自动导入，generateRouter 新增路由类型声明生成，Common 工具模块新增多项通用函数，插件代码规范化重构

### autoImport（增强）

自动导入插件新增通配符 `'*'` 支持，可自动导入模块的所有命名导出，无需逐一列举。修复了开发模式下与 uni-app 插件的协同问题，修正了默认文件过滤规则。

**新增功能**：

- **通配符导入**：`imports` 配置支持 `'*'` 通配符，自动解析模块的所有命名导出。解析策略优先从 `.d.ts` 类型声明文件提取导出（最准确），回退到运行时入口文件解析
- **Vue SFC 注入**：新增 `injectIntoScriptSetup` 函数，将 import 语句注入到 `<script setup>` 块内部，解决 `enforce: 'pre'` 时与 Vue SFC 编译器的协同问题

**修复**：

- 修复 `transform` 钩子 `enforce: 'post'` 导致裸模块标识符无法解析的问题，改回 `enforce: 'pre'`
- 修复默认 `fileFilter` 未排除 `node_modules`，导致库文件被错误处理并注入错误的 import 语句
- 修复 `resolveWildcardExports` 解析 `vue` 模块时走了运行时入口（仅含 `export { compile }`），导致 `vue: ['*']` 只解析出 `compile` 一个导出
- 修复 `for (const [mod, items] of moduleMap)` 中 `items` 变量声明后未使用的问题
- 修复 `makeCallback` 返回的匿名函数作为函数声明调用时的语法错误，改用 IIFE 形式

**配置选项变更**：

| 选项       | 变更前默认值                        | 变更后默认值                                             | 说明                             |
| ---------- | ----------------------------------- | -------------------------------------------------------- | -------------------------------- |
| imports    | -                                   | -                                                        | 新增支持 `'*'` 通配符格式        |
| fileFilter | `/\.(vue\|jsx\|tsx\|ts\|js\|mjs)$/` | `/^(?!.*node_modules).*\.(vue\|jsx\|tsx\|ts\|js\|mjs)$/` | 默认排除 `node_modules` 中的文件 |

**通配符用法**：

```typescript
autoImport({
	imports: {
		vue: ['*'], // 自动导入 vue 的所有命名导出
		'vue-router': ['*'] // 自动导入 vue-router 的所有命名导出
	}
})
```

### generateRouter（增强）

路由生成插件新增 TypeScript 类型声明文件生成功能，为 `@meng-xi/uni-router` 模块扩展 `RouteNameMap` 接口，实现类型安全的路由导航。

**新增功能**：

- **路由类型声明生成**：新增 `dts` 选项，控制是否生成 `router.d.ts` 类型声明文件
  - `false`：不生成类型声明文件（默认）
  - `true`：使用默认路径 `src/router.d.ts`
  - `string`：在指定路径生成类型声明文件
- 生成的类型声明包含 TSDoc 注释（页面标题）和完整的元信息类型映射

**生成的类型声明示例**：

```typescript
import '@meng-xi/uni-router'

declare module '@meng-xi/uni-router' {
	interface RouteNameMap {
		/** 首页 */
		pagesIndexIndex: { path: '/pages/index/index'; meta: { title: string; isTab: true } }
		/** 个人中心 */
		pagesUserProfile: { path: '/pages/user/profile'; meta: { title: string; requireAuth: true } }
	}
}
```

**新增配置选项**：

| 选项 | 类型                  | 默认值  | 描述                                          |
| ---- | --------------------- | ------- | --------------------------------------------- |
| dts  | `string` \| `boolean` | `false` | 路由类型声明文件输出路径，`true` 使用默认路径 |

### Common 工具模块（增强）

新增多项通用函数，提升工具模块的实用性：

**common/format（增强）**：

| 新增函数        | 描述                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| `parseTemplate` | 替换模板字符串中的 `{{key}}` 占位符，键名特殊字符自动转义，值中 $ 安全处理 |
| `formatDate`    | 使用 `{YYYY}`、`{MM}` 等占位符格式化日期字符串                             |

**common/fs（增强）**：

| 新增函数                  | 描述                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| `writeFileSyncSafely`     | 同步写入文件，自动创建不存在的目录，适用于 `transform` 等同步钩子 |
| `shouldUpdateFileContent` | 对比文件内容是否需要更新，减少不必要的文件 IO 操作                |

**common/html（增强）**：

| 新增函数         | 描述                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| `escapeHtmlAttr` | 转义 HTML 属性值中的特殊字符（`&`、`"`、`'`、`<`、`>`），防止属性注入攻击 |

### 插件代码规范化重构

按照 `autoImport/common` 目录规范，将各插件中不属于插件核心逻辑的函数、常量等提取到 `common/` 子目录，通过 `common/index.ts` 聚合导出：

- `buildProgress/common` — 提取常量和工具函数
- `generateRouter/common` — 提取路由工具函数和类型声明生成逻辑（`dts.ts`）
- `envGuard/common` — 提取运行时守卫、模板生成、校验逻辑
- `faviconManager/common` — 提取类型定义
- `htmlInject/common` — 提取代码生成器和校验器
- `loadingManager/common` — 提取常量、函数体生成器、代码生成器和校验器
- `versionUpdateChecker/common` — 提取代码生成器和校验器

### 子路径导出（变更）

- `@meng-xi/vite-plugin/common/format` 新增导出：`parseTemplate`、`formatDate`
- `@meng-xi/vite-plugin/common/fs` 新增导出：`writeFileSyncSafely`、`shouldUpdateFileContent`
- `@meng-xi/vite-plugin/common/html` 新增导出：`escapeHtmlAttr`

## 0.1.5（2026-06-06）

新增 autoImport 自动导入插件，精简 Common 工具模块（移除 compress、object、path），修复 dts 类型声明文件在开发模式下不生成的问题

### autoImport（新增）

自动导入插件，在 Vite 构建过程中自动检测代码中使用的标识符，并将对应的 import 语句注入到文件顶部，无需手动编写 import 声明。`enforce: 'post'`。

**功能特性**：

- 预设映射：通过 `imports` 配置常用库的自动导入规则，支持简写格式（`Record<string, string[]>`）和完整格式（`ImportMapping[]`，支持默认导入）
- 目录扫描：通过 `dirs` 配置自动扫描指定目录下的模块导出，递归扫描子目录，跳过 `node_modules` 和隐藏目录
- Vue 模板支持：`vueTemplate` 开启后，Vue SFC `<template>` 中使用的 API 也会被自动导入
- 类型声明生成：`dts` 选项自动生成 `.d.ts` 类型声明文件，提供 IDE 类型提示
- 标识符忽略：`ignore` 选项排除不需要自动导入的标识符
- 文件过滤：`fileFilter` 正则控制需要处理的文件范围
- 注入位置：`injectAtPosition` 支持 `'top'`（文件顶部）和 `'after-last-import'`（最后一个 import 之后）两种位置

**配置选项**：

| 选项             | 类型                                                            | 默认值                              | 描述                                 |
| ---------------- | --------------------------------------------------------------- | ----------------------------------- | ------------------------------------ |
| imports          | `Record<string, string[]>` \| `ImportMapping[]` \| `Array<...>` | `{}`                                | 导入映射配置                         |
| dirs             | `string[]`                                                      | `[]`                                | 需要扫描的目录列表                   |
| dts              | `string` \| `boolean`                                           | `'auto-imports.d.ts'`               | 类型声明文件输出路径，`false` 不生成 |
| vueTemplate      | `boolean`                                                       | `false`                             | 是否为 Vue 模板启用自动导入          |
| ignore           | `string[]`                                                      | `[]`                                | 需要忽略的标识符列表                 |
| fileFilter       | `RegExp`                                                        | `/\.(vue\|jsx\|tsx\|ts\|js\|mjs)$/` | 文件过滤正则表达式                   |
| injectAtPosition | `'top'` \| `'after-last-import'`                                | `'top'`                             | import 语句注入位置                  |

**ImportMapping 类型**：

| 属性          | 类型       | 描述                         |
| ------------- | ---------- | ---------------------------- |
| module        | `string`   | 模块路径                     |
| names         | `string[]` | 要导入的名称列表             |
| defaultImport | `boolean`  | 是否为默认导入，默认 `false` |

**ResolvedImport 类型**：

| 属性      | 类型      | 描述           |
| --------- | --------- | -------------- |
| module    | `string`  | 模块路径       |
| name      | `string`  | 导入标识符名称 |
| isDefault | `boolean` | 是否为默认导入 |

**ScannedModule 类型**：

| 属性          | 类型               | 描述                        |
| ------------- | ------------------ | --------------------------- |
| filePath      | `string`           | 模块文件的绝对路径          |
| exports       | `string[]`         | 命名导出名称列表            |
| defaultExport | `string` \| `null` | 默认导出名称，无则为 `null` |

**TransformResult 类型**：

| 属性 | 类型     | 描述                    |
| ---- | -------- | ----------------------- |
| code | `string` | 转换后的代码字符串      |
| map  | `any`    | Source map 信息（可选） |

### Common 工具模块（精简）

移除使用次数不足 2 次的工具模块，仅保留在多处被复用的核心工具：

- **移除** `@common/compress` — `calculateGzipSize` 仅在 `bundleAnalyzer` 中使用，已内联
- **移除** `@common/object` — `deepMerge` 仅在 `loadingManager` 中使用，已内联
- **移除** `@common/path` — `isNodeModule` 仅在 `bundleAnalyzer` 中使用，已内联

保留的 6 个模块：

| 子路径              | 描述          | 导出内容                                                                                                     |
| ------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| `common/format`     | 格式化工具    | `getDateFormatParams`、`formatFileSize`、`DateFormatOptions`                                                 |
| `common/fs`         | 文件系统工具  | `checkSourceExists`、`copySourceToTarget`、`writeFileContent`、`scanDirectory`、`writeJsonReport` 及相关类型 |
| `common/html`       | HTML 注入工具 | `injectBeforeTag`、`injectHeadAndBody`、`sanitizeContent` 及相关类型                                         |
| `common/script`     | 脚本生成工具  | `makeCallback`                                                                                               |
| `common/ui`         | 终端 UI 工具  | `ANSI`                                                                                                       |
| `common/validation` | 参数验证工具  | `Validator`、`validateGlobalName`、`validateNoScriptInTemplate`、`validateCallbackFields`                    |

### 子路径导出（变更）

- 新增 `@meng-xi/vite-plugin/plugins/auto-import` 子路径导出
- 新增导出函数：`autoImport`
- 新增导出类型：`AutoImportOptions`、`ImportMapping`、`ResolvedImport`、`ScannedModule`、`TransformResult`
- 移除 `@meng-xi/vite-plugin/common/compress` 子路径导出
- 移除 `@meng-xi/vite-plugin/common/object` 子路径导出
- 移除 `@meng-xi/vite-plugin/common/path` 子路径导出
- `@meng-xi/vite-plugin/common`
  移除导出：`calculateGzipSize`、`deepMerge`、`isNodeModule`、`SPINNER_FRAMES`、`stripAnsi`、`escapeHtmlAttr`、`getExtension`、`padNumber`、`generateRandomHash`、`formatDate`、`parseTemplate`、`toCamelCase`、`toPascalCase`、`stripJsonComments`
  及相关类型

## 0.1.4（2026-06-03）

新增 envGuard 环境变量校验插件，新增 @common/ui 终端 UI 工具模块

### envGuard（新增）

环境变量校验插件，在 Vite 构建前校验环境变量的存在性和合法性，支持多种值类型校验、正则匹配、自定义校验函数、范围约束和长度约束，可选生成 .env 模板文件和注入运行时守卫代码。`enforce: 'post'`（运行时守卫注入）。

**功能特性**：

- 多类型校验：`string`、`number`、`url`、`boolean`、`enum`、`json`、`semver`、`path`
- 范围验证：`minValue` / `maxValue` 数值范围约束（`number` 类型）
- 长度验证：`minLength` / `maxLength` 字符串长度约束（字符串类类型）
- 正则匹配：`pattern` 正则表达式校验
- 自定义校验：`validator` 函数，返回 `true` 或错误消息字符串
- 失败处理：`failAction` 支持 `error`（中断构建）、`warn`（警告继续）、`ignore`（静默忽略）
- .env 模板生成：`generateTemplate` 自动生成含注释、分组、敏感标记的模板文件
- 运行时守卫：`runtimeGuard` 注入 JavaScript 代码到 HTML，支持 `console`（控制台警告）、`throw`（抛出错误）、`overlay`（页面横幅）三种模式
- 自动加载 .env：`autoLoadEnv` 按配置路径自动加载环境变量到 `process.env`
- 校验报告：`reportOutput` 生成 JSON 格式的校验结果报告
- 校验摘要：`showSummary` 在终端输出通过/缺失/失败统计

**配置选项**：

| 选项                | 类型                                    | 默认值                                                          | 描述                                 |
| ------------------- | --------------------------------------- | --------------------------------------------------------------- | ------------------------------------ |
| required            | `Record<string, EnvFieldRule>`          | `{}`                                                            | 环境变量校验规则映射                 |
| failAction          | `'error'` \| `'warn'` \| `'ignore'`     | `'error'`                                                       | 校验失败时的处理动作                 |
| generateTemplate    | `boolean`                               | `true`                                                          | 是否自动生成 .env 模板文件           |
| templateOutput      | `string`                                | `'.env.template'`                                               | .env 模板文件的输出路径              |
| runtimeGuard        | `boolean`                               | `false`                                                         | 是否注入运行时环境变量守卫代码       |
| runtimeGlobalName   | `string`                                | `'__ENV_GUARD__'`                                               | 运行时守卫的全局变量名               |
| runtimeGuardMode    | `'console'` \| `'throw'` \| `'overlay'` | `'console'`                                                     | 运行时守卫的行为模式                 |
| envFiles            | `string[]`                              | `['.env', '.env.local', '.env.production', '.env.development']` | 需要加载的 .env 文件路径列表         |
| autoLoadEnv         | `boolean`                               | `true`                                                          | 是否自动加载 .env 文件到 process.env |
| reportOutput        | `string` \| `false`                     | `false`                                                         | 校验报告输出路径，`false` 不生成     |
| validateBeforeBuild | `boolean`                               | `true`                                                          | 是否在构建前执行校验                 |
| showSummary         | `boolean`                               | `true`                                                          | 是否输出校验摘要日志                 |

**EnvFieldRule 类型**：

| 属性        | 类型                                   | 描述                                   |
| ----------- | -------------------------------------- | -------------------------------------- |
| type        | `EnvType`                              | 值类型，默认 `'string'`                |
| required    | `boolean`                              | 是否为必需字段，默认 `true`            |
| pattern     | `RegExp`                               | 正则表达式，值必须匹配此模式           |
| validator   | `(value: string) => boolean \| string` | 自定义验证函数                         |
| message     | `string`                               | 自定义错误消息                         |
| default     | `string`                               | 当值为空时使用的默认值                 |
| enumValues  | `string[]`                             | 枚举值列表（仅 `enum` 类型）           |
| minValue    | `number`                               | 数值最小值（仅 `number` 类型）         |
| maxValue    | `number`                               | 数值最大值（仅 `number` 类型）         |
| minLength   | `number`                               | 字符串最小长度（仅字符串类类型）       |
| maxLength   | `number`                               | 字符串最大长度（仅字符串类类型）       |
| group       | `string`                               | 变量分组名称，用于模板生成时的分组显示 |
| description | `string`                               | 变量描述信息，用于模板生成时的说明文本 |
| sensitive   | `boolean`                              | 是否为敏感变量，模板中会隐藏实际值     |

**EnvValidationResult 类型**：

| 属性    | 类型                                                                                                                      | 描述             |
| ------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| key     | `string`                                                                                                                  | 环境变量名       |
| status  | `'pass'` \| `'missing'` \| `'type_error'` \| `'custom_error'` \| `'enum_mismatch'` \| `'range_error'` \| `'length_error'` | 验证状态         |
| message | `string`                                                                                                                  | 验证消息         |
| value   | `string` \| `undefined`                                                                                                   | 环境变量的有效值 |
| rule    | `EnvFieldRule`                                                                                                            | 应用的校验规则   |

**EnvGuardResult 类型**：

| 属性      | 类型                    | 描述                       |
| --------- | ----------------------- | -------------------------- |
| timestamp | `string`                | 校验时间戳（ISO 格式）     |
| total     | `number`                | 校验的环境变量总数         |
| passed    | `number`                | 校验通过的变量数量         |
| missing   | `number`                | 缺失的必需变量数量         |
| invalid   | `number`                | 校验失败的变量数量         |
| results   | `EnvValidationResult[]` | 所有变量的详细校验结果列表 |
| allPassed | `boolean`               | 是否所有变量均校验通过     |

### @common/ui（新增模块）

终端 UI 工具模块，提供 ANSI 转义码处理、Spinner 动画帧和字符串清理等工具函数。

- `ANSI` — ANSI 转义码工具集，包含光标控制（`reset`、`clearLine`、`hideCursor`、`showCursor`）和彩色文本包装（`green`、`cyan`、`gray`、`bold`、`red`、`yellow`、`magenta`）
- `SPINNER_FRAMES` — Spinner 动画帧序列，Windows 平台使用 ASCII 字符 `|`/`/`/`-`/`\`，其他平台使用 Unicode Braille 字符 `⠋`-`⠏`
- `stripAnsi(str)` — 移除字符串中的所有 ANSI 转义码，用于计算文本实际显示宽度或将彩色输出转为纯文本

### @common/validation（增强）

新增环境变量验证相关类型和函数：

- `EnvType` 类型 — 环境变量值类型，支持 `'string'` \| `'number'` \| `'url'` \| `'boolean'` \| `'enum'` \| `'json'` \| `'semver'` \| `'path'`
- `EnvFieldRule` 接口 — 环境变量字段校验规则，包含类型约束、范围限制、自定义验证函数和元数据信息
- `EnvValidationResult` 接口 — 环境变量验证结果，包含验证状态、错误消息和有效值
- `STRING_LIKE_TYPES` 常量 — 字符串类类型集合，用于长度验证时判断是否需要检查 `minLength`/`maxLength`
- `validateType(value, rule)` — 验证环境变量值的类型
- `validateRange(value, rule)` — 验证数值范围（仅 `number` 类型）
- `validateLength(value, rule)` — 验证字符串长度（仅字符串类类型）
- `validateValue(key, value, rule)` — 验证单个环境变量值（按顺序执行缺失检查、类型验证、范围验证、长度验证、正则验证、自定义验证）
- `validateEnvironment(env, rules)` — 批量验证环境变量

### 子路径导出（增强）

- `@meng-xi/vite-plugin/plugins` 新增导出类型：`EnvGuardOptions`、`EnvGuardResult`、`EnvFailAction`、`RuntimeGuardMode`
- `@meng-xi/vite-plugin/plugins` 新增导出函数：`envGuard`
- `@meng-xi/vite-plugin/common/ui` 新增子路径导出，包含 `ANSI`、`SPINNER_FRAMES`、`stripAnsi`
- `@meng-xi/vite-plugin/common`
  新增导出：`ANSI`、`SPINNER_FRAMES`、`stripAnsi`、`EnvType`、`EnvFieldRule`、`EnvValidationResult`、`STRING_LIKE_TYPES`、`validateType`、`validateRange`、`validateLength`、`validateValue`、`validateEnvironment`

## 0.1.3（2026-06-01）

新增 bundleAnalyzer 构建产物体积分析插件，新增 @common/compress 和 @common/path 工具模块，@common/format 和 @common/fs 新增通用函数

### bundleAnalyzer（新增）

构建产物体积分析插件，在 Vite 构建（writeBundle）完成后自动扫描输出目录，分析构建产物的体积分布、模块依赖、文件类型统计等关键指标，生成 JSON 报告和/或包含可视化图表的 HTML 报告，支持体积阈值告警和与上次构建的对比分析。`enforce: 'post'`。

**功能特性**：

- 多格式报告输出：`json`（JSON 格式）、`html`（含可视化图表的 HTML）、`both`（同时生成两种）
- 体积分析：计算原始大小和 gzip 压缩大小，使用最高压缩级别（level: 9）
- 阈值告警：超过 `sizeThreshold` 的 chunk 自动产生告警，超过 2 倍阈值标记为 critical
- 构建对比：与历史报告对比体积变化趋势，显示增大、减小、新增、移除的模块
- 可视化图表：HTML 报告支持 treemap（树状图）、sunburst（旭日图）和 list（列表）三种视图
- 模块排行：Top N 大模块排行，区分源码和 node_modules
- 文件类型分布：按扩展名统计体积占比
- 自动打开：`openAnalyzer` 支持跨平台自动在浏览器中打开 HTML 报告
- 分析摘要日志：构建完成后输出 chunk 数量、总体积、gzip 体积、Top 5 模块

**配置选项**：

| 选项               | 类型                                    | 默认值              | 描述                                     |
| ------------------ | --------------------------------------- | ------------------- | ---------------------------------------- |
| outputFormat       | `'json'` \| `'html'` \| `'both'`        | `'json'`            | 报告输出格式                             |
| outputFile         | `string`                                | `'bundle-analysis'` | 报告输出文件名（不含扩展名）             |
| openAnalyzer       | `boolean`                               | `false`             | 是否在生成 HTML 报告后自动打开浏览器     |
| sizeThreshold      | `number`                                | `100`               | 体积告警阈值（KB）                       |
| topModules         | `number`                                | `20`                | Top N 大模块排行数量                     |
| compareWith        | `string` \| `null`                      | `null`              | 用于对比的历史报告路径                   |
| gzipSize           | `boolean`                               | `true`              | 是否计算 gzip 大小                       |
| excludeNodeModules | `boolean`                               | `false`             | 是否排除 node_modules 中的模块           |
| excludePatterns    | `string[]`                              | `[]`                | 需要排除的文件路径模式列表               |
| includeExtensions  | `string[]`                              | `[]`                | 需要包含的文件扩展名列表，为空则包含所有 |
| defaultChartType   | `'treemap'` \| `'sunburst'` \| `'list'` | `'treemap'`         | HTML 报告中图表的默认展示形式            |

**BundleAnalysisResult 类型**：

| 属性                 | 类型                     | 描述                   |
| -------------------- | ------------------------ | ---------------------- |
| timestamp            | `string`                 | 分析时间戳（ISO 格式） |
| totalSize            | `number`                 | 构建产物总大小（字节） |
| totalGzipSize        | `number`                 | gzip 总大小（字节）    |
| chunks               | `ChunkStats[]`           | chunk 统计列表         |
| topModules           | `ModuleStats[]`          | Top N 大模块           |
| fileTypeDistribution | `FileTypeDistribution[]` | 文件类型分布统计       |
| warnings             | `SizeWarning[]`          | 体积阈值告警列表       |
| comparisonDiffs      | `ComparisonDiff[]`       | 构建对比差异列表       |
| analysisTime         | `number`                 | 分析耗时（毫秒）       |

**ChunkStats 类型**：

| 属性      | 类型                                | 描述                  |
| --------- | ----------------------------------- | --------------------- |
| name      | `string`                            | chunk 名称            |
| size      | `number`                            | 原始大小（字节）      |
| gzipSize  | `number`                            | gzip 压缩大小（字节） |
| modules   | `ModuleStats[]`                     | 包含的模块列表        |
| type      | `'entry'` \| `'chunk'` \| `'asset'` | chunk 类型            |
| fileCount | `number`                            | 包含的文件数量        |

**ModuleStats 类型**：

| 属性         | 类型       | 描述                              |
| ------------ | ---------- | --------------------------------- |
| id           | `string`   | 模块标识符（通常是模块路径或 ID） |
| size         | `number`   | 模块原始大小（字节）              |
| gzipSize     | `number`   | 模块 gzip 压缩后大小（字节）      |
| chunks       | `string[]` | 所属 chunk 名称列表               |
| imports      | `string[]` | 依赖模块 ID 列表                  |
| isEntry      | `boolean`  | 是否为入口模块                    |
| isNodeModule | `boolean`  | 是否来自 node_modules             |

**FileTypeDistribution 类型**：

| 属性       | 类型     | 描述                        |
| ---------- | -------- | --------------------------- |
| extension  | `string` | 文件扩展名（如 `.js`）      |
| count      | `number` | 该类型的文件数量            |
| totalSize  | `number` | 该类型的总大小（字节）      |
| percentage | `number` | 该类型的总体积占比（0-100） |

**SizeWarning 类型**：

| 属性        | 类型                    | 描述           |
| ----------- | ----------------------- | -------------- |
| level       | `'module'` \| `'chunk'` | 告警级别       |
| name        | `string`                | 告警目标名称   |
| sizeKB      | `number`                | 实际大小（KB） |
| thresholdKB | `number`                | 阈值大小（KB） |
| message     | `string`                | 告警消息       |

**ComparisonDiff 类型**：

| 属性           | 类型                                                                        | 描述            |
| -------------- | --------------------------------------------------------------------------- | --------------- |
| name           | `string`                                                                    | 模块/chunk 名称 |
| previousSize   | `number`                                                                    | 上次构建大小    |
| currentSize    | `number`                                                                    | 本次构建大小    |
| diff           | `number`                                                                    | 体积变化量      |
| diffPercentage | `number`                                                                    | 变化百分比      |
| trend          | `'increased'` \| `'decreased'` \| `'unchanged'` \| `'added'` \| `'removed'` | 变化趋势        |

### @common/compress（新增模块）

- `calculateGzipSize(data)` — 计算给定数据的 gzip 压缩后大小（异步），使用最高压缩级别（level: 9），用于估算网络传输体积。参数 `data` 支持 `Buffer` 和 `string` 类型

### @common/path（新增模块）

- `isNodeModule(moduleId)` — 判断模块 ID 是否来自 node_modules。检测规则：路径包含 `node_modules`、以 `\0` 开头（Rollup 内部虚拟模块）、以 `virtual:` 开头（虚拟模块前缀）

### @common/format（增强）

新增以下工具函数：

- `escapeHtmlAttr(str)` — 转义 HTML 属性值中的特殊字符，防止 XSS 注入。将 `&`、`"`、`<`、`>` 分别转义为 `&amp;`、`&quot;`、`&lt;`、`&gt;`
- `formatFileSize(bytes)` — 将字节数格式化为人类可读的文件大小字符串。小于 1KB 显示 `xB`，小于 1MB 显示 `x.xKB`，大于等于 1MB 显示 `x.xxMB`
- `getExtension(filePath)` — 获取文件扩展名，返回小写的扩展名（含点号，如 `.js`）

### @common/fs（增强）

新增以下工具函数和类型：

- `scanDirectory(dirPath, options?)` — 递归扫描目录，收集所有文件信息，支持按扩展名（`includeExtensions`）、路径模式（`excludePatterns`）和自定义过滤函数（`filter`）进行过滤
- `writeJsonReport(filePath, data, indent?)` — 将数据对象序列化为 JSON 格式并写入文件，默认缩进 2 个空格
- `ScannedFile` 类型 — 扫描文件信息接口，包含 `filePath`、`size`、`extension` 字段
- `ScanDirectoryOptions` 类型 — 目录扫描选项接口，包含 `includeExtensions`、`excludePatterns`、`filter` 字段

### 子路径导出（增强）

- `@meng-xi/vite-plugin/plugins` 新增导出类型：`BundleAnalyzerOptions`、`BundleAnalysisResult`、`BundleOutputFormat`、`ChunkStats`、`ModuleStats`、`FileTypeDistribution`、`SizeWarning`、`ComparisonDiff`
- `@meng-xi/vite-plugin/plugins` 新增导出函数：`bundleAnalyzer`
- `@meng-xi/vite-plugin/common/compress` 新增子路径导出，包含 `calculateGzipSize`
- `@meng-xi/vite-plugin/common/path` 新增子路径导出，包含 `isNodeModule`
- `@meng-xi/vite-plugin/common` 新增导出函数：`calculateGzipSize`、`isNodeModule`、`escapeHtmlAttr`、`formatFileSize`、`getExtension`、`scanDirectory`、`writeJsonReport`
- `@meng-xi/vite-plugin/common` 新增导出类型：`ScannedFile`、`ScanDirectoryOptions`

## 0.1.2（2026-05-31）

新增 compressAssets 构建产物压缩插件，所有插件参数可选化，新增 @common/object 和 @common/fs 完整工具函数

### compressAssets（新增）

构建产物压缩插件，在 Vite 构建（writeBundle）完成后自动扫描输出目录中的文件，使用 gzip 和/或 brotli 算法进行压缩，生成对应的 `.gz` / `.br` 文件。

**功能特性**：

- 三种压缩算法：`gzip`（输出 `.gz`）、`brotli`（输出 `.br`）、`both`（同时生成两种）
- 文件过滤：`includeExtensions` 包含扩展名、`excludeExtensions` 排除扩展名（优先级高于 include）、`excludePaths` 排除路径前缀
- 压缩阈值：`threshold` 小于指定字节的文件跳过压缩
- 并发压缩：`parallelLimit` 控制同时压缩的最大文件数
- 压缩报告：`reportOutput` 生成 JSON 格式的压缩统计报告，设为 `false` 不生成
- 原始文件删除：`deleteOriginalFile` 压缩后删除原始文件，仅保留压缩版本
- 压缩率 Top 5 日志：构建完成后输出压缩率最高的 5 个文件详情
- 执行时机：`enforce: 'post'`，确保在 Vite 构建完成后执行
- 路径跨平台兼容：路径比较时统一将反斜杠转换为正斜杠

**配置选项**：

| 选项               | 类型                               | 默认值                                                      | 描述                                     |
| ------------------ | ---------------------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| algorithm          | `'gzip'` \| `'brotli'` \| `'both'` | `'gzip'`                                                    | 压缩算法                                 |
| threshold          | `number`                           | `1024`                                                      | 最小压缩阈值（字节），小于此大小跳过     |
| deleteOriginalFile | `boolean`                          | `false`                                                     | 压缩后是否删除原始文件                   |
| includeExtensions  | `string[]`                         | `['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt']` | 需要压缩的文件扩展名列表                 |
| excludeExtensions  | `string[]`                         | `[]`                                                        | 排除的文件扩展名列表，优先级高于 include |
| excludePaths       | `string[]`                         | `[]`                                                        | 排除的路径前缀列表                       |
| compressionLevel   | `number`                           | `9`                                                         | gzip 压缩级别（1-9）                     |
| brotliQuality      | `number`                           | `11`                                                        | brotli 质量参数（1-11）                  |
| reportOutput       | `string` \| `false`                | `'compress-report.json'`                                    | 压缩报告输出路径，`false` 不生成         |
| parallelLimit      | `number`                           | `10`                                                        | 并发压缩的最大文件数                     |

**CompressStats 类型**：

| 属性           | 类型                   | 描述                  |
| -------------- | ---------------------- | --------------------- |
| file           | `string`               | 原始文件路径          |
| originalSize   | `number`               | 原始大小（字节）      |
| compressedSize | `number`               | 压缩后大小（字节）    |
| ratio          | `number`               | 压缩率百分比（0-100） |
| algorithm      | `'gzip'` \| `'brotli'` | 使用的压缩算法        |

**CompressSummary 类型**：

| 属性                | 类型              | 描述                   |
| ------------------- | ----------------- | ---------------------- |
| totalFiles          | `number`          | 压缩文件总数           |
| totalOriginalSize   | `number`          | 原始大小总和（字节）   |
| totalCompressedSize | `number`          | 压缩后大小总和（字节） |
| totalRatio          | `number`          | 总体压缩率百分比       |
| gzipFiles           | `number`          | gzip 压缩文件数        |
| brotliFiles         | `number`          | brotli 压缩文件数      |
| executionTime       | `number`          | 总耗时（毫秒）         |
| stats               | `CompressStats[]` | 每个文件的详细统计     |

### 所有插件参数可选化（增强）

所有插件的配置选项中，存在默认值的参数均改为**选填**（添加 `?`），用户只需传入需要覆盖的参数，零配置即可使用。

**受影响的插件类型**：

| 插件                          | 变更说明                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `BuildProgressOptions`        | `width`、`format`、`completeChar`、`incompleteChar`、`clearOnComplete`、`showModuleName`、`theme` 均改为选填 |
| `CompressAssetsOptions`       | 所有业务属性均改为选填，插件提供完整默认值                                                                   |
| `CopyFileOptions`             | `overwrite`、`recursive`、`incremental` 改为选填（`sourceDir`、`targetDir` 仍为必填）                        |
| `FaviconManagerOptions`       | `base`、`url`、`link`、`icons`、`copyOptions` 均改为选填                                                     |
| `GenerateRouterOptions`       | 所有属性均改为选填，插件提供完整默认值                                                                       |
| `GenerateVersionOptions`      | 所有属性均改为选填，插件提供完整默认值                                                                       |
| `VersionUpdateCheckerOptions` | 所有属性均改为选填，插件提供完整默认值                                                                       |
| `HtmlInjectOptions`           | `targetFile`、`security`、`templateVars`、`logInjection` 改为选填（`rules` 仍为必填）                        |
| `LoadingManagerOptions`       | 所有属性均改为选填，插件提供完整默认值                                                                       |

### @common/object（新增模块）

- `deepMerge(...sources)` — 深度合并对象，undefined 值不覆盖已有值，嵌套对象递归合并，数组直接覆盖。用于 BasePlugin 合并默认配置与用户配置

### @common/fs（增强）

新增以下工具函数：

- `checkSourceExists(sourcePath)` — 检查源文件是否存在，不存在时抛出含路径信息的错误
- `ensureTargetDir(targetPath)` — 确保目标目录存在，递归创建
- `fileExists(filePath)` — 异步检查文件是否存在，返回 `boolean`
- `copySourceToTarget(sourcePath, targetPath, options)` — 复制文件或目录，支持递归、覆盖、增量复制和并发控制
- `writeFileContent(filePath, content)` — 写入文件内容，权限错误时抛出含路径信息的错误
- `readFileContent(filePath)` — 异步读取文件内容，权限错误时抛出含路径信息的错误
- `readFileSync(filePath)` — 同步读取文件内容（已废弃，请使用异步版本）
- `CopyOptions` 类型 — 复制操作选项接口（`recursive`、`overwrite`、`incremental`、`parallelLimit`、`skipEmptyDirs`）
- `CopyResult` 类型 — 复制结果接口（`copiedFiles`、`skippedFiles`、`copiedDirs`、`executionTime`）

### @common/format（增强）

新增以下工具函数：

- `generateRandomHash(length)` — 生成随机哈希字符串，范围 1-64，用于版本号生成
- `formatDate(date, format)` — 格式化日期，支持 `{YYYY}`、`{MM}`、`{DD}` 等占位符
- `parseTemplate(template, values)` — 解析模板字符串，替换占位符
- `toCamelCase(str)` — 将字符串转换为 camelCase（如 `pages/user/profile` → `pagesUserProfile`）
- `toPascalCase(str)` — 将字符串转换为 PascalCase（如 `user-profile` → `UserProfile`）
- `stripJsonComments(jsonString)` — 移除 JSON 字符串中的单行和多行注释
- `DateFormatOptions` 类型 — 日期格式化参数接口

### BasePlugin（增强）

- `mergeOptions` 方法改用 `deepMerge` 合并基础默认值、插件默认值和用户配置，确保 undefined 不覆盖默认值
- 新增 `validator` 属性 — `Validator<T>` 实例，子类可在 `validateOptions` 中使用流式验证
- 新增 `getEnforce()` 方法 — 子类可覆盖以指定插件执行时机（如 `'post'`），默认 `undefined`
- 新增 `onConfigResolved(config)` 生命周期方法 — Vite 配置解析完成后调用，存储 `viteConfig`
- 新增 `handleError(error, context)` 方法 — 根据 `errorStrategy` 统一处理错误
- `toPlugin` 方法增强 — 自动注册 `configResolved` 和 `closeBundle` 钩子，`closeBundle` 时自动调用 `destroy`

### 子路径导出（增强）

- `@meng-xi/vite-plugin/plugins` 新增导出类型：`CompressAssetsOptions`、`CompressAlgorithm`、`CompressStats`、`CompressSummary`
- `@meng-xi/vite-plugin/plugins` 新增导出函数：`compressAssets`
- `@meng-xi/vite-plugin/common` 新增导出类型：`CopyOptions`、`CopyResult`、`DateFormatOptions`
- `@meng-xi/vite-plugin/common`
  新增导出函数：`deepMerge`、`checkSourceExists`、`ensureTargetDir`、`fileExists`、`copySourceToTarget`、`writeFileContent`、`readFileContent`、`generateRandomHash`、`formatDate`、`parseTemplate`、`toCamelCase`、`toPascalCase`、`stripJsonComments`

## 0.1.1（2026-05-30）

新增 htmlInject HTML 内容注入插件，新增通用工具函数和类型，Validator 新增枚举和数值范围验证

### htmlInject（新增）

HTML 内容注入插件，根据配置规则将自定义 HTML 内容注入到目标 HTML 文件中，支持多种注入位置、条件注入、模板变量替换和安全过滤。

**功能特性**：

- 7 种注入位置：`head-start`、`head-end`、`body-start`、`body-end`、`before-selector`、`after-selector`、`replace-selector`
- 条件注入：支持 `env`（环境变量）、`file-contains`（文件内容检测）、`custom`（自定义函数）三种条件类型，支持 `negate` 取反
- 选择器匹配：支持 `string`（字符串精确匹配）和 `regex`（正则表达式匹配）两种模式
- 模板变量替换：全局 `templateVars` + 规则级 `templateVars`，使用 `{{变量名}}` 语法，规则级变量优先级高于全局
- 规则优先级：`priority` 数值越小越先执行，默认 100
- 安全过滤：`SecurityConfig` 支持阻止危险标签（script、iframe、object 等）和危险属性（onclick、onerror 等事件处理器），支持白名单 `allowedTags` 和自定义阻止列表
- 脚本注入控制：`allowScriptInjection` 允许跳过安全检查，但输出警告日志
- 注入日志：`logInjection` 记录每条规则的执行结果，`getInjectionLogs()` 可获取日志副本
- 目标文件匹配：`targetFile` 支持文件名和相对路径匹配，默认匹配 `index.html`
- 注入时机：`transformIndexHtml` 钩子 `order: 'post'`，确保在其他插件之后执行

**配置选项**：

| 选项         | 类型                     | 默认值         | 描述                       |
| ------------ | ------------------------ | -------------- | -------------------------- |
| targetFile   | `string`                 | `'index.html'` | 目标 HTML 文件路径或文件名 |
| rules        | `InjectRule[]`           | -（必填）      | 注入规则数组               |
| security     | `SecurityConfig`         | -              | 安全配置                   |
| templateVars | `Record<string, string>` | -              | 全局模板变量               |
| logInjection | `boolean`                | `true`         | 是否在控制台输出注入日志   |

**InjectRule 接口**：

| 字段                 | 类型                     | 默认值     | 描述                              |
| -------------------- | ------------------------ | ---------- | --------------------------------- |
| id                   | `string`                 | -          | 规则唯一标识符                    |
| content              | `string`                 | -（必填）  | 要注入的 HTML 内容                |
| position             | `InjectPosition`         | -（必填）  | 注入位置                          |
| selector             | `string`                 | -          | 选择器（selector 相关位置时必填） |
| selectorMatch        | `'string' \| 'regex'`    | `'string'` | 选择器匹配模式                    |
| priority             | `number`                 | `100`      | 规则优先级，数值越小越先执行      |
| condition            | `InjectCondition`        | -          | 注入条件                          |
| templateVars         | `Record<string, string>` | -          | 规则级模板变量（覆盖全局）        |
| allowScriptInjection | `boolean`                | `false`    | 是否允许注入脚本等危险内容        |

**SecurityConfig 接口**：

| 字段                     | 类型       | 默认值 | 描述                 |
| ------------------------ | ---------- | ------ | -------------------- |
| blockDangerousTags       | `boolean`  | `true` | 是否阻止危险标签     |
| blockDangerousAttributes | `boolean`  | `true` | 是否阻止危险属性     |
| allowedTags              | `string[]` | -      | 允许通过的标签白名单 |
| blockedTags              | `string[]` | -      | 自定义阻止标签列表   |
| blockedAttributes        | `string[]` | -      | 自定义阻止属性列表   |

### 通用工具函数（新增）

**format 模块**（`@meng-xi/vite-plugin/common`）：

- `escapeHtmlAttr(str)` — 转义 HTML 属性值中的特殊字符（`&`、`"`、`<`、`>`），防止 XSS 注入
- `padNumber(num, length)` — 数字补零格式化（如 `padNumber(5, 2)` → `'05'`）
- `getDateFormatParams(date)` — 获取日期格式化参数对象，新增 `{SSS}` 三位毫秒占位符

**html 模块**（`@meng-xi/vite-plugin/common`）：

- `injectBeforeTagWithFallback(html, code, fallbackMessage?)` — 带回退策略的 HTML 注入，依次尝试 `</body>` → `</html>` → 末尾追加，返回 `HtmlInjectResult & { usedFallback: boolean }`
- `injectHeadAndBody(html, headCode, bodyCode)` — 双区域 HTML 注入（head + body），返回 `DualInjectResult`
- `DualInjectResult` 类型 — 双区域注入结果接口，包含 `html`、`headInjected`、`bodyInjected`、`usedFallback` 字段

**validation 模块**（`@meng-xi/vite-plugin/common`，新增模块）：

- `validateGlobalName(name, fieldName)` — 验证全局变量名的合法性（包装 `validateIdentifierName`，附加字段上下文信息）
- `validateNoScriptInTemplate(template, fieldName)` — 验证模板字符串不包含 script 标签（XSS 防护）
- `validateCallbackFields(callbacks, fields, objectName)` — 验证回调字段不包含 script 标签
- `validateNonNegativeNumber(value, fieldName)` — 验证数值为非负数
- `validateNestedDuration(config, errorMsg)` — 验证嵌套配置项的 duration 合法性
- `validateEnumValue(value, allowedValues, fieldName)` — 验证字符串值是否在允许的枚举列表中

### Validator（增强）

- 新增 `enum(allowedValues)` 方法 — 验证字段值是否在允许的枚举列表中
- 新增 `minValue(min)` 方法 — 验证数字字段值是否不小于指定最小值
- 新增 `maxValue(max)` 方法 — 验证数字字段值是否不大于指定最大值

### 子路径导出（增强）

- `@meng-xi/vite-plugin/plugins` 新增导出类型：`HtmlInjectOptions`、`InjectRule`、`InjectPosition`、`InjectCondition`、`ConditionType`、`SecurityConfig`、`InjectionLogEntry`、`SelectorMatch`
- `@meng-xi/vite-plugin/plugins` 新增导出函数：`htmlInject`
- `@meng-xi/vite-plugin/common` 新增导出类型：`DualInjectResult`
- `@meng-xi/vite-plugin/common`
  新增导出函数：`injectBeforeTagWithFallback`、`injectHeadAndBody`、`escapeHtmlAttr`、`padNumber`、`getDateFormatParams`、`validateGlobalName`、`validateNoScriptInTemplate`、`validateCallbackFields`、`validateNonNegativeNumber`、`validateNestedDuration`、`validateEnumValue`

## 0.1.0（2026-05-24）

新增 versionUpdateChecker 版本更新检查插件，插件重命名（injectIco → faviconManager，injectLoading → loadingManager），新增通用工具模块

### versionUpdateChecker（新增）

运行时版本更新检查器，定期检查版本号变更并向用户显示刷新提示，通常与 `generateVersion` 插件配合使用。

**功能特性**：

- 三种版本来源：`define`（全局变量）、`file`（version.json）、`auto`（自动检测，优先 define 回退 file）
- 三种提示 UI 样式：`modal`（居中弹窗）、`banner`（顶部横幅）、`toast`（底部轻提示）
- 自定义提示模板：`customPromptTemplate` 支持占位符 `{{message}}`、`{{currentVersion}}`、`{{newVersion}}`、`{{refreshButton}}`、`{{dismissButton}}`
- 自定义样式：`customStyle` 追加到内置样式之后
- 页面可见性变化时立即检查：`checkOnVisibilityChange`，用户从其他标签页切回时触发
- 开发模式控制：`enableInDev` 可选是否在开发环境启用
- 生命周期回调：`onUpdateAvailable`、`onRefresh`、`onDismiss`，以函数体字符串形式提供
- XSS 防护：`customPromptTemplate` 和回调字符串不允许包含 `<script>` 标签
- 标识符安全：`defineName` 通过 `validateIdentifierName` 验证，防止原型污染
- SSR 安全：注入的 JS 代码包含 `typeof window === 'undefined'` 检测
- 销毁清理：清理定时器、DOM 元素、全局函数

**配置选项**：

| 选项                    | 类型                             | 默认值                                     | 描述                         |
| ----------------------- | -------------------------------- | ------------------------------------------ | ---------------------------- |
| versionSource           | `'define' \| 'file' \| 'auto'`   | `'auto'`                                   | 当前版本号的来源             |
| defineName              | `string`                         | `'__APP_VERSION__'`                        | define 模式下的全局变量名    |
| checkUrl                | `string`                         | `'/version.json'`                          | 版本检查文件的 URL 路径      |
| checkInterval           | `number`                         | `300000`（5 分钟）                         | 版本检查间隔时间（毫秒）     |
| checkOnVisibilityChange | `boolean`                        | `true`                                     | 页面可见性变化时是否立即检查 |
| enableInDev             | `boolean`                        | `false`                                    | 是否在开发模式下启用         |
| promptStyle             | `'modal' \| 'banner' \| 'toast'` | `'modal'`                                  | 更新提示 UI 样式             |
| promptMessage           | `string`                         | `'发现新版本，是否立即刷新获取最新内容？'` | 更新提示消息文本             |
| refreshButtonText       | `string`                         | `'立即刷新'`                               | 刷新按钮文本                 |
| dismissButtonText       | `string`                         | `'稍后再说'`                               | 忽略按钮文本                 |
| customPromptTemplate    | `string`                         | -                                          | 自定义提示 UI 的 HTML 模板   |
| customStyle             | `string`                         | -                                          | 自定义样式字符串             |
| onUpdateAvailable       | `string`                         | -                                          | 发现新版本时的回调           |
| onRefresh               | `string`                         | -                                          | 用户选择刷新时的回调         |
| onDismiss               | `string`                         | -                                          | 用户选择忽略时的回调         |

### 插件重命名（Breaking Change）

- `injectIco` → `faviconManager`：网站图标管理插件，功能不变，名称更准确地反映职责
- `injectLoading` → `loadingManager`：全局 Loading 状态管理插件，功能不变，名称更准确地反映职责

### faviconManager（增强）

- 新增字符串简写配置：`faviconManager('/assets')` 等同于 `faviconManager({ base: '/assets' })`
- `url` 选项描述修正：明确覆盖 `base + favicon.ico` 而非仅覆盖 `base`

### loadingManager（增强）

- 新增运行时 API：
  - `toggle(text?)` — 切换 Loading 显示/隐藏状态
  - `enablePointerEvents()` — 启用遮罩层指针事件，拦截所有点击和滚动操作
  - `disablePointerEvents()` — 禁用遮罩层指针事件，允许交互穿透
  - `togglePointerEvents()` — 切换遮罩层指针事件状态
  - `isPointerEventsEnabled()` — 获取当前是否启用了指针事件

### 通用工具函数（新增模块）

**html 模块**（`@meng-xi/vite-plugin/common`）：

- `injectBeforeTag(html, tag, code)` — 在 HTML 中指定闭合标签前注入代码，返回 `{ html, injected }` 结果对象
- `injectHtmlByPriority(html, code, targets?)` — 按优先级向 HTML 中注入代码，默认依次尝试 `</head>`、`</body>`、`</html>`
- `HtmlInjectResult` 类型 — 注入结果接口，包含 `html` 和 `injected` 字段

**script 模块**（`@meng-xi/vite-plugin/common`）：

- `makeCallback(body?, context?, params?)` — 将回调函数体字符串包装为安全的函数表达式（包含 try-catch 保护）
- `containsScriptTag(str)` — 检测字符串是否包含 `<script>` 标签（XSS 防护）
- `validateIdentifierName(name)` — 验证字符串是否为合法的 JavaScript 标识符，排除可能导致原型污染的内置属性

### 子路径导出（增强）

- `@meng-xi/vite-plugin/plugins` 新增导出类型：`VersionUpdateCheckerOptions`、`VersionSource`、`PromptStyle`、`FaviconManagerOptions`、`LoadingManagerOptions`、`LoadingManager`
- `@meng-xi/vite-plugin/common` 新增导出类型：`HtmlInjectResult`
- `@meng-xi/vite-plugin/common` 新增导出函数：`injectBeforeTag`、`injectHtmlByPriority`、`makeCallback`、`containsScriptTag`、`validateIdentifierName`

## 0.0.9（2026-05-23）

修复 injectLoading 严重问题，新增 LoadingManager 运行时 API，优化插件开发框架

### injectLoading（修复 + 增强）

**修复**：

- 修复 `style.pointerEvents` 默认值错误，正确默认为 `true`（启用遮罩层指针事件，拦截交互），此前版本默认为 `false` 导致遮罩层无法阻止用户操作
- 修复 LoadingManager 运行时 API 不完整的问题，补充缺失的方法

**新增运行时 API**：

- `toggle(text?)` — 切换 Loading 显示/隐藏状态
- `enablePointerEvents()` — 启用遮罩层指针事件，拦截所有点击和滚动操作
- `disablePointerEvents()` — 禁用遮罩层指针事件，允许交互穿透
- `togglePointerEvents()` — 切换遮罩层指针事件状态
- `isPointerEventsEnabled()` — 获取当前是否启用了指针事件

### injectIco（增强）

- 新增字符串简写配置：`injectIco('/assets')` 等同于 `injectIco({ base: '/assets' })`
- `url` 选项描述修正：明确覆盖 `base + favicon.ico` 而非仅覆盖 `base`

### BasePlugin（增强）

- 新增 `safeExecute(fn, context)` 异步安全执行方法，根据 `errorStrategy` 策略自动处理错误
- 新增 `safeExecuteSync(fn, context)` 同步安全执行方法，根据 `errorStrategy` 策略自动处理错误
- 构造函数中自动使用 `safeExecuteSync` 包裹 `validateOptions()` 调用，验证失败不再导致构建崩溃（`errorStrategy` 为 `'log'` 或 `'ignore'` 时）

### createPluginFactory（增强）

- 新增选项标准化器（`OptionsNormalizer`）支持，允许插件接受非对象类型的简写配置
- 工厂函数泛型新增 `R` 参数，支持原始输入类型与标准化后类型不同

### 通用工具函数（新增）

- `readDirRecursive(dirPath, recursive)` — 递归读取目录内容，返回文件和目录条目信息，避免冗余 stat 调用
- `runWithConcurrency(items, handler, concurrency)` — 带并发限制的批量执行，控制异步操作并发数
- `shouldUpdateFile(sourceFile, targetFile)` — 检查文件是否需要更新（比较修改时间和文件大小），用于增量复制

### buildProgress（增强）

- 新增进度计算逻辑说明：config(5%) → resolve(10%) → transform(15%-85%) → bundle(+10%) → write(+5%) → done(100%)
- 非 TTY 终端环境（如 CI/CD）自动降级为日志输出模式

### copyFile（增强）

- 明确执行时机为 `enforce: 'post'`，确保在 Vite 构建完成后执行

### generateRouter（增强）

- 新增 `metaMapping` 默认值说明：默认为 `{ navigationBarTitleText: 'title', requireAuth: 'requireAuth' }`
- 新增 `nameStrategy` 为 `'custom'` 时必须提供 `customNameGenerator` 的约束说明

### generateVersion（增强）

- 新增 `customFormat` 占位符完整文档：`{YYYY}`、`{YY}`、`{MM}`、`{DD}`、`{HH}`、`{mm}`、`{ss}`、`{timestamp}`、`{hash}`、`{major}`、`{minor}`、`{patch}`

### 子路径导出（增强）

- 新增 `PluginFactory`、`OptionsNormalizer` 类型导出
- 新增 `DateFormatOptions` 类型导出
- 新增 `readDirRecursive`、`runWithConcurrency`、`shouldUpdateFile` 函数导出

## 0.0.8（2026-05-21）

新增 injectLoading 全局 Loading 状态管理插件，**此插件存在严重问题，请尽快升级到0.0.9版本**

### injectLoading（新增）

注入全局 Loading 状态管理，支持白屏 Loading、请求自动拦截、自定义样式与动画、生命周期回调。

**功能特性**：

- 白屏 Loading：`defaultVisible` 为 `true` 时，CSS 和 HTML 以静态标签注入到 `<head>`，HTML 解析即显示，无需等待 JS 执行
- 自动隐藏时机：支持 `DOMContentLoaded`、`load`、`manual` 三种策略，适配 SSR/MPA 和 SPA 场景
- 请求自动拦截：`autoBind` 支持 `fetch`、`xhr`、`all`、`none` 四种模式，自动管理 Loading 状态
- 请求过滤：`requestFilter` 支持 URL 正则排除/包含、HTTP 方法排除、URL 前缀排除，`includeUrls` 优先级高于 `excludeUrls`
- 四种内置图标：`spinner`（旋转圆环）、`dots`（三点跳动）、`pulse`（脉冲）、`bar`（进度条）
- 过渡动画：可配置 CSS 过渡效果（持续时间、缓动函数），CSS 与 JS 动画协同避免冲突
- 最小显示时间：防止 Loading 闪烁，确保至少显示指定时长
- 延迟显示：请求在短时间内完成时不显示 Loading，避免闪烁
- 防抖隐藏：频繁触发 hide 时延迟执行，避免闪烁
- 自定义样式：支持遮罩层颜色、图标颜色/大小、文本颜色/大小、z-index、点击穿透、背景模糊等
- 自定义模板：`customTemplate` 支持完全自定义 HTML 结构
- 生命周期回调：`onBeforeShow`、`onShow`、`onBeforeHide`、`onHide`、`onDestroy`，以函数体字符串形式提供
- 运行时 API：注入 `window.__LOADING_MANAGER__`（可通过 `globalName` 自定义），提供 `show`、`hide`、`forceHide`、`updateText`、`isVisible`、`getPendingCount`、`destroy` 方法
- SSR 安全：注入的 JS 代码包含 `typeof window === 'undefined'` 检测，SSR 环境自动跳过
- 销毁清理：`destroy()` 清理 DOM 元素、style 标签、定时器，并恢复原始 fetch/XHR 拦截

**配置选项**：

| 选项           | 类型                                       | 默认值                  | 描述                                                 |
| -------------- | ------------------------------------------ | ----------------------- | ---------------------------------------------------- |
| position       | `'center' \| 'top' \| 'bottom'`            | `'center'`              | Loading 显示位置                                     |
| defaultText    | `string`                                   | `'加载中...'`           | 默认显示文本                                         |
| spinnerType    | `'spinner' \| 'dots' \| 'pulse' \| 'bar'`  | `'spinner'`             | 旋转图标类型                                         |
| style          | `LoadingStyle`                             | 见下方                  | 自定义样式配置                                       |
| transition     | `TransitionConfig`                         | `{ enabled: true }`     | 过渡动画配置                                         |
| minDisplayTime | `MinDisplayTime`                           | `{ enabled: true }`     | 最小显示时间配置                                     |
| delayShow      | `DelayShow`                                | `{ enabled: true }`     | 延迟显示配置                                         |
| debounceHide   | `DebounceHide`                             | `{ enabled: false }`    | 防抖隐藏配置                                         |
| autoBind       | `'fetch' \| 'xhr' \| 'all' \| 'none'`      | `'none'`                | 自动绑定请求拦截模式                                 |
| requestFilter  | `RequestFilter`                            | -                       | 请求过滤配置                                         |
| globalName     | `string`                                   | `'__LOADING_MANAGER__'` | 注入到浏览器的全局变量名                             |
| customTemplate | `string`                                   | -                       | 自定义 Loading HTML 模板                             |
| defaultVisible | `boolean`                                  | `false`                 | DOM 初始可见状态（白屏 Loading）                     |
| autoHideOn     | `'DOMContentLoaded' \| 'load' \| 'manual'` | `'DOMContentLoaded'`    | 自动隐藏时机（仅 `defaultVisible` 为 `true` 时生效） |
| callbacks      | `LoadingCallbacks`                         | -                       | 生命周期回调                                         |

## 0.0.7（2026-05-19）

新增 buildProgress 构建进度条插件

### buildProgress（新增）

在终端实时显示 Vite 构建进度条，支持三种显示格式和自定义颜色主题。

**功能特性**：

- 支持三种进度显示格式：`bar`（完整进度条）、`spinner`（旋转动画）、`minimal`（精简模式）
- 基于构建生命周期计算进度：config(5%) → resolve(10%) → transform(15%-85%) → bundle(+10%) → write(+5%) → done(100%)
- 支持自定义进度条宽度、填充字符、颜色主题
- 可选显示当前处理的模块名称，超长自动截断
- 非 TTY 环境（如 CI/CD）自动降级为日志输出
- `destroy()` 生命周期中停止动画定时器并恢复终端光标，防止终端状态异常

**配置选项**：

| 选项            | 类型                                  | 默认值 | 描述                     |
| --------------- | ------------------------------------- | ------ | ------------------------ |
| width           | number                                | 30     | 进度条宽度（字符数）     |
| format          | `'bar'` \| `'spinner'` \| `'minimal'` | 'bar'  | 进度条显示格式           |
| completeChar    | string                                | '█'    | 已完成部分填充字符       |
| incompleteChar  | string                                | '░'    | 未完成部分填充字符       |
| clearOnComplete | boolean                               | true   | 构建完成后是否清除进度条 |
| showModuleName  | boolean                               | true   | 是否显示当前模块名称     |
| theme           | ProgressTheme                         | -      | 自定义颜色主题           |

## 0.0.6（2026-05-18）

新增插件销毁生命周期及子路径类型导出，优化日志系统

### BasePlugin

- 新增 `destroy()` 虚方法，插件销毁时自动调用，基类默认注销日志配置，子类可重写添加自定义清理逻辑
- `toPlugin()` 自动在 `closeBundle` 钩子末尾调用 `destroy()`，确保资源正确释放
- `viteConfig` 属性类型修正为 `ResolvedConfig | null`，初始值为 `null`

### Logger

- 新增 `Logger.unregister(pluginName)` 静态方法，注销指定插件的日志配置
- `Logger.destroy()` 清除所有已注册的插件配置并重置单例实例

### generateRouter

- 文件监听器清理逻辑迁移至 `destroy()` 生命周期，确保 `closeBundle` 时正确关闭 watcher

### 子路径导出（Sub-path Exports）

- `@meng-xi/vite-plugin/factory` 新增导出类型：`PluginFactory`、`OptionsNormalizer`、`PluginWithInstance`、`BasePluginOptions`
- `@meng-xi/vite-plugin/plugins`
  新增导出类型：`CopyFileOptions`、`GenerateRouterOptions`、`GenerateVersionOptions`、`InjectIcoOptions`、`Icon`、`VersionFormat`、`OutputType`、`NameStrategy`、`OutputFormat`、`RouteConfig`、`RouteMeta` 等
- `@meng-xi/vite-plugin/common` 新增导出类型：`CopyOptions`、`CopyResult`、`DateFormatOptions`

### injectIco

- 统一图标接口类型名称为 `Icon`（替代旧名 `IconConfig`）

### common/fs

- `readFileSync` 标记为已废弃，推荐使用异步版本 `readFileContent`
- `CopyOptions` 新增 `parallelLimit`（并发限制，默认 10）和 `skipEmptyDirs`（跳过空目录）选项

## 0.0.5（2026-03-05）

generateVersion 支持在构建过程中自动生成版本号，支持多种格式和输出方式

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

## 0.0.4（2026-02-28）

添加 generateVersion 插件及 format 工具导出

- 在 core 包的 common 模块中导出 format 工具
- 在 plugins 模块中添加并导出 generateVersion 插件

优化文件复制和对象合并逻辑，改进图标注入插件

- 重构 readDirRecursive 接口，返回文件/目录条目信息，减少冗余 stat 调用
- 引入并发限制机制，实现并行文件复制，提高 IO 效率
- 优化 copySourceToTarget 函数，支持并行复制及增量更新逻辑
- 深度合并函数 deepMerge 支持跳过 undefined，完善嵌套对象合并规则
- Logger 增加日志图标和颜色，提升控制台输出可读性
- injectIco 插件改用 Vite 官方 HtmlTagDescriptor 接口注入图标标签，增加自定义 link 标签的注入处理
- injectIco 插件 transformIndexHtml 钩子支持同时兼容字符串替换和官方标签注入两种方式

## 0.0.3（2026-02-04）

- 插件工厂新增safeExecuteSync同步函数
- 将日志系统从简单工具类升级为功能完善的单例模式框架
- 新增 PluginLogger 接口，实现插件级别独立日志代理与控制
- 统一日志输出格式，包含时间戳、命名空间、图标与颜色支持
- 通过插件配置映射管理插件日志开关，实现灵活的日志启用控制
- 优化 BasePlugin 中日志初始化流程，调用 createPluginLogger 注入日志代理
- 更新日志级别支持 success/info/warn/error 四种类型
- 改进日志系统性能及扩展性，支持附加数据和调试友好输出
- 完善日志故障排查指南及生产环境性能建议
- Validator 类升级为泛型设计，支持编译时类型安全保障
- BasePlugin 泛型化，集成泛型 Validator 实现类型安全的配置验证
- 增加泛型参数约束 T 和 K，确保字段与默认值类型匹配
- Validator 的 fluent API 支持链式类型推断，增强类型推导连续性
- 自定义验证函数和默认值方法支持类型安全参数
- 更新架构图及 API 文档反映泛型验证机制
- 提供示例及最佳实践，指导类型安全配置开发和错误定位
- 保持与工厂及插件体系兼容，实现泛型验证全链路支持

## 0.0.2（2026-01-26）

1.架构升级，封装插件工厂2.优化日志功能3.新增参数校验功能4.插件新增两个参数，如下所示：

### copyFile 插件

**新增配置选项**：

- `incremental`：是否启用增量复制，仅复制修改过的文件，提高构建效率，默认为 `true`
- `errorStrategy`：错误处理策略：'throw' 抛出错误，'log' 记录日志，'ignore' 忽略错误，默认为 'throw'

### injectIco 插件

**新增配置选项**：

- `incremental`：是否启用增量复制，仅复制修改过的文件，提高构建效率，默认为 `true`
- `errorStrategy`：错误处理策略：'throw' 抛出错误，'log' 记录日志，'ignore' 忽略错误，默认为 'throw'

## 0.0.1（2026-01-21）

### copyFile 插件

用于在 Vite 构建完成后复制文件或目录到指定位置。

**配置选项**：

- `sourceDir`：源目录路径（必填）
- `targetDir`：目标目录路径（必填）
- `overwrite`：是否覆盖已存在的文件，默认为 `true`
- `recursive`：是否递归复制子目录，默认为 `true`
- `verbose`：是否输出详细日志，默认为 `true`
- `enabled`：是否启用插件，默认为 `true`

### injectIco 插件

用于在 Vite 构建过程中注入网站图标链接到 HTML 文件的头部。

**配置选项**：

- `base`：图标文件的基础路径
- `url`：图标的完整 URL
- `link`：自定义的完整 link 标签 HTML
- `icons`：自定义图标数组
- `verbose`：是否输出详细日志，默认为 `true`
- `enabled`：是否启用插件，默认为 `true`
- `copyOptions`：图标文件复制配置
