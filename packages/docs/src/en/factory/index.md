# factory

Plugin factory module providing `BasePlugin` base class, `createPluginFactory` factory function, and `deepMerge` deep merge utility.

```typescript
import { BasePlugin, createPluginFactory, deepMerge } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions, PluginFactory, PluginWithInstance, OptionsNormalizer } from '@meng-xi/vite-plugin/factory'
```

## Module List

| Module | Description |
| ------ | ----------- |
| [BasePlugin](./base-plugin) | Plugin base class providing lifecycle management, logging, config validation and more |
| [createPluginFactory](./create-plugin-factory) | Plugin factory function converting plugin classes to Vite plugins |
| [BasePluginOptions](./base-plugin-options) | Base configuration type for all plugins |

## Type Exports

### PluginWithInstance

Vite plugin type with plugin instance reference.

```typescript
interface PluginWithInstance<T extends BasePluginOptions = BasePluginOptions> extends Plugin {
	pluginInstance?: BasePlugin<T>
}
```

| Property       | Type            | Description                       |
| -------------- | --------------- | --------------------------------- |
| pluginInstance | `BasePlugin<T>` | Original plugin instance reference |

### OptionsNormalizer

Options normalizer type for converting raw config to target config.

```typescript
type OptionsNormalizer<T, R = any> = (raw?: R) => T
```

### PluginFactory

Plugin factory function type.

```typescript
type PluginFactory<T extends BasePluginOptions = BasePluginOptions, R = T> = (options?: R) => PluginWithInstance<T>
```

### FunctionHookMap

A key mapping that filters `Plugin` to only "registerable" hooks, used for compile-time constraints on the hook name in `registerHook` / `registerOrderedHook`.

```typescript
type FunctionHookMap<P> = {
	[K in keyof P]: P[K] extends (...args: any[]) => any
		? P[K]
		: P[K] extends { handler: (...args: any[]) => any }
			? P[K]
			: never
}
```

**Notes**: Keeps only function-type hooks (or object hooks with a `handler`), excluding non-function properties like `name` / `enforce` / `apply`.

## Utility Functions

### deepMerge

Deep merge multiple objects, used for plugin config merging.

```typescript
function deepMerge<T extends Record<string, any>>(...sources: Partial<T>[]): T
```

**Merge Rules**

- When both source and target values are plain objects, merge recursively
- Otherwise, source value overwrites target value
- `undefined` values are skipped and won't overwrite existing properties
- Input source objects are never modified

**Example**

```typescript
deepMerge(
	{ a: 1, b: { c: 2 } },
	{ b: { d: 3 }, e: 4 }
)
// { a: 1, b: { c: 2, d: 3 }, e: 4 }

deepMerge({ a: { x: 1 } }, { a: null })
// { a: null }  // Non-object values overwrite directly
```
