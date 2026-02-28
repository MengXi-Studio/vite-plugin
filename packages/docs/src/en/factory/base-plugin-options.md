# BasePluginOptions

Base configuration options type for all plugins.

```typescript
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
```

## Type Definition

```typescript
interface BasePluginOptions {
	enabled?: boolean
	verbose?: boolean
	errorStrategy?: 'throw' | 'log' | 'ignore'
}
```

## Properties

| Property      | Type                           | Default   | Description             |
| ------------- | ------------------------------ | --------- | ----------------------- |
| enabled       | `boolean`                      | `true`    | Enable plugin           |
| verbose       | `boolean`                      | `true`    | Show verbose logs       |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | Error handling strategy |

## Error Strategies

| Strategy | Behavior            |
| -------- | ------------------- |
| `throw`  | Log error and throw |
| `log`    | Log error, continue |
| `ignore` | Log error, continue |

## Extending

```typescript
interface MyPluginOptions extends BasePluginOptions {
	outputPath: string
	format?: 'json' | 'yaml'
}
```
