# PluginLogger

Plugin logger proxy interface.

```typescript
import type { PluginLogger } from '@meng-xi/vite-plugin/logger'
```

## Interface

```typescript
interface PluginLogger {
	success(message: string, data?: any): void
	info(message: string, data?: any): void
	warn(message: string, data?: any): void
	error(message: string, data?: any): void
}
```

## Methods

| Method    | Icon | Color  | Description |
| --------- | ---- | ------ | ----------- |
| `success` | ✅   | Green  | Success     |
| `info`    | ℹ️   | Cyan   | Info        |
| `warn`    | ⚠️   | Yellow | Warning     |
| `error`   | ❌   | Red    | Error       |

## Additional Data

All methods support optional additional data.

```typescript
logger.info('Copy complete', { files: 10, time: '150ms' })
// ℹ️ [@meng-xi/vite-plugin:my-plugin] Copy complete { files: 10, time: '150ms' }
```
