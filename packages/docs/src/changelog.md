# 更新日志

## [1.4.1] - 2026-09-16

修复 generatePages / generateUni 对自定义页面扩展名（如 `.uvue`）的处理，uni-app x 项目可正常使用 `.uvue` 页面

### 修复

- **pages.json 路径残留扩展名**：页面路径剥离逻辑此前写死仅匹配 `.vue` / `.nvue`，当 `includeExtensions` 配置 `.uvue` 等自定义扩展名时会生成 `pages/home/index.uvue` 这类错误路径，导致页面无法识别。现改为按文件实际扩展名动态剥离——命中 `includeExtensions` 列表（忽略大小写、容忍前导点）才剥离，未配置时保持原 `.vue` / `.nvue` 行为
- **`defineUniPage` 宏在 `.uvue` 页面未剥离**：SFC script 虚拟模块识别由 `id.includes('.vue')` 改为 `/\.(vue|uvue|nvue)(\?|$)/`，兼容 `.uvue` / `.nvue`，避免宏调用残留在构建产物中导致运行时 `ReferenceError`。generatePages / generateUni 两处同步修正

## [1.4.0] - 2026-08-28

新增 `defineUniPage` 宏与页面生成架构重构：扫描页面 → pages.json → 路由配置一条流水线，配套公共 DirectoryWatcher / TaskQueue 统一监听与串行生成，插件总数增至 17 个

### 新增

- **`defineUniPage` 宏**：在 `<script setup>`（或 `<script>` 顶层）中调用，功能与 `<route-config>` 自定义块一致，写法更贴近 JS/TS
  - 同一页面同时声明宏与 `<route-config>` 时，以宏为准（顶层字段按宏覆盖）
  - 参数为 JS 对象字面量，支持注释、单引号、尾随逗号与嵌套对象（`tab` / `style` / `meta`）
  - 运行时无痕：扫描时被消费，构建时自动移除调用，无需 import
  - 自动生成全局类型声明 `src/define-uni-page.d.ts`（`dts` 可自定义路径或 `false` 关闭），Vue (Official) / Volar / tsc 开箱识别
- **`<route-config>` 自定义块**：解析支持 JSONC 尾随逗号（与 `lang="jsonc"` 的 IDE 高亮语义一致）
- **公共模块**：`DirectoryWatcher`（common/fs，目录递归监听，统一管理多目录，平台不支持 `recursive` 时降级跳过并告警）、`TaskQueue`（common/concurrency，串行任务队列，单个任务失败不阻塞后续）
- **factory**：新增 `FunctionHookMap` 类型（钩子名泛型约束收紧为仅函数型钩子）、可重写的 `getBaseDefaults()` 方法

### 增强

- **generatePages / generateUni 重构**：抽取公共 `producePages()` 流水线（扫描页面 + `<route-config>` / `defineUniPage` → 组装 → 合并，内存产出不写盘）；generateUni 内存直传阶段二，消除「先写盘再读盘」往返
- **监听与串行化统一**：generatePages / generateUni / generateRouter 三者统一使用 TaskQueue 串行生成、DirectoryWatcher 管理页面目录监听，避免高频变更时的并发读改写竞态

### 修复

- generatePages / generateUni 的 `<route-config>` 虚拟模块请求匹配由 `id.includes('vue')` 收紧为 `id.includes('?vue')`，避免误拦截

## [1.3.0] - 2026-08-26

新增 generateUni 组合入口插件，一条流水线完成「扫描页面 → pages.json → 路由配置」，插件总数增至 17 个

### 新增

- **`generateUni` 插件**：将 `generatePages` 与 `generateRouter` 编排为一条流水线，等价于两插件连用（原有两个插件保持不变，仍可独立使用）
  - 阶段一扫描页面 + `<route-config>` 产出内存 pages 数据并写盘 pages.json，阶段二直接消费内存数据生成路由配置（+ 可选 dts），避免读盘往返
  - 配置分组：顶层公共项（`pagesJsonPath` / `watch`）+ `pages` 子对象（generatePages 参数）+ `router` 子对象（generateRouter 参数），避免 20+ 平铺选项
  - 监听页面目录变更时串行重跑「阶段一 + 阶段二」，避免并发读写竞态
  - 拦截 `<route-config>` 虚拟模块请求为空模块，避免构建时被当作 JavaScript 解析报错
  - 完整继承 generatePages 的 tabBar 归集 / 分包 / 合并策略与 generateRouter 的 preserveRouteChanges / metaMapping / dts 等
- **子路径导出**：`plugins/generate/generate-uni` 导出 `generateUni` 及类型 `GenerateUniOptions`；`plugins/generate` 聚合导出

### 增强

