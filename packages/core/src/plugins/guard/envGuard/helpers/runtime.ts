import type { RuntimeGuardMode } from '../types'
import type { EnvFieldRule, EnvValidationResult } from './validator'

/**
 * 生成运行时环境变量守卫的 JavaScript 代码
 *
 * @param {Record<string, EnvFieldRule>} rules - 环境变量校验规则映射
 * @param {string} globalName - 全局变量名
 * @param {RuntimeGuardMode} mode - 守卫行为模式
 * @param {EnvValidationResult[]} results - 构建时校验结果
 * @returns {string} 完整的 <script> 标签代码
 *
 * @description 生成一段运行时 JavaScript 代码，注入到 HTML 中，
 * 在页面加载时检查关键环境变量是否已正确注入，
 * 根据配置的 mode 决定守卫行为（控制台警告、抛出错误或显示覆盖层）
 */
export function generateRuntimeGuard(rules: Record<string, EnvFieldRule>, globalName: string, mode: RuntimeGuardMode, results: EnvValidationResult[]): string {
	const requiredVars: Array<{ key: string; rule: EnvFieldRule }> = []

	for (const [key, rule] of Object.entries(rules)) {
		if (rule.required !== false) {
			requiredVars.push({ key, rule: { type: 'string', required: true, ...rule } })
		}
	}

	if (requiredVars.length === 0) return ''

	const failedResults = results.filter(r => r.status !== 'pass')

	const guardData = requiredVars.map(({ key, rule }) => ({
		key,
		type: rule.type || 'string',
		description: rule.description || ''
	}))

	const guardDataJson = JSON.stringify(guardData, null, 2)
	const failedKeys = failedResults.map(r => r.key)
	const failedJson = JSON.stringify(failedKeys)

	const modeHandlers = buildModeHandlers(mode)

	const code = `
(function() {
  'use strict';
  var GUARD_NAME = ${JSON.stringify(globalName)};
  var GUARD_DATA = ${guardDataJson};
  var FAILED_KEYS = ${failedJson};
  var MODE = ${JSON.stringify(mode)};

  var missing = [];
  var invalid = [];

  for (var i = 0; i < GUARD_DATA.length; i++) {
    var item = GUARD_DATA[i];
    var el = document.querySelector('meta[name="env:' + item.key + '"]');
    if (!el) {
      var attr = document.querySelector('[' + item.key + ']');
      if (!attr) {
        missing.push(item.key);
      }
    }
  }

  for (var j = 0; j < FAILED_KEYS.length; j++) {
    if (invalid.indexOf(FAILED_KEYS[j]) === -1 && missing.indexOf(FAILED_KEYS[j]) === -1) {
      invalid.push(FAILED_KEYS[j]);
    }
  }

  var hasIssues = missing.length > 0 || invalid.length > 0;

  var guard = {
    missing: missing,
    invalid: invalid,
    allPassed: !hasIssues,
    data: GUARD_DATA
  };

  if (typeof window !== 'undefined') {
    window[GUARD_NAME] = guard;
  }

  if (hasIssues) {
    ${modeHandlers}
  }
})();
`.trim()

	return `<script>\n${code}\n</script>`
}

/**
 * 根据运行时守卫模式生成对应的处理代码
 *
 * @param {RuntimeGuardMode} mode - 守卫行为模式
 * @returns {string} 对应模式的 JavaScript 代码片段
 *
 * @description 根据不同的守卫模式生成不同的客户端处理逻辑：
 * - `console`: 在浏览器控制台输出警告信息
 * - `throw`: 抛出运行时错误
 * - `overlay`: 在页面顶部创建固定的警告横幅
 */
function buildModeHandlers(mode: RuntimeGuardMode): string {
	switch (mode) {
		case 'console':
			return `
    var msgs = [];
    if (missing.length > 0) msgs.push('[EnvGuard] 缺少环境变量: ' + missing.join(', '));
    if (invalid.length > 0) msgs.push('[EnvGuard] 环境变量校验失败: ' + invalid.join(', '));
    for (var k = 0; k < msgs.length; k++) console.warn(msgs[k]);`

		case 'throw':
			return `
    var errMsg = '';
    if (missing.length > 0) errMsg += '缺少环境变量: ' + missing.join(', ') + '; ';
    if (invalid.length > 0) errMsg += '环境变量校验失败: ' + invalid.join(', ');
    throw new Error('[EnvGuard] ' + errMsg);`

		case 'overlay':
			return `
    var overlay = document.createElement('div');
    overlay.id = '__env_guard_overlay__';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#fff3cd;color:#856404;padding:12px 20px;font-size:14px;font-family:monospace;border-bottom:3px solid #ffc107;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
    var html = '<strong>⚠️ EnvGuard 警告</strong><br>';
    if (missing.length > 0) html += '缺少: ' + missing.join(', ') + '<br>';
    if (invalid.length > 0) html += '校验失败: ' + invalid.join(', ');
    overlay.innerHTML = html;
    document.addEventListener('DOMContentLoaded', function() { document.body.appendChild(overlay); });`

		default:
			return ''
	}
}
