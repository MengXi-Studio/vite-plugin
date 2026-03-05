# logger

日志模块，提供单例日志管理器，支持插件级别的日志控制。

```typescript
import { Logger } from '@meng-xi/vite-plugin/logger'
import type { PluginLogger, LoggerOptions } from '@meng-xi/vite-plugin/logger'
```

## 模块列表

| 模块                              | 说明             |
| --------------------------------- | ---------------- |
| [Logger](./logger-class)          | 日志管理器类     |
| [PluginLogger](./plugin-logger)   | 插件日志代理接口 |
| [LoggerOptions](./logger-options) | 日志配置类型     |
