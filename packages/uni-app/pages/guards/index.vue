<template>
	<view class="content">
		<text class="page-title">路由守卫演示</text>
		<text class="desc">演示路由守卫与 requireAuth 的配合</text>

		<view class="card">
			<text class="card-title">当前登录状态</text>
			<view class="info-row">
				<text class="info-label">登录状态</text>
				<text :class="['info-value', isLoggedIn ? 'active' : '']">
					{{ isLoggedIn ? '已登录' : '未登录' }}
				</text>
			</view>
			<view class="btn" @click="toggleLogin">
				<text class="btn-text">{{ isLoggedIn ? '退出登录' : '模拟登录' }}</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">访问受保护页面</text>
			<text class="hint">该页面在 pages.json 中配置了 requireAuth: true</text>
			<view class="btn" @click="goToProtected">
				<text class="btn-text">访问受保护页面</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">访问受保护分包页面</text>
			<text class="hint">设置页同样配置了 requireAuth: true</text>
			<view class="btn" @click="goToSettings">
				<text class="btn-text">访问设置页</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">路由守卫说明</text>
			<text class="hint">generateRouter 插件会从 pages.json 中提取 requireAuth 字段到路由元信息 meta 中。</text>
			<text class="hint">开发者可以基于 meta.requireAuth 实现路由守卫逻辑，在跳转前检查登录状态。</text>
			<text class="hint">本示例中，点击访问受保护页面时会先检查登录状态，未登录则跳转到登录页。</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isLoggedIn: false
		}
	},
	methods: {
		toggleLogin() {
			this.isLoggedIn = !this.isLoggedIn
			uni.showToast({
				title: this.isLoggedIn ? '已登录' : '已退出',
				icon: 'none'
			})
		},
		goToProtected() {
			if (!this.isLoggedIn) {
				uni.navigateTo({ url: '/pages/login/index?redirect=/pages/protected/index' })
				return
			}
			uni.navigateTo({ url: '/pages/protected/index' })
		},
		goToSettings() {
			if (!this.isLoggedIn) {
				uni.navigateTo({ url: '/pages/login/index?redirect=/pages-sub/settings/index' })
				return
			}
			uni.navigateTo({ url: '/pages-sub/settings/index' })
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
	align-items: center;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #eee;
	margin-bottom: 20rpx;
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

.info-value.active {
	color: #007aff;
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
	margin-top: 10rpx;
}

.btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}
</style>
