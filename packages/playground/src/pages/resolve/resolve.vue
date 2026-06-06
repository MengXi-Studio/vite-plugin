<template>
	<view class="container">
		<text class="page-title">路由解析演示</text>
		<text class="desc">演示路由路径解析与名称映射</text>

		<view class="card">
			<text class="card-title">路由名称映射</text>
			<text class="hint">generateRouter 插件根据 nameStrategy 自动生成路由名称</text>
			<text class="hint">当前策略: camelCase</text>
			<view class="route-list">
				<view v-for="route in routes" :key="route.path" class="route-item" @click="navigateTo(route.path)">
					<view class="route-name">{{ route.name }}</view>
					<view class="route-path">{{ route.path }}</view>
					<view class="route-meta" v-if="route.meta">
						<text v-for="(value, key) in route.meta" :key="key" class="meta-tag"> {{ key }}: {{ value }} </text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { routes } from '@/router.config'

function navigateTo(path: string) {
	// TabBar 页面使用 switchTab
	const tabBarPaths = ['/pages/index/index', '/pages/about/about']
	if (tabBarPaths.includes(path)) {
		uni.switchTab({ url: path })
	} else {
		uni.navigateTo({ url: path })
	}
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

.hint {
	font-size: 24rpx;
	color: #999;
	display: block;
	margin-bottom: 12rpx;
}

.route-list {
	margin-top: 16rpx;
}

.route-item {
	background: #f9f9f9;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
}

.route-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #42b883;
	margin-bottom: 8rpx;
}

.route-path {
	font-size: 24rpx;
	color: #666;
	font-family: monospace;
	margin-bottom: 8rpx;
}

.route-meta {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.meta-tag {
	font-size: 22rpx;
	color: #fff;
	background: #42b883;
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
}
</style>
