# versionUpdateChecker

版本更新检查器插件，在 Vite 构建过程中将版本更新检查代码注入到 HTML 中，运行时定期检查版本号变更，发现新版本时向用户显示刷新提示。

通常与 `generateVersion` 插件配合使用：`generateVersion` 负责在构建时生成版本号，`versionUpdateChecker` 负责在运行时检查版本号变更并提示用户刷新。

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { generateVersion, versionUpdateChecker } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		generateVersion({
			format: 'datetime',
			outputType: 'both',
			defineName: '__APP_VERSION__'
		}),
		versionUpdateChecker()
	]
})
```

## 配置选项

| 选项                    | 类型                             | 默认值                                     | 说明                       |
| ----------------------- | -------------------------------- | ------------------------------------------ | -------------------------- |
| versionSource           | `'define' \| 'file' \| 'auto'`   | `'auto'`                                   | 当前版本号的来源           |
| defineName              | `string`                         | `'__APP_VERSION__'`                        | define 模式下的全局变量名  |
| checkUrl                | `string`                         | `'/version.json'`                          | 版本检查文件的 URL 路径    |
| checkInterval           | `number`                         | `300000`                                   | 版本检查间隔时间（毫秒）   |
| checkOnVisibilityChange | `boolean`                        | `true`                                     | 页面可见性变化时是否检查   |
| enableInDev             | `boolean`                        | `false`                                    | 是否在开发模式下启用       |
| promptStyle             | `'modal' \| 'banner' \| 'toast'` | `'modal'`                                  | 更新提示 UI 样式           |
| promptMessage           | `string`                         | `'发现新版本，是否立即刷新获取最新内容？'` | 更新提示消息文本           |
| refreshButtonText       | `string`                         | `'立即刷新'`                               | 刷新按钮文本               |
| dismissButtonText       | `string`                         | `'稍后再说'`                               | 忽略按钮文本               |
| customPromptTemplate    | `string`                         | -                                          | 自定义提示 UI 的 HTML 模板 |
| customStyle             | `string`                         | -                                          | 自定义样式字符串           |
| onUpdateAvailable       | `string`                         | -                                          | 发现新版本时的回调         |
| onRefresh               | `string`                         | -                                          | 用户选择刷新时的回调       |
| onDismiss               | `string`                         | -                                          | 用户选择忽略时的回调       |
| enabled                 | `boolean`                        | `true`                                     | 启用插件                   |
| verbose                 | `boolean`                        | `true`                                     | 显示详细日志               |
| errorStrategy           | `'throw' \| 'log' \| 'ignore'`   | `'throw'`                                  | 错误处理策略               |

### 版本来源类型（versionSource）

| 值     | 说明                                   |
| ------ | -------------------------------------- |
| define | 从 Vite define 注入的全局变量中读取    |
| file   | 从版本文件（如 version.json）中读取    |
| auto   | 自动检测，优先使用 define，回退到 file |

### 提示样式（promptStyle）

| 值     | 说明                     |
| ------ | ------------------------ |
| modal  | 居中弹窗，需用户手动操作 |
| banner | 顶部横幅，可手动关闭     |
| toast  | 底部轻提示，可手动关闭   |

### 自定义模板占位符

当使用 `customPromptTemplate` 时，可使用以下占位符：

| 占位符               | 说明       |
| -------------------- | ---------- |
| `{{message}}`        | 提示消息   |
| `{{currentVersion}}` | 当前版本号 |
| `{{newVersion}}`     | 新版本号   |
| `{{refreshButton}}`  | 刷新按钮   |
| `{{dismissButton}}`  | 忽略按钮   |

### 回调函数

回调以**函数体字符串**形式提供，因为插件在构建时注入代码到浏览器端，无法直接传递函数引用。

| 选项              | 可用变量                       | 说明                                      |
| ----------------- | ------------------------------ | ----------------------------------------- |
| onUpdateAvailable | `currentVersion`, `newVersion` | 发现新版本时触发，`return false` 阻止提示 |
| onRefresh         | `currentVersion`, `newVersion` | 用户选择刷新时触发                        |
| onDismiss         | `currentVersion`, `newVersion` | 用户选择忽略时触发                        |

## 示例

### 基本使用

配合 `generateVersion` 插件使用：

```typescript
;(generateVersion({
	format: 'datetime',
	outputType: 'both',
	defineName: '__APP_VERSION__'
}),
	versionUpdateChecker())
```

### 自定义检查间隔和提示样式

```typescript
versionUpdateChecker({
	checkInterval: 60000, // 1 分钟检查一次
	promptStyle: 'banner' // 顶部横幅提示
})
```

### 自定义提示消息和回调

```typescript
versionUpdateChecker({
	promptMessage: '系统已更新，请刷新页面',
	onUpdateAvailable: 'console.log("新版本:", newVersion); return true;',
	onRefresh: 'console.log("用户选择刷新");',
	onDismiss: 'console.log("用户选择忽略");'
})
```

### 开发模式启用

```typescript
versionUpdateChecker({
	enableInDev: true,
	checkInterval: 10000
})
```

### 自定义 UI 模板

```typescript
versionUpdateChecker({
	customPromptTemplate: '<div class="my-update-prompt">{{message}} {{refreshButton}}</div>',
	customStyle: '.my-update-prompt { background: #333; color: #fff; padding: 16px; }'
})
```

### 使用 banner 样式

```typescript
versionUpdateChecker({
	promptStyle: 'banner',
	promptMessage: '有新版本可用',
	refreshButtonText: '更新',
	dismissButtonText: '关闭'
})
```

### 使用 toast 样式

```typescript
versionUpdateChecker({
	promptStyle: 'toast',
	promptMessage: '发现新版本',
	refreshButtonText: '刷新'
})
```

### 仅从文件读取版本号

```typescript
versionUpdateChecker({
	versionSource: 'file',
	checkUrl: '/version.json'
})
```

## 工作原理

1. 页面加载时，从全局变量（如 `__APP_VERSION__`）或 meta 标签读取当前版本号
2. 延迟 10 秒后首次检查，避免页面刚加载就弹出提示
3. 定期请求 `checkUrl`（默认 `/version.json`）获取最新版本号
4. 当版本号不一致时，根据 `onUpdateAvailable` 回调决定是否显示提示
5. 用户点击"立即刷新"后执行 `location.reload()`
6. 用户点击"稍后再说"后隐藏提示，本次会话不再提醒
7. 页面可见性变化时（如从其他标签页切回）立即检查更新

## 注意事项

- 该插件通常需要与 `generateVersion` 插件配合使用，确保 `version.json` 文件和全局变量正确生成
- `checkInterval` 最小值为 5000 毫秒（5 秒），低于此值会验证失败
- `customPromptTemplate` 不允许包含 `<script>` 标签（XSS 防护）
- 回调字符串不允许包含 `<script>` 标签
- `defineName` 必须是合法的 JavaScript 标识符，且不能是内置属性（如 `__proto__`、`constructor`、`prototype`）
- 默认在开发模式下不启用，可通过 `enableInDev: true` 开启
- 插件在 SSR 环境（`typeof window === 'undefined'`）中自动跳过执行
- 当 `versionSource` 为 `'file'` 或 `'auto'` 时，会在 `<head>` 中注入 `<meta name="app-version">` 标签
