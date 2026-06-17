# proxyManager

Declarative dev proxy management plugin that simplifies Vite dev server proxy configuration, supporting environment switching, rule file loading, request logging, delay simulation, and environment variable overrides.

## Import Methods

```typescript
// Submodule import (recommended)
import { proxyManager } from '@meng-xi/vite-plugin/plugins/proxy-manager'
import type { ProxyManagerOptions, ProxyRule, ProxyLogLevel, DelayConfig } from '@meng-xi/vite-plugin/plugins/proxy-manager'

// Barrel import
import { proxyManager } from '@meng-xi/vite-plugin'
```

## Quick Start

```typescript
import { defineConfig } from 'vite'
import { proxyManager } from '@meng-xi/vite-plugin'

export default defineConfig({
	plugins: [
		proxyManager({
			rules: [
				{ context: '/api', target: 'http://localhost:3000' }
			]
		})
	]
})
```

## Options

| Option        | Type                           | Default        | Description                                          |
| ------------- | ------------------------------ | -------------- | ---------------------------------------------------- |
| rules         | `ProxyRule[]`                  | `[]`           | Proxy rule list                                      |
| configFile    | `string \| false`              | `'.proxyrc.ts'` | Proxy rule config file path, `false` to disable      |
| logLevel      | `'none' \| 'basic' \| 'verbose'` | `'basic'`    | Proxy log level                                      |
| defaultDelay  | `DelayConfig`                  | `false`        | Global default delay, applies to rules without delay |
| envPrefix     | `string`                       | `'PROXY_'`     | Environment variable prefix for overriding targets   |
| enabled       | `boolean`                      | `true`         | Enable the plugin                                    |
| verbose       | `boolean`                      | `true`         | Show detailed logs                                   |
| errorStrategy | `'throw' \| 'log' \| 'ignore'` | `'throw'`      | Error handling strategy                              |

## ProxyRule Type

Complete configuration for a single proxy rule:

| Property       | Type                                         | Default | Description                                       |
| -------------- | -------------------------------------------- | ------- | ------------------------------------------------- |
| context        | `string \| RegExp`                           | required | Match path, supports string prefix or regex      |
| target         | `string`                                     | required | Proxy target address                              |
| changeOrigin   | `boolean`                                    | `true`  | Whether to change Origin header to target address |
| secure         | `boolean`                                    | `false` | Whether to verify SSL certificates                |
| rewrite        | `(path: string) => string`                   | -       | Request path rewrite function                     |
| headers        | `Record<string, string>`                     | -       | Custom request headers                            |
| env            | `string[]`                                   | -       | Environments where rule applies, empty = all      |
| delay          | `number \| { min: number; max: number }`     | -       | Delay simulation, number = fixed ms, object = range |
| modifyResponse | `(body: any, proxyRes: IncomingMessage) => any` | -    | Response modification callback                    |
| ws             | `boolean`                                    | `false` | Enable WebSocket proxy                            |
| label          | `string`                                     | -       | Rule label/description                            |

## Examples

### Multi-Environment Configuration

Use the `env` field to limit rule environments, automatically filtered by `NODE_ENV`:

```typescript
proxyManager({
	rules: [
		{ context: '/api', target: 'http://localhost:3000', env: ['development'] },
		{ context: '/api', target: 'https://api.example.com', env: ['staging'] }
	]
})
```

### Request Rewriting

Use the `rewrite` function to modify request paths:

```typescript
proxyManager({
	rules: [
		{
			context: '/upload',
			target: 'http://oss.example.com',
			rewrite: path => path.replace(/^\/upload/, '/v2/files')
		}
	]
})
```

### Delay Simulation

Simulate slow network environments with fixed values or random ranges:

```typescript
proxyManager({
	rules: [
		{ context: '/api', target: 'http://localhost:3000', delay: { min: 200, max: 800 } }
	],
	defaultDelay: 100  // Rules without delay default to 100ms
})
```

### Verbose Logging

`verbose` mode outputs full request/response info (including status code, duration):

```typescript
proxyManager({
	rules: [...],
	logLevel: 'verbose'
})
```

### Using Config Files

Extract proxy rules into a standalone `.proxyrc.ts` file, decoupled from `vite.config.ts`:

```typescript
// .proxyrc.ts
import { defineProxyConfig } from '@meng-xi/vite-plugin/plugins/proxy-manager'

export default defineProxyConfig([
	{ context: '/api', target: 'http://localhost:3000' },
	{ context: '/ws', target: 'ws://localhost:8080', ws: true }
])
```

```typescript
// vite.config.ts
proxyManager({
	configFile: '.proxyrc.ts',
	logLevel: 'basic'
})
```

### Environment Variable Override

Dynamically override proxy targets via `PROXY_*_TARGET` environment variables without modifying config files:

```bash
# .env
PROXY_API_TARGET=http://staging-api.example.com
```

```typescript
proxyManager({
	rules: [
		{ context: '/api', target: 'http://localhost:3000' }
	],
	envPrefix: 'PROXY_'  // Reads PROXY_API_TARGET to override /api rule target
})
```

### WebSocket Proxy

```typescript
proxyManager({
	rules: [
		{ context: '/ws', target: 'ws://localhost:8080', ws: true }
	]
})
```

## Instance Methods

### getResolvedRules()

Get the list of currently active proxy rules (after environment filtering and env variable overrides):

```typescript
const plugin = proxyManager({ rules: [...] })
// Call on the plugin instance
const rules = plugin.getResolvedRules()
console.log(rules)  // ResolvedProxyRule[]
```

## Notes

- This plugin only takes effect in dev server mode, injecting proxy config via `config` and `configureServer` hooks
- Rules from `configFile` are merged with `rules`, with `rules` taking higher priority
- Environment variable override: converts context to uppercase, replaces non-alphanumeric with underscores, appends `${envPrefix}${KEY}_TARGET`
- Delay middleware is registered after logging middleware to ensure `duration` includes delay time
