# @meng-xi/vite-plugin 新插件方案规划

> 基于现有 8 个插件的架构分析，规划下一阶段可扩展的新插件方案
>
> 生成日期：2026-05-31 | 架构版本：0.1.1

---

## 一、现有插件生态总览

| #   | 插件名                 | 功能                  | 使用的 Vite 钩子                                                   | 代码规模 |
| --- | ---------------------- | --------------------- | ------------------------------------------------------------------ | -------- |
| 1   | `buildProgress`        | 终端构建进度条        | config, buildStart, resolveId, transform, writeBundle, closeBundle | ~460 行  |
| 2   | `copyFile`             | 文件/目录复制         | writeBundle                                                        | ~120 行  |
| 3   | `faviconManager`       | Favicon 注入与复制    | transformIndexHtml, writeBundle                                    | ~200 行  |
| 4   | `generateRouter`       | 路由配置自动生成      | configResolved                                                     | ~440 行  |
| 5   | `generateVersion`      | 版本号自动生成        | configResolved, config, writeBundle                                | ~235 行  |
| 6   | `htmlInject`           | HTML 内容注入         | transformIndexHtml, buildEnd                                       | ~195 行  |
| 7   | `loadingManager`       | 全局 Loading 状态管理 | transformIndexHtml                                                 | ~415 行  |
| 8   | `versionUpdateChecker` | 版本更新检查          | transformIndexHtml                                                 | ~120 行  |

### 1.1 架构模式

所有插件均遵循统一架构：

```
BasePlugin<T> (抽象基类)
├── getDefaultOptions()     → 返回插件默认配置
├── validateOptions()       → 使用 Validator 校验配置
├── getPluginName()         → 返回插件名称
├── getEnforce()            → 返回执行时机 (pre/post)
├── addPluginHooks(plugin)  → 注册 Vite 钩子
├── safeExecute()           → 安全执行异步操作
├── safeExecuteSync()       → 安全执行同步操作
├── handleError()           → 统一错误处理 (throw/log/ignore)
└── destroy()               → 销毁清理

createPluginFactory(PluginClass, normalizer?) → 工厂函数
```

### 1.2 可复用的公共模块

| 模块         | 路径                  | 能力                                               |
| ------------ | --------------------- | -------------------------------------------------- |
| `fs`         | `@/common/fs`         | 文件读写、目录检查、文件复制                       |
| `format`     | `@/common/format`     | 日期格式化、命名转换、模板解析、哈希生成           |
| `html`       | `@/common/html`       | HTML 注入（head/body）、标签前注入                 |
| `object`     | `@/common/object`     | 深度合并                                           |
| `script`     | `@/common/script`     | 脚本安全过滤                                       |
| `validation` | `@/common/validation` | 验证器（字段链式校验）、全局名称校验、模板脚本检测 |

---

## 二、新插件方案

---

### 方案 1：`compressAssets` — 构建产物压缩插件

#### 2.1.1 痛点分析

Vite 构建后产物体积大，部署到生产环境时需要 Nginx/Apache 开启 gzip/brotli 静态压缩。但：

- 需要手动在服务器端配置压缩规则
- 部分托管平台（如 GitHub Pages、Vercel）不支持服务端压缩
- 无法提前验证压缩效果
- 缺少压缩率统计报告

#### 2.1.2 核心功能

1. 构建完成后自动对产物进行 gzip / brotli 压缩
2. 支持配置压缩阈值（小于阈值的文件不压缩）
3. 支持按文件扩展名过滤（只压缩 `.js`、`.css`、`.html` 等）
4. 输出压缩率统计报告
5. 可选删除原始文件（仅保留压缩版本）

#### 2.1.3 类型定义

```typescript
// types.ts

interface CompressStats {
	file: string
	originalSize: number
	compressedSize: number
	ratio: number
	algorithm: 'gzip' | 'brotli'
}

interface CompressAssetsOptions extends BasePluginOptions {
	algorithm: 'gzip' | 'brotli' | 'both'
	threshold: number
	deleteOriginalFile: boolean
	includeExtensions: string[]
	excludeExtensions: string[]
	compressionLevel: number
	brotliQuality: number
	reportOutput: string | false
}
```

#### 2.1.4 默认配置

```typescript
{
  algorithm: 'gzip',
  threshold: 1024,
  deleteOriginalFile: false,
  includeExtensions: ['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt'],
  excludeExtensions: [],
  compressionLevel: 9,
  brotliQuality: 11,
  reportOutput: 'compress-report.json'
}
```

#### 2.1.5 实现方案

**文件结构**：

```
plugins/compressAssets/
├── index.ts          # 插件主类 + 工厂函数
├── types.ts          # 类型定义
└── common/
    ├── compress.ts   # 压缩核心逻辑
    ├── filter.ts     # 文件过滤逻辑
    └── report.ts     # 报告生成逻辑
```

**核心钩子**：

