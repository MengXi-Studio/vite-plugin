# LoggerOptions

Logger configuration options type.

```typescript
import type { LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

## Type Definition

```typescript
interface LoggerOptions {
	/** Plugin name */
	name: string
	/** Enable logging */
	enabled?: boolean
}
```

## Properties

### name

Plugin name.

| Type     | Required | Description                            |
| -------- | -------- | -------------------------------------- |
| `string` | Yes      | Used for log prefix to identify plugin |

**Notes**

Plugin name is displayed in log prefix: `[@meng-xi/vite-plugin:name]`

**Example**

```typescript
Logger.create({
	name: 'my-plugin'
})
// Output: ℹ️ [@meng-xi/vite-plugin:my-plugin] ...
```

---

### enabled

Enable logging.

| Type      | Default | Description                                     |
| --------- | ------- | ----------------------------------------------- |
| `boolean` | `true`  | When `false`, this plugin's logs are not output |

**Example**

```typescript
// Enable logs
Logger.create({
	name: 'plugin-a',
	enabled: true
})

// Disable logs
Logger.create({
	name: 'plugin-b',
	enabled: false
})
```

---

## Usage Example

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'

// Basic usage
const logger = Logger.create({
	name: 'my-plugin'
})

// Disable logs
const silentLogger = Logger.create({
	name: 'silent-plugin',
	enabled: false
})

// Control by environment
const envLogger = Logger.create({
	name: 'env-plugin',
	enabled: process.env.DEBUG === 'true'
})
```
