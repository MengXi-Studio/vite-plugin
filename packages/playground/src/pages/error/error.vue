<template>
	<view class="container">
		<text class="page-title">错误页面</text>

		<view class="card">
			<text class="error-icon">404</text>
			<text class="error-text">页面未找到</text>
			<text class="hint">你访问的页面不存在或已被移除</text>
		</view>

		<button class="btn" @click="goHome">返回首页</button>
	</view>
</template>

<script setup lang="ts">
function goHome() {
	uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.container {
	padding: 20rpx 30rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.page-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
	display: block;
	text-align: center;
	padding: 30rpx 0 30rpx;
}

.card {
	background: #fff;
	border-radius: 20rpx;
	padding: 60rpx 30rpx;
	margin-bottom: 24rpx;
	text-align: center;
	width: 100%;
}

.error-icon {
	font-size: 100rpx;
	font-weight: bold;
	color: #ccc;
	display: block;
	margin-bottom: 20rpx;
}

.error-text {
	font-size: 36rpx;
	color: #999;
	display: block;
	margin-bottom: 16rpx;
}

.hint {
	font-size: 26rpx;
	color: #ccc;
	display: block;
}

.btn {
	background-color: #42b883;
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	padding: 20rpx 60rpx;
	width: 60%;
}

.btn::after {
	border: none;
}
</style>
