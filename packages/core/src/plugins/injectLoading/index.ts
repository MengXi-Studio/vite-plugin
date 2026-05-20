import type { Plugin } from 'vite'
import { BasePlugin, createPluginFactory } from '@/factory'
import type { InjectLoadingOptions, LoadingCallbacks, AutoHideOn } from './types'
import { generateCSS, generateHTMLTemplate, ID_ROOT, ATTR_TEXT, CLS_HIDDEN, CLS_VISIBLE } from './common'

/**
 * 注入全局 Loading 状态管理插件类
 *
 * @class InjectLoadingPlugin
 * @extends {BasePlugin<InjectLoadingOptions>}
 * @description 该插件在构建过程中将全局 Loading 状态管理代码注入到应用中，
 * 提供创建、显示、隐藏和销毁 loading 的方法，支持跨组件共享 loading 状态，
 * 并可自动拦截 fetch/XHR 请求实现 loading 的自动管理。
 */
class InjectLoadingPlugin extends BasePlugin<InjectLoadingOptions> {
	/**
	 * 获取插件默认配置
	 *
	 * @remarks 返回所有配置项的默认值，包括位置、文本、图标类型、样式、
	 * 过渡动画、最小显示时间、延迟显示、防抖隐藏、自动绑定等
	 *
	 * @returns 包含所有默认配置的 {@link InjectLoadingOptions} 部分对象
	 *
	 * @override
	 */
	protected getDefaultOptions(): Partial<InjectLoadingOptions> {
		return {
			position: 'center',
			defaultText: '加载中...',
			spinnerType: 'spinner',
			autoBind: 'none',
			globalName: '__LOADING_MANAGER__',
			defaultVisible: false,
			autoHideOn: 'DOMContentLoaded',
			style: {
				overlayColor: 'rgba(255, 255, 255, 0.7)',
				spinnerColor: '#4361ee',
				spinnerSize: '40px',
				textColor: '#333',
				textSize: '14px',
				zIndex: 9999,
				pointerEvents: false,
				backdropBlur: false,
				backdropBlurAmount: 4
			},
			transition: {
				enabled: true,
				duration: 200,
				easing: 'ease-out'
			},
			minDisplayTime: {
				enabled: true,
				duration: 300
			},
			delayShow: {
				enabled: true,
				duration: 200
			},
			debounceHide: {
				enabled: false,
				duration: 100
			}
		}
	}

	/**
	 * 验证插件配置选项的合法性
	 *
	 * @remarks 依次验证以下配置项：
	 * - `position` — 必须为 `'center'` | `'top'` | `'bottom'`
	 * - `defaultText` — 必须为字符串
	 * - `spinnerType` — 必须为 `'spinner'` | `'dots'` | `'pulse'` | `'bar'`
	 * - `autoBind` — 必须为 `'fetch'` | `'xhr'` | `'all'` | `'none'`
	 * - `globalName` — 必须为字符串
	 * - `customTemplate` — 必须为字符串
	 * - `defaultVisible` — 必须为布尔值
	 * - `autoHideOn` — 必须为 `'DOMContentLoaded'` | `'load'` | `'manual'`
	 * - `style` — 通过 {@link validateStyle} 验证
	 * - `minDisplayTime` / `delayShow` / `debounceHide` — 通过 {@link validateNestedConfig} 验证
	 * - `transition` — 通过 {@link validateTransition} 验证
	 * - `callbacks` — 通过 {@link validateCallbacks} 验证
	 *
	 * @throws 当配置项不合法时抛出描述性错误
	 *
	 * @override
	 */
	protected validateOptions(): void {
		this.validator
			.field('position')
			.custom(val => !val || ['center', 'top', 'bottom'].includes(val), 'position 必须是 center, top 或 bottom')
			.field('defaultText')
			.string()
			.field('spinnerType')
			.custom(val => !val || ['spinner', 'dots', 'pulse', 'bar'].includes(val), 'spinnerType 必须是 spinner, dots, pulse 或 bar')
			.field('autoBind')
			.custom(val => !val || ['fetch', 'xhr', 'all', 'none'].includes(val), 'autoBind 必须是 fetch, xhr, all 或 none')
			.field('globalName')
			.string()
			.field('customTemplate')
			.string()
			.field('defaultVisible')
			.boolean()
			.field('autoHideOn')
			.custom(val => !val || ['DOMContentLoaded', 'load', 'manual'].includes(val), 'autoHideOn 必须是 DOMContentLoaded, load 或 manual')
			.validate()

		this.validateStyle()
		this.validateNestedConfig('minDisplayTime', 'minDisplayTime.duration 必须是非负数')
		this.validateNestedConfig('delayShow', 'delayShow.duration 必须是非负数')
		this.validateNestedConfig('debounceHide', 'debounceHide.duration 必须是非负数')
		this.validateTransition()
		this.validateCallbacks()
	}

