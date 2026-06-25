# env

环境变量工具，提供 `.env` 文件内容解析功能，支持键值对提取、引号去除和前缀过滤。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { parseEnvContent } from '@meng-xi/vite-plugin/common/env'

// barrel 导入
import { parseEnvContent } from '@meng-xi/vite-plugin/common'
```

---

## parseEnvContent

解析 `.env` 文件内容，提取键值对为对象。

```typescript
function parseEnvContent(
  content: string,
  options?: { prefix?: string }
): Record<string, string>
```

**参数**

| 参数    | 类型     | 默认值 | 说明                  |
| ------- | -------- | ------ | --------------------- |
| content | `string` | -      | `.env` 文件内容字符串 |
| options | `object` | -      | 解析选项（可选）      |

**options 选项**

| 属性   | 类型     | 默认值 | 说明                                       |
| ------ | -------- | ------ | ------------------------------------------ |
| prefix | `string` | -      | 仅保留以该前缀开头的键（如 `VITE_`、`APP_`） |

**返回值**

`Record<string, string>` - 键值对映射对象

**解析规则**

| 规则         | 说明                                                              |
| ------------ | ----------------------------------------------------------------- |
| 空行         | 自动跳过                                                          |
| 注释行 `#`   | 自动跳过（以 `#` 开头的行）                                       |
| 无等号行     | 自动跳过（不含 `=` 的行）                                         |
| 键名处理     | 取 `=` 左侧部分，去除首尾空白                                     |
| 值处理       | 取 `=` 右侧部分，去除首尾空白                                     |
| 引号去除     | 若值被单引号 `'...'` 或双引号 `"..."` 包裹，则去除首尾引号        |
| 前缀过滤     | 若提供 `prefix`，则仅保留以该前缀开头的键                         |

**示例**

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

// 解析全部变量
const env = parseEnvContent(envContent)
// {
//   DB_HOST: 'localhost',
//   DB_PORT: '5432',
//   APP_NAME: 'My App',
//   APP_MODE: 'production',
//   SECRET_KEY: 'abc123def'
// }

// 仅解析以 APP_ 开头的变量
const appEnv = parseEnvContent(envContent, { prefix: 'APP_' })
// {
//   APP_NAME: 'My App',
//   APP_MODE: 'production'
// }

// 仅解析以 VITE_ 开头的变量（常用于 Vite 项目）
const viteEnv = parseEnvContent(envContent, { prefix: 'VITE_' })
// {}
```
