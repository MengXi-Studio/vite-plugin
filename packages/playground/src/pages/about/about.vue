<template>
	<view class="container">
		<text class="page-title">关于</text>

		<view class="card">
			<text class="card-title">MengXi UniApp Playground</text>
			<text class="hint">本项目用于演示 @meng-xi/vite-plugin 所有插件的功能。</text>
			<text class="hint">基于 uni-app CLI + Vite 构建，支持 H5 和小程序平台。</text>
		</view>

		<view class="card">
			<text class="card-title">插件列表</text>
			<view class="plugin-list">
				<text class="plugin-item">assetManifest - 资源清单生成</text>
				<text class="plugin-item">autoImport - 自动导入</text>
				<text class="plugin-item">buildProgress - 构建进度条</text>
				<text class="plugin-item">bundleAnalyzer - 产物体积分析</text>
				<text class="plugin-item">compressAssets - 产物压缩</text>
				<text class="plugin-item">copyFile - 文件复制</text>
				<text class="plugin-item">envGuard - 环境变量校验</text>
				<text class="plugin-item">faviconManager - 图标管理</text>
				<text class="plugin-item">generateRouter - 路由配置生成</text>
				<text class="plugin-item">generateVersion - 版本生成</text>
				<text class="plugin-item">htmlInject - HTML 内容注入</text>
				<text class="plugin-item">imageOptimizer - 图片优化</text>
				<text class="plugin-item">loadingManager - 全局 Loading</text>
				<text class="plugin-item">proxyManager - 开发代理</text>
				<text class="plugin-item">versionUpdateChecker - 版本更新检查</text>
			</view>
		</view>

		<view class="card">
			<text class="card-title">版本信息</text>
			<text class="hint">当前版本: {{ appVersion }}</text>
			<text class="hint">构建时间: {{ versionInfo.buildTime }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
const appVersion = __APP_VERSION__
const versionInfo = __APP_VERSION___INFO
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
	margin-bottom: 12rpx;
	line-height: 1.6;
}

.plugin-list {
	padding: 10rpx 0;
}

.plugin-item {
	font-size: 26rpx;
	color: #666;
	display: block;
	padding: 10rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.plugin-item:last-child {
	border-bottom: none;
}
</style>