	/**
	 * 验证样式配置的合法性
	 *
	 * @remarks 检查 `style.zIndex` 和 `style.backdropBlurAmount` 是否为非负数
	 *
	 * @throws 当 `style.zIndex` 为非数字或负数时抛出错误
	 * @throws 当 `style.backdropBlurAmount` 为负数时抛出错误
	 */
	private validateStyle(): void {
		if (!this.options.style) return
		const { zIndex } = this.options.style
		if (zIndex !== undefined && (typeof zIndex !== 'number' || zIndex < 0)) {
			throw new Error('style.zIndex 必须是非负数')
		}
		if (this.options.style.backdropBlurAmount !== undefined && (typeof this.options.style.backdropBlurAmount !== 'number' || this.options.style.backdropBlurAmount < 0)) {
			throw new Error('style.backdropBlurAmount 必须是非负数')
		}
	}

	/**
	 * 验证嵌套配置项（minDisplayTime / delayShow / debounceHide）的 duration 合法性
	 *
	 * @param field - 需要验证的配置项字段名
	 * @param errorMsg - 验证失败时的错误提示信息
	 *
	 * @throws 当 `duration` 为非数字或负数时抛出指定错误信息
	 */
	private validateNestedConfig(field: 'minDisplayTime' | 'delayShow' | 'debounceHide', errorMsg: string): void {
		const config = this.options[field]
		if (config?.duration !== undefined && (typeof config.duration !== 'number' || config.duration < 0)) {
			throw new Error(errorMsg)
		}
	}

	/**
	 * 验证过渡动画配置的合法性
	 *
	 * @remarks 检查 `transition.duration` 是否为非负数
	 *
	 * @throws 当 `transition.duration` 为非数字或负数时抛出错误
	 */
	private validateTransition(): void {
		if (!this.options.transition) return
		const { duration } = this.options.transition
		if (duration !== undefined && (typeof duration !== 'number' || duration < 0)) {
			throw new Error('transition.duration 必须是非负数')
		}
	}

	/**
	 * 验证生命周期回调配置的合法性
	 *
	 * @remarks 检查所有回调字段（onBeforeShow / onShow / onBeforeHide / onHide / onDestroy）
	 * 是否为字符串类型，因为回调以函数体字符串形式提供
	 *
	 * @throws 当回调字段非字符串类型时抛出错误
	 */
	private validateCallbacks(): void {
		if (!this.options.callbacks) return
		const { callbacks } = this.options
		const callbackFields: (keyof LoadingCallbacks)[] = ['onBeforeShow', 'onShow', 'onBeforeHide', 'onHide', 'onDestroy']
		for (const field of callbackFields) {
			if (callbacks[field] !== undefined && typeof callbacks[field] !== 'string') {
				throw new Error(`callbacks.${field} 必须是字符串类型`)
			}
		}
	}

	/**
	 * 获取插件名称
	 *
	 * @returns 插件名称字符串 `'inject-loading'`
	 *
	 * @override
	 */
	protected getPluginName(): string {
		return 'inject-loading'
	}