```typescript
// index.ts

class CompressAssetsPlugin extends BasePlugin<CompressAssetsOptions> {
	private stats: CompressStats[] = []

	protected getDefaultOptions(): Partial<CompressAssetsOptions> {
		return {
			algorithm: 'gzip',
			threshold: 1024,
			deleteOriginalFile: false,
			includeExtensions: ['.js', '.css', '.html', '.svg', '.json', '.xml', '.txt'],
			excludeExtensions: [],
			compressionLevel: 9,
			brotliQuality: 11,
			reportOutput: 'compress-report.json'
		}
	}

	protected validateOptions(): void {
		this.validator
			.field('algorithm')
			.enum(['gzip', 'brotli', 'both'])
			.field('threshold')
			.number()
			.minValue(0)
			.field('deleteOriginalFile')
			.boolean()
			.field('compressionLevel')
			.number()
			.minValue(1)
			.maxValue(9)
			.field('brotliQuality')
			.number()
			.minValue(1)
			.maxValue(11)
			.validate()
	}

	protected getPluginName(): string {
		return 'compress-assets'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.writeBundle = {
			order: 'post',
			handler: async () => {
				await this.safeExecute(() => this.compressFiles(), '压缩构建产物')
			}
		}

		plugin.buildEnd = {
			order: 'post',
			handler: () => {
				this.logReport()
			}
		}
	}

	private async compressFiles(): Promise<void> {
		const outDir = this.viteConfig!.build.outDir
		// 1. 扫描输出目录中的所有文件
		// 2. 按扩展名和阈值过滤
		// 3. 逐文件执行压缩
		// 4. 记录统计数据
		// 5. 可选删除原文件
		// 6. 生成报告文件
	}

	private logReport(): void {
		if (this.stats.length === 0) return
		const totalOriginal = this.stats.reduce((s, i) => s + i.originalSize, 0)
		const totalCompressed = this.stats.reduce((s, i) => s + i.compressedSize, 0)
		const ratio = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1)
		this.logger.success(`压缩完成：${this.stats.length} 个文件，总体压缩率 ${ratio}%`)
	}
}

export const compressAssets = createPluginFactory(CompressAssetsPlugin)
export * from './types'
```

**压缩核心逻辑**：

```typescript
// common/compress.ts

import { createGzip, createBrotliCompress } from 'node:zlib'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

export async function compressFile(filePath: string, algorithm: 'gzip' | 'brotli', level: number): Promise<{ compressedSize: number }> {
	const ext = algorithm === 'gzip' ? '.gz' : '.br'
	const outputPath = filePath + ext

	const compressor = algorithm === 'gzip' ? createGzip({ level }) : createBrotliCompress({ params: { [constants.BROTLI_PARAM_QUALITY]: level } })

	await pipeline(createReadStream(filePath), compressor, createWriteStream(outputPath))

	const stat = await statAsync(outputPath)
	return { compressedSize: stat.size }
}
```

#### 2.1.6 使用示例

```typescript
import { defineConfig } from 'vite'
import { compressAssets } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		compressAssets({
			algorithm: 'both',
			threshold: 2048,
			compressionLevel: 9,
			reportOutput: 'compress-report.json'
		})
	]
})
```

#### 2.1.7 依赖

- `node:zlib`（Node.js 内置，无需额外安装）
- 复用 `@/common/fs`（文件读写、目录遍历）

---

### 方案 2：`envGuard` — 环境变量守卫插件

#### 2.2.1 痛点分析

- 项目部署后因缺少环境变量导致运行时崩溃，开发期无感知
- 环境变量类型错误（期望 number 实际为 string）难以排查
- 团队协作时新成员不清楚需要配置哪些环境变量
- `.env` 文件缺少模板，容易遗漏

#### 2.2.2 核心功能

1. 构建前校验必需的环境变量是否存在
2. 支持类型校验（string / number / url / boolean）
3. 支持自定义校验规则（正则、函数）
4. 支持 `.env` 模板自动生成
5. 构建时将校验结果注入为运行时守卫代码

#### 2.2.3 类型定义

```typescript
// types.ts

type EnvType = 'string' | 'number' | 'url' | 'boolean'

interface EnvFieldRule {
	type: EnvType
	required?: boolean
	pattern?: RegExp
	validator?: (value: string) => boolean
	message?: string
	default?: string
}

interface EnvGuardOptions extends BasePluginOptions {
	required: Record<string, EnvFieldRule>
	failAction: 'error' | 'warn' | 'remove'
	generateTemplate: boolean
	templateOutput: string
	runtimeGuard: boolean
	runtimeGlobalName: string
	envFiles: string[]
}
```

#### 2.2.4 默认配置

```typescript
{
  required: {},
  failAction: 'error',
  generateTemplate: true,
  templateOutput: '.env.template',
  runtimeGuard: false,
  runtimeGlobalName: '__ENV_GUARD__',
  envFiles: ['.env', '.env.local', '.env.production', '.env.development']
}
```

#### 2.2.5 实现方案

**文件结构**：

```
plugins/envGuard/
├── index.ts
├── types.ts
└── common/
    ├── validator.ts    # 环境变量校验逻辑
    ├── template.ts     # 模板生成逻辑
    └── runtime.ts      # 运行时守卫代码生成
```

**核心钩子**：

