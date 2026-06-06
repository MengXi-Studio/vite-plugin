<template>
	<view class="container">
		<text class="page-title">设置</text>
		<text class="desc">分包页面 - 需要登录 (requireAuth: true)</text>

		<view class="card">
			<text class="card-title">设置项</text>
			<view class="setting-item" @click="toggleSetting('notifications')">
				<text class="setting-label">消息通知</text>
				<text class="setting-value">{{ settings.notifications ? '已开启' : '已关闭' }}</text>
			</view>
			<view class="setting-item" @click="toggleSetting('darkMode')">
				<text class="setting-label">深色模式</text>
				<text class="setting-value">{{ settings.darkMode ? '已开启' : '已关闭' }}</text>
			</view>
			<view class="setting-item" @click="toggleSetting('autoUpdate')">
				<text class="setting-label">自动更新</text>
				<text class="setting-value">{{ settings.autoUpdate ? '已开启' : '已关闭' }}</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">路由元信息</text>
			<text class="hint">该页面配置了 requireAuth: true</text>
			<text class="hint">路由名称: pagesSubSettingsSettings</text>
			<text class="hint">路径: /pages-sub/settings/settings</text>
		</view>

		<button class="btn btn-outline" @click="goBack">返回上一页</button>
	</view>
</template>

<script setup lang="ts">
const settings = reactive({
	notifications: true,
	darkMode: false,
	autoUpdate: true
})

function toggleSetting(key: keyof typeof settings) {
	settings[key] = !settings[key]
	uni.showToast({
		title: `${settings[key] ? '已开启' : '已关闭'}`,
		icon: 'none'
	})
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

.setting-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
	border-bottom: none;
}

.setting-label {
	font-size: 28rpx;
	color: #333;
}

.setting-value {
	font-size: 26rpx;
	color: #42b883;
	font-weight: 500;
}

.hint {
	font-size: 24rpx;
	color: #999;
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
