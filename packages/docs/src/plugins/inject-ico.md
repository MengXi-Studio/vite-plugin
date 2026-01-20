# injectIco 插件

`injectIco` 插件用于在 Vite 构建过程中注入网站图标链接到 HTML 文件的头部，支持多种配置选项。

## 功能特性

- 在 Vite 构建过程中转换 HTML 入口文件，注入网站图标链接
- 在 Vite 构建完成后执行图标文件复制（当配置了 copyOptions 时）
- 支持多种图标配置方式（base、url、link、icons、copyOptions）
- 支持图标文件复制功能
- 支持启用/禁用插件
- 支持详细日志输出
- 支持自定义图标数组
- 提供错误处理机制，确保构建流程能捕获到错误

## 基本用法

### 字符串形式（视为 base 路径）

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [injectIco('/assets')]
})
```

### 基本配置（base + 默认 favicon.ico）

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets'
		})
	]
})
```

### 完整配置

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			enabled: true,
			verbose: true,
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons',
				overwrite: true,
				recursive: true
			}
		})
	]
})
```

## 配置选项

| 选项        | 类型    | 默认值    | 描述                                                                |
| ----------- | ------- | --------- | ------------------------------------------------------------------- |
| base        | string  | /         | 图标文件的基础路径，默认为根路径 `/`                                |
| url         | string  | undefined | 图标的完整 URL，如果提供则优先使用（覆盖 base + favicon.ico）       |
| link        | string  | undefined | 自定义的完整 link 标签 HTML，如果提供则优先使用（覆盖 url 和 base） |
| icons       | array   | undefined | 自定义图标数组，支持多种图标格式和尺寸                              |
| verbose     | boolean | true      | 是否显示详细日志                                                    |
| enabled     | boolean | true      | 是否启用插件                                                        |
| copyOptions | object  | undefined | 图标文件复制配置，当提供时会执行图标文件复制                        |

### copyOptions 配置

| 选项      | 类型    | 默认值 | 描述                                             |
| --------- | ------- | ------ | ------------------------------------------------ |
| sourceDir | string  | 必填   | 图标源文件目录，用于复制图标到打包目录           |
| targetDir | string  | 必填   | 图标目标目录（打包目录），用于复制图标到打包目录 |
| overwrite | boolean | true   | 是否覆盖同名文件                                 |
| recursive | boolean | true   | 是否支持递归复制                                 |

## 示例

### 基本使用

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [injectIco({ base: '/assets' })]
})
```

### 自定义图标

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			icons: [
				{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
				{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
				{ rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
			]
		})
	]
})
```

### 带文件复制功能

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons'
			}
		})
	]
})
```

### 带完整复制配置的使用

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons',
				overwrite: false,
				recursive: true
			}
		})
	]
})
```

### 关闭日志输出

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			verbose: false,
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons'
			}
		})
	]
})
```

### 根据环境启用

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			enabled: process.env.NODE_ENV === 'production',
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons'
			}
		})
	]
})
```

### 禁用插件

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		injectIco({
			base: '/assets',
			enabled: false,
			copyOptions: {
				sourceDir: 'src/assets/icons',
				targetDir: 'dist/assets/icons'
			}
		})
	]
})
```

## 注意事项

- 插件会在 Vite 构建过程中转换 HTML 入口文件，注入网站图标链接
- 插件会在 Vite 构建完成后执行图标文件复制（当配置了 copyOptions 时）
- 如果提供了 `link` 选项，会优先使用该选项，忽略其他配置
- 如果提供了 `icons` 选项，会使用该选项生成图标标签，忽略 `url` 和 `base`
- 如果提供了 `url` 选项，会使用该选项生成标准 link 标签，忽略 `base`
- 如果只提供了 `base` 选项，会使用 `base + favicon.ico` 生成 link 标签
- 当提供了 `copyOptions` 时，会将图标文件从源目录复制到目标目录
- 当 `enabled` 为 `false` 时，插件不会执行任何操作
- 插件会抛出错误，确保构建流程能捕获到错误
- 当 `verbose` 为 `true` 时，会输出详细的执行日志，便于调试和问题排查
- 当未找到 `</head>` 标签时，插件会跳过图标注入并输出警告日志
