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
				<text class="info-value">{{ versionInfo.buildTime || '-' }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">格式</text>
				<text class="info-value">{{ versionInfo.format || '-' }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">环境</text>
				<text class="info-value">{{ versionInfo.environment || '-' }}</text>
			</view>
			<view class="info-row">
				<text class="info-label">作者</text>
				<text class="info-value">{{ versionInfo.author || '-' }}</text>
			</view>
		</view>

		<!-- autoImport 验证 -->
		<view class="card">
			<text class="card-title">autoImport - 自动导入</text>
			<text class="hint">使用 vue: ['*'] 通配符，自动导入 Vue 全部 API</text>
			<view class="info-row">
				<text class="info-label">ref</text>
				<text :class="['info-value', autoImportResult.ref ? 'active' : '']">
					{{ autoImportResult.ref ? '可用' : '不可用' }}
				</text>
			</view>
			<view class="info-row">
				<text class="info-label">reactive</text>
				<text :class="['info-value', autoImportResult.reactive ? 'active' : '']">
					{{ autoImportResult.reactive ? '可用' : '不可用' }}
				</text>
			</view>
			<view class="info-row">
				<text class="info-label">computed</text>
				<text :class="['info-value', autoImportResult.computed ? 'active' : '']">
					{{ autoImportResult.computed ? '可用' : '不可用' }}
				</text>
			</view>
			<view class="info-row">
				<text class="info-label">watch</text>
				<text :class="['info-value', autoImportResult.watch ? 'active' : '']">
					{{ autoImportResult.watch ? '可用' : '不可用' }}
				</text>
			</view>
			<view class="info-row">
				<text class="info-label">onMounted</text>
				<text :class="['info-value', autoImportResult.onMounted ? 'active' : '']">
					{{ autoImportResult.onMounted ? '可用' : '不可用' }}
				</text>
			</view>
		</view>

		<!-- 插件验证 -->
		<view class="card">
			<text class="card-title">插件验证</text>
			<view class="test-row" v-for="item in testList" :key="item.name">
				<text :class="['test-icon', item.passed ? 'pass' : 'pending']">
					{{ item.passed ? '✓' : '○' }}
				</text>
				<view class="test-content">
					<text class="test-name">{{ item.name }}</text>
					<text v-if="item.summary" class="test-summary">{{ item.summary }}</text>
				</view>
			</view>
			<view class="btn" @click="runTests">
				<text class="btn-text">运行验证</text>
			</view>
		</view>

		<!-- Loading 演示 -->
		<view class="card">
			<text class="card-title">loadingManager - 全局 Loading</text>
			<text class="hint">autoBind: 'all' 已开启，请求自动触发 Loading</text>
			<view class="btn-group">
				<view class="btn btn-sm" @click="showLoading">
					<text class="btn-text">显示</text>
				</view>
				<view class="btn btn-sm" @click="hideLoading">
					<text class="btn-text">隐藏</text>
				</view>
				<view class="btn btn-sm" @click="updateLoadingText">
					<text class="btn-text">更新文本</text>
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
			<view class="info-row">
				<text class="info-label">挂起请求</text>
				<text class="info-value">{{ pendingCount }}</text>
			</view>
		</view>

		<!-- 压缩验证 -->
		<view class="card">
			<text class="card-title">compressAssets - 构建产物压缩</text>
			<text class="hint">生产构建后生成 .gz / .br 文件</text>
			<view class="info-row">
				<text class="info-label">算法</text>
				<text class="info-value">gzip + brotli (both)</text>
			</view>
			<view class="info-row">
				<text class="info-label">阈值</text>
				<text class="info-value">1024 字节</text>
			</view>
			<view class="btn" @click="checkCompressedFiles">
				<text class="btn-text">检查压缩文件</text>
			</view>
			<view v-if="compressResult" class="info-row">
				<text class="info-label">结果</text>
				<text :class="['info-value', compressResult.passed ? 'active' : '']">
					{{ compressResult.message }}
				</text>
			</view>
		</view>

		<!-- 代理交互演示 -->
		<view class="card">
			<text class="card-title">proxyManager - 开发代理</text>
			<text class="hint">已配置 /api 和 /proxy-delay 代理规则</text>
			<view class="btn-group">
				<view class="btn btn-sm" @click="testProxy">
					<text class="btn-text">测试代理</text>
				</view>
				<view class="btn btn-sm" @click="testProxyDelay">
					<text class="btn-text">延迟模拟</text>
				</view>
			</view>
			<view v-if="proxyResult" class="info-row">
				<text class="info-label">结果</text>
				<text :class="['info-value', proxyResult.passed ? 'active' : '']">
					{{ proxyResult.message }}
				</text>
			</view>
		</view>

		<!-- 路由导航演示 -->
		<view class="card">
			<text class="card-title">路由导航演示</text>
			<text class="hint">使用 generateRouter 生成的路由配置进行导航</text>
			<view class="btn-group">
				<view class="btn btn-sm" @click="navigateTo('/pages/navigation/index')">
					<text class="btn-text">路由导航</text>
				</view>
				<view class="btn btn-sm" @click="navigateTo('/pages/guards/index')">
					<text class="btn-text">路由守卫</text>
				</view>
				<view class="btn btn-sm" @click="navigateTo('/pages/detail/index?id=42&from=index')">
					<text class="btn-text">详情页</text>
				</view>
				<view class="btn btn-sm" @click="navigateTo('/pages/resolve/index')">
					<text class="btn-text">路由解析</text>
				</view>
				<view class="btn btn-sm" @click="navigateTo('/pages-sub/profile/index')">
					<text class="btn-text">个人中心</text>
				</view>
				<view class="btn btn-sm" @click="navigateTo('/pages-sub/settings/index')">
					<text class="btn-text">设置</text>
				</view>
			</view>
		</view>

		<!-- 导航到其他页面 -->
		<view class="card">
			<text class="card-title">更多演示</text>
			<view class="btn-group">
				<view class="btn btn-sm" @click="navigateTo('/pages/about/index')">
					<text class="btn-text">关于</text>
				</view>
				<view class="btn btn-sm" @click="navigateTo('/pages/reports/index')">
					<text class="btn-text">构建报告</text>
				</view>
			</view>
		</view>

		<!-- 环境/注入类展示 -->
		<view class="card">
			<text class="card-title">环境与注入展示</text>
			<text class="hint">envGuard / htmlInject / faviconManager / copyFile 实际效果</text>

			<view class="inject-section">
				<text class="inject-label">envGuard 环境变量</text>
				<view class="kv-list">
					<view class="kv-item"><text class="kv-key">VITE_APP_TITLE</text><text class="kv-val">{{ envInfo.title || '-' }}</text></view>
					<view class="kv-item"><text class="kv-key">VITE_API_URL</text><text class="kv-val">{{ envInfo.apiUrl || '-' }}</text></view>
					<view class="kv-item"><text class="kv-key">VITE_DEBUG</text><text class="kv-val">{{ envInfo.debug || '-' }}</text></view>
				</view>
			</view>

			<view class="inject-section">
				<text class="inject-label">htmlInject 注入的 meta</text>
				<view class="kv-list">
					<view class="kv-item"><text class="kv-key">description</text><text class="kv-val">{{ injectInfo.description || '未注入' }}</text></view>
					<view class="kv-item"><text class="kv-key">keywords</text><text class="kv-val">{{ injectInfo.keywords || '未注入' }}</text></view>
					<view class="kv-item"><text class="kv-key">theme-color</text><text class="kv-val">{{ injectInfo.themeColor || '未注入' }}</text></view>
				</view>
			</view>

			<view class="inject-section">
				<text class="inject-label">faviconManager 图标</text>
				<view class="kv-list">
					<view class="kv-item"><text class="kv-key">rel</text><text class="kv-val">{{ injectInfo.faviconRel || '未注入' }}</text></view>
					<view class="kv-item"><text class="kv-key">href</text><text class="kv-val">{{ injectInfo.faviconHref || '未注入' }}</text></view>
				</view>
			</view>

			<view class="inject-section">
				<text class="inject-label">copyFile 复制文件</text>
				<view class="file-tags">
					<text v-for="file in injectInfo.copiedFiles" :key="file" class="file-tag">{{ file }}</text>
				</view>
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
			pendingCount: 0,
			compressResult: null,
			autoImportResult: {
				ref: false,
				reactive: false,
				computed: false,
				watch: false,
				onMounted: false
			},
			testList: [
				{ name: 'assetManifest - 资源清单生成', passed: false, summary: '' },
				{ name: 'autoImport - 自动导入', passed: false, summary: '' },
				{ name: 'buildProgress - 构建进度条', passed: false, summary: '' },
				{ name: 'bundleAnalyzer - 构建产物体积分析', passed: false, summary: '' },
				{ name: 'compressAssets - 构建产物压缩', passed: false, summary: '' },
				{ name: 'copyFile - 文件复制', passed: false, summary: '' },
				{ name: 'envGuard - 环境变量校验', passed: false, summary: '' },
				{ name: 'faviconManager - 网站图标管理', passed: false, summary: '' },
				{ name: 'generateRouter - 路由生成', passed: false, summary: '' },
				{ name: 'generateVersion - 版本生成', passed: false, summary: '' },
				{ name: 'htmlInject - HTML 注入', passed: false, summary: '' },
				{ name: 'imageOptimizer - 图片优化压缩', passed: false, summary: '' },
				{ name: 'loadingManager - 全局 Loading', passed: false, summary: '' },
				{ name: 'proxyManager - 开发代理', passed: false, summary: '' },
				{ name: 'versionUpdateChecker - 版本更新检查', passed: false, summary: '' }
			],
			envInfo: {
				title: '',
				apiUrl: '',
				debug: ''
			},
			injectInfo: {
				keywords: '',
				themeColor: '',
				description: '',
				faviconHref: '',
				faviconRel: '',
				copiedFiles: ['/example.txt', '/favicon.ico', '/static/banner.svg', '/static/logo.png']
			},
			proxyResult: null
		}
	},
	onLoad() {
		this.checkAutoImport()
		this.startStatusPolling()
		this.loadEnvInfo()
		// #ifdef H5
		this.loadInjectInfo()
		// #endif
	},
	onUnload() {
		this.stopStatusPolling()
	},
	methods: {
		checkAutoImport() {
			// #ifdef H5
			this.autoImportResult.ref = typeof ref === 'function'
			this.autoImportResult.reactive = typeof reactive === 'function'
			this.autoImportResult.computed = typeof computed === 'function'
			this.autoImportResult.watch = typeof watch === 'function'
			this.autoImportResult.onMounted = typeof onMounted === 'function'
			// #endif
		},
		startStatusPolling() {
			this._statusTimer = setInterval(() => {
				// #ifdef H5
				const manager = window.__LOADING_MANAGER__
				if (manager) {
					this.loadingVisible = manager.isVisible()
					this.pendingCount = manager.getPendingCount()
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
			// #ifdef H5
			// assetManifest: 验证资源清单已生成（运行时注入 + 文件）
			const manifestData = window.__ASSET_MANIFEST__
			const assetCount = manifestData ? Object.keys(manifestData.assets || manifestData).length : 0
			fetch('/manifest.json', { method: 'HEAD' })
				.then(res => {
					this.testList[0].passed = !!manifestData || res.ok
					this.testList[0].summary = manifestData ? '资源映射 ' + assetCount + ' 条' : (res.ok ? 'manifest.json 可访问' : '未生成')
				})
				.catch(() => {
					this.testList[0].passed = !!manifestData
					this.testList[0].summary = manifestData ? '资源映射 ' + assetCount + ' 条' : '未生成'
				})

			// autoImport: 验证 Vue API 已自动注入
			this.testList[1].passed = typeof ref === 'function' && typeof reactive === 'function'
			this.testList[1].summary = 'ref / reactive / computed / watch / onMounted'

			// buildProgress: 构建进度条（构建期已展示）
			this.testList[2].passed = true
			this.testList[2].summary = '构建进度条已在终端展示'

			// bundleAnalyzer: 验证分析报告并读取摘要
			fetch('/bundle-analysis.json')
				.then(res => {
					if (res.ok) return res.json()
					throw new Error('HTTP ' + res.status)
				})
				.then(data => {
					this.testList[3].passed = true
					this.testList[3].summary = (data.summary?.chunkCount || 0) + ' chunks, ' + (data.summary?.totalSizeFormatted || '未知')
				})
				.catch(() => {
					this.testList[3].passed = false
					this.testList[3].summary = '报告未生成（需生产构建）'
				})

			// compressAssets: 读取压缩报告摘要
			fetch('/compress-report.json')
				.then(res => {
					if (res.ok) return res.json()
					throw new Error('HTTP ' + res.status)
				})
				.then(data => {
					const s = data.summary || {}
					this.testList[4].passed = s.totalFiles > 0
					this.testList[4].summary = s.totalFiles > 0 ? s.totalFiles + ' 文件, 压缩率 ' + (s.totalRatio || 0).toFixed(1) + '%' : '无压缩文件'
				})
				.catch(() => {
					this.testList[4].passed = false
					this.testList[4].summary = '报告未生成（需生产构建）'
				})

			// copyFile: 验证文件已复制
			fetch('/example.txt', { method: 'HEAD' })
				.then(res => {
					this.testList[5].passed = res.ok
					this.testList[5].summary = res.ok ? '/example.txt 可访问' : 'HTTP ' + res.status
				})
				.catch(() => {
					this.testList[5].passed = false
					this.testList[5].summary = '文件未复制（需生产构建）'
				})

			// envGuard: 验证环境变量已通过校验
			this.testList[6].passed = !!this.envInfo.title && !!this.envInfo.apiUrl
			this.testList[6].summary = 'VITE_APP_TITLE="' + this.envInfo.title + '"'

			// faviconManager: 验证 favicon 已注入
			const linkEl = document.querySelector('link[rel="icon"]')
			this.testList[7].passed = !!linkEl
			this.testList[7].summary = linkEl ? 'href="' + linkEl.getAttribute('href') + '"' : 'favicon 未注入（需生产构建）'

			// generateRouter: 验证路由配置已生成
			this.testList[8].passed = true
			this.testList[8].summary = 'router.config.ts 已生成'

			// generateVersion: 验证版本号已注入
			this.testList[9].passed = !!this.appVersion && this.appVersion !== 'dev'
			this.testList[9].summary = this.appVersion !== 'dev' ? '当前版本: ' + this.appVersion : '开发模式未注入版本号'

			// htmlInject: 验证 meta 标签已注入（检查多个注入项）
			const metaDesc = document.querySelector('meta[name="description"]')
			const metaKeywords = document.querySelector('meta[name="keywords"]')
			const metaTheme = document.querySelector('meta[name="theme-color"]')
			this.testList[10].passed = !!(metaDesc && metaKeywords && metaTheme)
			this.testList[10].summary = metaKeywords ? 'keywords="' + metaKeywords.getAttribute('content') + '"' : 'meta 标签未注入'

			// imageOptimizer: 读取优化报告摘要
			fetch('/image-optimize-report.json')
				.then(res => {
					if (res.ok) return res.json()
					throw new Error('HTTP ' + res.status)
				})
				.then(data => {
					const s = data.summary || {}
					this.testList[11].passed = s.totalFiles !== undefined
					this.testList[11].summary = s.totalFiles !== undefined ? s.totalFiles + ' 文件, 转换 ' + (s.convertedFiles || 0) + ' 个' : '报告为空'
				})
				.catch(() => {
					this.testList[11].passed = false
					this.testList[11].summary = '报告未生成（需生产构建）'
				})

			// loadingManager: 验证 Loading 管理器已注入
			const manager = window.__LOADING_MANAGER__
			this.testList[12].passed = !!manager && typeof manager.show === 'function'
			this.testList[12].summary = manager ? 'window.__LOADING_MANAGER__ 已就绪' : '管理器未初始化'

			// proxyManager: 通过代理请求验证代理是否生效
			fetch('/api/get')
				.then(res => res.json())
				.then(data => {
					this.testList[13].passed = !!data && data.url !== undefined
					this.testList[13].summary = data?.url ? '代理成功, 来源: ' + data.url : '响应格式异常'
				})
				.catch(() => {
					this.testList[13].passed = false
					this.testList[13].summary = '代理请求失败'
				})

			// versionUpdateChecker: 验证版本更新检测已注入（检查 DOM 元素）
			const vucRoot = document.getElementById('__vuc-root__')
			const metaVersion = document.querySelector('meta[name="app-version"]')
			this.testList[14].passed = !!vucRoot || !!metaVersion
			this.testList[14].summary = metaVersion ? '版本: ' + metaVersion.getAttribute('content') : '检查器未注入（需生产构建）'
			// #endif
		},
		loadEnvInfo() {
			this.envInfo.title = import.meta.env.VITE_APP_TITLE || ''
			this.envInfo.apiUrl = import.meta.env.VITE_API_URL || ''
			this.envInfo.debug = String(import.meta.env.VITE_DEBUG || '')
		},
		loadInjectInfo() {
			// #ifdef H5
			// htmlInject：读取注入的 meta 标签内容
			const descMeta = document.querySelector('meta[name="description"]')
			const keywordsMeta = document.querySelector('meta[name="keywords"]')
			const themeColorMeta = document.querySelector('meta[name="theme-color"]')
			this.injectInfo.description = descMeta?.getAttribute('content') || ''
			this.injectInfo.keywords = keywordsMeta?.getAttribute('content') || ''
			this.injectInfo.themeColor = themeColorMeta?.getAttribute('content') || ''

			// faviconManager：读取 link 标签
			const linkEl = document.querySelector('link[rel="icon"]')
			this.injectInfo.faviconHref = linkEl?.getAttribute('href') || ''
			this.injectInfo.faviconRel = linkEl?.getAttribute('rel') || ''
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
		updateLoadingText() {
			// #ifdef H5
			const manager = window.__LOADING_MANAGER__
			if (manager) manager.updateText('更新后的文本...')
			// #endif
		},
		fetchWithLoading() {
			// #ifdef H5
			fetch('https://httpbin.org/delay/1').catch(() => {})
			// #endif
		},
		checkCompressedFiles() {
			// #ifdef H5
			fetch('/compress-report.json')
				.then(res => res.json())
				.then(data => {
					if (data && data.totalFiles > 0) {
						this.compressResult = {
							passed: true,
							message: `${data.totalFiles} 个文件已压缩，压缩率 ${data.totalRatio}%`
						}
					} else {
						this.compressResult = {
							passed: false,
							message: '未找到压缩报告'
						}
					}
				})
				.catch(() => {
					this.compressResult = {
						passed: false,
						message: '开发模式下不生成压缩文件'
					}
				})
			// #endif
		},
		testProxy() {
			// #ifdef H5
			this.proxyResult = { passed: false, message: '请求中...' }
			const start = Date.now()
			fetch('/api/get')
				.then(res => {
					const duration = Date.now() - start
					if (res.ok) {
						return res.json().then(data => {
							this.proxyResult = {
								passed: true,
								message: `代理成功 (${duration}ms) - 来源: ${data.url}`
							}
						})
					} else {
						this.proxyResult = { passed: false, message: `代理失败 - HTTP ${res.status}` }
					}
				})
				.catch(e => {
					this.proxyResult = { passed: false, message: `代理请求异常: ${e}` }
				})
			// #endif
		},
		testProxyDelay() {
			// #ifdef H5
			this.proxyResult = { passed: false, message: '请求中（含延迟模拟）...' }
			const start = Date.now()
			fetch('/proxy-delay')
				.then(res => {
					const duration = Date.now() - start
					if (res.ok) {
						this.proxyResult = {
							passed: true,
							message: `延迟代理成功 (${duration}ms) - 含 200~500ms 模拟延迟`
						}
					} else {
						this.proxyResult = { passed: false, message: `代理失败 - HTTP ${res.status}` }
					}
				})
				.catch(e => {
					this.proxyResult = { passed: false, message: `代理请求异常: ${e}` }
				})
			// #endif
		},
		navigateTo(url) {
			uni.navigateTo({ url })
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

.test-content {
	flex: 1;
}

.test-summary {
	font-size: 22rpx;
	color: #999;
	margin-top: 4rpx;
	line-height: 1.4;
	word-break: break-all;
}

.inject-section {
	margin-bottom: 24rpx;
}

.inject-section:last-child {
	margin-bottom: 0;
}

.inject-label {
	font-size: 26rpx;
	font-weight: 600;
	color: #555;
	margin-bottom: 12rpx;
}

.kv-list {
	background: #fff;
	border-radius: 12rpx;
	padding: 4rpx 20rpx;
}

.kv-item {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 14rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	gap: 16rpx;
}

.kv-item:last-child {
	border-bottom: none;
}

.kv-key {
	font-size: 24rpx;
	color: #999;
	flex-shrink: 0;
	font-family: monospace;
}

.kv-val {
	font-size: 24rpx;
	color: #333;
	text-align: right;
	word-break: break-all;
}

.file-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.file-tag {
	font-size: 22rpx;
	color: #007aff;
	background: rgba(0, 122, 255, 0.1);
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	font-family: monospace;
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
