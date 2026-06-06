import { S as SecurityConfig, H as HtmlInjectResult, D as DualInjectResult } from '../../shared/vite-plugin.BI9taN75.cjs';
export { C as ConditionType, I as InjectCondition, a as InjectPosition, b as SelectorMatch } from '../../shared/vite-plugin.BI9taN75.cjs';

/**
 * 内容消毒规则选项
 */
interface SanitizeRuleOptions {
    id?: string;
    allowScriptInjection?: boolean;
}
/**
 * 对注入内容进行安全过滤
 *
 * @param content - 待过滤的 HTML 内容字符串
 * @param rule - 当前注入规则的消毒选项
 * @param security - 全局安全配置
 * @param logger - 日志记录器
 * @returns 过滤后的安全 HTML 内容字符串
 */
declare function sanitizeContent(content: string, rule: SanitizeRuleOptions, security?: SecurityConfig, logger?: {
    warn: (msg: string) => void;
}): string;

/**
 * 在 HTML 中指定闭合标签前注入代码
 *
 * @param html - 原始 HTML 内容
 * @param tag - 目标闭合标签（如 `</head>`、`</body>`、`</html>`）
 * @param code - 要注入的代码
 * @returns 注入结果对象
 */
declare function injectBeforeTag(html: string, tag: string, code: string): HtmlInjectResult;
/**
 * 双区域 HTML 注入（head + body）
 *
 * @description 将代码分别注入到 HTML 的 `</head>` 前和 `</body>` 前（带回退策略）。
 * 这是插件中常见的注入模式：CSS/HTML 注入到 head，JS 注入到 body。
 *
 * @param html - 原始 HTML 内容
 * @param headCode - 注入到 `</head>` 前的代码（如 CSS、meta 标签），不提供则跳过 head 注入
 * @param bodyCode - 注入到 `</body>` 前的代码（如 JS 脚本），回退到 `</html>` 前或末尾
 * @returns 双区域注入结果对象
 */
declare function injectHeadAndBody(html: string, headCode: string | undefined, bodyCode: string): DualInjectResult;

export { DualInjectResult, HtmlInjectResult, SecurityConfig, injectBeforeTag, injectHeadAndBody, sanitizeContent };
export type { SanitizeRuleOptions };
