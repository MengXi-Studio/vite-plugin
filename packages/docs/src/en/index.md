---
layout: home

title: '@meng-xi/vite-plugin'
titleTemplate: Vite Practical Plugin Toolkit

hero:
  name: '@meng-xi/vite-plugin'
  text: Vite Practical Plugin Toolkit
  tagline: 7 ready-to-use plugins + complete plugin development framework for efficient Vite development
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
    details: buildProgress displays real-time build progress bar in terminal, supporting bar, spinner, and minimal formats with customizable color themes and character styles.
  - icon: 📁
    title: File Copy & Router Generation
    details: copyFile supports incremental file copying to build directory. generateRouter auto-generates router config from pages.json with file watching, reducing manual operations.
  - icon: 🔖
    title: Version Management & Update Detection
    details:
      generateVersion auto-generates version numbers with file output and global variable injection. versionUpdateChecker detects version changes at runtime and prompts users to refresh. faviconManager manages website
      favicon links injection into HTML.
  - icon: ⏳
    title: Global Loading State Management
    details:
      loadingManager provides global Loading state management with XHR/Fetch request interception, white-screen Loading, custom styles & animations, and lifecycle callbacks for seamless white-screen-to-interactive
      transitions.
  - icon: 🧱
    title: Plugin Development Framework
    details: Exports BasePlugin, createPluginFactory, Logger, Validator and more. Provides complete lifecycle management and automatic hook composition for building standardized custom Vite plugins.
  - icon: 🔒
    title: Type Safety & Safe Execution
    details:
      Full TypeScript type definitions with chainable config validator catching parameter errors before build. Built-in throw / log / ignore error handling strategies and safeExecute wrappers for fine-grained exception
      control.
---
