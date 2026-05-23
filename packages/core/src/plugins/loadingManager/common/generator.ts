import type { LoadingManagerOptions, AutoHideOn } from '../types'
import { ID_ROOT, ATTR_TEXT, CLS_HIDDEN, CLS_VISIBLE } from './constants'

/**
 * 将回调函数体字符串包装为安全的函数表达式
 *
 * @param body - 函数体代码字符串
 * @returns 安全的函数表达式字符串（包含 try-catch 保护）
 */
export function makeCallback(body?: string): string {
	if (!body) return 'function() {}'
	return `function() { try { ${body} } catch(e) { console.error('[loadingManager] callback error:', e); } }`
}

/**
 * 生成变量声明代码
 *
 * @param params - 变量声明所需的配置参数
 * @returns JavaScript 变量声明代码字符串
 */
export function generateVarsCode(params: {
	globalName: string
	minDisplayTime: unknown
	delayShow: unknown
	debounceHide: unknown
	transition: unknown
	excludeUrls: RegExp[]
	includeUrls: RegExp[]
	excludeMethods: string[]
	excludeUrlPrefixes: string[]
	cbBeforeShow: string
	cbShow: string
	cbBeforeHide: string
	cbHide: string
	cbDestroy: string
}): string {
	return `  var _loadingEl = null;
  var _textEl = null;
  var _styleEl = null;
  var _visible = false;
  var _destroyed = false;
  var _showTimer = null;
  var _hideTimer = null;
  var _debounceTimer = null;
  var _retryTimer = null;
  var _showTime = 0;
  var _pendingCount = 0;
  var _showRetryCount = 0;
  var _maxShowRetries = 20;

  // 配置
  var _minDisplayTime = ${JSON.stringify(params.minDisplayTime)};
  var _delayShow = ${JSON.stringify(params.delayShow)};
  var _debounceHide = ${JSON.stringify(params.debounceHide)};
  var _transition = ${JSON.stringify(params.transition)};
  var _excludeUrls = ${JSON.stringify(params.excludeUrls.map(r => ({ source: r.source, flags: r.flags })))}.map(function(s) { return new RegExp(s.source, s.flags); });
  var _includeUrls = ${JSON.stringify(params.includeUrls.map(r => ({ source: r.source, flags: r.flags })))}.map(function(s) { return new RegExp(s.source, s.flags); });
  var _excludeMethods = ${JSON.stringify(params.excludeMethods)};
  var _excludeUrlPrefixes = ${JSON.stringify(params.excludeUrlPrefixes)};

  // 回调
  var _onBeforeShow = ${params.cbBeforeShow};
  var _onShow = ${params.cbShow};
  var _onBeforeHide = ${params.cbBeforeHide};
  var _onHide = ${params.cbHide};
  var _onDestroy = ${params.cbDestroy};

  // 保存原始方法引用，用于 destroy 时恢复
  var _originalFetch = null;
  var _originalXHROpen = null;
  var _originalXHRSend = null;`
}

/**
 * 生成辅助函数代码
 *
 * @param globalName - 全局变量名，用于查找对应的 style 元素
 * @returns 包含 _findEl / _shouldFilter / _clearTimers / _applyTransition 的代码字符串
 */
