# Quick Start

This guide will help you quickly get started with Vite Custom Plugins.

## Installation

### Using pnpm

```bash
pnpm add -D @meng-xi/vite-plugin
```

### Using npm

```bash
npm install -D @meng-xi/vite-plugin
```

### Using yarn

```bash
yarn add -D @meng-xi/vite-plugin
```

## Basic Usage

Import and use the required plugins in your Vite configuration file:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    // Use copyFile plugin
    vitePlugin.copyFile({
      sourceDir: 'src/assets',
      targetDir: 'dist/assets'
    }),
    
    // Use injectIco plugin
    vitePlugin.injectIco({
      base: '/assets'
    })
  ]
})
```

## Configuration Options

Each plugin has its own configuration options, which you can configure according to your needs. Please check the corresponding plugin documentation for detailed configuration options.

## Plugin List

- [copyFile Plugin](../plugins/copyFile): Copy files or directories to specified locations
- [injectIco Plugin](../plugins/injectIco): Inject website icon links into the head of HTML files
