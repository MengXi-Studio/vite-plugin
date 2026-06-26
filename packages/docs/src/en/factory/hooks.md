# Hook Registration

`BasePlugin` provides two hook registration methods: `registerHook` and `registerOrderedHook`. This document details their APIs, differences, and best practices.

## Registration Methods

### registerHook

Register a normal Vite hook:

```typescript
protected registerHook<K extends keyof NonNullable<Plugin>>(
  plugin: Plugin,
  hook: K,
  handler: NonNullable<Plugin>[K],
  context: string
): void
```

**Parameters**:
- `plugin` — Vite plugin object (usually `this.plugin`)
- `hook` — Hook name, e.g. `'buildStart'`, `'transform'`, `'generateBundle'`
- `handler` — Hook handler function
- `context` — Context description for error logs (e.g. `'Code transform'`)

**Behavior**:
1. Wraps handler, adding `enabled` check
2. Sync/async hooks are wrapped by `safeExecuteSync` / `safeExecute` respectively
3. Exceptions decide whether to halt build per `errorStrategy`
4. Async results (Promise) `.catch` is auto-wired to error handling

### registerOrderedHook

Register hooks with execution order (`transform`, `renderChunk`, `generateBundle`, etc.):

```typescript
protected registerOrderedHook<K extends keyof NonNullable<Plugin>>(
  plugin: Plugin,
  hook: K,
  handler: NonNullable<Plugin>[K],
  context: string,
  order: 'pre' | 'post' | 'normal' = 'normal'
): void
```

**Parameters**: Adds `order` on top of `registerHook`:
- `'pre'` — Execute before default hooks
- `'post'` — Execute after default hooks
- `'normal'` — Default order (equivalent to not setting)

## Registration Examples

### Basic Example

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected registerHooks(): void {
    // Register async hook
    this.registerHook(
      this.plugin,
      'buildStart',
      async () => {
        this.logger.info('Build started')
        await this.prepare()
      },
      'Build start'
    )

    // Register sync hook
    this.registerHook(
      this.plugin,
      'closeBundle',
      () => {
        this.logger.info('Build ended')
      },
      'Build end'
    )
  }
}
```

### Ordered transform Hook

```typescript
class AutoImportPlugin extends BasePlugin<AutoImportOptions> {
  protected registerHooks(): void {
    // 'pre' ensures injection before other plugins transform
    this.registerOrderedHook(
      this.plugin,
      'transform',
      (code: string, id: string) => {
        if (!this.options.enabled || !this.initialized) return null
        if (!this.options.fileFilter.test(id)) return null
        return this.safeExecuteSync(
          () => this.transformCode(code, id),
          'Auto import code transform'
        ) ?? null
      },
      'Auto import code transform',
      'pre'
    )
  }
}
```

### Direct Assignment for transform

The `transform` hook needs to return an object with the `order` property, so direct assignment is common:

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected registerHooks(): void {
    this.plugin.transform = {
      order: 'pre',
      handler: (code: string, id: string) => {
        if (!this.options.enabled) return null
        return this.safeExecuteSync(
          () => this.transformCode(code, id),
          'Code transform'
        ) ?? null
      }
    }
  }
}
```

::: warning Direct Assignment Needs Manual Handling
Directly assigned hooks (`plugin.xxx = ...`) are not wrapped by `registerHook`. If you need `enabled` checks and error handling, you must implement them manually inside the handler, as shown above.
:::

## Hook Execution Order

Vite hook execution order (build mode):

```
config → configResolved → options → buildStart
   ↓
transform → resolveId → load (loop per module)
   ↓
renderChunk → generateBundle → writeBundle
   ↓
closeBundle
```

`order` takes effect in hooks that support ordering like `transform`, `renderChunk`, `generateBundle`:
1. `'pre'` hooks execute first
2. `'normal'` hooks execute in plugin declaration order
3. `'post'` hooks execute last

## Sync vs Async Handling

`registerHook` auto-detects sync/async hooks:

```typescript
// Sync hook: return value returned directly, exceptions caught
this.registerHook(
  this.plugin,
  'configResolved',
  (config) => {
    this.viteConfig = config  // Sync operation
  },
  'Config resolved'
)

// Async hook: returns Promise, reject auto-wired to error handling
this.registerHook(
  this.plugin,
  'generateBundle',
  async (options, bundle) => {
    await this.processBundle(bundle)  // Async operation
  },
  'Output generation'
)
```

## Framework Auto-wrap Logic

Simplified internal implementation of `registerHook`:

```typescript
protected registerHook(plugin, hook, handler, context) {
  const instance = this
  const original = handler

  plugin[hook] = function (...args) {
    // 1. enabled check
    if (!instance.options.enabled) return

    // 2. Sync execution
    const result = instance.safeExecuteSync(() => original.apply(this, args), context)

    // 3. Async result handling
    if (result && typeof result.then === 'function') {
      return result.catch(error => instance.handleError(error, context))
    }

    return result
  }
}
```

## Best Practices

### 1. Register Inside registerHooks

All business hooks should be registered inside `registerHooks()`, which is auto-called during the `configResolved` phase:

```typescript
class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected registerHooks(): void {
    this.registerHook(this.plugin, 'buildStart', this.onBuildStart.bind(this), 'Build start')
    this.registerHook(this.plugin, 'generateBundle', this.onGenerateBundle.bind(this), 'Output generation')
    this.registerHook(this.plugin, 'closeBundle', this.onCloseBundle.bind(this), 'Build end')
  }

  private async onBuildStart() { /* ... */ }
  private async onGenerateBundle(options, bundle) { /* ... */ }
  private onCloseBundle() { /* ... */ }
}
```

### 2. Use Direct Assignment for transform

The `transform` hook needs to return a `{ order, handler }` object and cannot be registered via `registerHook`. Use direct assignment:

```typescript
this.plugin.transform = {
  order: 'pre',
  handler: (code, id) => {
    if (!this.options.enabled) return null
    return this.safeExecuteSync(() => this.doTransform(code, id), 'Transform') ?? null
  }
}
```

### 3. Clear Context Descriptions

The `context` parameter appears in error logs; keep descriptions concise and clear:

```typescript
// ✅ Clear
this.registerHook(this.plugin, 'transform', handler, 'Compress JS code')

// ❌ Vague
this.registerHook(this.plugin, 'transform', handler, 'Hook')
```

### 4. Use async/await for Async Hooks

```typescript
this.registerHook(
  this.plugin,
  'writeBundle',
  async () => {
    await fs.writeFile(outputPath, content)
    await this.cleanup()
  },
  'Write output'
)
```

## Next Steps

- [Lifecycle](/en/factory/lifecycle) — Detailed execution order of each phase
- [BasePlugin](/en/factory/base-plugin) — Full base class API
- [createPluginFactory](/en/factory/create-plugin-factory) — Factory function usage
