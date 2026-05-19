# factory

插件工厂模块，提供 `BasePlugin` 基类和 `createPluginFactory` 工厂函数。

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions, PluginFactory, PluginWithInstance, OptionsNormalizer } from '@meng-xi/vite-plugin/factory'
```

## 模块列表

| 模块                                           | 说明         |
| ---------------------------------------------- | ------------ |
| [BasePlugin](./base-plugin)                    | 插件基类     |
| [createPluginFactory](./create-plugin-factory) | 插件工厂函数 |
| [BasePluginOptions](./base-plugin-options)     | 基础配置类型 |

## 类型导出

### PluginWithInstance

带插件实例引用的 Vite 插件类型。

```typescript
interface PluginWithInstance<T extends BasePluginOptions = BasePluginOptions> extends Plugin {
	pluginInstance?: BasePlugin<T>
}
```

| 属性           | 类型            | 说明                     |
| -------------- | --------------- | ------------------------ |
| pluginInstance | `BasePlugin<T>` | 原始插件实例引用（可选） |

### OptionsNormalizer

选项标准化器类型，用于将原始配置转换为目标配置。

```typescript
type OptionsNormalizer<T, R = any> = (raw?: R) => T
```

### PluginFactory

插件工厂函数类型。

```typescript
type PluginFactory<T extends BasePluginOptions = BasePluginOptions, R = T> = (options?: R) => PluginWithInstance<T>
```
