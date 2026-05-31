/**
 * 判断模块 ID 是否来自 node_modules
 *
 * @param {string} moduleId - 模块标识符
 * @returns {boolean} 是否来自 node_modules
 *
 * @description 检测规则：
 * - 路径中包含 `node_modules` 的模块
 * - 以 `\0` 开头的虚拟模块（Rollup 内部模块）
 * - 以 `virtual:` 开头的虚拟模块
 *
 * @example
 * ```typescript
 * isNodeModule('node_modules/lodash/index.js')  // true
 * isNodeModule('src/utils/helper.ts')           // false
 * isNodeModule('\0some-virtual-module')         // true
 * isNodeModule('virtual:import-meta-env')       // true
 * ```
 */
declare function isNodeModule(moduleId: string): boolean;

export { isNodeModule };