- **generatePages**：为 standalone 模式补充 `<route-config>` 虚拟模块拦截（对齐 generateUni），避免生产构建把块内容当作 JavaScript 解析报错
- **proxyManager**：`config` 钩子新增 `env.command === 'build'` 拦截，构建时完全跳过代理规则加载与配置生成（代理仅对开发服务器有效，此前打包会白白加载规则并输出误导性日志）

## [1.2.0] - 2026-08-25

新增 generatePages 插件，扫描 Vue 文件 + `<route-config>` 自定义块动态生成 pages.json，插件总数增至 16 个

### 新增

- **`generatePages` 插件**：扫描页面目录与 `<route-config>` 自定义块，自动生成 / 更新 pages.json（`pages` / `subPackages` / `tabBar`）
  - 主包页面递归扫描生成，路径稳定排序；分包经 `subPackages: [{ root, dir }]` 自动扫描
  - `entryPage` 固定 `pages[0]` 为启动页，不被字母序排序改写
  - tab 页面经 `<route-config>` 声明 `isTab` + `tabBar` 模板自动归集，按 `tab.order` 升序排序
  - 合并策略仅覆盖页面部分，保留 `globalStyle` / `condition` 等
  - `watch: true`（默认）页面目录变化时自动重新生成
  - 选项：`pagesJsonPath` / `pagesDir` / `subPackages` / `routeConfigBlock` / `titleFallback` / `tabBar` / `includeExtensions` / `excludePatterns` / `watch`
- **`<route-config>` 自定义块**：页面内就近声明 `title`（映射 `navigationBarTitleText`）/ `name` / `style` / `meta` / `isTab` / `tab`
- **子路径导出**：`plugins/generate/generate-pages` 导出 `generatePages` 及类型（`GeneratePagesOptions` / `RouteConfigBlock` / `SubPackageConfig` / `TabBarTemplate` / `TabBarItemOverride` /
  `ScannedPage`）；`plugins/generate` 聚合导出

### 增强

- 类型完善：`TabBarItemOverride` 复用为 `overrides` 元素类型，与页面内 `tab` 保持一致；页面排序 `orderMainPages` 移入 `helpers` 目录

## [1.1.0] - 2026-07-28

autoImport 全面重构，内置预设系统、多种导入形式、HMR、Lint 配置生成、缓存机制

### 变更（破坏性）

- 移除类型 `ImportMapping` / `ResolvedImport`，改用 `InlineImportConfig` / `ImportInline`
- 移除 `AutoImportOptions.fileFilter`，改用 `include` / `exclude` 或 `dirsScanOptions.fileFilter`
- 移除 `helpers/compat.ts` 兼容模块（旧格式不再支持）
- 移除函数：`migrateLegacyOptions` / `resolvedImportToInline` / `inlineToResolvedImport` / `importMappingToInlines`

### 新增

- **内置预设系统**：`imports: ['vue', 'vue-router', 'pinia', 'vue-i18n']` 一键启用常用库
- **多种导入形式**：别名导入、类型导入（`type: true` 生成 `import type`）、命名空间导入（`'*'`）、export assignment 导入（`'='`）
- **目录扫描增强**：`dirs` 支持 `DirConfigObject`、glob 模式与类型标记
- **DTS 模式**：`dtsMode: 'append' | 'overwrite'`（append 仅追加新类型）、`dtsPreserveExts` 保留文件扩展名
- **Vue 指令自动导入**：`vueDirectives` 自动识别自定义指令
- **Lint globals 生成**：`eslintrc` / `biomelintrc` 生成 globals 配置，解决 `no-undef` 报错
- **缓存机制**：`cache` 缓存预设解析与文件扫描结果，提升构建性能
- **HMR 热更新**：扫描目录文件变更时自动重新初始化
- **注释禁用**：`// @unimport-disable` 文件级或行级禁用自动导入
- **自定义 Resolver**：`resolvers` 对未命中标识符自定义解析逻辑
- **包预设**：`packagePresets` 从已安装包的 `.d.ts` 自动发现导出
- **Vite optimizeDeps 集成**：`viteOptimizeDeps` 自动将依赖加入 Vite 预优化列表
- **DTS 忽略过滤**：`ignoreDts` 排除指定标识符
- **新导出函数**：`resolveImportsConfig` / `buildNameLookup` / `findPreset` / `expandPreset` / `resolvePackagePreset` / `generateEslintrc` / `generateBiomelintrc`

### 增强

- Resolver 回退始终对未命中标识符尝试；DTS 生成去重（`initialize()` 与 `buildEnd` 间避免冗余写入）；`resolveImportsConfig` 统一解析预设字符串、Record、Inline 等格式；通配符导出优先从 `.d.ts`
  解析（最准确），回退运行时入口

## [1.0.0] - 2026-06-27

首个稳定版本发布，API 稳定性承诺与生产就绪标志

