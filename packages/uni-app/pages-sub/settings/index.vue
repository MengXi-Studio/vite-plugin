<template>
	<view class="content">
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
			<text class="hint">路由名称: pagesSubSettingsIndex</text>
			<text class="hint">路径: /pages-sub/settings/index</text>
		</view>

		<view class="btn btn-outline" @click="goBack">
			<text class="btn-text btn-text-outline">返回上一页</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			settings: {
				notifications: true,
				darkMode: false,
				autoUpdate: true
			}
		}
	},
	methods: {
		toggleSetting(key) {
			this.settings[key] = !this.settings[key]
			uni.showToast({
				title: this.settings[key] ? '已开启' : '已关闭',
				icon: 'none'
			})
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
	color: #007aff;
	font-weight: 500;
}

.hint {
	font-size: 22rpx;
	color: #bbb;
	margin-bottom: 12rpx;
	line-height: 1.6;
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
