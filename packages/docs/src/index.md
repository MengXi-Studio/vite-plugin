---
layout: home

title: '@meng-xi/vite-plugin'
titleTemplate: Vite 实用插件工具包

hero:
  name: '@meng-xi/vite-plugin'
  text: Vite 实用插件工具包
  tagline: 6 款开箱即用插件 + 完整的插件开发框架，让 Vite 开发更高效
  image:
    src: /logo.png
    alt: 梦曦工作室
  actions:
    - theme: brand
      text: 快速开始
      link: /installation
    - theme: alt
      text: 了解更多
      link: /introduction
    - theme: alt
      text: GitHub
      link: https://github.com/MengXi-Studio/vite-plugin

features:
  - icon: 🚀
    title: 构建进度展示
    details: buildProgress 在终端实时显示构建进度条，支持 bar、spinner、minimal 三种格式，可自定义颜色主题和字符样式，让构建过程一目了然。
  - icon: 📁
    title: 文件复制与路由生成
    details: copyFile 支持增量复制文件到构建目录，generateRouter 根据 pages.json 自动生成路由配置并监听变更，减少手动操作。
  - icon: 🔖
    title: 版本管理与图标注入
    details: generateVersion 自动生成版本号并支持文件输出和全局变量注入，faviconManager 管理网站图标链接注入 HTML，一行配置即可完成。
  - icon: ⏳
    title: 全局 Loading 状态管理
    details: loadingManager 全局 Loading 状态管理组件，支持 XHR/Fetch 请求自动拦截、白屏 Loading、自定义样式与动画、生命周期回调，实现从白屏到交互的无缝过渡。
  - icon: 🧱
    title: 插件开发框架
    details: 导出 BasePlugin、createPluginFactory、Logger、Validator 等核心组件，提供完整生命周期管理与钩子自动组合，快速构建规范化的自定义 Vite 插件。
  - icon: 🔒
    title: 类型安全与安全执行
    details: 全量 TypeScript 类型定义，链式配置验证器在构建前拦截参数错误。内置 throw / log / ignore 三级错误处理策略与 safeExecute 安全执行包裹，精细控制异常行为。
---
