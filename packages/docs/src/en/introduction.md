# Introduction

`@meng-xi/vite-plugin` is a toolkit that provides practical plugins for Vite, and also serves as a complete **Vite Plugin Development Framework**.

## Built-in Plugins

Six ready-to-use plugins covering common build scenarios:

| Plugin                                          | Description                                                                               |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [buildProgress](/en/plugins/build-progress)     | Display real-time build progress bar in terminal, supporting three display formats        |
| [copyFile](/en/plugins/copy-file)               | Copy files or directories to specified locations after build, with incremental copying    |
| [generateRouter](/en/plugins/generate-router)   | Auto-generate router configuration from uni-app's pages.json                              |
| [generateVersion](/en/plugins/generate-version) | Auto-generate version numbers with file output and global variable injection              |
| [injectIco](/en/plugins/inject-ico)             | Inject website icon links into HTML files                                                 |
| [injectLoading](/en/plugins/inject-loading)     | Inject global Loading state management with request interception and white-screen Loading |

## Plugin Development Framework

Export core components to quickly build custom plugins:

| Component           | Description                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------- |
| BasePlugin          | Plugin base class providing lifecycle management, logging, validation and standard features |
| createPluginFactory | Plugin factory function that handles options merging and instantiation                      |
| Logger              | Singleton logger manager with plugin-level log control                                      |
| Validator           | Chainable configuration validator ensuring parameter type correctness                       |

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

## Utility Functions

Exported utility functions:

- **File System**: readFileContent, writeFileContent, copySourceToTarget, readDirRecursive, etc.
- **Formatting**: formatDate, parseTemplate, generateRandomHash, padNumber, etc.
- **Object Utils**: deepMerge, toCamelCase, toPascalCase, stripJsonComments, etc.

## Next Steps

- [Installation](/en/installation) - Quick start
- [buildProgress](/en/plugins/build-progress) - Build progress display
- [injectLoading](/en/plugins/inject-loading) - Global Loading state management
- [Plugin Factory](/en/factory/index) - Develop custom plugins
- [GitHub](https://github.com/MengXi-Studio/vite-plugin) - View source code and examples
