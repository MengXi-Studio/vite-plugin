# injectLoading

Inject global Loading state management code during Vite build. Supports automatic fetch/XHR request interception, multiple built-in spinner types, custom styles, and lifecycle callbacks.

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { injectLoading } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [injectLoading()]
})
```

### White-screen Loading

Show loading during the white-screen phase, auto-hide on DOMContentLoaded:

```typescript
injectLoading({
	defaultVisible: true,
	autoHideOn: 'DOMContentLoaded'
})
```

### Auto-intercept Requests

Automatically intercept fetch requests — show loading during requests, hide when complete:

```typescript
injectLoading({ autoBind: 'fetch' })
```

## Options

| Option         | Type                                       | Default                   | Description                    |
| -------------- | ------------------------------------------ | ------------------------- | ------------------------------ |
| position       | `'center' \| 'top' \| 'bottom'`            | `'center'`                | Loading position               |
| defaultText    | `string`                                   | `'加载中...'`             | Default display text           |
| spinnerType    | `'spinner' \| 'dots' \| 'pulse' \| 'bar'`  | `'spinner'`               | Built-in spinner type          |
| style          | [`LoadingStyle`](#loadingstyle)            | -                         | Custom style config            |
| transition     | [`TransitionConfig`](#transitionconfig)    | `{ enabled: true, ... }`  | Transition animation config    |
| minDisplayTime | [`MinDisplayTime`](#mindisplaytime)        | `{ enabled: true, ... }`  | Minimum display time config    |
| delayShow      | [`DelayShow`](#delayshow)                  | `{ enabled: true, ... }`  | Delayed show config            |
| debounceHide   | [`DebounceHide`](#debouncehide)            | `{ enabled: false, ... }` | Debounced hide config          |
| autoBind       | `'fetch' \| 'xhr' \| 'all' \| 'none'`      | `'none'`                  | Auto-bind request interception |
| requestFilter  | [`RequestFilter`](#requestfilter)          | -                         | Request filter config          |
| globalName     | `string`                                   | `'__LOADING_MANAGER__'`   | Global variable name           |
| customTemplate | `string`                                   | -                         | Custom HTML template           |
| defaultVisible | `boolean`                                  | `false`                   | Initial visibility             |
| autoHideOn     | `'DOMContentLoaded' \| 'load' \| 'manual'` | `'DOMContentLoaded'`      | Auto-hide timing               |
| callbacks      | [`LoadingCallbacks`](#loadingcallbacks)    | -                         | Lifecycle callbacks            |
| enabled        | `boolean`                                  | `true`                    | Enable the plugin              |
| verbose        | `boolean`                                  | `true`                    | Show detailed logs             |
| errorStrategy  | `'throw' \| 'log' \| 'ignore'`             | `'throw'`                 | Error handling strategy        |

### LoadingStyle

| Option             | Type      | Default                   | Description                              |
| ------------------ | --------- | ------------------------- | ---------------------------------------- |
| overlayColor       | `string`  | `'rgba(255,255,255,0.7)'` | Overlay background color                 |
| spinnerColor       | `string`  | `'#4361ee'`               | Spinner color                            |
| spinnerSize        | `string`  | `'40px'`                  | Spinner size                             |
| textColor          | `string`  | `'#333'`                  | Text color                               |
| textSize           | `string`  | `'14px'`                  | Text size                                |
| customClass        | `string`  | -                         | Custom CSS class name                    |
| customStyle        | `string`  | -                         | Custom inline style string               |
| zIndex             | `number`  | `9999`                    | z-index value (must be non-negative)     |
| pointerEvents      | `boolean` | `false`                   | Allow click-through                      |
| backdropBlur       | `boolean` | `false`                   | Enable backdrop blur                     |
| backdropBlurAmount | `number`  | `4`                       | Blur amount in px (must be non-negative) |

### TransitionConfig

| Option   | Type      | Default      | Description         |
| -------- | --------- | ------------ | ------------------- |
| enabled  | `boolean` | `true`       | Enable transition   |
| duration | `number`  | `200`        | Duration in ms      |
| easing   | `string`  | `'ease-out'` | CSS easing function |

### MinDisplayTime

| Option   | Type      | Default | Description                                  |
| -------- | --------- | ------- | -------------------------------------------- |
| enabled  | `boolean` | `true`  | Enable                                       |
| duration | `number`  | `300`   | Minimum display time in ms, prevents flicker |

### DelayShow

| Option   | Type      | Default | Description                                                            |
| -------- | --------- | ------- | ---------------------------------------------------------------------- |
| enabled  | `boolean` | `true`  | Enable                                                                 |
| duration | `number`  | `200`   | Delay in ms; if request completes within this time, loading won't show |

### DebounceHide

| Option   | Type      | Default | Description                                |
| -------- | --------- | ------- | ------------------------------------------ |
| enabled  | `boolean` | `false` | Enable                                     |
| duration | `number`  | `100`   | Debounce wait time in ms, prevents flicker |

### RequestFilter

| Option             | Type       | Default | Description                                                       |
| ------------------ | ---------- | ------- | ----------------------------------------------------------------- |
| excludeUrls        | `RegExp[]` | -       | URL regex patterns to exclude from triggering loading             |
| includeUrls        | `RegExp[]` | -       | URL regex patterns to include (higher priority than excludeUrls)  |
| excludeMethods     | `string[]` | -       | HTTP methods to exclude (case-insensitive)                        |
| excludeUrlPrefixes | `string[]` | -       | URL prefixes to exclude (prefix match, more efficient than regex) |

### LoadingCallbacks

Callbacks are provided as **function body strings** because the plugin injects code at build time and cannot pass function references directly.

| Option       | Type     | Default | Description                                     |
| ------------ | -------- | ------- | ----------------------------------------------- |
| onBeforeShow | `string` | -       | Before show callback, `return false` to prevent |
| onShow       | `string` | -       | After show callback                             |
| onBeforeHide | `string` | -       | Before hide callback, `return false` to prevent |
| onHide       | `string` | -       | After hide callback                             |
| onDestroy    | `string` | -       | On destroy callback                             |

## LoadingManager API

The plugin injects a global manager (default `window.__LOADING_MANAGER__`) to the browser, providing the following methods:

| Method              | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `show(text?)`       | Show loading, optionally with text                                |
| `hide()`            | Hide loading (subject to minDisplayTime/debounceHide constraints) |
| `forceHide()`       | Force hide, ignoring min display time and debounce                |
| `destroy()`         | Destroy instance, clean up DOM and restore interceptors           |
| `updateText(t)`     | Update text content                                               |
| `isVisible()`       | Get current visibility state                                      |
| `getPendingCount()` | Get current pending request count                                 |

```typescript
// Show loading
window.__LOADING_MANAGER__.show()
window.__LOADING_MANAGER__.show('Saving...')

