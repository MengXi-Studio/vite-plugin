import type { VersionUpdateCheckerOptions, PromptStyle } from '../types'

/**
 * 将回调函数体字符串包装为安全的函数表达式
 */
function makeCallback(body?: string): string {
	if (!body) return 'function() {}'
	return `function(currentVersion, newVersion) { try { ${body} } catch(e) { console.error('[versionUpdateChecker] callback error:', e); } }`
}

/**
 * 生成内置 CSS 样式
 */
export function generateCSS(style: PromptStyle, customStyle?: string): string {
	const base = `.__vuc-overlay__{position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;pointer-events:none;}`
	let prompt = ''

	switch (style) {
		case 'modal':
			prompt = `.__vuc-modal__{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.15);padding:32px;max-width:420px;width:90%;z-index:100000;pointer-events:auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;}
.__vuc-modal-title__{font-size:18px;font-weight:600;color:#1a1a2e;margin:0 0 12px 0;}
.__vuc-modal-body__{font-size:14px;color:#555;line-height:1.6;margin:0 0 8px 0;}
.__vuc-modal-version__{font-size:12px;color:#999;margin:0 0 24px 0;}
.__vuc-modal-version__ span{font-family:Consolas,'Courier New',monospace;background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:11px;}
.__vuc-modal-actions__{display:flex;gap:12px;justify-content:center;}
.__vuc-btn__{padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;border:none;transition:all 0.2s ease;}
.__vuc-btn-refresh__{background:#4361ee;color:#fff;}
.__vuc-btn-refresh__:hover{background:#3451d1;}
.__vuc-btn-dismiss__{background:#f0f0f0;color:#666;}
.__vuc-btn-dismiss__:hover{background:#e0e0e0;}`
			break

		case 'banner':
			prompt = `.__vuc-banner__{position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#4361ee,#7c3aed);color:#fff;padding:12px 20px;z-index:100000;pointer-events:auto;display:flex;align-items:center;justify-content:space-between;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-shadow:0 2px 12px rgba(67,97,238,0.3);}
.__vuc-banner-text__{font-size:14px;flex:1;}
.__vuc-banner-actions__{display:flex;gap:8px;flex-shrink:0;}
.__vuc-btn-banner-refresh__{background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3);padding:6px 16px;border-radius:6px;font-size:13px;cursor:pointer;transition:all 0.2s ease;}
.__vuc-btn-banner-refresh__:hover{background:rgba(255,255,255,0.3);}
.__vuc-btn-banner-dismiss__{background:transparent;color:rgba(255,255,255,0.8);border:none;padding:6px 12px;font-size:13px;cursor:pointer;}
.__vuc-btn-banner-dismiss__:hover{color:#fff;}`
			break

		case 'toast':
			prompt = `.__vuc-toast__{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:14px 24px;border-radius:10px;z-index:100000;pointer-events:auto;display:flex;align-items:center;gap:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,0.2);max-width:90%;}
.__vuc-toast-text__{font-size:14px;white-space:nowrap;}
.__vuc-btn-toast-refresh__{background:#4361ee;color:#fff;border:none;padding:6px 16px;border-radius:6px;font-size:13px;cursor:pointer;white-space:nowrap;transition:all 0.2s ease;}
.__vuc-btn-toast-refresh__:hover{background:#3451d1;}
.__vuc-btn-toast-dismiss__{background:transparent;color:rgba(255,255,255,0.6);border:none;padding:6px 12px;font-size:13px;cursor:pointer;white-space:nowrap;transition:all 0.2s ease;}
.__vuc-btn-toast-dismiss__:hover{color:#fff;}`
			break
	}

	return `<style data-vuc-style>${base}${prompt}${customStyle || ''}</style>`
}

/**
 * 生成内置 HTML 模板
 */
