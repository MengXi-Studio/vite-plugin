# generateUni

**组合入口插件**：将「扫描页面 → 生成 `pages.json`」与「读 `pages.json` → 生成路由配置」编排为一条流水线，一条流水线完成 uni-app 的页面配置与路由配置生成，**内存数据直传不重复读盘**。

::: tip 与 generatePages / generateRouter 的关系
`generateUni` 等价于 `generatePages` + `generateRouter` 连用，但两阶段通过**内存中的 pages 数据**串联，避免「先写盘再读盘」的中间产物往返。原有两个插件保持不变，仍可单独使用。
:::

## 导入

```typescript
import { generateUni } from '@meng-xi/vite-plugin'
// 或子模块导入
import { generateUni } from '@meng-xi/vite-plugin/plugins/generate/generate-uni'
```

## 快速开始

顶层配置两阶段共用的 `pagesJsonPath` 与 `watch`；`pages` 子对象为阶段一（页面生成）参数，`router` 子对象为阶段二（路由生成）参数。

```typescript
import { defineConfig } from 'vite'
import { generateUni } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    generateUni({
      pagesJsonPath: 'src/pages.json',
      pages: {
        pagesDir: 'src/pages',
        subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }],
        entryPage: 'pages/index/index',
        tabBar: { color: '#999999', selectedColor: '#42b883' }
      },
      router: {
        outputPath: 'src/router.config.ts',
        nameStrategy: 'camelCase',
        dts: 'src/router.d.ts'
      }
    })
  ]
})
```

页面配置仍通过页面内 `<route-config>` 自定义块就近声明，与 `generatePages` 完全一致：

```vue
<!-- src/pages/index/index.vue -->
<route-config>
{
  "title": "首页",
  "isTab": true,
  "tab": { "order": 0 }
}
</route-config>
```

## 配置选项

| 选项 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------ | ---- |
| pagesJsonPath | `string` | `'src/pages.json'` | pages.json 文件路径（两阶段共用） |
| watch | `boolean` | `true` | 监听页面目录变更自动重新执行整条流水线 |
| pages | [`GeneratePagesOptions`](/plugins/generate-pages) | `{ pagesDir: 'src/pages', subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }] }` | 阶段一参数：扫描页面 + `<route-config>` 生成 pages.json（`pagesDir` / `subPackages` / `routeConfigBlock` / `entryPage` / `titleFallback` / `tabBar` / `includeExtensions` / `excludePatterns`） |
| router | [`GenerateRouterOptions`](/plugins/generate-router) | `{ outputPath: 'src/router.config.ts' }` | 阶段二参数：基于 pages.json 生成路由配置（`outputPath` / `outputFormat` / `nameStrategy` / `metaMapping` / `exportTypes` / `preserveRouteChanges` / `headerTemplate` / `customFields` / `dts` / `includeSubPackages`） |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`verbose`、`errorStrategy`

`pages` / `router` 两个子对象支持对应独立插件的**全部配置项**，详细说明分别见 [generatePages](/plugins/generate-pages) 与 [generateRouter](/plugins/generate-router)。

## 流水线说明

```
generateUni(options)
   │
   ├─ Phase 1（页面阶段）
   │    扫描页面目录 + <route-config> ──► 内存 pages 数据（pages/subPackages/tabBar）
   │    合并现有 pages.json（保留 globalStyle 等非页面字段）─► 写入 pages.json
   │                      │
   │                      └──► 内存 pages 对象（直传，不重新读盘）
   ▼
   ├─ Phase 2（路由阶段）
        parsePagesJson(pages 对象) ──► routes
        mergeRoutes（保留用户修改）──► router.config.ts（+ 可选 dts）
```

- `pages.json` 仍会写盘（`uni()` 与构建流程需要该文件），但路由阶段直接消费内存中的 pages 对象，不再读盘回灌
- 只用一个 `watch` 监听页面目录，变更时**串行**重跑「阶段一 + 阶段二」，避免并发读写竞态
- `<route-config>` 自定义块的虚拟模块请求会被插件拦截为空模块，避免构建时被当作 JavaScript 解析

## 从两个插件迁移

原使用 `generatePages` + `generateRouter` 的配置，等价替换为 `generateUni`：

```typescript
// 之前
generatePages({ pagesDir: 'src/pages', entryPage: 'pages/index/index', tabBar: {...} }),
generateRouter({ outputPath: 'src/router.config.ts', nameStrategy: 'camelCase', dts: true })

// 之后
generateUni({
  pages: { pagesDir: 'src/pages', entryPage: 'pages/index/index', tabBar: {...} },
  router: { outputPath: 'src/router.config.ts', nameStrategy: 'camelCase', dts: true }
})
```

## 注意事项

- 顶层 `pagesJsonPath` / `watch` 会覆盖 `pages` 子对象中的同名配置
- 开发模式下监听主包与分包页面目录，新增 / 删除 / 修改页面自动重新生成 `pages.json` 与路由配置
- 阶段二的路由合并、类型声明等行为与 `generateRouter` 完全一致（含 `preserveRouteChanges` 保留用户修改）
