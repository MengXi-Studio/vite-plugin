# Introduction

`@meng-xi/vite-plugin` is a toolkit that provides practical plugins for Vite, and also serves as a complete **Vite Plugin Development Framework**.

## Built-in Plugins

Thirteen ready-to-use plugins covering common build scenarios:

| Plugin                                                     | Description                                                                                                                                               |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [assetManifest](/en/plugins/asset-manifest)                | Automatically scan build output and generate asset mapping manifest, supporting Vite/Webpack/custom formats, entry grouping, and runtime injection        |
| [autoImport](/en/plugins/auto-import)                      | Auto-inject import statements with preset mappings, wildcard (`'*'`), directory scanning, Vue template auto-import, and TypeScript declaration generation |
| [buildProgress](/en/plugins/build-progress)                | Display real-time build progress bar in terminal, supporting bar / spinner / minimal formats                                                              |
| [bundleAnalyzer](/en/plugins/bundle-analyzer)              | Build artifact size analysis with JSON/HTML reports, gzip calculation, threshold alerts, and build comparison                                             |
| [compressAssets](/en/plugins/compress-assets)              | Compress build artifacts with gzip / brotli / both, configurable compression level, file filtering, and concurrency, plus compression statistics report   |
| [copyFile](/en/plugins/copy-file)                          | Copy files or directories to specified locations after build, with incremental copying                                                                    |
| [envGuard](/en/plugins/env-guard)                          | Environment variable validation with type checking, range validation, custom rules and runtime guard                                                      |
| [faviconManager](/en/plugins/favicon-manager)              | Manage website favicon links injection into HTML files                                                                                                    |
| [generateRouter](/en/plugins/generate-router)              | Auto-generate router configuration and TypeScript type declarations from uni-app's pages.json                                                             |
| [generateVersion](/en/plugins/generate-version)            | Auto-generate version numbers with file output and global variable injection                                                                              |
| [htmlInject](/en/plugins/html-inject)                      | HTML content injection with multiple positions and conditions                                                                                             |
| [loadingManager](/en/plugins/loading-manager)              | Global Loading state management with XHR/Fetch request interception, white-screen Loading, custom styles & animations, and lifecycle callbacks            |
| [versionUpdateChecker](/en/plugins/version-update-checker) | Runtime version update check with refresh prompt                                                                                                          |

## Plugin Development Framework

Export core components to quickly build custom plugins:

| Component           | Description                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| BasePlugin          | Plugin base class providing lifecycle management, logging, validation, and safe execution wrappers |
| createPluginFactory | Plugin factory function that handles options merging, normalization, and instantiation             |
| Logger              | Singleton logger manager with plugin-level log control                                             |
| Validator           | Chainable configuration validator supporting required, type, enum, range, and custom validation    |
| PluginWithInstance  | Vite plugin type with plugin instance reference for external access to internal state              |
| PluginFactory       | Plugin factory function type definition                                                            |
| OptionsNormalizer   | Options normalizer type, supporting conversion from simplified to full configuration               |

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

## Common Utility Modules

Six utility modules covering common scenarios in plugin development:

### format — Formatting Utilities

Provides date formatting parameters, template variable replacement, date formatting, and file size formatting:

- `getDateFormatParams` — Get date formatting parameter object
- `parseTemplate` — Replace `{{key}}` placeholders in template strings
- `formatDate` — Format date strings using `{key}` placeholders
- `formatFileSize` — Format bytes into a human-readable file size string

### fs — File System Utilities

Provides file operations, directory scanning, safe writing, and change detection:

- `checkSourceExists` — Check if source path exists
- `copySourceToTarget` — Copy files or directories with incremental copying
- `writeFileContent` — Async write file content
- `scanDirectory` — Recursively scan directory, collect file info with extension and path filtering
- `writeJsonReport` — Write data to a JSON file
- `writeFileSyncSafely` — Synchronously write file, automatically creating non-existent directories
- `shouldUpdateFileContent` — Check if file content needs updating, reducing unnecessary IO

### html — HTML Injection Utilities

Provides multiple HTML content injection strategies, security filtering, and attribute value escaping:

- `injectBeforeTag` — Inject code before a specified closing tag
- `injectHeadAndBody` — Dual-zone HTML injection (head + body)
- `sanitizeContent` — Sanitize injected content to prevent XSS attacks
- `escapeHtmlAttr` — Escape special characters in HTML attribute values

### script — Script Utilities

Provides script generation functionality:

- `makeCallback` — Wrap callback function body string into a safe function expression (with try-catch protection)

### ui — Terminal UI Utilities

Provides terminal ANSI escape code handling:

- `ANSI` — ANSI escape code toolkit providing text coloring (green/cyan/red/yellow/magenta/gray/bold) and cursor control (reset/clearLine/hideCursor/showCursor)

### validation — Configuration Validation Utilities

Provides chainable validator and preset validation functions:

- `Validator` — Chainable configuration validator supporting required / string / number / boolean / enum / minValue / maxValue / custom validation rules
- `validateGlobalName` — Validate the legality of global variable names
- `validateNoScriptInTemplate` — Validate template strings don't contain script tags (XSS prevention)
- `validateCallbackFields` — Validate callback fields don't contain script tags

## Next Steps

- [Installation](/en/installation) - Quick start
- [assetManifest](/en/plugins/asset-manifest) - Asset manifest generation
- [autoImport](/en/plugins/auto-import) - Auto import
- [buildProgress](/en/plugins/build-progress) - Build progress display
- [bundleAnalyzer](/en/plugins/bundle-analyzer) - Build artifact size analysis
- [compressAssets](/en/plugins/compress-assets) - Build artifact compression
- [htmlInject](/en/plugins/html-inject) - HTML content injection
- [loadingManager](/en/plugins/loading-manager) - Global Loading state management
- [Plugin Factory](/en/factory/index) - Develop custom plugins
- [GitHub](https://github.com/MengXi-Studio/vite-plugin) - View source code and examples
