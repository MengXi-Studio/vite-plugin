# 安装

`@meng-xi/vite-plugin` 支持通过命令行包管理器的方式安装。

## 包管理器

对于一个现有的使用 JavaScript 包管理器的 Vite 项目，你可以从 npm registry 中安装 @meng-xi/vite-plugin：

::: code-group

```bash [npm]
npm install @meng-xi/vite-plugin --save-dev
```

```bash [yarn]
yarn add @meng-xi/vite-plugin --save-dev
```

```bash [pnpm]
pnpm add @meng-xi/vite-plugin --save-dev
```

:::

## 基本使用

### 使用内置插件

```typescript
import { defineConfig } from 'vite'
import { copyFile, injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),
		injectIco({
			base: '/assets'
		})
	]
})
```

### 开发自定义插件

```typescript
import { BasePlugin, createPluginFactory, Validator } from '@meng-xi/vite-plugin'
import type { Plugin } from 'vite'

interface MyPluginOptions {
	path: string
	enabled?: boolean
	verbose?: boolean
	errorStrategy?: 'throw' | 'log' | 'ignore'
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getDefaultOptions() {
		return {
			path: './default'
		}
	}

	protected validateOptions(): void {
		this.validator.field('path').required().string().validate()
	}

	protected getPluginName(): string {
		return 'my-plugin'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.buildStart = () => {
			this.logger.info(`Plugin started with path: ${this.options.path}`)
		}
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

## 了解更多

查看 [GitHub 仓库](https://github.com/MengXi-Studio/vite-plugin) 获取更多信息和示例。
