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
import { buildProgress, compressAssets, copyFile, faviconManager, generateRouter, generateVersion, htmlInject, loadingManager, versionUpdateChecker } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// 构建进度条
		buildProgress(),

		// 构建产物压缩
		compressAssets({
			algorithm: 'gzip',
			threshold: 1024,
			deleteOriginalFile: false
		}),

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
		faviconManager({
			base: '/assets'
		}),

		// HTML 内容注入
		htmlInject({
			rules: [
				{
					id: 'meta-description',
					content: '<meta name="description" content="My App">',
					position: 'head-end'
				}
			]
		}),

		// 全局 Loading 状态管理
		loadingManager({
			defaultVisible: true,
			autoHideOn: 'DOMContentLoaded'
		}),

		// 版本更新检测
		versionUpdateChecker({
			checkInterval: 300000
		})
	]
})
```

### 子模块独立导入

每个插件都支持从子路径独立导入，可以获得更好的 Tree-shaking 效果：

```typescript
import { buildProgress } from '@meng-xi/vite-plugin/plugins/build-progress'
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress-assets'
import { copyFile } from '@meng-xi/vite-plugin/plugins/copy-file'
import type { CompressAssetsOptions } from '@meng-xi/vite-plugin/plugins/compress-assets'
```

### 使用通用工具模块

```typescript
import { formatDate, deepMerge, copySourceToTarget } from '@meng-xi/vite-plugin'

// 日期格式化
formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 深度合并对象
const merged = deepMerge(defaultConfig, userConfig)

// 复制文件（支持增量复制和并发控制）
const result = await copySourceToTarget('src/assets', 'dist/assets', {
	recursive: true,
	overwrite: true,
	incremental: true
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
- [compressAssets](/plugins/compress-assets) - 构建产物压缩
- [copyFile](/plugins/copy-file) - 文件复制
- [faviconManager](/plugins/favicon-manager) - 网站图标管理
- [generateRouter](/plugins/generate-router) - 路由生成
- [generateVersion](/plugins/generate-version) - 版本管理
- [htmlInject](/plugins/html-inject) - HTML 内容注入
- [loadingManager](/plugins/loading-manager) - 全局 Loading 状态管理
- [versionUpdateChecker](/plugins/version-update-checker) - 版本更新检测
