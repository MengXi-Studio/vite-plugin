<template>
	<view class="content">
		<view class="card">
			<text class="card-title">关于</text>
			<text class="desc">本项目演示 @meng-xi/vite-plugin 在 uni-app 中的完整功能。</text>
			<text class="desc">基于 uni-app CLI + Vite 构建，支持 H5 和小程序平台。</text>
		</view>

		<!-- 插件列表 -->
		<view class="card">
			<text class="card-title">插件列表（共 15 个）</text>
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

		<!-- envGuard 验证 -->
		<view class="card">
			<text class="card-title">envGuard - 环境变量</text>
			<view class="info-row">
				<text class="info-label">VITE_APP_TITLE</text>
				<text class="info-value">{{ envTitle }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">VITE_API_URL</text>
				<text class="info-value">{{ envApiUrl }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">VITE_DEBUG</text>
				<text class="info-value">{{ envDebug }}</text>
			</view>
		</view>

		<!-- generateRouter 验证 -->
		<view class="card">
			<text class="card-title">generateRouter - 路由信息</text>
			<view class="info-row">
				<text class="info-label">当前路径</text>
				<text class="info-value">{{ currentPath }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">路由名称</text>
				<text class="info-value">pagesAboutIndex</text>
			</view>
		</view>

		<!-- 版本信息 -->
		<view class="card">
			<text class="card-title">generateVersion - 版本信息</text>
			<view class="info-row">
				<text class="info-label">当前版本</text>
				<text class="info-value">{{ appVersion }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">构建时间</text>
				<text class="info-value">{{ versionInfo.buildTime || '-' }}</text>
			</view>
		</view>

		<view class="btn" @click="goBack">
			<text class="btn-text">返回首页</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev',
			versionInfo: typeof __APP_VERSION___INFO !== 'undefined' ? __APP_VERSION___INFO : {},
			envTitle: '',
			envApiUrl: '',
			envDebug: '',
			currentPath: ''
		}
	},
	onLoad() {
		this.envTitle = import.meta.env.VITE_APP_TITLE || '-'
		this.envApiUrl = import.meta.env.VITE_API_URL || '-'
		this.envDebug = String(import.meta.env.VITE_DEBUG || '-')
		// #ifdef H5
		this.currentPath = window.location.pathname
		// #endif
	},
	methods: {
		goBack() {
			uni.navigateBack()
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

.desc {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	margin-bottom: 8rpx;
}

.plugin-list {
	padding: 10rpx 0;
}

.plugin-item {
	font-size: 26rpx;
	color: #666;
	padding: 10rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.plugin-item:last-child {
	border-bottom: none;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #eee;
}

.info-label {
	font-size: 26rpx;
	color: #999;
}

.info-value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
	word-break: break-all;
	max-width: 60%;
	text-align: right;
}

.btn {
	background: #007aff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-top: 20rpx;
	text-align: center;
	width: 100%;
}

.btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}
</style>
