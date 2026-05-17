<template>
	<div id="app">
		<h1>Vite Plugin Playground</h1>
		<p>用于测试 @meng-xi/vite-plugin 插件功能的示例项目</p>

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

		<div class="card">
			<h2>插件功能验证</h2>
			<div class="test-list">
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
			</div>
			<button @click="runTests">运行验证</button>
		</div>
	</div>
</template>

<script setup lang="ts">
const appVersion = __APP_VERSION__
const versionInfo = __APP_VERSION___INFO

const tests = reactive({
	copyFile: false,
	generateVersion: false,
	injectIco: false
})

async function runTests() {
	tests.generateVersion = !!__APP_VERSION__ && !!__APP_VERSION___INFO

	try {
		const res = await fetch('/static/example.txt')
		tests.copyFile = res.ok
	} catch {
		tests.copyFile = false
	}

	const linkEl = document.querySelector('link[rel="icon"]')
	tests.injectIco = !!linkEl
}
</script>

<script lang="ts">
import { reactive } from 'vue'
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
</style>