```typescript
class EnvGuardPlugin extends BasePlugin<EnvGuardOptions> {
	private missingVars: string[] = []
	private invalidVars: string[] = []

	protected getDefaultOptions(): Partial<EnvGuardOptions> {
		return {
			required: {},
			failAction: 'error',
			generateTemplate: true,
			templateOutput: '.env.template',
			runtimeGuard: false,
			runtimeGlobalName: '__ENV_GUARD__',
			envFiles: ['.env', '.env.local', '.env.production', '.env.development']
		}
	}

	protected validateOptions(): void {
		this.validator.field('failAction').enum(['error', 'warn', 'remove']).field('generateTemplate').boolean().field('runtimeGuard').boolean().validate()
	}

	protected getPluginName(): string {
		return 'env-guard'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.configResolved = () => {
			this.validateEnvironment()
			this.handleResults()

			if (this.options.generateTemplate) {
				this.generateEnvTemplate()
			}
		}

		if (this.options.runtimeGuard) {
			plugin.transformIndexHtml = {
				order: 'post',
				handler: (html: string) => {
					const guardCode = this.generateRuntimeGuard()
					// 注入到 </head> 前
					return injectBeforeTag(html, '</head>', guardCode).html
				}
			}
		}
	}

	private validateEnvironment(): void {
		for (const [key, rule] of Object.entries(this.options.required)) {
			const value = process.env[key]

			if (!value) {
				if (rule.required !== false) {
					this.missingVars.push(key)
				}
				continue
			}

			if (!this.validateValue(value, rule)) {
				this.invalidVars.push(key)
			}
		}
	}

	private validateValue(value: string, rule: EnvFieldRule): boolean {
		switch (rule.type) {
			case 'number':
				return !isNaN(Number(value))
			case 'url':
				try {
					new URL(value)
					return true
				} catch {
					return false
				}
			case 'boolean':
				return ['true', 'false', '1', '0'].includes(value.toLowerCase())
			case 'string':
			default:
				break
		}

		if (rule.pattern && !rule.pattern.test(value)) return false
		if (rule.validator && !rule.validator(value)) return false

		return true
	}

	private handleResults(): void {
		if (this.missingVars.length > 0) {
			const msg = `缺少必需的环境变量: ${this.missingVars.join(', ')}`
			if (this.options.failAction === 'error') {
				throw new Error(msg)
			}
			this.logger.warn(msg)
		}

		if (this.invalidVars.length > 0) {
			const msg = `环境变量类型校验失败: ${this.invalidVars.join(', ')}`
			if (this.options.failAction === 'error') {
				throw new Error(msg)
			}
			this.logger.warn(msg)
		}

		if (this.missingVars.length === 0 && this.invalidVars.length === 0) {
			this.logger.success('所有环境变量校验通过')
		}
	}

	private generateEnvTemplate(): void {
		// 根据 required 配置自动生成 .env.template 文件
	}

	private generateRuntimeGuard(): string {
		// 生成运行时环境变量守卫代码
		return `<script>...</script>`
	}
}

export const envGuard = createPluginFactory(EnvGuardPlugin)
export * from './types'
```

#### 2.2.6 使用示例

```typescript
import { defineConfig } from 'vite'
import { envGuard } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		envGuard({
			required: {
				VITE_API_BASE_URL: {
					type: 'url',
					required: true,
					message: 'API 基础地址必须为合法 URL'
				},
				VITE_APP_TITLE: {
					type: 'string',
					required: true
				},
				VITE_ENABLE_ANALYTICS: {
					type: 'boolean',
					required: false,
					default: 'false'
				},
				VITE_API_TIMEOUT: {
					type: 'number',
					pattern: /^\d+$/,
					message: 'API 超时时间必须为数字'
				}
			},
			failAction: 'error',
			generateTemplate: true,
			runtimeGuard: true
		})
	]
})
```

#### 2.2.7 依赖

- 复用 `@/common/html`（injectBeforeTag）
- 复用 `@/common/fs`（writeFileContent）
- 复用 `@/common/format`（模板生成）
- 无额外 npm 依赖

---

### 方案 3：`imageOptimizer` — 图片优化插件

#### 2.3.1 痛点分析

- 前端项目图片资源体积大，影响首屏加载性能
- 手动使用 TinyPNG 等工具效率低，无法集成到构建流程
- 缺少格式转换能力（PNG → WebP）
- 缺少优化统计报告

#### 2.3.2 核心功能

1. 构建时自动压缩图片（JPEG/PNG/WebP/SVG）
2. 支持格式转换（PNG → WebP、JPEG → WebP）
3. 支持配置质量参数
4. 支持按目录/扩展名过滤
5. 输出优化统计报告（压缩率、节省体积）

#### 2.3.3 类型定义

```typescript
// types.ts

interface ImageOptimizeStats {
	file: string
	originalSize: number
	optimizedSize: number
	ratio: number
	format: string
}

interface ImageOptimizerOptions extends BasePluginOptions {
	quality: number
	convertToWebp: boolean
	webpQuality: number
	includeExtensions: string[]
	excludePaths: string[]
	svgoPlugins: Record<string, object>[]
	keepOriginal: boolean
	reportOutput: string | false
}
```

#### 2.3.4 默认配置

```typescript
{
  quality: 80,
  convertToWebp: false,
  webpQuality: 75,
  includeExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
  excludePaths: [],
  svgoPlugins: [
    { name: 'removeViewBox', active: false },
    { name: 'removeEmptyContainers', active: true }
  ],
  keepOriginal: true,
  reportOutput: 'image-optimize-report.json'
}
```

#### 2.3.5 实现方案

**文件结构**：

```
plugins/imageOptimizer/
├── index.ts
├── types.ts
└── common/
    ├── compress.ts     # 图片压缩核心逻辑
    ├── convert.ts      # 格式转换逻辑
    ├── svg.ts          # SVG 优化逻辑
    └── report.ts       # 报告生成逻辑
```

**核心钩子**：

```typescript
class ImageOptimizerPlugin extends BasePlugin<ImageOptimizerOptions> {
	private stats: ImageOptimizeStats[] = []

	protected getDefaultOptions(): Partial<ImageOptimizerOptions> {
		return {
			quality: 80,
			convertToWebp: false,
			webpQuality: 75,
			includeExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
			excludePaths: [],
			svgoPlugins: [],
			keepOriginal: true,
			reportOutput: 'image-optimize-report.json'
		}
	}

	protected validateOptions(): void {
		this.validator.field('quality').number().minValue(1).maxValue(100).field('convertToWebp').boolean().field('webpQuality').number().minValue(1).maxValue(100).field('keepOriginal').boolean().validate()
	}

	protected getPluginName(): string {
		return 'image-optimizer'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.writeBundle = {
			order: 'post',
			handler: async () => {
				await this.safeExecute(() => this.optimizeImages(), '优化图片资源')
			}
		}
	}

	private async optimizeImages(): Promise<void> {
		const outDir = this.viteConfig!.build.outDir
		// 1. 扫描输出目录中的图片文件
		// 2. 按扩展名和路径过滤
		// 3. 逐文件执行压缩
		// 4. 可选格式转换（WebP）
		// 5. 记录统计数据
		// 6. 可选删除原文件
		// 7. 生成报告
	}
}

export const imageOptimizer = createPluginFactory(ImageOptimizerPlugin)
export * from './types'
```

