import { BasePluginOptions, PluginFactory } from '../../../factory/index.cjs';
import 'vite';
import '../../../shared/vite-plugin.BmNqGOzh.cjs';
import '../../../shared/vite-plugin.DRRlWY8P.cjs';

/**
 * 统一的导入项内部表示
 *
 * @description 所有外部配置格式（预设字符串、Record、InlineImportConfig、目录扫描结果）
 * 最终都归一化为这个结构。支持命名导入、默认导入、别名导入、类型导入。
 *
 * @example
 * ```typescript
 * // 命名导入: import { ref } from 'vue'
 * { name: 'ref', from: 'vue' }
 *
 * // 别名导入: import { useFetch as useMyFetch } from '@vueuse/core'
 * { name: 'useFetch', from: '@vueuse/core', as: 'useMyFetch' }
 *
 * // 默认导入: import React from 'react'
 * { name: 'default', from: 'react', as: 'React' }
 *
 * // 类型导入: import type { RouteLocationRaw } from 'vue-router'
 * { name: 'RouteLocationRaw', from: 'vue-router', type: true }
 *
 * // 命名空间导入: import * as _ from 'lodash'
 * { name: '*', from: 'lodash', as: '_' }
 *
 * // export assignment 导入: import browser from 'webextension-polyfill'
 * { name: '=', from: 'webextension-polyfill', as: 'browser' }
 * ```
 */
interface ImportInline {
    /** 导入的标识符名称（在源模块中的名称） */
    name: string;
    /** 源模块路径 */
    from: string;
    /** 别名，设置后代码中使用别名，从源模块导入原名 */
    as?: string;
    /** 是否为类型导入，为 true 时生成 `import type` */
    type?: boolean;
    /** 是否为默认导入 */
    isDefault?: boolean;
    /** 元信息，供 resolver 等扩展使用 */
    meta?: ImportMeta;
}
/**
 * 导入项元信息
 *
 * @description 为 Vue 指令等特殊场景提供额外标记
 */
interface ImportMeta {
    /** 是否为 Vue 指令 */
    vueDirective?: boolean;
    /** 是否在 DTS 中禁用生成 */
    dtsEnabled?: boolean;
    /** 自定义元数据 */
    [key: string]: unknown;
}
/**
 * 内置预设定义
 *
 * @description 一个预设定义了一个模块及其所有可自动导入的标识符。
 * imports 中的项可以是字符串（命名导入）或 [name, alias] 元组（别名导入）。
 *
 * @example
 * ```typescript
 * const vuePreset: PresetDefinition = {
 *   from: 'vue',
 *   imports: ['ref', 'reactive', 'computed'],
 *   typeImports: ['Ref', 'Component', 'VNode']
 * }
 * ```
 */
interface PresetDefinition {
    /** 源模块路径 */
    from: string;
    /** 值导入项列表，每项可以是字符串或 [name, alias] 元组 */
    imports: Array<string | [string, string]>;
    /** 类型导入项列表 */
    typeImports?: Array<string | [string, string]>;
}
/**
 * 包预设配置 — 从本地已安装的 npm 包自动发现导出
 *
 * @example
 * ```typescript
 * { package: 'detect-browser-es', ignore: ['isStream'] }
 * ```
 */
interface PackagePresetOptions {
    /** 包名 */
    package: string;
    /** 忽略的导出名称列表（支持字符串和正则） */
    ignore?: Array<string | RegExp>;
}
/**
 * 目录配置项 — 支持字符串或详细对象
 *
 * @example
 * ```typescript
 * // 字符串格式
 * './composables'
 *
 * // glob 格式
 * './composables/**'
 *
 * // 对象格式（细粒度控制）
 * { glob: './composables/**', types: true }
 * ```
 */
type DirConfig = string | DirConfigObject;
/**
 * 目录配置对象
 */
interface DirConfigObject {
    /** 目录路径或 glob 模式 */
    glob: string;
    /** 是否将该目录下的导出作为类型导入 */
    types?: boolean;
}
/**
 * 目录扫描选项
 */
interface DirsScanOptions {
    /** 文件匹配 glob 模式列表，默认 ['*.{ts,js,mjs,cjs,mts,cts}'] */
    filePatterns?: string[];
    /** 自定义文件过滤函数 */
    fileFilter?: (file: string) => boolean;
    /** 扫描到的导出是否默认作为类型导入 */
    types?: boolean;
}
/**
 * DTS 配置 — 支持字符串路径、布尔值或详细对象
 *
 * @example
 * ```typescript
 * // 字符串路径
 * dts: './auto-imports.d.ts'
 *
 * // 详细配置
 * dts: { filepath: './auto-imports.d.ts', mode: 'append' }
 * ```
 */
type DtsConfig = string | boolean | DtsConfigObject;
/**
 * DTS 配置对象
 */
