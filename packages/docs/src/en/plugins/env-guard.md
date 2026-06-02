# envGuard

Validate environment variables before Vite build, supporting type checking, range validation, custom rules, and runtime guards.

## Import Methods

```typescript
// Submodule import (recommended)
import { envGuard } from '@meng-xi/vite-plugin/plugins/env-guard'
import type { EnvGuardOptions, EnvGuardResult, EnvFailAction, RuntimeGuardMode } from '@meng-xi/vite-plugin/plugins/env-guard'

// Barrel import
import { envGuard } from '@meng-xi/vite-plugin'
```

## Quick Start

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

## Options

| Option              | Type                                | Default                                                         | Description                            |
| ------------------- | ----------------------------------- | --------------------------------------------------------------- | -------------------------------------- |
| required            | `Record<string, EnvFieldRule>`      | `{}`                                                            | Environment variable validation rules  |
| failAction          | `'error' \| 'warn' \| 'ignore'`     | `'error'`                                                       | Action on validation failure           |
| generateTemplate    | `boolean`                           | `true`                                                          | Auto-generate .env template file       |
| templateOutput      | `string`                            | `'.env.template'`                                               | Output path for .env template          |
| runtimeGuard        | `boolean`                           | `false`                                                         | Inject runtime guard code              |
| runtimeGlobalName   | `string`                            | `'__ENV_GUARD__'`                                               | Global variable name for runtime guard |
| runtimeGuardMode    | `'console' \| 'throw' \| 'overlay'` | `'console'`                                                     | Runtime guard behavior mode            |
| envFiles            | `string[]`                          | `['.env', '.env.local', '.env.production', '.env.development']` | .env file paths to load                |
| autoLoadEnv         | `boolean`                           | `true`                                                          | Auto-load .env files                   |
| reportOutput        | `string \| false`                   | `false`                                                         | Validation report output path          |
| validateBeforeBuild | `boolean`                           | `true`                                                          | Validate before build starts           |
| showSummary         | `boolean`                           | `true`                                                          | Show validation summary log            |
| enabled             | `boolean`                           | `true`                                                          | Enable the plugin                      |
| verbose             | `boolean`                           | `true`                                                          | Show detailed logs                     |
| errorStrategy       | `'throw' \| 'log' \| 'ignore'`      | `'throw'`                                                       | Error handling strategy                |

## EnvFieldRule

Validation rule configuration for each environment variable.

| Property   | Type                                                                                   | Description                                |
| ---------- | -------------------------------------------------------------------------------------- | ------------------------------------------ |
| type       | `'string' \| 'number' \| 'url' \| 'boolean' \| 'enum' \| 'json' \| 'semver' \| 'path'` | Value type validation                      |
| required   | `boolean`                                                                              | Whether the variable is required           |
| default    | `string`                                                                               | Default value when missing                 |
| message    | `string`                                                                               | Custom error message on validation failure |
| pattern    | `RegExp`                                                                               | Regex pattern validation                   |
| custom     | `(value: string) => boolean`                                                           | Custom validation function                 |
| minValue   | `number`                                                                               | Minimum value (number type)                |
| maxValue   | `number`                                                                               | Maximum value (number type)                |
| minLength  | `number`                                                                               | Minimum length (string type)               |
| maxLength  | `number`                                                                               | Maximum length (string type)               |
| enumValues | `string[]`                                                                             | Allowed enum values (enum type)            |

## EnvFailAction

Action to take when validation fails:

| Value    | Description                        |
| -------- | ---------------------------------- |
| `error`  | Throw error, abort build process   |
| `warn`   | Output warning log, continue build |
| `ignore` | Silently ignore, no output         |

## RuntimeGuardMode

Runtime guard behavior mode:

| Value     | Description                              |
| --------- | ---------------------------------------- |
| `console` | Output warning in browser console        |
| `throw`   | Throw runtime error, prevent app startup |
| `overlay` | Display warning banner at top of page    |

## EnvGuardResult

Validation result summary object.

| Property  | Type                    | Description                          |
| --------- | ----------------------- | ------------------------------------ |
| timestamp | `string`                | Validation timestamp (ISO format)    |
| total     | `number`                | Total variables validated            |
| passed    | `number`                | Number of passed variables           |
| missing   | `number`                | Number of missing required variables |
| invalid   | `number`                | Number of invalid variables          |
| results   | `EnvValidationResult[]` | Detailed validation results          |
| allPassed | `boolean`               | Whether all variables passed         |

## Examples

### Basic Type Validation

```typescript
envGuard({
	required: {
		VITE_API_BASE_URL: {
			type: 'url',
			required: true,
			message: 'API base URL must be a valid URL'
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

### Number Range and Enum Validation

```typescript
envGuard({
	required: {
		VITE_API_TIMEOUT: {
			type: 'number',
			minValue: 1000,
			maxValue: 60000,
			message: 'API timeout must be between 1000-60000ms'
		},
		VITE_LOG_LEVEL: {
			type: 'enum',
			enumValues: ['debug', 'info', 'warn', 'error'],
			default: 'info'
		}
	}
})
```

### Enable Runtime Guard

```typescript
envGuard({
	required: {
		VITE_API_URL: { type: 'url', required: true }
	},
	runtimeGuard: true,
	runtimeGuardMode: 'console'
})
```

### Generate .env Template and Validation Report

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

### Warn Without Breaking Build

```typescript
envGuard({
	required: {
		VITE_ENABLE_ANALYTICS: { type: 'boolean', default: 'false' }
	},
	failAction: 'warn'
})
```

## Notes

- Validation runs in the `configResolved` hook, ensuring it completes before build starts
- `autoLoadEnv` only loads variables starting with `VITE_` by default (following Vite convention)
- Runtime guard code is injected before the `</head>` tag via the `transformIndexHtml` hook
- `generateTemplate` auto-generates a commented .env template file based on `required` config