#### 2.3.6 使用示例

```typescript
import { defineConfig } from 'vite'
import { imageOptimizer } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		imageOptimizer({
			quality: 80,
			convertToWebp: true,
			webpQuality: 75,
			excludePaths: ['assets/icons'],
			keepOriginal: true
		})
	]
})
```

#### 2.3.7 依赖

- **`sharp`**（需新增 npm 依赖）— 图片压缩和格式转换核心库
- **`svgo`**（需新增 npm 依赖）— SVG 优化库
- 复用 `@/common/fs`（文件读写、目录遍历）

> **注意**：`sharp` 是原生模块，安装时需要编译环境。可考虑提供 `optionalDependencies` 或降级方案（跳过优化）。

---

### 方案 4：`autoImport` — 自动导入插件

#### 2.4.1 痛点分析

- 每个文件都要手动 `import` Vue/React API、工具函数、组件，代码冗余
- 忘记导入导致运行时错误
- 组件注册繁琐，全局注册影响 Tree-shaking
- 缺少类型提示，IDE 体验差

#### 2.4.2 核心功能

1. 自动注入预设的 import 语句
2. 支持按目录扫描组件并自动注册
3. 支持自定义映射（如 `ref` → `import { ref } from 'vue'`）
4. 生成 TypeScript 类型声明文件（`.d.ts`）
5. 支持按环境条件导入

#### 2.4.3 类型定义

```typescript
// types.ts

interface ImportMapping {
	module: string
	names: string[]
	defaultImport?: boolean
}

interface AutoImportOptions extends BasePluginOptions {
	imports: Record<string, string[]> | ImportMapping[]
	dirs: string[]
	dts: string | boolean
	vueTemplate: boolean
	ignore: string[]
	fileFilter: RegExp
	injectAtPosition: 'top' | 'after-last-import'
}
```

#### 2.4.4 默认配置

```typescript
{
  imports: {},
  dirs: [],
  dts: 'auto-imports.d.ts',
  vueTemplate: false,
  ignore: [],
  fileFilter: /\.(vue|jsx|tsx|ts|js|mjs)$/,
  injectAtPosition: 'top'
}
```

#### 2.4.5 实现方案

**文件结构**：

```
plugins/autoImport/
├── index.ts
├── types.ts
└── common/
    ├── scanner.ts      # 目录扫描逻辑
    ├── injector.ts     # import 注入逻辑
    ├── dts.ts          # 类型声明生成
    └── transform.ts    # 代码转换逻辑
```

**核心钩子**：

```typescript
class AutoImportPlugin extends BasePlugin<AutoImportOptions> {
	private importMap: Map<string, { module: string; name: string }[]> = new Map()
	private scannedComponents: Map<string, string> = new Map()

	protected getDefaultOptions(): Partial<AutoImportOptions> {
		return {
			imports: {},
			dirs: [],
			dts: 'auto-imports.d.ts',
			vueTemplate: false,
			ignore: [],
			fileFilter: /\.(vue|jsx|tsx|ts|js|mjs)$/,
			injectAtPosition: 'top'
		}
	}

	protected validateOptions(): void {
		this.validator
			.field('dts')
			.custom(v => v === false || typeof v === 'string', 'dts 必须为 false 或字符串路径')
			.field('vueTemplate')
			.boolean()
			.field('injectAtPosition')
			.enum(['top', 'after-last-import'])
			.validate()
	}

	protected getPluginName(): string {
		return 'auto-import'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.configResolved = async () => {
			// 1. 解析 imports 配置，构建映射表
			// 2. 扫描 dirs 目录，发现组件
			this.buildImportMap()
			await this.scanDirectories()
		}

		plugin.transform = {
			handler: (code: string, id: string) => {
				if (!this.options.fileFilter.test(id)) return null
				return this.transformCode(code, id)
			}
		}

		plugin.buildEnd = () => {
			if (this.options.dts) {
				this.generateDts()
			}
		}
	}

	private transformCode(code: string, id: string): { code: string; map?: any } | null {
		// 1. 分析代码中使用的标识符
		// 2. 匹配 importMap 中的映射
		// 3. 生成 import 语句
		// 4. 插入到代码顶部或最后一个 import 之后
		return null
	}

	private generateDts(): void {
		// 生成 .d.ts 类型声明文件
	}
}

export const autoImport = createPluginFactory(AutoImportPlugin)
export * from './types'
```

#### 2.4.6 使用示例

```typescript
import { defineConfig } from 'vite'
import { autoImport } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		autoImport({
			imports: {
				vue: ['ref', 'reactive', 'computed', 'watch', 'onMounted'],
				'vue-router': ['useRouter', 'useRoute']
			},
			dirs: ['src/composables', 'src/stores'],
			dts: 'src/auto-imports.d.ts',
			vueTemplate: true
		})
	]
})
```

#### 2.4.7 依赖

- **`acorn`**（需新增 npm 依赖）— 轻量级 JS 解析器，用于分析代码中的标识符使用
- 复用 `@/common/fs`（文件读写、目录扫描）
- 复用 `@/common/format`（命名转换）

---

### 方案 5：`bundleAnalyzer` — 构建产物分析插件

#### 2.5.1 痛点分析

- 构建产物体积膨胀，难以定位哪些模块占用空间最大
- 缺少可视化的依赖关系和体积分布
- 无法感知版本迭代间的体积变化趋势
- 优化缺乏数据支撑

#### 2.5.2 核心功能

1. 生成模块依赖树和体积统计
2. 支持 JSON 报告和 HTML 可视化图表
3. 支持设置体积阈值告警
4. 支持对比两次构建的体积变化
5. 输出 Top N 大模块排行