### 新增

- 经 0.x 系列（0.0.1 - 0.2.7）共 27 个版本迭代，插件从 2 个发展到 **15 个**（7 个分组），覆盖构建全生命周期；common 工具收敛为 14 个规范化子模块；插件开发框架（BasePlugin / Logger / Validator / createPluginFactory）成熟
- **API 稳定承诺**：后续严格遵循语义化版本规范，破坏性变更需升主版本号
- **子路径导出稳定**：主入口向后兼容 + 7 个分组 + 15 个单插件子路径 + 14 个 common 子模块 + factory / logger
- **生产就绪**：支持 Vite 5.x - 7.x（`peerDependencies: vite >=5.0.0 <8.0.0`）、ESM（`.mjs`）与 CJS（`.cjs`）双格式输出、完整 TypeScript 类型、`sharp` / `svgo` 可选依赖优雅降级、所有插件零配置可用

## [0.2.7] - 2026-06-26

插件按功能分组导出，修复 generateRouter 类型注解生成缺陷

### 新增

- **插件分组导出**：15 个插件按功能划分为 7 个分组（analyze / compress / copy / generate / guard / inject / proxy），每个分组提供独立子路径导出（如 `./plugins/compress`），支持按需导入与 Tree-shaking；`./plugins`
  主入口向后兼容，各插件单独子路径同步开放

### 修复

- generateRouter 在 `exportTypes: false` 时仍生成 `: RouteConfig[]` 类型注解但无 import 语句，导致 RouteConfig 未定义 —— 仅在启用类型导出时添加注解

## [0.2.6] - 2026-06-25

通用工具抽离与架构统一重构，版本号注入机制自动化

### 新增

- **common 新增 6 个子模块**：`code`（`JS_KEYWORDS` /
  `stripCommentsAndStrings`）、`compress`（`calculateGzipSize`）、`env`（`parseEnvContent`）、`hash`（`generateRandomHash`）、`object`（`deepMerge`）、`string`（`toCamelCase` / `toPascalCase` / `stripJsonComments` /
  `escapeRegex`）
- **common/format**：新增 `parsePluginTemplate`，支持 `{name}` / `{date}` / `{date:FORMAT}` / `{version}` / `{custom:KEY}` 占位符，统一注释头模板处理

### 重构

- **版本号注入机制**：移除手动版本同步逻辑，改为构建时 unbuild `replace` 配置自动注入 `__PLUGIN_VERSION__` 全局变量，新增 `src/types/global.d.ts` 类型声明；generateRouter 注释头 `{version}` 占位符无需再手动更新源码
- **插件目录结构**：各插件 `common/` 目录统一重命名为 `helpers/`，类型文件统一到插件根目录（仅影响内部结构，对用户导入路径无影响）

### 优化

- versionUpdateChecker 自定义提示模板解析改用通用函数 `parseTemplateWithDelimiter`，替代多次链式 `.replace()` 手动拼接

## [0.2.5] - 2026-06-24

generateRouter 注释头模板化升级，移除废弃函数

### 变更（破坏性）

- `fileHeader` 参数移除，替换为 `headerTemplate`：从 `boolean` 开关升级为 `boolean | string` 模板，字符串内容由占位符自由组合

### 新增

- **注释头模板系统**：`headerTemplate` 支持 `{name}` / `{date}`（默认 `YYYY-MM-DD HH:mm:ss`）/ `{date:格式}` / `{version}` / `{custom:键名}` 占位符，顺序由模板位置决定
- **自定义字段 `customFields`**：`Record<string, string>`，供 `{custom:键名}` 占位符引用
- **变更**：`plugins/generate-router` 移除选项 `fileHeader`，新增 `headerTemplate` / `customFields`

### 移除

- common/code-manipulation 移除废弃函数 `serializeValueCompact`（请使用 `serializeValue(value, true)` 替代）

## [0.2.4] - 2026-06-23

generateRouter 新增页面名称配置，优化路由合并策略

### 新增

- **页面名称 `name` 字段**：`UniAppPageConfig` 新增 `name` 属性，可在 pages.json 中直接配置路由名称，优先级高于 `nameStrategy` 自动生成

### 优化

- **`preserveRouteChanges` 合并策略**：pages.json 是自动生成字段的唯一来源，`name` 与 `meta` 中来自 pages.json 的字段始终使用新值，仅保留用户自定义的额外字段

## [0.2.3] - 2026-06-23

完善插件基类与路由生成插件功能

### 新增

- **页面元信息 `meta` 字段**：`UniAppPageConfig` 新增 `meta` 属性，优先级高于 `metaMapping` 映射；提取优先级为 `pageConfig.meta` > `metaMapping` 映射 > tabBar 推断

### 重构

