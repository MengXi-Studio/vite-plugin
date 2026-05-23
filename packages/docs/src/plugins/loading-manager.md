# injectLoading

在 Vite 构建过程中注入全局 Loading 状态管理代码，支持自动拦截 fetch/XHR 请求、多种内置图标、自定义样式和生命周期回调。

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { injectLoading } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [injectLoading()]
})
```

### 白屏 Loading

在页面白屏阶段即显示 loading，DOMContentLoaded 后自动隐藏：

```typescript
injectLoading({
	defaultVisible: true,
	autoHideOn: 'DOMContentLoaded'
})
```

### 自动拦截请求

自动拦截 fetch 请求，请求期间显示 loading，请求完成后自动隐藏：

```typescript
injectLoading({ autoBind: 'fetch' })
```

## 配置选项

| 选项           | 类型                                       | 默认值                    | 说明                 |
| -------------- | ------------------------------------------ | ------------------------- | -------------------- |
| position       | `'center' \| 'top' \| 'bottom'`            | `'center'`                | Loading 显示位置     |
| defaultText    | `string`                                   | `'加载中...'`             | 默认显示文本         |
| spinnerType    | `'spinner' \| 'dots' \| 'pulse' \| 'bar'`  | `'spinner'`               | 内置图标类型         |
| style          | [`LoadingStyle`](#loadingstyle)            | -                         | 自定义样式配置       |
| transition     | [`TransitionConfig`](#transitionconfig)    | `{ enabled: true, ... }`  | 过渡动画配置         |
| minDisplayTime | [`MinDisplayTime`](#mindisplaytime)        | `{ enabled: true, ... }`  | 最小显示时间配置     |
| delayShow      | [`DelayShow`](#delayshow)                  | `{ enabled: true, ... }`  | 延迟显示配置         |
| debounceHide   | [`DebounceHide`](#debouncehide)            | `{ enabled: false, ... }` | 防抖隐藏配置         |
| autoBind       | `'fetch' \| 'xhr' \| 'all' \| 'none'`      | `'none'`                  | 自动绑定请求拦截模式 |
| requestFilter  | [`RequestFilter`](#requestfilter)          | -                         | 请求过滤配置         |
| globalName     | `string`                                   | `'__LOADING_MANAGER__'`   | 全局变量名           |
| customTemplate | `string`                                   | -                         | 自定义 HTML 模板     |
| defaultVisible | `boolean`                                  | `false`                   | 初始可见状态         |
| autoHideOn     | `'DOMContentLoaded' \| 'load' \| 'manual'` | `'DOMContentLoaded'`      | 自动隐藏时机         |
| callbacks      | [`LoadingCallbacks`](#loadingcallbacks)    | -                         | 生命周期回调         |
| enabled        | `boolean`                                  | `true`                    | 启用插件             |
| verbose        | `boolean`                                  | `true`                    | 显示详细日志         |
| errorStrategy  | `'throw' \| 'log' \| 'ignore'`             | `'throw'`                 | 错误处理策略         |

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

## LoadingManager API

插件注入到浏览器的全局管理器（默认 `window.__LOADING_MANAGER__`），提供以下方法：

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

```typescript
// 显示 loading
window.__LOADING_MANAGER__.show()
window.__LOADING_MANAGER__.show('正在保存...')

// 隐藏 loading
window.__LOADING_MANAGER__.hide()

// 强制隐藏
window.__LOADING_MANAGER__.forceHide()

// 切换显示/隐藏
window.__LOADING_MANAGER__.toggle()
window.__LOADING_MANAGER__.toggle('正在加载...')

// 交互控制
window.__LOADING_MANAGER__.enablePointerEvents() // 启用指针事件（阻止交互）
window.__LOADING_MANAGER__.disablePointerEvents() // 禁用指针事件（允许穿透）
window.__LOADING_MANAGER__.togglePointerEvents() // 切换指针事件状态
window.__LOADING_MANAGER__.isPointerEventsEnabled() // 查询指针事件状态

// 更新文本
window.__LOADING_MANAGER__.updateText('正在处理数据...')