interface DtsConfigObject {
    /** 输出文件路径 */
    filepath: string;
    /** 写入模式：append 追加自定义声明，overwrite 完全覆盖（默认 overwrite） */
    mode?: 'append' | 'overwrite';
    /** 是否保留文件扩展名（目录扫描结果的模块路径） */
    preserveExts?: boolean;
}
/**
 * ESLint 配置生成选项
 *
 * @example
 * ```typescript
 * eslintrc: {
 *   enabled: true,
 *   filepath: './.eslintrc-auto-import.json',
 *   globalsPropValue: true
 * }
 * ```
 */
interface EslintrcConfig {
    /** 是否启用生成 */
    enabled?: boolean;
    /** 输出文件路径，默认 './.eslintrc-auto-import.json' */
    filepath?: string;
    /** globals 属性值 */
    globalsPropValue?: boolean | 'readonly' | 'writable' | 'off';
}
/**
 * Biome 配置生成选项
 *
 * @example
 * ```typescript
 * biomelintrc: {
 *   enabled: true,
 *   filepath: './.biomelintrc-auto-import.json'
 * }
 * ```
 */
interface BiomelintrcConfig {
    /** 是否启用生成 */
    enabled?: boolean;
    /** 输出文件路径，默认 './.biomelintrc-auto-import.json' */
    filepath?: string;
}
/**
 * 自定义解析器接口
 *
 * @description 兼容 unplugin-vue-components 的 resolver 模式，
 * 当 nameLookup 未命中时，遍历 resolvers 调用 resolve 进行补充解析。
 *
 * @example
 * ```typescript
 * const myResolver: Resolver = {
 *   resolve: (name) => {
 *     if (name.startsWith('use')) {
 *       return { name, from: 'my-composables' }
 *     }
 *     return null
 *   }
 * }
 * ```
 */
interface Resolver {
    /**
     * 根据标识符名称解析导入信息
     *
     * @param name 标识符名称
     * @returns 导入信息，或 null/undefined 表示无法解析
     */
    resolve?: (name: string) => ImportInline | null | undefined;
    /**
     * 根据标识符名称解析类型导入
     *
     * @param name 标识符名称
     * @returns 类型导入信息，或 null/undefined 表示无法解析
     */
    typeResolve?: (name: string) => ImportInline | null | undefined;
}
/**
 * Vue 指令自动导入配置
 */
interface VueDirectivesConfig {
    /** 是否启用 Vue 指令自动导入 */
    enabled?: boolean;
    /** 判断导入项是否为指令的函数 */
    isDirective?: (from: string, importEntry?: ImportInline) => boolean;
}
/**
 * 缓存配置
 */
interface CacheConfig {
    /** 是否启用缓存 */
    enabled: boolean;
    /** 缓存目录路径，默认为 node_modules/.cache/auto-import */
    dir?: string;
}
/**
 * 内联导入配置（支持 type 标记）
 *
 * @example
 * ```typescript
 * { from: 'vue-router', imports: ['RouteLocationRaw'], type: true }
 * { from: '@vueuse/core', imports: ['useMouse', ['useFetch', 'useMyFetch']] }
 * ```
 */
interface InlineImportConfig {
    /** 源模块路径 */
    from: string;
    /** 导入项列表，支持字符串或 [name, alias] 元组 */
    imports: Array<string | [string, string]>;
    /** 是否为类型导入 */
    type?: boolean;
}
/**
 * imports 配置项的联合类型
 *
 * @description 支持多种格式混合使用：
 * - 预设字符串：`'vue'`
 * - 简写格式：`{ vue: ['ref', 'reactive'] }`
 * - 类型导入格式（InlineImportConfig）
 */
type ImportsConfig = Array<string | Record<string, Array<string | [string, string]>> | InlineImportConfig>;
/**
 * 自动导入插件的配置选项
 *
 * @interface AutoImportOptions
 * @extends {BasePluginOptions}
 *
 * @description 支持预设系统、别名导入、类型导入、
 * 目录glob扫描、ESLint/Biome配置生成、缓存机制等增强功能。
 *
 * @example
 * ```typescript
 * autoImport({
 *   // 使用预设
 *   imports: ['vue', 'vue-router', 'pinia'],
 *   // 自定义导入（支持别名和类型）
 *   imports: [
 *     'vue',
 *     { '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']] },
 *     { from: 'vue-router', imports: ['RouteLocationRaw'], type: true },
 *   ],
 *   // 目录扫描（支持 glob）
 *   dirs: ['./composables/**', { glob: './hooks', types: true }],
 *   // DTS 配置
 *   dts: { filepath: 'src/auto-imports.d.ts', mode: 'append' },
 *   // Vue 支持
 *   vueTemplate: true,
 *   // Vite 集成
 *   viteOptimizeDeps: true,
 *   // ESLint 配置生成
 *   eslintrc: { enabled: true },
 * })
 * ```
 */
