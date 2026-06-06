<template>
	<view class="container">
		<text class="page-title">路由守卫演示</text>
		<text class="desc">演示路由守卫与 requireAuth 的配合</text>

		<view class="card">
			<text class="card-title">当前登录状态</text>
			<view class="status-row">
				<text class="label">登录状态</text>
				<text class="value" :class="{ active: isLoggedIn }">{{ isLoggedIn ? '已登录' : '未登录' }}</text>
			</view>
			<button class="btn" @click="toggleLogin">{{ isLoggedIn ? '退出登录' : '模拟登录' }}</button>
		</view>

		<view class="card">
			<text class="card-title">访问受保护页面</text>
			<text class="hint">该页面在 pages.json 中配置了 requireAuth: true</text>
			<button class="btn" @click="goToProtected">访问受保护页面</button>
		</view>

		<view class="card">
			<text class="card-title">访问受保护分包页面</text>
			<text class="hint">设置页同样配置了 requireAuth: true</text>
			<button class="btn" @click="goToSettings">访问设置页</button>
		</view>

		<view class="card">
			<text class="card-title">路由守卫说明</text>
			<text class="hint">generateRouter 插件会从 pages.json 中提取 requireAuth 字段到路由元信息 meta 中。</text>
			<text class="hint">开发者可以基于 meta.requireAuth 实现路由守卫逻辑，在跳转前检查登录状态。</text>
			<text class="hint">本示例中，点击访问受保护页面时会先检查登录状态，未登录则跳转到登录页。</text>
		</view>
	</view>
</template>

<script setup lang="ts">
const isLoggedIn = ref(false)

function toggleLogin() {
	isLoggedIn.value = !isLoggedIn.value
	uni.showToast({
		title: isLoggedIn.value ? '已登录' : '已退出',
		icon: 'none'
	})
}

function goToProtected() {
	if (!isLoggedIn.value) {
		uni.navigateTo({ url: '/pages/login/login?redirect=/pages/protected/protected' })
		return
	}
	uni.navigateTo({ url: '/pages/protected/protected' })
}

function goToSettings() {
	if (!isLoggedIn.value) {
		uni.navigateTo({ url: '/pages/login/login?redirect=/pages-sub/settings/settings' })
		return
	}
	uni.navigateTo({ url: '/pages-sub/settings/settings' })
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

.status-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 20rpx;
	background: #f9f9f9;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}

.status-row .label {
	font-size: 24rpx;
	color: #999;
}

.status-row .value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

.status-row .value.active {
	color: #42b883;
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
	margin-top: 10rpx;
}

.btn::after {
	border: none;
}
</style>
