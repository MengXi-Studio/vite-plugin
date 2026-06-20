# proxyManager

声明式开发代理管理插件，简化 Vite 开发服务器代理配置，支持环境切换、规则文件加载、请求日志、延迟模拟和环境变量覆盖。

## 导入

```typescript
import { proxyManager } from '@meng-xi/vite-plugin'
// 或子模块导入
import { proxyManager } from '@meng-xi/vite-plugin/plugins/proxy-manager'
```

## 快速开始

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

## 配置选项

| 选项          | 类型                              | 默认值          | 说明                                   |
| ------------- | --------------------------------- | --------------- | -------------------------------------- |
| rules         | `ProxyRule[]`                     | `[]`            | 代理规则列表                           |
| configFile    | `string \| false`                 | `'.proxyrc.ts'` | 代理规则配置文件路径，`false` 不加载   |
| logLevel      | `'none' \| 'basic' \| 'verbose'` | `'basic'`       | 代理日志级别                           |
| defaultDelay  | `DelayConfig`                     | `false`         | 全局默认延迟，对未配置 delay 的规则生效 |

> 继承 [BasePluginOptions](/factory/base-plugin-options)：`enabled`、`errorStrategy`

::: tip
`logLevel` 为插件自身选项，控制代理请求日志级别（`'none' | 'basic' | 'verbose'`），与继承的 `BasePluginOptions.logLevel` 不同。
:::

### 高级选项

| 选项      | 类型     | 默认值     | 说明                             |
| --------- | -------- | ---------- | -------------------------------- |
| envPrefix | `string` | `'PROXY_'` | 环境变量前缀，用于覆盖代理目标 |

### ProxyRule

单条代理规则的完整配置：

| 属性           | 类型                                         | 默认值  | 说明                                         |
| -------------- | -------------------------------------------- | ------- | -------------------------------------------- |
| context        | `string \| RegExp`                           | 必填    | 匹配路径，支持字符串前缀或正则表达式         |
| target         | `string`                                     | 必填    | 代理目标地址                                 |
| changeOrigin   | `boolean`                                    | `true`  | 是否修改请求头中的 Origin 为目标地址         |
| secure         | `boolean`                                    | `false` | 是否验证 SSL 证书                            |
| rewrite        | `(path: string) => string`                   | -       | 请求路径重写函数                             |
| headers        | `Record<string, string>`                     | -       | 自定义请求头                                 |
| env            | `string[]`                                   | -       | 限定生效的环境列表，为空则所有环境生效       |
| delay          | `number \| { min: number; max: number }`     | -       | 延迟模拟，数字表示固定毫秒，对象表示随机范围 |
| modifyResponse | `(body: any, proxyRes: IncomingMessage) => any` | -    | 响应修改回调                                 |
| ws             | `boolean`                                    | `false` | 是否启用 WebSocket 代理                      |
| label          | `string`                                     | -       | 规则备注/描述                                |

## 类型导出

### ProxyLogLevel

代理日志级别：`'none' | 'basic' | 'verbose'`

### DelayConfig

延迟配置类型：`number | { min: number; max: number } | false`

### ResolvedProxyRule

已解析的代理规则（context 已转为字符串 key）。

| 属性 | 类型        | 说明                      |
| ---- | ----------- | ------------------------- |
| key  | `string`    | context 的字符串表示      |
| rule | `ProxyRule` | 原始规则                  |

### ProxyLogEntry

代理请求日志条目。

| 属性       | 类型      | 说明               |
| ---------- | --------- | ------------------ |
| timestamp  | `number`  | 请求时间戳         |
| method     | `string`  | 请求方法           |
| path       | `string`  | 请求路径           |
| ruleKey    | `string`  | 匹配的规则 key     |
| target     | `string`  | 代理目标           |
| statusCode | `number`  | 响应状态码         |
| duration   | `number`  | 请求耗时（毫秒）   |
| delayed    | `boolean` | 是否命中延迟模拟   |

## 示例

### 多环境配置

通过 `env` 字段限定规则生效环境，自动按 `NODE_ENV` 过滤：

```typescript
proxyManager({
  rules: [
    { context: '/api', target: 'http://localhost:3000', env: ['development'] },
    { context: '/api', target: 'https://api.example.com', env: ['staging'] }
  ]
})
```

### 请求重写

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

### 延迟模拟

```typescript
proxyManager({
  rules: [
    { context: '/api', target: 'http://localhost:3000', delay: { min: 200, max: 800 } }
  ],
  defaultDelay: 100  // 未配置 delay 的规则默认延迟 100ms
})
```

### 使用配置文件

将代理规则抽离到独立的 `.proxyrc.ts` 文件：

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

### 环境变量覆盖目标

通过 `PROXY_*_TARGET` 环境变量动态覆盖代理目标：

```bash
# .env
PROXY_API_TARGET=http://staging-api.example.com
```

```typescript
proxyManager({
  rules: [
    { context: '/api', target: 'http://localhost:3000' }
  ],
  envPrefix: 'PROXY_'  // 读取 PROXY_API_TARGET 覆盖 /api 规则的 target
})
```

### WebSocket 代理

```typescript
proxyManager({
  rules: [
    { context: '/ws', target: 'ws://localhost:8080', ws: true }
  ]
})
```

### 实例方法

获取当前生效的代理规则列表：

```typescript
const plugin = proxyManager({ rules: [...] })
const rules = plugin.getResolvedRules()
console.log(rules)  // ResolvedProxyRule[]
```

## 注意事项

- 该插件仅在开发服务器（`dev`）模式下生效，通过 `config` 和 `configureServer` 钩子注入代理配置
- `configFile` 中的规则与 `rules` 中的规则会合并，`rules` 优先级更高
- 环境变量覆盖规则：将 context 转为大写并替换非字母数字为下划线，拼接 `${envPrefix}${KEY}_TARGET`
- 延迟中间件在日志中间件之后注册，确保 `duration` 包含延迟时间
