# Introduction

`@meng-xi/vite-plugin` is a toolkit that provides practical plugins for Vite, and also serves as a complete **Vite Plugin Development Framework**.

## Built-in Plugins

Four ready-to-use plugins covering common build scenarios:

| Plugin                                          | Description                                                                  |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| [copyFile](/en/plugins/copy-file)               | Copy files or directories to specified locations after build                 |
| [generateRouter](/en/plugins/generate-router)   | Auto-generate router configuration from uni-app's pages.json                 |
| [generateVersion](/en/plugins/generate-version) | Auto-generate version numbers with file output and global variable injection |
| [injectIco](/en/plugins/inject-ico)             | Inject website icon links into HTML files                                    |

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

- **File System**: readFileSync, writeFileContent, copySourceToTarget, readDirRecursive, etc.
- **Formatting**: formatDate, parseTemplate, generateRandomHash, padNumber, etc.
- **Object Utils**: deepMerge, toCamelCase, toPascalCase, stripJsonComments, etc.

## Next Steps

- [Installation](/en/installation) - Quick start
- [Plugin Documentation](/en/plugins/copy-file) - Learn detailed plugin configurations
- [GitHub](https://github.com/MengXi-Studio/vite-plugin) - View source code and examples
