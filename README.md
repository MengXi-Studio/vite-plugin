**中文** | [English](./README-en.md)

<div align="center">
  <a href="https://github.com/MengXi-Studio/vite-plugin">
    <img alt="梦曦工作室 Logo" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/logo.svg">
  </a>
  <br>
  <h1>@meng-xi/vite-plugin</h1>

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE) [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin)
![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

</div>

## 简介

`@meng-xi/vite-plugin` 是一个为 Vite 提供实用插件的工具包，也是一个**完整的插件开发框架**。该框架提供了常用功能的核心工具方法供扩展支持其他拓展工作开展快速开发。

## 特性

- **增强 Vite 构建流程**：提供实用插件集合，扩展 Vite 功能，简化构建过程中的常见任务，提高开发效率
- **插件开发框架**：导出核心组件如 BasePlugin、Logger、Validator，允许开发者基于相同基础设施构建自定义插件
- **高度可配置**：所有功能支持详细配置选项，可根据项目需求自定义行为，满足多样化场景
- **单例日志系统**：统一的日志管理器，支持插件级别的日志控制，便于调试和问题排查
- **类型安全验证**：强类型配置验证器，确保插件配置正确性，提供完整的 TypeScript 类型定义
- **插件工厂模式**：支持选项标准化器，轻松处理异构输入，简化插件开发工作流
- **无缝集成**：与 Vite 构建流程无缝集成，无需复杂配置即可快速启用
- **优化开发体验**：简化常见构建任务，减少手动操作，让开发者专注于核心业务逻辑

## 文档

开始阅读[文档地址](https://mengxi-studio.github.io/vite-plugin/)。

## 安装

使用包管理器安装 `@meng-xi/vite-plugin`：

```bash
# 使用 npm
npm install @meng-xi/vite-plugin --save-dev

# 使用 yarn
yarn add @meng-xi/vite-plugin --save-dev

# 使用 pnpm
pnpm add @meng-xi/vite-plugin --save-dev
```

## 基本使用

### 使用内置插件

```typescript
import { defineConfig } from 'vite'
import { copyFile, injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
  plugins: [
    copyFile({
      sourceDir: 'src/assets',
      targetDir: 'dist/assets'
    }),
    injectIco({
      base: '/assets'
    })
  ]
})
```

### 开发自定义插件

```typescript
import { BasePlugin, createPluginFactory, Validator } from '@meng-xi/vite-plugin'
import type { Plugin } from 'vite'

interface MyPluginOptions {
  path: string
  enabled?: boolean
  verbose?: boolean
  errorStrategy?: 'throw' | 'log' | 'ignore'
}

class MyPlugin extends BasePlugin<MyPluginOptions> {
  protected getDefaultOptions() {
    return {
      path: './default'
    }
  }

  protected validateOptions(): void {
    this.validator.field('path').required().string().validate()
  }

  protected getPluginName(): string {
    return 'my-plugin'
  }

  protected addPluginHooks(plugin: Plugin): void {
    plugin.buildStart = () => {
      this.logger.info(`Plugin started with path: ${this.options.path}`)
    }
  }
}

export const myPlugin = createPluginFactory(MyPlugin)
```

## 更新日志

[CHANGELOG](https://github.com/MengXi-Studio/vite-plugin/releases)

## 如何贡献

欢迎为 `@meng-xi/vite-plugin` 贡献代码。以下是贡献代码的步骤：

1. Fork 项目：在 GitHub 上 Fork 此项目。
2. 克隆代码：将 Fork 后的项目克隆到您的本地机器。

```bash
git clone https://github.com/your-username/vite-plugin.git
cd vite-plugin
```

3. 创建新分支：基于 `master` 分支创建一个新的功能分支。

```bash
git checkout -b feature/your-feature
```

4. 提交变更：确保您的代码通过了测试，并使用清晰的提交消息提交您的变更。

```bash
git add .
git commit -m "feat: add your feature description"
```

5. Push 变更：将您的本地分支推送到 GitHub。

```bash
git push origin feature/your-feature
```

6. 创建 PR：在 GitHub 上创建一个 Pull Request，并等待审核。