#### 2.5.3 类型定义

```typescript
// types.ts

interface ModuleStats {
	id: string
	size: number
	gzipSize: number
	chunks: string[]
	imports: string[]
	isEntry: boolean
}

interface ChunkStats {
	name: string
	size: number
	gzipSize: number
	modules: ModuleStats[]
}

interface BundleAnalysisResult {
	timestamp: string
	totalSize: number
	totalGzipSize: number
	chunks: ChunkStats[]
	topModules: ModuleStats[]
	warnings: string[]
}

interface BundleAnalyzerOptions extends BasePluginOptions {
	outputFormat: 'json' | 'html' | 'both'
	outputFile: string
	openAnalyzer: boolean
	sizeThreshold: number
	topModules: number
	compareWith: string | null
	gzipSize: boolean
	excludeNodeModules: boolean
}
```

#### 2.5.4 默认配置

```typescript
{
  outputFormat: 'json',
  outputFile: 'bundle-analysis.json',
  openAnalyzer: false,
  sizeThreshold: 100,
  topModules: 20,
  compareWith: null,
  gzipSize: true,
  excludeNodeModules: false
}
```

#### 2.5.5 实现方案

**文件结构**：

```
plugins/bundleAnalyzer/
├── index.ts
├── types.ts
└── common/
    ├── analyzer.ts     # 产物分析核心逻辑
    ├── reporter.ts     # JSON/HTML 报告生成
    ├── comparator.ts   # 版本对比逻辑
    └── templates/
        └── chart.html  # HTML 可视化模板
```

**核心钩子**：

```typescript
class BundleAnalyzerPlugin extends BasePlugin<BundleAnalyzerOptions> {
	private analysisResult: BundleAnalysisResult | null = null

	protected getDefaultOptions(): Partial<BundleAnalyzerOptions> {
		return {
			outputFormat: 'json',
			outputFile: 'bundle-analysis.json',
			openAnalyzer: false,
			sizeThreshold: 100,
			topModules: 20,
			compareWith: null,
			gzipSize: true,
			excludeNodeModules: false
		}
	}

	protected validateOptions(): void {
		this.validator
			.field('outputFormat')
			.enum(['json', 'html', 'both'])
			.field('openAnalyzer')
			.boolean()
			.field('sizeThreshold')
			.number()
			.minValue(0)
			.field('topModules')
			.number()
			.minValue(1)
			.field('gzipSize')
			.boolean()
			.validate()
	}

	protected getPluginName(): string {
		return 'bundle-analyzer'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.writeBundle = {
			order: 'post',
			handler: async () => {
				await this.safeExecute(() => this.analyzeBundle(), '分析构建产物')
			}
		}

		plugin.buildEnd = () => {
			if (this.analysisResult) {
				this.logSummary()
				this.checkThresholds()
				this.generateReport()
			}
		}
	}

	private async analyzeBundle(): Promise<void> {
		// 1. 读取输出目录中的所有 chunk 文件
		// 2. 解析每个 chunk 的模块组成
		// 3. 计算模块体积和 gzip 体积
		// 4. 构建依赖关系图
		// 5. 排序生成 Top N 模块
	}

	private checkThresholds(): void {
		for (const chunk of this.analysisResult!.chunks) {
			if (chunk.size / 1024 > this.options.sizeThreshold) {
				this.logger.warn(`Chunk "${chunk.name}" 超过阈值: ${(chunk.size / 1024).toFixed(1)}KB > ${this.options.sizeThreshold}KB`)
			}
		}
	}

	private generateReport(): void {
		// 根据 outputFormat 生成 JSON / HTML 报告
		// 如果 compareWith 有值，生成对比报告
	}

	private logSummary(): void {
		const result = this.analysisResult!
		this.logger.success(`产物分析完成: ${result.chunks.length} 个 chunk, 总体积 ${(result.totalSize / 1024).toFixed(1)}KB`)
	}
}

export const bundleAnalyzer = createPluginFactory(BundleAnalyzerPlugin)
export * from './types'
```

#### 2.5.6 使用示例

```typescript
import { defineConfig } from 'vite'
import { bundleAnalyzer } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		bundleAnalyzer({
			outputFormat: 'both',
			sizeThreshold: 200,
			topModules: 30,
			gzipSize: true,
			compareWith: 'bundle-analysis-prev.json'
		})
	]
})
```

#### 2.5.7 依赖

- 复用 `@/common/fs`（文件读写）
- 复用 `@/common/format`（格式化、模板生成）
- 无额外 npm 依赖（HTML 图表使用内联 SVG/Canvas，不依赖第三方图表库）

---

### 方案 6：`proxyManager` — 开发代理管理插件

#### 2.6.1 痛点分析

- Vite 原生 `server.proxy` 配置繁琐，多环境切换不便
- 代理规则分散在 `vite.config.ts` 中，难以复用和维护
- 缺少代理请求/响应日志，调试困难
- 无法模拟慢网络环境

#### 2.6.2 核心功能

1. 声明式代理规则配置，支持环境切换
2. 支持代理规则文件（`.proxyrc.ts`）
3. 支持代理请求/响应日志
4. 支持请求重写和响应修改
5. 支持代理延迟模拟（mock 慢网络）

#### 2.6.3 类型定义

```typescript
// types.ts

interface ProxyRule {
	context: string | RegExp
	target: string
	changeOrigin?: boolean
	secure?: boolean
	rewrite?: (path: string) => string
	headers?: Record<string, string>
	env?: string[]
	delay?: number | { min: number; max: number }
	modifyResponse?: (body: any, proxyRes: any) => any
}

interface ProxyManagerOptions extends BasePluginOptions {
	rules: ProxyRule[]
	configFile: string | false
	logLevel: 'none' | 'basic' | 'verbose'
	defaultDelay: number | { min: number; max: number } | false
	envPrefix: string
}
```

