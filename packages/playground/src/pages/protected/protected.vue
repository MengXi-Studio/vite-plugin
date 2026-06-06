<template>
	<view class="container">
		<text class="page-title">受保护页面</text>
		<text class="desc">此页面需要登录才能访问</text>

		<view class="card">
			<text class="card-title">访问已授权</text>
			<text class="hint">你已通过路由守卫验证，成功访问此页面。</text>
			<text class="hint">该页面在 pages.json 中配置了 requireAuth: true</text>
			<text class="hint">路由元信息: meta: { title: string; requireAuth: true }</text>
		</view>

		<button class="btn" @click="goBack">返回上一页</button>
	</view>
</template>

<script setup lang="ts">
function goBack() {
	uni.navigateBack({ delta: 1 })
}
</script>

<style scoped>
.container {
	padding: 20rpx 30rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.page-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
	display: block;
	text-align: center;
	padding: 30rpx 0 10rpx;
}

.desc {
	font-size: 26rpx;
	color: #999;
	display: block;
	text-align: center;
	margin-bottom: 30rpx;
}

.card {
	background: #fff;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 24rpx;
}

.card-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #42b883;
	display: block;
	margin-bottom: 20rpx;
}

.hint {
	font-size: 26rpx;
	color: #666;
	display: block;
	margin-bottom: 12rpx;
	line-height: 1.6;
}

.btn {
	background-color: #42b883;
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	padding: 20rpx 0;
	margin-top: 20rpx;
}

.btn::after {
	border: none;
}
</style>
