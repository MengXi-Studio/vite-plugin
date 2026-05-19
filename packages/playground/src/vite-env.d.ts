/// <reference types="vite/client" />

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}

interface VersionInfo {
	version: string
	buildTime: string
	timestamp: number
	format: string
	[key: string]: unknown
}

declare const __APP_VERSION__: string
declare const __APP_VERSION___INFO: VersionInfo
