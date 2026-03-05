# LoggerOptions

Logger configuration options.

```typescript
import type { LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

## Type Definition

```typescript
interface LoggerOptions {
	name: string
	enabled?: boolean
}
```

## Properties

| Property | Type      | Default  | Description    |
| -------- | --------- | -------- | -------------- |
| name     | `string`  | Required | Plugin name    |
| enabled  | `boolean` | `true`   | Enable logging |

## Example

```typescript
Logger.create({
	name: 'my-plugin',
	enabled: process.env.DEBUG === 'true'
})
```
