# 钩子注册

`BasePlugin` 提供两种钩子注册方式：`registerHook` 与 `registerOrderedHook`。本文档详解其 API、差异与最佳实践。

## 注册方法

### registerHook

注册普通 Vite 钩子：

```typescript
protected registerHook<K extends keyof NonNullable<Plugin>>(
  plugin: Plugin,
  hook: K,
  handler: NonNullable<Plugin>[K],
  context: string
): void
```

**参数**：
- `plugin` — Vite 插件对象（通常是 `this.plugin`）
- `hook` — 钩子名称，如 `'buildStart'`、`'transform'`、`'generateBundle'`
- `handler` — 钩子处理函数
- `context` — 错误日志中的上下文描述（如 `'代码转换'`）

**行为**：
1. 包装 handler，添加 `enabled` 检查
2. 同步/异步钩子分别用 `safeExecuteSync` / `safeExecute` 包裹
3. 异常根据 `errorStrategy` 决定是否中断构建
4. 异步结果（Promise）的 `.catch` 自动接入错误处理

### registerOrderedHook

注册带执行顺序的钩子（`transform`、`renderChunk`、`generateBundle` 等）：

```typescript
protected registerOrderedHook<K extends keyof NonNullable<Plugin>>(
  plugin: Plugin,
  hook: K,
  handler: NonNullable<Plugin>[K],
  context: string,
  order: 'pre' | 'post' | 'normal' = 'normal'
): void
```

**参数**：在 `registerHook` 基础上增加 `order`：
- `'pre'` — 在默认钩子之前执行
- `'post'` — 在默认钩子之后执行
- `'normal'` — 默认顺序（等价于不设置）

## 注册示例

### 基本示例

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected registerHooks(): void {
    // 注册异步钩子
    this.registerHook(
      this.plugin,
      'buildStart',
      async () => {
        this.logger.info('构建开始')
        await this.prepare()
      },
      '构建开始'
    )

    // 注册同步钩子
    this.registerHook(
      this.plugin,
      'closeBundle',
      () => {
        this.logger.info('构建结束')
      },
      '构建结束'
    )
  }
}
```

### 带顺序的 transform 钩子

```typescript
class AutoImportPlugin extends BasePlugin<AutoImportOptions> {
  protected registerHooks(): void {
    // 'pre' 确保在其他插件转换之前注入
    this.registerOrderedHook(
      this.plugin,
      'transform',
      (code: string, id: string) => {
        if (!this.options.enabled || !this.initialized) return null
        if (!this.options.fileFilter.test(id)) return null
        return this.safeExecuteSync(
          () => this.transformCode(code, id),
          '自动导入代码转换'
        ) ?? null
      },
      '自动导入代码转换',
      'pre'
    )
  }
}
```

### 直接赋值的 transform

`transform` 钩子需要返回带 `order` 属性的对象，因此常用直接赋值：

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected registerHooks(): void {
    this.plugin.transform = {
      order: 'pre',
      handler: (code: string, id: string) => {
        if (!this.options.enabled) return null
        return this.safeExecuteSync(
          () => this.transformCode(code, id),
          '代码转换'
        ) ?? null
      }
    }
  }
}
```

::: warning 直接赋值需手动处理
直接赋值的钩子（`plugin.xxx = ...`）不会经过 `registerHook` 包裹。如果需要 `enabled` 检查和错误处理，必须在 handler 内部手动实现，如上例所示。
:::

## 钩子执行顺序

Vite 钩子执行顺序（构建模式）：

```
config → configResolved → options → buildStart
   ↓
transform → resolveId → load（每个模块循环）
   ↓
renderChunk → generateBundle → writeBundle
   ↓
closeBundle
```

`order` 在 `transform`、`renderChunk`、`generateBundle` 等支持顺序的钩子中生效：
1. `'pre'` 钩子先执行
2. `'normal'` 钩子按插件声明顺序执行
3. `'post'` 钩子最后执行

## 同步 vs 异步处理

`registerHook` 自动识别同步/异步钩子：

```typescript
// 同步钩子：返回值直接返回，异常被捕获
this.registerHook(
  this.plugin,
  'configResolved',
  (config) => {
    this.viteConfig = config  // 同步操作
  },
  '配置解析'
)

// 异步钩子：返回 Promise，reject 自动接入错误处理
this.registerHook(
  this.plugin,
  'generateBundle',
  async (options, bundle) => {
    await this.processBundle(bundle)  // 异步操作
  },
  '产物生成'
)
```

## 框架自动包裹逻辑

`registerHook` 的内部实现（简化）：

```typescript
protected registerHook(plugin, hook, handler, context) {
  const instance = this
  const original = handler

  plugin[hook] = function (...args) {
    // 1. enabled 检查
    if (!instance.options.enabled) return

    // 2. 同步执行
    const result = instance.safeExecuteSync(() => original.apply(this, args), context)

    // 3. 异步结果处理
    if (result && typeof result.then === 'function') {
      return result.catch(error => instance.handleError(error, context))
    }

    return result
  }
}
```

## 最佳实践

### 1. 必须在 registerHooks 中注册

所有业务钩子应在 `registerHooks()` 方法中注册，该方法在 `configResolved` 阶段自动调用：

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected registerHooks(): void {
    this.registerHook(this.plugin, 'buildStart', this.onBuildStart.bind(this), '构建开始')
    this.registerHook(this.plugin, 'generateBundle', this.onGenerateBundle.bind(this), '产物生成')
    this.registerHook(this.plugin, 'closeBundle', this.onCloseBundle.bind(this), '构建结束')
  }

  private async onBuildStart() { /* ... */ }
  private async onGenerateBundle(options, bundle) { /* ... */ }
  private onCloseBundle() { /* ... */ }
}
```

### 2. transform 使用直接赋值

`transform` 钩子需要返回 `{ order, handler }` 对象，无法通过 `registerHook` 注册，应使用直接赋值：

```typescript
this.plugin.transform = {
  order: 'pre',
  handler: (code, id) => {
    if (!this.options.enabled) return null
    return this.safeExecuteSync(() => this.doTransform(code, id), '转换') ?? null
  }
}
```

### 3. 上下文描述要清晰

`context` 参数会出现在错误日志中，描述应简洁明了：

```typescript
// ✅ 清晰
this.registerHook(this.plugin, 'transform', handler, '压缩 JS 代码')

// ❌ 模糊
this.registerHook(this.plugin, 'transform', handler, '钩子')
```

### 4. 异步钩子使用 async/await

```typescript
this.registerHook(
  this.plugin,
  'writeBundle',
  async () => {
    await fs.writeFile(outputPath, content)
    await this.cleanup()
  },
  '写入产物'
)
```

## 下一步

- [生命周期](/factory/lifecycle) — 各阶段执行顺序详解
- [BasePlugin](/factory/base-plugin) — 基类完整 API
- [createPluginFactory](/factory/create-plugin-factory) — 工厂函数用法
