import { I as InjectCondition, b as SelectorMatch, a as InjectPosition, P as PositionInjectResult, S as SecurityConfig, H as HtmlInjectResult, D as DualInjectResult } from '../../shared/vite-plugin.FfJ-Wwfu.cjs';
export { C as ConditionType } from '../../shared/vite-plugin.FfJ-Wwfu.cjs';

/**
 * HTML 注入工具模块
 *
 * @module common/html/inject
 * @description 提供高级 HTML 内容注入功能，包括选择器匹配、模板变量替换、
 * 条件判断、规则排序和多位置注入等能力，为插件提供灵活的 HTML 操作支持。
 */

/**
 * 在 HTML 中查找选择器匹配位置
 *
 * @param html - 要搜索的 HTML 字符串
 * @param selector - 选择器字符串（普通字符串或正则表达式字符串）
 * @param selectorMatch - 匹配模式，`'string'` 为精确字符串匹配，`'regex'` 为正则匹配
 * @returns 匹配结果对象（包含 `index` 和 `length`），未匹配时返回 `null`
 *
 * @description 根据匹配模式在 HTML 中查找选择器的位置：
 * - 字符串模式：使用 `indexOf` 进行精确匹配
 * - 正则模式：使用 `RegExp` 进行正则匹配，正则语法错误时返回 `null`
 *
 * @example
 * ```typescript
 * // 字符串匹配
 * findSelectorMatch('<div id="app">content</div>', '<div id="app">')
 * // { index: 0, length: 14 }
 *
 * // 正则匹配
 * findSelectorMatch('<div class="foo">bar</div>', 'class="\\w+"', 'regex')
 * // { index: 5, length: 12 }
 *
 * // 未匹配
 * findSelectorMatch('<div>hello</div>', '<span>')
 * // null
 * ```
 */
declare function findSelectorMatch(html: string, selector: string, selectorMatch?: SelectorMatch): {
    index: number;
    length: number;
} | null;
/**
 * 替换模板字符串中的变量占位符
 *
 * @param content - 包含 `{{变量名}}` 占位符的模板字符串
 * @param ruleVars - 规则级变量映射（优先级高于全局变量）
 * @param globalVars - 全局变量映射
 * @returns 替换所有匹配占位符后的字符串
 *
 * @description 将模板字符串中形如 `{{key}}` 的占位符替换为对应的值。
 * 规则变量（`ruleVars`）优先级高于全局变量（`globalVars`），
 * 当两者存在相同键时，规则变量的值会覆盖全局变量的值。
 * 变量名中的正则特殊字符会被自动转义，替换值中的 `$` 也会被安全处理。
 *
 * @example
 * ```typescript
 * // 基本替换
 * applyTemplateVars('<div>{{name}}</div>', { name: 'test' })
 * // '<div>test</div>'
 *
 * // 规则变量覆盖全局变量
 * applyTemplateVars('{{a}}-{{b}}', { a: '1' }, { a: '0', b: '2' })
 * // '1-2'
 *
 * // 无匹配占位符
 * applyTemplateVars('no vars', { x: 'y' })
 * // 'no vars'
 * ```
 */
declare function applyTemplateVars(content: string, ruleVars?: Record<string, string>, globalVars?: Record<string, string>): string;
/**
 * 评估注入条件是否满足
 *
 * @param condition - 注入条件配置
 * @param html - 当前 HTML 内容（用于 `file-contains` 类型判断）
 * @returns 条件是否满足（布尔值）
 *
 * @description 根据条件类型评估注入条件：
 * - `env`：检查环境变量是否存在且不为 `'false'` 或 `'0'`
 * - `file-contains`：检查 HTML 内容是否包含指定字符串
 * - `custom`：执行自定义函数，捕获异常时返回 `false`
 * - 支持通过 `negate` 字段对结果取反
 *
 * @example
 * ```typescript
 * // 环境变量判断
 * evaluateCondition({ type: 'env', value: 'ENABLE_ANALYTICS' }, '')
 *
 * // 内容包含判断
 * evaluateCondition({ type: 'file-contains', value: '<div id="app">' }, html)
 *
 * // 自定义函数（带取反）
 * evaluateCondition(
 *   { type: 'custom', value: () => isDev(), negate: true },
 *   html
 * )
 * ```
 */
declare function evaluateCondition(condition: InjectCondition, html: string): boolean;
/**
 * 按优先级排序规则列表
 *
 * @typeParam T - 规则类型，必须包含可选的 `priority` 字段
 * @param rules - 待排序的规则数组
 * @returns 按 `priority` 升序排列的新数组（不修改原数组）
 *
 * @description 将规则按 `priority` 字段升序排列，`priority` 越小优先级越高。
 * 未指定 `priority` 的规则默认优先级为 100。
 * 返回新数组，不修改原数组。
 *
 * @example
 * ```typescript
 * const rules = [
 *   { priority: 30, name: 'C' },
 *   { priority: 10, name: 'A' },
 *   { name: 'D' },           // 默认 priority=100
 *   { priority: 20, name: 'B' }
 * ]
 * sortRulesByPriority(rules)
 * // [{ priority: 10, name: 'A' }, { priority: 20, name: 'B' },
 * //  { priority: 30, name: 'C' }, { name: 'D' }]
 * ```
 */
