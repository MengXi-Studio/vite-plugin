# autoImport

A Vite plugin that automatically injects import statements, supporting preset mappings, wildcard imports (`'*'`), and directory scanning, with optional TypeScript declaration file generation and Vue template auto-import
support.

## Import

```typescript
// Sub-module import (recommended)
import { autoImport } from '@meng-xi/vite-plugin/plugins/auto-import'
import type { AutoImportOptions, ImportMapping, ResolvedImport, ScannedModule, TransformResult } from '@meng-xi/vite-plugin/plugins/auto-import'

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
			imports: {
				vue: ['ref', 'reactive', 'computed', 'watch', 'onMounted'],
				'vue-router': ['useRouter', 'useRoute']
			},
			dirs: ['src/composables'],
			dts: 'src/auto-imports.d.ts',
			vueTemplate: true
		})
	]
})
```

## Options

| Option           | Type                                                                                              | Default                                                  | Description                             |
| ---------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------- |
| imports          | `Record<string, string[]> \| ImportMapping[] \| Array<Record<string, string[]> \| ImportMapping>` | `{}`                                                     | Import mapping configuration            |
| dirs             | `string[]`                                                                                        | `[]`                                                     | Directories to scan                     |
| dts              | `string \| boolean`                                                                               | `'auto-imports.d.ts'`                                    | TypeScript declaration file output path |
| vueTemplate      | `boolean`                                                                                         | `false`                                                  | Enable auto-import for Vue templates    |
| ignore           | `string[]`                                                                                        | `[]`                                                     | Identifiers to ignore                   |
| fileFilter       | `RegExp`                                                                                          | `/^(?!.*node_modules).*\.(vue\|jsx\|tsx\|ts\|js\|mjs)$/` | File filter regex                       |
| injectAtPosition | `'top' \| 'after-last-import'`                                                                    | `'top'`                                                  | Import statement injection position     |
| enabled          | `boolean`                                                                                         | `true`                                                   | Enable the plugin                       |
| verbose          | `boolean`                                                                                         | `true`                                                   | Show detailed logs                      |
| errorStrategy    | `'throw' \| 'log' \| 'ignore'`                                                                    | `'throw'`                                                | Error handling strategy                 |

### imports Formats

Supports four formats:

**1. Shorthand** — Key is module path, value is array of import names

```typescript
imports: {
  vue: ['ref', 'reactive', 'computed'],
  'vue-router': ['useRouter', 'useRoute']
}
```

**2. Wildcard** — Use `'*'` to auto-import all named exports from a module

```typescript
imports: {
  vue: ['*'], // Auto-import all named exports from vue (ref, reactive, computed, etc.)
  'vue-router': ['*']
}
```

**3. Full format** — Supports default import configuration

```typescript
imports: [
	{ module: 'lodash', names: ['debounce', 'throttle'], defaultImport: false },
	{ module: 'axios', names: ['axios'], defaultImport: true }
]
```

**4. Mixed format** — Multiple formats can be mixed in an array

```typescript
imports: [{ vue: ['ref', 'reactive'] }, { module: 'lodash', names: ['debounce'], defaultImport: true }]
```

### ImportMapping

| Property      | Type       | Default  | Description                                              |
| ------------- | ---------- | -------- | -------------------------------------------------------- |
| module        | `string`   | required | Module path                                              |
| names         | `string[]` | required | Import names list                                        |
| defaultImport | `boolean`  | `false`  | Whether to use default import (`import name from 'mod'`) |

### injectAtPosition

| Value             | Description                                               |
| ----------------- | --------------------------------------------------------- |
| top               | Inject at the top of effective code (skips shebang, etc.) |
| after-last-import | Inject after the last existing import statement           |

## Type Exports

### ResolvedImport

Resolved import mapping structure.

| Property  | Type      | Description                   |
| --------- | --------- | ----------------------------- |
| module    | `string`  | Module path                   |
| name      | `string`  | Import identifier             |
| isDefault | `boolean` | Whether it's a default import |

### ScannedModule

Module info from directory scanning.

| Property      | Type             | Description             |
| ------------- | ---------------- | ----------------------- |
| filePath      | `string`         | Absolute file path      |
| exports       | `string[]`       | Named export names list |
| defaultExport | `string \| null` | Default export name     |

## Examples

### Basic Usage

```typescript
autoImport({
	imports: {
		vue: ['ref', 'reactive', 'computed', 'watch', 'onMounted']
	}
})
```

### Wildcard Auto-Import

Use `'*'` to auto-import all named exports from a module without listing each one:

```typescript
autoImport({
	imports: {
		vue: ['*'],
		'vue-router': ['*']
	}
})
```

### Directory Scanning

Automatically scan exports from `src/composables` directory:

```typescript
autoImport({
	dirs: ['src/composables', 'src/stores']
})
```

Scanning rules:

- Recursively scans subdirectories
- Skips `node_modules` and hidden directories (starting with `.`)
- Skips `.d.ts` type declaration files

### Vue Template Auto-Import

When enabled, APIs used in Vue SFC `<template>` will also be auto-imported:

```typescript
autoImport({
	imports: { vue: ['ref', 'computed'] },
	vueTemplate: true
})
```

Detection scope:

- Interpolation expressions <span v-pre>`{{ }}`</span>
- Directive bindings `v-if`, `v-show`, `v-model`, etc.
- Attribute bindings `:prop="expr"`
- Event bindings `@event="handler"`

### TypeScript Declarations

```typescript
autoImport({
	dts: 'src/auto-imports.d.ts' // Generate declaration file
	// dts: false // Don't generate declaration file
})
```

### Default Import

```typescript
autoImport({
	imports: [{ module: 'axios', names: ['axios'], defaultImport: true }]
})
// Generates: import axios from 'axios'
```

### Ignore Identifiers

```typescript
autoImport({
	ignore: ['React'], // React is globally injected via CDN, no auto-import needed
	imports: { react: ['useState', 'useEffect'] }
})
```

### Injection Position

```typescript
autoImport({
	injectAtPosition: 'after-last-import' // Inject after the last import statement
})
```

## Notes

- Automatically skips already explicitly imported identifiers to avoid duplicates
- Automatically skips shebang (`#!/usr/bin/env node`) and `"use strict"` declarations
- Automatically skips JavaScript/TypeScript reserved keywords (e.g., `enum`, `class`, `function`) to avoid generating invalid type declarations
- The `transform` hook uses `order: 'pre'` to ensure execution before other plugins
- Declaration files are only written when content changes, reducing unnecessary IO
- User-configured `imports` take priority over `dirs` scan results