export function generateHTMLTemplate(options: VersionUpdateCheckerOptions): string {
	const style = options.promptStyle || 'modal'
	const message = options.promptMessage || '发现新版本，是否立即刷新获取最新内容？'
	const refreshText = options.refreshButtonText || '立即刷新'
	const dismissText = options.dismissButtonText || '稍后再说'

	if (options.customPromptTemplate) {
		return options.customPromptTemplate
			.replace(/\{\{message\}\}/g, message)
			.replace(/\{\{currentVersion\}\}/g, '<span id="__vuc-current__"></span>')
			.replace(/\{\{newVersion\}\}/g, '<span id="__vuc-new__"></span>')
			.replace(/\{\{refreshButton\}\}/g, `<button class="__vuc-btn-refresh__" onclick="window.__VUC_REFRESH__()">${refreshText}</button>`)
			.replace(/\{\{dismissButton\}\}/g, `<button class="__vuc-btn-dismiss__" onclick="window.__VUC_DISMISS__()">${dismissText}</button>`)
	}

	switch (style) {
		case 'modal':
			return `<div class="__vuc-overlay__"><div class="__vuc-modal__">
<p class="__vuc-modal-title__">版本更新</p>
<p class="__vuc-modal-body__">${message}</p>
<p class="__vuc-modal-version__"><span id="__vuc-current__"></span> → <span id="__vuc-new__"></span></p>
<div class="__vuc-modal-actions__">
<button class="__vuc-btn__ __vuc-btn-dismiss__" onclick="window.__VUC_DISMISS__()">${dismissText}</button>
<button class="__vuc-btn__ __vuc-btn-refresh__" onclick="window.__VUC_REFRESH__()">${refreshText}</button>
</div></div></div>`

		case 'banner':
			return `<div class="__vuc-overlay__"><div class="__vuc-banner__">
<span class="__vuc-banner-text__">${message}</span>
<div class="__vuc-banner-actions__">
<button class="__vuc-btn-banner-dismiss__" onclick="window.__VUC_DISMISS__()">${dismissText}</button>
<button class="__vuc-btn-banner-refresh__" onclick="window.__VUC_REFRESH__()">${refreshText}</button>
</div></div></div>`

		case 'toast':
			return `<div class="__vuc-overlay__"><div class="__vuc-toast__">
<span class="__vuc-toast-text__">${message}</span>
<button class="__vuc-btn-toast-dismiss__" onclick="window.__VUC_DISMISS__()">${dismissText}</button>
<button class="__vuc-btn-toast-refresh__" onclick="window.__VUC_REFRESH__()">${refreshText}</button>
</div></div>`

		default:
			return `<div class="__vuc-overlay__"><div class="__vuc-modal__">
<p class="__vuc-modal-title__">版本更新</p>
<p class="__vuc-modal-body__">${message}</p>
<p class="__vuc-modal-version__"><span id="__vuc-current__"></span> → <span id="__vuc-new__"></span></p>
<div class="__vuc-modal-actions__">
<button class="__vuc-btn__ __vuc-btn-dismiss__" onclick="window.__VUC_DISMISS__()">${dismissText}</button>
<button class="__vuc-btn__ __vuc-btn-refresh__" onclick="window.__VUC_REFRESH__()">${refreshText}</button>
</div></div></div>`
	}
}

/**
 * 生成客户端版本检查器 IIFE 代码
 */
