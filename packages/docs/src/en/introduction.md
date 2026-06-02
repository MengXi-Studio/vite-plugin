# Introduction

`@meng-xi/vite-plugin` is a toolkit that provides practical plugins for Vite, and also serves as a complete **Vite Plugin Development Framework**.

## Built-in Plugins

Eleven ready-to-use plugins covering common build scenarios:

| Plugin                                                     | Description                                                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [buildProgress](/en/plugins/build-progress)                | Display real-time build progress bar in terminal, supporting bar / spinner / minimal formats                                                            |
| [bundleAnalyzer](/en/plugins/bundle-analyzer)              | Build artifact size analysis with JSON/HTML reports, gzip calculation, threshold alerts, and build comparison                                           |
| [compressAssets](/en/plugins/compress-assets)              | Compress build artifacts with gzip / brotli / both, configurable compression level, file filtering, and concurrency, plus compression statistics report |
| [copyFile](/en/plugins/copy-file)                          | Copy files or directories to specified locations after build, with incremental copying                                                                  |
| [envGuard](/en/plugins/env-guard)                          | Environment variable validation with type checking, range validation, custom rules and runtime guard                                                    |
| [faviconManager](/en/plugins/favicon-manager)              | Manage website favicon links injection into HTML files                                                                                                  |
| [generateRouter](/en/plugins/generate-router)              | Auto-generate router configuration from uni-app's pages.json                                                                                            |
| [generateVersion](/en/plugins/generate-version)            | Auto-generate version numbers with file output and global variable injection                                                                            |
| [htmlInject](/en/plugins/html-inject)                      | HTML content injection with multiple positions and conditions                                                                                           |
| [loadingManager](/en/plugins/loading-manager)              | Global Loading state management with request interception and white-screen Loading                                                                      |
| [versionUpdateChecker](/en/plugins/version-update-checker) | Runtime version update check with refresh prompt                                                                                                        |

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

Nine utility modules covering common scenarios in plugin development:

### compress — Compression Utilities

Provides gzip compression size calculation:

- `calculateGzipSize` — Calculate the gzip-compressed size of data for estimating network transfer size

### format — Formatting Utilities

Provides date formatting, template parsing, and naming conversion:

- `formatDate` — Date formatting with custom templates
- `parseTemplate` — Template string parsing with placeholder replacement
- `generateRandomHash` — Generate random hash strings
- `padNumber` — Zero-pad numbers
- `toCamelCase` — Convert to camelCase
- `toPascalCase` — Convert to PascalCase
- `stripJsonComments` — Remove comments from JSON strings
- `escapeHtmlAttr` — Escape special characters in HTML attribute values for XSS prevention
- `formatFileSize` — Format bytes into a human-readable file size string
- `getExtension` — Get file extension from a file path

### fs — File System Utilities

Provides file operations, directory scanning, and concurrency control:

- `copySourceToTarget` — Copy files or directories with incremental copying and concurrency control
- `readDirRecursive` — Recursively read directory contents
- `readFileContent` / `writeFileContent` — Async file read/write
- `fileExists` — Check if a file exists
- `shouldUpdateFile` — Compare modification times to determine if update is needed
- `runWithConcurrency` — Batch execution with concurrency limit
- `scanDirectory` — Recursively scan directory, collect file info with extension and path filtering
- `writeJsonReport` — Write data to a JSON file

### html — HTML Injection Utilities

Provides multiple HTML content injection strategies:

- `injectBeforeTag` — Inject code before a specified closing tag
- `injectHtmlByPriority` — Inject code into HTML by tag priority
- `injectBeforeTagWithFallback` — HTML injection with fallback strategy
- `injectHeadAndBody` — Dual-zone HTML injection (head + body)

### object — Object Utilities

- `deepMerge` — Deep merge objects with recursive nested object merging, undefined skipping, and array overwriting

### path — Path Utilities

- `isNodeModule` — Check if a module ID is from node_modules, supporting virtual module detection

### script — Script Utilities

Provides script generation and security validation:

- `makeCallback` — Wrap callback function body string into a safe function expression
- `containsScriptTag` — Detect if a string contains `<script>` tags
- `validateIdentifierName` — Validate if a string is a legal JavaScript identifier, preventing prototype pollution

### ui — Terminal UI Utilities

Provides terminal ANSI escape code handling and Spinner animation frames:

- `ANSI` — ANSI escape code toolkit providing text coloring (green/cyan/red/yellow/magenta/gray/bold) and cursor control (reset/clearLine/hideCursor/showCursor)
- `SPINNER_FRAMES` — Spinner animation frame sequence, automatically selecting ASCII or Unicode characters based on platform
- `stripAnsi` — Remove all ANSI escape codes from a string

### validation — Configuration Validation Utilities

Provides chainable validator and preset validation functions:

- `Validator` — Chainable configuration validator supporting required / string / number / boolean / enum / minValue / maxValue / custom validation rules
- `validateGlobalName` — Validate the legality of global variable names
- `validateNoScriptInTemplate` — Validate template strings don't contain script tags (XSS prevention)
- `validateCallbackFields` — Validate callback fields don't contain script tags
- `validateNonNegativeNumber` — Validate numeric values are non-negative
- `validateNestedDuration` — Validate duration legality in nested configuration
- `validateEnumValue` — Validate string values are within allowed enum list

## Next Steps

- [Installation](/en/installation) - Quick start
- [buildProgress](/en/plugins/build-progress) - Build progress display
- [bundleAnalyzer](/en/plugins/bundle-analyzer) - Build artifact size analysis
- [compressAssets](/en/plugins/compress-assets) - Build artifact compression
- [htmlInject](/en/plugins/html-inject) - HTML content injection
- [loadingManager](/en/plugins/loading-manager) - Global Loading state management
- [Plugin Factory](/en/factory/index) - Develop custom plugins
- [GitHub](https://github.com/MengXi-Studio/vite-plugin) - View source code and examples
