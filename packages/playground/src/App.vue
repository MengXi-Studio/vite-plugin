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
				<div class="test-item" :class="{ passed: tests.copyFile }">
					<span class="icon">{{ tests.copyFile ? '✅' : '⏳' }}</span>
					<span>copyFile - 文件复制</span>
				</div>
				<div class="test-item" :class="{ passed: tests.generateVersion }">
					<span class="icon">{{ tests.generateVersion ? '✅' : '⏳' }}</span>
					<span>generateVersion - 版本生成</span>
				</div>
				<div class="test-item" :class="{ passed: tests.injectIco }">
					<span class="icon">{{ tests.injectIco ? '✅' : '⏳' }}</span>
					<span>injectIco - 图标注入</span>
				</div>
				<div class="test-item" :class="{ passed: tests.injectLoading }">
					<span class="icon">{{ tests.injectLoading ? '✅' : '⏳' }}</span>
					<span>injectLoading - 全局 Loading</span>
				</div>
			</div>
			<button @click="runTests">运行验证</button>
		</div>

		<!-- Loading 交互演示 -->
		<div class="card">
			<h2>Loading 交互演示</h2>
			<p class="hint">injectLoading 已配置 autoBind: 'all'，所有 fetch/xhr 请求会自动触发 Loading</p>
			<div class="btn-group">
				<button @click="showLoading">手动显示</button>
				<button @click="hideLoading">手动隐藏</button>
				<button @click="fetchWithLoading">发起请求 (自动 Loading)</button>
			</div>
			<div class="loading-status">
				<span class="label">Loading 状态</span>
				<span class="value" :class="{ active: loadingVisible }">
					{{ loadingVisible ? '显示中' : '已隐藏' }}
				</span>
				<span class="label" style="margin-left: 16px">挂起请求</span>
				<span class="value">{{ pendingCount }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'

const appVersion = __APP_VERSION__
const versionInfo = __APP_VERSION___INFO

const tests = reactive({
	buildProgress: false,
	copyFile: false,
	generateVersion: false,
	injectIco: false,
	injectLoading: false
})

const loadingVisible = ref(false)
const pendingCount = ref(0)

let statusTimer: ReturnType<typeof setInterval> | null = null

function startStatusPolling() {
	if (statusTimer) return
	statusTimer = setInterval(() => {
		const manager = (window as any).__LOADING_MANAGER__
		if (manager) {
			loadingVisible.value = manager.isVisible()
			pendingCount.value = manager.getPendingCount()
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
})

onUnmounted(() => {
	stopStatusPolling()
})

async function runTests() {
	// buildProgress: 终端进度条在构建时已展示，此处验证构建成功即视为通过
	tests.buildProgress = true

	// generateVersion: 验证全局变量已注入
	tests.generateVersion = !!__APP_VERSION__ && !!__APP_VERSION___INFO

	// copyFile: 验证静态文件已复制到目标路径
	try {
		const res = await fetch('/static/example.txt')
		tests.copyFile = res.ok
	} catch {
		tests.copyFile = false
	}

	// injectIco: 验证 link 标签已注入到 head
	const linkEl = document.querySelector('link[rel="icon"]')
	tests.injectIco = !!linkEl

	// injectLoading: 验证 LoadingManager 已注入到 window
	const manager = (window as any).__LOADING_MANAGER__
	tests.injectLoading = !!manager && typeof manager.show === 'function' && typeof manager.hide === 'function'
}

function showLoading() {
	const manager = (window as any).__LOADING_MANAGER__
	if (manager) manager.show('手动触发的 Loading...')
}

function hideLoading() {
	const manager = (window as any).__LOADING_MANAGER__
	if (manager) manager.hide()
}

async function fetchWithLoading() {
	try {
		// 请求一个可能不存在的端点，主要为了触发 Loading 的请求拦截
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
	margin-bottom: 16px;
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

.loading-status {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 12px;
	background: white;
	border-radius: 8px;
	font-size: 0.9em;
}

.loading-status .label {
	color: #999;
	font-size: 0.8em;
}

.loading-status .value {
	color: #333;
	font-weight: 500;
}

.loading-status .value.active {
	color: #42b883;
}
</style>
