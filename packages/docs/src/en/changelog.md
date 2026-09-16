# Changelog

## [1.4.1] - 2026-09-16

Fixed generatePages / generateUni handling of custom page extensions (e.g. `.uvue`), so uni-app x projects can use `.uvue` pages normally.

### Fixed

- **File extension left in pages.json paths**: the page-path stripping logic was hard-coded to `.vue` / `.nvue`; with `includeExtensions` set to custom extensions like `.uvue`, it produced wrong paths such as `pages/home/index.uvue` that uni-app can't resolve. Stripping is now driven by the actual file extension matched against the `includeExtensions` list (case-insensitive, leading dot tolerated), preserving the previous `.vue` / `.nvue` behavior when the option is unset
- **`defineUniPage` calls not stripped in `.uvue` pages**: SFC script virtual-module detection was changed from `id.includes('.vue')` to `/\.(vue|uvue|nvue)(\?|$)/`, covering `.uvue` / `.nvue`; the macro call is now removed at transform time, avoiding a runtime `ReferenceError`. Fixed in both generatePages and generateUni

## [1.4.0] - 2026-08-28

Added the `defineUniPage` macro and refactored the page generation pipeline: page scanning → pages.json → route config as one flow, with shared `DirectoryWatcher` / `TaskQueue` for unified watching and serial generation.
Plugin count grows to 17.

### Added

- **`defineUniPage` macro**: call it in `<script setup>` (or at the top level of `<script>`); works the same as the `<route-config>` custom block, with a more JS/TS-friendly syntax
  - When both the macro and `<route-config>` are declared on the same page, the macro wins (top-level fields are overridden by the macro)
  - Argument is a JS object literal supporting comments, single quotes, trailing commas, and nested objects (`tab` / `style` / `meta`)
  - Runtime footprint-free: consumed during scanning, the call is removed automatically at build time — no need to import
  - Auto-generates the global type declaration `src/define-uni-page.d.ts` (path configurable via `dts`, or `false` to disable); recognized out of the box by Vue (Official) / Volar / tsc
