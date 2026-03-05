# generateRouter

根据 uni-app 的 `pages.json` 自动生成路由配置文件。

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
| preserveRouteChanges | `boolean`                      | `true`                   | 保留用户对 routes 的修改 |
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
