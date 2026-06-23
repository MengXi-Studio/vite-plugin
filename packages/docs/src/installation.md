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

## uni-app 插件市场

如果你使用 uni-app 项目，可以通过插件市场一键安装：

[插件市场地址](https://ext.dcloud.net.cn/plugin?id=26652)

## 快速开始

### 使用内置插件

```typescript
import { defineConfig } from 'vite'
import {
	assetManifest,
	buildProgress,
	bundleAnalyzer,
	compressAssets,
	copyFile,
	envGuard,
	faviconManager,
	generateRouter,
	generateVersion,
	htmlInject,
	imageOptimizer,
	loadingManager,
	proxyManager,
	versionUpdateChecker,
	autoImport
} from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// 资源清单生成
		assetManifest(),

		// 自动导入
		autoImport({
			imports: { vue: ['*'] },
			dts: 'src/auto-imports.d.ts',
			vueTemplate: true
		}),

		// 构建进度条
		buildProgress(),

		// 构建产物体积分析
		bundleAnalyzer({
			outputFormat: 'both',
			sizeThreshold: 200
		}),

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

		// 环境变量校验
		envGuard({
			required: {
				VITE_API_URL: { type: 'url', required: true }
			}
		}),

		// 生成路由配置（uni-app）
		generateRouter({
			pagesJsonPath: 'src/pages.json',
			outputPath: 'src/router.config.ts',
			dts: true
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

		// 图片优化
		imageOptimizer({
			quality: 80,
			convert: { webp: { quality: 80 } }
		}),

		// 全局 Loading 状态管理
		loadingManager({
			defaultVisible: true,
			autoHideOn: 'DOMContentLoaded'
		}),

		// 开发代理管理
		proxyManager({
			rules: {
				'/api': { target: 'http://localhost:3000', changeOrigin: true }
			}
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
import { bundleAnalyzer } from '@meng-xi/vite-plugin/plugins/bundle-analyzer'
import { compressAssets } from '@meng-xi/vite-plugin/plugins/compress-assets'
import { copyFile } from '@meng-xi/vite-plugin/plugins/copy-file'
import type { CompressAssetsOptions } from '@meng-xi/vite-plugin/plugins/compress-assets'
```

### 使用通用工具模块

```typescript
import { formatFileSize, parseTemplate, formatDate, copySourceToTarget, scanDirectory, writeFileSyncSafely, escapeHtmlAttr } from '@meng-xi/vite-plugin'

// 文件大小格式化
formatFileSize(1024 * 1024) // '1.00MB'

// 模板变量替换
parseTemplate('Hello {{name}}!', { name: 'World' }) // 'Hello World!'

// 日期格式化
formatDate(new Date(), '{YYYY}-{MM}-{DD}') // '2026-06-06'

// 复制文件（支持增量复制）
const result = await copySourceToTarget('src/assets', 'dist/assets', {
	recursive: true,
	overwrite: true,
	incremental: true
})

// 扫描目录
const files = await scanDirectory('src', {
	includeExtensions: ['.ts', '.js'],
	excludePatterns: ['node_modules']
})

// 同步安全写入文件（自动创建目录）
writeFileSyncSafely('src/auto-imports.d.ts', 'declare global { ... }')

// HTML 属性值转义
escapeHtmlAttr('hello "world"') // 'hello &quot;world&quot;'
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

- [assetManifest](/plugins/asset-manifest) - 资源清单生成
- [autoImport](/plugins/auto-import) - 自动导入
- [buildProgress](/plugins/build-progress) - 构建进度展示
- [bundleAnalyzer](/plugins/bundle-analyzer) - 构建产物体积分析
- [compressAssets](/plugins/compress-assets) - 构建产物压缩
- [copyFile](/plugins/copy-file) - 文件复制
- [envGuard](/plugins/env-guard) - 环境变量校验
- [faviconManager](/plugins/favicon-manager) - 网站图标管理
- [generateRouter](/plugins/generate-router) - 路由生成
- [generateVersion](/plugins/generate-version) - 版本管理
- [htmlInject](/plugins/html-inject) - HTML 内容注入
- [imageOptimizer](/plugins/image-optimizer) - 图片优化
- [loadingManager](/plugins/loading-manager) - 全局 Loading 状态管理
- [proxyManager](/plugins/proxy-manager) - 开发代理管理
- [versionUpdateChecker](/plugins/version-update-checker) - 版本更新检测