- **`<route-config>` custom block**: parsing now supports JSONC trailing commas (consistent with the `lang="jsonc"` IDE highlighting semantics)
- **Shared modules**: `DirectoryWatcher` (common/fs — recursive directory watching, unified multi-directory management, gracefully skips with a warning when the platform doesn't support `recursive`), `TaskQueue`
  (common/concurrency — serial task queue where a single task failure doesn't block the rest)
- **factory**: added the `FunctionHookMap` type (hook-name generic constraint tightened to function-only hooks) and an overridable `getBaseDefaults()` method

### Enhanced

- **generatePages / generateUni refactor**: extracted the shared `producePages()` pipeline (scan pages + `<route-config>` / `defineUniPage` → assemble → merge, produced in memory without writing to disk); generateUni
  passes data to stage two in memory, eliminating the write-then-read round trip
- **Watching & serialization unified**: generatePages / generateUni / generateRouter all use `TaskQueue` for serial generation and `DirectoryWatcher` for page-directory watching, avoiding read-write races on
  high-frequency changes

### Fixed

- The `<route-config>` virtual-module request matching in generatePages / generateUni was tightened from `id.includes('vue')` to `id.includes('?vue')`, avoiding false interception

## [1.3.0] - 2026-08-26

Added the generateUni combined entry plugin — one pipeline for "scan pages → pages.json → route config". Plugin count grows to 17.

### Added

- **`generateUni` plugin**: orchestrates `generatePages` and `generateRouter` into one pipeline, equivalent to using both plugins together (both standalone plugins remain available unchanged)
  - Stage one scans pages + `<route-config>` and produces pages data in memory, writing pages.json; stage two consumes that in-memory data directly to generate route config (+ optional dts), avoiding the disk round trip
  - Config groups: top-level common options (`pagesJsonPath` / `watch`) + a `pages` sub-object (generatePages options) + a `router` sub-object (generateRouter options), instead of 20+ flat options
  - On page-directory changes it re-runs "stage one + stage two" serially, avoiding concurrent read-write races
  - Intercepts `<route-config>` virtual-module requests and serves an empty module, preventing them from being parsed as JavaScript during build
  - Fully inherits generatePages' tabBar collection / subpackage / merge strategies and generateRouter's preserveRouteChanges / metaMapping / dts, etc.
- **Sub-path export**: `plugins/generate/generate-uni` exports `generateUni` and the `GenerateUniOptions` type; `plugins/generate` re-exports it

### Enhanced

- **generatePages**: added `<route-config>` virtual-module interception for standalone use (aligned with generateUni), preventing production builds from parsing the block content as JavaScript
- **proxyManager**: `config` hook now intercepts `env.command === 'build'`, fully skipping proxy-rule loading and config generation during builds (proxies only apply to the dev server — previously builds wasted time
  loading rules and printed misleading logs)

## [1.2.0] - 2026-08-25

Added the generatePages plugin, which scans Vue files + `<route-config>` custom blocks to dynamically generate pages.json. Plugin count grows to 16.

### Added

- **`generatePages` plugin**: scans the pages directory and `<route-config>` custom blocks to generate / update pages.json (`pages` / `subPackages` / `tabBar`)
  - Main-package pages are generated by recursive scanning with stable path ordering; subpackage pages via `subPackages: [{ root, dir }]`
  - `entryPage` pins `pages[0]` as the launch page, immune to alphabetical reordering
  - Tab pages are collected into `tabBar.list` when declared with `isTab` + a `tabBar` template, sorted by `tab.order`
  - Merge strategy only overrides the pages section, preserving `globalStyle` / `condition`, etc.
  - `watch: true` (default) regenerates automatically when page files change
  - Options: `pagesJsonPath` / `pagesDir` / `subPackages` / `routeConfigBlock` / `titleFallback` / `tabBar` / `includeExtensions` / `excludePatterns` / `watch`
- **`<route-config>` custom block**: declare `title` (mapped to `navigationBarTitleText`) / `name` / `style` / `meta` / `isTab` / `tab` next to the page
- **Sub-path export**: `plugins/generate/generate-pages` exports `generatePages` and types (`GeneratePagesOptions` / `RouteConfigBlock` / `SubPackageConfig` / `TabBarTemplate` / `TabBarItemOverride` / `ScannedPage`);
  `plugins/generate` re-exports them

### Enhanced

- Type completion: `TabBarItemOverride` is reused as the element type of `overrides`, consistent with the page-level `tab`; the `orderMainPages` sorting function moved into the `helpers` directory

## [1.1.0] - 2026-07-28

Full autoImport refactor: built-in presets, multiple import forms, HMR, lint-config generation, and a caching mechanism.

### Changed (breaking)

- Removed the `ImportMapping` / `ResolvedImport` types — use `InlineImportConfig` / `ImportInline` instead
- Removed `AutoImportOptions.fileFilter` — use `include` / `exclude` or `dirsScanOptions.fileFilter` instead
- Removed the `helpers/compat.ts` compatibility module (legacy format no longer supported)
- Removed functions: `migrateLegacyOptions` / `resolvedImportToInline` / `inlineToResolvedImport` / `importMappingToInlines`

### Added

- **Built-in presets**: `imports: ['vue', 'vue-router', 'pinia', 'vue-i18n']` to enable common libraries in one line
- **Multiple import forms**: alias imports, type imports (`type: true` generates `import type`), namespace imports (`'*'`), export-assignment imports (`'='`)
- **Directory scan enhanced**: `dirs` supports `DirConfigObject`, glob patterns, and type markers
- **DTS modes**: `dtsMode: 'append' | 'overwrite'` (append only adds new types), `dtsPreserveExts` keeps file extensions
- **Vue directive auto-import**: `vueDirectives` auto-detects custom directives
- **Lint globals generation**: `eslintrc` / `biomelintrc` generate globals config, resolving `no-undef` errors
- **Caching**: `cache` caches preset resolution and file-scan results for faster builds
- **HMR**: automatically re-initializes when scanned directory files change
- **Comment disable**: `// @unimport-disable` disables auto-import per file or per line
- **Custom resolvers**: `resolvers` for custom resolution of unmatched identifiers
- **Package presets**: `packagePresets` auto-discovers exports from the `.d.ts` of installed packages
- **Vite optimizeDeps integration**: `viteOptimizeDeps` automatically adds dependencies to Vite's pre-bundling list
- **DTS ignore filter**: `ignoreDts` excludes specified identifiers
- **New exports**: `resolveImportsConfig` / `buildNameLookup` / `findPreset` / `expandPreset` / `resolvePackagePreset` / `generateEslintrc` / `generateBiomelintrc`

### Enhanced

- Resolver fallback always tries unmatched identifiers; DTS generation dedupes (avoids redundant writes between `initialize()` and `buildEnd`); `resolveImportsConfig` uniformly handles preset strings, Records, and Inline
  formats; wildcard exports are resolved from `.d.ts` first (most accurate), falling back to the runtime entry

## [1.0.0] - 2026-06-27

First stable release — API stability commitment and production-readiness milestone.

### Added

- After 27 iterations in the 0.x series (0.0.1 - 0.2.7), the plugin set grew from 2 to **15** (7 groups) covering the full build lifecycle; common utilities converged into 14 normalized submodules; the plugin development
  framework (BasePlugin / Logger / Validator / createPluginFactory) matured
- **API stability commitment**: strictly follows semantic versioning from here on; breaking changes require a major version bump
- **Stable sub-path exports**: backward-compatible main entry + 7 groups + 15 per-plugin sub-paths + 14 common submodules + factory / logger
- **Production readiness**: supports Vite 5.x - 7.x (`peerDependencies: vite >=5.0.0 <8.0.0`), dual ESM (`.mjs`) / CJS (`.cjs`) output, complete TypeScript types, graceful degradation when `sharp` / `svgo` are
  unavailable, all plugins usable with zero config

## [0.2.7] - 2026-06-26

Grouped plugin exports by feature; fixed a type-annotation defect in generateRouter.

### Added

- **Grouped plugin exports**: the 15 plugins are grouped into 7 categories (analyze / compress / copy / generate / guard / inject / proxy), each with its own sub-path export (e.g. `./plugins/compress`) for on-demand
  imports and tree-shaking; the `./plugins` main entry stays backward-compatible and per-plugin sub-paths are also available

### Fixed

- generateRouter still emitted the `: RouteConfig[]` type annotation when `exportTypes: false` without the corresponding import statement, causing "RouteConfig is not defined" — the annotation is now only added when type
  export is enabled

## [0.2.6] - 2026-06-25

Extracted shared utilities and unified the architecture; automated the version-injection mechanism.

### Added

- **6 new common submodules**: `code` (`JS_KEYWORDS` / `stripCommentsAndStrings`), `compress` (`calculateGzipSize`), `env` (`parseEnvContent`), `hash` (`generateRandomHash`), `object` (`deepMerge`), `string`
  (`toCamelCase` / `toPascalCase` / `stripJsonComments` / `escapeRegex`)
- **common/format**: added `parsePluginTemplate`, supporting `{name}` / `{date}` / `{date:FORMAT}` / `{version}` / `{custom:KEY}` placeholders for unified comment-header template handling

### Refactored

- **Version-injection mechanism**: removed the manual version-sync logic; the version is now auto-injected at build time via the unbuild `replace` config as the `__PLUGIN_VERSION__` global, with the new
  `src/types/global.d.ts` declaration; the `{version}` placeholder in the generateRouter comment header no longer needs source changes when bumping versions
- **Plugin directory structure**: each plugin's `common/` directory was renamed to `helpers/`, and type files consolidated into the plugin root (internal-only change; no impact on import paths)

### Optimized

- versionUpdateChecker now uses the shared `parseTemplateWithDelimiter` for custom prompt templates, replacing repeated chained `.replace()` calls and manual concatenation

## [0.2.5] - 2026-06-24

Template-based comment headers for generateRouter; removed a deprecated function.

### Changed (breaking)

- Removed the `fileHeader` option, replaced by `headerTemplate`: upgraded from a `boolean` switch to a `boolean | string` template whose content is freely composed with placeholders

### Added

- **Comment-header template system**: `headerTemplate` supports `{name}` / `{date}` (default `YYYY-MM-DD HH:mm:ss`) / `{date:format}` / `{version}` / `{custom:key}` placeholders, ordered by their position in the template
- **Custom fields `customFields`**: `Record<string, string>`, referenced by the `{custom:key}` placeholder
- **Changed**: `plugins/generate-router` removed `fileHeader` and added `headerTemplate` / `customFields`

### Removed

- Removed the deprecated `serializeValueCompact` from common/code-manipulation (use `serializeValue(value, true)` instead)

## [0.2.4] - 2026-06-23

generateRouter added page-name configuration and optimized the route-merge strategy.

### Added

- **Page name `name` field**: `UniAppPageConfig` gained a `name` property so route names can be configured directly in pages.json, taking precedence over the `nameStrategy`-generated name

### Optimized

- **`preserveRouteChanges` merge strategy**: pages.json is the single source of truth for auto-generated fields; `name` and `meta` fields coming from pages.json always use the new values, while only user-defined extra
  fields are preserved

## [0.2.3] - 2026-06-23

Completed the plugin base class and the route-generation plugin.

### Added

- **Page meta `meta` field**: `UniAppPageConfig` gained a `meta` property taking precedence over `metaMapping`; extraction priority is `pageConfig.meta` > `metaMapping` mapping > tabBar inference

### Refactored

- **BasePlugin**: `addPluginHooks` changed from an abstract method to a virtual method (empty default), so plugins that don't rely on Vite hooks no longer need to write an empty implementation
- **generateRouter**: route-generation logic migrated from the `configResolved` hook to the base class `onConfigResolved` lifecycle for unified lifecycle management

## [0.2.2] - 2026-06-21

generateRouter fixed missing commas between properties and an indentation error in multi-line output.

### Fixed

- Multi-line route objects were missing commas between properties, producing invalid `router.config.ts` syntax
- Non-first-line properties in multi-line output were indented by an extra tab, causing inconsistent formatting

## [0.2.1] - 2026-06-21

generateRouter added file comment headers and output-format optimization, fixed lost merges in preserveRouteChanges, and removed redundant type definitions.

### Added

- **File comment header `fileHeader`**: prepends a standardized comment header (`@plugin` / `@date` with time / `@version`) to the generated file; the version tracks the npm package version automatically
- **Multi-line output**: route objects switched from compact single-line to one-property-per-line for readability
- **External type import**: removed inline type definitions in favor of `import type { RouteConfig } from '@meng-xi/uni-router'`; types are provided uniformly by uni-router

### Fixed

- `preserveRouteChanges` replaced `meta` wholesale, dropping user-defined fields — now per-field merged, only updating / adding new fields
- A single route with function properties (e.g. `beforeEnter`) failing JSON.parse aborted merging for _all_ routes — now only that route is skipped and the rest merge normally

### Changed (breaking)

- Removed the `UniAnimationType` / `NavigationAnimation` type exports and the `RouteMeta.animation` field, now provided by `@meng-xi/uni-router` (import them from uni-router where needed)

## [0.2.0] - 2026-06-18

Added the proxyManager dev proxy plugin, extracted shared utilities into the Common modules, and fixed four critical proxyManager defects.

### Added

- **`proxyManager` plugin**: dev-server proxy management that registers a proxy middleware at `configureServer` startup
  - Path matching: string prefixes and regular expressions
  - Request rewriting (`rewrite`) and response modification (`modifyResponse`)
  - Delay simulation: fixed milliseconds or a random range (`{ min, max }`)
  - `envPrefix` reads proxy targets from `process.env` for multi-environment switching with one codebase
  - Rule files: `.proxyrc.ts` / `.proxyrc.js` / `.proxyrc.mjs`, ESM and CJS compatible
  - Three request-log levels (`none` / `basic` / `verbose`), WebSocket proxying (`ws: true`), and an `env` field to scope rules to specific environments
  - Options: `rules` / `configFile` / `logLevel` / `defaultDelay` / `envPrefix`
- **common/format**: added `parseTemplateWithDelimiter` (custom left/right delimiters; regex special chars in keys and values auto-escaped)
- **common/fs**: added `scanAndMapFiles` (encapsulates "scan + filter + map") and `deleteFiles` (batch delete, silently ignores failures)

## [0.1.9] - 2026-06-14

generateRouter added navigation-animation support and enhanced route-attribute preservation.

### Added

- **Navigation animation types**: `UniAnimationType` (18 animation values) and `NavigationAnimation` (`type` + `duration`)
- **Route meta**: `RouteMeta` gained an `animation` field for the page-level default navigation animation (App only)
- **Route config extension**: `RouteConfig` gained the index signature `[key: string]: unknown`, supporting custom properties like `beforeEnter` / `component`

### Enhanced

- **`preserveRouteChanges`**: text-based merging that fully preserves user-added function properties and custom attributes; `path` always follows pages.json, while `name` / `meta` prefer user edits and auto-append newly
  added pages.json fields

## [0.1.8] - 2026-06-11

Added the imageOptimizer image-optimization plugin, the common/concurrency module, and restored the common/path module.

### Added

- **`imageOptimizer` plugin**: scans the output directory after build (`writeBundle`, `enforce: 'post'`) and optimizes images
  - Multi-format compression: JPEG (mozjpeg) / PNG (palette) / WebP / AVIF / GIF / TIFF / SVG (svgo)
  - Format conversion: `convertToWebp` / `convertToAvif` shortcuts and custom `convertMapping`
  - Concurrency (`parallelLimit`), streaming memory control, atomic writes, size-conserving (only replaces when smaller), graceful degradation when sharp/svgo are unavailable
  - JSON optimization report (grouped by format + Top 5 compression ratios) and instance methods `getStats()` / `getSummary()`
- **common/concurrency**: added `runWithConcurrency` (worker-pool concurrency, results ordered like the input)
- **common/path restored**: `normalizePath` / `isExtensionIncluded` / `isPathExcluded` / `isPreCompressed`
- **common/format**: added `calcRatio`
- **common/fs**: added `resolveReportPath`

## [0.1.7] - 2026-06-08

Added the assetManifest asset-manifest generation plugin.

### Added

- **`assetManifest` plugin**: scans the output directory after build (`writeBundle`, `enforce: 'post'`) and generates an asset mapping manifest
  - Three output formats: `vite` / `webpack` / `custom` (custom formatter)
  - Grouping by entry (`groupByEntry`) and runtime injection (`injectRuntime`, injecting the mapping as a global before `</head>`)
  - File filtering (`includeExtensions` / `excludeExtensions` / `excludePaths`), `publicPath` prefix for CDN deployments, and path-conflict detection warnings
  - Instance methods: `getAssetMap()` / `getManifest()` / `getGroups()`

## [0.1.6] - 2026-06-07

autoImport added wildcard imports; generateRouter added route type-declaration generation; common modules gained new utilities; plugin code normalized.

### Added

- **autoImport wildcard imports**: `imports` supports `'*'` to import all named exports of a module, resolved from `.d.ts` first (most accurate) with a runtime-entry fallback
- **Vue SFC injection**: added `injectIntoScriptSetup` to inject imports into `<script setup>`, resolving coordination issues with the Vue SFC compiler under `enforce: 'pre'`
- **generateRouter route type declarations**: added the `dts` option (`false` / `true` → default `src/router.d.ts` / custom path) generating TSDoc-commented declarations that extend the `RouteNameMap` interface of
  `@meng-xi/uni-router` for type-safe navigation
- **common/format**: `parseTemplate` (`{{key}}` placeholders, `$`-safe), `formatDate`
- **common/fs**: `writeFileSyncSafely` (sync write that creates missing directories), `shouldUpdateFileContent` (reduces file IO)
- **common/html**: `escapeHtmlAttr` (prevents attribute injection)

### Fixed

- `transform` with `enforce: 'post'` broke bare-module identifier resolution — reverted to `enforce: 'pre'`
- The default `fileFilter` didn't exclude `node_modules`, so library files were processed and injected with wrong imports
- `vue: ['*']` resolved via the runtime entry (only `export { compile }`), yielding just `compile`
- `makeCallback`'s anonymous function broke as a function declaration — switched to an IIFE
- An unused variable in the `moduleMap` loop

### Refactored

- Plugins extracted non-core logic / constants into `common/` subdirectories with aggregated exports (buildProgress / generateRouter / envGuard / faviconManager / htmlInject / loadingManager / versionUpdateChecker)

## [0.1.5] - 2026-06-06

Added the autoImport plugin; slimmed the Common modules (removed compress, object, path); fixed the dts declaration file not being generated in dev mode.

### Added

- **`autoImport` plugin**: detects identifiers used in the code and injects the corresponding import statements (default `enforce: 'post'`)
  - Preset mapping (`imports`, supporting `Record<string, string[]>` and `ImportMapping[]`), directory scanning (`dirs`, recursive, skipping node_modules), Vue template support (`vueTemplate`)
  - Declaration generation (`dts`, default `auto-imports.d.ts`), identifier ignore (`ignore`), file filtering (`fileFilter`), injection position (`injectAtPosition`: `'top'` / `'after-last-import'`)

### Changed (breaking)

- Removed modules used fewer than 2 times: `common/compress` (`calculateGzipSize` inlined into bundleAnalyzer), `common/object` (`deepMerge` inlined into loadingManager), `common/path` (`isNodeModule` inlined into
  bundleAnalyzer), plus functions and types used only once
- Kept 6 core modules: `format` / `fs` / `html` / `script` / `ui` / `validation`

## [0.1.4] - 2026-06-03

Added the envGuard environment-variable validation plugin and the @common/ui terminal-UI module.

### Added

- **`envGuard` plugin**: validates environment variables before build (`enforce: 'post'` for runtime-guard injection)
  - 8 value-type checks (`string` / `number` / `url` / `boolean` / `enum` / `json` / `semver` / `path`), range (`minValue` / `maxValue`) and length (`minLength` / `maxLength`) constraints, regex matching (`pattern`),
    custom validators (`validator`)
  - `failAction` three modes (`error` / `warn` / `ignore`), `.env` template generation (`generateTemplate`), runtime guards (`console` / `throw` / `overlay`), `autoLoadEnv`, JSON validation report, and terminal summary
- **@common/ui module**: `ANSI` (cursor control & colored text), `SPINNER_FRAMES` (spinner frames), `stripAnsi`

### Enhanced

- **@common/validation**: added the `EnvType` / `EnvFieldRule` / `EnvValidationResult` / `STRING_LIKE_TYPES` types and the `validateType` / `validateRange` / `validateLength` / `validateValue` / `validateEnvironment`
  functions

## [0.1.3] - 2026-06-01

Added the bundleAnalyzer build-output analysis plugin and the @common/compress and @common/path modules.

### Added

- **`bundleAnalyzer` plugin**: analyzes build output after build (`writeBundle`, `enforce: 'post'`)
  - `json` / `html` / `both` reports, gzip size (level 9), threshold warnings (`sizeThreshold`, 2× threshold flagged critical)
  - Comparison against historical reports (size trend), treemap / sunburst / list chart views, Top N module ranking, file-type distribution, `openAnalyzer` auto-open
- **@common/compress**: `calculateGzipSize` (gzip-compressed size, level 9)
- **@common/path**: `isNodeModule` (detects node_modules / `\0` / `virtual:` prefixes)

### Enhanced

- **@common/format**: `escapeHtmlAttr` (XSS escaping), `formatFileSize` (human-readable sizes), `getExtension`
- **@common/fs**: `scanDirectory` (recursive scan + filtering), `writeJsonReport`, and the `ScannedFile` / `ScanDirectoryOptions` types

## [0.1.2] - 2026-05-31

Added the compressAssets build-output compression plugin; all plugin options are now optional; added @common/object and full @common/fs utilities.

### Added

- **`compressAssets` plugin**: compresses output with gzip / brotli / both after build (`writeBundle`, `enforce: 'post'`), generating `.gz` / `.br` files
  - File filtering (`includeExtensions` / `excludeExtensions` / `excludePaths`), compression threshold (`threshold`), concurrent compression (`parallelLimit`)
  - `deleteOriginalFile`, JSON compression report (`reportOutput`), Top 5 compression-ratio log, cross-platform path handling
- **@common/object**: added `deepMerge` (skips undefined, recursive merge, arrays replaced)

### Enhanced

- **All plugin options made optional**: options with defaults are now `?`-optional — zero-config usage (BuildProgressOptions / CompressAssetsOptions / CopyFileOptions / FaviconManagerOptions / GenerateRouterOptions /
  GenerateVersionOptions / VersionUpdateCheckerOptions / HtmlInjectOptions / LoadingManagerOptions)
- **@common/fs**: `checkSourceExists` / `ensureTargetDir` / `fileExists` / `copySourceToTarget` (recursive / overwrite / incremental / concurrent) / `writeFileContent` / `readFileContent` plus the `CopyOptions` /
  `CopyResult` types
- **@common/format**: `generateRandomHash` / `formatDate` / `parseTemplate` / `toCamelCase` / `toPascalCase` / `stripJsonComments` / `DateFormatOptions`
- **BasePlugin**: `mergeOptions` now uses `deepMerge`; added the `validator` property, `getEnforce()` method, `onConfigResolved(config)` lifecycle, and `handleError(error, context)`; `toPlugin` auto-registers
  `configResolved` and `closeBundle`

## [0.1.1] - 2026-05-30

Added the htmlInject HTML-injection plugin, new shared utilities and types, and enum / numeric-range validation to Validator.

### Added

- **`htmlInject` plugin**: injects custom HTML per rules into the target HTML file (`transformIndexHtml`, `order: 'post'`)
  - 7 injection positions (`head-start` / `head-end` / `body-start` / `body-end` / `before-selector` / `after-selector` / `replace-selector`)
  - Conditional injection (`env` / `file-contains` / `custom`, with `negate`), selector matching (`string` / `regex`)
  - Template-variable replacement (`{{key}}`, rule-level overrides globals), `priority` rule ordering
  - Security filtering (blocks dangerous tags / event attributes, `allowedTags` whitelist), `allowScriptInjection` skips checks with a warning, `logInjection` logs
- **Shared utilities**:
  - format: `escapeHtmlAttr` / `padNumber` / `getDateFormatParams` (adds the `{SSS}` millisecond placeholder)
  - html: `injectBeforeTagWithFallback` (with fallback strategy), `injectHeadAndBody` (two-region injection)
  - validation (new dedicated module): `validateGlobalName` / `validateNoScriptInTemplate` / `validateCallbackFields` / `validateNonNegativeNumber` / `validateNestedDuration` / `validateEnumValue`

### Enhanced

- **Validator**: added the `enum(allowedValues)` / `minValue(min)` / `maxValue(max)` chained methods

## [0.1.0] - 2026-05-24

Added the versionUpdateChecker plugin; renamed plugins (injectIco → faviconManager, injectLoading → loadingManager); added shared utility modules.

### Added

- **`versionUpdateChecker` plugin**: periodically checks for version changes and prompts a refresh — typically used with `generateVersion`
  - Three version sources (`define` global / `file` (version.json) / `auto` auto-detect), three prompt UIs (`modal` / `banner` / `toast`)
  - `customPromptTemplate` custom templates (`{{message}}` and other placeholders), `customStyle`, `checkOnVisibilityChange` immediate check on tab return, lifecycle callbacks (`onUpdateAvailable` / `onRefresh` /
    `onDismiss`)
  - XSS protection (no script tags), identifier safety (`defineName` prevents prototype pollution), SSR safety, destroy cleanup
- **Shared utility modules**: html (`injectBeforeTag` / `injectHtmlByPriority` / `HtmlInjectResult`), script (`makeCallback` / `containsScriptTag` / `validateIdentifierName`)

### Changed (breaking)

- Plugin renames: `injectIco` → `faviconManager`, `injectLoading` → `loadingManager` (functionality unchanged, names now reflect responsibilities)

### Enhanced

- **faviconManager**: added string shorthand (`faviconManager('/assets')`); the `url` option description now explicitly covers `base + favicon.ico`
- **loadingManager**: added runtime APIs `toggle(text?)` / `enablePointerEvents()` / `disablePointerEvents()` / `togglePointerEvents()` / `isPointerEventsEnabled()`

## [0.0.9] - 2026-05-23

Fixed critical injectLoading issues, added LoadingManager runtime APIs, and optimized the plugin framework.

### Fixed

- `style.pointerEvents` defaulted to `false`, so the overlay couldn't block user interaction — now defaults to `true` (enabled)
- LoadingManager runtime API was incomplete — missing methods added

### Added

- **LoadingManager runtime APIs**: `toggle(text?)` / `enablePointerEvents()` / `disablePointerEvents()` / `togglePointerEvents()` / `isPointerEventsEnabled()`
- **Shared utilities**: `readDirRecursive` (returns entry info, avoids redundant stat calls), `runWithConcurrency` (bounded concurrent execution), `shouldUpdateFile` (incremental-copy check)
- **TypeScript type exports**: `PluginFactory` / `OptionsNormalizer` / `DateFormatOptions`

### Enhanced

- **injectIco**: added string shorthand (`injectIco('/assets')`)
- **BasePlugin**: added `safeExecute` / `safeExecuteSync` (error handling per `errorStrategy`); the constructor now wraps `validateOptions()`, so validation failures no longer crash builds
- **createPluginFactory**: added the `OptionsNormalizer` support so plugins can accept non-object shorthand configs; factory generics gained an `R` parameter
- **buildProgress**: non-TTY environments (CI/CD) degrade to log output; documented the progress stages (config → resolve → transform → bundle → write → done)
- **generateRouter**: documented `metaMapping` defaults (`{ navigationBarTitleText: 'title', requireAuth: 'requireAuth' }`); `nameStrategy: 'custom'` requires `customNameGenerator`
- **generateVersion**: documented the full `customFormat` placeholders

## [0.0.8] - 2026-05-21

Added the injectLoading global loading-state plugin. **This plugin has critical issues — upgrade to 0.0.9 as soon as possible.**

### Added

- **`injectLoading` plugin**: injects global loading-state management (runtime API `window.__LOADING_MANAGER__`)
  - First-paint loading (`defaultVisible`, visible as soon as HTML parses), auto-hide timing (`DOMContentLoaded` / `load` / `manual`)
  - Automatic request interception (`autoBind`: `fetch` / `xhr` / `all` / `none`), request filtering (`requestFilter`)
  - Four built-in spinners (`spinner` / `dots` / `pulse` / `bar`), transitions, minimum display time, delayed show, debounced hide, custom styles / templates, lifecycle callbacks, SSR safety, destroy cleanup

## [0.0.7] - 2026-05-19

Added the buildProgress build-progress-bar plugin.

### Added

- **`buildProgress` plugin**: renders a real-time build progress bar in the terminal
  - Three display formats (`bar` / `spinner` / `minimal`), progress computed from the build lifecycle (config 5% → resolve 10% → transform 15%-85% → bundle +10% → write +5% → done 100%)
  - Custom width / fill characters / color theme, optional current module name (truncated when long), non-TTY log degradation, `destroy()` stops the animation and restores the terminal cursor

## [0.0.6] - 2026-05-18

Added plugin destroy lifecycle and sub-path type exports; optimized the logger system.

### Added

- **Destroy lifecycle**: BasePlugin added the `destroy()` virtual method (default: unregister log config); `toPlugin()` calls it at the end of `closeBundle`; generateRouter's file-watcher cleanup moved to `destroy()`
- **Logger**: added the `Logger.unregister(pluginName)` static method; `Logger.destroy()` clears all configs and resets the singleton
- **Sub-path type exports**: factory (`PluginFactory` / `OptionsNormalizer` / `PluginWithInstance` / `BasePluginOptions`), plugins (per-plugin options and `RouteConfig` / `RouteMeta`, etc.), common (`CopyOptions` /
  `CopyResult` / `DateFormatOptions`)

### Enhanced

- **injectIco**: unified the icon interface name to `Icon` (replacing `IconConfig`)
- **common/fs**: `readFileSync` marked deprecated (use the async `readFileContent`); `CopyOptions` gained `parallelLimit` (default 10) and `skipEmptyDirs`

## [0.0.5] - 2026-03-05

generateVersion supports auto-generating the version number during build, with multiple formats and output options.

### Added

- **generateRouter**: generates a route config file from the uni-app project's `pages.json` (`pagesJsonPath` / `outputPath` / `outputFormat` / `nameStrategy` / `includeSubPackages` / `watch` / `metaMapping` /
  `preserveRouteChanges`)

## [0.0.4] - 2026-02-28

Added the generateVersion plugin and format utility exports; optimized file copy and object merge; improved the icon-injection plugin.

### Added

- core package's common module exports format utilities
- the plugins module adds and exports the `generateVersion` plugin

### Enhanced

- Refactored the `readDirRecursive` interface (returns file/directory entry info, reducing redundant stat calls)
- Introduced concurrency limits for parallel file copy; `copySourceToTarget` supports parallel copy and incremental updates
- `deepMerge` skips undefined and refines nested-object merging
- Logger gained log icons and colors for more readable console output
- injectIco now uses Vite's official `HtmlTagDescriptor` interface for icon tags, handles custom link tags, and its `transformIndexHtml` hook supports both string replacement and official tag injection

## [0.0.3] - 2026-02-04

Upgraded the plugin factory, logger system, and generic validation.

### Added

- Plugin factory added the `safeExecuteSync` synchronous safe-execution function
- **Logger upgraded to a singleton framework**: new `PluginLogger` interface (per-plugin log proxy), unified output format (timestamp / namespace / icons / colors), log levels upgraded to `success` / `info` / `warn` /
  `error`, with per-plugin log toggles managed via the config mapping
- **Validator genericized**: compile-time type safety with a fluent API supporting chained type inference and type-safe custom validators / default-value methods
- **BasePlugin genericized**: integrated the generic Validator for type-safe option validation, with generic constraints `T` / `K` ensuring field/default-type consistency
- Updated architecture diagrams and API docs for the generic validation mechanism

## [0.0.2] - 2026-01-26

Architecture upgrade (plugin factory), logger improvements, and option validation; copyFile and injectIco each gained two options.

### Enhanced

- **copyFile / injectIco new options**: `incremental` (copy only modified files, default `true`) and `errorStrategy` (`'throw'` / `'log'` / `'ignore'`, default `'throw'`)

## [0.0.1] - 2026-01-21

First release, providing the copyFile and injectIco plugins.

### Added

- **copyFile plugin**: copies files or directories to a target location after the Vite build (`sourceDir` / `targetDir` required; `overwrite` / `recursive` / `verbose` / `enabled`)
- **injectIco plugin**: injects favicon links into the HTML head during the Vite build (`base` / `url` / `link` / `icons` / `verbose` / `enabled` / `copyOptions`)
