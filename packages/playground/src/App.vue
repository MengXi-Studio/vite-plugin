<script setup lang="ts">
onLaunch(() => {
	console.log('App Launch')
})

onShow(() => {
	console.log('App Show')
})

onHide(() => {
	console.log('App Hide')
})
</script>

<style>
page {
	background-color: #f5f5f5;
	font-family:
		-apple-system,
		BlinkMacSystemFont,
		'Helvetica Neue',
		Helvetica,
		Segoe UI,
		Arial,
		Roboto,
		'PingFang SC',
		'miui',
		'Hiragino Sans GB',
		'Microsoft Yahei',
		sans-serif;
}
</style>
