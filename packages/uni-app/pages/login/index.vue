<template>
	<view class="content">
		<text class="page-title">登录</text>

		<view class="card">
			<text class="card-title">模拟登录</text>
			<text class="hint">这是一个模拟登录页面，用于演示路由守卫跳转逻辑。</text>
			<text class="hint" v-if="redirectUrl">登录后将跳转至: {{ redirectUrl }}</text>
			<view class="btn" @click="handleLogin">
				<text class="btn-text">登录</text>
			</view>
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
			redirectUrl: ''
		}
	},
	onLoad(options) {
		this.redirectUrl = decodeURIComponent(options.redirect || '')
	},
	methods: {
		handleLogin() {
			uni.showToast({ title: '登录成功', icon: 'success' })

			if (this.redirectUrl) {
				setTimeout(() => {
					uni.navigateTo({ url: this.redirectUrl })
				}, 500)
			} else {
				setTimeout(() => {
					uni.navigateBack({ delta: 1 })
				}, 500)
			}
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
	margin-bottom: 16rpx;
	line-height: 1.6;
}

.btn {
	background: #007aff;
	border-radius: 12rpx;
	padding: 20rpx;
	text-align: center;
	width: 100%;
	margin-top: 10rpx;
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