export function generateHelpersCode(globalName: string): string {
	return `  function _findEl() {
    if (!_loadingEl) {
      _loadingEl = document.getElementById('${ID_ROOT}');
    }
    if (!_textEl && _loadingEl) {
      _textEl = _loadingEl.querySelector('[${ATTR_TEXT}]');
    }
    if (!_styleEl) {
      _styleEl = document.querySelector('style[data-loading-id="${globalName}"]');
    }
  }

  function _shouldFilter(url, method) {
    if (!url) return false;
    var upperMethod = (method || 'GET').toUpperCase();
    for (var i = 0; i < _excludeMethods.length; i++) {
      if (upperMethod === _excludeMethods[i].toUpperCase()) return true;
    }
    for (var i = 0; i < _excludeUrlPrefixes.length; i++) {
      if (url.indexOf(_excludeUrlPrefixes[i]) === 0) return true;
    }
    if (_includeUrls.length > 0) {
      var included = false;
      for (var i = 0; i < _includeUrls.length; i++) {
        _includeUrls[i].lastIndex = 0;
        if (_includeUrls[i].test(url)) { included = true; break; }
      }
      if (!included) return true;
    }
    for (var i = 0; i < _excludeUrls.length; i++) {
      _excludeUrls[i].lastIndex = 0;
      if (_excludeUrls[i].test(url)) return true;
    }
    return false;
  }

  function _clearTimers() {
    if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
    if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }
    if (_debounceTimer) { clearTimeout(_debounceTimer); _debounceTimer = null; }
    if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null; }
  }

  function _applyTransition(show) {
    if (!_transition.enabled || !_loadingEl) return;
    var d = _transition.duration || 200;
    var e = _transition.easing || 'ease-out';
    _loadingEl.style.transition = 'opacity ' + d + 'ms ' + e + ', visibility ' + d + 'ms ' + e;
  }`
}

/**
 * 生成核心逻辑代码
 *
 * @returns 包含 _applyHide / _doShow / _doHide / _restoreInterceptors 的代码字符串
 */
export function generateCoreLogicCode(): string {
	return `  function _applyHide() {
    if (!_loadingEl) return;
    _loadingEl.classList.remove('${CLS_VISIBLE}');
    _loadingEl.classList.add('${CLS_HIDDEN}');
    _applyTransition(false);
    _visible = false;
    _showTime = 0;
    _onHide();
  }

  function _doShow(text) {
    if (_destroyed) return;
    _findEl();
    if (!_loadingEl) {
      if (++_showRetryCount > _maxShowRetries) return;
      _retryTimer = setTimeout(function() { _retryTimer = null; _doShow(text); }, 50);
      return;
    }
    _showRetryCount = 0;

    var result = _onBeforeShow();
    if (result === false) return;

    if (_textEl && text) _textEl.textContent = text;
    _loadingEl.classList.remove('${CLS_HIDDEN}');
    _loadingEl.classList.add('${CLS_VISIBLE}');
    _applyTransition(true);
    _visible = true;
    _showTime = Date.now();
    _onShow();
  }

  function _doHide(force) {
    if (_destroyed) return;
    if (!_visible && !force) return;
    _findEl();
    if (!_loadingEl) return;

    if (!force) {
      var result = _onBeforeHide();
      if (result === false) return;
    }

    if (!force && _minDisplayTime.enabled && _showTime > 0) {
      var elapsed = Date.now() - _showTime;
      var remaining = _minDisplayTime.duration - elapsed;
      if (remaining > 0) {
        if (_hideTimer) clearTimeout(_hideTimer);
        _hideTimer = setTimeout(function() { _hideTimer = null; _doHide(true); }, remaining);
        return;
      }
    }

    if (_debounceHide.enabled && !force) {
      if (_debounceTimer) clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(function() { _debounceTimer = null; _applyHide(); }, _debounceHide.duration);
      return;
    }

    _applyHide();
  }

  function _restoreInterceptors() {
    if (_originalFetch && typeof window !== 'undefined' && window.fetch) {
      window.fetch = _originalFetch;
      _originalFetch = null;
    }
    if (_originalXHROpen && typeof window !== 'undefined' && window.XMLHttpRequest) {
      XMLHttpRequest.prototype.open = _originalXHROpen;
      XMLHttpRequest.prototype.send = _originalXHRSend;
      _originalXHROpen = null;
      _originalXHRSend = null;
    }
  }`
}

/**
 * 生成 manager 对象代码
 *
 * @returns LoadingManager 对象的方法定义代码字符串
 */
