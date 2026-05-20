# 安装

## 包管理器

::: code-group

```bash [npm]
npm install @meng-xi/vite-plugin -D
```

```bash [yarn]
yarn add @meng-xi/vite-plugin -D
```

```bash [pnpm]
pnpm add @meng-xi/vite-plugin -D
```

:::

## 快速开始

### 使用内置插件

```typescript
import { defineConfig } from 'vite'
import { buildProgress, copyFile, generateRouter, generateVersion, injectIco, injectLoading } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// 构建进度条
		buildProgress(),

		// 复制文件
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),

		// 生成路由配置（uni-app）
		generateRouter({
			pagesJsonPath: 'src/pages.json',
			outputPath: 'src/router.config.ts'
		}),

		// 生成版本号
		generateVersion({
			format: 'datetime',
			outputType: 'both'
		}),

		// 注入网站图标
		injectIco({
			base: '/assets'
		}),

		// 注入全局 Loading
		injectLoading({
			defaultVisible: true,
			autoHideOn: 'DOMContentLoaded'
		})
	]
})
```

### 开发自定义插件

```typescript
import { BasePlugin, createPluginFactory } from '@meng-xi/vite-plugin'
import type { BasePluginOptions } from '@meng-xi/vite-plugin/factory'
import type { Plugin } from 'vite'

interface MyPluginOptions extends BasePluginOptions {
	message: string
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
	protected getDefaultOptions() {
		return { message: 'Hello' }
	}

	protected validateOptions(): void {
		this.validator.field('message').required().string().validate()
	}

	protected getPluginName(): string {
		return 'my-plugin'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.buildStart = () => {
			this.logger.info(this.options.message)
		}
	}
}

export const myPlugin = createPluginFactory(MyPlugin)
```

## 下一步

- [buildProgress](/plugins/build-progress) - 构建进度展示
- [copyFile](/plugins/copy-file) - 文件复制
- [generateRouter](/plugins/generate-router) - 路由生成
- [generateVersion](/plugins/generate-version) - 版本管理
- [injectIco](/plugins/inject-ico) - 图标注入
- [injectLoading](/plugins/inject-loading) - 全局 Loading 状态管理