declare function sortRulesByPriority<T extends {
    priority?: number;
}>(rules: T[]): T[];
/**
 * 在 HTML 的指定位置注入内容
 *
 * @param html - 原始 HTML 字符串
 * @param content - 要注入的内容
 * @param position - 注入位置
 * @param selector - 选择器字符串（仅 `before-selector`、`after-selector`、`replace-selector` 位置需要）
 * @param selectorMatch - 选择器匹配模式（默认为字符串匹配）
 * @returns 注入结果对象，包含注入后的 HTML、是否成功标志和失败原因
 *
 * @description 根据 `position` 参数将内容注入到 HTML 的指定位置：
 * - `head-start`：在 `<head>` 标签开始后注入
 * - `head-end`：在 `</head>` 标签前注入
 * - `body-start`：在 `<body>` 标签开始后注入
 * - `body-end`：在 `</body>` 标签前注入
 * - `before-selector`：在选择器匹配位置前注入
 * - `after-selector`：在选择器匹配位置后注入
 * - `replace-selector`：替换选择器匹配的内容
 *
 * 当目标标签或选择器未找到时，返回 `injected: false` 并附带 `reason` 说明。
 *
 * @example
 * ```typescript
 * const html = '<html><head><title>Test</title></head><body><div id="app"></div></body></html>'
 *
 * // 在 head 开始后注入 meta 标签
 * injectAtPosition(html, '<meta charset="utf-8">', 'head-start')
 *
 * // 在 body 结束前注入脚本
 * injectAtPosition(html, '<script>app()</script>', 'body-end')
 *
 * // 在指定元素前注入
 * injectAtPosition(html, '<nav>menu</nav>', 'before-selector', '<div id="app">')
 *
 * // 替换指定元素
 * injectAtPosition(html, '<div id="root"></div>', 'replace-selector', '<div id="app">')
 * ```
 */
declare function injectAtPosition(html: string, content: string, position: InjectPosition, selector?: string, selectorMatch?: SelectorMatch): PositionInjectResult;

/**
 * HTML 安全过滤模块
 *
 * @module common/html/security
 * @description 提供 HTML 内容安全过滤和验证功能，防止 XSS 攻击和危险内容注入，
 * 包括危险标签检测、危险属性过滤和安全配置验证等能力。
 */

/**
 * 默认阻止的 HTML 标签列表
 *
 * @description 包含可能导致安全风险的 HTML 标签：
 * - `script`：可执行 JavaScript 代码
 * - `iframe`：可嵌入外部页面
 * - `object`/`embed`/`applet`：可嵌入插件
 * - `form`/`input`/`textarea`/`select`/`button`：可创建表单
 */
declare const DEFAULT_BLOCKED_TAGS: string[];
/**
 * 默认阻止的 HTML 事件属性列表
 *
 * @description 包含所有可能导致 JavaScript 执行的事件处理属性，
 * 涵盖鼠标事件、键盘事件、表单事件、拖拽事件和动画事件等。
 */
declare const DEFAULT_BLOCKED_ATTRIBUTES: string[];
/**
 * 验证安全配置的合法性
 *
 * @param security - 安全配置对象
 * @throws 当 `blockedTags` 不是字符串数组时抛出错误
 * @throws 当 `allowedTags` 不是字符串数组时抛出错误
 * @throws 当 `blockedAttributes` 不是字符串数组时抛出错误
 *
 * @description 检查安全配置中的数组字段是否为合法的字符串数组类型，
 * 传入 `undefined` 时直接跳过验证。
 *
 * @example
 * ```typescript
 * // 合法配置
 * validateSecurityConfig({ blockedTags: ['iframe'], allowedTags: ['div'] })
 *
 * // 非法配置（抛出错误）
 * validateSecurityConfig({ blockedTags: 'iframe' })
 * // Error: security.blockedTags 必须是字符串数组
 * ```
 */
declare function validateSecurityConfig(security?: SecurityConfig): void;
/**
 * 内容消毒规则选项
 *
 * @description 定义对单条注入规则内容进行安全过滤时的选项，
 * 控制是否允许脚本注入等特殊行为。
 */