export function generateManagerObjectCode(): string {
	return `    show: function(text) {
      if (_destroyed) return;
      _clearTimers();
      _showTime = 0;
      _showRetryCount = 0;
      if (_delayShow.enabled && _delayShow.duration > 0) {
        _showTimer = setTimeout(function() { _showTimer = null; _doShow(text); }, _delayShow.duration);
      } else {
        _doShow(text);
      }
    },
    hide: function() {
      if (_destroyed) return;
      if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
      _doHide(false);
    },
    forceHide: function() {
      if (_destroyed) return;
      _clearTimers();
      _doHide(true);
    },
    toggle: function(text) {
      if (_destroyed) return;
      if (_visible) {
        this.hide();
      } else {
        this.show(text);
      }
    },
    enablePointerEvents: function() {
      if (_destroyed) return;
      _findEl();
      if (_loadingEl) _loadingEl.style.pointerEvents = 'auto';
    },
    disablePointerEvents: function() {
      if (_destroyed) return;
      _findEl();
      if (_loadingEl) _loadingEl.style.pointerEvents = 'none';
    },
    togglePointerEvents: function() {
      if (_destroyed) return;
      _findEl();
      if (!_loadingEl) return;
      if (_loadingEl.style.pointerEvents === 'none') {
        this.enablePointerEvents();
      } else {
        this.disablePointerEvents();
      }
    },
    updateText: function(text) {
      if (_destroyed) return;
      _findEl();
      if (_textEl) _textEl.textContent = text;
    },
    isVisible: function() {
      return _visible && !_destroyed;
    },
    isPointerEventsEnabled: function() {
      if (_destroyed) return false;
      _findEl();
      if (!_loadingEl) return false;
      return _loadingEl.style.pointerEvents !== 'none';
    },
    getPendingCount: function() {
      return _pendingCount;
    },
    destroy: function() {
      if (_destroyed) return;
      _destroyed = true;
      _clearTimers();
      _findEl();
      if (_loadingEl && _loadingEl.parentNode) {
        _loadingEl.parentNode.removeChild(_loadingEl);
      }
      if (_styleEl && _styleEl.parentNode) {
        _styleEl.parentNode.removeChild(_styleEl);
      }
      _loadingEl = null;
      _textEl = null;
      _styleEl = null;
      _visible = false;
      _showTime = 0;
      _pendingCount = 0;
      _restoreInterceptors();
      _onDestroy();
    },
    _requestStart: function(url, method) {
      if (_destroyed) return;
      if (_shouldFilter(url, method)) return;
      _pendingCount++;
      if (_pendingCount === 1) this.show();
    },
    _requestEnd: function(url, method) {
      if (_destroyed) return;
      if (_shouldFilter(url, method)) return;
      _pendingCount = Math.max(0, _pendingCount - 1);
      if (_pendingCount === 0) this.hide();
    }`
}

/**
 * 生成请求拦截器代码
 *
 * @param autoBind - 自动绑定模式（'fetch' / 'xhr' / 'all' / 'none'）
 * @returns fetch/XHR 拦截器代码字符串
 */
export function generateInterceptorsCode(autoBind: string): string {
	let code = ''

	if (autoBind === 'fetch' || autoBind === 'all') {
		code += `  // 自动拦截 fetch
  if (typeof window !== 'undefined' && window.fetch) {
    _originalFetch = window.fetch;
    window.fetch = function(input, init) {
      var url = typeof input === 'string' ? input : (input instanceof URL ? input.href : (input && input.url ? input.url : ''));
      var method = (init && init.method) || (input && input.method) || 'GET';
      manager._requestStart(url, method);
      return _originalFetch.apply(this, arguments).then(
        function(response) { manager._requestEnd(url, method); return response; },
        function(error) { manager._requestEnd(url, method); throw error; }
      );
    };
  }
`
	}

	if (autoBind === 'xhr' || autoBind === 'all') {
		code += `  // 自动拦截 XMLHttpRequest
  if (typeof window !== 'undefined' && window.XMLHttpRequest) {
    _originalXHROpen = XMLHttpRequest.prototype.open;
    _originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(method, url) {
      this.__loadingUrl = url || '';
      this.__loadingMethod = method || 'GET';
      return _originalXHROpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function() {
      var self = this;
      manager._requestStart(self.__loadingUrl, self.__loadingMethod);
      self.addEventListener('loadend', function() {
        manager._requestEnd(self.__loadingUrl, self.__loadingMethod);
      });
      return _originalXHRSend.apply(this, arguments);
    };
  }
`
	}

	return code.trimEnd()
}