// Hide loading
window.__LOADING_MANAGER__.hide()

// Force hide
window.__LOADING_MANAGER__.forceHide()

// Update text
window.__LOADING_MANAGER__.updateText('Processing data...')

// Destroy
window.__LOADING_MANAGER__.destroy()
```

## Examples

### Basic Usage

```typescript
injectLoading()
```

### Custom Spinner and Style

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

### Auto-intercept All Requests

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

### White-screen Loading (SPA)

```typescript
// Show during white-screen, manually hide after framework renders
injectLoading({
	defaultVisible: true,
	autoHideOn: 'manual'
})

// In Vue/React app entry:
// window.__LOADING_MANAGER__.hide()
```

### White-screen Loading (SSR/MPA)

```typescript
// Show during white-screen, auto-hide after DOM parsing
injectLoading({
	defaultVisible: true,
	autoHideOn: 'DOMContentLoaded'
})
```

### Custom Template

```typescript
injectLoading({
	customTemplate: '<div class="my-loader"><span data-loading-text="">Loading</span></div>'
})
```

::: warning The custom template must include an element with the `data-loading-text` attribute, otherwise `updateText()` will not work. :::

### Lifecycle Callbacks

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

### Custom Global Name

```typescript
injectLoading({ globalName: '__MY_LOADING__' })

// Usage
window.__MY_LOADING__.show()
```

### Full Configuration

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
		pointerEvents: false,
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

## Notes

- When `defaultVisible` is `true`, CSS and HTML are injected as static tags into `<head>`, ensuring loading is visible during the white-screen phase without waiting for JS execution
- `autoHideOn` only takes effect when `defaultVisible` is `true`
- Callbacks are provided as function body strings and are automatically wrapped in try-catch at runtime — callback errors won't affect normal loading functionality
- `onBeforeShow` / `onBeforeHide` can `return false` to prevent show/hide
- `destroy()` cleans up DOM elements and restores original fetch/XHR interceptors; all method calls are safely ignored after destruction
- RegExp patterns in `requestFilter` are serialized at build time with flags (e.g., `i`, `g`) correctly preserved
- `backdropBlurAmount` and `zIndex` must be non-negative numbers, otherwise config validation will throw an error
- The plugin automatically skips execution in SSR environments (`typeof window === 'undefined'`)
