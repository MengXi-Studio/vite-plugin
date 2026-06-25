# env

Environment variable utilities, providing `.env` file content parsing with key-value extraction, quote removal, and prefix filtering.

## Import Methods

```typescript
// Submodule import (recommended)
import { parseEnvContent } from '@meng-xi/vite-plugin/common/env'

// Barrel import
import { parseEnvContent } from '@meng-xi/vite-plugin/common'
```

---

## parseEnvContent

Parses `.env` file content and extracts key-value pairs into an object.

```typescript
function parseEnvContent(
  content: string,
  options?: { prefix?: string }
): Record<string, string>
```

**Parameters**

| Parameter | Type     | Default | Description                  |
| --------- | -------- | ------- | ---------------------------- |
| content   | `string` | -       | `.env` file content string   |
| options   | `object` | -       | Parse options (optional)     |

**options**

| Property | Type     | Default | Description                                              |
| -------- | -------- | ------- | -------------------------------------------------------- |
| prefix   | `string` | -       | Only keep keys starting with this prefix (e.g., `VITE_`, `APP_`) |

**Returns**

`Record<string, string>` - Key-value mapping object

**Parsing Rules**

| Rule              | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| Empty lines       | Skipped automatically                                                    |
| Comment lines `#` | Skipped automatically (lines starting with `#`)                          |
| Lines without `=` | Skipped automatically (lines without `=`)                                |
| Key processing    | Takes the left side of `=`, trims whitespace                             |
| Value processing  | Takes the right side of `=`, trims whitespace                            |
| Quote removal     | If the value is wrapped in single quotes `'...'` or double quotes `"..."`, the surrounding quotes are removed |
| Prefix filtering  | If `prefix` is provided, only keys starting with that prefix are kept    |

**Examples**

```typescript
const envContent = `
# Database config
DB_HOST=localhost
DB_PORT=5432

# App config
APP_NAME="My App"
APP_MODE='production'
SECRET_KEY=abc123def
`

// Parse all variables
const env = parseEnvContent(envContent)
// {
//   DB_HOST: 'localhost',
//   DB_PORT: '5432',
//   APP_NAME: 'My App',
//   APP_MODE: 'production',
//   SECRET_KEY: 'abc123def'
// }

// Parse only variables starting with APP_
const appEnv = parseEnvContent(envContent, { prefix: 'APP_' })
// {
//   APP_NAME: 'My App',
//   APP_MODE: 'production'
// }

// Parse only variables starting with VITE_ (common in Vite projects)
const viteEnv = parseEnvContent(envContent, { prefix: 'VITE_' })
// {}
```
