# path

Path utilities.

## Import Methods

```typescript
// Submodule import (recommended)
import { isNodeModule } from '@meng-xi/vite-plugin/common/path'

// Barrel import
import { isNodeModule } from '@meng-xi/vite-plugin/common'
```

## isNodeModule

Check if a module ID is from node_modules.

```typescript
function isNodeModule(moduleId: string): boolean
```

**Parameters**

| Parameter | Type     | Description       |
| --------- | -------- | ----------------- |
| moduleId  | `string` | Module identifier |

**Returns**

`boolean` - Whether the module is from node_modules

**Detection Rules**

| Rule                         | Description                     | Example                        |
| ---------------------------- | ------------------------------- | ------------------------------ |
| Path contains `node_modules` | Third-party dependency modules  | `node_modules/lodash/index.js` |
| Starts with `\0`             | Rollup internal virtual modules | `\0some-virtual-module`        |
| Starts with `virtual:`       | Virtual module prefix           | `virtual:import-meta-env`      |

**Examples**

```typescript
import { isNodeModule } from '@meng-xi/vite-plugin/common/path'

// Third-party dependencies
isNodeModule('node_modules/lodash/index.js') // true
isNodeModule('/project/node_modules/vue/dist/vue.runtime.esm.js') // true

// Project source code
isNodeModule('src/utils/helper.ts') // false
isNodeModule('/project/src/components/App.vue') // false

// Rollup virtual modules
isNodeModule('\0some-virtual-module') // true

// Virtual module prefix
isNodeModule('virtual:import-meta-env') // true

// Use in a Vite plugin
class MyPlugin extends BasePlugin {
	protected addPluginHooks(plugin: Plugin): void {
		plugin.resolveId = {
			handler(id) {
				if (isNodeModule(id)) return null
				// Only process project source modules
			}
		}
	}
}
```
