# Core Concepts

Understand the core design concepts of `@meng-xi/vite-plugin`, including the plugin system architecture, lifecycle, and common options.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    User Project                      │
│  vite.config.ts                                     │
│    └─ plugins: [pluginA(), pluginB(), ...]          │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │   @meng-xi/vite-plugin    │
         ├───────────────────────────┤
         │  Built-in Plugins (15, 7) │
         │  ├─ compress (2)          │
         │  ├─ generate (3)          │
         │  ├─ inject (4)            │
         │  ├─ analyze (2)           │
         │  ├─ copy (2)              │
         │  ├─ guard (1)             │
         │  └─ proxy (1)             │
         ├───────────────────────────┤
         │  Plugin Framework          │
         │  ├─ BasePlugin             │
         │  ├─ createPluginFactory    │
         │  ├─ Logger                 │
         │  └─ Validator              │
         ├───────────────────────────┤
         │  Common Utils (14)         │
         └───────────────────────────┘
```

## Plugin Groups

Plugins are grouped by functional verb, with each group representing a category of operations:

| Group    | Semantics    | Use Case                       |
| -------- | ------------ | ------------------------------ |
| compress | Compression  | Reduce output size             |
| generate | Generation   | Automated code generation      |
| inject   | Injection    | Inject content into HTML/runtime |
| analyze  | Analysis     | Build process visualization    |
| copy     | Copy         | Output file management         |
| guard    | Guard        | Pre-build validation           |
| proxy    | Proxy        | Dev server proxy               |

## Plugin Lifecycle

All built-in plugins extend `BasePlugin` and follow a unified lifecycle:

```
Config Phase     Build Phase                  Output Phase
┌──────┐   ┌──────────────────┐   ┌──────────────────┐
│config│ → │configResolved    │ → │buildStart        │
│      │   │  (options merge)  │   │  transform       │
│      │   │  (validate)       │   │  resolveId/load  │
│      │   │  (initialize)     │   │  ...             │
└──────┘   └──────────────────┘   ├──────────────────┤
                                  │generateBundle    │
                                  │writeBundle       │
                                  │buildEnd          │
                                  ├──────────────────┤
                                  │closeBundle       │
                                  │  (destroy cleanup)│
                                  └──────────────────┘
```

### Key Phases

| Phase   | Hook                               | Description                              |
| ------- | ---------------------------------- | ---------------------------------------- |
| Config  | `config`                           | Modify Vite config, return partial config |
| Resolved| `configResolved`                   | Read final config, initialize plugin state |
| Build   | `buildStart` / `transform`         | Build start and code transformation      |
| Output  | `generateBundle` / `writeBundle`   | Output generation and disk writing       |
| End     | `buildEnd` / `closeBundle`         | Build end and resource cleanup           |

::: tip Auto-handled by framework
`BasePlugin` automatically wraps `configResolved` and `closeBundle` to ensure `enabled` checks, error handling, and resource cleanup. Plugin developers only need to focus on business logic.
:::

## Common Options

All plugins share `BasePluginOptions`:

```typescript
interface BasePluginOptions {
  /** Enable plugin, default true */
  enabled?: boolean
  /** Show verbose logs, default true */
  verbose?: boolean
  /** Error handling strategy, default 'throw' */
  errorStrategy?: 'throw' | 'log' | 'ignore'
}
```

### enabled — Enable/Disable

```typescript
compressAssets({
  algorithm: 'gzip',
  enabled: process.env.NODE_ENV === 'production'  // Only enable in production
})
```

### verbose — Log Control

```typescript
compressAssets({
  verbose: false  // Silent mode, no logs
})
```

### errorStrategy — Error Handling

| Strategy  | Behavior                     | Use Case                  |
| --------- | ---------------------------- | ------------------------- |
| `throw`   | Throw exception, halt build  | Development (default)     |
| `log`     | Log error, continue build    | Production (fault-tolerant) |
| `ignore`  | Silent ignore                | Non-critical plugins      |

```typescript
imageOptimizer({
  errorStrategy: 'log'  // Image processing failure doesn't halt build
})
```

## Error Handling Mechanism

`BasePlugin` provides `safeExecute` and `safeExecuteSync` methods to wrap plugin logic:

- **Sync hooks** (`config`, `transform`) use `safeExecuteSync`
- **Async hooks** (`writeBundle`, `closeBundle`) use `safeExecute`
- Exceptions decide whether to halt build based on `errorStrategy`

::: warning Hook Protection
All hooks registered via `registerHook` / `registerOrderedHook` automatically get `enabled` checks and error wrapping. Directly assigned hooks (`plugin.xxx = ...`) need manual handling.
:::

## Logger System

`Logger` is a singleton, providing independent log proxies for each plugin instance:

```typescript
// Auto-created by framework internally
this.logger.info('Compression complete')
this.logger.success('Processed 10 files')
this.logger.warn('File too large: main.js (2MB)')
this.logger.error('Compression failed: ' + error.message)
```

Each plugin instance has a unique identifier (`pluginName#sequence`), so log configs of multiple instances of the same type don't interfere with each other.

## Configuration Validation

`Validator` provides a chainable API to validate config:

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

## Next Steps

- [On-demand Import](/en/guide/on-demand-import) — Optimize bundle size
- [Best Practices](/en/guide/best-practices) — Scenario-based recommendations
- [Plugin Factory](/en/factory) — Develop custom plugins
- [Lifecycle](/en/factory/lifecycle) — Detailed hook execution order
