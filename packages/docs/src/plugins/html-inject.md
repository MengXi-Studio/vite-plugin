# htmlInject

HTML 内容注入插件，根据配置规则将 HTML 内容注入到目标 HTML 文件中。支持多种注入位置、条件注入、模板变量替换和安全过滤。

## 导入

```typescript
import { htmlInject } from '@meng-xi/vite-plugin'
// 或子模块导入
import { htmlInject } from '@meng-xi/vite-plugin/plugins/html-inject'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { htmlInject } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    htmlInject({
      rules: [
        {
          id: 'meta-description',
          content: '<meta name="description" content="{{appName}}">',
          position: 'head-end',
          templateVars: { appName: 'My Application' }
        }
      ]
    })
  ]
})
```

## 配置选项

| 选项          | 类型                           | 默认值         | 说明               |
| ------------- | ------------------------------ | -------------- | ------------------ |
| rules         | `InjectRule[]`                 | 必填           | 注入规则数组       |
| targetFile    | `string`                       | `'index.html'` | 目标 HTML 文件路径 |
| security      | `SecurityConfig`               | 见下方         | 安全配置           |
| templateVars  | `Record<string, string>`       | -              | 全局模板变量       |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### 高级选项

| 选项         | 类型      | 默认值 | 说明           |
| ------------ | --------- | ------ | -------------- |
| logInjection | `boolean` | `true` | 输出注入日志   |

### InjectRule

| 选项                 | 类型                     | 默认值     | 说明                                    |
| -------------------- | ------------------------ | ---------- | --------------------------------------- |
| id                   | `string`                 | -          | 规则唯一标识符，用于日志记录            |
| content              | `string`                 | 必填       | 要注入的 HTML 内容                      |
| position             | `InjectPosition`         | 必填       | 注入位置                                |
| selector             | `string`                 | -          | 选择器字符串（selector 相关位置时必填） |
| selectorMatch        | `'string' \| 'regex'`    | `'string'` | 选择器匹配模式                          |
| priority             | `number`                 | `100`      | 优先级，数值越小越先执行                |
| condition            | `InjectCondition`        | -          | 注入条件                                |
| templateVars         | `Record<string, string>` | -          | 规则级模板变量（覆盖全局）              |
| allowScriptInjection | `boolean`                | `false`    | 是否允许注入脚本等危险内容              |

### InjectPosition

| 值               | 说明                   |
| ---------------- | ---------------------- |
| head-start       | `<head>` 标签开始之后  |
| head-end         | `</head>` 标签之前     |
| body-start       | `<body>` 标签开始之后  |
| body-end         | `</body>` 标签之前     |
| before-selector  | 指定选择器之前         |
| after-selector   | 指定选择器之后         |
| replace-selector | 替换指定选择器匹配内容 |

### InjectCondition

| 选项   | 类型                                      | 说明                   |
| ------ | ----------------------------------------- | ---------------------- |
| type   | `'env' \| 'file-contains' \| 'custom'`    | 条件类型               |
| value  | `string \| ((...args: any[]) => boolean)` | 条件值                 |
| negate | `boolean`                                 | 是否取反，默认 `false` |

**条件类型说明：**

| 类型          | value 类型                    | 说明                   |
| ------------- | ----------------------------- | ---------------------- |
| env           | `string`                      | 基于环境变量判断       |
| file-contains | `string`                      | 基于 HTML 文件内容判断 |
| custom        | `(...args: any[]) => boolean` | 基于自定义函数判断     |

### SecurityConfig

| 选项                     | 类型       | 默认值 | 说明                               |
| ------------------------ | ---------- | ------ | ---------------------------------- |
| blockDangerousTags       | `boolean`  | `true` | 阻止危险标签（script、iframe 等）  |
| blockDangerousAttributes | `boolean`  | `true` | 阻止危险属性（onclick、onload 等） |
| allowedTags              | `string[]` | -      | 允许通过的标签白名单               |
| blockedTags              | `string[]` | -      | 自定义阻止标签列表                 |
| blockedAttributes        | `string[]` | -      | 自定义阻止属性列表                 |

