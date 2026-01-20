# @meng-xi/vite-plugin [![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin) ![GitHub](https://img.shields.io/github/license/MengXi-Studio/vite-plugin?color=orange)

> - 这是一个为 Vite 提供实用插件的工具包，帮助开发者简化构建流程，提高开发效率。
> - 扩展 Vite 构建流程的功能，提供常见构建任务的自动化处理方案。
> - 所有插件都支持详细的配置选项，可根据项目需求自定义行为，满足不同场景的使用需求。
> - 插件提供错误处理机制，确保构建流程能捕获到错误，提高构建的可靠性。
> - 采用模块化设计，插件可以单独使用，也可以组合使用，灵活应对不同项目的需求。

---

开始阅读[文档](https://mengxi-studio.github.io/vite-plugin/)。

## 快速入门

### 安装

使用包管理器安装 `@meng-xi/vite-plugin`：

```bash
# 使用 npm
npm install @meng-xi/vite-plugin --save-dev

# 使用 yarn
yarn add @meng-xi/vite-plugin --save-dev

# 使用 pnpm
pnpm add @meng-xi/vite-plugin --save-dev
```

### 基本使用

在 Vite 配置文件中引入并使用插件：

```typescript
import { defineConfig } from 'vite'
import { copyFile, injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// 复制文件插件
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),

		// 注入图标插件
		injectIco({
			base: '/assets'
		})
	]
})
```

### 全部引入

也可以使用默认导入的方式全部引入：

```typescript
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// 复制文件插件
		vitePlugin.copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),

		// 注入图标插件
		vitePlugin.injectIco({
			base: '/assets'
		})
	]
})
```

## 插件详情

### copyFile 插件

用于在 Vite 构建完成后复制文件或目录到指定位置。

**配置选项**：

- `sourceDir`：源目录路径（必填）
- `targetDir`：目标目录路径（必填）
- `overwrite`：是否覆盖已存在的文件，默认为 `true`
- `recursive`：是否递归复制子目录，默认为 `true`
- `verbose`：是否输出详细日志，默认为 `true`
- `enabled`：是否启用插件，默认为 `true`

### injectIco 插件

用于在 Vite 构建过程中注入网站图标链接到 HTML 文件的头部。

**配置选项**：

- `base`：图标文件的基础路径
- `url`：图标的完整 URL
- `link`：自定义的完整 link 标签 HTML
- `icons`：自定义图标数组
- `verbose`：是否输出详细日志，默认为 `true`
- `enabled`：是否启用插件，默认为 `true`
- `copyOptions`：图标文件复制配置

## 贡献

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
