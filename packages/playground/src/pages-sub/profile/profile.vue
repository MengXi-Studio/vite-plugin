<template>
	<view class="container">
		<text class="page-title">个人中心</text>
		<text class="desc">分包页面 - pages-sub</text>

		<view class="card">
			<text class="card-title">用户信息</text>
			<view class="info-row">
				<text class="label">昵称</text>
				<text class="value">MengXi 用户</text>
			</view>
			<view class="info-row">
				<text class="label">路由路径</text>
				<text class="value">/pages-sub/profile/profile</text>
			</view>
			<view class="info-row">
				<text class="label">路由名称</text>
				<text class="value">pagesSubProfileProfile</text>
			</view>
			<view class="info-row">
				<text class="label">分包</text>
				<text class="value">pages-sub</text>
			</view>
		</view>

		<button class="btn" @click="goToSettings">前往设置页</button>
		<button class="btn btn-outline" @click="goBack">返回上一页</button>
	</view>
</template>

<script setup lang="ts">
function goToSettings() {
	uni.navigateTo({ url: '/pages-sub/settings/settings' })
}

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

.info-row {
	display: flex;
	justify-content: space-between;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
	border-bottom: none;
}

.info-row .label {
	font-size: 26rpx;
	color: #999;
}

.info-row .value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.btn {
	background-color: #42b883;
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	padding: 20rpx 0;
	margin-top: 16rpx;
}

.btn::after {
	border: none;
}

.btn-outline {
	background-color: transparent;
	border: 2rpx solid #42b883;
	color: #42b883;
}
</style>
