export { V as Validator } from '../../shared/vite-plugin.DRRlWY8P.mjs';
export { E as EnvFieldRule, a as EnvType, b as EnvValidationResult, S as STRING_LIKE_TYPES, v as validateEnvironment, c as validateLength, d as validateRange, e as validateType, f as validateValue } from '../../shared/vite-plugin.CmtcnItg.mjs';

/**
 * 验证全局变量名的合法性（包装 validateIdentifierName，附加字段上下文信息）
 *
 * @param name - 全局变量名
 * @param fieldName - 字段名称，用于错误消息上下文（如 'globalName'、'defineName'）
 * @throws 当名称不合法时抛出带字段上下文的错误
 *
 * @example
 * ```typescript
 * validateGlobalName('__LOADING_MANAGER__', 'globalName')
 * validateGlobalName('__APP_VERSION__', 'defineName')
 * ```
 */
declare function validateGlobalName(name: string | undefined, fieldName: string): void;
/**
 * 验证模板字符串不包含 script 标签（XSS 防护）
 *
 * @param template - 模板字符串
 * @param fieldName - 字段名称，用于错误消息上下文
 * @throws 当模板包含 `<script>` 标签时抛出错误
 *
 * @example
 * ```typescript
 * validateNoScriptInTemplate('<div>safe</div>', 'customTemplate')
 * validateNoScriptInTemplate(options.customPromptTemplate, 'customPromptTemplate')
 * ```
 */
declare function validateNoScriptInTemplate(template: string | undefined, fieldName: string): void;
/**
 * 验证回调字段不包含 script 标签
 *
 * @param callbacks - 回调配置对象
 * @param fields - 需要验证的回调字段名数组
 * @param objectName - 回调所属对象名称，用于错误消息上下文
 * @throws 当回调字段非字符串类型时抛出错误
 * @throws 当回调字符串包含 `<script>` 标签时抛出错误
 *
 * @example
 * ```typescript
 * validateCallbackFields(callbacks, ['onShow', 'onHide'], 'callbacks')
 * validateCallbackFields(options, ['onUpdateAvailable', 'onRefresh'], 'callbacks')
 * ```
 */
declare function validateCallbackFields(callbacks: Record<string, any>, fields: string[], objectName: string): void;
/**
 * 验证数值为非负数
 *
 * @param value - 待验证的数值
 * @param fieldName - 字段名称，用于错误消息
 * @throws 当值存在但不是数字或为负数时抛出错误
 *
 * @example
 * ```typescript
 * validateNonNegativeNumber(100, 'zIndex')
 * validateNonNegativeNumber(-1, 'duration') // 抛出错误
 * ```
 */
declare function validateNonNegativeNumber(value: number | undefined, fieldName: string): void;
/**
 * 验证嵌套配置项的 duration 合法性
 *
 * @param config - 嵌套配置对象（包含 enabled 和 duration 字段）
 * @param errorMsg - 验证失败时的错误提示信息
 * @throws 当 duration 存在但不是非负数时抛出错误
 *
 * @example
 * ```typescript
 * validateNestedDuration({ enabled: true, duration: 300 }, 'minDisplayTime.duration 必须是非负数')
 * ```
 */
declare function validateNestedDuration(config: {
    enabled?: boolean;
    duration?: number;
} | undefined, errorMsg: string): void;
/**
 * 验证字符串值是否在允许的枚举列表中
 *
 * @param value - 待验证的值
 * @param allowedValues - 允许的值列表
 * @param fieldName - 字段名称，用于错误消息
 * @throws 当值存在但不在允许列表中时抛出错误
 *
 * @example
 * ```typescript
 * validateEnumValue('center', ['center', 'top', 'bottom'], 'position')
 * validateEnumValue('modal', ['modal', 'banner', 'toast'], 'promptStyle')
 * ```
 */
declare function validateEnumValue(value: string | undefined, allowedValues: string[], fieldName: string): void;

export { validateCallbackFields, validateEnumValue, validateGlobalName, validateNestedDuration, validateNoScriptInTemplate, validateNonNegativeNumber };