	/**
	 * 生成 Loading 管理器 JavaScript 代码
	 *
	 * @remarks 生成一个 IIFE（立即执行函数表达式），在浏览器端创建 loading 管理器实例。
	 * 包含以下功能模块：
	 * - DOM 元素查找与缓存
	 * - 请求过滤（URL/方法/前缀匹配）
	 * - 定时器管理（延迟显示、最小显示时间、防抖隐藏）
	 * - 过渡动画应用
	 * - 显示/隐藏/销毁核心逻辑
	 * - fetch/XHR 请求拦截与自动管理
	 * - defaultVisible 初始状态同步
	 * - autoHideOn 自动隐藏事件绑定
	 * - 全局变量暴露
	 *
	 * @param options - 插件配置选项
	 * @returns 完整的 JavaScript IIFE 代码字符串
	 */
	private generateLoadingManager(options: InjectLoadingOptions): string {
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

		/**
		 * 将回调函数体字符串包装为安全的函数表达式
		 *
		 * @param body - 函数体代码字符串
		 * @returns 安全的函数表达式字符串
		 */
		const makeCallback = (body?: string): string => {
			if (!body) return 'function() {}'
			return `function() { try { ${body} } catch(e) { console.error('[injectLoading] callback error:', e); } }`
		}

		const cbBeforeShow = makeCallback(callbacks.onBeforeShow)
		const cbShow = makeCallback(callbacks.onShow)
		const cbBeforeHide = makeCallback(callbacks.onBeforeHide)
		const cbHide = makeCallback(callbacks.onHide)
		const cbDestroy = makeCallback(callbacks.onDestroy)

		return `(function() {
  'use strict';

  // SSR 环境检测
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var _loadingEl = null;
  var _textEl = null;
  var _styleEl = null;
  var _visible = false;
  var _destroyed = false;
  var _showTimer = null;
  var _hideTimer = null;
  var _debounceTimer = null;
  var _showTime = 0;
  var _pendingCount = 0;

  // 配置
  var _minDisplayTime = ${JSON.stringify(minDisplayTime)};
  var _delayShow = ${JSON.stringify(delayShow)};
  var _debounceHide = ${JSON.stringify(debounceHide)};
  var _transition = ${JSON.stringify(transition)};
  var _excludeUrls = ${JSON.stringify(excludeUrls.map(r => ({ source: r.source, flags: r.flags })))}.map(function(s) { return new RegExp(s.source, s.flags); });
  var _includeUrls = ${JSON.stringify(includeUrls.map(r => ({ source: r.source, flags: r.flags })))}.map(function(s) { return new RegExp(s.source, s.flags); });
  var _excludeMethods = ${JSON.stringify(excludeMethods)};
  var _excludeUrlPrefixes = ${JSON.stringify(excludeUrlPrefixes)};

  // 回调
  var _onBeforeShow = ${cbBeforeShow};
  var _onShow = ${cbShow};
  var _onBeforeHide = ${cbBeforeHide};
  var _onHide = ${cbHide};
  var _onDestroy = ${cbDestroy};

  // 保存原始方法引用，用于 destroy 时恢复
  var _originalFetch = null;
  var _originalXHROpen = null;
  var _originalXHRSend = null;

  function _findEl() {
    if (!_loadingEl) {
      _loadingEl = document.getElementById('${ID_ROOT}');
    }
    if (!_textEl && _loadingEl) {
      _textEl = _loadingEl.querySelector('[${ATTR_TEXT}]');
    }
    // 查找并缓存注入的 style 元素，确保 destroy 时能正确清理
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
        if (_includeUrls[i].test(url)) { included = true; break; }
      }
      if (!included) return true;
    }
    for (var i = 0; i < _excludeUrls.length; i++) {
      if (_excludeUrls[i].test(url)) return true;
    }
    return false;
  }

  function _clearTimers() {
    if (_showTimer) { clearTimeout(_showTimer); _showTimer = null; }
    if (_hideTimer) { clearTimeout(_hideTimer); _hideTimer = null; }
    if (_debounceTimer) { clearTimeout(_debounceTimer); _debounceTimer = null; }
  }

  function _applyTransition(show) {
    if (!_transition.enabled || !_loadingEl) return;
    var d = _transition.duration || 200;
    var e = _transition.easing || 'ease-out';
    _loadingEl.style.transition = 'opacity ' + d + 'ms ' + e + ', visibility ' + d + 'ms ' + e;
  }

  function _doShow(text) {
    if (_destroyed) return;
    _findEl();
    if (!_loadingEl) return;

    // onBeforeShow 回调，返回 false 可阻止显示（makeCallback 已提供 try-catch 保护）
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
    _findEl();
    if (!_loadingEl) return;

    if (!force) {
      // onBeforeHide 回调，返回 false 可阻止隐藏（makeCallback 已提供 try-catch 保护）
      var result = _onBeforeHide();
      if (result === false) return;
    }

    if (!force && _minDisplayTime.enabled && _showTime > 0) {
      var elapsed = Date.now() - _showTime;
      var remaining = _minDisplayTime.duration - elapsed;
      if (remaining > 0) {
        _hideTimer = setTimeout(function() { _doHide(true); }, remaining);
        return;
      }
    }

    if (_debounceHide.enabled && !force) {
      _debounceTimer = setTimeout(function() {
        _loadingEl.classList.remove('${CLS_VISIBLE}');
        _loadingEl.classList.add('${CLS_HIDDEN}');
        _applyTransition(false);
        _visible = false;
        _showTime = 0;
        _onHide();
      }, _debounceHide.duration);
      return;
    }

    _loadingEl.classList.remove('${CLS_VISIBLE}');
    _loadingEl.classList.add('${CLS_HIDDEN}');
    _applyTransition(false);
    _visible = false;
    _showTime = 0;
    _onHide();
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
  }

  var manager = {
    show: function(text) {
      if (_destroyed) return;
      _clearTimers();
      // 重置 _showTime，确保重新 show 时最小显示时间从新显示时刻开始计算
      _showTime = 0;
      if (_delayShow.enabled && _delayShow.duration > 0) {
        _showTimer = setTimeout(function() { _doShow(text); }, _delayShow.duration);
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
    updateText: function(text) {
      if (_destroyed) return;
      _findEl();
      if (_textEl) _textEl.textContent = text;
    },
    isVisible: function() {
      return _visible && !_destroyed;
    },
    getPendingCount: function() {
      return _pendingCount;
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
    }
  };

  // 自动拦截 fetch
  var _autoBind = '${autoBind}';
  if (_autoBind === 'fetch' || _autoBind === 'all') {
    if (typeof window !== 'undefined' && window.fetch) {
      _originalFetch = window.fetch;
      window.fetch = function(input, init) {
        // 支持 string / Request / URL 三种输入类型
        var url = typeof input === 'string' ? input : (input instanceof URL ? input.href : (input && input.url ? input.url : ''));
        var method = (init && init.method) || (input && input.method) || 'GET';
        manager._requestStart(url, method);
        return _originalFetch.apply(this, arguments).then(
          function(response) { manager._requestEnd(url, method); return response; },
          function(error) { manager._requestEnd(url, method); throw error; }
        );
      };
    }
  }

  // 自动拦截 XMLHttpRequest
  if (_autoBind === 'xhr' || _autoBind === 'all') {
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
        // 只使用 onloadend，它在所有终止场景（成功/错误/中止/超时）后都会触发，
        // 避免同时监听 onerror/onabort/ontimeout 导致 _requestEnd 被多次调用
        var _origLoadEnd = self.onloadend;
        self.onloadend = function() {
          manager._requestEnd(self.__loadingUrl, self.__loadingMethod);
          if (_origLoadEnd) _origLoadEnd.apply(this, arguments);
        };
        return _originalXHRSend.apply(this, arguments);
      };
    }
  }

  // defaultVisible: 同步初始可见状态
  var _defaultVisible = ${JSON.stringify(defaultVisible)};
  if (_defaultVisible) {
    _visible = true;
    _showTime = Date.now();
  }

  // autoHideOn: 自动隐藏时机
  var _autoHideOn = '${autoHideOn}';
  if (_defaultVisible && _autoHideOn !== 'manual') {
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
      // DOMContentLoaded: readyState 为 'interactive' 时表示事件已触发，需立即执行
      if (document.readyState !== 'loading') {
        _autoHideHandler();
      } else {
        document.addEventListener('DOMContentLoaded', _autoHideHandler);
      }
    }
  }

  // 暴露到全局
  window['${globalName}'] = manager;
})();`
	}

