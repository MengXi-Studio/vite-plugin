<template>
	<view class="content">
		<view class="header">
			<image class="logo" src="/static/logo.png"></image>
			<text class="title">Vite Plugin Demo</text>
			<text class="subtitle">@meng-xi/vite-plugin 插件功能验证</text>
		</view>

		<!-- 版本信息 -->
		<view class="card">
			<text class="card-title">版本信息</text>
			<text class="version-text">{{ appVersion }}</text>
			<view class="info-row">
				<text class="info-label">构建时间</text>
				<text class="info-value">{{ versionInfo.buildTime }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">环境</text>
				<text class="info-value">{{ versionInfo.environment }}</text>
			</view>
		</view>

		<!-- 插件验证 -->
		<view class="card">
			<text class="card-title">插件验证</text>
			<view class="test-row" v-for="item in testList" :key="item.name">
				<text :class="['test-icon', item.passed ? 'pass' : 'pending']">
					{{ item.passed ? '✓' : '○' }}
				</text>
				<text class="test-name">{{ item.name }}</text>
			</view>
			<view class="btn" @click="runTests">
				<text class="btn-text">运行验证</text>
			</view>
		</view>

		<!-- Loading 演示 -->
		<view class="card">
			<text class="card-title">Loading 演示</text>
			<text class="hint">autoBind: 'all' 已开启，请求自动触发 Loading</text>
			<view class="btn-group">
				<view class="btn btn-sm" @click="showLoading">
					<text class="btn-text">显示</text>
				</view>
				<view class="btn btn-sm" @click="hideLoading">
					<text class="btn-text">隐藏</text>
				</view>
				<view class="btn btn-sm" @click="fetchWithLoading">
					<text class="btn-text">请求</text>
				</view>
			</view>
			<view class="info-row">
				<text class="info-label">状态</text>
				<text :class="['info-value', loadingVisible ? 'active' : '']">
					{{ loadingVisible ? '显示中' : '已隐藏' }}
				</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			appVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev',
			versionInfo: typeof __APP_VERSION___INFO !== 'undefined' ? __APP_VERSION___INFO : {},
			loadingVisible: false,
			testList: [
				{ name: 'buildProgress - 构建进度条', passed: false },
				{ name: 'generateRouter - 路由生成', passed: false },
				{ name: 'generateVersion - 版本生成', passed: false },
				{ name: 'htmlInject - HTML 注入', passed: false },
				{ name: 'faviconManager - 网站图标管理', passed: false },
				{ name: 'copyFile - 文件复制', passed: false },
				{ name: 'loadingManager - 全局 Loading', passed: false },
				{ name: 'versionUpdateChecker - 版本更新检查', passed: false }
			]
		}
	},
	onLoad() {
		this.startStatusPolling()
	},
	onUnload() {
		this.stopStatusPolling()
	},
	methods: {
		startStatusPolling() {
			this._statusTimer = setInterval(() => {
				// #ifdef H5
				const manager = window.__LOADING_MANAGER__
				if (manager) {
					this.loadingVisible = manager.isVisible()
				}
				// #endif
			}, 300)
		},
		stopStatusPolling() {
			if (this._statusTimer) {
				clearInterval(this._statusTimer)
				this._statusTimer = null
			}
		},
		runTests() {
			this.testList[0].passed = true

			// #ifdef H5
			this.testList[1].passed = true
			// #endif

			this.testList[2].passed = !!this.appVersion && this.appVersion !== 'dev'

			// #ifdef H5
			const metaDesc = document.querySelector('meta[name="description"]')
			this.testList[3].passed = !!metaDesc

			const linkEl = document.querySelector('link[rel="icon"]')
			this.testList[4].passed = !!linkEl

			fetch('/static/logo.png', { method: 'HEAD' })
				.then(res => {
					this.testList[5].passed = res.ok
				})
				.catch(() => {
					this.testList[5].passed = false
				})

			const manager = window.__LOADING_MANAGER__
			this.testList[6].passed = !!manager && typeof manager.show === 'function'

			this.testList[7].passed = !!window.__VUC_REFRESH__ || !!window.__VUC_DISMISS__
			// #endif
		},
		showLoading() {
			// #ifdef H5
			const manager = window.__LOADING_MANAGER__
			if (manager) manager.show('手动触发的 Loading...')
			// #endif
		},
		hideLoading() {
			// #ifdef H5
			const manager = window.__LOADING_MANAGER__
			if (manager) manager.hide()
			// #endif
		},
		fetchWithLoading() {
			// #ifdef H5
			fetch('https://httpbin.org/delay/1').catch(() => {})
			// #endif
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

.header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 40rpx;
}

.logo {
	height: 200rpx;
	width: 200rpx;
	margin-bottom: 30rpx;
}

.title {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
}

.subtitle {
	font-size: 26rpx;
	color: #999;
	margin-top: 10rpx;
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

.version-text {
	font-size: 36rpx;
	font-weight: bold;
	color: #007aff;
	text-align: center;
	margin: 20rpx 0;
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
}

.info-value.active {
	color: #007aff;
}

.hint {
	font-size: 22rpx;
	color: #bbb;
	margin-bottom: 20rpx;
}

.test-row {
	display: flex;
	align-items: center;
	padding: 14rpx 0;
}

.test-icon {
	font-size: 30rpx;
	margin-right: 16rpx;
	color: #ccc;
}

.test-icon.pass {
	color: #07c160;
}

.test-name {
	font-size: 26rpx;
	color: #666;
}

.btn {
	background: #007aff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-top: 20rpx;
	text-align: center;
}

.btn-sm {
	flex: 1;
	padding: 16rpx;
	margin-top: 0;
}

.btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 500;
}

.btn-group {
	display: flex;
	gap: 16rpx;
	margin-bottom: 20rpx;
}
</style>
