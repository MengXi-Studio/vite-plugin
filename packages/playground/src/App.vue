<template>
	<div id="app">
		<h1>Vite Plugin Playground</h1>
		<p>Welcome to the playground for testing our Vite plugin!</p>

		<!-- generateVersion 插件示例：显示版本号 -->
		<div class="version-info">
			<p>应用版本: {{ appVersion }}</p>
		</div>

		<button @click="testPlugin">Test Plugin</button>
	</div>
</template>

<script setup lang="ts">
// 通过 generateVersion 插件注入的全局变量
declare const __APP_VERSION__: string
declare const __APP_VERSION___INFO: {
	version: string
	buildTime: string
	timestamp: number
	format: string
	[key: string]: unknown
}

// 获取版本号
const appVersion = __APP_VERSION__

function testPlugin() {
	// 打印版本信息
	console.log('应用版本:', __APP_VERSION__)
	console.log('版本详情:', __APP_VERSION___INFO)
}
</script>

<style scoped>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

h1 {
	font-size: 2.5em;
	margin-bottom: 1em;
}

p {
	font-size: 1.2em;
	margin-bottom: 2em;
}

.version-info {
	background-color: #f5f5f5;
	border-radius: 8px;
	padding: 15px 25px;
	margin: 20px auto;
	max-width: 300px;
}

.version-info p {
	margin: 5px 0;
	font-size: 1em;
	color: #666;
}

button {
	background-color: #4caf50;
	border: none;
	color: white;
	padding: 15px 32px;
	text-align: center;
	text-decoration: none;
	display: inline-block;
	font-size: 16px;
	margin: 4px 2px;
	cursor: pointer;
	border-radius: 4px;
}

button:hover {
	background-color: #45a049;
}
</style>
