# htmlInject

HTML content injection plugin that injects HTML content into target HTML files during the Vite build process based on configured rules. Supports multiple injection positions (head/body start/end, before/after/replace
selector), conditional injection, template variable replacement, and security filtering.

## Import Methods

```typescript
// Submodule import (recommended)
import { htmlInject } from '@meng-xi/vite-plugin/plugins/html-inject'
import type { HtmlInjectOptions, InjectRule, InjectPosition, InjectCondition, SecurityConfig, InjectionLogEntry } from '@meng-xi/vite-plugin/plugins/html-inject'

// Barrel import
import { htmlInject } from '@meng-xi/vite-plugin'
```

## Quick Start

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
				},
				{
					id: 'analytics',
					content: '<script src="/analytics.js"></script>',
					position: 'body-end',
					condition: { type: 'env', value: 'PRODUCTION' },
					allowScriptInjection: true
				}
			]
		})
	]
})
```

## Options

| Option        | Type                           | Default        | Description               |
| ------------- | ------------------------------ | -------------- | ------------------------- |
| rules         | `InjectRule[]`                 | Required       | Injection rules array     |
| targetFile    | `string`                       | `'index.html'` | Target HTML file path     |
| security      | `SecurityConfig`               | See below      | Security configuration    |
| templateVars  | `Record<string, string>`       | -              | Global template variables |

> Inherits [BasePluginOptions](/factory/base-plugin-options): `enabled`, `logLevel`, `errorStrategy`

### Advanced Options

| Option        | Type      | Default | Description           |
| ------------- | --------- | ------- | --------------------- |
| logInjection  | `boolean` | `true`  | Output injection logs |

### InjectRule

| Option               | Type                     | Default    | Description                                              |
| -------------------- | ------------------------ | ---------- | -------------------------------------------------------- |
| id                   | `string`                 | -          | Rule unique identifier for logging                       |
| content              | `string`                 | Required   | HTML content to inject                                   |
| position             | `InjectPosition`         | Required   | Injection position                                       |
| selector             | `string`                 | -          | Selector string (required for selector positions)        |
| selectorMatch        | `'string' \| 'regex'`    | `'string'` | Selector match mode                                      |
| priority             | `number`                 | `100`      | Priority, lower values execute first                     |
| condition            | `InjectCondition`        | -          | Injection condition                                      |
| templateVars         | `Record<string, string>` | -          | Rule-level template variables (override global)          |
| allowScriptInjection | `boolean`                | `false`    | Whether to allow injecting scripts and dangerous content |

### InjectPosition

| Value            | Description                          |
| ---------------- | ------------------------------------ |
| head-start       | After the `<head>` tag opens         |
| head-end         | Before the `</head>` tag             |
| body-start       | After the `<body>` tag opens         |
| body-end         | Before the `</body>` tag             |
| before-selector  | Before the specified selector        |
| after-selector   | After the specified selector         |
| replace-selector | Replace the matched selector content |

### InjectCondition

| Option | Type                                      | Description                        |
| ------ | ----------------------------------------- | ---------------------------------- |
| type   | `'env' \| 'file-contains' \| 'custom'`    | Condition type                     |
| value  | `string \| ((...args: any[]) => boolean)` | Condition value                    |
| negate | `boolean`                                 | Whether to negate, default `false` |

**Condition Types**

| Type          | Value Type                    | Description                   |
| ------------- | ----------------------------- | ----------------------------- |
| env           | `string`                      | Based on environment variable |
| file-contains | `string`                      | Based on HTML file content    |
| custom        | `(...args: any[]) => boolean` | Based on custom function      |

### SecurityConfig

| Option                   | Type       | Default | Description                                        |
| ------------------------ | ---------- | ------- | -------------------------------------------------- |
| blockDangerousTags       | `boolean`  | `true`  | Block dangerous tags (script, iframe, etc.)        |
| blockDangerousAttributes | `boolean`  | `true`  | Block dangerous attributes (onclick, onload, etc.) |
| allowedTags              | `string[]` | -       | Allowed tags whitelist                             |
| blockedTags              | `string[]` | -       | Custom blocked tags list                           |
| blockedAttributes        | `string[]` | -       | Custom blocked attributes list                     |

### InjectionLogEntry

| Option    | Type             | Description                  |
| --------- | ---------------- | ---------------------------- |
| ruleId    | `string`         | Rule identifier              |
| position  | `InjectPosition` | Injection position           |
| selector  | `string`         | Selector used                |
| injected  | `boolean`        | Whether injection succeeded  |
| reason    | `string`         | Reason for injection failure |
| timestamp | `number`         | Log timestamp                |

## Examples

### Basic Injection

```typescript
htmlInject({
	rules: [
		{
			id: 'meta-viewport',
			content: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
			position: 'head-end'
		}
	]
})
```

### Template Variables

Use <span v-pre>`{{variableName}}`</span> syntax in content to reference variables. Rule-level `templateVars` override global `templateVars`:

```typescript
htmlInject({
	templateVars: {
		appName: 'My App',
		version: '1.0.0'
	},
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

### Conditional Injection

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
			id: 'debug-banner',
			content: '<div class="debug-banner">Debug Mode</div>',
			position: 'body-start',
			condition: { type: 'env', value: 'DEBUG' }
		},
		{
			id: 'conditional-meta',
			content: '<meta name="robots" content="noindex">',
			position: 'head-end',
			condition: { type: 'env', value: 'STAGING', negate: true }
		}
	]
})
```

### Selector Injection

```typescript
htmlInject({
	rules: [
		{
			id: 'before-app',
			content: '<div class="wrapper">',
			position: 'before-selector',
			selector: '<div id="app">'
		},
		{
			id: 'after-app',
			content: '</div>',
			position: 'after-selector',
			selector: '<div id="app">'
		},
		{
			id: 'replace-placeholder',
			content: '<div class="real-content">Loaded</div>',
			position: 'replace-selector',
			selector: '<div class="placeholder">'
		}
	]
})
```

### Regex Selector

```typescript
htmlInject({
	rules: [
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

### Priority Control

Rules execute in ascending order of `priority`. Lower values have higher priority:

```typescript
htmlInject({
	rules: [
		{ id: 'charset', content: '<meta charset="UTF-8">', position: 'head-start', priority: 1 },
		{ id: 'viewport', content: '<meta name="viewport" content="...">', position: 'head-end', priority: 10 },
		{ id: 'analytics', content: '<script>...</script>', position: 'body-end', priority: 100 }
	]
})
```

### Security Configuration

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

### Custom Target File

```typescript
htmlInject({
	targetFile: 'src/views/home.html',
	rules: [
		{
			id: 'home-specific',
			content: '<div class="home-banner">Welcome</div>',
			position: 'body-start'
		}
	]
})
```

## Notes

- Default security configuration blocks dangerous tags like `<script>`, `<iframe>`, `<object>` and event attributes like `onclick`, `onload`
- To inject scripts, you must set `allowScriptInjection: true`. Ensure the injected content is from a trusted source
- `targetFile` defaults to matching all `index.html` files, supports relative paths and filename matching
- Rules execute in ascending order of `priority`. Rules with the same priority execute in array order
- Template variables use <span v-pre>`{{variableName}}`</span> syntax. Rule-level variables override global variables
- `condition.negate: true` negates the condition result