interface AutoImportOptions extends BasePluginOptions {
    /**
     * 导入映射配置（增强版）
     *
     * @description 支持多种格式混合使用：
     * 1. 预设字符串：`'vue'`、`'vue-router'`
     * 2. 简写格式：`{ vue: ['ref', 'reactive'] }`
     * 3. 自定义命名导入：`{ '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']] }`
     * 4. 类型导入：`{ from: 'vue-router', imports: ['RouteLocationRaw'], type: true }`
     *
     * @default []
     */
    imports?: ImportsConfig | Record<string, Array<string | [string, string]>>;
    /**
     * 需要忽略的标识符列表
     *
     * @default []
     */
    ignore?: string[];
    /**
     * 默认导出是否按文件名命名（目录扫描时）
     *
     * @default false
     */
    defaultExportByFilename?: boolean;
    /**
     * 需要扫描的目录列表（增强版，支持 glob 和对象配置）
     *
     * @default []
     */
    dirs?: DirConfig[];
    /**
     * 目录扫描选项
     */
    dirsScanOptions?: DirsScanOptions;
    /**
     * TypeScript 类型声明文件配置
     *
     * @default 'src/auto-imports.d.ts'
     */
    dts?: DtsConfig;
    /**
     * DTS 中需要忽略的标识符（支持字符串和正则）
     *
     * @default []
     */
    ignoreDts?: Array<string | RegExp>;
    /**
     * 是否为 Vue 模板启用自动导入
     *
     * @default false
     */
    vueTemplate?: boolean;
    /**
     * Vue 模板指令自动导入配置
     */
    vueDirectives?: boolean | VueDirectivesConfig;
    /**
     * 自定义解析器，用于兼容 unplugin-vue-components 的 resolver 模式
     *
     * @default []
     */
    resolvers?: Resolver[];
    /**
     * 是否自动将导入的包添加到 Vite optimizeDeps
     *
     * @default false
     */
    viteOptimizeDeps?: boolean;
    /**
     * import 语句注入位置
     *
     * @default 'top'
     */
    injectAtPosition?: 'top' | 'after-last-import';
    /**
     * 需要处理的文件匹配模式
     *
     * @default [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/]
     */
    include?: Array<string | RegExp>;
    /**
     * 不需要处理的文件匹配模式
     *
     * @default [/node_modules/]
     */
    exclude?: Array<string | RegExp>;
    /**
     * ESLint 配置生成
     */
    eslintrc?: EslintrcConfig;
    /**
     * Biome 配置生成
     */
    biomelintrc?: BiomelintrcConfig;
    /**
     * 禁用自动导入的注释标记
     *
     * @default ['@unimport-disable']
     */
    commentsDisable?: string[];
    /**
     * 从本地安装的包自动发现导出
     *
     * @default []
     */
    packagePresets?: Array<string | PackagePresetOptions>;
    /**
     * 是否启用缓存
     *
     * @default true
     */
    cache?: boolean | CacheConfig;
}
/**
 * 扫描到的模块信息
 */
interface ScannedModule {
    /** 模块文件的绝对路径 */
    filePath: string;
    /** 命名导出名称列表 */
    exports: string[];
    /** 默认导出名称 */
    defaultExport: string | null;
    /** 是否为类型导出（目录扫描类型标记） */
    isType?: boolean;
}
/**
 * 代码转换结果
 */
interface TransformResult {
    /** 转换后的代码字符串 */
    code: string;
    /** 可选的 source map */
    map?: any;
}

/**
 * 创建自动导入插件
 *
 * @function autoImport
 * @param {AutoImportOptions} [options] - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用：使用内置预设
 * autoImport({
 *   imports: ['vue', 'vue-router', 'pinia'],
 *   dts: 'src/auto-imports.d.ts',
 *   vueTemplate: true,
 * })
 *
 * // 自定义导入（支持别名和类型）
 * autoImport({
 *   imports: [
 *     'vue',
 *     { '@vueuse/core': ['useMouse', ['useFetch', 'useMyFetch']] },
 *     { from: 'vue-router', imports: ['RouteLocationRaw'], type: true },
 *   ],
 * })
 *
 * // 命名空间导入和 export assignment
 * autoImport({
 *   imports: [
 *     { lodash: [['*', '_']] },
 *     { 'webextension-polyfill': [['=', 'browser']] },
 *   ],
 * })
 *
 * // 目录扫描（支持 glob）
 * autoImport({
 *   dirs: ['./composables/**', { glob: './hooks', types: true }],
 * })
 *
 * // ESLint 配置生成
 * autoImport({
 *   imports: ['vue'],
 *   eslintrc: { enabled: true },
 * })
 * ```
 */
declare const autoImport: PluginFactory<AutoImportOptions, AutoImportOptions>;

export { autoImport };
export type { AutoImportOptions, BiomelintrcConfig, CacheConfig, DirConfig, DirConfigObject, DirsScanOptions, DtsConfig, DtsConfigObject, EslintrcConfig, ImportInline, ImportMeta, ImportsConfig, InlineImportConfig, PackagePresetOptions, PresetDefinition, Resolver, ScannedModule, TransformResult, VueDirectivesConfig };
