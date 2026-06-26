# Lifecycle

`BasePlugin` provides unified build lifecycle management for subclasses. This document details the execution order of each phase, the framework's auto-handling logic, and the methods subclasses should implement.

## Lifecycle Overview

```
User calls plugin()
   │
   ▼
┌─────────────────────────────────────────────┐
│ 1. createPluginFactory call                  │
│    - new Plugin(options)                     │
│    - Normalize options (merge defaults)      │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 2. Vite collects plugins array              │
│    - Calls plugin object hooks              │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 3. config hook (sync)                       │
│    - Subclass can override modifyConfig()   │
│    - Returns partial config object          │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 4. configResolved hook (sync/async)         │
│    - Framework auto-wraps:                  │
│      a. enabled check                       │
│      b. validateOptions()  // subclass impl │
│      c. initialize(config) // subclass impl │
│      d. registerHooks()   // subclass impl  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 5. buildStart hook                          │
│    - Registered by subclass via registerHook│
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 6. transform / resolveId / load hooks       │
│    - Registered by subclass via registerHook│
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 7. generateBundle / writeBundle hooks       │
│    - Registered by subclass via registerHook│
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 8. buildEnd hook                            │
│    - Registered by subclass via registerHook│
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│ 9. closeBundle hook                         │
│    - Framework auto-wraps:                  │
│      a. enabled check                       │
│      b. destroy()  // subclass impl, cleanup│
└─────────────────────────────────────────────┘
```

## Subclass Methods

| Method                  | When Called            | Required | Description                                                  |
| ----------------------- | ---------------------- | -------- | ------------------------------------------------------------ |
| `validateOptions()`     | configResolved phase   | Recommended | Validate config with `this.validator`                      |
| `initialize(config)`    | configResolved phase   | Recommended | Initialize runtime state, read Vite config                  |
| `registerHooks()`       | configResolved phase   | Required    | Register business hooks via `registerHook` / `registerOrderedHook` |
| `modifyConfig(config)`  | config phase           | Optional    | Return partial config object                                 |
| `destroy()`             | closeBundle phase      | Optional    | Cleanup resources (file handles, timers, etc.)              |

## Framework Auto-handling

`BasePlugin` auto-wraps the following; subclasses don't need to reimplement:

### 1. enabled Check

All hooks registered via `registerHook` check `this.options.enabled` before execution; if disabled, they return immediately.

### 2. Error Handling

Execution results of all hooks are wrapped by `safeExecute` / `safeExecuteSync`:
- Sync hooks: exceptions caught, then handled per `errorStrategy`
- Async hooks: Promise rejections caught, then handled per `errorStrategy`

### 3. Log Isolation

Each plugin instance registers an independent log proxy via `Logger.register()` at construction, using `pluginName#sequence` as the unique identifier.

### 4. Resource Cleanup

The `closeBundle` phase automatically calls `destroy()` to ensure resource release.

## Phase Details

### config — Modify Vite Config

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected modifyConfig(config: ResolvedConfig): Partial<ResolvedConfig> | null {
    // Return partial config object; Vite will merge it
    return { resolve: { alias: { ...config.resolve.alias, '@my': '/src' } } }
  }
}
```

### configResolved — Initialization

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected initialize(config: ResolvedConfig): void {
    // Save Vite config reference
    this.viteConfig = config
    // Initialize runtime state
    this.processedFiles.clear()
  }

  protected registerHooks(): void {
    this.registerHook(this.plugin, 'transform', this.handleTransform.bind(this), 'Code transform')
  }
}
```

### buildStart — Build Start

```typescript
protected registerHooks(): void {
  this.registerHook(this.plugin, 'buildStart', async () => {
    this.logger.info('Build started')
    await this.prepareResources()
  }, 'Build start hook')
}
```

### transform — Code Transform

```typescript
protected registerHooks(): void {
  this.plugin.transform = {
    order: 'pre',  // 'pre' | 'post' | null
    handler: (code: string, id: string) => {
      if (!this.options.enabled || !this.shouldProcess(id)) return null
      return this.safeExecuteSync(() => this.transformCode(code, id), 'Code transform') ?? null
    }
  }
}
```

### generateBundle — Output Generation

```typescript
protected registerHooks(): void {
  this.registerHook(
    this.plugin,
    'generateBundle',
    async (options, bundle) => {
      // Process output object, can modify bundle
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type === 'asset') {
          await this.processAsset(fileName, asset)
        }
      }
    },
    'Output generation hook'
  )
}
```

### closeBundle — Resource Cleanup

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  private watcher?: FSWatcher
  private timer?: NodeJS.Timeout

  protected destroy(): void {
    this.watcher?.close()
    clearInterval(this.timer)
    this.logger.info('Resources cleaned up')
  }
}
```

## Next Steps

- [Hook Registration](/en/factory/hooks) — `registerHook` API details
- [BasePlugin](/en/factory/base-plugin) — Full base class API
- [createPluginFactory](/en/factory/create-plugin-factory) — Factory function usage
