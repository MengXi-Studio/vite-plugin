# loadingManager

全局 Loading 状态管理插件，注入 Loading 状态管理代码到 HTML 中，支持自动拦截 fetch/XHR 请求、多种内置图标、自定义样式和生命周期回调。

## 导入

```typescript
import { loadingManager } from '@meng-xi/vite-plugin'
// 或子模块导入
import { loadingManager } from '@meng-xi/vite-plugin/plugins/loading-manager'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { loadingManager } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [loadingManager()]
})
```

## 配置选项

| 选项           | 类型                                       | 默认值                    | 说明                 |
| -------------- | ------------------------------------------ | ------------------------- | -------------------- |
| position       | `'center' \| 'top' \| 'bottom'`            | `'center'`                | Loading 显示位置     |
| spinnerType    | `'spinner' \| 'dots' \| 'pulse' \| 'bar'`  | `'spinner'`               | 内置图标类型         |
| defaultText    | `string`                                   | `'加载中...'`             | 默认显示文本         |
| autoBind       | `'fetch' \| 'xhr' \| 'all' \| 'none'`      | `'none'`                  | 自动绑定请求拦截模式 |
| defaultVisible | `boolean`                                  | `false`                   | 初始可见状态         |
| autoHideOn     | `'DOMContentLoaded' \| 'load' \| 'manual'` | `'DOMContentLoaded'`      | 自动隐藏时机         |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`logLevel`、`errorStrategy`

### 高级选项

