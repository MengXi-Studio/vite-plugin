<template>
	<view class="content">
		<text class="page-title">错误页面</text>

		<view class="card">
			<text class="error-icon">404</text>
			<text class="error-text">页面未找到</text>
			<text class="hint">你访问的页面不存在或已被移除</text>
		</view>

		<view class="btn" @click="goHome">
			<text class="btn-text">返回首页</text>
		</view>
	</view>
</template>

<script>
export default {
	methods: {
		goHome() {
			uni.switchTab({ url: '/pages/index/index' })
		}
	}
}
</script>

<style>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40rpx 30rpx;
	min-height: 80vh;
}

.page-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 30rpx;
}

.card {
	width: 100%;
	background: #f9f9f9;
	border-radius: 20rpx;
	padding: 60rpx 30rpx;
	margin-bottom: 24rpx;
	text-align: center;
}

.error-icon {
	font-size: 100rpx;
	font-weight: bold;
	color: #ccc;
	margin-bottom: 20rpx;
}

.error-text {
	font-size: 36rpx;
	color: #999;
	margin-bottom: 16rpx;
}

.hint {
	font-size: 26rpx;
	color: #ccc;
}

.btn {
	background: #007aff;
	border-radius: 12rpx;
	padding: 20rpx 60rpx;
	width: 60%;
	text-align: center;
}

.btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}
</style>
