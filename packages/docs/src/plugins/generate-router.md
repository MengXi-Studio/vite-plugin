# generateRouter

根据 uni-app 的 `pages.json` 自动生成路由配置文件和 TypeScript 类型声明。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { generateRouter } from '@meng-xi/vite-plugin/plugins/generate-router'
import type { GenerateRouterOptions, RouteConfig, RouteMeta, NameStrategy, OutputFormat } from '@meng-xi/vite-plugin/plugins/generate-router'

// barrel 导入
import { generateRouter } from '@meng-xi/vite-plugin'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { generateRouter } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [generateRouter()]
})
```

## 配置选项

| 选项                 | 类型                           | 默认值                   | 说明                     |
| -------------------- | ------------------------------ | ------------------------ | ------------------------ |
| pagesJsonPath        | `string`                       | `'src/pages.json'`       | pages.json 文件路径      |
| outputPath           | `string`                       | `'src/router.config.ts'` | 输出文件路径             |
| outputFormat         | `'ts' \| 'js'`                 | `'ts'`                   | 输出文件格式             |
| nameStrategy         | `NameStrategy`                 | `'camelCase'`            | 路由名称生成策略         |
| customNameGenerator  | `(path: string) => string`     | -                        | 自定义名称生成函数       |
| includeSubPackages   | `boolean`                      | `true`                   | 包含子包路由             |
| watch                | `boolean`                      | `true`                   | 监听文件变化自动重新生成 |
| metaMapping          | `Record<string, string>`       | 见下方                   | style 字段到 meta 的映射 |
| exportTypes          | `boolean`                      | `true`                   | 导出类型定义（仅 TS）    |
| preserveRouteChanges | `boolean`                      | `true`                   | 保留用户对路由配置的修改 |
| dts                  | `string \| boolean`            | `false`                  | 路由类型声明文件输出路径 |
| enabled              | `boolean`                      | `true`                   | 启用插件                 |
| verbose              | `boolean`                      | `true`                   | 显示详细日志             |
| errorStrategy        | `'throw' \| 'log' \| 'ignore'` | `'throw'`                | 错误处理策略             |

### 路由名称生成策略

| 策略       | 说明         | 示例路径              | 生成名称           |
| ---------- | ------------ | --------------------- | ------------------ |
| camelCase  | 驼峰命名     | `/pages/user/profile` | pagesUserProfile   |
| pascalCase | 帕斯卡命名   | `/pages/user/profile` | PagesUserProfile   |
| path       | 路径转下划线 | `/pages/user/profile` | pages_user_profile |
| custom     | 自定义函数   | -                     | -                  |

### 默认 metaMapping

```typescript
{
  navigationBarTitleText: 'title',
  requireAuth: 'requireAuth'
}
```

### preserveRouteChanges 路由修改保留

开启后，插件重新生成路由配置时会读取已有文件，合并用户对路由的修改，避免覆盖用户手动添加的内容。

**合并策略：**

| 字段 | 行为 |
| ---- | ---- |
| `path` | 始终以 `pages.json` 为准，不可覆盖 |
| `name` | 用户修改的值优先保留 |
| `meta` | 用户修改的值优先保留，`pages.json` 中新增的字段自动补充 |
| 非标准属性 | 用户添加的 `beforeEnter`、`component` 等自定义属性完整保留 |

**示例：** 假设 `pages.json` 新增了一个页面，且用户在已有路由上添加了 `beforeEnter`：

```typescript
// 用户手动修改后的路由配置
export const routes: RouteConfig[] = [
  {
    path: '/pages/index/index',
    name: 'pagesIndexIndex',
    meta: { title: '自定义标题' },
    beforeEnter: (to, from, next) => { next() }  // 用户添加的守卫
  }
]
```

重新生成后：

```typescript
export const routes: RouteConfig[] = [
  {
    path: '/pages/index/index',
    name: 'pagesIndexIndex',
    meta: { title: '自定义标题', isTab: true },  // 用户标题保留，新增 isTab 自动补充
    beforeEnter: (to, from, next) => { next() }   // 自定义属性保留
  },
  {
    path: '/pages/new/page',                       // 新增页面自动生成
    name: 'pagesNewPage',
    meta: { title: '新页面' }
  }
]
```

### dts 类型声明

控制是否生成路由类型声明文件（`.d.ts`），为 `@meng-xi/uni-router` 模块扩展 `RouteNameMap` 接口，实现类型安全的路由导航。

| 值       | 说明                           |
| -------- | ------------------------------ |
| `false`  | 不生成类型声明文件（默认）     |
| `true`   | 使用默认路径 `src/router.d.ts` |
| `string` | 在指定路径生成类型声明文件     |

生成的类型声明文件示例：

```typescript
import '@meng-xi/uni-router'

declare module '@meng-xi/uni-router' {
	interface RouteNameMap {
		/** 首页 */
		pagesIndexIndex: { path: '/pages/index/index'; meta: { title: string; isTab: true } }
		/** 个人中心 */
		pagesUserProfile: { path: '/pages/user/profile'; meta: { title: string; requireAuth: true } }
	}
}
```

## 示例

### 输出 JavaScript 文件

```typescript
generateRouter({
	outputFormat: 'js',
	outputPath: 'src/router.config.js'
})
```

### 自定义路由名称

```typescript
generateRouter({
	nameStrategy: 'custom',
	customNameGenerator: path => `route_${path.replace(/\//g, '_')}`
})
```

### 自定义 meta 映射

```typescript
generateRouter({
	metaMapping: {
		navigationBarTitleText: 'title',
		requireAuth: 'requireAuth',
		customField: 'custom'
	}
})
```

### 不包含子包

```typescript
generateRouter({
	includeSubPackages: false
})
```

### 生成路由类型声明

```typescript
generateRouter({
	dts: true // 使用默认路径 src/router.d.ts
})

// 或自定义路径
generateRouter({
	dts: 'src/types/router.d.ts'
})
```

## 输出示例

```typescript
export interface RouteMeta {
	title?: string
	isTab?: boolean
	requireAuth?: boolean
	[key: string]: unknown
}

export interface RouteConfig {
	path: string
	name?: string
	meta?: RouteMeta
}

export const routes: RouteConfig[] = [
	{
		path: '/pages/index/index',
		name: 'pagesIndexIndex',
		meta: { title: '首页', isTab: true }
	},
	{
		path: '/pages/user/profile',
		name: 'pagesUserProfile',
		meta: { title: '个人中心', requireAuth: true }
	}
]

export default routes
```

## 注意事项

- 当 `nameStrategy` 为 `'custom'` 时必须提供 `customNameGenerator`
- TabBar 页面自动添加 `isTab: true`
- `preserveRouteChanges: true` 时保留用户对 routes 数组的修改
- 支持解析带注释的 `pages.json`
