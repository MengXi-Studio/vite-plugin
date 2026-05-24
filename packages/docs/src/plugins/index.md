# 插件列表

@meng-xi/vite-plugin 提供的 Vite 插件集合。

## 插件

| 插件                                             | 说明                                         |
| ------------------------------------------------ | -------------------------------------------- |
| [buildProgress](./build-progress)                | 在终端实时显示构建进度条                     |
| [copyFile](./copy-file)                          | 构建完成后复制文件或目录到指定位置           |
| [faviconManager](./favicon-manager)              | 管理网站图标（favicon）链接注入到 HTML 文件  |
| [generateRouter](./generate-router)              | 根据 uni-app pages.json 自动生成路由配置     |
| [generateVersion](./generate-version)            | 自动生成版本号，支持文件输出和全局变量注入   |
| [loadingManager](./loading-manager)              | 全局 Loading 状态管理，支持请求拦截          |
| [versionUpdateChecker](./version-update-checker) | 运行时版本更新检查，发现新版本时提示用户刷新 |

## 通用配置

所有插件继承自 `BasePlugin`，共享以下基础配置：

| 选项          | 类型                           | 默认值    | 说明         |
| ------------- | ------------------------------ | --------- | ------------ |
| enabled       | `boolean`                      | `true`    | 启用插件     |
| verbose       | `boolean`                      | `true`    | 显示详细日志 |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | 错误处理策略 |
