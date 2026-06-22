# generateRouter

根据 uni-app 的 `pages.json` 自动生成路由配置文件和 TypeScript 类型声明，支持多种命名策略、元信息映射、路由修改保留和文件监听。

## 导入

```typescript
import { generateRouter } from '@meng-xi/vite-plugin'
// 或子模块导入
import { generateRouter } from '@meng-xi/vite-plugin/plugins/generate-router'
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
| nameStrategy         | `NameStrategy`                 | `'camelCase'`            | 路由名称生成策略         |
| includeSubPackages   | `boolean`                      | `true`                   | 包含子包路由             |
| dts                  | `string \| boolean`            | `false`                  | 路由类型声明文件输出路径 |
| preserveRouteChanges | `boolean`                      | `true`                   | 保留用户对路由配置的修改 |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### 高级选项

| 选项                | 类型                       | 默认值             | 说明                     |
| ------------------- | -------------------------- | ------------------ | ------------------------ |
| outputFormat        | `'ts' \| 'js'`             | `'ts'`             | 输出文件格式             |
| customNameGenerator | `(path: string) => string` | -                  | 自定义名称生成函数       |
| watch               | `boolean`                  | `true`             | 监听文件变化自动重新生成 |
| metaMapping         | `Record<string, string>`   | 见下方             | style 字段到 meta 的映射 |
| exportTypes         | `boolean`                  | `true`             | 导出类型定义（仅 TS）    |
| fileHeader          | `boolean`                  | `false`            | 是否在文件顶部添加注释头 |

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

### pages.json 中的 meta 对象

`pages.json` 中页面配置对象的 `meta` 字段会直接合并到路由的 `meta` 中，且**优先级高于 `metaMapping` 映射**。

```json
{
  "pages": [
    {
      "path": "pages/user/profile",
      "style": { "navigationBarTitleText": "个人中心" },
      "meta": { "requireAuth": true, "customField": "value" }
    }
  ]
}
```

上述配置中，`meta.requireAuth` 和 `meta.customField` 会直接写入路由 meta，`style.navigationBarTitleText` 通过 `metaMapping` 映射为 `title`。当两者存在同名字段时，`meta` 对象的值优先。

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

## 类型导出

### RouteMeta

路由附加的元数据，支持通过索引签名扩展自定义字段。

| 属性         | 类型      | 说明                                     |
| ------------ | --------- | ---------------------------------------- |
| title        | `string`  | 页面标题，对应 `navigationBarTitleText`  |
| isTab        | `boolean` | 是否为 TabBar 页面，由插件自动推断       |
| requireAuth  | `boolean` | 是否需要登录才能访问                     |
| `[key: any]` | `any`     | 自定义扩展字段                           |

### RouteConfig

单条路由的完整配置。

| 属性        | 类型      | 说明                                       |
| ----------- | --------- | ------------------------------------------ |
| path        | `string`  | 路由路径，以 `/` 开头                      |
| name        | `string`  | 路由名称，根据 `nameStrategy` 自动生成     |
| meta        | `RouteMeta` | 路由元信息                               |
| `[key: any]` | `any`    | 用户自定义扩展属性（如 `beforeEnter` 等）  |

### NameStrategy

路由名称生成策略类型：`'path' | 'camelCase' | 'pascalCase' | 'custom'`

### OutputFormat

输出文件格式类型：`'ts' | 'js'`

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

### 生成路由类型声明

```typescript
generateRouter({ dts: true }) // 使用默认路径 src/router.d.ts

// 或自定义路径
generateRouter({ dts: 'src/types/router.d.ts' })
```

### 添加文件注释头

```typescript
generateRouter({ fileHeader: true })
// 生成的文件顶部包含插件名称、生成日期和版本号
```

## 输出示例

```typescript
export interface RouteMeta {
  title?: string
  isTab?: boolean
  requireAuth?: boolean
  [key: string]: any
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
- TabBar 页面自动添加 `isTab: true` 到 meta 中
- 支持解析带注释的 `pages.json`
- 开发模式下 `watch: true` 会监听 `pages.json` 变化并自动重新生成
- `preserveRouteChanges` 通过读取已有路由文件并合并用户修改，确保手动添加的内容不被覆盖