- **BasePlugin**：`addPluginHooks` 从抽象方法改为虚方法（默认空实现），不依赖 Vite 钩子的插件无需再写空的实现
- **generateRouter**：路由生成逻辑从 `configResolved` 钩子迁移至基类 `onConfigResolved` 生命周期，统一生命周期管理

## [0.2.2] - 2026-06-21

generateRouter 修复多行格式输出属性间逗号缺失与缩进错误

### 修复

- 多行格式路由对象属性之间缺少逗号分隔符，导致生成的 `router.config.ts` 语法错误
- 多行格式非首行属性缩进多了一个 tab，导致格式不统一

## [0.2.1] - 2026-06-21

generateRouter 新增文件注释头、输出格式优化，修复 preserveRouteChanges 合并丢失，移除冗余类型定义

### 新增

- **文件注释头 `fileHeader`**：开启后在生成文件顶部添加含 `@plugin` / `@date`（含时分秒）/ `@version` 的标准化注释头，版本号随 npm 包版本自动更新
- **多行格式输出**：路由对象从单行紧凑格式改为每属性独占一行的多行格式，提升可读性
- **类型外部导入**：移除内联类型定义，改为 `import type { RouteConfig } from '@meng-xi/uni-router'`，类型由 uni-router 统一提供

### 修复

- `preserveRouteChanges` 下 `meta` 整体替换导致用户自定义字段丢失 —— 改为逐字段合并，仅更新 / 添加新字段
- 单条路由含 `beforeEnter` 等函数属性导致 JSON.parse 失败时全部路由合并跳过 —— 仅跳过该条，其余正常合并

### 变更（破坏性）

- 移除 `UniAnimationType`、`NavigationAnimation` 类型导出及 `RouteMeta.animation` 字段，改由 `@meng-xi/uni-router` 提供（如需使用请从 uni-router 导入替代）

## [0.2.0] - 2026-06-18

新增 proxyManager 开发代理管理插件，Common 工具模块提取多项通用函数，修复 proxyManager 四个关键缺陷

### 新增

- **`proxyManager` 插件**：开发服务器代理管理，在 `configureServer` 启动时注册代理中间件
  - 路径匹配：字符串前缀与正则两种方式
  - 请求重写（`rewrite`）、响应修改（`modifyResponse`）
  - 延迟模拟：固定毫秒数与随机范围（`{ min, max }`）两种配置
  - `envPrefix` 从 `process.env` 读取代理目标，一套代码多环境切换
  - 规则文件：`.proxyrc.ts` / `.proxyrc.js` / `.proxyrc.mjs`，兼容 ESM 与 CJS
  - 三级请求日志（`none` / `basic` / `verbose`）、WebSocket 代理（`ws: true`）、`env` 字段限定生效环境
  - 选项：`rules` / `configFile` / `logLevel` / `defaultDelay` / `envPrefix`
- **common/format**：新增 `parseTemplateWithDelimiter`（自定义左右分隔符，键名与值中的正则特殊字符自动转义）
- **common/fs**：新增 `scanAndMapFiles`（封装「扫描 + 过滤 + 映射」）、`deleteFiles`（批量删除，失败静默忽略）

## [0.1.9] - 2026-06-14

generateRouter 新增导航动画支持与路由属性保留增强

### 新增

- **导航动画类型**：新增 `UniAnimationType`（18 种动画值）与 `NavigationAnimation`（`type` + `duration`）
- **路由元信息**：`RouteMeta` 新增 `animation` 字段，可配置页面默认导航动画（仅 App 端生效）
- **路由配置扩展**：`RouteConfig` 新增索引签名 `[key: string]: unknown`，支持用户添加 `beforeEnter`、`component` 等自定义属性

### 增强

- **`preserveRouteChanges`**：基于原始文本的合并策略，完整保留用户添加的函数属性与自定义属性；`path` 始终以 pages.json 为准，`name` / `meta` 用户修改优先保留、pages.json 新增字段自动补充

## [0.1.8] - 2026-06-11

新增 imageOptimizer 图片优化插件，新增 common/concurrency 并发控制模块，恢复 common/path 路径工具模块

### 新增

- **`imageOptimizer` 插件**：构建完成后（`writeBundle`，`enforce: 'post'`）扫描输出目录并对图片压缩优化
  - 多格式压缩：JPEG（mozjpeg）/ PNG（palette）/ WebP / AVIF / GIF / TIFF / SVG（svgo）
  - 格式转换：`convertToWebp` / `convertToAvif` 简写与 `convertMapping` 自定义映射
  - 并发处理（`parallelLimit`）、流式内存控制、原子写入、体积守恒（仅更小时替换）、sharp/svgo 优雅降级
  - JSON 压缩报告（按格式分组 + Top 5 压缩率），实例方法 `getStats()` / `getSummary()`
