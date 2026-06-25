# 介绍

`@meng-xi/vite-plugin` 是一个为 Vite 提供实用插件的工具包，同时也是一个完整的 **Vite 插件开发框架**。

## 它能做什么

- **15 款开箱即用插件** — 按功能分为 7 组（compress / generate / inject / analyze / copy / guard / proxy），覆盖构建优化、代码生成、资源管理、开发体验等场景
- **插件开发框架** — 导出 BasePlugin、Logger、Validator 等核心组件，快速构建自定义 Vite 插件
- **14 大通用工具模块** — 并发控制、文件系统、HTML 注入、路径处理等，支持子路径按需导入

## 插件分组

插件按功能动词分组，支持按分组或单独导入：

| 分组 | 说明 | 插件 |
| ---- | ---- | ---- |
| [compress](/plugins/index#compress-压缩类) | 压缩类 | compressAssets、imageOptimizer |
| [generate](/plugins/index#generate-生成类) | 生成类 | autoImport、generateRouter、generateVersion |
| [inject](/plugins/index#inject-注入类) | 注入类 | htmlInject、loadingManager、faviconManager、versionUpdateChecker |
| [analyze](/plugins/index#analyze-分析类) | 分析类 | bundleAnalyzer、buildProgress |
| [copy](/plugins/index#copy-拷贝类) | 拷贝类 | copyFile、assetManifest |
| [guard](/plugins/index#guard-守卫类) | 守卫类 | envGuard |
| [proxy](/plugins/index#proxy-代理类) | 代理类 | proxyManager |

## 插件开发框架

导出核心组件，支持快速构建自定义插件：

| 组件 | 说明 |
| ---- | ---- |
| BasePlugin | 插件基类，提供生命周期管理、日志、验证、安全执行包裹 |
| createPluginFactory | 插件工厂函数，自动处理选项合并、标准化和实例化 |
| Logger | 单例日志管理器，支持插件级别的日志控制 |
| Validator | 链式配置验证器，支持必填、类型、枚举、范围和自定义验证 |

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

## 学习路径

::: tip 推荐学习顺序
1. [安装](/guide/installation) — 安装依赖
2. [快速开始](/guide/quick-start) — 5 分钟上手
3. [基础概念](/guide/concepts) — 理解插件系统与生命周期
4. [按需导入](/guide/on-demand-import) — 优化打包体积
5. [最佳实践](/guide/best-practices) — 场景化推荐与常见陷阱
:::

## 下一步

- [安装](/guide/installation) — 安装与配置
- [快速开始](/guide/quick-start) — 5 分钟上手
- [插件概览](/plugins) — 浏览全部插件
- [插件开发框架](/factory) — 开发自定义插件
- [GitHub](https://github.com/MengXi-Studio/vite-plugin) — 查看源码和示例
