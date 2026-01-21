<div align="center">
	<a href="https://github.com/MengXi-Studio/vite-plugin">
		<img alt="MengXi Studio Logo" width="215" src="https://github.com/MengXi-Studio/vite-plugin/blob/master/packages/docs/src/public/logo.svg">
	</a>
	<br>
	<br>

[![license](https://img.shields.io/github/license/MengXi-Studio/vite-plugin.svg)](LICENSE)

    <h1>@meng-xi/vite-plugin</h1>

</div>

[![npm](https://img.shields.io/npm/v/@meng-xi/vite-plugin?color=blue)](https://www.npmjs.com/package/@meng-xi/vite-plugin) ![npm](https://img.shields.io/npm/dt/@meng-xi/vite-plugin?color=green)

**English** | [中文](./README.md)

> - This is a toolkit that provides practical plugins for Vite, helping developers simplify the build process and improve development efficiency.
> - Extends Vite build process functionality, providing automated processing solutions for common build tasks.
> - All plugins support detailed configuration options, allowing customization based on project needs to meet different usage scenarios.
> - Plugins provide error handling mechanisms to ensure build processes can catch errors, improving build reliability.
> - Adopts modular design, plugins can be used individually or in combination, flexibly responding to different project needs.

---

Start reading the [documentation](https://mengxi-studio.github.io/vite-plugin/).

## Quick Start

### Installation

Install `@meng-xi/vite-plugin` using a package manager:

```bash
# Using npm
npm install @meng-xi/vite-plugin --save-dev

# Using yarn
yarn add @meng-xi/vite-plugin --save-dev

# Using pnpm
pnpm add @meng-xi/vite-plugin --save-dev
```

### Basic Usage

Import and use the plugins in your Vite configuration file:

```typescript
import { defineConfig } from 'vite'
import { copyFile, injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// Copy file plugin
		copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),

		// Inject icon plugin
		injectIco({
			base: '/assets'
		})
	]
})
```

### Import All

You can also use default import to import all plugins:

```typescript
import { defineConfig } from 'vite'
import vitePlugin from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		// Copy file plugin
		vitePlugin.copyFile({
			sourceDir: 'src/assets',
			targetDir: 'dist/assets'
		}),

		// Inject icon plugin
		vitePlugin.injectIco({
			base: '/assets'
		})
	]
})
```

## Plugin Details

### copyFile Plugin

Used to copy files or directories to specified locations after Vite build is completed.

**Configuration Options**:

- `sourceDir`: Source directory path (required)
- `targetDir`: Target directory path (required)
- `overwrite`: Whether to overwrite existing files, default is `true`
- `recursive`: Whether to recursively copy subdirectories, default is `true`
- `verbose`: Whether to output detailed logs, default is `true`
- `enabled`: Whether to enable the plugin, default is `true`

### injectIco Plugin

Used to inject website icon links into the head of HTML files during the Vite build process.

**Configuration Options**:

- `base`: Base path for icon files
- `url`: Complete URL for the icon
- `link`: Custom complete link tag HTML
- `icons`: Custom icon array
- `verbose`: Whether to output detailed logs, default is `true`
- `enabled`: Whether to enable the plugin, default is `true`
- `copyOptions`: Icon file copying configuration

## Contribution

Welcome to contribute to `@meng-xi/vite-plugin`. Here are the steps to contribute code:

1. Fork the project: Fork this project on GitHub.
2. Clone the code: Clone the forked project to your local machine.

```bash
git clone https://github.com/your-username/vite-plugin.git
cd vite-plugin
```

3. Create a new branch: Create a new feature branch based on the `master` branch.

```bash
git checkout -b feature/your-feature
```

4. Commit changes: Ensure your code passes tests and commit your changes with clear commit messages.

```bash
git add .
git commit -m "feat: add your feature description"
```

5. Push changes: Push your local branch to GitHub.

```bash
git push origin feature/your-feature
```

6. Create a PR: Create a Pull Request on GitHub and wait for review.
