<template>
	<view class="content">
		<text class="page-title">路由解析演示</text>
		<text class="desc">演示路由路径解析与名称映射</text>

		<view class="card">
			<text class="card-title">路由名称映射</text>
			<text class="hint">generateRouter 插件根据 nameStrategy 自动生成路由名称</text>
			<text class="hint">当前策略: camelCase</text>
			<view class="route-list">
				<view v-for="route in routes" :key="route.path" class="route-item" @click="navigateTo(route.path)">
					<text class="route-name">{{ route.name }}</text>
					<text class="route-path">{{ route.path }}</text>
					<view class="route-meta" v-if="route.meta">
						<text v-for="(value, key) in route.meta" :key="key" class="meta-tag"> {{ key }}: {{ value }} </text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { routes } from '@/router.config'

export default {
	data() {
		return {
			routes
		}
	},
	methods: {
		navigateTo(path) {
			const tabBarPaths = ['/pages/index/index', '/pages/about/index']
			if (tabBarPaths.includes(path)) {
				uni.switchTab({ url: path })
			} else {
				uni.navigateTo({ url: path })
			}
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

.hint {
	font-size: 22rpx;
	color: #bbb;
	margin-bottom: 12rpx;
}

.route-list {
	margin-top: 16rpx;
}

.route-item {
	background: #fff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
}

.route-name {
	font-size: 28rpx;
	font-weight: bold;
	color: #007aff;
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
	background: #007aff;
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
}
</style>
