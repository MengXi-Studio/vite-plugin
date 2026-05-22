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

- 插件工厂新增safeExecuteSync同步函数]
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
