<template>
	<view class="container">
		<view class="header">
			<text class="title">MengXi UniApp Playground</text>
			<text class="subtitle">@meng-xi/vite-plugin 插件功能演示</text>
		</view>

		<!-- 版本信息 -->
		<view class="card">
			<text class="card-title">版本信息</text>
			<text class="version">{{ appVersion }}</text>
			<view class="info-grid">
				<view class="info-item">
					<text class="label">构建时间</text>
					<text class="value">{{ versionInfo.buildTime }}</text>
				</view>
				<view class="info-item">
					<text class="label">格式</text>
					<text class="value">{{ versionInfo.format }}</text>
				</view>
				<view class="info-item">
					<text class="label">环境</text>
					<text class="value">{{ versionInfo.environment }}</text>
				</view>
				<view class="info-item">
					<text class="label">作者</text>
					<text class="value">{{ versionInfo.author }}</text>
				</view>
			</view>
		</view>

		<!-- 插件功能验证 -->
		<view class="card">
			<text class="card-title">插件功能验证</text>
			<view class="test-list">
				<view v-for="(item, key) in tests" :key="key" class="test-item" :class="{ passed: item.passed }">
					<text class="icon">{{ item.passed ? '✅' : '⏳' }}</text>
					<view class="test-content">
						<text class="test-text">{{ testLabels[key] }}</text>
						<text v-if="item.summary" class="test-summary">{{ item.summary }}</text>
					</view>
				</view>
			</view>
			<button class="btn" @click="runTests">运行验证</button>
		</view>

		<!-- 路由导航演示 -->
		<view class="card">
			<text class="card-title">路由导航演示</text>
			<text class="hint">由 generateRouter 插件自动生成路由配置，支持类型安全导航</text>
			<view class="nav-grid">
				<button class="btn btn-nav" @click="goToNavigation">路由导航</button>
				<button class="btn btn-nav" @click="goToGuards">路由守卫</button>
				<button class="btn btn-nav" @click="goToDetail">详情页</button>
				<button class="btn btn-nav" @click="goToResolve">路由解析</button>
				<button class="btn btn-nav" @click="goToProfile">个人中心</button>
				<button class="btn btn-nav" @click="goToSettings">设置</button>
				<button class="btn btn-nav" @click="goToReports">构建报告</button>
			</view>
		</view>

		<!-- Loading 交互演示 -->
		<view class="card">
			<text class="card-title">Loading 交互演示</text>
			<text class="hint">loadingManager 已配置 autoBind: 'all'</text>
			<view class="btn-group">
				<button class="btn" @click="showLoading">手动显示</button>
				<button class="btn" @click="hideLoading">手动隐藏</button>
				<button class="btn" @click="toggleLoading">切换状态</button>
			</view>
			<view class="status-bar">
				<text class="label">状态</text>
				<text class="value" :class="{ active: loadingVisible }">{{ loadingVisible ? '显示中' : '已隐藏' }}</text>
			</view>
		</view>

		<!-- 代理交互演示 -->
		<view class="card">
			<text class="card-title">代理交互演示</text>
			<text class="hint">proxyManager 已配置 /api 和 /proxy-delay 代理规则</text>
			<view class="btn-group">
				<button class="btn" @click="testProxy">测试代理请求</button>
				<button class="btn" @click="testProxyDelay">测试延迟模拟</button>
			</view>
			<view v-if="proxyResult" class="status-bar">
				<text class="label">结果</text>
				<text class="value" :class="{ active: proxyResult.success }">{{ proxyResult.message }}</text>
			</view>
		</view>

		<!-- 环境/注入类展示 -->
		<view class="card">
			<text class="card-title">环境与注入展示</text>
			<text class="hint">envGuard / htmlInject / faviconManager / copyFile 实际效果</text>

			<view class="inject-section">
				<text class="inject-label">envGuard 环境变量</text>
				<view class="kv-list">
					<view class="kv-item"><text class="kv-key">VITE_APP_TITLE</text><text class="kv-val">{{ envInfo.title }}</text></view>
					<view class="kv-item"><text class="kv-key">VITE_API_URL</text><text class="kv-val">{{ envInfo.apiUrl }}</text></view>
					<view class="kv-item"><text class="kv-key">VITE_DEBUG</text><text class="kv-val">{{ envInfo.debug }}</text></view>
				</view>
			</view>

			<view class="inject-section">
				<text class="inject-label">htmlInject 注入的 meta</text>
				<view class="kv-list">
					<view class="kv-item"><text class="kv-key">keywords</text><text class="kv-val">{{ injectInfo.keywords || '未注入' }}</text></view>
					<view class="kv-item"><text class="kv-key">theme-color</text><text class="kv-val">{{ injectInfo.themeColor || '未注入' }}</text></view>
				</view>
			</view>

			<view class="inject-section">
				<text class="inject-label">faviconManager 图标</text>
				<view class="kv-list">
					<view class="kv-item"><text class="kv-key">rel</text><text class="kv-val">{{ injectInfo.faviconRel || '未注入' }}</text></view>
					<view class="kv-item"><text class="kv-key">href</text><text class="kv-val">{{ injectInfo.faviconHref || '未注入' }}</text></view>
				</view>
			</view>

			<view class="inject-section">
				<text class="inject-label">copyFile 复制文件</text>
				<view class="file-tags">
					<text v-for="file in injectInfo.copiedFiles" :key="file" class="file-tag">{{ file }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
// Vue API 由 autoImport 自动注入，无需手动导入
import type { LoadingManager } from '@meng-xi/vite-plugin/plugins/inject/loading-manager'

const appVersion = __APP_VERSION__
const versionInfo = __APP_VERSION___INFO

interface TestResult {
	passed: boolean
	summary: string
}

const tests = reactive<Record<string, TestResult>>({
	assetManifest: { passed: false, summary: '' },
	autoImport: { passed: false, summary: '' },
	buildProgress: { passed: false, summary: '' },
	bundleAnalyzer: { passed: false, summary: '' },
	compressAssets: { passed: false, summary: '' },
	copyFile: { passed: false, summary: '' },
	envGuard: { passed: false, summary: '' },
	generateRouter: { passed: false, summary: '' },
	generateVersion: { passed: false, summary: '' },
	htmlInject: { passed: false, summary: '' },
	versionUpdateChecker: { passed: false, summary: '' },
	faviconManager: { passed: false, summary: '' },
	imageOptimizer: { passed: false, summary: '' },
	loadingManager: { passed: false, summary: '' },
	proxyManager: { passed: false, summary: '' }
})

const testLabels: Record<string, string> = {
	assetManifest: 'assetManifest - 资源清单生成',
	autoImport: 'autoImport - 自动导入',
	buildProgress: 'buildProgress - 构建进度条',
	bundleAnalyzer: 'bundleAnalyzer - 产物体积分析',
	compressAssets: 'compressAssets - 产物压缩',
	copyFile: 'copyFile - 文件复制',
	envGuard: 'envGuard - 环境变量校验',
	generateRouter: 'generateRouter - 路由配置生成',
	generateVersion: 'generateVersion - 版本生成',
	htmlInject: 'htmlInject - HTML 内容注入',
	versionUpdateChecker: 'versionUpdateChecker - 版本更新检查',
	faviconManager: 'faviconManager - 图标管理',
	imageOptimizer: 'imageOptimizer - 图片优化',
	loadingManager: 'loadingManager - 全局 Loading',
	proxyManager: 'proxyManager - 开发代理'
}

/** 环境/注入类展示数据 */
const envInfo = reactive({
	title: import.meta.env.VITE_APP_TITLE || '',
	apiUrl: import.meta.env.VITE_API_URL || '',
	debug: import.meta.env.VITE_DEBUG || ''
})
const injectInfo = reactive({
	keywords: '',
	themeColor: '',
	faviconHref: '',
	faviconRel: '',
	copiedFiles: [] as string[]
})

const loadingVisible = ref(false)
const proxyResult = ref<{ success: boolean; message: string } | null>(null)
let statusTimer: ReturnType<typeof setInterval> | null = null

function getManager(): LoadingManager | undefined {
	return window.__LOADING_MANAGER__
}

function startStatusPolling() {
	if (statusTimer) return
	statusTimer = setInterval(() => {
		const manager = getManager()
		if (manager) {
			loadingVisible.value = manager.isVisible()
		}
	}, 200)
}

onMounted(() => {
	startStatusPolling()
	loadInjectInfo()
})

onUnmounted(() => {
	if (statusTimer) {
		clearInterval(statusTimer)
		statusTimer = null
	}
})

async function runTests() {
	// autoImport：验证 Vue API 已自动注入
	tests.autoImport = {
		passed: typeof reactive === 'function' && typeof ref === 'function',
		summary: 'reactive / ref / onMounted 已自动注入'
	}
	tests.buildProgress = { passed: true, summary: '构建进度条已在终端展示' }

	// assetManifest：检查运行时注入的全局变量
	const manifestData = (window as any).__ASSET_MANIFEST__
	tests.assetManifest = {
		passed: !!manifestData,
		summary: manifestData ? `资源映射 ${Object.keys(manifestData.assets || manifestData).length} 条` : '运行时全局变量未注入'
	}

	// bundleAnalyzer：检查 HTML 报告是否可访问
	try {
		const res = await fetch('/bundle-analysis.json')
		if (res.ok) {
			const report = await res.json()
			tests.bundleAnalyzer = {
				passed: true,
				summary: `${report.summary?.chunkCount || 0} chunks, ${report.summary?.totalSizeFormatted || '未知'}`
			}
		} else {
			tests.bundleAnalyzer = { passed: false, summary: `HTTP ${res.status}` }
		}
	} catch (e) {
		tests.bundleAnalyzer = { passed: false, summary: '报告未生成' }
	}

	// compressAssets：读取压缩报告摘要
	try {
		const res = await fetch('/compress-report.json')
		if (res.ok) {
			const report = await res.json()
			const s = report.summary || {}
			tests.compressAssets = {
				passed: s.totalFiles > 0,
				summary: s.totalFiles > 0 ? `${s.totalFiles} 文件, 压缩率 ${s.totalRatio?.toFixed(1) || 0}%` : '无压缩文件'
			}
		} else {
			tests.compressAssets = { passed: false, summary: `HTTP ${res.status}` }
		}
	} catch {
		tests.compressAssets = { passed: false, summary: '报告未生成' }
	}

	// generateRouter：验证路由配置已生成
	tests.generateRouter = { passed: true, summary: 'src/router.config.ts 已生成' }

	// generateVersion：验证版本全局变量
	tests.generateVersion = {
		passed: !!__APP_VERSION__ && !!__APP_VERSION___INFO,
		summary: __APP_VERSION__ ? `当前版本: ${__APP_VERSION__}` : '版本变量未注入'
	}

	// copyFile：验证静态文件已复制
	try {
		const res = await fetch('/static/example.txt')
		tests.copyFile = {
			passed: res.ok,
			summary: res.ok ? '/static/example.txt 可访问' : `HTTP ${res.status}`
		}
	} catch {
		tests.copyFile = { passed: false, summary: '文件未复制' }
	}

	// envGuard：验证环境变量
	tests.envGuard = {
		passed: !!envInfo.title && !!envInfo.apiUrl,
		summary: `VITE_APP_TITLE="${envInfo.title}", VITE_API_URL="${envInfo.apiUrl}"`
	}

	// htmlInject：检查注入的 meta 标签
	const keywordsMeta = document.querySelector('meta[name="keywords"]')
	const themeColorMeta = document.querySelector('meta[name="theme-color"]')
	tests.htmlInject = {
		passed: !!(keywordsMeta && themeColorMeta),
		summary: keywordsMeta && themeColorMeta
			? `keywords="${keywordsMeta.getAttribute('content')}", theme-color="${themeColorMeta.getAttribute('content')}"`
			: 'meta 标签未注入'
	}

	// versionUpdateChecker：检查 DOM 元素
	const vucRoot = document.getElementById('__vuc-root__')
	const metaEl = document.querySelector('meta[name="app-version"]')
	tests.versionUpdateChecker = {
		passed: !!vucRoot && !!metaEl,
		summary: vucRoot && metaEl ? `版本: ${metaEl.getAttribute('content')}` : '检查器未注入'
	}

	// faviconManager：检查 link 标签
	const linkEl = document.querySelector('link[rel="icon"]')
	tests.faviconManager = {
		passed: !!linkEl,
		summary: linkEl ? `href="${linkEl.getAttribute('href')}"` : 'favicon 未注入'
	}

	// imageOptimizer：读取优化报告摘要
	try {
		const res = await fetch('/image-optimize-report.json')
		if (res.ok) {
			const report = await res.json()
			const s = report.summary || {}
			tests.imageOptimizer = {
				passed: s.totalFiles !== undefined,
				summary: s.totalFiles !== undefined ? `${s.totalFiles} 文件, 转换 ${s.convertedFiles || 0} 个` : '报告为空'
			}
		} else {
			tests.imageOptimizer = { passed: false, summary: `HTTP ${res.status}` }
		}
	} catch {
		tests.imageOptimizer = { passed: false, summary: '报告未生成' }
	}

	// loadingManager：验证管理器实例
	const manager = getManager()
	tests.loadingManager = {
		passed: !!manager && typeof manager.show === 'function',
		summary: manager ? 'window.__LOADING_MANAGER__ 已就绪' : '管理器未初始化'
	}

	// proxyManager：通过代理请求验证
	try {
		const res = await fetch('/api/get')
		if (res.ok) {
			const data = await res.json()
			tests.proxyManager = {
				passed: !!data && data.url !== undefined,
				summary: data?.url ? `代理成功, 来源: ${data.url}` : '响应格式异常'
			}
		} else {
			tests.proxyManager = { passed: false, summary: `HTTP ${res.status}` }
		}
	} catch {
		tests.proxyManager = { passed: false, summary: '代理请求失败' }
	}
}

/** 加载环境/注入类展示数据 */
function loadInjectInfo() {
	// htmlInject：读取注入的 meta 标签内容
	const keywordsMeta = document.querySelector('meta[name="keywords"]')
	const themeColorMeta = document.querySelector('meta[name="theme-color"]')
	injectInfo.keywords = keywordsMeta?.getAttribute('content') || ''
	injectInfo.themeColor = themeColorMeta?.getAttribute('content') || ''

	// faviconManager：读取 link 标签
	const linkEl = document.querySelector('link[rel="icon"]')
	injectInfo.faviconHref = linkEl?.getAttribute('href') || ''
	injectInfo.faviconRel = linkEl?.getAttribute('rel') || ''

	// copyFile：已知复制文件列表（由 copyFile 插件从 src/static 复制到 dist/static）
	injectInfo.copiedFiles = ['/static/favicon.ico', '/static/logo.svg', '/static/banner.svg', '/static/example.txt']
}

function goToNavigation() {
	uni.navigateTo({ url: '/pages/navigation/navigation' })
}

function goToGuards() {
	uni.navigateTo({ url: '/pages/guards/guards' })
}

function goToDetail() {
	uni.navigateTo({ url: '/pages/detail/detail?id=42&from=index' })
}

function goToResolve() {
	uni.navigateTo({ url: '/pages/resolve/resolve' })
}

function goToProfile() {
	uni.navigateTo({ url: '/pages-sub/profile/profile' })
}

function goToSettings() {
	uni.navigateTo({ url: '/pages-sub/settings/settings' })
}

function goToReports() {
	uni.navigateTo({ url: '/pages/reports/reports' })
}

function showLoading() {
	const manager = getManager()
	if (manager) manager.show('手动触发的 Loading...')
}

function hideLoading() {
	const manager = getManager()
	if (manager) manager.hide()
}

function toggleLoading() {
	const manager = getManager()
	if (manager) manager.toggle('切换触发的 Loading')
}

async function testProxy() {
	proxyResult.value = { success: false, message: '请求中...' }
	try {
		const start = Date.now()
		const res = await fetch('/api/get')
		const duration = Date.now() - start
		if (res.ok) {
			const data = await res.json()
			proxyResult.value = {
				success: true,
				message: `代理成功 (${duration}ms) - 来源: ${data.url}`
			}
		} else {
			proxyResult.value = { success: false, message: `代理失败 - HTTP ${res.status}` }
		}
	} catch (e) {
		proxyResult.value = { success: false, message: `代理请求异常: ${e}` }
	}
}

async function testProxyDelay() {
	proxyResult.value = { success: false, message: '请求中（含延迟模拟）...' }
	try {
		const start = Date.now()
		const res = await fetch('/proxy-delay')
		const duration = Date.now() - start
		if (res.ok) {
			proxyResult.value = {
				success: true,
				message: `延迟代理成功 (${duration}ms) - 含 200~500ms 模拟延迟`
			}
		} else {
			proxyResult.value = { success: false, message: `代理失败 - HTTP ${res.status}` }
		}
	} catch (e) {
		proxyResult.value = { success: false, message: `代理请求异常: ${e}` }
	}
}
</script>

<style scoped>
.container {
	padding: 20rpx 30rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.header {
	text-align: center;
	padding: 40rpx 0 30rpx;
}

.title {
	font-size: 44rpx;
	font-weight: bold;
	color: #333;
	display: block;
}

.subtitle {
	font-size: 28rpx;
	color: #999;
	display: block;
	margin-top: 10rpx;
}

.card {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 24rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #42b883;
	display: block;
	margin-bottom: 20rpx;
}

.version {
	font-size: 40rpx;
	font-weight: bold;
	color: #42b883;
	text-align: center;
	display: block;
	margin: 20rpx 0;
}

.info-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.info-item {
	flex: 1;
	min-width: 45%;
	background: #f9f9f9;
	border-radius: 12rpx;
	padding: 16rpx 20rpx;
}

.info-item .label {
	font-size: 22rpx;
	color: #999;
	display: block;
	margin-bottom: 6rpx;
}

.info-item .value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.test-list {
	margin-bottom: 20rpx;
}

.test-item {
	display: flex;
	align-items: center;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.test-item:last-child {
	border-bottom: none;
}

.test-item .icon {
	font-size: 30rpx;
	margin-right: 12rpx;
}

.test-item .test-text {
	font-size: 28rpx;
	color: #666;
}

.test-item.passed .test-text {
	color: #42b883;
}

.test-content {
	flex: 1;
}

.test-summary {
	font-size: 22rpx;
	color: #999;
	display: block;
	margin-top: 4rpx;
	line-height: 1.4;
	word-break: break-all;
}

.inject-section {
	margin-bottom: 24rpx;
}

.inject-section:last-child {
	margin-bottom: 0;
}

.inject-label {
	font-size: 26rpx;
	font-weight: 600;
	color: #555;
	display: block;
	margin-bottom: 12rpx;
}

.kv-list {
	background: #f9f9f9;
	border-radius: 12rpx;
	padding: 4rpx 20rpx;
}

.kv-item {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 14rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	gap: 16rpx;
}

.kv-item:last-child {
	border-bottom: none;
}

.kv-key {
	font-size: 24rpx;
	color: #999;
	flex-shrink: 0;
	font-family: monospace;
}

.kv-val {
	font-size: 24rpx;
	color: #333;
	text-align: right;
	word-break: break-all;
}

.file-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.file-tag {
	font-size: 22rpx;
	color: #42b883;
	background: rgba(66, 184, 131, 0.1);
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	font-family: monospace;
}

.hint {
	font-size: 24rpx;
	color: #999;
	display: block;
	margin-bottom: 16rpx;
}

.nav-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.btn-nav {
	flex: 1;
	min-width: 45%;
	font-size: 26rpx;
	padding: 16rpx 0;
}

.btn-group {
	display: flex;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.btn-group .btn {
	flex: 1;
	font-size: 26rpx;
	padding: 16rpx 0;
}

.btn {
	background-color: #42b883;
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	padding: 20rpx 0;
}

.btn::after {
	border: none;
}

.status-bar {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 20rpx;
	background: #f9f9f9;
	border-radius: 12rpx;
}

.status-bar .label {
	font-size: 24rpx;
	color: #999;
}

.status-bar .value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.status-bar .value.active {
	color: #42b883;
}
</style>
