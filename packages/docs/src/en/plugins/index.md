# Plugins List

Vite plugin collection provided by @meng-xi/vite-plugin.

## Plugins

| Plugin                                           | Description                                               |
| ------------------------------------------------ | --------------------------------------------------------- |
| [buildProgress](./build-progress)                | Display real-time build progress bar in terminal          |
| [copyFile](./copy-file)                          | Copy files or directories after build                     |
| [faviconManager](./favicon-manager)              | Manage website favicon links injection into HTML          |
| [generateRouter](./generate-router)              | Auto-generate route config from uni-app pages.json        |
| [generateVersion](./generate-version)            | Generate version with file output or global variable      |
| [loadingManager](./loading-manager)              | Global Loading state management with request interception |
| [versionUpdateChecker](./version-update-checker) | Runtime version update check with refresh prompt          |

## Common Options

All plugins extend `BasePlugin` and share these base options:

| Option        | Type                           | Default   | Description    |
| ------------- | ------------------------------ | --------- | -------------- |
| enabled       | `boolean`                      | `true`    | Enable plugin  |
| verbose       | `boolean`                      | `true`    | Show logs      |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | Error handling |
