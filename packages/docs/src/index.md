---
layout: home

title: '@meng-xi/vite-plugin'
titleTemplate: Vite 实用插件工具包

hero:
  name: '@meng-xi/vite-plugin'
  text: Vite 实用插件工具包
  tagline: 开箱即用的插件集合 + 完整的插件开发框架
  image:
    src: /logo.png
    alt: 梦曦工作室
  actions:
    - theme: brand
      text: 快速开始
      link: /installation
    - theme: alt
      text: 什么是 @meng-xi/vite-plugin？
      link: /introduction
    - theme: alt
      text: GitHub
      link: https://github.com/MengXi-Studio/vite-plugin

features:
  - icon: 📦
    title: 开箱即用
    details: 内置 buildProgress、copyFile、generateRouter、generateVersion、injectIco 五款插件，覆盖构建进度展示、文件复制、路由生成、版本管理、图标注入等高频场景，零配置即可使用。
  - icon: 🧱
    title: 插件开发框架
    details: 导出 BasePlugin、createPluginFactory、Logger、Validator 等核心组件，提供完整生命周期管理与钩子自动组合，快速构建规范化的自定义 Vite 插件。
  - icon: 🔒
    title: 类型安全
    details: 全量 TypeScript 类型定义，链式配置验证器在构建前拦截参数错误，子路径导出支持按需类型引入，开发体验流畅。
  - icon: ⚙️
    title: 灵活配置
    details: 统一的 enabled / verbose / errorStrategy 基础选项，内置 throw / log / ignore 三级错误处理策略与 safeExecute 安全执行包裹，精细控制每个插件行为。
---
