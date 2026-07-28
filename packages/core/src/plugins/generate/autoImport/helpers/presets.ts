import type { PresetDefinition, ImportInline, PackagePresetOptions } from '../types'
import { resolveWildcardExports } from './scanner'

/**
 * 内置预设注册表
 *
 * @description 维护内置预设的映射表。用户通过 `imports: ['vue']` 引用时，
 * 从此注册表查找对应的 PresetDefinition。
 */
export const BUILTIN_PRESETS: Record<string, PresetDefinition> = {
	vue: {
		from: 'vue',
		imports: [
			// Reactivity
			'ref', 'shallowRef', 'triggerRef', 'customRef',
			'reactive', 'shallowReactive', 'readonly', 'shallowReadonly',
			'computed', 'watch', 'watchEffect', 'watchPostEffect', 'watchSyncEffect',
			'toRef', 'toRefs', 'toValue', 'unref', 'isRef', 'isReactive', 'isReadonly', 'isProxy',
			'markRaw', 'toRaw', 'effectScope', 'getCurrentScope', 'onScopeDispose',
			// Lifecycle
			'onMounted', 'onUnmounted', 'onBeforeMount', 'onBeforeUnmount',
			'onUpdated', 'onBeforeUpdate', 'onActivated', 'onDeactivated',
			'onErrorCaptured', 'onRenderTracked', 'onRenderTriggered', 'onServerPrefetch',
			// Dependency Injection
			'provide', 'inject',
			// Component
			'defineComponent', 'defineAsyncComponent',
			'getCurrentInstance', 'useAttrs', 'useSlots', 'useCssModule', 'useCssVars',
			'withDefaults', 'mergeDefaults', 'mergeModels',
			// Render
			'h', 'createApp', 'createSSRApp', 'hydrate',
			// Directives & Modifiers
			'withDirectives', 'resolveDirective', 'withModifiers', 'withKeys',
			// Resolve
			'resolveComponent', 'resolveDynamicComponent',
			// Teleport/Suspense/KeepAlive
			'Teleport', 'Suspense', 'KeepAlive', 'BaseTransition',
			// Transition
			'Transition', 'TransitionGroup',
			// Utilities
			'nextTick', 'set', 'del',
		],
		typeImports: [
			// Component Types
			'Component', 'ComponentPublicInstance', 'ComponentOptions',
			'FunctionalComponent', 'DefineComponent',
			// Ref Types
			'Ref', 'WritableComputedRef', 'ComputedRef', 'ShallowRef',
			'UnwrapRef', 'ShallowUnwrapRef', 'MaybeRef', 'MaybeRefOrGetter',
			// VNode
			'VNode', 'VNodeChild',
			// Prop Types
			'PropType', 'ExtractPropTypes', 'ExtractDefaultPropTypes',
			// Injection
			'InjectionKey',
			// Directive
			'Directive', 'DirectiveBinding', 'DirectiveHook',
			// Watch
			'WatchOptions', 'WatchCallback', 'WatchSource', 'WatchStopHandle',
			// App
			'App', 'AppConfig', 'Plugin',
			// Setup
			'SetupContext',
			// Reactive
			'ReactiveFlags',
			// EffectScope
			'EffectScope',
			// CSS
			'CSSProperties',
		],
	},

	'vue-router': {
		from: 'vue-router',
		imports: [
			'useRouter', 'useRoute',
			'onBeforeRouteLeave', 'onBeforeRouteUpdate',
			'RouterLink', 'RouterView',
			'createRouter', 'createWebHistory', 'createWebHashHistory',
			'createMemoryHistory',
		],
		typeImports: [
			'RouteLocationRaw', 'RouteLocationNormalized', 'RouteLocationNormalizedLoaded',
			'RouteRecordRaw', 'RouteRecordMultiple', 'RouteRecordSingleView',
			'RouteRecordSingleViewWithChildren', 'RouteRecordRedirect',
			'RouteMeta', 'Router', 'RouteParams', 'RouteQuery',
			'NavigationGuard', 'NavigationGuardNext',
			'RouterOptions',
		],
	},

	pinia: {
		from: 'pinia',
		imports: [
			'defineStore', 'storeToRefs', 'acceptHMRUpdate',
			'createPinia', 'getActivePinia', 'setActivePinia',
			'mapActions', 'mapGetters', 'mapState', 'mapStores', 'mapWritableState',
		],
		typeImports: [
			'Store', 'StoreDefinition', 'StoreGeneric',
			'Pinia', 'PiniaPlugin', 'PiniaStorePlugin',
			'StateTree', 'SubscriptionCallback',
		],
	},

	'vue-demi': {
		from: 'vue-demi',
		imports: [
			'ref', 'reactive', 'computed', 'watch', 'watchEffect',
			'readonly', 'shallowRef', 'shallowReactive', 'shallowReadonly',
			'toRef', 'toRefs', 'unref', 'isRef', 'isReactive', 'isReadonly',
			'provide', 'inject', 'onMounted', 'onUnmounted',
			'defineComponent', 'nextTick',
		],
		typeImports: [
			'Ref', 'ComputedRef', 'WritableComputedRef', 'Component',
		],
	},

	'vue-i18n': {
		from: 'vue-i18n',
		imports: [
			'useI18n', 'createI18n',
		],
		typeImports: [
			'I18n', 'I18nOptions', 'Composer', 'VueI18n',
		],
	},

	rxjs: {
		from: 'rxjs',
		imports: [
			'Observable', 'Subject', 'BehaviorSubject', 'ReplaySubject', 'AsyncSubject',
			'of', 'from', 'fromEvent', 'merge', 'concat', 'combineLatest', 'zip',
			'timer', 'interval', 'range', 'EMPTY', 'NEVER',
			'pipe', 'noop',
		],
		typeImports: [
			'Observer', 'Subscribable', 'SubscribableOrPromise',
			'Subscription', 'Unsubscribable', 'TeardownLogic',
			'OperatorFunction', 'MonoTypeOperatorFunction',
		],
	},

	'@vueuse/core': {
		from: '@vueuse/core',
		imports: [
			'useActiveElement', 'useAsyncQueue', 'useBattery', 'useBreakpoints',
			'useBrowserLocation', 'useClipboard', 'useColorMode', 'useConfirmDialog',
			'useCounter', 'useCssVar', 'useDark', 'useDebounce', 'useDebouncedRefHistory',
			'useDevicePixelRatio', 'useDialog', 'useDocumentVisibility', 'useDraggable',
			'useDropZone', 'useElementBounding', 'useElementSize', 'useElementVisibility',
			'useEventSource', 'useEyeDropper', 'useFavicon', 'useFetch', 'useFileDialog',
			'useFileSystemAccess', 'useFocus', 'useFocusWithin', 'useFps', 'useFullscreen',
			'useGamepad', 'useGeolocation', 'useIdle', 'useImage', 'useInfiniteScroll',
			'useIntersectionObserver', 'useKeyModifier', 'useLocalStorage', 'useMagicKeys',
			'useManualRefHistory', 'useMediaControls', 'useMediaQuery', 'useMemoize',
			'useMemory', 'useMounted', 'useMouse', 'useMouseInElement', 'useMousePressed',
			'useMutationObserver', 'useNavigatorLanguage', 'useNetwork', 'useNow',
			'useObjectUrl', 'useOffsetPagination', 'useOnline', 'usePageLeave',
			'useParallax', 'usePermission', 'usePointer', 'usePointerSwipe',
			'usePreferredColorScheme', 'usePreferredContrast', 'usePreferredDark',
			'usePreferredLanguages', 'usePreferredReducedMotion', 'usePrevious',
			'useRafFn', 'useRefHistory', 'useResizeObserver', 'useScreenSafeArea',
			'useScriptTag', 'useScroll', 'useScrollLock', 'useSessionStorage',
			'useShare', 'useSpeechRecognition', 'useSpeechSynthesis', 'useStepper',
			'useStorage', 'useStorageAsync', 'useStyleTag', 'useSwipe', 'useTemplateRef',
			'useTextDirection', 'useTextSelection', 'useTextareaAutosize',
			'useThrottle', 'useThrottledRefHistory', 'useTimeAgo', 'useTimeout',
			'useTimeoutFn', 'useTimestamp', 'useTitle', 'useToggle', 'useToNumber',
			'useToString', 'useTransition', 'useUrlSearchParams', 'useUserMedia',
			'useVModel', 'useVModels', 'useVibrate', 'useVirtualList',
			'useWakeLock', 'useWebNotification', 'useWebSocket', 'useWebWorker',
			'useWebWorkerFn', 'useWindowFocus', 'useWindowScroll', 'useWindowSize',
			'computedAsync', 'computedInject', 'createEventHook', 'createGlobalState',
			'createReactiveFn', 'createRef', 'createSharedComposable',
			'extendRef', 'get', 'makeDestructurable', 'reactiveComputed',
			'reactivePick', 'refAutoReset', 'refDebounced', 'refDefault',
			'refThrottled', 'refWithControl', 'resolveRef', 'resolveUnref',
			'set', 'syncRef', 'syncRefs', 'toReactive', 'toRef', 'until',
			'useArrayDifference', 'useArrayEvery', 'useArrayFilter',
			'useArrayFind', 'useArrayIncludes', 'useArrayJoin',
			'useArrayMap', 'useArrayReduce', 'useArraySome', 'useArrayUnique',
			'useCounter', 'useDateFormat', 'useDuration', 'useFormatDate',
		],
		typeImports: [
			'UseFetchOptions', 'UseFetchReturn',
			'UseMouseEvent', 'UseMouseReturnType',
		],
	},
}

