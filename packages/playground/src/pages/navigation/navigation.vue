<template>
	<view class="container">
		<text class="page-title">路由导航演示</text>
		<text class="desc">演示 uni-app 的各种路由导航方式</text>

		<view class="card">
			<text class="card-title">navigateTo - 保留当前页</text>
			<button class="btn" @click="navigateToDetail">跳转详情页</button>
		</view>

		<view class="card">
			<text class="card-title">redirectTo - 关闭当前页</text>
			<button class="btn" @click="redirectToDetail">重定向到详情页</button>
		</view>

		<view class="card">
			<text class="card-title">switchTab - 切换 TabBar</text>
			<button class="btn" @click="switchToAbout">切换到关于页</button>
		</view>

		<view class="card">
			<text class="card-title">navigateBack - 返回上一页</text>
			<button class="btn" @click="goBack">返回上一页</button>
		</view>

		<view class="card">
			<text class="card-title">带参数导航</text>
			<button class="btn" @click="navigateWithParams">跳转详情 (id=100, name=test)</button>
		</view>

		<view class="card">
			<text class="card-title">分包页面导航</text>
			<button class="btn" @click="navigateToSubPkg">跳转个人中心 (分包)</button>
		</view>
	</view>
</template>

<script setup lang="ts">
function navigateToDetail() {
	uni.navigateTo({ url: '/pages/detail/detail?id=1' })
}

function redirectToDetail() {
	uni.redirectTo({ url: '/pages/detail/detail?id=2' })
}

function switchToAbout() {
	uni.switchTab({ url: '/pages/about/about' })
}

function goBack() {
	uni.navigateBack({ delta: 1 })
}

function navigateWithParams() {
	uni.navigateTo({ url: '/pages/detail/detail?id=100&name=test' })
}

function navigateToSubPkg() {
	uni.navigateTo({ url: '/pages-sub/profile/profile' })
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

.btn {
	background-color: #42b883;
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	padding: 20rpx 0;
}

.btn::after {
	border: none;
}
</style>