- **common/concurrency**：新增 `runWithConcurrency`（工作池模式并发执行，结果顺序与输入对应）
- **common/path 恢复**：`normalizePath` / `isExtensionIncluded` / `isPathExcluded` / `isPreCompressed`
- **common/format**：新增 `calcRatio`
- **common/fs**：新增 `resolveReportPath`

## [0.1.7] - 2026-06-08

新增 assetManifest 资源清单生成插件

### 新增

- **`assetManifest` 插件**：构建完成后（`writeBundle`，`enforce: 'post'`）扫描输出目录生成资源映射清单
  - 三种输出格式：`vite` / `webpack` / `custom`（自定义格式化器）
  - 按入口分组（`groupByEntry`）、运行时注入（`injectRuntime`，以全局变量注入到 `</head>` 前）
  - 文件过滤（`includeExtensions` / `excludeExtensions` / `excludePaths`）、`publicPath` 前缀适配 CDN、路径冲突检测告警
  - 实例方法：`getAssetMap()` / `getManifest()` / `getGroups()`

## [0.1.6] - 2026-06-07

autoImport 支持通配符自动导入，generateRouter 新增路由类型声明生成，Common 工具模块新增多项通用函数，插件代码规范化重构

### 新增

- **autoImport 通配符导入**：`imports` 支持 `'*'` 自动导入模块所有命名导出，优先从 `.d.ts` 提取（最准确），回退运行时入口解析
- **Vue SFC 注入**：新增 `injectIntoScriptSetup`，将 import 注入 `<script setup>`，解决 `enforce: 'pre'` 时与 Vue SFC 编译器的协同问题
- **generateRouter 路由类型声明**：新增 `dts` 选项（`false` / `true` 默认 `src/router.d.ts` / 自定义路径），生成含 TSDoc 注释的类型声明，扩展 `@meng-xi/uni-router` 的 `RouteNameMap` 接口，实现类型安全的路由导航
- **common/format**：`parseTemplate`（`{{key}}` 占位符，$ 安全处理）、`formatDate`
- **common/fs**：`writeFileSyncSafely`（同步写入自动建目录）、`shouldUpdateFileContent`（减少文件 IO）
- **common/html**：`escapeHtmlAttr`（防止属性注入攻击）

### 修复

- `transform` 钩子 `enforce: 'post'` 导致裸模块标识符无法解析，改回 `enforce: 'pre'`
- 默认 `fileFilter` 未排除 `node_modules`，导致库文件被错误处理并注入错误 import
- `vue: ['*']` 走了运行时入口（仅含 `export { compile }`），只解析出 `compile` 一个导出
- `makeCallback` 返回的匿名函数作函数声明调用时语法错误，改用 IIFE 形式
- `moduleMap` 循环中未使用变量

### 重构

- 各插件将非核心逻辑函数 / 常量提取到 `common/` 子目录并聚合导出（buildProgress / generateRouter / envGuard / faviconManager / htmlInject / loadingManager / versionUpdateChecker）

## [0.1.5] - 2026-06-06

新增 autoImport 自动导入插件，精简 Common 工具模块（移除 compress、object、path），修复 dts 类型声明文件在开发模式下不生成的问题

### 新增

- **`autoImport` 插件**：自动检测代码中使用的标识符并注入 import 语句（`enforce: 'post'`）
  - 预设映射（`imports`，支持 `Record<string, string[]>` 与 `ImportMapping[]`）、目录扫描（`dirs`，递归扫描跳过 node_modules）、Vue 模板支持（`vueTemplate`）
  - 类型声明生成（`dts`，默认 `auto-imports.d.ts`）、标识符忽略（`ignore`）、文件过滤（`fileFilter`）、注入位置（`injectAtPosition`：`'top'` / `'after-last-import'`）

### 变更（破坏性）

- 移除使用次数不足 2 次的工具模块：`common/compress`（`calculateGzipSize` 内联至 bundleAnalyzer）、`common/object`（`deepMerge` 内联至 loadingManager）、`common/path`（`isNodeModule`
  内联至 bundleAnalyzer），并移除仅使用一次的函数及类型
- 保留 6 个核心模块：`format` / `fs` / `html` / `script` / `ui` / `validation`

## [0.1.4] - 2026-06-03

新增 envGuard 环境变量校验插件，新增 @common/ui 终端 UI 工具模块

### 新增

- **`envGuard` 插件**：构建前校验环境变量（`enforce: 'post'`，运行时守卫注入）
  - 8 种值类型校验（`string` / `number` / `url` / `boolean` / `enum` / `json` / `semver` / `path`）、范围（`minValue` / `maxValue`）与长度（`minLength` /
    `maxLength`）约束、正则匹配（`pattern`）、自定义校验函数（`validator`）
  - `failAction` 三模式（`error` / `warn` / `ignore`）、.env 模板生成（`generateTemplate`）、运行时守卫（`console` / `throw` / `overlay`）、`autoLoadEnv` 自动加载、JSON 校验报告与终端摘要
