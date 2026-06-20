# factory

插件工厂模块，提供 `BasePlugin` 基类、`createPluginFactory` 工厂函数和 `deepMerge` 深度合并工具。

```typescript
import { BasePlugin, createPluginFactory, deepMerge } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions, PluginFactory, PluginWithInstance, OptionsNormalizer } from '@meng-xi/vite-plugin/factory'
```

## 模块列表

| 模块 | 说明 |
| ---- | ---- |
| [BasePlugin](./base-plugin) | 插件基类，提供生命周期管理、日志记录、配置验证等核心功能 |
| [createPluginFactory](./create-plugin-factory) | 插件工厂函数，将插件类转换为 Vite 插件 |
| [BasePluginOptions](./base-plugin-options) | 所有插件的基础配置类型 |

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

## 工具函数

### deepMerge

深度合并多个对象，用于插件配置合并。

```typescript
function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T
```

**合并规则**

- 当源值和目标值均为普通对象时，递归合并
- 否则，源值直接覆盖目标值
- `undefined` 值会被跳过，不会覆盖已有属性
- 不会修改任何输入的源对象

**示例**

```typescript
deepMerge(
	{ a: 1, b: { c: 2 } },
	{ b: { d: 3 }, e: 4 }
)
// { a: 1, b: { c: 2, d: 3 }, e: 4 }

deepMerge({ a: { x: 1 } }, { a: null })
// { a: null }  // 非对象值直接覆盖
```