#### 2.6.4 默认配置

```typescript
{
  rules: [],
  configFile: '.proxyrc.ts',
  logLevel: 'basic',
  defaultDelay: false,
  envPrefix: 'PROXY_'
}
```

#### 2.6.5 实现方案

**文件结构**：

```
plugins/proxyManager/
├── index.ts
├── types.ts
└── common/
    ├── loader.ts       # 规则文件加载
    ├── matcher.ts      # 请求匹配逻辑
    ├── logger.ts       # 代理日志
    └── middleware.ts    # 中间件逻辑
```

**核心钩子**：

```typescript
class ProxyManagerPlugin extends BasePlugin<ProxyManagerOptions> {
	private activeRules: ProxyRule[] = []

	protected getDefaultOptions(): Partial<ProxyManagerOptions> {
		return {
			rules: [],
			configFile: '.proxyrc.ts',
			logLevel: 'basic',
			defaultDelay: false,
			envPrefix: 'PROXY_'
		}
	}

	protected validateOptions(): void {
		this.validator.field('logLevel').enum(['none', 'basic', 'verbose']).validate()
	}

	protected getPluginName(): string {
		return 'proxy-manager'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.config = () => {
			this.loadRules()
			this.filterRulesByEnv()

			const proxyConfig: Record<string, any> = {}
			for (const rule of this.activeRules) {
				proxyConfig[rule.context.toString()] = {
					target: rule.target,
					changeOrigin: rule.changeOrigin ?? true,
					secure: rule.secure ?? false,
					rewrite: rule.rewrite,
					headers: rule.headers
				}
			}

			return { server: { proxy: proxyConfig } }
		}

		plugin.configureServer = server => {
			if (this.options.logLevel !== 'none') {
				server.middlewares.use(this.createLoggingMiddleware())
			}

			if (this.options.defaultDelay) {
				server.middlewares.use(this.createDelayMiddleware())
			}
		}
	}

	private loadRules(): void {
		// 加载规则：优先使用 rules 配置，其次加载 configFile
	}

	private filterRulesByEnv(): void {
		const currentEnv = process.env.NODE_ENV || 'development'
		this.activeRules = this.options.rules.filter(rule => {
			if (!rule.env || rule.env.length === 0) return true
			return rule.env.includes(currentEnv)
		})
	}
}

export const proxyManager = createPluginFactory(ProxyManagerPlugin)
export * from './types'
```

#### 2.6.6 使用示例

```typescript
import { defineConfig } from 'vite'
import { proxyManager } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		proxyManager({
			rules: [
				{
					context: '/api',
					target: 'http://localhost:3000',
					changeOrigin: true,
					env: ['development']
				},
				{
					context: '/upload',
					target: 'http://oss.example.com',
					changeOrigin: true,
					rewrite: path => path.replace(/^\/upload/, '/v2/files'),
					env: ['development', 'staging']
				}
			],
			logLevel: 'verbose',
			defaultDelay: { min: 100, max: 500 }
		})
	]
})
```

#### 2.6.7 依赖

- 复用 `@/common/fs`（文件读取、配置加载）
- 无额外 npm 依赖

---

### 方案 7：`scaffoldGenerator` — 脚手架代码生成插件

#### 2.7.1 痛点分析

- 新建页面/组件时需要手动创建文件、编写模板代码、注册路由，重复劳动多
- 团队成员创建的文件结构不统一
- 缺少标准化的代码模板

#### 2.7.2 核心功能

1. 基于模板自动生成页面/组件/模块代码
2. 支持自定义模板（使用 EJS 语法）
3. 自动注册到路由配置（与 `generateRouter` 联动）
4. 支持 CLI 交互式创建
5. 支持模板变量（名称、日期、作者等）

#### 2.7.3 类型定义

```typescript
// types.ts

interface ScaffoldTemplate {
	name: string
	directory: string
	outputDir: string
	files: ScaffoldFile[]
	variables: Record<string, string | ((name: string) => string)>
	postCreate?: (name: string, outputDir: string) => void | Promise<void>
}

interface ScaffoldFile {
	template: string
	output: string
}

interface ScaffoldGeneratorOptions extends BasePluginOptions {
	templates: Record<string, ScaffoldTemplate>
	defaultAuthor: string
	autoRegisterRoute: boolean
	routeConfigPath: string
	templateEngine: 'ejs' | 'handlebars'
	devServerEndpoint: string | false
}
```

#### 2.7.4 默认配置

```typescript
{
  templates: {},
  defaultAuthor: '',
  autoRegisterRoute: false,
  routeConfigPath: 'src/router.config.ts',
  templateEngine: 'ejs',
  devServerEndpoint: '/__scaffold__'
}
```

#### 2.7.5 实现方案

**文件结构**：

```
plugins/scaffoldGenerator/
├── index.ts
├── types.ts
└── common/
    ├── engine.ts       # 模板引擎封装
    ├── generator.ts    # 文件生成逻辑
    ├── routeSync.ts    # 路由注册同步
    └── server.ts       # 开发服务器中间件
```

**核心钩子**：