- **@common/ui 模块**：`ANSI`（光标控制与彩色文本）、`SPINNER_FRAMES`（Spinner 动画帧）、`stripAnsi`

### 增强

- **@common/validation**：新增 `EnvType`、`EnvFieldRule`、`EnvValidationResult`、`STRING_LIKE_TYPES` 类型及 `validateType` / `validateRange` / `validateLength` / `validateValue` / `validateEnvironment` 函数

## [0.1.3] - 2026-06-01

新增 bundleAnalyzer 构建产物体积分析插件，新增 @common/compress 和 @common/path 工具模块

### 新增

- **`bundleAnalyzer` 插件**：构建完成后（`writeBundle`，`enforce: 'post'`）分析构建产物体积
  - `json` / `html` / `both` 报告、gzip 体积计算（level 9）、阈值告警（`sizeThreshold`，超 2 倍标记 critical）
  - 与历史报告对比（体积变化趋势）、treemap / sunburst / list 图表视图、Top N 模块排行、文件类型分布、`openAnalyzer` 自动打开
- **@common/compress**：`calculateGzipSize`（gzip 压缩后大小，level 9）
- **@common/path**：`isNodeModule`（检测 node_modules / `\0` / `virtual:` 前缀）

### 增强

- **@common/format**：`escapeHtmlAttr`（XSS 转义）、`formatFileSize`（人类可读大小）、`getExtension`
- **@common/fs**：`scanDirectory`（递归扫描 + 过滤）、`writeJsonReport`、`ScannedFile` / `ScanDirectoryOptions` 类型

## [0.1.2] - 2026-05-31

新增 compressAssets 构建产物压缩插件，所有插件参数可选化，新增 @common/object 和 @common/fs 完整工具函数

### 新增

- **`compressAssets` 插件**：构建完成后（`writeBundle`，`enforce: 'post'`）用 gzip / brotli / both 压缩产物，生成 `.gz` / `.br` 文件
  - 文件过滤（`includeExtensions` / `excludeExtensions` / `excludePaths`）、压缩阈值（`threshold`）、并发压缩（`parallelLimit`）
  - `deleteOriginalFile` 删除原始文件、JSON 压缩报告（`reportOutput`）、Top 5 压缩率日志、路径跨平台兼容
- **@common/object**：新增 `deepMerge`（跳过 undefined，递归合并，数组覆盖）

### 增强

- **所有插件参数可选化**：存在默认值的参数均改为选填（添加 `?`），零配置即可使用（BuildProgressOptions / CompressAssetsOptions / CopyFileOptions / FaviconManagerOptions / GenerateRouterOptions / GenerateVersionOptions /
  VersionUpdateCheckerOptions / HtmlInjectOptions / LoadingManagerOptions）
- **@common/fs**：`checkSourceExists` / `ensureTargetDir` / `fileExists` / `copySourceToTarget`（递归 / 覆盖 / 增量 / 并发）/ `writeFileContent` / `readFileContent` 及 `CopyOptions` / `CopyResult` 类型
- **@common/format**：`generateRandomHash` / `formatDate` / `parseTemplate` / `toCamelCase` / `toPascalCase` / `stripJsonComments` / `DateFormatOptions`
- **BasePlugin**：`mergeOptions` 改用 `deepMerge`；新增 `validator` 属性、`getEnforce()` 方法、`onConfigResolved(config)` 生命周期、`handleError(error, context)`；`toPlugin` 自动注册 `configResolved` 与 `closeBundle`

## [0.1.1] - 2026-05-30

新增 htmlInject HTML 内容注入插件，新增通用工具函数和类型，Validator 新增枚举和数值范围验证

### 新增

- **`htmlInject` 插件**：按规则将自定义 HTML 注入到目标 HTML 文件（`transformIndexHtml`，`order: 'post'`）
  - 7 种注入位置（`head-start` / `head-end` / `body-start` / `body-end` / `before-selector` / `after-selector` / `replace-selector`）
  - 条件注入（`env` / `file-contains` / `custom`，支持 `negate`）、选择器匹配（`string` / `regex`）
  - 模板变量替换（`{{key}}`，规则级优先于全局）、`priority` 规则优先级
  - 安全过滤（阻止危险标签 / 事件属性，`allowedTags` 白名单）、`allowScriptInjection` 跳过检查并告警、`logInjection` 注入日志