## 类型导出

### InjectRule

注入规则接口，定义单条 HTML 内容注入规则。

### InjectionLogEntry

注入日志条目，记录单条规则的执行结果。

| 属性      | 类型             | 说明               |
| --------- | ---------------- | ------------------ |
| ruleId    | `string`         | 规则标识符         |
| position  | `InjectPosition` | 注入位置           |
| selector  | `string`         | 使用的选择器       |
| injected  | `boolean`        | 是否注入成功       |
| reason    | `string`         | 注入失败原因       |
| timestamp | `number`         | 日志时间戳         |

## 示例

### 模板变量

使用 <span v-pre>`{{变量名}}`</span> 语法在 content 中引用变量，规则级 `templateVars` 会覆盖全局 `templateVars`：

```typescript
htmlInject({
  templateVars: { appName: 'My App', version: '1.0.0' },
  rules: [
    {
      id: 'meta-description',
      content: '<meta name="description" content="{{appName}} v{{version}}">',
      position: 'head-end'
    },
    {
      id: 'custom-meta',
      content: '<meta name="author" content="{{author}}">',
      position: 'head-end',
      templateVars: { author: 'MengXi Studio' }
    }
  ]
})
```

### 条件注入

```typescript
htmlInject({
  rules: [
    {
      id: 'analytics',
      content: '<script src="/analytics.js"></script>',
      position: 'body-end',
      condition: { type: 'env', value: 'PRODUCTION' },
      allowScriptInjection: true
    },
    {
      id: 'noindex',
      content: '<meta name="robots" content="noindex">',
      position: 'head-end',
      condition: { type: 'env', value: 'STAGING', negate: true }
    }
  ]
})
```

### 选择器注入

```typescript
htmlInject({
  rules: [
    {
      id: 'replace-placeholder',
      content: '<div class="real-content">Loaded</div>',
      position: 'replace-selector',
      selector: '<div class="placeholder">'
    },
    {
      id: 'replace-old-meta',
      content: '<meta name="description" content="New Description">',
      position: 'replace-selector',
      selector: '<meta\\s+name="description"[^>]*>',
      selectorMatch: 'regex'
    }
  ]
})
```

### 优先级控制

规则按 `priority` 升序执行，数值越小优先级越高：

```typescript
htmlInject({
  rules: [
    { id: 'charset', content: '<meta charset="UTF-8">', position: 'head-start', priority: 1 },
    { id: 'viewport', content: '<meta name="viewport" content="...">', position: 'head-end', priority: 10 },
    { id: 'analytics', content: '<script>...</script>', position: 'body-end', priority: 100, allowScriptInjection: true }
  ]
})
```

### 安全配置

```typescript
htmlInject({
  security: {
    blockDangerousTags: true,
    blockDangerousAttributes: true,
    allowedTags: ['iframe'],
    blockedTags: ['object'],
    blockedAttributes: ['data-custom']
  },
  rules: [
    {
      id: 'trusted-iframe',
      content: '<iframe src="/widget.html"></iframe>',
      position: 'body-end'
    }
  ]
})
```

## 注意事项

- 默认安全配置会阻止 `<script>`、`<iframe>`、`<object>` 等危险标签和 `onclick`、`onload` 等事件属性
- 如需注入脚本，必须设置 `allowScriptInjection: true`，请确保注入内容来源可信
- `targetFile` 默认匹配所有 `index.html` 文件，支持相对路径和文件名匹配
- 规则按 `priority` 升序执行，相同优先级的规则按数组顺序执行
- 模板变量使用 <span v-pre>`{{变量名}}`</span> 语法，规则级变量覆盖全局变量
- `condition.negate: true` 可对条件结果取反
- 插件通过 `transformIndexHtml` 钩子（`order: 'post'`）执行注入
