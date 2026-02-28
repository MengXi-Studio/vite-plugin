# 图标注入插件 (injectIco)

<cite>
**本文档引用的文件**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts)
- [packages/core/src/plugins/injectIco/types.ts](file://packages/core/src/plugins/injectIco/types.ts)
- [packages/core/src/plugins/injectIco/common/index.ts](file://packages/core/src/plugins/injectIco/common/index.ts)
- [packages/core/src/factory/plugin/index.ts](file://packages/core/src/factory/plugin/index.ts)
- [packages/core/src/factory/plugin/types.ts](file://packages/core/src/factory/plugin/types.ts)
- [packages/docs/src/plugins/inject-ico.md](file://packages/docs/src/plugins/inject-ico.md)
- [packages/playground/vite.config.ts](file://packages/playground/vite.config.ts)
</cite>

## 更新摘要
**变更内容**
- 重大架构升级：从手动HTML字符串操作迁移到使用Vite官方HtmlTagDescriptor API
- 插件现在生成Vite兼容的描述符对象，支持自动图标注入
- 新增回退机制：当使用自定义link标签时，通过injectCustomLinkTag方法保持向后兼容性
- generateIconTagDescriptors函数重写为返回Vite兼容描述符
- transformIndexHtml钩子现在使用Vite原生API进行HTML注入

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构总览](#架构总览)
5. [详细组件分析](#详细组件分析)
6. [依赖分析](#依赖分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)
10. [附录](#附录)

## 简介
injectIco 插件是一个专为 Vite 设计的图标注入工具，能够在构建过程中自动将网站图标链接注入到 HTML 文件的 `<head>` 区域，并可选地将图标文件复制到目标目录。该插件支持多种配置方式：
- 基于基础路径的默认图标注入
- 完整 URL 的直接注入
- 自定义 link 标签的完全控制
- 多格式图标数组配置（支持不同尺寸和 MIME 类型）
- 与文件复制插件的集成使用

**最新重大改进**：插件现已完全迁移到使用 Vite 官方 HtmlTagDescriptor API，提供更可靠、更高效的图标注入机制。新架构支持自动图标注入和回退自定义link标签注入两种模式，确保向后兼容性。

插件采用模块化设计，通过统一的工厂模式和基础插件抽象类实现，具备完善的配置验证、错误处理和日志记录能力。

## 项目结构
injectIco 插件位于插件库的核心包中，采用清晰的分层架构：

```mermaid
graph TB
subgraph "插件核心层"
InjectIco[index.ts<br/>主入口 - 使用Vite原生API"]
Types[types.ts<br/>配置类型]
end
subgraph "通用工具层"
Common[common/<br/>通用函数 - 生成HtmlTagDescriptor"]
Factory[factory/plugin/<br/>工厂函数 - 增强的标准化器]
Validation[validation.ts<br/>参数验证]
FS[fs/index.ts<br/>文件系统]
Object[object.ts<br/>对象工具]
end
subgraph "基础设施层"
BasePlugin[factory/plugin/<br/>基础插件类]
BaseTypes[factory/plugin/types.ts<br/>基础类型]
end
subgraph "文档与测试"
Docs[docs/src/plugins/inject-ico.md<br/>官方文档]
Playground[playground/vite.config.ts<br/>使用示例]
end
InjectIco --> Common
InjectIco --> BasePlugin
InjectIco --> Types
Common --> Factory
BasePlugin --> BaseTypes
Docs --> InjectIco
Playground --> InjectIco
```

**图表来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L1-L195)
- [packages/core/src/plugins/injectIco/types.ts](file://packages/core/src/plugins/injectIco/types.ts#L1-L113)
- [packages/core/src/plugins/injectIco/common/index.ts](file://packages/core/src/plugins/injectIco/common/index.ts#L1-L60)

**章节来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L1-L195)
- [packages/core/src/plugins/injectIco/types.ts](file://packages/core/src/plugins/injectIco/types.ts#L1-L113)

## 核心组件
injectIco 插件由以下核心组件构成：

### 主要类结构
```mermaid
classDiagram
class BasePlugin {
<<abstract>>
#options : Required~T~
#logger : Logger
#validator : Validator~T~
#viteConfig : ResolvedConfig
+constructor(options, loggerConfig)
#mergeOptions(options) : Required~T~
#initLogger(loggerConfig) : Logger
#validateOptions() : void
#getPluginName() : string
#getEnforce() : Plugin.enforce
#onConfigResolved(config) : void
#addPluginHooks(plugin) : void
#safeExecuteSync(fn, context) : T | undefined
#safeExecute(fn, context) : Promise~T | undefined~
#handleError(error, context) : T | undefined
+toPlugin() : Plugin
}
class InjectIcoPlugin {
+constructor(options?)
#getDefaultOptions() : Partial~InjectIcoOptions~
#validateOptions() : void
#getPluginName() : string
#getIconTagDescriptors() : HtmlTagDescriptor[]
#injectCustomLinkTag(html) : string
#copyFiles() : Promise~void~
#addPluginHooks(plugin) : void
}
class IconOptions {
+base? : string
+url? : string
+link? : string
+icons? : Icon[]
}
class Icon {
+rel : string
+href : string
+sizes? : string
+type? : string
}
class CopyOptions {
+sourceDir : string
+targetDir : string
+overwrite? : boolean
+recursive? : boolean
}
BasePlugin <|-- InjectIcoPlugin
InjectIcoPlugin --> IconOptions : "使用"
IconOptions --> Icon : "包含"
InjectIcoPlugin --> CopyOptions : "可选使用"
```

**图表来源**
- [packages/core/src/factory/plugin/index.ts](file://packages/core/src/factory/plugin/index.ts#L27-L348)
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L14-L158)
- [packages/core/src/plugins/injectIco/types.ts](file://packages/core/src/plugins/injectIco/types.ts#L66-L113)

### 配置体系
插件采用分层配置设计，支持灵活的配置组合：

| 配置层级 | 选项 | 类型 | 默认值 | 优先级 |
|---------|------|------|--------|--------|
| 基础配置 | enabled | boolean | true | 最低 |
| 基础配置 | verbose | boolean | true | 最低 |
| 基础配置 | errorStrategy | 'throw' \| 'log' \| 'ignore' | 'throw' | 最低 |
| 插件特定默认 | base | string | '/' | 中等 |
| 图标配置 | url | string | undefined | 高 |
| 图标配置 | link | string | undefined | 最高 |
| 图标配置 | icons | Icon[] | undefined | 中等 |
| 文件复制 | copyOptions | CopyOptions | undefined | 仅在提供时生效 |

**更新**：新增插件特定默认配置层，通过 `getDefaultOptions()` 方法提供 base 路径的默认值 '/'。

**章节来源**
- [packages/core/src/plugins/injectIco/types.ts](file://packages/core/src/plugins/injectIco/types.ts#L66-L113)
- [packages/core/src/factory/plugin/types.ts](file://packages/core/src/factory/plugin/types.ts#L8-L29)
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L15-L19)

## 架构总览
injectIco 插件遵循 Vite 插件生命周期，通过钩子函数实现图标注入和文件复制功能。**重大更新**：现在使用 Vite 官方 HtmlTagDescriptor API 进行自动图标注入，同时保留自定义link标签的回退机制：

```mermaid
sequenceDiagram
participant Vite as Vite 构建系统
participant Factory as createPluginFactory
participant Plugin as InjectIcoPlugin
participant Generator as generateIconTagDescriptors
participant FS as 文件系统
participant Logger as 日志系统
Vite->>Factory : 调用工厂函数
Factory->>Plugin : 创建插件实例
Plugin->>Plugin : 合并配置基础默认值 + 插件特定默认值 + 用户配置
Plugin->>Logger : 记录初始化信息
Note over Vite,Plugin : 构建过程中
Vite->>Plugin : transformIndexHtml(html)
Plugin->>Plugin : 检查插件状态
alt 使用自定义link标签
Plugin->>Plugin : injectCustomLinkTag(html)
Plugin->>Logger : 记录自定义注入结果
else 使用Vite原生API
Plugin->>Generator : 生成HtmlTagDescriptor数组
Generator-->>Plugin : 返回Vite兼容描述符
Plugin->>Logger : 记录自动注入结果
end
Note over Vite,Plugin : 构建完成后
Vite->>Plugin : writeBundle()
Plugin->>Plugin : 检查插件状态
Plugin->>FS : 检查源文件存在性
FS-->>Plugin : 验证通过
Plugin->>FS : 执行文件复制
FS-->>Plugin : 返回复制结果
Plugin->>Logger : 记录复制统计
```

**图表来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L131-L157)
- [packages/core/src/plugins/injectIco/common/index.ts](file://packages/core/src/plugins/injectIco/common/index.ts#L10-L59)
- [packages/core/src/factory/plugin/index.ts](file://packages/core/src/factory/plugin/index.ts#L369-L385)

## 详细组件分析

### Vite原生API集成
**重大更新**：插件现在完全使用 Vite 官方 HtmlTagDescriptor API 进行图标注入：

```mermaid
flowchart TD
Start([开始Vite原生API集成]) --> CheckLink{"是否提供 link 标签?"}
CheckLink --> |是| UseFallback["使用回退机制<br/>injectCustomLinkTag"]
CheckLink --> |否| GenerateDescriptors["调用 generateIconTagDescriptors<br/>生成 HtmlTagDescriptor 数组"]
GenerateDescriptors --> CheckDescriptors{"是否有描述符需要注入?"}
CheckDescriptors --> |否| ReturnOriginal["返回原始 HTML"]
CheckDescriptors --> |是| InjectViteAPI["使用 Vite 原生 API 注入<br/>返回 {html, tags} 对象"]
UseFallback --> InjectStringReplace["使用字符串替换方式注入<br/>保持向后兼容性"]
InjectViteAPI --> LogSuccess["记录成功日志"]
ReturnOriginal --> End([结束])
LogSuccess --> End
InjectStringReplace --> End
```

**图表来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L131-L157)
- [packages/core/src/plugins/injectIco/common/index.ts](file://packages/core/src/plugins/injectIco/common/index.ts#L10-L59)

### HtmlTagDescriptor生成器
**重大更新**：generateIconTagDescriptors 函数现在返回 Vite 兼容的描述符对象：

```mermaid
flowchart TD
Start([开始生成HtmlTagDescriptor]) --> CheckLink{"是否提供 link 标签?"}
CheckLink --> |是| ReturnEmpty["返回空数组<br/>让调用者使用字符串方式"]
CheckLink --> |否| CheckIcons{"是否提供 icons 数组?"}
CheckIcons --> |是| MapIcons["遍历 icons 数组<br/>生成 HtmlTagDescriptor"]
CheckIcons --> |否| CheckURL{"是否提供完整 URL?"}
CheckURL --> |是| UseURL["生成标准 HtmlTagDescriptor"]
CheckURL --> |否| UseBase["使用 base + favicon.ico<br/>生成默认 HtmlTagDescriptor"]
MapIcons --> PushDescriptor["推入描述符数组<br/>tag: 'link', injectTo: 'head'"]
UseURL --> PushDescriptor
UseBase --> PushDescriptor
PushDescriptor --> ReturnDescriptors["返回 HtmlTagDescriptor 数组"]
ReturnEmpty --> End([结束])
ReturnDescriptors --> End
```

**图表来源**
- [packages/core/src/plugins/injectIco/common/index.ts](file://packages/core/src/plugins/injectIco/common/index.ts#L10-L59)

### 回退机制实现
**重大更新**：当使用自定义link标签时，通过 injectCustomLinkTag 方法保持向后兼容性：

```mermaid
flowchart TD
Start([开始回退机制]) --> CheckEnabled{"插件是否启用?"}
CheckEnabled --> |否| SkipExecution["跳过执行"]
CheckEnabled --> |是| CheckLink{"是否提供 link 标签?"}
CheckLink --> |否| SkipExecution
CheckLink --> |是| CheckHead{"查找 </head> 标签"}
CheckHead --> HeadFound{"找到标签?"}
HeadFound --> |否| WarnSkip["记录警告并跳过"]
HeadFound --> |是| InjectTag["在 </head> 前注入自定义标签"]
InjectTag --> LogSuccess["记录成功日志"]
LogSuccess --> ReturnModified["返回修改后的 HTML"]
SkipExecution --> ReturnOriginal["返回原始 HTML"]
WarnSkip --> ReturnOriginal
```

**图表来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L69-L90)

### 工厂函数增强
**更新**：使用增强的 `createPluginFactory` 函数简化配置处理：

```mermaid
flowchart TD
Start([调用 injectIco 工厂函数]) --> CheckOptions{"检查选项类型"}
CheckOptions --> |字符串| NormalizeString["标准化字符串选项<br/>{ base: options }"]
CheckOptions --> |对象| NormalizeObject["标准化对象选项<br/>保持原样"]
CheckOptions --> |undefined| DefaultOptions["使用空对象<br/>{}"]
NormalizeString --> CreatePlugin["创建 InjectIcoPlugin 实例"]
NormalizeObject --> CreatePlugin
DefaultOptions --> CreatePlugin
CreatePlugin --> ToPlugin["转换为 Vite 插件"]
ToPlugin --> AddInstance["添加插件实例引用"]
AddInstance --> ReturnPlugin([返回 Vite 插件])
```

**图表来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L194)
- [packages/core/src/factory/plugin/index.ts](file://packages/core/src/factory/plugin/index.ts#L369-L385)

### HTML 注入流程
**重大更新**：现在使用 Vite 原生 API 进行注入，提供更好的性能和可靠性：

```mermaid
flowchart TD
HTMLStart([接收原始 HTML]) --> CheckEnabled{"插件是否启用?"}
CheckEnabled --> |否| SkipExecution["跳过执行"]
CheckEnabled --> |是| CheckLink{"是否提供自定义 link 标签?"}
CheckLink --> |是| UseFallback["使用回退机制"]
CheckLink --> |否| UseViteAPI["使用 Vite 原生 API"]
UseFallback --> CheckTags{"是否有标签需要注入?"}
UseViteAPI --> GenerateTags["生成 HtmlTagDescriptor 数组"]
GenerateTags --> CheckTags
CheckTags --> |否| ReturnOriginal["返回原始 HTML"]
CheckTags --> |是| InjectVite["使用 Vite API 注入<br/>返回 {html, tags}"]
InjectVite --> LogSuccess["记录成功日志"]
LogSuccess --> ReturnModified["返回修改后的 HTML"]
SkipExecution --> ReturnOriginal
```

**图表来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L131-L157)

### 文件复制机制
文件复制功能基于统一的文件系统抽象层实现：

```mermaid
flowchart TD
StartCopy([开始文件复制]) --> CheckEnabled{"插件是否启用?"}
CheckEnabled --> |否| SkipCopy["跳过复制"]
CheckEnabled --> |是| CheckCopyOptions{"是否提供 copyOptions?"}
CheckCopyOptions --> |否| SkipCopy
CheckCopyOptions --> |是| ValidateOptions["验证复制选项"]
ValidateOptions --> CheckSource["检查源文件存在性"]
CheckSource --> SourceOK{"源文件存在?"}
SourceOK --> |否| ThrowError["抛出错误"]
SourceOK --> |是| CopyProcess["执行复制过程"]
CopyProcess --> CheckType{"源文件类型?"}
CheckType --> |目录| CopyDir["递归复制目录"]
CheckType --> |文件| CopyFile["复制单个文件"]
CopyDir --> ProcessFiles["处理每个文件"]
CopyFile --> CheckNeedCopy["判断是否需要复制"]
ProcessFiles --> CheckNeedCopy
CheckNeedCopy --> NeedCopy{"需要复制?"}
NeedCopy --> |是| CopyFileOp["执行文件复制"]
NeedCopy --> |否| SkipFile["跳过文件"]
CopyFileOp --> UpdateStats["更新统计信息"]
SkipFile --> UpdateStats
UpdateStats --> ContinueLoop{"还有文件?"}
ContinueLoop --> |是| CheckNeedCopy
ContinueLoop --> |否| FinishCopy["完成复制"]
FinishCopy --> LogResult["记录复制结果"]
LogResult --> EndCopy([结束])
ThrowError --> EndCopy
SkipCopy --> EndCopy
```

**图表来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L102-L129)

**章节来源**
- [packages/core/src/plugins/injectIco/common/index.ts](file://packages/core/src/plugins/injectIco/common/index.ts#L1-L60)
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L131-L157)

## 依赖分析
injectIco 插件的依赖关系体现了清晰的分层架构：

```mermaid
graph TB
subgraph "外部依赖"
Vite[Vite 核心<br/>HtmlTagDescriptor API]
NodeFS[Node.js FS 模块]
end
subgraph "内部依赖"
BasePlugin[BasePlugin 抽象类]
Validator[参数验证器]
Logger[日志系统]
FSUtils[文件系统工具]
ObjectUtils[对象工具]
Factory[插件工厂]
EnhancedFactory[增强工厂函数<br/>createPluginFactory]
End
subgraph "插件实现"
InjectIcoPlugin[InjectIcoPlugin<br/>使用Vite原生API]
IconGenerator[generateIconTagDescriptors<br/>生成HtmlTagDescriptor]
Fallback[injectCustomLinkTag<br/>回退机制]
end
Vite --> InjectIcoPlugin
Vite --> IconGenerator
NodeFS --> FSUtils
BasePlugin --> InjectIcoPlugin
Validator --> InjectIcoPlugin
Logger --> InjectIcoPlugin
FSUtils --> InjectIcoPlugin
ObjectUtils --> InjectIcoPlugin
EnhancedFactory --> InjectIcoPlugin
IconGenerator --> InjectIcoPlugin
Fallback --> InjectIcoPlugin
```

**图表来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L1-L5)
- [packages/core/src/factory/plugin/index.ts](file://packages/core/src/factory/plugin/index.ts#L1-L5)

### 关键依赖说明
- **BasePlugin**: 提供插件生命周期管理和配置验证
- **Validator**: 实现流畅的 API 验证机制
- **Logger**: 统一日志记录和错误处理
- **FS Utils**: 抽象文件系统操作，支持增量复制
- **Object Utils**: 提供深度合并功能，支持三层配置合并
- **Enhanced Factory**: 增强的插件工厂函数，简化配置处理
- **generateIconTagDescriptors**: 专门的 HtmlTagDescriptor 生成逻辑
- **injectCustomLinkTag**: 回退机制，保持向后兼容性

**章节来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L1-L5)
- [packages/core/src/factory/plugin/index.ts](file://packages/core/src/factory/plugin/index.ts#L1-L5)

## 性能考虑
injectIco 插件在设计时充分考虑了性能优化：

### Vite原生API优势
**重大更新**：使用 HtmlTagDescriptor API 提供以下性能优势：
- **内置优化**: Vite 原生 API 经过优化，比手动字符串操作更高效
- **内存管理**: 描述符对象由 Vite 管理，减少内存泄漏风险
- **类型安全**: 编译时类型检查，避免运行时错误
- **标准化**: 符合 Vite 生态系统标准，与其他插件兼容性更好

### 增量复制策略
- **智能比较**: 基于文件修改时间和大小进行比较
- **条件复制**: 仅在文件发生变化时才进行复制
- **统计报告**: 提供详细的复制统计信息

### 内存优化
- **流式处理**: 目录遍历采用异步迭代
- **按需生成**: 标签生成仅在需要时执行
- **缓存机制**: 避免重复的文件检查操作

### 并发处理
- **异步操作**: 文件复制和检查均采用异步模式
- **错误隔离**: 单个文件错误不影响整体流程

### 配置处理优化
**更新**：三层配置合并机制减少了不必要的配置处理开销，提高了插件初始化性能。

## 故障排除指南

### 常见问题及解决方案

#### 配置验证错误
**问题**: 配置选项不符合要求
**原因**: 缺少必填字段或类型不匹配
**解决**: 检查配置选项的完整性和类型

#### 文件复制失败
**问题**: 源文件不存在或权限不足
**原因**: 源路径配置错误或权限问题
**解决**: 验证源文件路径和权限设置

#### HTML 注入失败
**问题**: 未找到 `</head>` 标签
**原因**: HTML 结构不完整
**解决**: 检查 HTML 模板的完整性

#### 插件未生效
**问题**: 插件被禁用或配置错误
**原因**: enabled 设置为 false 或配置语法错误
**解决**: 检查插件启用状态和配置语法

#### Vite原生API兼容性问题
**重大更新**：如果遇到 Vite 原生 API 相关问题：
- 确保使用支持 HtmlTagDescriptor API 的 Vite 版本
- 检查生成的描述符对象格式是否正确
- 验证 injectTo 属性是否设置为 'head'

#### 回退机制失效
**问题**: 自定义link标签注入失败
**原因**: HTML 结构不完整或正则表达式匹配失败
**解决**: 检查 HTML 模板格式和自定义标签语法

#### 配置合并问题
**更新**：如果遇到配置合并问题，检查三层配置的优先级：
1. 基础默认值（不可覆盖）
2. 插件特定默认值（可被用户配置覆盖）
3. 用户配置（最高优先级）

**章节来源**
- [packages/core/src/plugins/injectIco/types.ts](file://packages/core/src/plugins/injectIco/types.ts#L21-L33)
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L102-L129)
- [packages/docs/src/plugins/inject-ico.md](file://packages/docs/src/plugins/inject-ico.md#L243-L258)

## 结论
injectIco 插件通过其模块化的架构设计和完善的错误处理机制，为 Vite 项目提供了可靠的图标注入解决方案。**重大更新**使其成为 Vite 生态系统中的标准插件：

- **现代化**: 完全迁移到 Vite 官方 HtmlTagDescriptor API
- **可靠性**: 使用原生 API 提供更好的稳定性和性能
- **兼容性**: 通过回退机制保持向后兼容性
- **灵活性**: 支持多种配置方式，满足不同使用场景
- **可靠性**: 完善的配置验证和错误处理
- **性能**: 增量复制和异步处理优化构建性能
- **易用性**: 清晰的 API 设计和详细的文档支持
- **现代化**: 使用三层配置合并机制和增强的工厂函数

**最新改进**使得插件的配置更加简洁直观，开发者可以通过简单的字符串配置快速使用插件，同时保留了完整的配置选项以满足高级需求。Vite 原生 API 的集成确保了插件在未来版本中的长期可用性。

该插件特别适合需要在构建过程中自动化处理图标资源的前端项目，能够有效减少手动配置的工作量并提高构建效率。

## 附录

### API 参考

#### 主要函数
- **injectIco(options?)**: 创建并返回 Vite 插件实例
  - 参数: `string | InjectIcoOptions` (可选)
  - 返回: `Plugin` (Vite 插件实例)

**更新**：工厂函数现在支持字符串形式的 base 路径配置，例如 `injectIco('/assets')` 等价于 `injectIco({ base: '/assets' })`。

#### 配置接口定义
- **InjectIcoOptions**: 主要配置接口
  - 继承: `BasePluginOptions`
  - 属性: `base`, `url`, `link`, `icons`, `copyOptions`

- **Icon 接口**: 图标配置项
  - 属性: `rel`, `href`, `sizes`, `type`

- **CopyOptions 接口**: 文件复制配置
  - 属性: `sourceDir`, `targetDir`, `overwrite`, `recursive`

#### 错误处理策略
- **throw**: 抛出错误并中断构建
- **log**: 记录错误但继续执行
- **ignore**: 忽略错误并继续执行

### 使用示例
插件支持多种使用场景，从基础配置到复杂集成都有对应的示例配置。

**更新**：新增简化的配置方式示例：

#### 基础使用
```typescript
// 使用字符串配置 base 路径
injectIco('/assets')

// 使用完整配置对象
injectIco({
  base: '/assets',
  icons: [
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
  ],
  copyOptions: {
    sourceDir: 'src/assets/icons',
    targetDir: 'dist/assets/icons'
  }
})
```

#### Vite原生API使用
```typescript
// 使用 Vite 原生 HtmlTagDescriptor API
injectIco({
  base: '/assets',
  icons: [
    { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
  ]
})

// 使用自定义link标签（回退机制）
injectIco({
  link: '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />'
})
```

**章节来源**
- [packages/core/src/plugins/injectIco/index.ts](file://packages/core/src/plugins/injectIco/index.ts#L194)
- [packages/core/src/plugins/injectIco/types.ts](file://packages/core/src/plugins/injectIco/types.ts#L66-L113)
- [packages/docs/src/plugins/inject-ico.md](file://packages/docs/src/plugins/inject-ico.md#L1-L258)