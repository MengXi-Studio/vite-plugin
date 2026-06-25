<template>
	<view class="content">
		<text class="page-title">个人中心</text>
		<text class="desc">分包页面 - pages-sub</text>

		<view class="card">
			<text class="card-title">用户信息</text>
			<view class="info-row">
				<text class="info-label">昵称</text>
				<text class="info-value">MengXi 用户</text>
			</view>
			<view class="info-row">
				<text class="info-label">路由路径</text>
				<text class="info-value">/pages-sub/profile/index</text>
			</view>
			<view class="info-row">
				<text class="info-label">路由名称</text>
				<text class="info-value">pagesSubProfileIndex</text>
			</view>
			<view class="info-row">
				<text class="info-label">分包</text>
				<text class="info-value">pages-sub</text>
			</view>
		</view>

		<view class="btn" @click="goToSettings">
			<text class="btn-text">前往设置页</text>
		</view>
		<view class="btn btn-outline" @click="goBack">
			<text class="btn-text btn-text-outline">返回上一页</text>
		</view>
	</view>
</template>

<script>
export default {
	methods: {
		goToSettings() {
			uni.navigateTo({ url: '/pages-sub/settings/index' })
		},
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

.info-row {
	display: flex;
	justify-content: space-between;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
	border-bottom: none;
}

.info-label {
	font-size: 26rpx;
	color: #999;
}

.info-value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.btn {
	background: #007aff;
	border-radius: 12rpx;
	padding: 20rpx;
	text-align: center;
	width: 100%;
	margin-top: 16rpx;
}

.btn-outline {
	background: transparent;
	border: 2rpx solid #007aff;
}

.btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}

.btn-text-outline {
	color: #007aff;
}
</style>
