# generatePages

扫描 Vue 文件并动态生成 / 更新 uni-app 的 `pages.json` 页面相关配置（`pages` / `subPackages` / `tabBar`），配合页面内 `<route-config>` 自定义块彻底解放手动配置页面。

::: tip 与 generateRouter 的关系
`generateRouter` 是「读 `pages.json` → 生成路由配置」，`generatePages` 则是反向「扫描 Vue 文件 → 生成 `pages.json`」。二者可配合使用，也可单独使用。
:::

## 导入

```typescript
import { generatePages } from '@meng-xi/vite-plugin'
// 或子模块导入
import { generatePages } from '@meng-xi/vite-plugin/plugins/generate/generate-pages'
```

## 快速开始

默认扫描 `src/pages` 为主包、`src/pages-sub` 为分包，自动生成 `src/pages.json`。

```typescript
import { defineConfig } from 'vite'
import { generatePages } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [generatePages()]
})
```

在页面中通过 `<route-config>` 自定义块就近声明标题、meta、tabBar 归属等：

```vue
<!-- src/pages/index/index.vue -->
<route-config>
{
  "title": "首页",
  "isTab": true,
  "tab": {
    "iconPath": "static/tab/home.png",
    "selectedIconPath": "static/tab/home-active.png"
  }
}
</route-config>
```

生成的 `pages.json` 片段：

```json
{
  "pages": [
    { "path": "pages/index/index", "style": { "navigationBarTitleText": "首页" }, "meta": { "isTab": true } }
  ],
  "tabBar": {
    "color": "#999999",
    "list": [
      { "pagePath": "pages/index/index", "text": "首页", "iconPath": "static/tab/home.png", "selectedIconPath": "static/tab/home-active.png" }
    ]
  }
}
```

## 配置选项

| 选项            | 类型                          | 默认值                                    | 说明                         |
| --------------- | ----------------------------- | ----------------------------------------- | ---------------------------- |
| pagesJsonPath   | `string`                      | `'src/pages.json'`                        | pages.json 文件路径          |
| pagesDir        | `string`                      | `'src/pages'`                             | 主包页面目录                 |
| subPackages     | `SubPackageConfig[]`          | `[{ root: 'pages-sub', dir: 'src/pages-sub' }]` | 分包配置列表（目录不存在时跳过） |
| routeConfigBlock| `string`                      | `'route-config'`                          | 页面配置自定义块名称         |
| titleFallback   | `'filename' \| 'none'`        | `'filename'`                              | 标题缺失时的兜底策略         |
| tabBar          | `TabBarTemplate`              | -                                         | tabBar 模板（提供后才生成）  |
| includeExtensions| `string[]`                    | `['.vue']`                                | 页面文件扩展名列表           |
| excludePatterns | `string[]`                    | `['node_modules']`                        | 排除的路径模式列表           |
| watch           | `boolean`                     | `true`                                    | 监听页面目录变化自动重新生成 |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### subPackages 分包

`subPackages` 的 `root` 写入 `subPackages[].root`，`dir` 为实际源码目录。**`dir` 应与 `root` 对应的目录结构一致**（默认 `src/pages-sub` ↔ `pages-sub`），否则 uni-app 将无法找到分包文件。

```typescript
generatePages({
  subPackages: [
    { root: 'pages-sub', dir: 'src/pages-sub' },
    { root: 'pages-home', dir: 'src/pages-home' }
  ]
})
```

## route-config 自定义块

页面中通过 `<route-config>` 自定义块声明配置，内容为 JSON（支持注释）。

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| title | `string` | 页面标题，映射为 `style.navigationBarTitleText` |
| name | `string` | 页面名称，写入 pages.json 的 `name` 字段 |
| style | `object` | 页面样式，原样写入 `style` 字段 |
| meta | `object` | 页面元信息，原样写入 `meta` 字段 |
| isTab | `boolean` | 是否为 tabBar 页面，自动归集到 `tabBar.list` |
| tab | `TabBarItemOverride` | tabBar 图标与文本覆盖 |

```vue
<route-config>
{
  "title": "详情",
  "name": "DetailPage",
  "meta": { "requireAuth": true }
}
</route-config>
```

## tabBar 生成

提供 `tabBar` 模板后，插件将所有 `isTab: true` 的主包页面（tabBar 仅允许主包）自动归集到 `list`。

```typescript
generatePages({
  tabBar: {
    color: '#999999',
    selectedColor: '#42b883',
    iconPath: 'static/tab/home.png',           // 全局默认图标，所有 tab 项继承
    selectedIconPath: 'static/tab/home-active.png',
    overrides: {                                // 按页面路径逐项覆盖（可选）
      'pages/about/about': {
        text: '关于我们',
        iconPath: 'static/tab/about.png',
        selectedIconPath: 'static/tab/about-active.png'
      }
    }
  }
})
```

**图标与文本优先级（从高到低）：**

1. 页面内 `<route-config>.tab` 声明
2. `tabBar.overrides[pagePath]`
3. `tabBar.iconPath` / `selectedIconPath`（全局模板）
4. 页面标题 / 文件名（作为 text 兜底）

推荐将图标就近声明在页面内，工厂只需提供全局样式与默认图标：

```vue
<!-- src/pages/mine/mine.vue -->
<route-config>
{
  "title": "我的",
  "isTab": true,
  "tab": {
    "iconPath": "static/tab/mine.png",
    "selectedIconPath": "static/tab/mine-active.png"
  }
}
</route-config>
```

## 合并策略

插件「仅生成页面部分，其余保留」：

- **始终覆盖**：`pages`（主包页面）
- **有分包时覆盖**：`subPackages`；否则保留现有
- **提供模板时覆盖**：`tabBar`；否则保留现有
- **原样保留**：`globalStyle`、`condition`、`easycom` 等非页面字段

## 类型导出

### GeneratePagesOptions

插件配置项，见上文「配置选项」。

### RouteConfigBlock

`<route-config>` 块中可声明的页面配置（`title` / `name` / `style` / `meta` / `isTab` / `tab`）。

### TabBarTemplate

tabBar 模板（整体样式 + 全局图标 + `overrides` 覆盖）。

### TabBarItemOverride

单个 tabBar 项的 `text` / `iconPath` / `selectedIconPath` 覆盖。

### SubPackageConfig

分包配置：`root`（分包标识）+ `dir`（源码目录）。

## 示例

### 使用预设对应目录结构

```typescript
generatePages()
// 扫描 src/pages → pages，src/pages-sub → subPackages
```

### 自定义分包与 tabBar

```typescript
generatePages({
  pagesDir: 'src/pages',
  subPackages: [{ root: 'pages-sub', dir: 'src/pages-sub' }],
  tabBar: {
    color: '#999999',
    selectedColor: '#42b883',
    iconPath: 'static/tab.png',
    selectedIconPath: 'static/tab-active.png'
  }
})
```

## 注意事项

- 主包页面路径相对 `pages.json` 所在目录；分包页面路径相对分包目录，且分包 `dir` 应与 `root` 目录结构一致
- tabBar 页面仅允许在主包，分包中的 `isTab` 标记会被忽略
- 开发模式下 `watch: true` 会监听主包与分包目录，新增 / 删除 / 修改页面自动重新生成
- 生成结果按页面路径稳定排序，保证 `pages.json` 顺序在不同文件系统下一致
- 首次生成会自动创建 `pages.json` 所在目录