	/**
	 * 生成注入到 `</head>` 前的代码（CSS + HTML 静态标签）
	 *
	 * @remarks 当 {@link InjectLoadingOptions.defaultVisible} 为 `true` 时调用，
	 * CSS 和 HTML 以静态标签形式直接注入到 `<head>` 中，
	 * 确保 HTML 解析到 `<head>` 时 loading 即可见，无需等待 JS 执行
	 *
	 * @returns 包含 CSS 样式和 HTML 结构的注入代码字符串
	 */
	private generateHeadInjectCode(): string {
		const style = this.options.style || {}
		const spinnerType = this.options.spinnerType || 'spinner'
		const transition = this.options.transition
		const css = generateCSS(style, spinnerType, transition)
		const html = generateHTMLTemplate(this.options)

		return `<!-- inject-loading: head start -->
<style data-loading-style data-loading-id="${this.options.globalName || '__LOADING_MANAGER__'}">${css}</style>
${html}
<!-- inject-loading: head end -->`
	}

	/**
	 * 生成注入到 `</body>` 前的代码（JS 管理器 + 动态注入逻辑）
	 *
	 * @remarks 根据是否已在 `<head>` 中注入 CSS+HTML，生成不同的注入策略：
	 * - **headInjected 为 true**：仅注入 JS 管理器代码（CSS/HTML 已在 head 中）
	 * - **headInjected 为 false**：生成完整的 JS 代码，动态创建 CSS 和 HTML 元素并注入到 DOM
	 *
	 * @param headInjected - 是否已在 `<head>` 中注入了 CSS+HTML
	 * @returns 注入到 `</body>` 前的代码字符串
	 */
	private generateBodyInjectCode(headInjected: boolean): string {
		const style = this.options.style || {}
		const spinnerType = this.options.spinnerType || 'spinner'
		const transition = this.options.transition
		const css = generateCSS(style, spinnerType, transition)
		const html = generateHTMLTemplate(this.options)
		const js = this.generateLoadingManager(this.options)

		if (headInjected) {
			// head 已注入 CSS+HTML，body 中只需注入 JS 管理器
			return `/* inject-loading: body start */
${js}
/* inject-loading: body end */`
		}

		// 未在 head 中注入，使用原有方式：JS 动态创建 CSS+HTML
		return `/* inject-loading: start */
(function() {
  // SSR 环境检测
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 注入 CSS
  var style = document.createElement('style');
  style.setAttribute('data-loading-style', '');
  style.setAttribute('data-loading-id', '${this.options.globalName || '__LOADING_MANAGER__'}');
  style.textContent = ${JSON.stringify(css)};
  document.head.appendChild(style);

  // 注入 HTML（等待 body 可用时执行）
  function injectHTML() {
    var div = document.createElement('div');
    div.innerHTML = ${JSON.stringify(html)};
    while (div.firstChild) {
      document.body.appendChild(div.firstChild);
    }
  }

  if (document.body) {
    injectHTML();
  } else {
    document.addEventListener('DOMContentLoaded', injectHTML);
  }
})();
${js}
/* inject-loading: end */`
	}

