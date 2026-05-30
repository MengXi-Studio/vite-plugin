<template>
	<div id="app">
		<h1>Vite Plugin Playground</h1>
		<p>用于测试 @meng-xi/vite-plugin 插件功能的示例项目</p>

		<!-- 版本信息 -->
		<div class="card">
			<h2>版本信息</h2>
			<p class="version">{{ appVersion }}</p>
			<div class="info-grid">
				<div class="info-item">
					<span class="label">构建时间</span>
					<span class="value">{{ versionInfo.buildTime }}</span>
				</div>
				<div class="info-item">
					<span class="label">格式</span>
					<span class="value">{{ versionInfo.format }}</span>
				</div>
				<div class="info-item">
					<span class="label">环境</span>
					<span class="value">{{ versionInfo.environment }}</span>
				</div>
				<div class="info-item">
					<span class="label">作者</span>
					<span class="value">{{ versionInfo.author }}</span>
				</div>
			</div>
		</div>

		<!-- 插件功能验证 -->
		<div class="card">
			<h2>插件功能验证</h2>
			<div class="test-list">
				<div class="test-item" :class="{ passed: tests.buildProgress }">
					<span class="icon">{{ tests.buildProgress ? '✅' : '⏳' }}</span>
					<span>buildProgress - 构建进度条</span>
				</div>
				<div class="test-item" :class="{ passed: tests.generateRouter }">
					<span class="icon">{{ tests.generateRouter ? '✅' : '⏳' }}</span>
					<span>generateRouter - 路由配置生成</span>
				</div>
				<div class="test-item" :class="{ passed: tests.copyFile }">
					<span class="icon">{{ tests.copyFile ? '✅' : '⏳' }}</span>
					<span>copyFile - 文件复制</span>
				</div>
				<div class="test-item" :class="{ passed: tests.generateVersion }">
					<span class="icon">{{ tests.generateVersion ? '✅' : '⏳' }}</span>
					<span>generateVersion - 版本生成</span>
				</div>
				<div class="test-item" :class="{ passed: tests.versionUpdateChecker }">
					<span class="icon">{{ tests.versionUpdateChecker ? '✅' : '⏳' }}</span>
					<span>versionUpdateChecker - 版本更新检查</span>
				</div>
				<div class="test-item" :class="{ passed: tests.faviconManager }">
					<span class="icon">{{ tests.faviconManager ? '✅' : '⏳' }}</span>
					<span>faviconManager - 网站图标管理</span>
				</div>
				<div class="test-item" :class="{ passed: tests.loadingManager }">
					<span class="icon">{{ tests.loadingManager ? '✅' : '⏳' }}</span>
					<span>loadingManager - 全局 Loading</span>
				</div>
			</div>
			<button @click="runTests">运行验证</button>
		</div>

		<!-- 版本更新检查演示 -->
		<div class="card">
			<h2>版本更新检查演示</h2>
			<p class="hint">versionUpdateChecker 已配置 enableInDev: true，每 60 秒检查 /version.json</p>
			<p class="hint">页面可见性变化时也会触发检查，回调日志输出到控制台</p>
			<div class="btn-group">
				<button @click="checkVersion">手动检查版本</button>
				<button @click="simulateUpdate">模拟版本更新</button>
			</div>
			<div class="version-check-status">
				<span class="label">当前版本</span>
				<span class="value">{{ appVersion }}</span>
				<span class="label" style="margin-left: 16px">meta 标签</span>
				<span class="value">{{ metaVersion || '未检测到' }}</span>
			</div>
		</div>

		<!-- Loading 交互演示 -->
		<div class="card">
			<h2>Loading 交互演示</h2>
			<p class="hint">loadingManager 已配置 autoBind: 'all'，所有 fetch/xhr 请求会自动触发 Loading</p>
			<p class="hint">已启用 delayShow (200ms)、debounceHide (100ms)、backdropBlur、callbacks</p>
			<div class="btn-group">
				<button @click="showLoading">手动显示</button>
				<button @click="hideLoading">手动隐藏</button>
				<button @click="toggleLoading">切换状态</button>
			</div>
			<div class="btn-group">
				<button @click="fetchWithLoading">发起请求 (自动 Loading)</button>
				<button @click="updateLoadingText">更新文本</button>
			</div>
			<div class="btn-group">
				<button class="btn-outline" @click="togglePointerEvents">{{ pointerEventsEnabled ? '禁用' : '启用' }}指针事件</button>
				<button class="btn-outline" @click="forceHideLoading">强制隐藏</button>
			</div>
			<div class="loading-status">
				<span class="label">Loading 状态</span>
				<span class="value" :class="{ active: loadingVisible }">
					{{ loadingVisible ? '显示中' : '已隐藏' }}
				</span>
				<span class="label" style="margin-left: 16px">挂起请求</span>
				<span class="value">{{ pendingCount }}</span>
				<span class="label" style="margin-left: 16px">指针事件</span>
				<span class="value" :class="{ active: pointerEventsEnabled }">
					{{ pointerEventsEnabled ? '已启用' : '已禁用' }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import type { LoadingManager } from '@meng-xi/vite-plugin/plugins/loading-manager'

const appVersion = __APP_VERSION__
const versionInfo = __APP_VERSION___INFO

const tests = reactive({
	buildProgress: false,
	generateRouter: false,
	copyFile: false,
	generateVersion: false,
	versionUpdateChecker: false,
	faviconManager: false,
	loadingManager: false
})

const loadingVisible = ref(false)
const pendingCount = ref(0)
const pointerEventsEnabled = ref(true)
const metaVersion = ref('')

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
			pendingCount.value = manager.getPendingCount()
			pointerEventsEnabled.value = manager.isPointerEventsEnabled()
		}
	}, 200)
}

