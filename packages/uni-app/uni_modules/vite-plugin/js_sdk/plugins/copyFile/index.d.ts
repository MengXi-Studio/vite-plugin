import { BasePluginOptions, PluginFactory } from '../../factory/index.js';
import 'vite';
import '../../shared/vite-plugin.CLr0ttuO.js';
import '../../shared/vite-plugin.DRRlWY8P.js';

/**
 * 复制文件插件的配置选项接口
 *
 * @interface CopyFileOptions
 */
interface CopyFileOptions extends BasePluginOptions {
    /**
     * 源文件目录的路径
     *
     * @example 'src/assets'
     */
    sourceDir: string;
    /**
     * 目标文件目录的路径
     *
     * @example 'dist/assets'
     */
    targetDir: string;
    /**
     * 是否覆盖同名文件
     *
     * @default true
     */
    overwrite?: boolean;
    /**
     * 是否支持递归复制
     *
     * @default true
     */
    recursive?: boolean;
    /**
     * 是否启用增量复制
     *
     * @default true
     */
    incremental?: boolean;
}

/**
 * 复制文件插件
 *
 * @param {CopyFileOptions} options - 插件配置选项
 * @returns {Plugin} 一个 Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * copyFile({
 *   sourceDir: 'src/assets',
 *   targetDir: 'dist/assets'
 * })
 *
 * // 高级配置
 * copyFile({
 *   sourceDir: 'src/static',
 *   targetDir: 'dist/static',
 *   overwrite: false,
 *   recursive: true,
 *   incremental: true,
 *   enabled: true,
 *   verbose: true,
 *   errorStrategy: 'throw'
 * })
 * ```
 *
 * @remarks
 * 该插件会在 Vite 构建完成后执行，将指定源目录的所有文件和子目录复制到目标目录。
 * 支持增量复制、递归复制和覆盖控制等功能。
 */
declare const copyFile: PluginFactory<CopyFileOptions, CopyFileOptions>;

export { copyFile };
export type { CopyFileOptions };