```typescript
class ScaffoldGeneratorPlugin extends BasePlugin<ScaffoldGeneratorOptions> {
	protected getDefaultOptions(): Partial<ScaffoldGeneratorOptions> {
		return {
			templates: {},
			defaultAuthor: '',
			autoRegisterRoute: false,
			routeConfigPath: 'src/router.config.ts',
			templateEngine: 'ejs',
			devServerEndpoint: '/__scaffold__'
		}
	}

	protected validateOptions(): void {
		this.validator.field('autoRegisterRoute').boolean().field('templateEngine').enum(['ejs', 'handlebars']).validate()
	}

	protected getPluginName(): string {
		return 'scaffold-generator'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.configureServer = server => {
			if (this.options.devServerEndpoint) {
				server.middlewares.use(this.options.devServerEndpoint, this.createScaffoldMiddleware())
			}
		}
	}

	private createScaffoldMiddleware() {
		return async (req: any, res: any) => {
			// 解析请求参数
			// 调用 generate 方法
			// 返回结果
		}
	}

	public async generate(templateName: string, name: string, variables?: Record<string, string>): Promise<void> {
		const template = this.options.templates[templateName]
		if (!template) throw new Error(`模板 "${templateName}" 不存在`)

		// 1. 合并变量
		// 2. 渲染模板
		// 3. 创建文件
		// 4. 可选注册路由
		// 5. 执行 postCreate 钩子
	}
}

export const scaffoldGenerator = createPluginFactory(ScaffoldGeneratorPlugin)
export * from './types'
```

#### 2.7.6 使用示例

```typescript
import { defineConfig } from 'vite'
import { scaffoldGenerator } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		scaffoldGenerator({
			templates: {
				page: {
					name: '页面',
					directory: 'templates/page',
					outputDir: 'src/pages',
					files: [
						{ template: 'index.vue.ejs', output: '{{name}}/index.vue' },
						{ template: 'types.ts.ejs', output: '{{name}}/types.ts' }
					],
					variables: {
						author: 'MengXi',
						date: () => new Date().toISOString().split('T')[0]
					}
				},
				component: {
					name: '组件',
					directory: 'templates/component',
					outputDir: 'src/components',
					files: [{ template: 'index.vue.ejs', output: '{{PascalName}}.vue' }],
					variables: {
						author: 'MengXi'
					}
				}
			},
			autoRegisterRoute: true,
			defaultAuthor: 'MengXi Developer'
		})
	]
})
```

#### 2.7.7 依赖

- **`ejs`**（需新增 npm 依赖）— 模板引擎
- 复用 `@/common/fs`（文件读写）
- 复用 `@/common/format`（命名转换 toPascalCase/toCamelCase）

---

### 方案 8：`assetManifest` — 资源清单生成插件

#### 2.8.1 痛点分析

- CDN 部署时需要知道构建产物的精确文件名（含 hash）
- Service Worker 缓存策略需要资源映射清单
- SSR 渲染时需要预加载关键资源
- 多页应用需要按入口加载对应资源

#### 2.8.2 核心功能

1. 构建后生成资源映射清单（`manifest.json`）
2. 支持多种清单格式（Vite 标准 / Webpack 兼容 / 自定义）
3. 支持按入口/分块分组
4. 支持注入运行时清单（通过全局变量或 `<script>` 标签）
5. 支持自定义清单字段

#### 2.8.3 类型定义

```typescript
// types.ts

interface AssetMap {
	[key: string]: string
}

interface AssetGroup {
	entry: string
	assets: {
		js: string[]
		css: string[]
		other: string[]
	}
}

interface AssetManifestResult {
	version: string
	timestamp: string
	publicPath: string
	assets: AssetMap
	groups?: AssetGroup[]
}

interface AssetManifestOptions extends BasePluginOptions {
	outputFormat: 'vite' | 'webpack' | 'custom'
	outputFile: string
	includeExtensions: string[]
	publicPath: string
	injectRuntime: boolean
	runtimeGlobalName: string
	customFormatter: ((manifest: AssetMap) => Record<string, any>) | null
	groupByEntry: boolean
}
```

#### 2.8.4 默认配置

```typescript
{
  outputFormat: 'vite',
  outputFile: 'manifest.json',
  includeExtensions: ['.js', '.css', '.html', '.png', '.jpg', '.svg', '.woff2'],
  publicPath: '/',
  injectRuntime: false,
  runtimeGlobalName: '__ASSET_MANIFEST__',
  customFormatter: null,
  groupByEntry: false
}
```

#### 2.8.5 实现方案

**文件结构**：

```
plugins/assetManifest/
├── index.ts
├── types.ts
└── common/
    ├── scanner.ts      # 产物扫描逻辑
    ├── formatter.ts    # 格式化输出（vite/webpack/custom）
    ├── grouper.ts      # 按入口分组逻辑
    └── injector.ts     # 运行时注入逻辑
```

**核心钩子**：

```typescript
class AssetManifestPlugin extends BasePlugin<AssetManifestOptions> {
	private manifest: AssetManifestResult | null = null

	protected getDefaultOptions(): Partial<AssetManifestOptions> {
		return {
			outputFormat: 'vite',
			outputFile: 'manifest.json',
			includeExtensions: ['.js', '.css', '.html', '.png', '.jpg', '.svg', '.woff2'],
			publicPath: '/',
			injectRuntime: false,
			runtimeGlobalName: '__ASSET_MANIFEST__',
			customFormatter: null,
			groupByEntry: false
		}
	}

	protected validateOptions(): void {
		this.validator.field('outputFormat').enum(['vite', 'webpack', 'custom']).field('injectRuntime').boolean().field('groupByEntry').boolean().validate()
	}

	protected getPluginName(): string {
		return 'asset-manifest'
	}

	protected addPluginHooks(plugin: Plugin): void {
		plugin.writeBundle = {
			order: 'post',
			handler: async () => {
				await this.safeExecute(() => this.generateManifest(), '生成资源清单')
			}
		}

		if (this.options.injectRuntime) {
			plugin.transformIndexHtml = {
				order: 'post',
				handler: (html: string) => {
					const injectCode = this.generateRuntimeInject()
					return injectBeforeTag(html, '</head>', injectCode).html
				}
			}
		}
	}

	private async generateManifest(): Promise<void> {
		const outDir = this.viteConfig!.build.outDir
		// 1. 扫描输出目录
		// 2. 构建资源映射
		// 3. 可选按入口分组
		// 4. 格式化输出
		// 5. 写入文件
	}

	private generateRuntimeInject(): string {
		const json = JSON.stringify(this.manifest?.assets || {})
		return `<script>window.${this.options.runtimeGlobalName}=${json}</script>`
	}
}

export const assetManifest = createPluginFactory(AssetManifestPlugin)
export * from './types'
```

