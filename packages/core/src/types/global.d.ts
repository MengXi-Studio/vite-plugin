/**
 * 插件版本号
 *
 * 由 unbuild 在构建时通过 build.config.ts 的 replace 配置注入，
 * 值来源于 packages/core/package.json 的 version 字段。
 *
 * 使用方式（无需重复声明，直接使用即可）：
 * ```typescript
 * const PLUGIN_VERSION = __PLUGIN_VERSION__
 * ```
 */
declare const __PLUGIN_VERSION__: string
