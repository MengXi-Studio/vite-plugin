<template>
	<view class="content">
		<text class="page-title">受保护页面</text>
		<text class="desc">此页面需要登录才能访问</text>

		<view class="card">
			<text class="card-title">访问已授权</text>
			<text class="hint">你已通过路由守卫验证，成功访问此页面。</text>
			<text class="hint">该页面在 pages.json 中配置了 requireAuth: true</text>
			<text class="hint">路由元信息: meta: { title: string; requireAuth: true }</text>
		</view>

		<view class="btn" @click="goBack">
			<text class="btn-text">返回上一页</text>
		</view>
	</view>
</template>

<script>
export default {
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 })
		}
	}
}
</script>

<style>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40rpx 30rpx;
}

.page-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 10rpx;
}

.desc {
	font-size: 26rpx;
	color: #999;
	margin-bottom: 30rpx;
}

.card {
	width: 100%;
	background: #f9f9f9;
	border-radius: 20rpx;
	padding: 30rpx;
	margin-bottom: 24rpx;
}

.card-title {
	font-size: 30rpx;
	font-weight: bold;
	color: #007aff;
	margin-bottom: 20rpx;
}

.hint {
	font-size: 26rpx;
	color: #666;
	margin-bottom: 12rpx;
	line-height: 1.6;
}

.btn {
	background: #007aff;
	border-radius: 12rpx;
	padding: 20rpx;
	text-align: center;
	width: 100%;
	margin-top: 20rpx;
}

.btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}
</style>
