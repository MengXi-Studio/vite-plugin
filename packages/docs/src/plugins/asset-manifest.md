# assetManifest

构建后自动扫描产物目录，生成资源映射清单（manifest），支持 Vite 标准、Webpack 兼容和自定义三种输出格式，支持按入口分组、运行时注入和自定义格式化。

## 导入

```typescript
import { assetManifest } from '@meng-xi/vite-plugin'
// 或子模块导入
import { assetManifest } from '@meng-xi/vite-plugin/plugins/asset-manifest'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { assetManifest } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [assetManifest()]
})
```

## 配置选项

| 选项              | 类型                               | 默认值                   | 说明                                     |
| ----------------- | ---------------------------------- | ------------------------ | ---------------------------------------- |
| outputFormat      | `'vite' \| 'webpack' \| 'custom'`  | `'vite'`                 | 清单输出格式                             |
| outputFile        | `string`                           | `'manifest.json'`        | 清单输出文件名，相对于构建输出目录       |
| publicPath        | `string`                           | `'/'`                    | 公共路径前缀，添加到所有资源路径前       |
| groupByEntry      | `boolean`                          | `false`                  | 是否按入口分组资源                       |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### 高级选项

| 选项              | 类型                      | 默认值                   | 说明                                     |
| ----------------- | ------------------------- | ------------------------ | ---------------------------------------- |
| includeExtensions | `string[]`                | `[]`                     | 包含的文件扩展名，为空则包含所有         |
| injectRuntime     | `boolean`                 | `false`                  | 是否将清单注入为运行时全局变量           |
| runtimeGlobalName | `string`                  | `'__ASSET_MANIFEST__'`   | 运行时全局变量名称                       |
| customFormatter   | `CustomFormatter \| null` | `null`                   | 自定义格式化器，仅 `outputFormat: 'custom'` 时生效 |
| excludeExtensions | `string[]`                | `['.map', '.gz', '.br']` | 排除的文件扩展名，优先级高于 include     |
| excludePaths      | `string[]`                | `[]`                     | 排除的路径模式列表                       |

### 输出格式

| 值      | 说明                                              |
| ------- | ------------------------------------------------- |
| vite    | Vite 标准格式，键为原始路径，值为带 hash 的输出路径 |
| webpack | Webpack 兼容格式，包含 entries 和 assets 嵌套结构  |
| custom  | 自定义格式，通过 `customFormatter` 回调生成        |

## 类型导出

### AssetMap

资源映射表，键为原始资源路径，值为带 hash 的输出路径。

```typescript
interface AssetMap {
  [key: string]: string
}
```

### AssetGroup

按入口分组的资源信息。

| 属性   | 类型                                               | 说明               |
| ------ | -------------------------------------------------- | ------------------ |
| entry  | `string`                                           | 入口名称           |
| assets | `{ js: string[], css: string[], other: string[] }` | 入口关联的资源分类 |

### AssetManifestResult

Vite 标准格式的清单输出。

| 属性       | 类型           | 说明                                           |
| ---------- | -------------- | ---------------------------------------------- |
| version    | `string`       | 清单版本号，固定为 `'1.0'`                     |
| timestamp  | `string`       | 生成时间戳（ISO 8601 格式）                    |
| publicPath | `string`       | 公共路径前缀                                   |
| assets     | `AssetMap`     | 资源映射表                                     |
| groups     | `AssetGroup[]` | 按入口分组的资源信息（仅 `groupByEntry` 时存在） |

### WebpackManifestOutput

Webpack 兼容格式的清单输出。

| 属性    | 类型                  | 说明                           |
| ------- | --------------------- | ------------------------------ |
| entries | `WebpackEntryAsset[]` | 所有入口的资源信息             |
| assets  | `AssetMap`            | 资源映射表（与 vite 格式相同） |

### CustomFormatter

自定义格式化器函数类型。

```typescript
type CustomFormatter = (manifest: AssetMap) => Record<string, any>
```

## 示例

### Webpack 兼容格式

```typescript
assetManifest({ outputFormat: 'webpack' })
```

### 按入口分组

```typescript
assetManifest({ groupByEntry: true })
```

分组策略：

- HTML 文件、以 `entry-` 或 `main` 开头的 JS 文件、根目录下的 JS 文件识别为入口
- 与入口共享目录前缀或名称前缀的 chunk 关联到对应入口（最长匹配）
- 未关联的资源归入 `_shared` 组

### 运行时注入

将清单注入为全局变量，运行时可通过 `window.__ASSET_MANIFEST__` 访问：

```typescript
assetManifest({
  injectRuntime: true,
  runtimeGlobalName: '__ASSET_MANIFEST__'
})

// 运行时
const manifest = window.__ASSET_MANIFEST__
console.log(manifest['assets/index.js']) // '/assets/index-abc123.js'
```

注入特点：

- 使用 `Object.defineProperty` 定义只读、不可配置的全局属性
- 使用 `Object.freeze` 冻结映射表，防止运行时篡改
- 对 JSON 字符串中的 `</script>` 进行转义，防止 XSS 攻击

### 自定义格式化器

```typescript
assetManifest({
  outputFormat: 'custom',
  customFormatter: assetMap => ({
    files: Object.keys(assetMap),
    mappings: assetMap
  })
})
```

### 自定义公共路径

```typescript
assetManifest({ publicPath: 'https://cdn.example.com/' })
// 输出: { "assets/index.js": "https://cdn.example.com/assets/index-abc123.js" }
```

### 文件过滤

```typescript
assetManifest({
  includeExtensions: ['.js', '.css'],
  excludeExtensions: ['.map', '.gz', '.br', '.woff2'],
  excludePaths: ['assets/images', 'assets/fonts']
})
```

过滤优先级：`excludeExtensions` > `includeExtensions` > `excludePaths`

## 输出示例

### Vite 格式

```json
{
  "version": "1.0",
  "timestamp": "2026-06-07T10:30:00.000Z",
  "publicPath": "/",
  "assets": {
    "assets/index.js": "/assets/index-abc123.js",
    "assets/index.css": "/assets/index-def456.css"
  }
}
```

### Webpack 格式

```json
{
  "entries": [
    { "name": "index", "files": ["/assets/index-abc123.js", "/assets/index-def456.css"] }
  ],
  "assets": {
    "assets/index.js": "/assets/index-abc123.js",
    "assets/index.css": "/assets/index-def456.css"
  }
}
```

## 注意事项

- 插件在 `writeBundle` 阶段执行（`enforce: 'post'`），确保在所有构建产物写入完成后扫描
- 自动排除 source map（`.map`）和压缩文件（`.gz`、`.br`）及清单输出文件自身
- 从带 hash 的文件路径中提取原始键名（如 `index-abc123.js` → `index.js`），hash 模式为 6-20 位十六进制字符
- 当多个文件映射到同一原始键名时（键名冲突），使用带 hash 的完整相对路径作为键
- `runtimeGlobalName` 必须是合法的 JavaScript 标识符，且不能是内置属性（如 `__proto__`、`constructor`）
- 运行时注入在 `writeBundle` 中完成（而非 `transformIndexHtml`），因为清单数据依赖扫描输出目录
