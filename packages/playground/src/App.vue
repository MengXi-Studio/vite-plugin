<template>
	<div id="app">
		<h1>Vite Plugin Playground</h1>
		<p>Welcome to the playground for testing our Vite plugin!</p>
		<button @click="testPlugin">Test Plugin</button>
	</div>
</template>

<script setup lang="ts">
function testPlugin() {
	console.log('Testing plugins')
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
