/// <reference types="vite/client" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}

import type { LoadingManager } from '@meng-xi/vite-plugin/plugins/loadingManager'
import type { VersionInfo } from '@meng-xi/vite-plugin/plugins/generate-version'

declare global {
	const __APP_VERSION__: string
	const __APP_VERSION___INFO: VersionInfo

	interface Window {
		__LOADING_MANAGER__?: LoadingManager
		__VUC_REFRESH__?: () => void
		__VUC_DISMISS__?: () => void
	}
}
