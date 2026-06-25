<template>
	<view class="content">
		<text class="page-title">详情页</text>

		<view class="card">
			<text class="card-title">路由参数</text>
			<view class="param-list">
				<view v-for="(value, key) in routeParams" :key="key" class="param-item">
					<text class="param-key">{{ key }}</text>
					<text class="param-value">{{ value }}</text>
				</view>
				<view v-if="Object.keys(routeParams).length === 0" class="param-item">
					<text class="param-key">提示</text>
					<text class="param-value">无参数，请从导航页跳转</text>
				</view>
			</view>
		</view>

		<view class="card">
			<text class="card-title">页面信息</text>
			<view class="info-row">
				<text class="info-label">当前路径</text>
				<text class="info-value">/pages/detail/index</text>
			</view>
			<view class="info-row">
				<text class="info-label">路由名称</text>
				<text class="info-value">pagesDetailIndex</text>
			</view>
		</view>

		<view class="btn" @click="goBack">
			<text class="btn-text">返回上一页</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			routeParams: {}
		}
	},
	onLoad(options) {
		this.routeParams = options || {}
	},
	methods: {
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

.param-list {
	background: #fff;
	border-radius: 12rpx;
	padding: 10rpx 20rpx;
}

.param-item {
	display: flex;
	justify-content: space-between;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #eee;
}

.param-item:last-child {
	border-bottom: none;
}

.param-key {
	font-size: 26rpx;
	color: #999;
}

.param-value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
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
	margin-top: 20rpx;
}

.btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}
</style>