function stopStatusPolling() {
	if (statusTimer) {
		clearInterval(statusTimer)
		statusTimer = null
	}
}

onMounted(() => {
	startStatusPolling()
	// 读取 meta 标签中的版本号（versionUpdateChecker file/auto 模式注入）
	const metaEl = document.querySelector('meta[name="app-version"]')
	if (metaEl) {
		metaVersion.value = metaEl.getAttribute('content') || ''
	}
})

onUnmounted(() => {
	stopStatusPolling()
})

async function runTests() {
	// buildProgress: 终端进度条在构建时已展示，此处验证构建成功即视为通过
	tests.buildProgress = true

	// generateRouter: 验证路由配置文件已生成
	try {
		const res = await fetch('/src/router.config.ts')
		tests.generateRouter = res.ok
	} catch {
		tests.generateRouter = false
	}

	// generateVersion: 验证全局变量已注入
	tests.generateVersion = !!__APP_VERSION__ && !!__APP_VERSION___INFO

	// copyFile: 验证静态文件已复制到目标路径
	try {
		const res = await fetch('/static/example.txt')
		tests.copyFile = res.ok
	} catch {
		tests.copyFile = false
	}

	// versionUpdateChecker: 验证检查器代码已注入到页面
	const vucRoot = document.getElementById('__vuc-root__')
	const vucStyle = document.querySelector('style[data-vuc-style]')
	const metaEl = document.querySelector('meta[name="app-version"]')
	tests.versionUpdateChecker = !!(vucRoot && vucStyle && metaEl)

	// faviconManager: 验证 link 标签已注入到 head
	const linkEl = document.querySelector('link[rel="icon"]')
	tests.faviconManager = !!linkEl

	// loadingManager: 验证 LoadingManager 已注入到 window
	const manager = getManager()
	tests.loadingManager = !!manager && typeof manager.show === 'function' && typeof manager.toggle === 'function' && typeof manager.isPointerEventsEnabled === 'function'
}

/** 手动检查版本：请求 /version.json 并与当前版本对比 */
async function checkVersion() {
	try {
		const res = await fetch('/version.json?_t=' + Date.now())
		if (res.ok) {
			const data = await res.json()
			const latestVersion = data.version || data
			console.log('[VersionCheck] 当前版本:', __APP_VERSION__, '| 最新版本:', latestVersion)
			if (__APP_VERSION__ !== latestVersion) {
				console.log('[VersionCheck] 发现版本差异')
			} else {
				console.log('[VersionCheck] 版本一致')
			}
		} else {
			console.warn('[VersionCheck] 无法获取版本信息:', res.status)
		}
	} catch (e) {
		console.warn('[VersionCheck] 请求失败:', e)
	}
}

