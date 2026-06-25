# 生命周期

`BasePlugin` 为子类提供统一的构建生命周期管理。本文档详解各阶段的执行顺序、框架自动处理逻辑以及子类应实现的方法。

## 生命周期总览

```
用户调用 plugin()
   │
   ▼
┌─────────────────────────────────────────────┐
│ 1. createPluginFactory 调用                  │
│    - new Plugin(options)                     │
│    - 标准化 options（合并默认值）              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 2. Vite 收集 plugins 数组                    │
│    - 调用 plugin 对象的钩子                    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 3. config 钩子（同步）                       │
│    - 子类可覆盖 modifyConfig()                │
│    - 返回部分配置对象                          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 4. configResolved 钩子（同步/异步）           │
│    - 框架自动包裹：                            │
│      a. enabled 检查                          │
│      b. validateOptions()  // 子类实现         │
│      c. initialize(config) // 子类实现         │
│      d. registerHooks()   // 子类实现          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 5. buildStart 钩子                           │
│    - 子类通过 registerHook 注册               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 6. transform / resolveId / load 钩子         │
│    - 子类通过 registerHook 注册               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 7. generateBundle / writeBundle 钩子          │
│    - 子类通过 registerHook 注册               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 8. buildEnd 钩子                             │
│    - 子类通过 registerHook 注册               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 9. closeBundle 钩子                          │
│    - 框架自动包裹：                            │
│      a. enabled 检查                          │
│      b. destroy()  // 子类实现，清理资源       │
└─────────────────────────────────────────────┘
```

## 子类应实现的方法

| 方法 | 调用时机 | 是否必须 | 说明 |
| ---- | -------- | -------- | ---- |
| `validateOptions()` | configResolved 阶段 | 推荐 | 使用 `this.validator` 校验配置 |
| `initialize(config)` | configResolved 阶段 | 推荐 | 初始化运行时状态、读取 Vite 配置 |
| `registerHooks()` | configResolved 阶段 | 必须 | 通过 `registerHook` / `registerOrderedHook` 注册业务钩子 |
| `modifyConfig(config)` | config 阶段 | 可选 | 返回部分配置对象 |
| `destroy()` | closeBundle 阶段 | 可选 | 清理资源（文件句柄、定时器等） |

## 框架自动处理

`BasePlugin` 在以下环节自动包裹，子类无需重复实现：

### 1. enabled 检查

所有通过 `registerHook` 注册的钩子执行前会检查 `this.options.enabled`，若禁用则直接返回。

### 2. 错误处理

所有钩子的执行结果会被 `safeExecute` / `safeExecuteSync` 包裹：
- 同步钩子：异常被捕获后按 `errorStrategy` 处理
- 异步钩子：Promise 异常被捕获后按 `errorStrategy` 处理

### 3. 日志隔离

每个插件实例在构造时通过 `Logger.register()` 注册独立日志代理，使用 `插件名#序号` 作为唯一标识。

### 4. 资源清理

`closeBundle` 阶段自动调用 `destroy()`，确保资源释放。

## 阶段详解

### config — 修改 Vite 配置

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected modifyConfig(config: ResolvedConfig): Partial<ResolvedConfig> | null {
    // 返回部分配置对象，Vite 会进行合并
    return { resolve: { alias: { ...config.resolve.alias, '@my': '/src' } } }
  }
}
```

### configResolved — 初始化

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected initialize(config: ResolvedConfig): void {
    // 保存 Vite 配置引用
    this.viteConfig = config
    // 初始化运行时状态
    this.processedFiles.clear()
  }

  protected registerHooks(): void {
    this.registerHook(this.plugin, 'transform', this.handleTransform.bind(this), '代码转换')
  }
}
```

### buildStart — 构建开始

```typescript
protected registerHooks(): void {
  this.registerHook(this.plugin, 'buildStart', async () => {
    this.logger.info('构建开始')
    await this.prepareResources()
  }, '构建开始钩子')
}
```

### transform — 代码转换

```typescript
protected registerHooks(): void {
  this.plugin.transform = {
    order: 'pre',  // 'pre' | 'post' | null
    handler: (code: string, id: string) => {
      if (!this.options.enabled || !this.shouldProcess(id)) return null
      return this.safeExecuteSync(() => this.transformCode(code, id), '代码转换') ?? null
    }
  }
}
```

### generateBundle — 产物生成

```typescript
protected registerHooks(): void {
  this.registerHook(
    this.plugin,
    'generateBundle',
    async (options, bundle) => {
      // 处理产物对象，可修改 bundle
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type === 'asset') {
          await this.processAsset(fileName, asset)
        }
      }
    },
    '产物生成钩子'
  )
}
```

### closeBundle — 资源清理

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  private watcher?: FSWatcher
  private timer?: NodeJS.Timeout

  protected destroy(): void {
    this.watcher?.close()
    clearInterval(this.timer)
    this.logger.info('资源已清理')
  }
}
```

## 下一步

- [钩子注册](/factory/hooks) — `registerHook` API 详解
- [BasePlugin](/factory/base-plugin) — 基类完整 API
- [createPluginFactory](/factory/create-plugin-factory) — 工厂函数用法
