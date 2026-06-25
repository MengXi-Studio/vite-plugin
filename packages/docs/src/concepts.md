# 基础概念

理解 `@meng-xi/vite-plugin` 的核心设计概念，包括插件系统架构、生命周期和通用配置。

## 架构概览

```
┌─────────────────────────────────────────────────────┐
│                    用户项目                          │
│  vite.config.ts                                     │
│    └─ plugins: [pluginA(), pluginB(), ...]          │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │   @meng-xi/vite-plugin    │
         ├───────────────────────────┤
         │  内置插件（15 个，7 组）    │
         │  ├─ compress（2）          │
         │  ├─ generate（3）          │
         │  ├─ inject（4）            │
         │  ├─ analyze（2）           │
         │  ├─ copy（2）              │
         │  ├─ guard（1）             │
         │  └─ proxy（1）             │
         ├───────────────────────────┤
         │  插件开发框架               │
         │  ├─ BasePlugin             │
         │  ├─ createPluginFactory    │
         │  ├─ Logger                 │
         │  └─ Validator              │
         ├───────────────────────────┤
         │  通用工具（14 模块）        │
         └───────────────────────────┘
```

## 插件分组

插件按功能动词分组（类似 Lodash 设计哲学），每个分组对应一类操作：

| 分组 | 语义 | 适用场景 |
| ---- | ---- | -------- |
| compress | 压缩 | 减少产物体积 |
| generate | 生成 | 自动化代码生成 |
| inject | 注入 | 向 HTML/运行时注入内容 |
| analyze | 分析 | 构建过程可视化 |
| copy | 拷贝 | 产物文件管理 |
| guard | 守卫 | 构建前校验 |
| proxy | 代理 | 开发服务器代理 |

## 插件生命周期

所有内置插件继承自 `BasePlugin`，遵循统一的生命周期：

```
配置阶段        构建阶段                    输出阶段
┌──────┐   ┌──────────────────┐   ┌──────────────────┐
│config│ → │configResolved    │ → │buildStart        │
│      │   │  (options 合并)   │   │  transform       │
│      │   │  (validate)      │   │  resolveId/load  │
│      │   │  (initialize)    │   │  ...             │
└──────┘   └──────────────────┘   ├──────────────────┤
                                  │generateBundle    │
                                  │writeBundle       │
                                  │buildEnd          │
                                  ├──────────────────┤
                                  │closeBundle       │
                                  │  (destroy 清理)  │
                                  └──────────────────┘
```

### 关键阶段说明

| 阶段 | 钩子 | 说明 |
| ---- | ---- | ---- |
| 配置 | `config` | 修改 Vite 配置，返回部分配置对象 |
| 配置解析 | `configResolved` | 读取最终配置，初始化插件状态 |
| 构建 | `buildStart` / `transform` | 构建开始与代码转换 |
| 输出 | `generateBundle` / `writeBundle` | 产物生成与写入磁盘 |
| 结束 | `buildEnd` / `closeBundle` | 构建结束与资源清理 |

::: tip 框架自动处理
`BasePlugin` 自动包裹 `configResolved` 和 `closeBundle`，确保 `enabled` 检查、错误处理和资源清理。插件开发者只需关注业务逻辑。
:::

## 通用配置

所有插件共享 `BasePluginOptions`：

```typescript
interface BasePluginOptions {
  /** 是否启用插件，默认 true */
  enabled?: boolean
  /** 是否显示详细日志，默认 true */
  verbose?: boolean
  /** 错误处理策略，默认 'throw' */
  errorStrategy?: 'throw' | 'log' | 'ignore'
}
```

### enabled — 启用/禁用

```typescript
compressAssets({
  algorithm: 'gzip',
  enabled: process.env.NODE_ENV === 'production'  // 仅生产环境启用
})
```

### verbose — 日志控制

```typescript
compressAssets({
  verbose: false  // 静默运行，不输出日志
})
```

### errorStrategy — 错误处理

| 策略 | 行为 | 适用场景 |
| ---- | ---- | -------- |
| `throw` | 抛出异常，中断构建 | 开发环境（默认） |
| `log` | 记录错误，继续构建 | 生产环境（容错） |
| `ignore` | 静默忽略 | 非关键插件 |

```typescript
imageOptimizer({
  errorStrategy: 'log'  // 图片处理失败不中断构建
})
```

## 错误处理机制

`BasePlugin` 提供 `safeExecute` 和 `safeExecuteSync` 方法包裹插件逻辑：

- **同步钩子**（`config`、`transform`）使用 `safeExecuteSync`
- **异步钩子**（`writeBundle`、`closeBundle`）使用 `safeExecute`
- 异常根据 `errorStrategy` 决定是否中断构建

::: warning 钩子保护
所有通过 `registerHook` / `registerOrderedHook` 注册的钩子自动获得 `enabled` 检查和错误包裹。直接赋值的钩子（`plugin.xxx = ...`）需手动处理。
:::

## 日志系统

`Logger` 是单例模式，为每个插件实例提供独立的日志代理：

```typescript
// 框架内部自动创建
this.logger.info('压缩完成')
this.logger.success('处理 10 个文件')
this.logger.warn('文件过大: main.js (2MB)')
this.logger.error('压缩失败: ' + error.message)
```

每个插件实例拥有唯一标识（`插件名#序号`），同类型多实例的日志配置互不影响。

## 配置验证

`Validator` 提供链式 API 校验配置：

```typescript
protected validateOptions(): void {
  this.validator
    .field('algorithm')
    .required()
    .enum(['gzip', 'brotli', 'both'])
    .validate()

  this.validator
    .field('threshold')
    .number()
    .minValue(0)
    .validate()
}
```

## 下一步

- [按需导入](/on-demand-import) — 优化打包体积
- [最佳实践](/best-practices) — 场景化推荐
- [插件开发框架](/factory) — 开发自定义插件
- [生命周期](/factory/lifecycle) — 钩子执行顺序详解
