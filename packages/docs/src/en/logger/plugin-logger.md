# PluginLogger

Plugin log proxy interface providing independent log methods for each plugin.

```typescript
import type { PluginLogger } from '@meng-xi/vite-plugin/logger'
```

## Interface Definition

```typescript
interface PluginLogger {
	success(message: string, data?: any): void
	info(message: string, data?: any): void
	warn(message: string, data?: any): void
	error(message: string, data?: any): void
}
```

---

## Methods

### success

Output success log.

```typescript
success(message: string, data?: any): void
```

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| message   | `string` | Log message          |
| data      | `any`    | Additional data (optional) |

**Output**

```
✅ [@meng-xi/vite-plugin:plugin-name] Message content
```

### info

Output info log.

```typescript
info(message: string, data?: any): void
```

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| message   | `string` | Log message          |
| data      | `any`    | Additional data (optional) |

**Output**

```
ℹ️ [@meng-xi/vite-plugin:plugin-name] Message content
```

### warn

Output warning log.

```typescript
warn(message: string, data?: any): void
```

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| message   | `string` | Log message          |
| data      | `any`    | Additional data (optional) |

**Output**

```
⚠️ [@meng-xi/vite-plugin:plugin-name] Message content
```

### error

Output error log.

```typescript
error(message: string, data?: any): void
```

| Parameter | Type     | Description          |
| --------- | -------- | -------------------- |
| message   | `string` | Log message          |
| data      | `any`    | Additional data (optional) |

**Output**

```
❌ [@meng-xi/vite-plugin:plugin-name] Message content
```

---

## Log Method Reference

| Method    | Icon | Color  | Usage         |
| --------- | ---- | ------ | ------------- |
| `success` | ✅   | Green  | Success info  |
| `info`    | ℹ️   | Cyan   | General info  |
| `warn`    | ⚠️   | Yellow | Warning info  |
| `error`   | ❌   | Red    | Error info    |

---

## Additional Data

All log methods support passing additional data, which is output alongside the message.

```typescript
logger.info('Copy complete', { files: 10, time: '150ms' })
// ℹ️ [@meng-xi/vite-plugin:my-plugin] Copy complete { files: 10, time: '150ms' }

logger.success('Build successful', { mode: 'production', duration: '5.2s' })
// ✅ [@meng-xi/vite-plugin:my-plugin] Build successful { mode: 'production', duration: '5.2s' }
```
