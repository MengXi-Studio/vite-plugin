# 介绍

`@meng-xi/vite-plugin` 是一个为 Vite 提供实用插件的工具包，同时也是一个完整的 **Vite 插件开发框架**。

## 内置插件

开箱即用的十款插件，覆盖常见构建场景：

| 插件                                                    | 功能                                                                                            |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [buildProgress](/plugins/build-progress)                | 在终端实时显示构建进度条，支持 bar / spinner / minimal 三种格式                                 |
| [bundleAnalyzer](/plugins/bundle-analyzer)              | 构建产物体积分析，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比                            |
| [compressAssets](/plugins/compress-assets)              | 构建产物压缩，支持 gzip / brotli / both，可配置压缩级别、文件过滤与并发数量，并生成压缩统计报告 |
| [copyFile](/plugins/copy-file)                          | 构建完成后复制文件或目录到指定位置，支持增量复制                                                |
| [faviconManager](/plugins/favicon-manager)              | 管理网站图标（favicon）链接注入到 HTML 文件                                                     |
| [generateRouter](/plugins/generate-router)              | 根据 uni-app 的 pages.json 自动生成路由配置                                                     |
| [generateVersion](/plugins/generate-version)            | 自动生成版本号，支持文件输出和全局变量注入                                                      |
| [htmlInject](/plugins/html-inject)                      | HTML 内容注入，支持多种位置和条件注入                                                           |
| [loadingManager](/plugins/loading-manager)              | 全局 Loading 状态管理，支持请求拦截和白屏 Loading                                               |
| [versionUpdateChecker](/plugins/version-update-checker) | 运行时版本更新检查，发现新版本时提示用户刷新                                                    |

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

导出八大工具模块，覆盖插件开发中的常见场景：

### compress — 压缩算法工具

提供 gzip 压缩大小计算功能：

- `calculateGzipSize` — 计算数据的 gzip 压缩后大小，用于估算网络传输体积

### format — 格式化工具

提供日期格式化、模板解析和命名转换等功能：

- `formatDate` — 日期格式化，支持自定义模板
- `parseTemplate` — 模板字符串解析，替换占位符
- `generateRandomHash` — 生成随机哈希字符串
- `padNumber` — 数字补零
- `toCamelCase` — 转换为驼峰命名（camelCase）
- `toPascalCase` — 转换为帕斯卡命名（PascalCase）
- `stripJsonComments` — 移除 JSON 字符串中的注释
- `escapeHtmlAttr` — 转义 HTML 属性值中的特殊字符，防止 XSS 注入
- `formatFileSize` — 将字节数格式化为人类可读的文件大小字符串
- `getExtension` — 获取文件扩展名

### fs — 文件系统工具

提供文件操作、目录扫描和并发控制等功能：

- `copySourceToTarget` — 复制文件或目录，支持增量复制和并发控制
- `readDirRecursive` — 递归读取目录内容
- `readFileContent` / `writeFileContent` — 异步读写文件
- `fileExists` — 检查文件是否存在
- `shouldUpdateFile` — 比较文件修改时间判断是否需要更新
- `runWithConcurrency` — 带并发限制的批量执行
- `scanDirectory` — 递归扫描目录，收集文件信息，支持扩展名和路径过滤
- `writeJsonReport` — 将数据写入 JSON 文件

### html — HTML 注入工具

提供多种 HTML 内容注入策略：

- `injectBeforeTag` — 在指定闭合标签前注入代码
- `injectHtmlByPriority` — 按优先级向 HTML 中注入代码
- `injectBeforeTagWithFallback` — 带回退策略的 HTML 注入
- `injectHeadAndBody` — 双区域 HTML 注入（head + body）

### object — 对象处理工具

- `deepMerge` — 深度合并对象，支持嵌套对象递归合并、undefined 跳过和数组覆盖

### path — 路径处理工具

- `isNodeModule` — 判断模块 ID 是否来自 node_modules，支持虚拟模块检测

### script — 脚本工具

提供脚本生成和安全性验证功能：

- `makeCallback` — 将回调函数体字符串包装为安全的函数表达式
- `containsScriptTag` — 检测字符串是否包含 `<script>` 标签
- `validateIdentifierName` — 验证字符串是否为合法的 JavaScript 标识符，防止原型污染

### validation — 配置验证工具

提供链式验证器和预置验证函数：

- `Validator` — 链式配置验证器，支持 required / string / number / boolean / enum / minValue / maxValue / custom 等验证规则
- `validateGlobalName` — 验证全局变量名的合法性
- `validateNoScriptInTemplate` — 验证模板字符串不包含 script 标签（XSS 防护）
- `validateCallbackFields` — 验证回调字段不包含 script 标签
- `validateNonNegativeNumber` — 验证数值为非负数
- `validateNestedDuration` — 验证嵌套配置项的 duration 合法性
- `validateEnumValue` — 验证字符串值是否在允许的枚举列表中

## 下一步

- [安装使用](/installation) - 快速开始
- [buildProgress](/plugins/build-progress) - 构建进度展示
- [bundleAnalyzer](/plugins/bundle-analyzer) - 构建产物体积分析
- [compressAssets](/plugins/compress-assets) - 构建产物压缩
- [htmlInject](/plugins/html-inject) - HTML 内容注入
- [loadingManager](/plugins/loading-manager) - 全局 Loading 状态管理
- [插件工厂](/factory/index) - 开发自定义插件
- [GitHub](https://github.com/MengXi-Studio/vite-plugin) - 查看源码和示例
