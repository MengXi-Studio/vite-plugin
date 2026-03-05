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

1.架构升级，封装插件工厂
2.优化日志功能
3.新增参数校验功能
4.插件新增两个参数，如下所示：

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