/**
 * 生成初始化代码
 *
 * @param defaultVisible - 是否默认可见
 * @param autoHideOn - 自动隐藏时机
 * @param globalName - 全局变量名
 * @returns 包含 defaultVisible / autoHideOn / 全局暴露的代码字符串
 */
export function generateInitCode(defaultVisible: boolean, autoHideOn: AutoHideOn, globalName: string): string {
	let code = ''

	code += `  // defaultVisible: 同步初始可见状态
  var _defaultVisible = ${JSON.stringify(defaultVisible)};
  if (_defaultVisible) {
    _visible = true;
    _showTime = Date.now();
  }
`

	if (defaultVisible && autoHideOn !== 'manual') {
		code += `
  // autoHideOn: 自动隐藏时机
  var _autoHideOn = '${autoHideOn}';
  function _autoHideHandler() {
    manager.hide();
  }
  if (_autoHideOn === 'load') {
    if (document.readyState === 'complete') {
      _autoHideHandler();
    } else {
      window.addEventListener('load', _autoHideHandler);
    }
  } else {
    if (document.readyState !== 'loading') {
      _autoHideHandler();
    } else {
      document.addEventListener('DOMContentLoaded', _autoHideHandler);
    }
  }
`
	}

	code += `
  // 暴露到全局
  window['${globalName}'] = manager;`

	return code
}

/**
 * 生成完整的 Loading 管理器 JavaScript 代码
 *
 * @remarks 将各代码生成模块组装为完整的 IIFE（立即执行函数表达式），
 * 在浏览器端创建 loading 管理器实例
 *
 * @param options - 插件配置选项
 * @returns 完整的 JavaScript IIFE 代码字符串
 */
export function generateLoadingManagerCode(options: LoadingManagerOptions): string {
	const globalName = options.globalName || '__LOADING_MANAGER__'
	const minDisplayTime = options.minDisplayTime || { enabled: true, duration: 300 }
	const delayShow = options.delayShow || { enabled: true, duration: 200 }
	const debounceHide = options.debounceHide || { enabled: false, duration: 100 }
	const transition = options.transition || { enabled: true, duration: 200, easing: 'ease-out' }
	const autoBind = options.autoBind || 'none'
	const requestFilter = options.requestFilter || {}
	const defaultVisible = options.defaultVisible || false
	const autoHideOn: AutoHideOn = options.autoHideOn || 'DOMContentLoaded'
	const callbacks = options.callbacks || {}

	const excludeUrls = requestFilter.excludeUrls || []
	const includeUrls = requestFilter.includeUrls || []
	const excludeMethods = requestFilter.excludeMethods || []
	const excludeUrlPrefixes = requestFilter.excludeUrlPrefixes || []

	const cbBeforeShow = makeCallback(callbacks.onBeforeShow)
	const cbShow = makeCallback(callbacks.onShow)
	const cbBeforeHide = makeCallback(callbacks.onBeforeHide)
	const cbHide = makeCallback(callbacks.onHide)
	const cbDestroy = makeCallback(callbacks.onDestroy)

	const vars = generateVarsCode({
		globalName,
		minDisplayTime,
		delayShow,
		debounceHide,
		transition,
		excludeUrls,
		includeUrls,
		excludeMethods,
		excludeUrlPrefixes,
		cbBeforeShow,
		cbShow,
		cbBeforeHide,
		cbHide,
		cbDestroy
	})
	const helpers = generateHelpersCode(globalName)
	const coreLogic = generateCoreLogicCode()
	const managerObj = generateManagerObjectCode()
	const interceptors = generateInterceptorsCode(autoBind)
	const init = generateInitCode(defaultVisible, autoHideOn, globalName)

	return `(function() {
  'use strict';

  // SSR 环境检测
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

${vars}

${helpers}

${coreLogic}

  var manager = {
${managerObj}
  };

${interceptors}

${init}
})();`
}
