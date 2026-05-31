# path

路径处理工具。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { isNodeModule } from '@meng-xi/vite-plugin/common/path'

// barrel 导入
import { isNodeModule } from '@meng-xi/vite-plugin/common'
```

## isNodeModule

判断模块 ID 是否来自 node_modules。

```typescript
function isNodeModule(moduleId: string): boolean
```

**参数**

| 参数     | 类型     | 说明       |
| -------- | -------- | ---------- |
| moduleId | `string` | 模块标识符 |

**返回值**

`boolean` - 是否来自 node_modules

**检测规则**

| 规则                    | 说明                | 示例                           |
| ----------------------- | ------------------- | ------------------------------ |
| 路径包含 `node_modules` | 第三方依赖模块      | `node_modules/lodash/index.js` |
| 以 `\0` 开头            | Rollup 内部虚拟模块 | `\0some-virtual-module`        |
| 以 `virtual:` 开头      | 虚拟模块前缀        | `virtual:import-meta-env`      |

**示例**

```typescript
import { isNodeModule } from '@meng-xi/vite-plugin/common/path'

// 第三方依赖
isNodeModule('node_modules/lodash/index.js') // true
isNodeModule('/project/node_modules/vue/dist/vue.runtime.esm.js') // true

// 项目源码
isNodeModule('src/utils/helper.ts') // false
isNodeModule('/project/src/components/App.vue') // false

// Rollup 虚拟模块
isNodeModule('\0some-virtual-module') // true

// 虚拟模块前缀
isNodeModule('virtual:import-meta-env') // true

// 在 Vite 插件中使用
class MyPlugin extends BasePlugin {
	protected addPluginHooks(plugin: Plugin): void {
		plugin.resolveId = {
			handler(id) {
				if (isNodeModule(id)) return null
				// 只处理项目源码模块
			}
		}
	}
}
```
