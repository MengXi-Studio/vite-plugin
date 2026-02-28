# createPluginFactory

创建插件工厂函数，用于生成 Vite 插件实例。

```typescript
import { createPluginFactory } from '@meng-xi/vite-plugin/factory'
```

## 函数签名

```typescript
function createPluginFactory<T extends BasePluginOptions, P extends BasePlugin<T>, R = T>(PluginClass: new (options: T, loggerConfig?: LoggerOptions) => P, normalizer?: OptionsNormalizer<T, R>): PluginFactory<T, R>
```

**泛型参数**

| 参数 | 约束                | 说明         |
| ---- | ------------------- | ------------ |
| T    | `BasePluginOptions` | 插件配置类型 |
| P    | `BasePlugin<T>`     | 插件实例类型 |
| R    | `T`（默认）         | 原始配置类型 |

**参数**

| 参数        | 类型                      | 说明                 |
| ----------- | ------------------------- | -------------------- |
| PluginClass | 插件类构造函数            | 插件类               |
| normalizer  | `OptionsNormalizer<T, R>` | 选项标准化器（可选） |

**返回值**

`PluginFactory<T, R>` - 插件工厂函数

---

## 基本用法

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'

interface MyPluginOptions extends BasePluginOptions {
	outputPath: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	// ... 实现
}

// 创建工厂函数
export const myPlugin = createPluginFactory(MyPlugin)
```

**使用**

```typescript
import { defineConfig } from 'vite'
import { myPlugin } from './my-plugin'

export default defineConfig({
	plugins: [
		myPlugin({
			outputPath: 'dist/output.json'
		})
	]
})
```

---

## 带选项标准化器

支持简化的配置方式（如字符串参数）。

```typescript
interface MyPluginOptions extends BasePluginOptions {
	path: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	// ... 实现
}

// 支持字符串或对象配置
export const myPlugin = createPluginFactory(MyPlugin, (opt?: string | MyPluginOptions) => (typeof opt === 'string' ? { path: opt } : (opt ?? { path: '' })))
```

**使用**

```typescript
// 两种方式等效
myPlugin('/path/to/file')
myPlugin({ path: '/path/to/file' })
```

---

## OptionsNormalizer

选项标准化器类型。

```typescript
type OptionsNormalizer<T, R> = (options?: R) => T
```

**参数**

| 参数    | 类型 | 说明     |
| ------- | ---- | -------- |
| options | `R`  | 原始配置 |

**返回值**

`T` - 标准化后的配置

---

## PluginFactory

插件工厂函数类型。

```typescript
type PluginFactory<T extends BasePluginOptions, R = T> = (options?: R) => Plugin
```

**参数**

| 参数    | 类型 | 说明     |
| ------- | ---- | -------- |
| options | `R`  | 插件配置 |

**返回值**

`Plugin` - Vite 插件对象

---

## 完整示例

```typescript
import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin/factory'
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import { writeFileContent } from '@meng-xi/vite-plugin/common'

// 定义配置类型
interface BuildInfoOptions extends BasePluginOptions {
	outputPath?: string
}

// 实现插件类
class BuildInfoPlugin extends BasePlugin<BuildInfoOptions> {
	protected getPluginName() {
		return 'build-info'
	}

	protected getDefaultOptions() {
		return {
			outputPath: 'dist/build-info.json'
		}
	}

	protected getEnforce(): Plugin['enforce'] {
		return 'post'
	}

	protected addPluginHooks(plugin: Plugin) {
		plugin.closeBundle = async () => {
			if (!this.options.enabled) return

			await this.safeExecute(async () => {
				const info = {
					buildTime: new Date().toISOString(),
					mode: this.viteConfig?.mode
				}
				await writeFileContent(this.options.outputPath, JSON.stringify(info, null, 2))
				this.logger.success('构建信息已生成')
			}, '生成构建信息')
		}
	}
}

// 导出工厂函数
export const buildInfo = createPluginFactory(BuildInfoPlugin)
```
