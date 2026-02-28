# generateRouter 插件

`generateRouter` 插件用于根据 uni-app 项目的 `pages.json` 文件自动生成路由配置文件，支持多种命名策略和配置选项。

## 功能特性

- 自动解析 uni-app 的 `pages.json` 文件
- 支持主包和子包页面
- 自动识别 tabBar 页面
- 支持多种路由名称生成策略（camelCase、pascalCase、path、custom）
- 支持自定义元信息字段映射
- 开发模式下自动监听 `pages.json` 变化并重新生成
- 支持输出 TypeScript 或 JavaScript 文件
- 生成类型定义和辅助函数
- 支持启用/禁用插件
- 提供灵活的错误处理机制

## 基本用法

### 简单配置

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [generateRouter()]
})
```

### 完整配置

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateRouter({
			pagesJsonPath: 'src/pages.json',
			outputPath: 'src/router.config.ts',
			outputFormat: 'ts',
			nameStrategy: 'camelCase',
			includeSubPackages: true,
			watch: true,
			exportTypes: true,
			metaMapping: {
				navigationBarTitleText: 'title',
				requireAuth: 'requireAuth'
			},
			enabled: true,
			verbose: true,
			errorStrategy: 'throw'
		})
	]
})
```

## 配置选项

| 选项                | 类型                         | 默认值                 | 描述                                                              |
| ------------------- | ---------------------------- | ---------------------- | ----------------------------------------------------------------- |
| pagesJsonPath       | string                       | 'src/pages.json'       | pages.json 文件路径（相对于项目根目录）                           |
| outputPath          | string                       | 'src/router.config.ts' | 输出文件路径（相对于项目根目录）                                  |
| outputFormat        | 'ts' \| 'js'                 | 'ts'                   | 输出文件格式                                                      |
| nameStrategy        | NameStrategy                 | 'camelCase'            | 路由名称生成策略                                                  |
| customNameGenerator | function                     | -                      | 自定义路由名称生成函数，仅当 nameStrategy 为 'custom' 时有效      |
| includeSubPackages  | boolean                      | true                   | 是否包含子包路由                                                  |
| watch               | boolean                      | true                   | 是否监听 pages.json 变化并自动重新生成                            |
| metaMapping         | object                       | 见下方                 | 页面 style 字段到路由 meta 的映射                                 |
| headerComment       | string                       | 见下方                 | 生成的文件头部注释                                                |
| exportTypes         | boolean                      | true                   | 是否导出类型定义（仅 TypeScript）                                 |
| enabled             | boolean                      | true                   | 是否启用插件                                                      |
| verbose             | boolean                      | true                   | 是否显示详细日志                                                  |
| errorStrategy       | 'throw' \| 'log' \| 'ignore' | 'throw'                | 错误处理策略：'throw' 抛出错误，'log' 记录日志，'ignore' 忽略错误 |

### 路由名称生成策略 (NameStrategy)

| 策略       | 说明           | 示例路径            | 生成名称           |
| ---------- | -------------- | ------------------- | ------------------ |
| camelCase  | 驼峰命名       | /pages/user/profile | pagesUserProfile   |
| pascalCase | 帕斯卡命名     | /pages/user/profile | PagesUserProfile   |
| path       | 路径转下划线   | /pages/user/profile | pages_user_profile |
| custom     | 自定义生成函数 | -                   | -                  |

### 默认元信息映射

```typescript
{
	navigationBarTitleText: 'title',
	requireAuth: 'requireAuth'
}
```

### 默认头部注释

```typescript
'/* eslint-disable */\n// 此文件由 generateRouter 插件自动生成，请勿手动修改'
```

## 示例

### 基本使用

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [generateRouter()]
})
```

### 输出 JavaScript 文件

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateRouter({
			outputFormat: 'js',
			outputPath: 'src/router.config.js'
		})
	]
})
```

### 使用帕斯卡命名策略

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateRouter({
			nameStrategy: 'pascalCase'
		})
	]
})
```

### 自定义路由名称生成

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateRouter({
			nameStrategy: 'custom',
			customNameGenerator: path => `route_${path.replace(/\//g, '_')}`
		})
	]
})
```

### 自定义元信息映射

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateRouter({
			metaMapping: {
				navigationBarTitleText: 'title',
				requireAuth: 'requireAuth',
				customField: 'custom'
			}
		})
	]
})
```

### 禁用子包

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateRouter({
			includeSubPackages: false
		})
	]
})
```

### 根据环境启用

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateRouter({
			enabled: process.env.NODE_ENV === 'development'
		})
	]
})
```

## 输出文件格式

生成的路由配置文件包含以下内容：

### TypeScript 输出示例

```typescript
/* eslint-disable */
// 此文件由 generateRouter 插件自动生成，请勿手动修改

/**
 * 路由元信息
 */
export interface RouteMeta {
	/** 页面标题 */
	title?: string
	/** 是否为TabBar页面 */
	isTab?: boolean
	/** 是否需要登录 */
	requireAuth?: boolean
	/** 自定义扩展字段 */
	[key: string]: unknown
}

/**
 * 路由配置项
 */
export interface RouteConfig {
	/** 路由路径 */
	path: string
	/** 路由名称（用于命名路由导航） */
	name?: string
	/** 路由元信息 */
	meta?: RouteMeta
}

/**
 * 路由配置列表
 * @description 由 pages.json 自动生成
 */
export const routes: RouteConfig[] = [
	{
		path: '/pages/index/index',
		name: 'pagesIndexIndex',
		meta: {
			title: '首页',
			isTab: true
		}
	},
	{
		path: '/pages/user/profile',
		name: 'pagesUserProfile',
		meta: {
			title: '个人中心',
			requireAuth: true
		}
	}
]

/**
 * 根据路由名称获取路由配置
 */
export function getRouteByName(name: string): RouteConfig | undefined {
	return routes.find(route => route.name === name)
}

/**
 * 根据路由路径获取路由配置
 */
export function getRouteByPath(path: string): RouteConfig | undefined {
	return routes.find(route => route.path === path)
}

/**
 * 获取所有 TabBar 页面路由
 */
export function getTabBarRoutes(): RouteConfig[] {
	return routes.filter(route => route.meta?.isTab === true)
}

/**
 * 获取需要登录的页面路由
 */
export function getAuthRoutes(): RouteConfig[] {
	return routes.filter(route => route.meta?.requireAuth === true)
}

export default routes
```

## 注意事项

- 插件会在 Vite 配置解析完成后生成路由配置
- 当 `nameStrategy` 为 `'custom'` 时，必须提供 `customNameGenerator` 函数
- 开发模式下默认启用文件监听，`pages.json` 变化时自动重新生成
- 生成的文件会包含 ESLint 禁用注释，避免格式化冲突
- TabBar 页面会自动添加 `isTab: true` 元信息
- 当 `enabled` 为 `false` 时，插件不会执行任何操作
- `errorStrategy` 选项决定了错误处理方式：
  - `'throw'`：抛出错误，中断构建流程
  - `'log'`：记录错误日志，但不中断构建
  - `'ignore'`：忽略错误，继续执行
- 支持 `pages.json` 中的注释（会自动移除后解析）
