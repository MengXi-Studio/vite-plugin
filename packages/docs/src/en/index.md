---
layout: home

title: '@meng-xi/vite-plugin'
titleTemplate: Vite Practical Plugin Toolkit

hero:
  name: '@meng-xi/vite-plugin'
  text: Vite Practical Plugin Toolkit
  tagline: 12 ready-to-use plugins + complete plugin development framework for efficient Vite development
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
  - icon: 🔄
    title: Auto Import
    details: autoImport automatically injects import statements with preset mappings, wildcard (`'*'`), directory scanning, Vue template auto-import, and TypeScript declaration generation
  - icon: 🚀
    title: Build Progress Display
    details: buildProgress displays real-time build progress bar in terminal, supporting bar, spinner, and minimal formats
  - icon: 📦
    title: Build Artifact Compression
    details: compressAssets automatically compresses build artifacts, supporting gzip / brotli / both modes with configurable compression level, file filtering, and concurrency, plus compression statistics report
  - icon: 📊
    title: Build Artifact Size Analysis
    details: bundleAnalyzer analyzes build artifact size distribution with JSON/HTML reports, gzip calculation, threshold alerts, and build comparison
  - icon: 📁
    title: File Copying
    details: copyFile copies files or directories to specified locations after build, with incremental copying, concurrency control, and empty directory skipping
  - icon: 🗺️
    title: Router Generation
    details: generateRouter auto-generates router config and type declarations from pages.json, supporting multiple naming strategies, sub-package routes, and file watching
  - icon: 🔐
    title: Environment Variable Validation
    details: envGuard validates environment variable types, formats, and ranges, supporting custom rules, runtime guards, and template generation
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
    details: Exports BasePlugin, createPluginFactory, Logger, Validator and more, providing complete lifecycle management, chainable config validation, and safeExecute wrappers
  - icon: 🛠️
    title: Common Utility Modules
    details: Provides 6 utility modules — format, fs, html, script, ui, validation — covering date formatting, file operations, HTML injection, script generation, terminal UI, and config validation
---
