# PluginLogger

插件日志代理接口，为每个插件提供独立的日志方法。

```typescript
import type { PluginLogger } from '@meng-xi/vite-plugin/logger'
```

## 接口定义

```typescript
interface PluginLogger {
	success(message: string, data?: any): void
	info(message: string, data?: any): void
	warn(message: string, data?: any): void
	error(message: string, data?: any): void
}
```

---

## success

输出成功日志。

```typescript
success(message: string, data?: any): void
```

**参数**

| 参数    | 类型     | 说明             |
| ------- | -------- | ---------------- |
| message | `string` | 日志消息         |
| data    | `any`    | 附加数据（可选） |

**输出**

```
✅ [@meng-xi/vite-plugin:plugin-name] 消息内容
```

**示例**

```typescript
logger.success('文件复制完成')
logger.success('构建完成', { files: 10, time: '150ms' })
```

---

## info

输出信息日志。

```typescript
info(message: string, data?: any): void
```

**参数**

| 参数    | 类型     | 说明             |
| ------- | -------- | ---------------- |
| message | `string` | 日志消息         |
| data    | `any`    | 附加数据（可选） |

**输出**

```
ℹ️ [@meng-xi/vite-plugin:plugin-name] 消息内容
```

**示例**

```typescript
logger.info('开始处理文件')
logger.info('配置解析完成', { mode: 'production' })
```

---

## warn

输出警告日志。

```typescript
warn(message: string, data?: any): void
```

**参数**

| 参数    | 类型     | 说明             |
| ------- | -------- | ---------------- |
| message | `string` | 日志消息         |
| data    | `any`    | 附加数据（可选） |

**输出**

```
⚠️ [@meng-xi/vite-plugin:plugin-name] 消息内容
```

**示例**

```typescript
logger.warn('配置项已弃用')
logger.warn('文件不存在，跳过处理', { path: '/path/to/file' })
```

---

## error

输出错误日志。

```typescript
error(message: string, data?: any): void
```

**参数**

| 参数    | 类型     | 说明             |
| ------- | -------- | ---------------- |
| message | `string` | 日志消息         |
| data    | `any`    | 附加数据（可选） |

**输出**

```
❌ [@meng-xi/vite-plugin:plugin-name] 消息内容
```

**示例**

```typescript
logger.error('文件写入失败')
logger.error('处理错误', { error: 'EACCES' })
```

---

## 日志方法对照表

| 方法      | 图标 | 颜色 | 用途     |
| --------- | ---- | ---- | -------- |
| `success` | ✅   | 绿色 | 成功信息 |
| `info`    | ℹ️   | 青色 | 一般信息 |
| `warn`    | ⚠️   | 黄色 | 警告信息 |
| `error`   | ❌   | 红色 | 错误信息 |

---

## 附加数据

所有日志方法都支持传入附加数据，数据会跟随消息一起输出。

```typescript
logger.info('复制完成', { files: 10, time: '150ms' })
// ℹ️ [@meng-xi/vite-plugin:my-plugin] 复制完成 { files: 10, time: '150ms' }

logger.success('构建成功', { mode: 'production', duration: '5.2s' })
// ✅ [@meng-xi/vite-plugin:my-plugin] 构建成功 { mode: 'production', duration: '5.2s' }
```
