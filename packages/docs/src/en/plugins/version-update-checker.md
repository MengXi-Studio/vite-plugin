# versionUpdateChecker

Version update checker plugin. Injects version update checking code into HTML during Vite build. At runtime, it periodically checks for version changes and displays a refresh prompt to users when a new version is
detected.

Typically used with the `generateVersion` plugin: `generateVersion` generates the version number at build time, while `versionUpdateChecker` checks for version changes at runtime and prompts users to refresh.

## Quick Start

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

## Options

| Option                  | Type                             | Default                                    | Description                          |
| ----------------------- | -------------------------------- | ------------------------------------------ | ------------------------------------ |
| versionSource           | `'define' \| 'file' \| 'auto'`   | `'auto'`                                   | Source of the current version number |
| defineName              | `string`                         | `'__APP_VERSION__'`                        | Global variable name in define mode  |
| checkUrl                | `string`                         | `'/version.json'`                          | URL path for version check file      |
| checkInterval           | `number`                         | `300000`                                   | Version check interval (ms)          |
| checkOnVisibilityChange | `boolean`                        | `true`                                     | Check on page visibility change      |
| enableInDev             | `boolean`                        | `false`                                    | Enable in development mode           |
| promptStyle             | `'modal' \| 'banner' \| 'toast'` | `'modal'`                                  | Update prompt UI style               |
| promptMessage           | `string`                         | `'发现新版本，是否立即刷新获取最新内容？'` | Update prompt message text           |
| refreshButtonText       | `string`                         | `'立即刷新'`                               | Refresh button text                  |
| dismissButtonText       | `string`                         | `'稍后再说'`                               | Dismiss button text                  |
| customPromptTemplate    | `string`                         | -                                          | Custom prompt UI HTML template       |
| customStyle             | `string`                         | -                                          | Custom style string                  |
| onUpdateAvailable       | `string`                         | -                                          | Callback when new version is found   |
| onRefresh               | `string`                         | -                                          | Callback when user chooses refresh   |
| onDismiss               | `string`                         | -                                          | Callback when user chooses dismiss   |
| enabled                 | `boolean`                        | `true`                                     | Enable the plugin                    |
| verbose                 | `boolean`                        | `true`                                     | Show detailed logs                   |
| errorStrategy           | `'throw' \| 'log' \| 'ignore'`   | `'throw'`                                  | Error handling strategy              |

### Version Source Types (versionSource)

| Value  | Description                                    |
| ------ | ---------------------------------------------- |
| define | Read from Vite define-injected global variable |
| file   | Read from version file (e.g., version.json)    |
| auto   | Auto-detect, prefer define, fallback to file   |

### Prompt Styles (promptStyle)

| Value  | Description                             |
| ------ | --------------------------------------- |
| modal  | Centered dialog, requires user action   |
| banner | Top banner, can be manually dismissed   |
| toast  | Bottom toast, can be manually dismissed |

### Custom Template Placeholders

When using `customPromptTemplate`, the following placeholders are available:

| Placeholder          | Description     |
| -------------------- | --------------- |
| `{{message}}`        | Prompt message  |
| `{{currentVersion}}` | Current version |
| `{{newVersion}}`     | New version     |
| `{{refreshButton}}`  | Refresh button  |
| `{{dismissButton}}`  | Dismiss button  |

### Callbacks

Callbacks are provided as **function body strings** because the plugin injects code at build time and cannot pass function references directly.

| Option            | Available Variables            | Description                                                        |
| ----------------- | ------------------------------ | ------------------------------------------------------------------ |
| onUpdateAvailable | `currentVersion`, `newVersion` | Triggered when new version found, `return false` to prevent prompt |
| onRefresh         | `currentVersion`, `newVersion` | Triggered when user chooses to refresh                             |
| onDismiss         | `currentVersion`, `newVersion` | Triggered when user chooses to dismiss                             |

## Examples

### Basic Usage

Used with the `generateVersion` plugin:

```typescript
;(generateVersion({
	format: 'datetime',
	outputType: 'both',
	defineName: '__APP_VERSION__'
}),
	versionUpdateChecker())
```

### Custom Check Interval and Prompt Style

```typescript
versionUpdateChecker({
	checkInterval: 60000, // Check every 1 minute
	promptStyle: 'banner' // Top banner prompt
})
```

### Custom Prompt Message and Callbacks

```typescript
versionUpdateChecker({
	promptMessage: '系统已更新，请刷新页面',
	onUpdateAvailable: 'console.log("New version:", newVersion); return true;',
	onRefresh: 'console.log("User chose to refresh");',
	onDismiss: 'console.log("User chose to dismiss");'
})
```

### Enable in Development Mode

```typescript
versionUpdateChecker({
	enableInDev: true,
	checkInterval: 10000
})
```

### Custom UI Template

```typescript
versionUpdateChecker({
	customPromptTemplate: '<div class="my-update-prompt">{{message}} {{refreshButton}}</div>',
	customStyle: '.my-update-prompt { background: #333; color: #fff; padding: 16px; }'
})
```

### Using Banner Style

```typescript
versionUpdateChecker({
	promptStyle: 'banner',
	promptMessage: '有新版本可用',
	refreshButtonText: '更新',
	dismissButtonText: '关闭'
})
```

### Using Toast Style

```typescript
versionUpdateChecker({
	promptStyle: 'toast',
	promptMessage: '发现新版本',
	refreshButtonText: '刷新'
})
```

### Read Version from File Only

```typescript
versionUpdateChecker({
	versionSource: 'file',
	checkUrl: '/version.json'
})
```

## How It Works

1. On page load, reads the current version from a global variable (e.g., `__APP_VERSION__`) or meta tag
2. First check is delayed by 10 seconds to avoid prompting immediately after page load
3. Periodically requests `checkUrl` (default `/version.json`) to get the latest version number
4. When versions differ, decides whether to show the prompt based on the `onUpdateAvailable` callback
5. Clicking "Refresh" executes `location.reload()`
6. Clicking "Dismiss" hides the prompt and won't remind again in the current session
7. Checks for updates immediately when page visibility changes (e.g., switching back from another tab)

## Notes

- This plugin typically needs to be used with the `generateVersion` plugin to ensure the `version.json` file and global variable are correctly generated
- `checkInterval` minimum value is 5000 ms (5 seconds); values below this will fail validation
- `customPromptTemplate` must not contain `<script>` tags (XSS protection)
- Callback strings must not contain `<script>` tags
- `defineName` must be a valid JavaScript identifier and cannot be a built-in property (e.g., `__proto__`, `constructor`, `prototype`)
- Disabled in development mode by default; enable with `enableInDev: true`
- The plugin automatically skips execution in SSR environments (`typeof window === 'undefined'`)
- When `versionSource` is `'file'` or `'auto'`, a `<meta name="app-version">` tag is injected into `<head>`
