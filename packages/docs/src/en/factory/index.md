# factory

Plugin factory module providing `BasePlugin` base class and `createPluginFactory` function.

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions, PluginFactory, PluginWithInstance, OptionsNormalizer } from '@meng-xi/vite-plugin/factory'
```

## Modules

| Module                                         | Description       |
| ---------------------------------------------- | ----------------- |
| [BasePlugin](./base-plugin)                    | Plugin base class |
| [createPluginFactory](./create-plugin-factory) | Plugin factory    |
| [BasePluginOptions](./base-plugin-options)     | Base options type |

## Type Exports

### PluginWithInstance

Vite plugin type with plugin instance reference.

```typescript
interface PluginWithInstance<T extends BasePluginOptions = BasePluginOptions> extends Plugin {
	pluginInstance?: BasePlugin<T>
}
```

| Property       | Type            | Description                         |
| -------------- | --------------- | ----------------------------------- |
| pluginInstance | `BasePlugin<T>` | Original plugin instance (optional) |

### OptionsNormalizer

Options normalizer type, used to convert raw configuration to target configuration.

```typescript
type OptionsNormalizer<T, R = any> = (raw?: R) => T
```

### PluginFactory

Plugin factory function type.

```typescript
type PluginFactory<T extends BasePluginOptions = BasePluginOptions, R = T> = (options?: R) => PluginWithInstance<T>
```
