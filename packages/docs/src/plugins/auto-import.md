# autoImport

自动注入 import 语句的 Vite 插件，支持预设映射、通配符导入（`'*'`）和目录扫描三种方式，可选生成 TypeScript 类型声明文件，支持 Vue 模板自动导入。

## 导入

```typescript
import { autoImport } from '@meng-xi/vite-plugin'
// 或子模块导入
import { autoImport } from '@meng-xi/vite-plugin/plugins/auto-import'
```

## 快速开始

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

## 配置选项

| 选项             | 类型                                                                                              | 默认值                | 说明                    |
| ---------------- | ------------------------------------------------------------------------------------------------- | --------------------- | ----------------------- |
| imports          | `Record<string, string[]> \| ImportMapping[]`                                                     | `{}`                  | 导入映射配置            |
| dirs             | `string[]`                                                                                        | `[]`                  | 需要扫描的目录列表      |
| dts              | `string \| boolean`                                                                               | `'auto-imports.d.ts'` | 类型声明文件输出路径    |
| vueTemplate      | `boolean`                                                                                         | `false`               | 是否为 Vue 模板启用导入 |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### imports 配置格式

支持四种格式：

**1. 简写格式** — 键为模块路径，值为导入名称数组

```typescript
imports: {
  vue: ['ref', 'reactive', 'computed'],
  'vue-router': ['useRouter', 'useRoute']
}
```

**2. 通配符格式** — 使用 `'*'` 自动导入模块所有命名导出

```typescript
imports: {
  vue: ['*'],
  'vue-router': ['*']
}
```

**3. 完整格式** — 支持默认导入配置

```typescript
imports: [
  { module: 'lodash', names: ['debounce', 'throttle'], defaultImport: false },
  { module: 'axios', names: ['axios'], defaultImport: true }
]
```

**4. 混合格式** — 多种格式可以在数组中混合使用

```typescript
imports: [
  { vue: ['ref', 'reactive'] },
  { module: 'lodash', names: ['debounce'], defaultImport: true }
]
```

### ImportMapping

| 属性          | 类型       | 默认值  | 说明                                       |
| ------------- | ---------- | ------- | ------------------------------------------ |
| module        | `string`   | 必填    | 模块路径                                   |
| names         | `string[]` | 必填    | 要导入的名称列表                           |
| defaultImport | `boolean`  | `false` | 是否为默认导入（`import name from 'mod'`） |

### injectAtPosition

| 值                | 说明                                        |
| ----------------- | ------------------------------------------- |
| top               | 注入到文件有效代码最顶部（跳过 shebang 等） |
| after-last-import | 注入到最后一个已有 import 语句之后          |

### 高级选项

| 选项             | 类型                            | 默认值                                                   | 说明                   |
| ---------------- | ------------------------------- | -------------------------------------------------------- | ---------------------- |
| ignore           | `string[]`                      | `[]`                                                     | 需要忽略的标识符列表   |
| fileFilter       | `RegExp`                       | `/^(?!.*node_modules).*\.(vue\|jsx\|tsx\|ts\|js\|mjs)$/` | 文件过滤正则表达式     |
| injectAtPosition | `'top' \| 'after-last-import'` | `'top'`                                                  | import 语句注入位置    |

## 类型导出

### ResolvedImport

解析后的导入映射结构。

| 属性      | 类型      | 说明           |
| --------- | --------- | -------------- |
| module    | `string`  | 模块路径       |
| name      | `string`  | 导入标识符     |
| isDefault | `boolean` | 是否为默认导入 |

### ScannedModule

目录扫描到的模块信息。

| 属性          | 类型             | 说明             |
| ------------- | ---------------- | ---------------- |
| filePath      | `string`         | 模块文件绝对路径 |
| exports       | `string[]`       | 命名导出名称列表 |
| defaultExport | `string \| null` | 默认导出名称     |

## 示例

### 通配符自动导入

使用 `'*'` 自动导入模块的所有命名导出，无需逐一列举：

```typescript
autoImport({
  imports: { vue: ['*'], 'vue-router': ['*'] }
})
```

### 目录扫描

自动扫描目录下的导出，注册为可自动导入的标识符：

```typescript
autoImport({
  dirs: ['src/composables', 'src/stores']
})
```

扫描规则：

- 递归扫描子目录
- 跳过 `node_modules` 和隐藏目录（以 `.` 开头）
- 跳过 `.d.ts` 类型声明文件

### Vue 模板自动导入

开启后，Vue SFC 文件 `<template>` 中使用的 API 也会被自动导入：

```typescript
autoImport({
  imports: { vue: ['ref', 'computed'] },
  vueTemplate: true
})
```

检测范围：

- 插值表达式 <span v-pre>`{{ }}`</span> 中的标识符
- 指令绑定 `v-if`、`v-show`、`v-model` 等中的表达式
- 属性绑定 `:prop="expr"` 中的表达式
- 事件绑定 `@event="handler"` 中的表达式

### TypeScript 类型声明

```typescript
autoImport({ dts: 'src/auto-imports.d.ts' })
// dts: false — 不生成类型声明文件
```

### 默认导入

```typescript
autoImport({
  imports: [{ module: 'axios', names: ['axios'], defaultImport: true }]
})
// 生成: import axios from 'axios'
```

### 忽略标识符

```typescript
autoImport({
  ignore: ['React'],
  imports: { react: ['useState', 'useEffect'] }
})
```

### 注入位置控制

```typescript
autoImport({ injectAtPosition: 'after-last-import' })
```

## 注意事项

- 自动跳过已显式导入的标识符，避免重复
- 自动跳过 shebang（`#!/usr/bin/env node`）和 `"use strict"` 声明
- 自动跳过 JavaScript/TypeScript 保留关键字，避免生成无效的类型声明
- `transform` 钩子使用 `order: 'pre'` 确保在其他插件处理之前执行
- 类型声明文件仅在内容变化时才写入，减少不必要的 IO
- 用户配置的 `imports` 优先级高于 `dirs` 扫描结果
