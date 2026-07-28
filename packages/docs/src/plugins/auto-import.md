# autoImport

自动注入 import 语句的 Vite 插件，支持内置预设、别名/类型/命名空间导入、目录 glob 扫描、Vue 模板与指令自动导入、DTS 生成、ESLint/Biome 配置生成等。

## 导入

```typescript
import { autoImport } from '@meng-xi/vite-plugin'
// 或子模块导入
import { autoImport } from '@meng-xi/vite-plugin/plugins/generate/auto-import'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { autoImport } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    autoImport({
      // 内置预设，一行配置即可
      imports: ['vue', 'vue-router', 'pinia'],
      // 目录扫描，支持 glob
      dirs: ['./composables/**', { glob: './hooks', types: true }],
      // 类型声明生成
      dts: 'src/auto-imports.d.ts',
      // Vue 模板自动导入
      vueTemplate: true,
    })
  ]
})
```

## 配置选项

### 核心选项

| 选项             | 类型                                                                                                    | 默认值                        | 说明                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------- |
| imports          | `ImportsConfig`                                                                                         | `[]`                          | 导入映射配置（支持预设/简写/完整格式混合） |
| dirs             | `DirConfig[]`                                                                                           | `[]`                          | 目录扫描配置（支持字符串和 DirConfigObject） |
| dts              | `string \| boolean \| DtsConfigObject`                                                                  | `'src/auto-imports.d.ts'`     | 类型声明文件配置                          |
| vueTemplate      | `boolean`                                                                                               | `false`                       | 是否为 Vue 模板启用自动导入               |
| vueDirectives    | `boolean \| VueDirectivesConfig`                                                                        | `false`                       | 是否为 Vue 指令启用自动导入               |
| ignore           | `string[]`                                                                                              | `[]`                          | 需要忽略的标识符列表                      |
| include          | `Array<string \| RegExp>`                                                                               | `[/\.[tj]sx?$/, /\.vue$/...]` | 需要处理的文件匹配模式                    |
| exclude          | `Array<string \| RegExp>`                                                                               | `[/node_modules/]`            | 不需要处理的文件匹配模式                  |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### 目录扫描选项

| 选项                 | 类型                          | 默认值                            | 说明                       |
| -------------------- | ----------------------------- | --------------------------------- | -------------------------- |
| dirsScanOptions      | `DirsScanOptions`            | `{}`                              | 目录扫描选项               |
| defaultExportByFilename | `boolean`                  | `false`                           | 默认导出是否使用文件名作为导入名 |

### DTS 选项

| 选项             | 类型                           | 默认值        | 说明                                            |
| ---------------- | ------------------------------ | ------------- | ----------------------------------------------- |
| dts.mode         | `'append' \| 'overwrite'`     | `'overwrite'` | 类型声明生成模式                                |
| dts.filepath     | `string`                       | —             | 类型声明文件路径                                |
| ignoreDts        | `Array<string \| RegExp>`      | `[]`          | 生成 DTS 时需要忽略的标识符                     |

### 注入与集成选项

| 选项               | 类型                            | 默认值    | 说明                       |
| ------------------ | ------------------------------- | --------- | -------------------------- |
| injectAtPosition   | `'top' \| 'after-last-import'`  | `'top'`   | import 语句注入位置        |
| viteOptimizeDeps   | `boolean`                       | `true`    | 自动将导入包添加到 optimizeDeps |
| cache              | `boolean \| CacheConfig`        | `true`    | 缓存配置                   |
| resolvers          | `Resolver[]`                    | `[]`      | 自定义解析器               |
| packagePresets     | `PackagePresetConfig[]`         | `[]`      | 包预设配置                 |
| commentsDisable    | `string[]`                      | `['@unimport-disable']` | 禁用自动导入的注释标记 |

### Lint 配置选项

| 选项          | 类型             | 默认值          | 说明                       |
| ------------- | ---------------- | --------------- | -------------------------- |
| eslintrc      | `EslintrcConfig` | `{ enabled: false }` | ESLint globals 配置生成 |
| biomelintrc   | `BiomelintrcConfig` | `{ enabled: false }` | Biome globals 配置生成 |

## imports 配置格式

支持五种格式，可在数组中混合使用：

### 1. 预设字符串

内置预设一键配置，支持 `vue`、`vue-router`、`pinia`、`vue-i18n`、`vitepress` 等：

```typescript
imports: ['vue', 'vue-router', 'pinia']
```

未匹配内置预设时，自动尝试从包的 `.d.ts` 发现所有命名导出。

### 2. 简写格式

键为模块路径，值为导入名称数组：

```typescript
imports: [
  { vue: ['ref', 'reactive', 'computed'] },
  { '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']] }  // 别名导入
]
```

### 3. 类型导入格式

使用 `InlineImportConfig` 标记类型导入：

```typescript
imports: [
  { from: 'vue-router', imports: ['RouteLocationRaw', 'Router'], type: true }
]
// 生成: import type { RouteLocationRaw, Router } from 'vue-router'
```

