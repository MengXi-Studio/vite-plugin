<template>
	<view class="container">
		<text class="page-title">构建报告</text>
		<text class="desc">由 compressAssets / bundleAnalyzer / imageOptimizer / assetManifest / generateVersion 生成</text>

		<!-- 产物压缩报告 -->
		<view class="card">
			<text class="card-title">compressAssets — 产物压缩报告</text>
			<text class="report-file">compress-report.json</text>
			<view v-if="reports.compress" class="stats-grid">
				<view class="stat-item">
					<text class="stat-label">压缩文件数</text>
					<text class="stat-value">{{ reports.compress.summary.totalFiles }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">原始体积</text>
					<text class="stat-value">{{ formatSize(reports.compress.summary.totalOriginalSize) }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">压缩后体积</text>
					<text class="stat-value">{{ formatSize(reports.compress.summary.totalCompressedSize) }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">压缩率</text>
					<text class="stat-value highlight">{{ reports.compress.summary.totalRatio.toFixed(1) }}%</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">gzip 文件</text>
					<text class="stat-value">{{ reports.compress.summary.gzipFiles }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">brotli 文件</text>
					<text class="stat-value">{{ reports.compress.summary.brotliFiles }}</text>
				</view>
			</view>
			<text v-else class="loading-hint">{{ loadingHints.compress }}</text>
		</view>

		<!-- 产物体积分析报告 -->
		<view class="card">
			<text class="card-title">bundleAnalyzer — 产物体积分析</text>
			<text class="report-file">bundle-analysis.json / bundle-analysis.html</text>
			<view v-if="reports.bundle" class="stats-grid">
				<view class="stat-item">
					<text class="stat-label">总体积</text>
					<text class="stat-value">{{ reports.bundle.summary.totalSizeFormatted }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">gzip 体积</text>
					<text class="stat-value">{{ reports.bundle.summary.totalGzipSizeFormatted }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">chunk 数量</text>
					<text class="stat-value">{{ reports.bundle.summary.chunkCount }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">告警数量</text>
					<text class="stat-value" :class="{ warning: reports.bundle.summary.warningCount > 0 }">{{ reports.bundle.summary.warningCount }}</text>
				</view>
			</view>
			<text v-else class="loading-hint">{{ loadingHints.bundle }}</text>
			<button v-if="reports.bundle" class="btn btn-outline" @click="openHtmlReport">查看 HTML 报告</button>
		</view>

		<!-- 图片优化报告 -->
		<view class="card">
			<text class="card-title">imageOptimizer — 图片优化报告</text>
			<text class="report-file">image-optimize-report.json</text>
			<view v-if="reports.image" class="stats-grid">
				<view class="stat-item">
					<text class="stat-label">优化文件数</text>
					<text class="stat-value">{{ reports.image.summary.totalFiles }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">跳过文件数</text>
					<text class="stat-value">{{ reports.image.summary.skippedFiles }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">原始体积</text>
					<text class="stat-value">{{ formatSize(reports.image.summary.totalOriginalSize) }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">优化后体积</text>
					<text class="stat-value">{{ formatSize(reports.image.summary.totalOptimizedSize) }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">压缩率</text>
					<text class="stat-value highlight">{{ reports.image.summary.totalRatio.toFixed(1) }}%</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">格式转换数</text>
					<text class="stat-value">{{ reports.image.summary.convertedFiles }}</text>
				</view>
			</view>
			<text v-else class="loading-hint">{{ loadingHints.image }}</text>
		</view>

		<!-- 资源清单 -->
		<view class="card">
			<text class="card-title">assetManifest — 资源清单</text>
			<text class="report-file">manifest.json</text>
			<view v-if="reports.manifest" class="stats-grid">
				<view class="stat-item">
					<text class="stat-label">清单版本</text>
					<text class="stat-value">{{ reports.manifest.version }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">资源数量</text>
					<text class="stat-value">{{ Object.keys(reports.manifest.assets || {}).length }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">公共路径</text>
					<text class="stat-value">{{ reports.manifest.publicPath }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">入口分组</text>
					<text class="stat-value">{{ reports.manifest.groups?.length || 0 }}</text>
				</view>
			</view>
			<text v-else class="loading-hint">{{ loadingHints.manifest }}</text>
		</view>

		<!-- 版本信息 -->
		<view class="card">
			<text class="card-title">generateVersion — 版本信息</text>
			<text class="report-file">version.json</text>
			<view v-if="reports.version" class="stats-grid">
				<view class="stat-item">
					<text class="stat-label">版本号</text>
					<text class="stat-value highlight">{{ reports.version.version }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">构建时间</text>
					<text class="stat-value">{{ reports.version.buildTime || '-' }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">格式</text>
					<text class="stat-value">{{ reports.version.format }}</text>
				</view>
				<view class="stat-item">
					<text class="stat-label">环境</text>
					<text class="stat-value">{{ reports.version.environment || '-' }}</text>
				</view>
			</view>
			<text v-else class="loading-hint">{{ loadingHints.version }}</text>
		</view>

		<button class="btn" @click="goBack">返回上一页</button>
	</view>
</template>

<script setup lang="ts">
interface CompressReport {
	summary: {
		totalFiles: number
		totalOriginalSize: number
		totalCompressedSize: number
		totalRatio: number
		gzipFiles: number
		brotliFiles: number
	}
}

interface BundleReport {
	summary: {
		totalSizeFormatted: string
		totalGzipSizeFormatted: string
		chunkCount: number
		warningCount: number
	}
}

interface ImageReport {
	summary: {
		totalFiles: number
		skippedFiles: number
		totalOriginalSize: number
		totalOptimizedSize: number
		totalRatio: number
		convertedFiles: number
	}
}

interface ManifestReport {
	version: string
	publicPath: string
	assets: Record<string, string>
	groups?: unknown[]
}

interface VersionReport {
	version: string
	buildTime?: string
	format: string
	environment?: string
}

const reports = reactive<{
	compress: CompressReport | null
	bundle: BundleReport | null
	image: ImageReport | null
	manifest: ManifestReport | null
	version: VersionReport | null
}>({
	compress: null,
	bundle: null,
	image: null,
	manifest: null,
	version: null
})

const loadingHints = reactive({
	compress: '加载中...',
	bundle: '加载中...',
	image: '加载中...',
	manifest: '加载中...',
	version: '加载中...'
})

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes}B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
	return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
}

async function fetchReport<T>(url: string, key: keyof typeof reports): Promise<T | null> {
	try {
		const res = await fetch(url)
		if (!res.ok) {
			loadingHints[key] = `请求失败 - HTTP ${res.status}`
			return null
		}
		return (await res.json()) as T
	} catch (e) {
		loadingHints[key] = `加载失败: ${e}`
		return null
	}
}

async function loadAllReports() {
	const [compress, bundle, image, manifest, version] = await Promise.all([
		fetchReport<CompressReport>('/compress-report.json', 'compress'),
		fetchReport<BundleReport>('/bundle-analysis.json', 'bundle'),
		fetchReport<ImageReport>('/image-optimize-report.json', 'image'),
		fetchReport<ManifestReport>('/manifest.json', 'manifest'),
		fetchReport<VersionReport>('/version.json', 'version')
	])

	reports.compress = compress
	reports.bundle = bundle
	reports.image = image
	reports.manifest = manifest
	reports.version = version
}

function openHtmlReport() {
	window.open('/bundle-analysis.html', '_blank')
}

function goBack() {
	uni.navigateBack({ delta: 1 })
}

onMounted(() => {
	loadAllReports()
})
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
	font-size: 24rpx;
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
	margin-bottom: 8rpx;
}

.report-file {
	font-size: 22rpx;
	color: #999;
	font-family: monospace;
	display: block;
	margin-bottom: 20rpx;
}

.stats-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.stat-item {
	flex: 1;
	min-width: 44%;
	background: #f9f9f9;
	border-radius: 12rpx;
	padding: 16rpx 20rpx;
}

.stat-label {
	font-size: 22rpx;
	color: #999;
	display: block;
	margin-bottom: 6rpx;
}

.stat-value {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
}

.stat-value.highlight {
	color: #42b883;
}

.stat-value.warning {
	color: #e6a23c;
}

.loading-hint {
	font-size: 26rpx;
	color: #ccc;
	display: block;
	padding: 20rpx 0;
}

.btn {
	background-color: #42b883;
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	padding: 20rpx 0;
	margin-top: 16rpx;
}

.btn::after {
	border: none;
}

.btn-outline {
	background-color: transparent;
	border: 2rpx solid #42b883;
	color: #42b883;
	margin-top: 16rpx;
}
</style>