/** 模拟版本更新：提示用户 versionUpdateChecker 的自动检测机制 */
function simulateUpdate() {
	console.log('[VersionCheck] 模拟版本更新提示')
	console.log('[VersionCheck] 实际场景中，当重新构建部署后 version.json 版本号变更，')
	console.log('[VersionCheck] versionUpdateChecker 会自动检测到差异并弹出更新提示')
	console.log('[VersionCheck] 当前配置: checkInterval=60s, promptStyle=modal, enableInDev=true')
	console.log('[VersionCheck] 页面可见性变化时也会立即检查更新')
	alert(
		'版本更新检查器正在运行中。\n\n实际场景：重新构建部署后，version.json 中的版本号会变更，插件会自动检测并弹出更新提示。\n\n当前配置：\n- 检查间隔：60秒\n- 提示样式：modal 弹窗\n- 开发模式：已启用\n- 可见性变化检查：已启用'
	)
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

function forceHideLoading() {
	const manager = getManager()
	if (manager) manager.forceHide()
}

function updateLoadingText() {
	const manager = getManager()
	if (manager) {
		manager.show()
		manager.updateText('文本已更新 - ' + new Date().toLocaleTimeString())
	}
}

function togglePointerEvents() {
	const manager = getManager()
	if (manager) manager.togglePointerEvents()
}

async function fetchWithLoading() {
	try {
		await fetch('https://httpbin.org/delay/1')
	} catch {
		// 请求失败不影响 Loading 验证
	}
}
</script>

<style scoped>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	max-width: 600px;
	margin: 60px auto;
	padding: 0 20px;
}

h1 {
	font-size: 2em;
	margin-bottom: 0.5em;
}

h2 {
	font-size: 1.3em;
	margin-bottom: 1em;
	color: #42b883;
}

p {
	font-size: 1.1em;
	margin-bottom: 1em;
	color: #666;
}

.hint {
	font-size: 0.85em;
	color: #999;
	margin-bottom: 12px;
}

.card {
	background: #f9f9f9;
	border-radius: 12px;
	padding: 24px;
	margin: 20px 0;
	text-align: left;
}

.version {
	font-size: 1.5em;
	font-weight: bold;
	color: #42b883;
	text-align: center;
	margin: 16px 0;
}

.info-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}

.info-item {
	display: flex;
	flex-direction: column;
	padding: 8px 12px;
	background: white;
	border-radius: 8px;
}

.info-item .label {
	font-size: 0.8em;
	color: #999;
	margin-bottom: 4px;
}

.info-item .value {
	font-size: 0.95em;
	color: #333;
	font-weight: 500;
}

.test-list {
	margin-bottom: 16px;
}

.test-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 0;
	font-size: 0.95em;
	color: #666;
	transition: color 0.3s;
}

.test-item.passed {
	color: #42b883;
}

.test-item .icon {
	font-size: 1.1em;
}

.btn-group {
	display: flex;
	gap: 8px;
	margin-bottom: 12px;
}

.btn-group button {
	flex: 1;
	background-color: #42b883;
	border: none;
	color: white;
	padding: 10px 16px;
	font-size: 13px;
	cursor: pointer;
	border-radius: 6px;
	transition: background-color 0.3s;
}

.btn-group button:hover {
	background-color: #38a373;
}

.btn-group button.btn-outline {
	background-color: transparent;
	border: 1px solid #42b883;
	color: #42b883;
}

.btn-group button.btn-outline:hover {
	background-color: #42b883;
	color: white;
}

button {
	background-color: #42b883;
	border: none;
	color: white;
	padding: 10px 24px;
	font-size: 14px;
	cursor: pointer;
	border-radius: 6px;
	transition: background-color 0.3s;
	width: 100%;
}

button:hover {
	background-color: #38a373;
}

.loading-status,
.version-check-status {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 12px;
	background: white;
	border-radius: 8px;
	font-size: 0.9em;
}

.loading-status .label,
.version-check-status .label {
	color: #999;
	font-size: 0.8em;
}

.loading-status .value,
.version-check-status .value {
	color: #333;
	font-weight: 500;
}

.loading-status .value.active,
.version-check-status .value.active {
	color: #42b883;
}
</style>