	/**
	 * 注册插件钩子
	 *
	 * @remarks 通过 `transformIndexHtml` 钩子将 loading 代码注入到 HTML 文件中。
	 * 注入策略取决于 {@link InjectLoadingOptions.defaultVisible}：
	 * - **defaultVisible 为 true**：CSS+HTML 注入到 `</head>` 前（白屏即可见），JS 注入到 `</body>` 前
	 * - **defaultVisible 为 false**：所有代码（CSS+HTML+JS）通过 JS 动态注入到 `</body>` 前
	 *
	 * 注入位置优先级：`</body>` > `</html>` > 文件末尾
	 *
	 * @param plugin - 需要注册钩子的 Vite 插件实例
	 *
	 * @override
	 */
	protected addPluginHooks(plugin: Plugin): void {
		const defaultVisible = this.options.defaultVisible || false
		const headCode = defaultVisible ? this.generateHeadInjectCode() : ''
		const bodyCode = this.generateBodyInjectCode(defaultVisible)

		plugin.transformIndexHtml = {
			order: 'post',
			handler: (html: string) => {
				let result = html

				// 当 defaultVisible 为 true 时，将 CSS+HTML 注入到 </head> 前
				if (headCode) {
					const headCloseRegex = /<\/head>/i
					if (headCloseRegex.test(result)) {
						result = result.replace(headCloseRegex, `${headCode}\n</head>`)
					} else {
						// 无 </head> 标签，回退到 body 注入
						this.logger.warn('未找到 </head> 标签，defaultVisible 的白屏 loading 将无法生效')
					}
				}

				// JS 管理器注入到 </body> 前
				const bodyCloseRegex = /<\/body>/i
				if (bodyCloseRegex.test(result)) {
					result = result.replace(bodyCloseRegex, `${bodyCode}\n</body>`)
					this.logger.success('成功注入全局 Loading 状态管理代码到 HTML 文件')
					return result
				}

				// 如果没有 </body>，在 </html> 前注入
				const htmlCloseRegex = /<\/html>/i
				if (htmlCloseRegex.test(result)) {
					result = result.replace(htmlCloseRegex, `${bodyCode}\n</html>`)
					this.logger.success('成功注入全局 Loading 状态管理代码到 HTML 文件')
					return result
				}

				// 如果既没有 </body> 也没有 </html>，追加到末尾
				this.logger.warn('未找到 </body> 或 </html> 标签，Loading 代码追加到文件末尾')
				return result + bodyCode
			}
		}
	}
}

