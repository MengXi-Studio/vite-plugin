import { BasePluginOptions, PluginFactory } from '../../factory/index.cjs';
import { E as EnvFieldRule, b as EnvValidationResult } from '../../shared/vite-plugin.CmtcnItg.cjs';
import 'vite';
import '../../shared/vite-plugin.CLr0ttuO.cjs';
import '../../shared/vite-plugin.DRRlWY8P.cjs';

/**
 * 环境变量校验失败时的处理动作
 *
 * @description 定义当环境变量校验未通过时的处理策略：
 * - `error`: 抛出错误，中断构建流程
 * - `warn`: 输出警告日志，继续构建
 * - `ignore`: 静默忽略，不输出任何信息
 */
type EnvFailAction = 'error' | 'warn' | 'ignore';
/**
 * 运行时守卫的行为模式
 *
 * @description 定义注入到 HTML 中的运行时守卫代码在检测到
 * 环境变量缺失或无效时的行为方式：
 * - `console`: 在浏览器控制台输出警告信息
 * - `throw`: 抛出运行时错误，阻止应用启动
 * - `overlay`: 在页面顶部显示警告横幅
 */
type RuntimeGuardMode = 'console' | 'throw' | 'overlay';
/**
 * 环境变量校验结果汇总
 *
 * @interface EnvGuardResult
 * @description 包含所有环境变量的校验统计信息和详细结果列表，
 * 用于报告生成和日志输出。
 */
interface EnvGuardResult {
    /** 校验时间戳（ISO 格式） */
    timestamp: string;
    /** 校验的环境变量总数 */
    total: number;
    /** 校验通过的变量数量 */
    passed: number;
    /** 缺失的必需变量数量 */
    missing: number;
    /** 校验失败的变量数量（类型不匹配、范围越界等） */
    invalid: number;
    /** 所有变量的详细校验结果列表 */
    results: EnvValidationResult[];
    /** 是否所有变量均校验通过 */
    allPassed: boolean;
}
/**
 * 环境变量守卫插件的配置选项
 *
 * @interface EnvGuardOptions
 * @extends {BasePluginOptions}
 *
 * @example
 * ```typescript
 * envGuard({
 *   required: {
 *     VITE_API_URL: { type: 'url', required: true },
 *     VITE_APP_TITLE: { type: 'string', minLength: 1, maxLength: 50 }
 *   },
 *   failAction: 'error',
 *   generateTemplate: true,
 *   runtimeGuard: true,
 *   runtimeGuardMode: 'console'
 * })
 * ```
 */
interface EnvGuardOptions extends BasePluginOptions {
    /** 环境变量校验规则映射，键为变量名，值为校验规则 */
    required?: Record<string, EnvFieldRule>;
    /** 校验失败时的处理动作 */
    failAction?: EnvFailAction;
    /** 是否自动生成 .env 模板文件 */
    generateTemplate?: boolean;
    /** .env 模板文件的输出路径 */
    templateOutput?: string;
    /** 是否注入运行时环境变量守卫代码到 HTML */
    runtimeGuard?: boolean;
    /** 运行时守卫的全局变量名 */
    runtimeGlobalName?: string;
    /** 运行时守卫的行为模式 */
    runtimeGuardMode?: RuntimeGuardMode;
    /** 需要加载的 .env 文件路径列表 */
    envFiles?: string[];
    /** 是否自动加载 .env 文件中的变量到 process.env */
    autoLoadEnv?: boolean;
    /** 校验报告输出路径，设为 false 则不生成报告 */
    reportOutput?: string | false;
    /** 是否在构建前执行校验 */
    validateBeforeBuild?: boolean;
    /** 是否输出校验摘要日志 */
    showSummary?: boolean;
}

/**
 * 创建环境变量守卫插件
 *
 * @function envGuard
 * @param {Partial<EnvGuardOptions>} [options] - 插件配置选项
 * @returns {Plugin} Vite 插件实例
 *
 * @description 在 Vite 构建前校验环境变量的存在性和合法性，
 * 支持多种值类型校验、正则匹配、自定义校验函数等，
 * 可选生成 .env 模板文件和注入运行时守卫代码。
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { envGuard } from '@meng-xi/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     envGuard({
 *       required: {
 *         VITE_API_BASE_URL: {
 *           type: 'url',
 *           required: true,
 *           message: 'API 基础地址必须为合法 URL'
 *         },
 *         VITE_APP_TITLE: {
 *           type: 'string',
 *           required: true,
 *           minLength: 1,
 *           maxLength: 50
 *         },
 *         VITE_ENABLE_ANALYTICS: {
 *           type: 'boolean',
 *           required: false,
 *           default: 'false'
 *         },
 *         VITE_API_TIMEOUT: {
 *           type: 'number',
 *           minValue: 1000,
 *           maxValue: 60000,
 *           message: 'API 超时时间必须在 1000-60000ms 之间'
 *         },
 *         VITE_LOG_LEVEL: {
 *           type: 'enum',
 *           enumValues: ['debug', 'info', 'warn', 'error'],
 *           default: 'info'
 *         }
 *       },
 *       failAction: 'error',
 *       generateTemplate: true,
 *       runtimeGuard: true,
 *       runtimeGuardMode: 'console'
 *     })
 *   ]
 * })
 * ```
 */
declare const envGuard: PluginFactory<EnvGuardOptions, EnvGuardOptions>;

export { envGuard };
export type { EnvFailAction, EnvGuardOptions, EnvGuardResult, RuntimeGuardMode };