/**
 * 查找内置预设
 *
 * @param name 预设名称（如 'vue', 'vue-router'）
 * @returns 预设定义，如果不存在返回 undefined
 *
 * @description 支持精确匹配和别名查找
 */
export function findPreset(name: string): PresetDefinition | undefined {
	// 直接查找
	if (BUILTIN_PRESETS[name]) {
		return BUILTIN_PRESETS[name]
	}

	// 尝试去掉 @scope 前缀查找（如 @vueuse/core → vueuse/core）
	const withoutScope = name.replace(/^@/, '')
	if (BUILTIN_PRESETS[withoutScope]) {
		return BUILTIN_PRESETS[withoutScope]
	}

	return undefined
}

/**
 * 将预设定义展开为 ImportInline 列表
 *
 * @param preset 预设定义
 * @returns 展开后的 ImportInline 列表
 *
 * @description 将 PresetDefinition 的 imports 和 typeImports 展开：
 * - 字符串项 → { name, from }
 * - [name, alias] 元组 → { name, from, as: alias }
 * - typeImports 项额外标记 type: true
 */
export function expandPreset(preset: PresetDefinition): ImportInline[] {
	const result: ImportInline[] = []

	// 值导入
	for (const item of preset.imports) {
		if (typeof item === 'string') {
			// 处理 default 导出
			if (item === 'default') {
				result.push({ name: 'default', from: preset.from, as: preset.from })
			} else {
				result.push({ name: item, from: preset.from })
			}
		} else {
			// [name, alias] 元组
			result.push({ name: item[0], from: preset.from, as: item[1] })
		}
	}

	// 类型导入
	if (preset.typeImports) {
		for (const item of preset.typeImports) {
			if (typeof item === 'string') {
				result.push({ name: item, from: preset.from, type: true })
			} else {
				result.push({ name: item[0], from: preset.from, as: item[1], type: true })
			}
		}
	}

	return result
}

/**
 * 从本地已安装的 npm 包自动发现导出
 *
 * @param preset 包名或配置
 * @param root 项目根目录
 * @returns ImportInline 列表
 *
 * @description 解析策略：
 * 1. 使用 require.resolve 定位包目录
 * 2. 查找 .d.ts 类型声明文件
 * 3. 解析所有命名导出
 * 4. 应用 ignore 过滤
 */
export function resolvePackagePreset(preset: string | PackagePresetOptions, root: string): ImportInline[] {
	const packageName = typeof preset === 'string' ? preset : preset.package
	const ignoreList = typeof preset === 'string' ? [] : (preset.ignore ?? [])

	// 复用 scanner.ts 中的通配符导出解析
	const exports = resolveWildcardExports(packageName, root)

	// 应用 ignore 过滤
	const filteredExports = exports.filter(name => {
		for (const ignore of ignoreList) {
			if (typeof ignore === 'string' && name === ignore) return false
			if (ignore instanceof RegExp && ignore.test(name)) return false
		}
		return true
	})

	return filteredExports.map(name => ({
		name,
		from: packageName,
	}))
}
