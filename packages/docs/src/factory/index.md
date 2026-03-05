# factory

插件工厂模块，提供 `BasePlugin` 基类和 `createPluginFactory` 工厂函数。

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions, PluginFactory, OptionsNormalizer } from '@meng-xi/vite-plugin/factory'
```

## 模块列表

| 模块                                           | 说明         |
| ---------------------------------------------- | ------------ |
| [BasePlugin](./base-plugin)                    | 插件基类     |
| [createPluginFactory](./create-plugin-factory) | 插件工厂函数 |
| [BasePluginOptions](./base-plugin-options)     | 基础配置类型 |
