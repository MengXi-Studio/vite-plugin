# envGuard

在 Vite 构建前校验环境变量的存在性和合法性，支持类型检查、范围验证、自定义规则和运行时守卫。

## 导入方式

```typescript
// 子模块独立导入（推荐）
import { envGuard } from '@meng-xi/vite-plugin/plugins/env-guard'
import type { EnvGuardOptions, EnvGuardResult, EnvFailAction, RuntimeGuardMode } from '@meng-xi/vite-plugin/plugins/env-guard'

// barrel 导入
import { envGuard } from '@meng-xi/vite-plugin'
```

## 快速开始

```typescript
import { defineConfig } from 'vite'
import { envGuard } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		envGuard({
			required: {
				VITE_API_URL: { type: 'url', required: true },
				VITE_APP_TITLE: { type: 'string', minLength: 1, maxLength: 50 }
			},
			failAction: 'error'
		})
	]
})
```

## 配置选项

| 选项                | 类型                                | 默认值                                                          | 说明                       |
| ------------------- | ----------------------------------- | --------------------------------------------------------------- | -------------------------- |
| required            | `Record<string, EnvFieldRule>`      | `{}`                                                            | 环境变量校验规则映射       |
| failAction          | `'error' \| 'warn' \| 'ignore'`     | `'error'`                                                       | 校验失败时的处理动作       |
| generateTemplate    | `boolean`                           | `true`                                                          | 是否自动生成 .env 模板文件 |
| templateOutput      | `string`                            | `'.env.template'`                                               | .env 模板文件的输出路径    |
| runtimeGuard        | `boolean`                           | `false`                                                         | 是否注入运行时守卫代码     |
| runtimeGlobalName   | `string`                            | `'__ENV_GUARD__'`                                               | 运行时守卫的全局变量名     |
| runtimeGuardMode    | `'console' \| 'throw' \| 'overlay'` | `'console'`                                                     | 运行时守卫的行为模式       |
| envFiles            | `string[]`                          | `['.env', '.env.local', '.env.production', '.env.development']` | 需要加载的 .env 文件路径   |
| autoLoadEnv         | `boolean`                           | `true`                                                          | 是否自动加载 .env 文件     |
| reportOutput        | `string \| false`                   | `false`                                                         | 校验报告输出路径           |
| validateBeforeBuild | `boolean`                           | `true`                                                          | 是否在构建前执行校验       |
| showSummary         | `boolean`                           | `true`                                                          | 是否输出校验摘要日志       |
| enabled             | `boolean`                           | `true`                                                          | 启用插件                   |
| verbose             | `boolean`                           | `true`                                                          | 显示详细日志               |
| errorStrategy       | `'throw' \| 'log' \| 'ignore'`      | `'throw'`                                                       | 错误处理策略               |

## EnvFieldRule

每个环境变量的校验规则配置。

| 属性       | 类型                                                                                   | 说明                          |
| ---------- | -------------------------------------------------------------------------------------- | ----------------------------- |
| type       | `'string' \| 'number' \| 'url' \| 'boolean' \| 'enum' \| 'json' \| 'semver' \| 'path'` | 值类型校验                    |
| required   | `boolean`                                                                              | 是否必需                      |
| default    | `string`                                                                               | 缺省默认值                    |
| message    | `string`                                                                               | 校验失败时的自定义提示信息    |
| pattern    | `RegExp`                                                                               | 正则匹配校验                  |
| custom     | `(value: string) => boolean`                                                           | 自定义校验函数                |
| minValue   | `number`                                                                               | 最小值（number 类型）         |
| maxValue   | `number`                                                                               | 最大值（number 类型）         |
| minLength  | `number`                                                                               | 最小长度（string 类型）       |
| maxLength  | `number`                                                                               | 最大长度（string 类型）       |
| enumValues | `string[]`                                                                             | 允许的枚举值列表（enum 类型） |

## EnvFailAction

校验失败时的处理动作：

| 值       | 说明                     |
| -------- | ------------------------ |
| `error`  | 抛出错误，中断构建流程   |
| `warn`   | 输出警告日志，继续构建   |
| `ignore` | 静默忽略，不输出任何信息 |

## RuntimeGuardMode

运行时守卫的行为模式：

| 值        | 说明                         |
| --------- | ---------------------------- |
| `console` | 在浏览器控制台输出警告信息   |
| `throw`   | 抛出运行时错误，阻止应用启动 |
| `overlay` | 在页面顶部显示警告横幅       |

## EnvGuardResult

校验结果汇总对象。

| 属性      | 类型                    | 说明                       |
| --------- | ----------------------- | -------------------------- |
| timestamp | `string`                | 校验时间戳（ISO 格式）     |
| total     | `number`                | 校验的环境变量总数         |
| passed    | `number`                | 校验通过的变量数量         |
| missing   | `number`                | 缺失的必需变量数量         |
| invalid   | `number`                | 校验失败的变量数量         |
| results   | `EnvValidationResult[]` | 所有变量的详细校验结果列表 |
| allPassed | `boolean`               | 是否所有变量均校验通过     |

## 示例

### 基础类型校验

```typescript
envGuard({
	required: {
		VITE_API_BASE_URL: {
			type: 'url',
			required: true,
			message: 'API 基础地址必须为合法 URL'
		},
		VITE_APP_TITLE: {
			type: 'string',
			required: true,
			minLength: 1,
			maxLength: 50
		}
	}
})
```

### 数值范围与枚举校验

```typescript
envGuard({
	required: {
		VITE_API_TIMEOUT: {
			type: 'number',
			minValue: 1000,
			maxValue: 60000,
			message: 'API 超时时间必须在 1000-60000ms 之间'
		},
		VITE_LOG_LEVEL: {
			type: 'enum',
			enumValues: ['debug', 'info', 'warn', 'error'],
			default: 'info'
		}
	}
})
```

### 启用运行时守卫

```typescript
envGuard({
	required: {
		VITE_API_URL: { type: 'url', required: true }
	},
	runtimeGuard: true,
	runtimeGuardMode: 'console'
})
```

### 生成 .env 模板和校验报告

```typescript
envGuard({
	required: {
		VITE_API_URL: { type: 'url', required: true },
		VITE_APP_TITLE: { type: 'string', required: true }
	},
	generateTemplate: true,
	templateOutput: '.env.example',
	reportOutput: 'env-guard-report.json'
})
```

### 仅警告不中断构建

```typescript
envGuard({
	required: {
		VITE_ENABLE_ANALYTICS: { type: 'boolean', default: 'false' }
	},
	failAction: 'warn'
})
```

## 注意事项

- 校验在 `configResolved` 钩子中执行，确保在构建开始前完成
- `autoLoadEnv` 默认仅加载以 `VITE_` 开头的变量（遵循 Vite 约定）
- 运行时守卫代码通过 `transformIndexHtml` 钩子注入到 `</head>` 标签前
- `generateTemplate` 会根据 `required` 配置自动生成带注释的 .env 模板文件