interface SanitizeRuleOptions {
    /** 规则标识符，用于错误消息和警告日志中标识来源规则 */
    id?: string;
    /**
     * 是否允许注入 `<script>` 标签和被阻止的标签/属性
     *
     * @description 设置为 `true` 时，将跳过对危险标签和属性的安全检查，
     * 但仍会输出警告日志提醒开发者注意安全风险。
     * 仅在注入内容来源可信时使用此选项。
     *
     * @default false
     */
    allowScriptInjection?: boolean;
}
/**
 * 对注入内容进行安全过滤
 *
 * @param content - 待过滤的 HTML 内容字符串
 * @param rule - 当前注入规则的消毒选项
 * @param security - 全局安全配置
 * @param logger - 日志记录器（需提供 `warn` 方法），用于输出安全警告
 * @returns 过滤后的安全 HTML 内容字符串
 * @throws 当内容包含被阻止的标签且未启用 `allowScriptInjection` 时抛出错误
 * @throws 当内容包含危险属性且未启用 `allowScriptInjection` 时抛出错误
 *
 * @description 对 HTML 内容进行安全过滤，防止 XSS 攻击：
 * 1. **标签过滤**：检测并阻止默认阻止列表中的标签（如 script、iframe），
 *    可通过 `security.allowedTags` 放行特定标签
 * 2. **属性过滤**：检测并阻止事件处理属性（如 onclick、onerror）
 * 3. **脚本检测**：特别检测 `<script>` 标签，需要显式启用 `allowScriptInjection`
 *
 * 当 `rule.allowScriptInjection` 为 `true` 时，跳过安全检查但输出警告日志。
 *
 * @example
 * ```typescript
 * // 安全内容直接通过
 * sanitizeContent('<div>safe</div>', { id: 'rule1' })
 *
 * // 包含 script 标签（抛出错误）
 * sanitizeContent('<script>alert(1)</script>', { id: 'rule2' })
 *
 * // 允许脚本注入（通过但输出警告）
 * sanitizeContent('<script>alert(1)</script>', { id: 'rule3', allowScriptInjection: true }, undefined, console)
 *
 * // 自定义安全配置
 * sanitizeContent('<iframe>test</iframe>', { id: 'rule4' }, { allowedTags: ['iframe'] })
 * ```
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
 *
 * @example
 * ```typescript
 * // 在 </head> 前注入 CSS
 * const result = injectBeforeTag(html, '</head>', '<style>...</style>')
 *
 * // 在 </body> 前注入 JS
 * const result = injectBeforeTag(html, '</body>', '<script>...</script>')
 * ```
 */
declare function injectBeforeTag(html: string, tag: string, code: string): HtmlInjectResult;
/**
 * 按优先级向 HTML 中注入代码
 *
 * @description 依次尝试在 `</head>`、`</body>`、`</html>` 前注入代码，
 * 优先注入到靠前的标签位置。适用于需要注入到页面中但无特定位置要求的场景
 *
 * @param html - 原始 HTML 内容
 * @param code - 要注入的代码
 * @param targets - 目标标签优先级列表，默认为 `['</head>', '</body>', '</html>']`
 * @returns 注入结果对象
 *
 * @example
 * ```typescript
 * // 优先注入到 </body> 前
 * const result = injectHtmlByPriority(html, scriptCode, ['</body>', '</html>'])
 * ```
 */
declare function injectHtmlByPriority(html: string, code: string, targets?: string[]): HtmlInjectResult;
/**
 * 带回退策略的 HTML 注入
 *
 * @description 依次尝试在 `</body>`、`</html>` 前注入代码，
 * 如果均未找到目标标签，则将代码追加到 HTML 末尾。
 * 适用于需要注入到页面底部但不确定 HTML 结构是否完整的场景。
 *
 * @param html - 原始 HTML 内容
 * @param code - 要注入的代码
 * @param fallbackMessage - 回退到末尾时的警告信息，为空则不输出警告
 * @returns 注入结果对象，包含注入后的 HTML、是否成功标志和是否使用了回退策略
 *
 * @example
 * ```typescript
 * // 注入 JS 脚本到页面底部
 * const result = injectBeforeTagWithFallback(html, '<script>...</script>')
 *
 * // 带自定义警告信息
 * const result = injectBeforeTagWithFallback(html, scriptCode, '未找到 </body> 标签，代码追加到文件末尾')
 * ```
 */
declare function injectBeforeTagWithFallback(html: string, code: string, _fallbackMessage?: string): HtmlInjectResult & {
    usedFallback: boolean;
};
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
 *
 * @example
 * ```typescript
 * // CSS 注入到 head，JS 注入到 body
 * const result = injectHeadAndBody(html, '<style>...</style>', '<script>...</script>')
 * if (!result.headInjected) logger.warn('未找到 </head> 标签')
 * if (result.usedFallback) logger.warn('代码追加到文件末尾')
 *
 * // 仅注入到 body
 * const result = injectHeadAndBody(html, undefined, '<script>...</script>')
 * ```
 */
declare function injectHeadAndBody(html: string, headCode: string | undefined, bodyCode: string): DualInjectResult;

export { DEFAULT_BLOCKED_ATTRIBUTES, DEFAULT_BLOCKED_TAGS, DualInjectResult, HtmlInjectResult, InjectCondition, InjectPosition, PositionInjectResult, SecurityConfig, SelectorMatch, applyTemplateVars, evaluateCondition, findSelectorMatch, injectAtPosition, injectBeforeTag, injectBeforeTagWithFallback, injectHeadAndBody, injectHtmlByPriority, sanitizeContent, sortRulesByPriority, validateSecurityConfig };
export type { SanitizeRuleOptions };
