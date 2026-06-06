<template>
	<view class="container">
		<text class="page-title">登录</text>

		<view class="card">
			<text class="card-title">模拟登录</text>
			<text class="hint">这是一个模拟登录页面，用于演示路由守卫跳转逻辑。</text>
			<text class="hint" v-if="redirectUrl">登录后将跳转至: {{ redirectUrl }}</text>
			<button class="btn" @click="handleLogin">登录</button>
		</view>

		<button class="btn btn-outline" @click="goBack">返回上一页</button>
	</view>
</template>

<script setup lang="ts">
const redirectUrl = ref('')

onMounted(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	if (currentPage) {
		const options = (currentPage as any).options || {}
		redirectUrl.value = decodeURIComponent(options.redirect || '')
	}
})

function handleLogin() {
	uni.showToast({ title: '登录成功', icon: 'success' })

	if (redirectUrl.value) {
		setTimeout(() => {
			uni.navigateTo({ url: redirectUrl.value })
		}, 500)
	} else {
		setTimeout(() => {
			uni.navigateBack({ delta: 1 })
		}, 500)
	}
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
	padding: 30rpx 0 30rpx;
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

.hint {
	font-size: 26rpx;
	color: #666;
	display: block;
	margin-bottom: 16rpx;
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

.btn-outline {
	background-color: transparent;
	border: 2rpx solid #42b883;
	color: #42b883;
}
</style>
