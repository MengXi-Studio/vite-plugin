# createPluginFactory

Create plugin factory function.

```typescript
import { createPluginFactory } from '@meng-xi/vite-plugin/factory'
```

## Signature

```typescript
function createPluginFactory<T, P, R = T>(PluginClass: new (options: T) => P, normalizer?: (options?: R) => T): (options?: R) => Plugin
```

## Basic Usage

```typescript
export const myPlugin = createPluginFactory(MyPlugin)

// Usage
myPlugin({ outputPath: 'dist/output.json' })
```

## With Normalizer

Support simplified configuration (e.g., string parameter).

```typescript
export const myPlugin = createPluginFactory(MyPlugin, (opt?: string | MyOptions) => (typeof opt === 'string' ? { path: opt } : (opt ?? { path: '' })))

// Both equivalent
myPlugin('/path/to/file')
myPlugin({ path: '/path/to/file' })
```
