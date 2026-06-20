# LoggerOptions

Log configuration options type.

```typescript
import type { LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

## Type Definition

```typescript
interface LoggerOptions {
	/** Plugin name */
	name: string
	/** Whether to enable logging, default true */
	enabled?: boolean
}
```

---

## Properties

### name

Plugin name, used for log prefix identification.

| Type     | Required | Description                                           |
| -------- | -------- | ----------------------------------------------------- |
| `string` | Yes      | Displayed in log prefix `[@meng-xi/vite-plugin:name]` |

```typescript
Logger.create({ name: 'my-plugin' })
// Output: ℹ️ [@meng-xi/vite-plugin:my-plugin] ...
```

### enabled

Whether to enable logging.

| Type      | Default | Description                               |
| --------- | ------- | ----------------------------------------- |
| `boolean` | `true`  | When `false`, no logs are output for this plugin |

```typescript
// Disable logging
Logger.create({ name: 'my-plugin', enabled: false })

// Control by environment
Logger.create({ name: 'my-plugin', enabled: process.env.DEBUG === 'true' })
```
