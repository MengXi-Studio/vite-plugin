---
layout: home

title: '@meng-xi/vite-plugin'
titleTemplate: Vite Practical Plugin Toolkit

hero:
  name: '@meng-xi/vite-plugin'
  text: Vite Practical Plugin Toolkit
  tagline: Ready-to-use plugin collection + Complete plugin development framework
  image:
    src: /logo.png
    alt: MengXi Studio
  actions:
    - theme: brand
      text: Quick Start
      link: /en/installation
    - theme: alt
      text: What is @meng-xi/vite-plugin?
      link: /en/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/MengXi-Studio/vite-plugin

features:
  - icon: 📦
    title: Ready to Use
    details:
      Built-in plugins - buildProgress, copyFile, generateRouter, generateVersion, injectIco - covering build progress display, file copying, router generation, version management, and icon injection. Works out of the
      box with zero config.
  - icon: 🧱
    title: Plugin Development Framework
    details: Exports BasePlugin, createPluginFactory, Logger, Validator and more. Provides complete lifecycle management and automatic hook composition for building standardized custom Vite plugins.
  - icon: 🔒
    title: Type Safe
    details: Full TypeScript type definitions. Chainable config validator catches parameter errors before build. Sub-path exports support on-demand type imports for a smooth DX.
  - icon: ⚙️
    title: Flexible Configuration
    details: Unified enabled / verbose / errorStrategy base options. Built-in throw / log / ignore error handling strategies and safeExecute wrappers for fine-grained control over each plugin.
---
