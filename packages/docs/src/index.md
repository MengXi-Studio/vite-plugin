---
layout: home

title: '@meng-xi/vite-plugin'
titleTemplate: Vite 实用插件工具包

hero:
  name: '@meng-xi/vite-plugin'
  text: Vite 实用插件工具包
  tagline: 11 款开箱即用插件 + 完整的插件开发框架，让 Vite 开发更高效
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
    details: buildProgress 在终端实时显示构建进度条，支持 bar、spinner、minimal 三种格式
  - icon: 📦
    title: 构建产物压缩
    details: compressAssets 在构建后自动压缩产物，支持 gzip / brotli / both 三种模式，可配置压缩级别、文件过滤与并发数量，并生成压缩统计报告
  - icon: 📊
    title: 构建产物体积分析
    details: bundleAnalyzer 分析构建产物体积分布，支持 JSON/HTML 报告、gzip 计算、阈值告警和构建对比
  - icon: 📁
    title: 文件操作与路由生成
    details: copyFile 支持增量复制文件到构建目录；generateRouter 根据 pages.json 自动生成路由配置并监听变更
  - icon: 🔖
    title: 版本管理与更新检测
    details: generateVersion 自动生成版本号，支持文件输出与全局变量注入；versionUpdateChecker 在运行时定期检测版本变更并提示用户刷新
  - icon: 📝
    title: HTML 注入与图标管理
    details: htmlInject 支持多种位置与条件的 HTML 内容注入、模板变量替换及安全过滤；faviconManager 管理 favicon 链接注入
  - icon: ⏳
    title: 全局 Loading 状态管理
    details: loadingManager 支持 XHR/Fetch 请求自动拦截、白屏 Loading、自定义样式与动画及生命周期回调，实现从白屏到交互的无缝过渡
  - icon: 🧱
    title: 插件开发框架
    details: 导出 BasePlugin、createPluginFactory、Logger、Validator 等核心组件，提供完整生命周期管理、链式配置验证与 safeExecute 安全执行包裹
  - icon: 🛠️
    title: 通用工具模块
    details: 提供 compress、format、fs、html、object、path、script、ui、validation 九大工具模块，覆盖压缩算法、日期格式化、文件操作、HTML 注入、深度合并、路径处理、终端 UI、脚本生成与配置验证等常见场景
---
