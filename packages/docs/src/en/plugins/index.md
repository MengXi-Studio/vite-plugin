# Plugins List

Vite plugin collection provided by @meng-xi/vite-plugin.

## Plugins

| Plugin                                | Description                                          |
| ------------------------------------- | ---------------------------------------------------- |
| [copyFile](./copy-file)               | Copy files or directories after build                |
| [generateRouter](./generate-router)   | Auto-generate route config from uni-app pages.json   |
| [generateVersion](./generate-version) | Generate version with file output or global variable |
| [injectIco](./inject-ico)             | Inject favicon links into HTML                       |

## Common Options

All plugins extend `BasePlugin` and share these base options:

| Option        | Type                           | Default   | Description    |
| ------------- | ------------------------------ | --------- | -------------- |
| enabled       | `boolean`                      | `true`    | Enable plugin  |
| verbose       | `boolean`                      | `true`    | Show logs      |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | Error handling |
