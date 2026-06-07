# 介绍

`@meng-xi/vite-plugin` 是一个为 Vite 提供实用插件的工具包，同时也是一个完整的 **Vite 插件开发框架**。

## 内置插件

开箱即用的十三款插件，覆盖常见构建场景：

| 插件                                                    | 功能                                                                                                      |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| [assetManifest](/plugins/asset-manifest)                | 构建后自动扫描产物目录生成资源映射清单，支持 Vite/Webpack/自定义三种输出格式、按入口分组和运行时注入      |
| [autoImport](/plugins/auto-import)                      | 自动注入 import 语句，支持预设映射、通配符（`'*'`）、目录扫描、Vue 模板自动导入和 TypeScript 类型声明生成 |
| [buildProgress](/plugins/build-progress)                | 在终端实时显示构建进度条，支持 bar / spinner / minimal 三种格式                                           |
| [bundleAnalyzer](/plugins/bundle-analyzer)              | 构建产物体积分析，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比                                      |
| [compressAssets](/plugins/compress-assets)              | 构建产物压缩，支持 gzip / brotli / both，可配置压缩级别、文件过滤与并发数量，并生成压缩统计报告           |
| [copyFile](/plugins/copy-file)                          | 构建完成后复制文件或目录到指定位置，支持增量复制                                                          |
| [envGuard](/plugins/env-guard)                          | 环境变量校验，支持类型检查、范围验证、自定义规则和运行时守卫                                              |
| [faviconManager](/plugins/favicon-manager)              | 管理网站图标（favicon）链接注入到 HTML 文件                                                               |
| [generateRouter](/plugins/generate-router)              | 根据 uni-app 的 pages.json 自动生成路由配置与类型声明                                                     |
| [generateVersion](/plugins/generate-version)            | 自动生成版本号，支持文件输出和全局变量注入                                                                |
| [htmlInject](/plugins/html-inject)                      | HTML 内容注入，支持多种位置和条件注入                                                                     |
| [loadingManager](/plugins/loading-manager)              | 全局 Loading 状态管理，支持 XHR/Fetch 请求自动拦截、白屏 Loading、自定义样式与动画及生命周期回调          |
| [versionUpdateChecker](/plugins/version-update-checker) | 运行时版本更新检查，发现新版本时提示用户刷新                                                              |

## 插件开发框架

导出核心组件，支持快速构建自定义插件：

| 组件                | 说明                                                           |
| ------------------- | -------------------------------------------------------------- |
| BasePlugin          | 插件基类，提供生命周期管理、日志、验证、安全执行包裹等标准功能 |
| createPluginFactory | 插件工厂函数，自动处理选项合并、标准化和实例化                 |
| Logger              | 单例日志管理器，支持插件级别的日志控制                         |
| Validator           | 链式配置验证器，支持必填、类型、枚举、范围和自定义验证         |
| PluginWithInstance  | 带插件实例引用的 Vite 插件类型，方便外部访问插件内部状态       |
| PluginFactory       | 插件工厂函数类型定义                                           |
| OptionsNormalizer   | 选项标准化器类型，支持将简化配置转换为完整配置                 |

## 通用配置

所有内置插件都继承自 BasePlugin，支持以下通用配置：

```typescript
interface BasePluginOptions {
	/** 是否启用插件，默认 true */
	enabled?: boolean
	/** 是否显示详细日志，默认 true */
	verbose?: boolean
	/** 错误处理策略：throw 抛出 | log 记录 | ignore 忽略 */
	errorStrategy?: 'throw' | 'log' | 'ignore'
}
```

## 通用工具模块

导出六大工具模块，覆盖插件开发中的常见场景：

### format — 格式化工具

提供日期格式化参数、模板变量替换、日期格式化和文件大小格式化功能：

- `getDateFormatParams` — 获取日期格式化参数对象
- `parseTemplate` — 替换模板字符串中的 `{{key}}` 占位符
- `formatDate` — 使用 `{key}` 占位符格式化日期字符串
- `formatFileSize` — 将字节数格式化为人类可读的文件大小字符串

### fs — 文件系统工具

提供文件操作、目录扫描、安全写入和变更检测等功能：

- `checkSourceExists` — 检查源路径是否存在
- `copySourceToTarget` — 复制文件或目录，支持增量复制
- `writeFileContent` — 异步写入文件内容
- `scanDirectory` — 递归扫描目录，收集文件信息，支持扩展名和路径过滤
- `writeJsonReport` — 将数据写入 JSON 文件
- `writeFileSyncSafely` — 同步写入文件，自动创建不存在的目录
- `shouldUpdateFileContent` — 检查文件内容是否需要更新，减少不必要的 IO

### html — HTML 注入工具

提供多种 HTML 内容注入策略、安全过滤和属性值转义：

- `injectBeforeTag` — 在指定闭合标签前注入代码
- `injectHeadAndBody` — 双区域 HTML 注入（head + body）
- `sanitizeContent` — 对注入内容进行安全过滤，防止 XSS 攻击
- `escapeHtmlAttr` — 转义 HTML 属性值中的特殊字符

### script — 脚本工具

提供脚本生成功能：

- `makeCallback` — 将回调函数体字符串包装为安全的函数表达式（包含 try-catch 保护）

### ui — 终端 UI 工具

提供终端 ANSI 转义码处理：

- `ANSI` — ANSI 转义码工具集，提供文本着色（green/cyan/red/yellow/magenta/gray/bold）和光标控制（reset/clearLine/hideCursor/showCursor）

### validation — 配置验证工具

提供链式验证器和预置验证函数：

- `Validator` — 链式配置验证器，支持 required / string / number / boolean / enum / minValue / maxValue / custom 等验证规则
- `validateGlobalName` — 验证全局变量名的合法性
- `validateNoScriptInTemplate` — 验证模板字符串不包含 script 标签（XSS 防护）
- `validateCallbackFields` — 验证回调字段不包含 script 标签

## 下一步

- [安装使用](/installation) - 快速开始
- [assetManifest](/plugins/asset-manifest) - 资源清单生成
- [autoImport](/plugins/auto-import) - 自动导入
- [buildProgress](/plugins/build-progress) - 构建进度展示
- [bundleAnalyzer](/plugins/bundle-analyzer) - 构建产物体积分析
- [compressAssets](/plugins/compress-assets) - 构建产物压缩
- [htmlInject](/plugins/html-inject) - HTML 内容注入
- [loadingManager](/plugins/loading-manager) - 全局 Loading 状态管理
- [插件工厂](/factory/index) - 开发自定义插件
- [GitHub](https://github.com/MengXi-Studio/vite-plugin) - 查看源码和示例