- **通用工具函数**：
  - format：`escapeHtmlAttr` / `padNumber` / `getDateFormatParams`（新增 `{SSS}` 毫秒占位符）
  - html：`injectBeforeTagWithFallback`（带回退策略）、`injectHeadAndBody`（双区域注入）
  - validation（新增独立模块）：`validateGlobalName` / `validateNoScriptInTemplate` / `validateCallbackFields` / `validateNonNegativeNumber` / `validateNestedDuration` / `validateEnumValue`

### 增强

- **Validator**：新增 `enum(allowedValues)` / `minValue(min)` / `maxValue(max)` 链式方法

## [0.1.0] - 2026-05-24

新增 versionUpdateChecker 版本更新检查插件，插件重命名（injectIco → faviconManager，injectLoading → loadingManager），新增通用工具模块

### 新增

- **`versionUpdateChecker` 插件**：定期检查版本号变更并向用户显示刷新提示，通常与 `generateVersion` 配合使用
  - 三种版本来源（`define` 全局变量 / `file`（version.json）/ `auto` 自动检测）、三种提示 UI（`modal` / `banner` / `toast`）
  - `customPromptTemplate` 自定义模板（`{{message}}` 等占位符）、`customStyle` 自定义样式、`checkOnVisibilityChange` 切回立即检查、生命周期回调（`onUpdateAvailable` / `onRefresh` / `onDismiss`）
  - XSS 防护（禁止 script 标签）、标识符安全（`defineName` 防原型污染）、SSR 安全、销毁清理
- **通用工具模块**：html（`injectBeforeTag` / `injectHtmlByPriority` / `HtmlInjectResult`）、script（`makeCallback` / `containsScriptTag` / `validateIdentifierName`）

### 变更（破坏性）

- 插件重命名：`injectIco` → `faviconManager`、`injectLoading` → `loadingManager`（功能不变，名称更准确）

### 增强

- **faviconManager**：新增字符串简写配置（`faviconManager('/assets')`）；`url` 选项描述明确覆盖 `base + favicon.ico`
- **loadingManager**：新增运行时 API `toggle(text?)` / `enablePointerEvents()` / `disablePointerEvents()` / `togglePointerEvents()` / `isPointerEventsEnabled()`

## [0.0.9] - 2026-05-23

修复 injectLoading 严重问题，新增 LoadingManager 运行时 API，优化插件开发框架

### 修复

- injectLoading 的 `style.pointerEvents` 默认值错误（此前默认 `false` 导致遮罩层无法阻止用户操作），正确默认 `true` 拦截交互
- LoadingManager 运行时 API 不完整，补充缺失方法

### 新增

- **LoadingManager 运行时 API**：`toggle(text?)` / `enablePointerEvents()` / `disablePointerEvents()` / `togglePointerEvents()` / `isPointerEventsEnabled()`
- **通用工具函数**：`readDirRecursive`（返回条目信息，避免冗余 stat）、`runWithConcurrency`（并发限制批量执行）、`shouldUpdateFile`（增量复制判断）
- **TypeScript 类型导出**：`PluginFactory` / `OptionsNormalizer` / `DateFormatOptions`

### 增强

- **injectIco**：新增字符串简写配置（`injectIco('/assets')`）
- **BasePlugin**：新增 `safeExecute` / `safeExecuteSync` 安全执行方法（按 `errorStrategy` 处理错误）；构造函数自动包裹 `validateOptions()`，验证失败不再导致构建崩溃
- **createPluginFactory**：新增选项标准化器 `OptionsNormalizer`，允许插件接受非对象简写配置；工厂泛型新增 `R` 参数
- **buildProgress**：非 TTY 环境（CI/CD）自动降级为日志输出；补充进度阶段说明（config → resolve → transform → bundle → write → done）
- **generateRouter**：补充 `metaMapping` 默认值说明（`{ navigationBarTitleText: 'title', requireAuth: 'requireAuth' }`）；`nameStrategy: 'custom'` 必须提供 `customNameGenerator`
- **generateVersion**：补充 `customFormat` 占位符完整文档

## [0.0.8] - 2026-05-21

新增 injectLoading 全局 Loading 状态管理插件，**此插件存在严重问题，请尽快升级到 0.0.9 版本**

### 新增

- **`injectLoading` 插件**：注入全局 Loading 状态管理（运行时 API `window.__LOADING_MANAGER__`）
  - 白屏 Loading（`defaultVisible`，HTML 解析即显示）、自动隐藏时机（`DOMContentLoaded` / `load` / `manual`）
  - 请求自动拦截（`autoBind`：`fetch` / `xhr` / `all` / `none`）、请求过滤（`requestFilter`）
  - 四种内置图标（`spinner` / `dots` / `pulse` / `bar`）、过渡动画、最小显示时间、延迟显示、防抖隐藏、自定义样式 / 模板、生命周期回调、SSR 安全、销毁清理