#### 2.8.6 使用示例

```typescript
import { defineConfig } from 'vite'
import { assetManifest } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		assetManifest({
			outputFormat: 'vite',
			publicPath: 'https://cdn.example.com/',
			injectRuntime: true,
			groupByEntry: true
		})
	]
})
```

#### 2.8.7 依赖

- 复用 `@/common/fs`（文件读写、目录扫描）
- 复用 `@/common/html`（injectBeforeTag）
- 复用 `@/common/format`（格式化）
- 无额外 npm 依赖

---

## 三、优先级与实施路线

### 3.1 优先级矩阵

| 优先级 | 插件                | 理由                                                | 额外依赖                | 预估复杂度 |
| ------ | ------------------- | --------------------------------------------------- | ----------------------- | ---------- |
| ⭐⭐⭐ | `compressAssets`    | 几乎所有生产项目必备，现有生态完全缺失              | 无（Node.js 内置 zlib） | 中         |
| ⭐⭐⭐ | `bundleAnalyzer`    | 性能优化刚需，与 buildProgress 形成完整构建可视化   | 无                      | 中高       |
| ⭐⭐⭐ | `envGuard`          | 生产环境安全守卫，与 generateVersion 互补           | 无                      | 低         |
| ⭐⭐   | `autoImport`        | DX 提升显著，开发体验类                             | acorn                   | 高         |
| ⭐⭐   | `assetManifest`     | CDN/SSR 场景刚需，与 generateVersion 形成元数据体系 | 无                      | 中         |
| ⭐⭐   | `imageOptimizer`    | 性能优化常用                                        | sharp, svgo             | 中高       |
| ⭐     | `proxyManager`      | Vite 原生已有基础能力，增量价值                     | 无                      | 中         |
| ⭐     | `scaffoldGenerator` | 团队协作场景有用，非通用刚需                        | ejs                     | 中         |

### 3.2 建议实施顺序

```
Phase 1（基础能力补全）
├── envGuard          → 无额外依赖，复杂度低，快速交付
├── compressAssets    → 无额外依赖，生产必备
└── assetManifest     → 无额外依赖，与现有插件联动

Phase 2（性能与可视化）
├── bundleAnalyzer    → 构建可视化闭环
└── imageOptimizer    → 性能优化（需评估 sharp 原生模块兼容性）

Phase 3（开发体验提升）
├── autoImport        → DX 提升（需评估 acorn 依赖体积）
└── proxyManager      → 开发效率工具

Phase 4（团队协作）
└── scaffoldGenerator → 团队标准化工具
```

### 3.3 依赖关系图

```
compressAssets ──────┐
                     │
envGuard ────────────┤
                     │
assetManifest ───────┤── 共享 BasePlugin + createPluginFactory 架构
                     │   共享 common/ 工具模块 (fs, format, html, validation)
bundleAnalyzer ──────┤
                     │
imageOptimizer ──────┤
                     │
autoImport ──────────┤── 额外依赖: acorn
                     │
proxyManager ────────┤
                     │
scaffoldGenerator ───┘── 额外依赖: ejs
                         联动: generateRouter (路由注册)
```

---

## 四、开发规范

### 4.1 目录结构规范

每个插件必须遵循统一目录结构：

```
plugins/<pluginName>/
├── index.ts          # 插件主类 + 工厂函数导出
├── types.ts          # 类型定义（Options + 其他类型）
└── common/           # 插件内部公共逻辑（可选，复杂插件必须）
    ├── index.ts      # 统一导出
    └── ...
```

### 4.2 命名规范

| 项目                 | 规范                        | 示例                           |
| -------------------- | --------------------------- | ------------------------------ |
| 插件名（camelCase）  | 小驼峰，动词+名词           | `compressAssets`, `envGuard`   |
| 插件名（kebab-case） | 短横线，用于 Vite 插件 name | `compress-assets`, `env-guard` |
| 类名                 | PascalCase + Plugin 后缀    | `CompressAssetsPlugin`         |
| Options 类型         | PascalCase + Options 后缀   | `CompressAssetsOptions`        |
| 工厂函数             | 与插件名一致                | `compressAssets()`             |

### 4.3 必须实现的方法

```typescript
class XxxPlugin extends BasePlugin<XxxOptions> {
	protected getDefaultOptions(): Partial<XxxOptions> // 必须
	protected validateOptions(): void // 必须
	protected getPluginName(): string // 必须
	protected addPluginHooks(plugin: Plugin): void // 必须
	protected getEnforce(): Plugin['enforce'] // 可选，默认 undefined
	protected onConfigResolved(config: ResolvedConfig) // 可选
	protected destroy(): void // 可选（有资源清理时必须）
}
```

### 4.4 测试要求

- 每个插件必须包含单元测试
- 测试覆盖：配置验证、默认值合并、核心功能逻辑、错误处理
- 测试文件路径：`plugins/<pluginName>/__tests__/index.test.ts`

---

## 五、版本规划

| 版本  | 包含插件                                        | 目标         |
| ----- | ----------------------------------------------- | ------------ |
| 0.2.0 | `envGuard` + `compressAssets` + `assetManifest` | 基础能力补全 |
| 0.3.0 | `bundleAnalyzer` + `imageOptimizer`             | 性能与可视化 |
| 0.4.0 | `autoImport` + `proxyManager`                   | 开发体验提升 |
| 0.5.0 | `scaffoldGenerator`                             | 团队协作工具 |