// 销毁
window.__LOADING_MANAGER__.destroy()
```

## 示例

### 基础用法

```typescript
injectLoading()
```

### 自定义图标和样式

```typescript
injectLoading({
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

### 自动拦截所有请求

```typescript
injectLoading({
	autoBind: 'all',
	requestFilter: {
		excludeUrls: [/\/api\/health/, /\/static\//],
		excludeMethods: ['OPTIONS', 'HEAD'],
		excludeUrlPrefixes: ['http://localhost']
	}
})
```

### 白屏 Loading（SPA）

```typescript
// 白屏阶段即显示，框架渲染完成后手动隐藏
injectLoading({
	defaultVisible: true,
	autoHideOn: 'manual'
})

// 在 Vue/React 应用入口处：
// window.__LOADING_MANAGER__.hide()
```

### 白屏 Loading（SSR/MPA）

```typescript
// 白屏阶段即显示，DOM 解析完成后自动隐藏
injectLoading({
	defaultVisible: true,
	autoHideOn: 'DOMContentLoaded'
})
```

### 自定义模板

```typescript
injectLoading({
	customTemplate: '<div class="my-loader"><span data-loading-text>加载中</span></div>'
})
```

::: warning自定义模板中必须包含一个具有 `data-loading-text` 属性的元素，否则 `updateText()` 将无法工作。:::

### 生命周期回调

```typescript
injectLoading({
	callbacks: {
		onBeforeShow: 'console.log("about to show"); return true;',
		onShow: 'console.log("shown")',
		onBeforeHide: 'if (window.shouldKeepLoading) return false;',
		onHide: 'console.log("hidden")',
		onDestroy: 'console.log("destroyed")'
	}
})
```

### 自定义全局变量名

```typescript
injectLoading({ globalName: '__MY_LOADING__' })

// 使用
window.__MY_LOADING__.show()
```

### 交互控制

默认情况下，loading 显示时会阻止用户点击页面上的其他元素。可通过 `style.pointerEvents` 选项控制：

```typescript
// 允许交互穿透（loading 期间仍可操作页面）
injectLoading({ style: { pointerEvents: false } })
```

运行时也可动态切换交互阻止状态：

```typescript
// 动态阻止/允许交互
window.__LOADING_MANAGER__.enablePointerEvents()
window.__LOADING_MANAGER__.disablePointerEvents()
window.__LOADING_MANAGER__.togglePointerEvents()
window.__LOADING_MANAGER__.isPointerEventsEnabled() // → true/false
```

### 完整配置

```typescript
injectLoading({
	position: 'center',
	defaultText: '加载中...',
	spinnerType: 'spinner',
	style: {
		overlayColor: 'rgba(255, 255, 255, 0.7)',
		spinnerColor: '#4361ee',
		spinnerSize: '40px',
		textColor: '#333',
		textSize: '14px',
		zIndex: 9999,
		pointerEvents: true,
		backdropBlur: false,
		backdropBlurAmount: 4
	},
	transition: {
		enabled: true,
		duration: 200,
		easing: 'ease-out'
	},
	minDisplayTime: { enabled: true, duration: 300 },
	delayShow: { enabled: true, duration: 200 },
	debounceHide: { enabled: false, duration: 100 },
	autoBind: 'none',
	globalName: '__LOADING_MANAGER__',
	defaultVisible: false,
	autoHideOn: 'DOMContentLoaded'
})
```

## 注意事项

- 当 `defaultVisible` 为 `true` 时，CSS 和 HTML 以静态标签形式注入到 `<head>` 中，确保白屏阶段即可显示，无需等待 JS 执行
- `autoHideOn` 仅在 `defaultVisible` 为 `true` 时生效
- `style.pointerEvents` 默认为 `true`（启用指针事件），loading 显示时阻止用户交互；设为 `false`（`pointer-events: none`）则允许点击穿透
- 回调以函数体字符串形式提供，运行时自动包裹 try-catch，回调中的错误不会影响 loading 正常功能
- `onBeforeShow` / `onBeforeHide` 中 `return false` 可阻止显示/隐藏
- `destroy()` 会清理 DOM 元素、恢复原始 fetch/XHR 拦截器，销毁后所有方法调用将被安全忽略
- `requestFilter` 中的正则表达式在构建时序列化，会正确保留 flags（如 `i`、`g`）
- `backdropBlurAmount` 和 `zIndex` 必须为非负数，否则配置验证会抛出错误
- 插件在 SSR 环境（`typeof window === 'undefined'`）中自动跳过执行