## [0.0.7] - 2026-05-19

新增 buildProgress 构建进度条插件

### 新增

- **`buildProgress` 插件**：在终端实时显示构建进度条
  - 三种显示格式（`bar` / `spinner` / `minimal`）、基于构建生命周期计算进度（config 5% → resolve 10% → transform 15%-85% → bundle +10% → write +5% → done 100%）
  - 自定义宽度 / 填充字符 / 颜色主题、可选显示当前模块名称（超长截断）、非 TTY 降级日志输出、`destroy()` 停止动画并恢复终端光标

## [0.0.6] - 2026-05-18

新增插件销毁生命周期及子路径类型导出，优化日志系统

### 新增

- **销毁生命周期**：BasePlugin 新增 `destroy()` 虚方法（默认注销日志配置），`toPlugin()` 在 `closeBundle` 末尾自动调用；generateRouter 文件监听器清理迁移至 `destroy()`
- **Logger**：新增 `Logger.unregister(pluginName)` 静态方法；`Logger.destroy()` 清除所有配置并重置单例
- **子路径类型导出**：factory（`PluginFactory` / `OptionsNormalizer` / `PluginWithInstance` / `BasePluginOptions`）、plugins（各插件 Options 及 `RouteConfig` / `RouteMeta` 等）、common（`CopyOptions` / `CopyResult` /
  `DateFormatOptions`）

### 增强

- **injectIco**：统一图标接口类型名称为 `Icon`（替代旧名 `IconConfig`）
- **common/fs**：`readFileSync` 标记为废弃（推荐异步版 `readFileContent`）；`CopyOptions` 新增 `parallelLimit`（默认 10）与 `skipEmptyDirs`

## [0.0.5] - 2026-03-05

generateVersion 支持在构建过程中自动生成版本号，支持多种格式和输出方式

### 新增

- **generateRouter**：根据 uni-app 项目的 `pages.json` 自动生成路由配置文件（`pagesJsonPath` / `outputPath` / `outputFormat` / `nameStrategy` / `includeSubPackages` / `watch` / `metaMapping` / `preserveRouteChanges`）

## [0.0.4] - 2026-02-28

添加 generateVersion 插件及 format 工具导出，优化文件复制和对象合并逻辑，改进图标注入插件

### 新增

- core 包 common 模块导出 format 工具
- plugins 模块添加并导出 `generateVersion` 插件

### 增强

- 重构 `readDirRecursive` 接口（返回文件 / 目录条目信息，减少冗余 stat 调用）
- 引入并发限制机制，实现并行文件复制；`copySourceToTarget` 支持并行复制与增量更新
- `deepMerge` 支持跳过 undefined，完善嵌套对象合并规则
- Logger 增加日志图标和颜色，提升控制台输出可读性
- injectIco 改用 Vite 官方 `HtmlTagDescriptor` 接口注入图标标签，增加自定义 link 标签处理；`transformIndexHtml` 同时兼容字符串替换与标签注入两种方式

## [0.0.3] - 2026-02-04

插件工厂、日志系统与泛型验证全面升级

### 新增

- 插件工厂新增 `safeExecuteSync` 同步安全执行函数
- **日志系统升级为单例框架**：新增 `PluginLogger` 接口（插件级独立日志代理），统一输出格式（时间戳 / 命名空间 / 图标 / 颜色），日志级别升级为 `success` / `info` / `warn` / `error` 四级，通过插件配置映射管理日志开关
- **Validator 泛型化**：升级为泛型设计（编译时类型安全），fluent API 支持链式类型推断，自定义验证函数与默认值方法类型安全
- **BasePlugin 泛型化**：集成泛型 Validator 实现类型安全的配置验证，增加泛型参数约束 `T` / `K` 确保字段与默认值类型匹配
- 更新架构图与 API 文档反映泛型验证机制

## [0.0.2] - 2026-01-26

架构升级（封装插件工厂）、优化日志功能、新增参数校验，copyFile 与 injectIco 插件各新增两个参数

### 增强

- **copyFile / injectIco 新增配置**：`incremental`（增量复制，仅复制修改过的文件，默认 `true`）、`errorStrategy`（错误处理策略 `'throw'` / `'log'` / `'ignore'`，默认 `'throw'`）

## [0.0.1] - 2026-01-21

首个版本，提供 copyFile 与 injectIco 两个插件

### 新增

- **copyFile 插件**：在 Vite 构建完成后复制文件或目录到指定位置（`sourceDir` / `targetDir` 必填，`overwrite` / `recursive` / `verbose` / `enabled`）
- **injectIco 插件**：在 Vite 构建过程中将网站图标链接注入 HTML 头部（`base` / `url` / `link` / `icons` / `verbose` / `enabled` / `copyOptions`）
