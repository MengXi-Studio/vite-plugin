---
layout: home

title: '@meng-xi/vite-plugin'
titleTemplate: Vite 实用插件工具包

hero:
  name: '@meng-xi/vite-plugin'
  text: Vite 实用插件工具包
  tagline: 13 款开箱即用插件 + 完整的插件开发框架，让 Vite 开发更高效
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
  - icon: 📋
    title: 资源清单生成
    details: assetManifest 在构建后自动扫描产物目录生成资源映射清单，支持 Vite/Webpack/自定义三种输出格式、按入口分组和运行时注入
  - icon: 🔄
    title: 自动导入
    details: autoImport 自动注入 import 语句，支持预设映射、通配符（`'*'`）、目录扫描、Vue 模板自动导入和 TypeScript 类型声明生成
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
    title: 文件复制
    details: copyFile 在构建完成后复制文件或目录到指定位置，支持增量复制、并发控制与空目录跳过
  - icon: 🗺️
    title: 路由生成
    details: generateRouter 根据 pages.json 自动生成路由配置与类型声明，支持多种命名策略、分包路由与文件监听
  - icon: 🔐
    title: 环境变量校验
    details: envGuard 校验环境变量的类型、格式与范围，支持自定义规则、运行时守卫与模板生成
  - icon: 🔖
    title: 版本号生成
    details: generateVersion 自动生成版本号，支持文件输出与全局变量注入，提供时间戳、git hash 等多种格式
  - icon: 🔔
    title: 版本更新检测
    details: versionUpdateChecker 在运行时定期检测版本变更，发现新版本时提示用户刷新，支持自定义检测间隔与提示样式
  - icon: 📝
    title: HTML 内容注入
    details: htmlInject 支持多种位置与条件的 HTML 内容注入、模板变量替换及安全过滤
  - icon: 🌐
    title: 网站图标管理
    details: faviconManager 管理 favicon 链接注入，支持多格式图标自动检测与 HTML 注入
  - icon: ⏳
    title: 全局 Loading 状态管理
    details: loadingManager 支持 XHR/Fetch 请求自动拦截、白屏 Loading、自定义样式与动画及生命周期回调，实现从白屏到交互的无缝过渡
  - icon: 🧱
    title: 插件开发框架
    details: 导出 BasePlugin、createPluginFactory、Logger、Validator 等核心组件，提供完整生命周期管理、链式配置验证与 safeExecute 安全执行包裹
  - icon: 🛠️
    title: 通用工具模块
    details: 提供 format、fs、html、script、ui、validation 六大工具模块，覆盖日期格式化、文件操作、HTML 注入、脚本生成、终端 UI 与配置验证等常见场景
---
