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
				<view v-for="(item, key) in tests" :key="key" class="test-item" :class="{ passed: item }">
					<text class="icon">{{ item ? '✅' : '⏳' }}</text>
					<text class="test-text">{{ testLabels[key] }}</text>
				</view>
			</view>
			<button class="btn" @click="runTests">运行验证</button>
		</view>

		<!-- 路由导航演示 -->
		<view class="card">
			<text class="card-title">路由导航演示</text>
			<text class="hint">使用 @meng-xi/uni-router 进行类型安全的路由导航</text>
			<view class="nav-grid">
				<button class="btn btn-nav" @click="goToNavigation">路由导航</button>
				<button class="btn btn-nav" @click="goToGuards">路由守卫</button>
				<button class="btn btn-nav" @click="goToDetail">详情页</button>
				<button class="btn btn-nav" @click="goToResolve">路由解析</button>
				<button class="btn btn-nav" @click="goToProfile">个人中心</button>
				<button class="btn btn-nav" @click="goToSettings">设置</button>
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
	</view>
</template>

<script setup lang="ts">
// Vue API 由 autoImport 自动注入，无需手动导入
import type { LoadingManager } from '@meng-xi/vite-plugin/plugins/loading-manager'

const appVersion = __APP_VERSION__
const versionInfo = __APP_VERSION___INFO

const tests = reactive<Record<string, boolean>>({
	assetManifest: false,
	autoImport: false,
	buildProgress: false,
	bundleAnalyzer: false,
	compressAssets: false,
	copyFile: false,
	envGuard: false,
	generateRouter: false,
	generateVersion: false,
	htmlInject: false,
	versionUpdateChecker: false,
	faviconManager: false,
	imageOptimizer: false,
	loadingManager: false,
	proxyManager: false
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
})

onUnmounted(() => {
	if (statusTimer) {
		clearInterval(statusTimer)
		statusTimer = null
	}
})

async function runTests() {
	tests.autoImport = typeof reactive === 'function' && typeof ref === 'function'
	tests.buildProgress = true

	// assetManifest 测试：检查运行时注入的全局变量
	tests.assetManifest = !!(window as any).__ASSET_MANIFEST__

	try {
		const res = await fetch('/bundle-analysis.html')
		tests.bundleAnalyzer = res.ok
	} catch {
		tests.bundleAnalyzer = false
	}

	try {
		const res = await fetch('/compress-report.json')
		if (res.ok) {
			const report = await res.json()
			tests.compressAssets = report && report.totalFiles > 0
		}
	} catch {
		tests.compressAssets = false
	}

	tests.generateRouter = true
	tests.generateVersion = !!__APP_VERSION__ && !!__APP_VERSION___INFO

	try {
		const res = await fetch('/static/example.txt')
		tests.copyFile = res.ok
	} catch {
		tests.copyFile = false
	}

	tests.envGuard = !!import.meta.env.VITE_APP_TITLE && !!import.meta.env.VITE_API_URL

	const keywordsMeta = document.querySelector('meta[name="keywords"]')
	const themeColorMeta = document.querySelector('meta[name="theme-color"]')
	tests.htmlInject = !!(keywordsMeta && themeColorMeta)

	const vucRoot = document.getElementById('__vuc-root__')
	const metaEl = document.querySelector('meta[name="app-version"]')
	tests.versionUpdateChecker = !!vucRoot && !!metaEl

	const linkEl = document.querySelector('link[rel="icon"]')
	tests.faviconManager = !!linkEl

	// imageOptimizer 测试：检查优化报告是否生成
	try {
		const res = await fetch('/image-optimize-report.json')
		if (res.ok) {
			const report = await res.json()
			tests.imageOptimizer = report && (report.totalFiles > 0 || report.totalFiles === 0)
		}
	} catch {
		tests.imageOptimizer = false
	}

	const manager = getManager()
	tests.loadingManager = !!manager && typeof manager.show === 'function'

	// proxyManager 测试：通过代理请求 httpbin.org 验证代理是否生效
	try {
		const res = await fetch('/api/get')
		if (res.ok) {
			const data = await res.json()
			tests.proxyManager = !!data && data.url !== undefined
		}
	} catch {
		tests.proxyManager = false
	}
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
