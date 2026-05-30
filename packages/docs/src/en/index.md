---
layout: home

title: '@meng-xi/vite-plugin'
titleTemplate: Vite Practical Plugin Toolkit

hero:
  name: '@meng-xi/vite-plugin'
  text: Vite Practical Plugin Toolkit
  tagline: 8 ready-to-use plugins + complete plugin development framework for efficient Vite development
  image:
    src: /logo.png
    alt: MengXi Studio
  actions:
    - theme: brand
      text: Quick Start
      link: /en/installation
    - theme: alt
      text: Learn More
      link: /en/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/MengXi-Studio/vite-plugin

features:
  - icon: 🚀
    title: Build Progress Display
    details: buildProgress displays real-time build progress bar in terminal, supporting bar, spinner, and minimal formats with customizable color themes and character styles
  - icon: 📁
    title: File Operations & Router Generation
    details: copyFile supports incremental file copying to build directory; generateRouter auto-generates router config from pages.json with file watching
  - icon: 🔖
    title: Version Management & Update Detection
    details: generateVersion auto-generates version numbers with file output and global variable injection; versionUpdateChecker detects version changes at runtime and prompts users to refresh
  - icon: 📝
    title: HTML Injection & Favicon Management
    details: htmlInject supports multi-position and conditional HTML content injection, template variable replacement, and security filtering; faviconManager manages favicon link injection
  - icon: ⏳
    title: Global Loading State Management
    details: loadingManager provides XHR/Fetch request interception, white-screen Loading, custom styles & animations, and lifecycle callbacks for seamless white-screen-to-interactive transitions
  - icon: 🧱
    title: Plugin Development Framework
    details: Exports BasePlugin, createPluginFactory, Logger, Validator and more, providing complete lifecycle management, chainable config validation, and safeExecute wrappers for building standardized custom plugins
---