### 4. 命名空间 / export assignment 导入

```typescript
imports: [
  { lodash: [['*', '_']] },              // import * as _ from 'lodash'
  { 'webextension-polyfill': [['=', 'browser']] }  // import browser from 'webextension-polyfill'
]
```

### 5. 通配符格式

使用 `'*'` 自动导入模块所有命名导出（从 `.d.ts` 解析）：

```typescript
imports: [{ vue: ['*'] }]
```

## dirs 配置格式

### 字符串格式

```typescript
dirs: ['./composables', './composables/**', './stores/*']
```

- `./composables` — 仅扫描一级
- `./composables/**` — 递归扫描所有子目录
- `./stores/*` — 扫描一级子目录

### DirConfigObject 格式

```typescript
dirs: [
  { glob: './composables/**', types: true },   // 递归扫描，包含类型导出
  { glob: './hooks', types: false }            // 仅一级，排除类型导出
]
```

## 示例

### 内置预设

```typescript
autoImport({ imports: ['vue', 'vue-router', 'pinia'] })
// ref, reactive, computed, watch, useRouter, useRoute, defineStore 等全部可用
```

### 别名导入

```typescript
autoImport({
  imports: [{ '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']] }]
})
// 生成: import { useMouse, useFetch as useMyFetch } from '@vueuse/core'
```

### 默认导入

```typescript
autoImport({
  imports: [{ axios: [['default', 'axios']] }]
})
// 生成: import { default as axios } from 'axios'
```

### 目录扫描 + glob

```typescript
autoImport({
  dirs: ['./composables/**', { glob: './directives/**', types: false }],
  dirsScanOptions: {
    filePatterns: ['*.ts'],
    fileFilter: (file) => !file.endsWith('.test.ts')
  }
})
```

### Vue 模板自动导入

```typescript
autoImport({ imports: ['vue'], vueTemplate: true })
```

检测范围：插值表达式 <span v-pre>`{{ }}`</span>、指令绑定 `v-if`/`v-show`/`v-model`、属性绑定 `:prop`、事件绑定 `@event`。

### Vue 指令自动导入

```typescript
autoImport({
  dirs: ['./directives/**'],
  vueDirectives: {
    isDirective: (from) => from.includes('/directives/')
  }
})
```

### TypeScript 类型声明

```typescript
autoImport({
  dts: 'src/auto-imports.d.ts'        // overwrite 模式（默认）
  // dts: { filepath: 'src/auto-imports.d.ts', mode: 'append' }  // append 模式
  // dts: false  // 不生成
})
```

### ESLint / Biome 配置生成

解决自动导入标识符的 `no-undef` 报错：

```typescript
autoImport({
  imports: ['vue'],
  eslintrc: { enabled: true, filepath: './.eslintrc-auto-import.json' },
  biomelintrc: { enabled: true, filepath: './biome-auto-import.json' }
})
```

### 注释禁用

在源文件中添加注释跳过自动导入：

```typescript
// @unimport-disable
const x = ref(0)  // 不会注入 import { ref } from 'vue'
```

### 自定义 Resolver

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

## 类型导出

### ImportInline

统一的导入项内部表示。

| 属性       | 类型               | 默认值   | 说明                                                       |
| ---------- | ------------------ | -------- | ---------------------------------------------------------- |
| name       | `string`           | 必填     | 导入名称（`'*'` 命名空间，`'='` export assignment）        |
| from       | `string`           | 必填     | 模块路径                                                   |
| as         | `string`           | —        | 别名                                                       |
| type       | `boolean`          | `false`  | 是否为类型导入                                             |
| isDefault  | `boolean`          | `false`  | 是否为默认导入                                             |
| meta       | `ImportMeta`       | —        | 元数据（如 vueDirective 标记）                             |

### ScannedModule

目录扫描到的模块信息。

| 属性          | 类型             | 说明                       |
| ------------- | ---------------- | -------------------------- |
| filePath      | `string`         | 模块文件绝对路径           |
| exports       | `string[]`       | 命名导出名称列表           |
| defaultExport | `string \| null` | 默认导出名称               |
| isType        | `boolean`        | 是否为类型导出（目录标记） |

## 注意事项

- 自动跳过已显式导入的标识符，避免重复
- 自动跳过 shebang（`#!/usr/bin/env node`）和 `"use strict"` 声明
- 自动跳过 JavaScript/TypeScript 保留关键字和全局内置对象
- `transform` 钩子使用 `order: 'pre'` 确保在其他插件处理之前执行
- 类型声明文件仅在内容变化时才写入，减少不必要的 IO
- 用户配置的 `imports` 优先级高于 `dirs` 扫描结果
- 开发模式下扫描目录文件变更会自动触发 HMR 刷新映射表
- `viteOptimizeDeps: true` 时自动将导入的 npm 包添加到 Vite 预构建配置