/**
 * 注入全局 Loading 状态管理插件
 *
 * @param options - 插件配置选项，详见 {@link InjectLoadingOptions}
 * @returns Vite 插件实例
 *
 * @example
 * ```typescript
 * // 基本使用
 * injectLoading()
 *
 * // 自定义位置和文本
 * injectLoading({
 *   position: 'top',
 *   defaultText: '请稍候...'
 * })
 *
 * // 使用不同类型的加载图标
 * injectLoading({
 *   spinnerType: 'dots',  // spinner | dots | pulse | bar
 * })
 *
 * // 自动拦截 fetch 请求
 * injectLoading({
 *   autoBind: 'fetch',
 *   requestFilter: {
 *     excludeUrls: [/\/api\/health/],
 *     excludeUrlPrefixes: ['http://localhost']
 *   }
 * })
 *
 * // 自定义样式（含模糊背景）
 * injectLoading({
 *   style: {
 *     overlayColor: 'rgba(0, 0, 0, 0.5)',
 *     spinnerColor: '#ff6b6b',
 *     spinnerSize: '50px',
 *     backdropBlur: true,
 *     backdropBlurAmount: 6
 *   }
 * })
 *
 * // 自定义过渡动画
 * injectLoading({
 *   transition: {
 *     enabled: true,
 *     duration: 300,
 *     easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
 *   }
 * })
 *
 * // 防抖隐藏（避免快速闪烁）
 * injectLoading({
 *   debounceHide: {
 *     enabled: true,
 *     duration: 100
 *   }
 * })
 *
 * // 生命周期回调
 * injectLoading({
 *   callbacks: {
 *     onShow: 'console.log("loading shown")',
 *     onBeforeShow: 'return true',  // 返回 false 可阻止显示
 *     onHide: 'console.log("loading hidden")'
 *   }
 * })
 *
 * // 自定义模板
 * injectLoading({
 *   customTemplate: '<div class="my-loader"><span data-loading-text></span></div>'
 * })
 *
 * // 白屏阶段即显示 loading，DOMContentLoaded 后自动隐藏
 * injectLoading({
 *   defaultVisible: true,
 *   autoHideOn: 'DOMContentLoaded'
 * })
 *
 * // 白屏阶段即显示 loading，所有资源加载完成后自动隐藏
 * injectLoading({
 *   defaultVisible: true,
 *   autoHideOn: 'load'
 * })
 *
 * // Vue/React SPA：白屏阶段即显示，框架渲染完成后手动隐藏
 * injectLoading({
 *   defaultVisible: true,
 *   autoHideOn: 'manual'
 * })
 * // 在应用入口处手动隐藏：
 * // window.__LOADING_MANAGER__.hide()
 * ```
 *
 * @remarks
 * 该插件在 HTML 中注入全局 Loading 状态管理代码，提供以下能力：
 * - 全局 loading 的创建、显示、隐藏和销毁
 * - 跨组件/页面共享 loading 状态
 * - 多种内置加载图标（spinner / dots / pulse / bar）
 * - 自定义样式、文本和显示位置
 * - 过渡动画配置（淡入淡出）
 * - 自动拦截 fetch/XHR 请求实现 loading 自动管理
 * - 延迟显示和最小显示时间机制
 * - 防抖隐藏避免闪烁
 * - 请求过滤（排除/包含特定 URL、前缀匹配、方法过滤）
 * - 生命周期回调（onBeforeShow / onShow / onBeforeHide / onHide / onDestroy）
 * - 背景模糊效果（backdrop-filter）
 * - 销毁时自动恢复原始 fetch/XHR
 * - SSR 环境安全检测
 * - 白屏阶段即显示 loading（defaultVisible + autoHideOn）
 *
 * 运行时 API：
 * ```typescript
 * // 显示 loading
 * window.__LOADING_MANAGER__.show('加载中...')
 *
 * // 隐藏 loading
 * window.__LOADING_MANAGER__.hide()
 *
 * // 强制隐藏（忽略最小显示时间）
 * window.__LOADING_MANAGER__.forceHide()
 *
 * // 更新文本
 * window.__LOADING_MANAGER__.updateText('正在处理...')
 *
 * // 检查状态
 * window.__LOADING_MANAGER__.isVisible()
 *
 * // 获取挂起请求数
 * window.__LOADING_MANAGER__.getPendingCount()
 *
 * // 销毁（恢复原始 fetch/XHR）
 * window.__LOADING_MANAGER__.destroy()
 * ```
 */
export const injectLoading = createPluginFactory(InjectLoadingPlugin)
export * from './types'
