# 介绍

`@meng-xi/vite-plugin` 是一个为 Vite 提供实用插件的工具包，同时也是一个完整的 **Vite 插件开发框架**。

## 内置插件

开箱即用的四个插件，覆盖常见构建场景：

| 插件                                         | 功能                                        |
| -------------------------------------------- | ------------------------------------------- |
| [copyFile](/plugins/copy-file)               | 构建完成后复制文件或目录到指定位置          |
| [generateRouter](/plugins/generate-router)   | 根据 uni-app 的 pages.json 自动生成路由配置 |
| [generateVersion](/plugins/generate-version) | 自动生成版本号，支持文件输出和全局变量注入  |
| [injectIco](/plugins/inject-ico)             | 将网站图标链接注入到 HTML 文件              |

## 插件开发框架

导出核心组件，支持快速构建自定义插件：

| 组件                | 说明                                             |
| ------------------- | ------------------------------------------------ |
| BasePlugin          | 插件基类，提供生命周期管理、日志、验证等标准功能 |
| createPluginFactory | 插件工厂函数，自动处理选项合并和实例化           |
| Logger              | 单例日志管理器，支持插件级别的日志控制           |
| Validator           | 链式配置验证器，确保参数类型正确                 |

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

## 公共工具

导出常用工具函数：

- **文件系统**：readFileSync、writeFileContent、copySourceToTarget、readDirRecursive 等
- **格式化**：formatDate、parseTemplate、generateRandomHash、padNumber 等
- **对象处理**：deepMerge、toCamelCase、toPascalCase、stripJsonComments 等

## 下一步

- [安装使用](/installation) - 快速开始
- [插件文档](/plugins/copy-file) - 了解各插件详细配置
- [GitHub](https://github.com/MengXi-Studio/vite-plugin) - 查看源码和示例
