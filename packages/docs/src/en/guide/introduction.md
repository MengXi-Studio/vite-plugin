# Introduction

`@meng-xi/vite-plugin` is a toolkit that provides practical plugins for Vite, and also serves as a complete **Vite Plugin Development Framework**.

## What It Does

- **15 ready-to-use plugins** — Grouped into 7 functional categories (compress / generate / inject / analyze / copy / guard / proxy), covering build optimization, code generation, asset management, and developer experience
- **Plugin Development Framework** — Exports core components like BasePlugin, Logger, and Validator to quickly build custom Vite plugins
- **14 utility modules** — Concurrency control, file system, HTML injection, path processing, and more, all available via sub-path imports

## Plugin Groups

Plugins are grouped by functional verb, and can be imported by group or individually:

| Group                                                    | Description | Plugins                                                                  |
| -------------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| [compress](/en/plugins/index#compress)                   | Compression | compressAssets, imageOptimizer                                           |
| [generate](/en/plugins/index#generate)                   | Generation  | autoImport, generateRouter, generateVersion                              |
| [inject](/en/plugins/index#inject)                       | Injection   | htmlInject, loadingManager, faviconManager, versionUpdateChecker         |
| [analyze](/en/plugins/index#analyze)                     | Analysis    | bundleAnalyzer, buildProgress                                            |
| [copy](/en/plugins/index#copy)                           | Copy        | copyFile, assetManifest                                                  |
| [guard](/en/plugins/index#guard)                         | Guard       | envGuard                                                                 |
| [proxy](/en/plugins/index#proxy)                         | Proxy       | proxyManager                                                             |

## Plugin Development Framework

Export core components to quickly build custom plugins:

| Component           | Description                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| BasePlugin          | Plugin base class providing lifecycle management, logging, validation, and safe execution wrappers |
| createPluginFactory | Plugin factory function that handles options merging, normalization, and instantiation             |
| Logger              | Singleton logger manager with plugin-level log control                                             |
| Validator           | Chainable configuration validator supporting required, type, enum, range, and custom validation    |

## Common Options

All built-in plugins extend BasePlugin and support these common options:

```typescript
interface BasePluginOptions {
	/** Enable plugin, default true */
	enabled?: boolean
	/** Show verbose logs, default true */
	verbose?: boolean
	/** Error handling strategy: throw | log | ignore */
	errorStrategy?: 'throw' | 'log' | 'ignore'
}
```

## Learning Path

::: tip Recommended learning order
1. [Installation](/en/guide/installation) — Install dependencies
2. [Quick Start](/en/guide/quick-start) — Get started in 5 minutes
3. [Core Concepts](/en/guide/concepts) — Understand the plugin system and lifecycle
4. [On-demand Import](/en/guide/on-demand-import) — Optimize bundle size
5. [Best Practices](/en/guide/best-practices) — Scenario-based recommendations and common pitfalls
:::

## Next Steps

- [Installation](/en/guide/installation) — Installation and configuration
- [Quick Start](/en/guide/quick-start) — Get started in 5 minutes
- [Plugins Overview](/en/plugins/index) — Browse all plugins
- [Plugin Factory](/en/factory/index) — Develop custom plugins
- [GitHub](https://github.com/MengXi-Studio/vite-plugin) — View source code and examples