export function generateCheckerCode(options: VersionUpdateCheckerOptions): string {
	const versionSource = options.versionSource || 'auto'
	const defineName = options.defineName || '__APP_VERSION__'
	const checkUrl = options.checkUrl || '/version.json'
	const checkInterval = options.checkInterval || 300000
	const checkOnVisibility = options.checkOnVisibilityChange !== false
	const enableInDev = options.enableInDev || false
	const cbUpdateAvailable = makeCallback(options.onUpdateAvailable)
	const cbRefresh = makeCallback(options.onRefresh)
	const cbDismiss = makeCallback(options.onDismiss)

	// 读取当前版本号的代码
	let getCurrentVersionCode = ''
	if (versionSource === 'define' || versionSource === 'auto') {
		getCurrentVersionCode = `
    // 优先从 define 全局变量读取
    if (typeof ${defineName} !== 'undefined') return ${defineName};`
	}
	if (versionSource === 'file' || versionSource === 'auto') {
		getCurrentVersionCode += `
    // 从页面 meta 标签读取
    var metaEl = document.querySelector('meta[name="app-version"]');
    if (metaEl && metaEl.getAttribute('content')) return metaEl.getAttribute('content');`
	}
	getCurrentVersionCode += `
    return null;`

	return `;(function() {
  'use strict';

  // SSR 环境检测
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 开发模式检测
  var _isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
  if (_isDev && !${JSON.stringify(enableInDev)}) return;

  // 状态
  var _currentVersion = null;
  var _latestVersion = null;
  var _promptVisible = false;
  var _dismissed = false;
  var _delayTimer = null;
  var _intervalTimer = null;
  var _destroyed = false;

  // 获取当前版本号
  function _getCurrentVersion() {${getCurrentVersionCode}
  }

  // 检查版本更新
  function _checkForUpdate() {
    if (_destroyed || _dismissed || _promptVisible) return;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', ${JSON.stringify(checkUrl)} + '?_t=' + Date.now(), true);
    xhr.timeout = 10000;
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200) return;
      try {
        var data = JSON.parse(xhr.responseText);
        _latestVersion = data.version || data;
        if (!_currentVersion) _currentVersion = _getCurrentVersion();
        if (!_currentVersion || !_latestVersion) return;
        if (_currentVersion === _latestVersion) return;

        // 版本不一致，发现更新
        var shouldShow = ${cbUpdateAvailable}(_currentVersion, _latestVersion);
        if (shouldShow !== false) {
          _showPrompt();
        }
      } catch(e) {
        // 解析失败，静默忽略
      }
    };
    xhr.send();
  }

  // 显示更新提示
  function _showPrompt() {
    if (_promptVisible || _destroyed) return;
    _promptVisible = true;

    var container = document.getElementById('__vuc-root__');
    if (!container) return;

    container.style.display = '';

    // 填充版本号
    var currentEl = document.getElementById('__vuc-current__');
    var newEl = document.getElementById('__vuc-new__');
    if (currentEl) currentEl.textContent = _currentVersion;
    if (newEl) newEl.textContent = _latestVersion;
  }

  // 隐藏更新提示
  function _hidePrompt() {
    _promptVisible = false;
    var container = document.getElementById('__vuc-root__');
    if (container) container.style.display = 'none';
  }

  // 刷新页面
  window.__VUC_REFRESH__ = function() {
    ${cbRefresh}(_currentVersion, _latestVersion);
    window.location.reload();
  };

  // 忽略更新
  window.__VUC_DISMISS__ = function() {
    ${cbDismiss}(_currentVersion, _latestVersion);
    _dismissed = true;
    _hidePrompt();
  };

  // 启动定时检查
  function _startChecking() {
    _currentVersion = _getCurrentVersion();
    if (!_currentVersion) {
      console.warn('[versionUpdateChecker] 无法获取当前版本号，版本检查已跳过。请确认 generateVersion 插件已正确配置。');
      return;
    }

    // 首次延迟 10 秒检查，避免页面刚加载就弹出
    _delayTimer = setTimeout(function() {
      _checkForUpdate();
      // 之后按间隔定期检查
      _intervalTimer = setInterval(_checkForUpdate, ${checkInterval});
    }, 10000);
  }

  // 销毁检查器，清理定时器和 DOM
  function _destroy() {
    _destroyed = true;
    if (_delayTimer) { clearTimeout(_delayTimer); _delayTimer = null; }
    if (_intervalTimer) { clearInterval(_intervalTimer); _intervalTimer = null; }
    var container = document.getElementById('__vuc-root__');
    if (container) container.parentNode.removeChild(container);
    var styleEl = document.querySelector('style[data-vuc-style]');
    if (styleEl) styleEl.parentNode.removeChild(styleEl);
    delete window.__VUC_REFRESH__;
    delete window.__VUC_DISMISS__;
  }

  // 页面可见性变化时检查
  ${
		checkOnVisibility
			? `
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && !_destroyed && !_dismissed && !_promptVisible) {
      _checkForUpdate();
    }
  });`
			: ''
	}

  // DOM 就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _startChecking);
  } else {
    _startChecking();
  }
})();`
}

/**
 * 生成 meta 标签注入代码（file 模式下使用）
 *
 * @description 当 versionSource 为 'file' 或 'auto' 时，
 * 在 HTML head 中注入 meta 标签以便客户端读取当前版本号
 */
export function generateMetaTag(options: VersionUpdateCheckerOptions): string {
	const versionSource = options.versionSource || 'auto'
	if (versionSource !== 'file' && versionSource !== 'auto') return ''
	const defineName = options.defineName || '__APP_VERSION__'
	return `<meta name="app-version" content="${defineName}">`
}

/**
 * 生成完整的注入代码（CSS + HTML + JS）
 */
export function generateFullInjectCode(options: VersionUpdateCheckerOptions): string {
	const css = generateCSS(options.promptStyle || 'modal', options.customStyle)
	const html = generateHTMLTemplate(options)
	const js = generateCheckerCode(options)

	// 外层容器默认隐藏，检测到更新时才显示
	return `${css}\n<div id="__vuc-root__" style="display:none">${html}</div>\n<script>${js}</script>`
}
