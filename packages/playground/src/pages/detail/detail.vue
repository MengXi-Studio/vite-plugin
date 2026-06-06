<template>
	<view class="container">
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
				<text class="label">当前路径</text>
				<text class="value">/pages/detail/detail</text>
			</view>
			<view class="info-row">
				<text class="label">路由名称</text>
				<text class="value">pagesDetailDetail</text>
			</view>
		</view>

		<button class="btn" @click="goBack">返回上一页</button>
	</view>
</template>

<script setup lang="ts">
const routeParams = ref<Record<string, string>>({})

onMounted(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	if (currentPage) {
		routeParams.value = (currentPage as any).options || {}
	}
})

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

.param-list {
	background: #f9f9f9;
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
	margin-top: 20rpx;
}

.btn::after {
	border: none;
}
</style>