| 选项           | 类型                                    | 默认值                  | 说明                 |
| -------------- | --------------------------------------- | ----------------------- | -------------------- |
| style          | [`LoadingStyle`](#loadingstyle)         | 见下方                  | 自定义样式配置       |
| transition     | [`TransitionConfig`](#transitionconfig) | `{ enabled: true, ... }` | 过渡动画配置        |
| minDisplayTime | [`MinDisplayTime`](#mindisplaytime)     | `{ enabled: true, ... }` | 最小显示时间配置    |
| delayShow      | [`DelayShow`](#delayshow)               | `{ enabled: true, ... }` | 延迟显示配置        |
| debounceHide   | [`DebounceHide`](#debouncehide)         | `{ enabled: false, ... }` | 防抖隐藏配置       |
| requestFilter  | [`RequestFilter`](#requestfilter)       | -                       | 请求过滤配置         |
| globalName     | `string`                                | `'__LOADING_MANAGER__'` | 全局变量名           |
| customTemplate | `string`                                | -                       | 自定义 HTML 模板     |
| callbacks      | [`LoadingCallbacks`](#loadingcallbacks) | -                       | 生命周期回调         |

### LoadingStyle

| 选项               | 类型      | 默认值                    | 说明                                                |
| ------------------ | --------- | ------------------------- | --------------------------------------------------- |
| overlayColor       | `string`  | `'rgba(255,255,255,0.7)'` | 遮罩层背景色                                        |
| spinnerColor       | `string`  | `'#4361ee'`               | 图标颜色                                            |
| spinnerSize        | `string`  | `'40px'`                  | 图标大小                                            |
| textColor          | `string`  | `'#333'`                  | 文本颜色                                            |
| textSize           | `string`  | `'14px'`                  | 文本大小                                            |
| customClass        | `string`  | -                         | 自定义 CSS 类名                                     |
| customStyle        | `string`  | -                         | 自定义内联样式字符串                                |
| zIndex             | `number`  | `9999`                    | z-index 值（必须为非负数）                          |
| pointerEvents      | `boolean` | `true`                    | 是否启用遮罩层指针事件（对应 CSS `pointer-events`） |
| backdropBlur       | `boolean` | `false`                   | 是否启用背景模糊                                    |
| backdropBlurAmount | `number`  | `4`                       | 模糊程度 px（必须为非负数）                         |

### TransitionConfig

| 选项     | 类型      | 默认值       | 说明               |
| -------- | --------- | ------------ | ------------------ |
| enabled  | `boolean` | `true`       | 是否启用过渡动画   |
| duration | `number`  | `200`        | 过渡持续时间（ms） |
| easing   | `string`  | `'ease-out'` | CSS 缓动函数       |

### MinDisplayTime

| 选项     | 类型      | 默认值 | 说明                         |
| -------- | --------- | ------ | ---------------------------- |
| enabled  | `boolean` | `true` | 是否启用                     |
| duration | `number`  | `300`  | 最小显示时间（ms），避免闪烁 |

### DelayShow

| 选项     | 类型      | 默认值 | 说明                                       |
| -------- | --------- | ------ | ------------------------------------------ |
| enabled  | `boolean` | `true` | 是否启用                                   |
| duration | `number`  | `200`  | 延迟时间（ms），请求在此时间内完成则不显示 |

### DebounceHide

| 选项     | 类型      | 默认值  | 说明                             |
| -------- | --------- | ------- | -------------------------------- |
| enabled  | `boolean` | `false` | 是否启用                         |
| duration | `number`  | `100`   | 防抖等待时间（ms），避免频繁闪烁 |

### RequestFilter

| 选项               | 类型       | 默认值 | 说明                                                 |
| ------------------ | ---------- | ------ | ---------------------------------------------------- |
| excludeUrls        | `RegExp[]` | -      | 排除的 URL 正则数组，匹配的 URL 不触发 loading       |
| includeUrls        | `RegExp[]` | -      | 包含的 URL 正则数组，仅匹配的 URL 触发（优先级更高） |
| excludeMethods     | `string[]` | -      | 排除的 HTTP 方法数组（不区分大小写）                 |
| excludeUrlPrefixes | `string[]` | -      | 排除的 URL 前缀数组（前缀匹配，比正则更高效）        |

### LoadingCallbacks

回调以**函数体字符串**形式提供，因为插件在构建时注入代码到浏览器端，无法直接传递函数引用。

| 选项         | 类型     | 默认值 | 说明                            |
| ------------ | -------- | ------ | ------------------------------- |
| onBeforeShow | `string` | -      | 显示前回调，`return false` 阻止 |
| onShow       | `string` | -      | 显示后回调                      |
| onBeforeHide | `string` | -      | 隐藏前回调，`return false` 阻止 |
| onHide       | `string` | -      | 隐藏后回调                      |
| onDestroy    | `string` | -      | 销毁时回调                      |

## 类型导出

### LoadingManager

注入到浏览器的全局管理器接口（默认 `window.__LOADING_MANAGER__`）。

| 方法                       | 说明                                                |
| -------------------------- | --------------------------------------------------- |
| `show(text?)`              | 显示 loading，可传入文本                            |
| `hide()`                   | 隐藏 loading（受 minDisplayTime/debounceHide 约束） |
| `forceHide()`              | 强制隐藏，忽略最小显示时间和防抖                    |
| `toggle(text?)`            | 切换显示/隐藏状态                                   |
| `enablePointerEvents()`    | 启用指针事件，遮罩层拦截所有点击和滚动              |
| `disablePointerEvents()`   | 禁用指针事件，允许交互穿透遮罩层                    |
| `togglePointerEvents()`    | 切换指针事件状态                                    |
| `updateText(t)`            | 更新文本内容                                        |
| `isVisible()`              | 获取当前是否显示                                    |
| `isPointerEventsEnabled()` | 获取当前指针事件是否启用                            |
| `getPendingCount()`        | 获取当前挂起的请求数量                              |
| `destroy()`                | 销毁实例，清理 DOM 和拦截器                         |

### LoadingPosition

显示位置类型：`'center' | 'top' | 'bottom'`

### SpinnerType

图标类型：`'spinner' | 'dots' | 'pulse' | 'bar'`

### AutoBindMode

自动绑定模式：`'fetch' | 'xhr' | 'all' | 'none'`

### AutoHideOn

自动隐藏时机：`'DOMContentLoaded' | 'load' | 'manual'`

## 示例

### 白屏 Loading

在页面白屏阶段即显示 loading，DOMContentLoaded 后自动隐藏：

```typescript
loadingManager({
  defaultVisible: true,
  autoHideOn: 'DOMContentLoaded'
})
```

### 自动拦截请求

```typescript
loadingManager({ autoBind: 'fetch' })
```

### 自动拦截所有请求（含过滤）

```typescript
loadingManager({
  autoBind: 'all',
  requestFilter: {
    excludeUrls: [/\/api\/health/, /\/static\//],
    excludeMethods: ['OPTIONS', 'HEAD'],
    excludeUrlPrefixes: ['http://localhost']
  }
})
```

### 自定义图标和样式

```typescript
loadingManager({
  spinnerType: 'dots',
  style: {
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    spinnerColor: '#fff',
    textColor: '#fff',
    backdropBlur: true,
    backdropBlurAmount: 8
  }
})
```

### 白屏 Loading（SPA）

```typescript
// 白屏阶段即显示，框架渲染完成后手动隐藏
loadingManager({
  defaultVisible: true,
  autoHideOn: 'manual'
})

// 在 Vue/React 应用入口处：
// window.__LOADING_MANAGER__.hide()
```

### 自定义模板

```typescript
loadingManager({
  customTemplate: '<div class="my-loader"><span data-loading-text>加载中</span></div>'
})
```

::: warning
自定义模板中必须包含一个具有 `data-loading-text` 属性的元素，否则 `updateText()` 将无法工作。
:::

### 生命周期回调

```typescript
loadingManager({
  callbacks: {
    onBeforeShow: 'console.log("about to show"); return true;',
    onShow: 'console.log("shown")',
    onBeforeHide: 'if (window.shouldKeepLoading) return false;',
    onHide: 'console.log("hidden")',
    onDestroy: 'console.log("destroyed")'
  }
})
```

### 交互控制

```typescript
// 允许交互穿透（loading 期间仍可操作页面）
loadingManager({ style: { pointerEvents: false } })

// 运行时动态切换
window.__LOADING_MANAGER__.enablePointerEvents()
window.__LOADING_MANAGER__.disablePointerEvents()
```

## 注意事项

- 当 `defaultVisible` 为 `true` 时，CSS 和 HTML 以静态标签形式注入到 `<head>` 中，确保白屏阶段即可显示，无需等待 JS 执行
- `autoHideOn` 仅在 `defaultVisible` 为 `true` 时生效
- `style.pointerEvents` 默认为 `true`（启用指针事件），loading 显示时阻止用户交互；设为 `false` 则允许点击穿透
- 回调以函数体字符串形式提供，运行时自动包裹 try-catch，回调中的错误不会影响 loading 正常功能
- `onBeforeShow` / `onBeforeHide` 中 `return false` 可阻止显示/隐藏
- `destroy()` 会清理 DOM 元素、恢复原始 fetch/XHR 拦截器，销毁后所有方法调用将被安全忽略
- `requestFilter` 中的正则表达式在构建时序列化，会正确保留 flags（如 `i`、`g`）
- `backdropBlurAmount` 和 `zIndex` 必须为非负数，否则配置验证会抛出错误
- 插件在 SSR 环境（`typeof window === 'undefined'`）中自动跳过执行
