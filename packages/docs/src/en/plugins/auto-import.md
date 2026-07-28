# autoImport

A Vite plugin that automatically injects import statements. Supports built-in presets, alias/type/namespace imports, directory glob scanning, Vue template & directive auto-import, DTS generation, ESLint/Biome config generation, and more.

## Import

```typescript
// Sub-module import (recommended)
import { autoImport } from '@meng-xi/vite-plugin/plugins/generate/auto-import'
import type { AutoImportOptions, ImportInline, ScannedModule, TransformResult } from '@meng-xi/vite-plugin/plugins/generate/auto-import'

// Barrel import
import { autoImport } from '@meng-xi/vite-plugin'
```

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { autoImport } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    autoImport({
      // Built-in presets, one-liner config
      imports: ['vue', 'vue-router', 'pinia'],
      // Directory scanning with glob support
      dirs: ['./composables/**', { glob: './hooks', types: true }],
      // TypeScript declaration generation
      dts: 'src/auto-imports.d.ts',
      // Vue template auto-import
      vueTemplate: true,
    })
  ]
})
```

## Options

### Core Options

| Option           | Type                                                                                                    | Default                       | Description                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| imports          | `ImportsConfig`                                                                                         | `[]`                          | Import mapping config (supports presets/shorthand/full format mix)  |
| dirs             | `DirConfig[]`                                                                                           | `[]`                          | Directory scanning config (supports strings and DirConfigObject)    |
| dts              | `string \| boolean \| DtsConfigObject`                                                                  | `'src/auto-imports.d.ts'`     | TypeScript declaration file config                                  |
| vueTemplate      | `boolean`                                                                                               | `false`                       | Enable auto-import for Vue templates                               |
| vueDirectives    | `boolean \| VueDirectivesConfig`                                                                        | `false`                       | Enable auto-import for Vue directives                              |
| ignore           | `string[]`                                                                                              | `[]`                          | Identifiers to ignore                                              |
| include          | `Array<string \| RegExp>`                                                                               | `[/\.[tj]sx?$/, /\.vue$/...]` | File patterns to process                                           |
| exclude          | `Array<string \| RegExp>`                                                                               | `[/node_modules/]`            | File patterns to exclude                                           |

> Inherits [BasePluginOptions](/en/factory/base-plugin-options): `enabled`, `logLevel`, `errorStrategy`

### Directory Scanning Options

| Option                  | Type                          | Default | Description                                          |
| ----------------------- | ----------------------------- | ------- | ---------------------------------------------------- |
| dirsScanOptions         | `DirsScanOptions`            | `{}`    | Directory scan options                               |
| defaultExportByFilename | `boolean`                    | `false` | Use filename as import name for default exports      |

### DTS Options

| Option         | Type                           | Default       | Description                                    |
| -------------- | ------------------------------ | ------------- | ---------------------------------------------- |
| dts.mode       | `'append' \| 'overwrite'`     | `'overwrite'` | Declaration generation mode                    |
| dts.filepath   | `string`                       | —             | Declaration file path                           |
| ignoreDts      | `Array<string \| RegExp>`      | `[]`          | Identifiers to ignore during DTS generation    |

### Injection & Integration Options

| Option             | Type                            | Default                   | Description                                    |
| ------------------ | ------------------------------- | ------------------------- | ---------------------------------------------- |
| injectAtPosition   | `'top' \| 'after-last-import'`  | `'top'`                   | Import statement injection position            |
| viteOptimizeDeps   | `boolean`                       | `true`                    | Auto-add imported packages to optimizeDeps     |
| cache              | `boolean \| CacheConfig`        | `true`                    | Cache configuration                            |
| resolvers          | `Resolver[]`                    | `[]`                      | Custom resolvers                               |
| packagePresets     | `PackagePresetConfig[]`         | `[]`                      | Package preset configuration                   |
| commentsDisable    | `string[]`                      | `['@unimport-disable']`   | Comment markers to disable auto-import         |

### Lint Config Options

| Option        | Type              | Default             | Description                        |
| ------------- | ----------------- | ------------------- | ---------------------------------- |
| eslintrc      | `EslintrcConfig`  | `{ enabled: false }` | ESLint globals config generation  |
| biomelintrc   | `BiomelintrcConfig` | `{ enabled: false }` | Biome globals config generation  |

## imports Formats

Supports five formats that can be mixed in an array:

### 1. Preset Strings

Built-in presets for one-liner config. Supports `vue`, `vue-router`, `pinia`, `vue-i18n`, `vitepress`, etc.:

```typescript
imports: ['vue', 'vue-router', 'pinia']
```

When no built-in preset matches, automatically tries to discover all named exports from the package's `.d.ts`.

### 2. Shorthand Format

Key is module path, value is array of import names:

```typescript
imports: [
  { vue: ['ref', 'reactive', 'computed'] },
  { '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']] }  // alias import
]
```

### 3. Type Import Format

Use `InlineImportConfig` to mark type imports:

```typescript
imports: [
  { from: 'vue-router', imports: ['RouteLocationRaw', 'Router'], type: true }
]
// Generates: import type { RouteLocationRaw, Router } from 'vue-router'
```

### 4. Namespace / Export Assignment Imports

```typescript
imports: [
  { lodash: [['*', '_']] },              // import * as _ from 'lodash'
  { 'webextension-polyfill': [['=', 'browser']] }  // import browser from 'webextension-polyfill'
]
```

### 5. Wildcard Format

Use `'*'` to auto-import all named exports from a module (resolved from `.d.ts`):

```typescript
imports: [{ vue: ['*'] }]
```

## dirs Formats

### String Format

```typescript
dirs: ['./composables', './composables/**', './stores/*']
```

- `./composables` — scan one level only
- `./composables/**` — recursively scan all subdirectories
- `./stores/*` — scan one level of subdirectories

### DirConfigObject Format

```typescript
dirs: [
  { glob: './composables/**', types: true },   // recursive, include type exports
  { glob: './hooks', types: false }            // one level, exclude type exports
]
```

## Examples

### Built-in Presets

```typescript
autoImport({ imports: ['vue', 'vue-router', 'pinia'] })
// ref, reactive, computed, watch, useRouter, useRoute, defineStore, etc. are all available
```

### Alias Import

```typescript
autoImport({
  imports: [{ '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']] }]
})
// Generates: import { useMouse, useFetch as useMyFetch } from '@vueuse/core'
```

### Default Import

```typescript
autoImport({
  imports: [{ axios: [['default', 'axios']] }]
})
// Generates: import { default as axios } from 'axios'
```

### Directory Scanning + Glob

```typescript
autoImport({
  dirs: ['./composables/**', { glob: './directives/**', types: false }],
  dirsScanOptions: {
    filePatterns: ['*.ts'],
    fileFilter: (file) => !file.endsWith('.test.ts')
  }
})
```

### Vue Template Auto-Import

```typescript
autoImport({ imports: ['vue'], vueTemplate: true })
```

Detection scope: interpolation expressions <span v-pre>`{{ }}`</span>, directive bindings `v-if`/`v-show`/`v-model`, attribute bindings `:prop`, event bindings `@event`.

### Vue Directive Auto-Import

```typescript
autoImport({
  dirs: ['./directives/**'],
  vueDirectives: {
    isDirective: (from) => from.includes('/directives/')
  }
})
```

### TypeScript Declarations

```typescript
autoImport({
  dts: 'src/auto-imports.d.ts'        // overwrite mode (default)
  // dts: { filepath: 'src/auto-imports.d.ts', mode: 'append' }  // append mode
  // dts: false  // don't generate
})
```

### ESLint / Biome Config Generation

Resolve `no-undef` errors for auto-imported identifiers:

```typescript
autoImport({
  imports: ['vue'],
  eslintrc: { enabled: true, filepath: './.eslintrc-auto-import.json' },
  biomelintrc: { enabled: true, filepath: './biome-auto-import.json' }
})
```

### Comment Disable

Add a comment in source files to skip auto-import:

```typescript
// @unimport-disable
const x = ref(0)  // won't inject import { ref } from 'vue'
```

### Custom Resolver

```typescript
autoImport({
  resolvers: [{
    resolve: (name) => {
      if (name.startsWith('use')) {
        return { name, from: 'my-lib', type: false }
      }
    }
  }]
})
```

## Type Exports

### ImportInline

Unified internal representation of an import item.

| Property  | Type               | Default  | Description                                                        |
| --------- | ------------------ | -------- | ------------------------------------------------------------------ |
| name      | `string`           | required | Import name (`'*'` for namespace, `'='` for export assignment)     |
| from      | `string`           | required | Module path                                                        |
| as        | `string`           | —        | Alias                                                              |
| type      | `boolean`          | `false`  | Whether it's a type import                                         |
| isDefault | `boolean`          | `false`  | Whether it's a default import                                      |
| meta      | `ImportMeta`       | —        | Metadata (e.g., vueDirective marker)                              |

### ScannedModule

Module info from directory scanning.

| Property      | Type             | Description                       |
| ------------- | ---------------- | --------------------------------- |
| filePath      | `string`         | Absolute file path                |
| exports       | `string[]`       | Named export names list           |
| defaultExport | `string \| null` | Default export name               |
| isType        | `boolean`        | Whether it's a type export (dir)  |

## Notes

- Automatically skips already explicitly imported identifiers to avoid duplicates
- Automatically skips shebang (`#!/usr/bin/env node`) and `"use strict"` declarations
- Automatically skips JavaScript/TypeScript reserved keywords and global built-in objects
- The `transform` hook uses `order: 'pre'` to ensure execution before other plugins
- Declaration files are only written when content changes, reducing unnecessary IO
- User-configured `imports` take priority over `dirs` scan results
- In dev mode, file changes in scanned directories automatically trigger HMR to refresh the mapping table
- When `viteOptimizeDeps: true`, imported npm packages are automatically added to Vite's pre-bundling config
