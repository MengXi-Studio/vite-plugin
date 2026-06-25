<template>
	<view class="content">
		<text class="page-title">路由导航演示</text>
		<text class="desc">演示 uni-app 的各种路由导航方式</text>

		<view class="card">
			<text class="card-title">navigateTo - 保留当前页</text>
			<view class="btn" @click="navigateToDetail">
				<text class="btn-text">跳转详情页</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">redirectTo - 关闭当前页</text>
			<view class="btn" @click="redirectToDetail">
				<text class="btn-text">重定向到详情页</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">switchTab - 切换 TabBar</text>
			<view class="btn" @click="switchToAbout">
				<text class="btn-text">切换到关于页</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">navigateBack - 返回上一页</text>
			<view class="btn" @click="goBack">
				<text class="btn-text">返回上一页</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">带参数导航</text>
			<view class="btn" @click="navigateWithParams">
				<text class="btn-text">跳转详情 (id=100, name=test)</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">分包页面导航</text>
			<view class="btn" @click="navigateToSubPkg">
				<text class="btn-text">跳转个人中心 (分包)</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	methods: {
		navigateToDetail() {
			uni.navigateTo({ url: '/pages/detail/index?id=1' })
		},
		redirectToDetail() {
			uni.redirectTo({ url: '/pages/detail/index?id=2' })
		},
		switchToAbout() {
			uni.switchTab({ url: '/pages/about/index' })
		},
		goBack() {
			uni.navigateBack({ delta: 1 })
		},
		navigateWithParams() {
			uni.navigateTo({ url: '/pages/detail/index?id=100&name=test' })
		},
		navigateToSubPkg() {
			uni.navigateTo({ url: '/pages-sub/profile/index' })
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

.btn {
	background: #007aff;
	border-radius: 12rpx;
	padding: 20rpx;
	text-align: center;
}

.btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}
</style>
