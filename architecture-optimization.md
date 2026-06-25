# packages/core 架构优化执行清单

> 基于对 `packages/core` 架构的深入分析整理而成。每项问题包含：现状、风险、可执行步骤、验证方式。建议按优先级顺序推进，每完成一项即提交一次 commit，便于回滚。

---

## 目录

- [P2 - 低优先级（代码质量提升）](#p2---低优先级代码质量提升)
  - [1. 钩子注册辅助方法](#1-钩子注册辅助方法)
  - [2. Logger API 语义优化](#2-logger-api-语义优化)
  - [3. 类型文件统一](#3-类型文件统一)
  - [4. toPlugin 返回类型优化](#4-toplugin-返回类型优化)
- [架构亮点（保持现状）](#架构亮点保持现状)
- [执行检查表](#执行检查表)

---

## P2 - 低优先级（代码质量提升）

### 1. 钩子注册辅助方法

**现状**

- `BasePlugin.toPlugin()` 仅自动包裹 `configResolved` 和 `closeBundle`
- 其他钩子（`writeBundle`、`transform`、`transformIndexHtml` 等）通过 `addPluginHooks` 添加，无自动 `enabled` 检查和 `safeExecute` 包裹
- 每个插件需手动写 `await this.safeExecute(() => ..., 'context')`

**执行步骤**

1. 在 `BasePlugin` 中新增 `registerHook` 方法：

   ```typescript
   // src/factory/index.ts

   /**
    * 注册 Vite 插件钩子，自动包裹 enabled 检查和错误处理
    *
    * @param plugin - Vite 插件对象
    * @param hook - 钩子名称
    * @param handler - 钩子处理函数
    * @param context - 错误日志上下文描述
    */
   protected registerHook<K extends keyof NonNullable<Plugin>>(
     plugin: Plugin,
     hook: K,
     handler: NonNullable<Plugin>[K],
     context: string
   ): void {
     const instance = this
     const original = handler as Function

     ;(plugin as any)[hook] = async function (this: any, ...args: any[]) {
       if (!instance.options.enabled) return
       await instance.safeExecute(() => original.apply(this, args), context)
     }
   }
   ```

2. 重构各插件的 `addPluginHooks`，以 `copyFile` 为例：

   ```typescript
   // 修改前：
   protected addPluginHooks(plugin: Plugin): void {
     plugin.writeBundle = async () => {
       await this.safeExecute(() => this.copyFiles(), '复制文件')
     }
   }

   // 修改后：
   protected addPluginHooks(plugin: Plugin): void {
     this.registerHook(plugin, 'writeBundle', () => this.copyFiles(), '复制文件')
   }
   ```

3. 逐个插件迁移（可选，不强制一次性完成）：
   - `copyFile` - `writeBundle`
   - `compressAssets` - `generateBundle`
   - `imageOptimizer` - `generateBundle`
   - `loadingManager` - `transformIndexHtml`
   - `versionUpdateChecker` - `transformIndexHtml`
   - `htmlInject` - `transformIndexHtml`
   - `assetManifest` - `generateBundle`
   - `bundleAnalyzer` - `generateBundle`
   - `generateVersion` - `configResolved`
   - `generateRouter` - `configResolved`
   - `envGuard` - `transform`
   - `autoImport` - `transform`
   - `faviconManager` - `transformIndexHtml`
   - `buildProgress` - `buildStart` / `buildEnd` 等

**验证方式**

- 每迁移一个插件后运行 `npm run build` 确保无错误
- 在 playground 中测试插件功能正常
- 测试 `enabled: false` 时插件确实不执行

**注意**

- `transformIndexHtml` 支持 `order` 配置，需特殊处理：

  ```typescript
  protected registerTransformIndexHtml(
    plugin: Plugin,
    handler: (html: string) => string,
    context: string,
    order: 'pre' | 'post' = 'post'
  ): void {
    const instance = this
    plugin.transformIndexHtml = {
      order,
      handler: (html: string) => {
        if (!instance.options.enabled) return html
        return instance.safeExecuteSync(() => handler(html), context) ?? html
      }
    }
  }
  ```

---

### 2. Logger API 语义优化

**现状**

- `Logger.create(options)` 返回单例实例，但方法名 `create` 误导，实际是 `register + getInstance`

**执行步骤**

1. 修改 `src/logger/index.ts`：

   ```typescript
   // src/logger/index.ts

   /**
    * 注册插件日志配置并获取 Logger 实例
    * @param options 配置选项
    * @returns Logger 单例实例
    */
   static register(options: LoggerOptions): Logger {
     const instance = Logger.getInstance()
     instance.registerPlugin(options.name, options.enabled ?? true)
     return instance
   }

   // 保留 create 作为别名，标记为废弃
   /** @deprecated 请使用 Logger.register() */
   static create(options: LoggerOptions): Logger {
     return Logger.register(options)
   }
   ```

2. 修改 `src/factory/index.ts` 中的调用：

   ```typescript
   // src/factory/index.ts
   private initLogger(loggerConfig?: LoggerOptions): PluginLogger {
     const loggerInstance = Logger.register({
       name: this.getPluginName(),
       enabled: this.options.verbose,
       ...loggerConfig
     })
     return loggerInstance.createPluginLogger(this.getPluginName())
   }
   ```

3. 下一个大版本发布时删除 `create` 别名

**验证方式**

- `npm run build` 无错误
- 全局搜索 `Logger.create` 无残留（除废弃别名外）

---

### 3. 类型文件统一

**现状**

- `faviconManager/common/type.ts` - 单数，在 common 内
- `proxyManager/common/index.ts` 内联导出 `ResolvedProxyRule` 类型
- 其他插件类型在根 `types.ts`

**执行步骤**

1. `faviconManager`：
   - 将 `common/type.ts`（重命名后为 `helpers/type.ts`）的内容合并到 `faviconManager/types.ts`
   - 删除 `helpers/type.ts`
   - 更新 `helpers/index.ts` 中的导入路径

2. `proxyManager`：
   - 将 `ResolvedProxyRule` 类型从 `common/matcher.ts`（重命名后 `helpers/matcher.ts`）移到 `proxyManager/types.ts`
   - 更新 `helpers/index.ts` 的类型导出：
     ```typescript
     // 修改前：
     export type { ResolvedProxyRule } from '../types'
     export { ... } from './matcher'
     // 修改后：
     export { ... } from './matcher'
     // 类型从根 types.ts 导出
     ```

**验证方式**

- `npm run build` 无错误
- 类型导出路径一致

---

### 4. toPlugin 返回类型优化

**现状**

- `toPlugin()` 返回 `Plugin`
- 工厂中 `as PluginWithInstance<T>` 强制转换后挂载 `pluginInstance`

**执行步骤**

1. 修改 `src/factory/index.ts`：

   ```typescript
   // src/factory/index.ts

   public toPlugin(): PluginWithInstance<T> {
     const plugin: PluginWithInstance<T> = {
       name: this.getPluginName(),
       enforce: this.getEnforce()
     }

     this.addPluginHooks(plugin)

     const subclassConfigResolved = plugin.configResolved
     plugin.configResolved = (config: ResolvedConfig) => {
       if (this.options.enabled) {
         this.onConfigResolved(config)
         if (typeof subclassConfigResolved === 'function') {
           subclassConfigResolved(config)
         }
       }
     }

     const instance = this
     const subclassCloseBundle = plugin.closeBundle
     plugin.closeBundle = function (this: any) {
       if (typeof subclassCloseBundle === 'function') {
         subclassCloseBundle.call(this)
       }
       instance.destroy()
     }

     plugin.pluginInstance = this
     return plugin
   }
   ```

2. 简化 `createPluginFactory`：

   ```typescript
   export function createPluginFactory<T extends BasePluginOptions, P extends BasePlugin<T>, R = T>(
   	PluginClass: new (options: T, loggerConfig?: LoggerOptions) => P,
   	normalizer?: OptionsNormalizer<T, R>
   ): PluginFactory<T, R> {
   	return (options?: R) => {
   		const normalizedOptions = (normalizer ? normalizer(options) : options) as T
   		const plugin = new PluginClass(normalizedOptions)
   		return plugin.toPlugin()
   	}
   }
   ```

**验证方式**

- `npm run build` 无错误
- TypeScript 类型检查通过
- 插件功能正常

---

## 架构亮点（保持现状）

以下设计值得保持，无需修改：

1. **`BasePlugin` 抽象类**：统一了配置合并、验证、日志、错误策略、生命周期，新插件开发成本低
2. **`createPluginFactory` + `OptionsNormalizer`**：支持原始配置标准化（如字符串→对象），灵活性好
3. **`scripts/generate-exports.ts` 自动化**：扫描入口生成 `build.config.ts` 和 `package.json` exports，避免手动维护
4. **`PluginWithInstance` 暴露实例引用**：允许外部访问插件内部状态，便于调试和扩展
5. **错误策略可配置**：`throw` / `log` / `ignore` 三种策略，适应不同场景
6. **子包按需引入**：`exports` 字段配置完善，支持 `@meng-xi/vite-plugin/plugins/xxx` 精细导入

---

## 执行检查表

完成每项后勾选，建议每项独立 commit。

### P2

- [ ] 1. 钩子注册辅助方法
- [ ] 2. Logger API 语义优化
- [ ] 3. 类型文件统一
  - [ ] 3.1 faviconManager 类型文件
  - [ ] 3.2 proxyManager 类型文件
- [ ] 4. toPlugin 返回类型优化

---

## 备注

- 每项优化完成后，运行 `npm run build` 确保构建通过
- 涉及 API 变更的项（如 Logger.create 废弃），需同步更新文档 `packages/docs/src/` 下的对应 md 文件
- 完成所有优化后，建议升级版本号（如 0.2.5 → 0.3.0），并在 `versions/` 目录下新增版本说明博客
