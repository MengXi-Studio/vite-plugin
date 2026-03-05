# injectIco

在 Vite 构建过程中将网站图标链接注入到 HTML 文件。

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { injectIco } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [injectIco({ base: '/assets' })]
})
```

也可以直接传入字符串作为 base 路径：

```typescript
export default defineConfig({
	plugins: [injectIco('/assets')]
})
```

## 配置选项

| 选项          | 类型                           | 默认值    | 说明                      |
| ------------- | ------------------------------ | --------- | ------------------------- |
| base          | `string`                       | `'/'`     | 图标基础路径              |
| url           | `string`                       | -         | 图标完整 URL（覆盖 base） |
| link          | `string`                       | -         | 自定义 link 标签 HTML     |
| icons         | `IconConfig[]`                 | -         | 自定义图标数组            |
| copyOptions   | `CopyOptions`                  | -         | 图标文件复制配置          |
| enabled       | `boolean`                      | `true`    | 启用插件                  |
| verbose       | `boolean`                      | `true`    | 显示详细日志              |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'` | 错误处理策略              |

### copyOptions 配置

| 选项      | 类型      | 默认值 | 说明           |
| --------- | --------- | ------ | -------------- |
| sourceDir | `string`  | 必填   | 源文件目录     |
| targetDir | `string`  | 必填   | 目标目录       |
| overwrite | `boolean` | `true` | 覆盖已存在文件 |
| recursive | `boolean` | `true` | 递归复制       |

### 配置优先级

`link` > `icons` > `url` > `base + favicon.ico`

## 示例

### 自定义图标数组

```typescript
injectIco({
	icons: [
		{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
		{ rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
		{ rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
	]
})
```

### 完整 URL

```typescript
injectIco({
	url: 'https://example.com/favicon.ico'
})
```

### 自定义 link 标签

```typescript
injectIco({
	link: '<link rel="icon" href="/custom.ico" type="image/x-icon">'
})
```

### 带文件复制

```typescript
injectIco({
	base: '/assets',
	copyOptions: {
		sourceDir: 'src/assets/icons',
		targetDir: 'dist/assets/icons'
	}
})
```

### 完整配置

```typescript
injectIco({
	base: '/assets',
	enabled: true,
	verbose: true,
	copyOptions: {
		sourceDir: 'src/assets/icons',
		targetDir: 'dist/assets/icons',
		overwrite: true,
		recursive: true
	}
})
```

## 注意事项

- 图标链接注入到 HTML 的 `</head>` 标签前
- 未找到 `</head>` 时跳过注入并输出警告
- `copyOptions` 启用时默认使用增量复制
- 不完整的 `copyOptions` 会抛出验证错误
